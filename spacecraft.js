// spacecraft.js — Player spacecraft with thrust, steering, and gravitational physics
import * as THREE from 'three';
import { SUN, PLANETS, GM_SUN_AU3_DAY2, AU_KM } from './planets.js';
import { SCENE_SCALE } from './scene.js';
import { auToScene, sceneToAU } from './bodies.js';

// Conversion constants
const AU_TO_KM = AU_KM;            // 1.496e8
const DAY_TO_S = 86400;
const KM_S_TO_AU_DAY = DAY_TO_S / AU_TO_KM; // convert km/s → AU/day

// Spacecraft parameters
const THRUST_ACCEL = 0.0005;  // AU/day² — roughly ~0.001 m/s² realistic ion drive feel
const ROTATION_SPEED = 2.0;   // radians per second

export function createSpacecraft(scene) {
    // Visual representation: a small cone (tiny relative to planets)
    const group = new THREE.Group();

    const bodyGeo = new THREE.ConeGeometry(0.06, 0.2, 8);
    bodyGeo.rotateX(Math.PI / 2);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x44ff44, emissive: 0x114411 });
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    group.add(bodyMesh);

    // Engine glow (visible when thrusting)
    const engineGeo = new THREE.SphereGeometry(0.04, 8, 8);
    const engineMat = new THREE.MeshBasicMaterial({ color: 0xff4400, transparent: true, opacity: 0 });
    const engineMesh = new THREE.Mesh(engineGeo, engineMat);
    engineMesh.position.z = 0.1;
    group.add(engineMesh);

    scene.add(group);

    // Start near Earth — about 1 AU from Sun, offset a bit
    const startAU = { x: 1.05, y: 0, z: 0.01 };
    const startScene = auToScene(startAU);
    group.position.copy(startScene);

    // Give initial orbital velocity (roughly Earth's orbital speed ~29.78 km/s ≈ 0.01720 AU/day)
    // Direction: perpendicular to the radial vector from Sun in the ecliptic plane
    const initialSpeedAU = 0.01720;

    const spacecraft = {
        mesh: group,
        engineMesh,
        positionAU: { ...startAU },
        velocityAU: { x: 0, y: initialSpeedAU, z: 0 }, // tangential to orbit
        mass: 1000, // kg (doesn't affect gravity accel, but nice to have)
        thrustAccel: THRUST_ACCEL,
        rotationSpeed: ROTATION_SPEED,
        thrusting: false,
        // Input state
        keys: {},
    };

    // Input handling
    window.addEventListener('keydown', (e) => {
        spacecraft.keys[e.code] = true;
    });
    window.addEventListener('keyup', (e) => {
        spacecraft.keys[e.code] = false;
    });

    return spacecraft;
}

/**
 * Compute gravitational acceleration on the spacecraft from all bodies.
 * Returns { ax, ay, az } in AU/day².
 */
export function computeGravity(spacecraft, bodies) {
    let ax = 0, ay = 0, az = 0;
    const pos = spacecraft.positionAU;

    for (const body of bodies) {
        const gm = body.data.GM_AU3_day2;
        const dx = body.positionAU.x - pos.x;
        const dy = body.positionAU.y - pos.y;
        const dz = body.positionAU.z - pos.z;
        const r2 = dx * dx + dy * dy + dz * dz;
        const r = Math.sqrt(r2);

        if (r < 1e-10) continue; // avoid division by zero

        // a = GM / r², direction toward body
        const aMag = gm / r2;
        ax += aMag * (dx / r);
        ay += aMag * (dy / r);
        az += aMag * (dz / r);
    }

    return { ax, ay, az };
}

/**
 * Update spacecraft physics for one frame.
 * dtReal: real seconds elapsed since last frame
 * dtSim: simulation days elapsed since last frame
 */
