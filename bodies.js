// bodies.js — Create and update Sun + planet meshes and orbit lines
import * as THREE from 'three';
import { SUN, PLANETS, AU_KM } from './planets.js';
import { computePosition, computeOrbitPath } from './orbits.js';
import { SCENE_SCALE } from './scene.js';

// Body display radii — exaggerated so they're visible, but proportional to each other.
// Real radii in AU are invisible at any sane scale, so we use a log-ish mapping:
//   displayRadius = max(minSize, scaleFactor * (radiusKm / sunRadiusKm) * sunDisplaySize)
// This keeps the Sun largest and all planets proportional.
const SUN_DISPLAY_RADIUS = 8.0;
const SUN_RADIUS_KM = 696340;
const MIN_PLANET_RADIUS = 0.3;

function displayRadius(radiusKm) {
    // Proportional to Sun, but with a sqrt compression so small planets stay visible
    const ratio = radiusKm / SUN_RADIUS_KM; // e.g. Jupiter ~0.10, Earth ~0.0092
    return Math.max(MIN_PLANET_RADIUS, SUN_DISPLAY_RADIUS * Math.sqrt(ratio));
}

function sunDisplayRadius() {
    return SUN_DISPLAY_RADIUS;
}

/**
 * Convert AU position to scene coordinates.
 */
export function auToScene(pos) {
    return new THREE.Vector3(pos.x * SCENE_SCALE, pos.z * SCENE_SCALE, -pos.y * SCENE_SCALE);
}

/**
 * Convert scene coordinates back to AU.
 */
export function sceneToAU(vec3) {
    return { x: vec3.x / SCENE_SCALE, y: -vec3.z / SCENE_SCALE, z: vec3.y / SCENE_SCALE };
}

export function createBodies(scene) {
    const bodies = [];

    // Sun
    const sunGeo = new THREE.SphereGeometry(sunDisplayRadius(), 32, 32);
    const sunMat = new THREE.MeshBasicMaterial({ color: SUN.color });
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);
    sunMesh.position.set(0, 0, 0);
    scene.add(sunMesh);

    // Sun glow
    const glowGeo = new THREE.SphereGeometry(sunDisplayRadius() * 1.4, 32, 32);
    const glowMat = new THREE.MeshBasicMaterial({
        color: SUN.emissive,
        transparent: true,
        opacity: 0.15,
    });
    const glowMesh = new THREE.Mesh(glowGeo, glowMat);
    scene.add(glowMesh);

    const sunBody = {
        data: SUN,
        mesh: sunMesh,
        positionAU: { x: 0, y: 0, z: 0 },
    };
    bodies.push(sunBody);

    // Planets
    for (const planet of PLANETS) {
        const radius = displayRadius(planet.radiusKm);
        const geo = new THREE.SphereGeometry(radius, 24, 24);
        const mat = new THREE.MeshStandardMaterial({
            color: planet.color,
            roughness: 0.85,
            metalness: 0.05,
            emissive: 0x000000,
        });
        const mesh = new THREE.Mesh(geo, mat);
        scene.add(mesh);

        // Label sprite
        const label = createLabel(planet.name);
        scene.add(label);

        // Orbit line
        const orbitPath = computeOrbitPath(planet.elements);
        const orbitPoints = orbitPath.map(p => auToScene(p));
        const orbitGeo = new THREE.BufferGeometry().setFromPoints(orbitPoints);
        const orbitMat = new THREE.LineBasicMaterial({
            color: planet.color,
            transparent: true,
            opacity: 0.25,
        });
        const orbitLine = new THREE.LineLoop(orbitGeo, orbitMat);
        scene.add(orbitLine);

        bodies.push({
            data: planet,
            mesh,
            label,
            orbitLine,
            positionAU: { x: 0, y: 0, z: 0 },
        });
    }

    return bodies;
}

function createLabel(text) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 64;
    ctx.fillStyle = 'transparent';
    ctx.fillRect(0, 0, 256, 64);
    ctx.font = 'bold 28px Courier New';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 128, 32);

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthTest: false,
    });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(4, 1, 1);
    return sprite;
}

/**
 * Update all body positions for the given simulation date.
 */
export function updateBodies(bodies, simDate) {
    for (let i = 1; i < bodies.length; i++) { // skip Sun (index 0)
        const body = bodies[i];
        const pos = computePosition(body.data.elements, simDate);
        body.positionAU = pos;
        const scenePos = auToScene(pos);
        body.mesh.position.copy(scenePos);
        if (body.label) {
            body.label.position.copy(scenePos);
            body.label.position.y += displayRadius(body.data.radiusKm) + 1.5;
        }
    }
}
