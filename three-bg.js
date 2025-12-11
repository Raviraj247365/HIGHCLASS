// /js/three-bg.js
// Minimal Three.js particles background for HIGHCLASS
// Works as a fixed, low-intensity backdrop behind your Tailwind UI.

import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";

let scene, camera, renderer;
let particles;
let animationId;

// If browser tab is tiny (like very small mobile), skip to save perf
if (window.innerWidth > 480) {
  init();
  animate();
}

function init() {
  // Create scene
  scene = new THREE.Scene();

  // Camera – slightly pulled back
  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.set(0, 0, 8);

  // Renderer
  renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0); // transparent, so Tailwind bg shows

  // Attach as a fixed background layer
  renderer.domElement.style.position = "fixed";
  renderer.domElement.style.inset = "0";
  renderer.domElement.style.zIndex = "-1";
  renderer.domElement.style.pointerEvents = "none";

  document.body.appendChild(renderer.domElement);

  // Particles geometry
  const particleCount = 220;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);

  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    positions[i3 + 0] = (Math.random() - 0.5) * 16; // x
    positions[i3 + 1] = (Math.random() - 0.5) * 10; // y
    positions[i3 + 2] = (Math.random() - 0.5) * 12; // z depth

    // slightly varied size
    sizes[i] = 2 + Math.random() * 2;
  }

  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3)
  );

  // Particles material – soft red/orange glow
  const material = new THREE.PointsMaterial({
    color: new THREE.Color(0xff3b3b),
    size: 0.08,
    transparent: true,
    opacity: 0.5,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  particles = new THREE.Points(geometry, material);
  scene.add(particles);

  // Subtle ambient + directional light just in case future meshes are added
  const ambient = new THREE.AmbientLight(0xffffff, 0.2);
  scene.add(ambient);

  const dir = new THREE.DirectionalLight(0xff5533, 0.5);
  dir.position.set(3, 4, 5);
  scene.add(dir);

  // Handle resize
  window.addEventListener("resize", onWindowResize);
}

function onWindowResize() {
  if (!camera || !renderer) return;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// Tiny mouse-based parallax
let targetX = 0;
let targetY = 0;

window.addEventListener("mousemove", (event) => {
  const x = (event.clientX / window.innerWidth) * 2 - 1;
  const y = (event.clientY / window.innerHeight) * 2 - 1;
  targetX = x * 0.3;
  targetY = y * 0.2;
});

function animate() {
  animationId = requestAnimationFrame(animate);

  if (particles) {
    const time = performance.now() * 0.00015;

    // Slight rotation + gentle float
    particles.rotation.y = time * 0.6;
    particles.rotation.x = Math.sin(time * 0.4) * 0.2;

    // Parallax
    camera.position.x += (targetX - camera.position.x) * 0.03;
    camera.position.y += (-targetY - camera.position.y) * 0.03;
    camera.lookAt(0, 0, 0);
  }

  renderer.render(scene, camera);
}

// Optional: clean up if you ever navigate SPA-style and want to stop it
export function destroyThreeBg() {
  if (animationId) cancelAnimationFrame(animationId);
  window.removeEventListener("resize", onWindowResize);
  if (renderer && renderer.domElement && renderer.domElement.parentNode) {
    renderer.domElement.parentNode.removeChild(renderer.domElement);
  }
  scene = null;
  camera = null;
  renderer = null;
  particles = null;
}
