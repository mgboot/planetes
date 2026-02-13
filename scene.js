// scene.js — Three.js scene, camera, lighting, starfield
import * as THREE from 'three';

// Scale factor: 1 scene unit = 1 AU (we'll place planets at their AU distances)
// But we'll use a compressed scale for rendering so everything is visible.

export const SCENE_SCALE = 50; // scene units per AU — inner system ~50 units, Pluto ~2000

export function createScene(canvas) {
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000005);

    // Camera
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.001, 100000);
    camera.position.set(0, 80, 120);
    camera.lookAt(0, 0, 0);

    // Very faint ambient — dark side of planets should be nearly black
    const ambient = new THREE.AmbientLight(0x111122, 0.08);
    scene.add(ambient);

    // Point light at the Sun — high intensity, no decay so all planets are well-lit
    // (real inverse-square would make outer planets invisible at this scale)
    const sunLight = new THREE.PointLight(0xfffaf0, 3.0, 0, 0);
    sunLight.position.set(0, 0, 0);
    scene.add(sunLight);

    // Starfield background
    createStarfield(scene);

    // Handle resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    return { renderer, scene, camera, sunLight };
}

function createStarfield(scene) {
    const starCount = 6000;
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
        // Random position on a large sphere
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = 10000 + Math.random() * 10000;

        positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = r * Math.cos(phi);

        // Slightly varied star colors (white to bluish to yellowish)
        const temp = 0.7 + Math.random() * 0.3;
        colors[i * 3] = temp;
        colors[i * 3 + 1] = temp;
        colors[i * 3 + 2] = 0.8 + Math.random() * 0.2;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
        size: 2,
        vertexColors: true,
        sizeAttenuation: false,
    });

    scene.add(new THREE.Points(geometry, material));
}
