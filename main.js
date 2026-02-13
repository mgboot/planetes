// main.js — Game loop: ties together scene, bodies, spacecraft, HUD, camera
import * as THREE from 'three';
import { createScene, SCENE_SCALE } from './scene.js';
import { createBodies, updateBodies, auToScene } from './bodies.js';
import { createSpacecraft, updateSpacecraft } from './spacecraft.js';
import { updateHUD } from './hud.js';

// --- Init ---
const canvas = document.getElementById('game-canvas');
const { renderer, scene, camera, sunLight } = createScene(canvas);
const bodies = createBodies(scene);
const spacecraft = createSpacecraft(scene);

// Hide loading overlay
document.getElementById('loading').classList.add('hidden');

// --- Time ---
const TIME_WARP_VALUES = [1, 10, 100, 1000, 10000, 100000, 1e6, 1e7];
let timeWarpIndex = 0;
const timeWarpSlider = document.getElementById('time-warp-slider');
timeWarpSlider.addEventListener('input', () => {
    timeWarpIndex = parseInt(timeWarpSlider.value);
});

// Simulation date starts at real now
let simDate = new Date();

// --- Camera ---
let cameraMode = 0; // 0 = chase, 1 = free orbit
let cameraChaseOffset = new THREE.Vector3(0, 0.6, 1.6);
let orbitAngle = 0;
let orbitDistance = 30;
let orbitHeight = 15;

window.addEventListener('keydown', (e) => {
    if (e.code === 'KeyC') {
        cameraMode = (cameraMode + 1) % 2;
    }
});

canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    if (cameraMode === 0) {
        // Adjust chase distance
        cameraChaseOffset.z *= (1 + e.deltaY * 0.001);
        cameraChaseOffset.z = Math.max(0.5, Math.min(200, cameraChaseOffset.z));
        cameraChaseOffset.y = cameraChaseOffset.z * 0.4;
    } else {
        orbitDistance *= (1 + e.deltaY * 0.001);
        orbitDistance = Math.max(5, Math.min(5000, orbitDistance));
    }
}, { passive: false });

function updateCamera(dtReal) {
    const shipPos = spacecraft.mesh.position;

    if (cameraMode === 0) {
        // Chase cam: follow behind spacecraft
        const offset = cameraChaseOffset.clone().applyQuaternion(spacecraft.mesh.quaternion);
        const targetPos = shipPos.clone().add(offset);
        camera.position.lerp(targetPos, 1 - Math.exp(-5 * dtReal));
        camera.lookAt(shipPos);
    } else {
        // Free orbit cam around spacecraft
        orbitAngle += 0.1 * dtReal;
        const cx = shipPos.x + orbitDistance * Math.cos(orbitAngle);
        const cz = shipPos.z + orbitDistance * Math.sin(orbitAngle);
        const cy = shipPos.y + orbitHeight;
        camera.position.set(cx, cy, cz);
        camera.lookAt(shipPos);
    }
}

// --- Game Loop ---
let lastTime = performance.now();
let hudTimer = 0;

function animate(now) {
    requestAnimationFrame(animate);

    const dtReal = Math.min((now - lastTime) / 1000, 0.1); // real seconds, capped
    lastTime = now;

    // Simulation time step
    const timeWarp = TIME_WARP_VALUES[timeWarpIndex];
    const dtSimDays = (dtReal / 86400) * timeWarp; // real seconds → sim days

    // Advance simulation date
    simDate = new Date(simDate.getTime() + dtReal * 1000 * timeWarp);

    // Update planet positions
    updateBodies(bodies, simDate);

    // Update spacecraft physics
    updateSpacecraft(spacecraft, bodies, dtSimDays, dtReal);

    // Update camera
    updateCamera(dtReal);

    // Update HUD (throttle to ~10 fps)
    hudTimer += dtReal;
    if (hudTimer > 0.1) {
        updateHUD(spacecraft, bodies, timeWarpIndex);
        hudTimer = 0;
    }

    // Render
    renderer.render(scene, camera);
}

requestAnimationFrame(animate);