export function updateSpacecraft(spacecraft, bodies, dtSim, dtReal) {
    const keys = spacecraft.keys;
    const mesh = spacecraft.mesh;

    // --- Rotation (in real-time, not sim-time) ---
    const rotAmount = spacecraft.rotationSpeed * dtReal;

    if (keys['KeyA']) mesh.rotateY(rotAmount);        // yaw left
    if (keys['KeyD']) mesh.rotateY(-rotAmount);       // yaw right
    if (keys['Space']) mesh.rotateX(rotAmount);        // pitch up
    if (keys['ShiftLeft'] || keys['ShiftRight']) mesh.rotateX(-rotAmount); // pitch down
    if (keys['KeyQ']) mesh.rotateZ(rotAmount);         // roll left
    if (keys['KeyE']) mesh.rotateZ(-rotAmount);        // roll right

    // --- Thrust ---
    const thrustForward = keys['KeyW'];
    const thrustBackward = keys['KeyS'];
    spacecraft.thrusting = thrustForward || thrustBackward;

    // Engine glow
    spacecraft.engineMesh.material.opacity = spacecraft.thrusting ? 0.8 : 0;

    if (thrustForward || thrustBackward) {
        // Get forward direction in world space (local -Z is forward for the cone)
        const forward = new THREE.Vector3(0, 0, -1);
        forward.applyQuaternion(mesh.quaternion);

        const sign = thrustForward ? 1 : -1;
        const thrustAU = spacecraft.thrustAccel * dtSim * sign;

        // Convert forward direction to AU coordinate system
        // Scene: x→AU_x, y→AU_z, z→-AU_y
        // forward is a unit direction in scene space; remap axes to AU ecliptic
        spacecraft.velocityAU.x += forward.x * thrustAU;
        spacecraft.velocityAU.y += (-forward.z) * thrustAU;
        spacecraft.velocityAU.z += forward.y * thrustAU;
    }

    // --- Gravity ---
    const grav = computeGravity(spacecraft, bodies);
    spacecraft.velocityAU.x += grav.ax * dtSim;
    spacecraft.velocityAU.y += grav.ay * dtSim;
    spacecraft.velocityAU.z += grav.az * dtSim;

    // --- Position integration ---
    spacecraft.positionAU.x += spacecraft.velocityAU.x * dtSim;
    spacecraft.positionAU.y += spacecraft.velocityAU.y * dtSim;
    spacecraft.positionAU.z += spacecraft.velocityAU.z * dtSim;

    // Update mesh position
    const scenePos = auToScene(spacecraft.positionAU);
    mesh.position.copy(scenePos);
}

/**
 * Get spacecraft speed in km/s.
 */
export function getSpeedKmS(spacecraft) {
    const v = spacecraft.velocityAU;
    const speedAU = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
    // AU/day → km/s
    return speedAU * AU_TO_KM / DAY_TO_S;
}

/**
 * Get gravitational acceleration magnitude in m/s².
 */
export function getGravityMagnitude(spacecraft, bodies) {
    const g = computeGravity(spacecraft, bodies);
    const magAU = Math.sqrt(g.ax * g.ax + g.ay * g.ay + g.az * g.az);
    // AU/day² → m/s²
    return magAU * AU_TO_KM * 1000 / (DAY_TO_S * DAY_TO_S);
}

/**
 * Find nearest body to spacecraft. Returns { name, distanceAU, distanceKm }.
 */
export function findNearestBody(spacecraft, bodies) {
    let nearest = null;
    let minDist = Infinity;

    for (const body of bodies) {
        const dx = body.positionAU.x - spacecraft.positionAU.x;
        const dy = body.positionAU.y - spacecraft.positionAU.y;
        const dz = body.positionAU.z - spacecraft.positionAU.z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist < minDist) {
            minDist = dist;
            nearest = body;
        }
    }

    return {
        name: nearest?.data.name || '—',
        distanceAU: minDist,
        distanceKm: minDist * AU_TO_KM,
    };
}

/**
 * Get per-body gravity data, sorted by strongest pull.
 * Returns array of { name, distanceAU, distanceKm, gravityMs2 }.
 */
export function getPerBodyGravity(spacecraft, bodies) {
    const AU_TO_M = AU_TO_KM * 1000;
    const pos = spacecraft.positionAU;
    const results = [];

    for (const body of bodies) {
        const gm = body.data.GM_AU3_day2;
        const dx = body.positionAU.x - pos.x;
        const dy = body.positionAU.y - pos.y;
        const dz = body.positionAU.z - pos.z;
        const r2 = dx * dx + dy * dy + dz * dz;
        const r = Math.sqrt(r2);
        if (r < 1e-10) continue;

        // a = GM/r² in AU/day², convert to m/s²
        const accelAU = gm / r2;
        const accelMs2 = accelAU * AU_TO_M / (DAY_TO_S * DAY_TO_S);

        results.push({
            name: body.data.name,
            distanceAU: r,
            distanceKm: r * AU_TO_KM,
            gravityMs2: accelMs2,
        });
    }

    // Sort by gravity magnitude descending (strongest pull first)
    results.sort((a, b) => b.gravityMs2 - a.gravityMs2);
    return results;
}
