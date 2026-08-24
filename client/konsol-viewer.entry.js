import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

function disposeObject(root) {
  root.traverse((node) => {
    if (node.geometry) node.geometry.dispose?.();
    const materials = Array.isArray(node.material) ? node.material : node.material ? [node.material] : [];
    materials.forEach((material) => material?.dispose?.());
  });
}

function cylinderBetween(a, b, radius, material) {
  const start = new THREE.Vector3(...a);
  const end = new THREE.Vector3(...b);
  const delta = end.clone().sub(start);
  const length = delta.length();
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, length, 10), material);
  mesh.position.copy(start).add(end).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta.normalize());
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

class KonsolViewer {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.options = {};
    this.sectionAngle = 35;
    this.destroyed = false;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf7faf8);
    this.camera = new THREE.PerspectiveCamera(36, 1, 1, 200000);
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, preserveDrawingBuffer: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.075;
    this.controls.screenSpacePanning = true;
    this.controls.minDistance = 300;
    this.controls.maxDistance = 80000;
    this.root = new THREE.Group();
    this.scene.add(this.root);

    const hemi = new THREE.HemisphereLight(0xffffff, 0xb8c2bc, 2.3);
    this.scene.add(hemi);
    const key = new THREE.DirectionalLight(0xffffff, 3.2);
    key.position.set(6500, 9000, 6500);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    this.scene.add(key);
    const fill = new THREE.DirectionalLight(0xfff4c2, 1.1);
    fill.position.set(-5000, 3000, -4500);
    this.scene.add(fill);

    this.grid = new THREE.GridHelper(30000, 60, 0xc7d1cb, 0xe3e9e5);
    this.grid.position.y = -2;
    this.scene.add(this.grid);

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(canvas);
    this.update(options, false);
    this.setView('perspective');
    this.resize();
    this.loop();
  }

  normalize(next = {}) {
    return {
      uprightCount: clamp(Math.round(Number(next.uprightCount) || 5), 2, 30),
      spacing: clamp(Number(next.spacing) || 1500, 300, 5000),
      height: clamp(Number(next.height) || 4500, 1000, 15000),
      armLength: clamp(Number(next.armLength) || 1200, 250, 3000),
      levels: clamp(Math.round(Number(next.levels) || 4), 1, 12),
      doubleSided: Boolean(next.doubleSided),
      setPlan: Array.isArray(next.setPlan) ? next.setPlan.map((n) => clamp(Math.round(Number(n) || 2), 2, 3)) : [],
    };
  }

  update(next = {}, refit = true) {
    this.options = this.normalize({ ...this.options, ...next });
    if (this.root) {
      disposeObject(this.root);
      this.scene.remove(this.root);
    }
    this.root = new THREE.Group();
    this.scene.add(this.root);
    this.buildRack();
    if (refit) this.fitPerspective();
  }

  buildRack() {
    const o = this.options;
    const width = (o.uprightCount - 1) * o.spacing;
    const startX = -width / 2;
    const uprightMat = new THREE.MeshStandardMaterial({ color: 0xa7b0ab, metalness: 0.72, roughness: 0.36 });
    const armMat = new THREE.MeshStandardMaterial({ color: 0xe2b423, metalness: 0.36, roughness: 0.48 });
    const braceMat = new THREE.MeshStandardMaterial({ color: 0x355a48, metalness: 0.55, roughness: 0.42 });
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x385b49, metalness: 0.65, roughness: 0.4 });
    const endMat = new THREE.MeshStandardMaterial({ color: 0xd2a600, metalness: 0.35, roughness: 0.48 });

    const uprightDepth = 105;
    const uprightWidth = 130;
    for (let i = 0; i < o.uprightCount; i += 1) {
      const x = startX + i * o.spacing;
      const upright = new THREE.Mesh(new THREE.BoxGeometry(uprightWidth, o.height, uprightDepth), uprightMat);
      upright.position.set(x, o.height / 2, 0);
      upright.castShadow = true;
      upright.receiveShadow = true;
      this.root.add(upright);

      const base = new THREE.Mesh(new THREE.BoxGeometry(330, 28, 430), baseMat);
      base.position.set(x, 14, 0);
      base.castShadow = true;
      base.receiveShadow = true;
      this.root.add(base);

      for (let level = 1; level <= o.levels; level += 1) {
        const y = (o.height / (o.levels + 1)) * level;
        const frontArm = new THREE.Mesh(new THREE.BoxGeometry(95, 115, o.armLength), armMat);
        frontArm.position.set(x, y, o.armLength / 2 + uprightDepth / 2);
        frontArm.castShadow = true;
        frontArm.receiveShadow = true;
        this.root.add(frontArm);
        const frontStop = new THREE.Mesh(new THREE.BoxGeometry(115, 220, 32), endMat);
        frontStop.position.set(x, y + 72, o.armLength + uprightDepth / 2);
        frontStop.castShadow = true;
        this.root.add(frontStop);

        if (o.doubleSided) {
          const backArm = frontArm.clone();
          backArm.position.z = -(o.armLength / 2 + uprightDepth / 2);
          this.root.add(backArm);
          const backStop = frontStop.clone();
          backStop.position.z = -(o.armLength + uprightDepth / 2);
          this.root.add(backStop);
        }
      }
    }

    let cursor = 0;
    const plan = o.setPlan.length ? o.setPlan : [Math.min(3, o.uprightCount)];
    plan.forEach((setSize, setIndex) => {
      const actual = Math.min(setSize, o.uprightCount - cursor);
      if (actual < 2) return;
      const z = -uprightDepth / 2 - 42 - setIndex * 4;
      const yLow = Math.max(260, o.height * 0.08);
      const yHigh = Math.max(yLow + 200, o.height * 0.9);
      for (let local = 0; local < actual - 1; local += 1) {
        const x1 = startX + (cursor + local) * o.spacing;
        const x2 = startX + (cursor + local + 1) * o.spacing;
        this.root.add(cylinderBetween([x1, yLow, z], [x2, yHigh, z], 24, braceMat));
        this.root.add(cylinderBetween([x1, yHigh, z], [x2, yLow, z], 24, braceMat));
      }
      if (actual === 3) {
        const x1 = startX + cursor * o.spacing;
        const x3 = startX + (cursor + 2) * o.spacing;
        const top = new THREE.Mesh(new THREE.BoxGeometry(x3 - x1, 44, 44), braceMat);
        top.position.set((x1 + x3) / 2, yHigh, z);
        top.castShadow = true;
        this.root.add(top);
      }
      cursor += actual;
    });

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(Math.max(8000, width + 5000), Math.max(7000, o.armLength * 2 + 4000)),
      new THREE.MeshStandardMaterial({ color: 0xf3f6f4, roughness: 0.95, metalness: 0.02 }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -15;
    floor.receiveShadow = true;
    this.root.add(floor);
  }

  contentBounds() {
    return new THREE.Box3().setFromObject(this.root);
  }

  fitPerspective(angle = this.sectionAngle) {
    const bounds = this.contentBounds();
    const size = bounds.getSize(new THREE.Vector3());
    const center = bounds.getCenter(new THREE.Vector3());
    const radius = Math.max(size.x, size.y, size.z, 1000) * 1.35;
    const rad = THREE.MathUtils.degToRad(angle);
    this.controls.target.copy(center);
    this.camera.position.set(center.x + Math.sin(rad) * radius, center.y + size.y * 0.22 + radius * 0.22, center.z + Math.cos(rad) * radius);
    this.camera.near = Math.max(1, radius / 1000);
    this.camera.far = Math.max(200000, radius * 20);
    this.camera.updateProjectionMatrix();
    this.controls.update();
  }

  setSectionAngle(degrees) {
    this.sectionAngle = ((Number(degrees) || 0) % 360 + 360) % 360;
    this.fitPerspective(this.sectionAngle);
  }

  setView(view) {
    const bounds = this.contentBounds();
    const size = bounds.getSize(new THREE.Vector3());
    const center = bounds.getCenter(new THREE.Vector3());
    const radius = Math.max(size.x, size.y, size.z, 1000) * 1.55;
    this.controls.target.copy(center);
    if (view === 'front') this.camera.position.set(center.x, center.y + size.y * 0.03, center.z + radius);
    else if (view === 'side') this.camera.position.set(center.x + radius, center.y + size.y * 0.03, center.z);
    else if (view === 'top') this.camera.position.set(center.x, center.y + radius, center.z + 1);
    else this.camera.position.set(center.x + radius * 0.72, center.y + radius * 0.42, center.z + radius * 0.72);
    this.camera.near = Math.max(1, radius / 1000);
    this.camera.far = Math.max(200000, radius * 20);
    this.camera.updateProjectionMatrix();
    this.controls.update();
  }

  resize() {
    if (this.destroyed) return;
    const rect = this.canvas.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width));
    const height = Math.max(1, Math.round(rect.height));
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  loop() {
    if (this.destroyed) return;
    if (!this.canvas.isConnected) {
      this.destroy();
      return;
    }
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
    this.raf = requestAnimationFrame(() => this.loop());
  }

  destroy() {
    if (this.destroyed) return;
    this.destroyed = true;
    cancelAnimationFrame(this.raf);
    this.resizeObserver?.disconnect();
    this.controls?.dispose();
    disposeObject(this.scene);
    this.renderer?.dispose();
  }
}

window.RafexKonsolViewer = {
  mount(canvas, options) {
    return new KonsolViewer(canvas, options);
  },
};
window.dispatchEvent(new CustomEvent('rafex-konsol-viewer-ready'));
