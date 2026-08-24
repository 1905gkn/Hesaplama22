import fs from 'node:fs';

const file='client/konsol-viewer.entry.js';
let source=fs.readFileSync(file,'utf8');

function replaceRequired(from,to,label){
  if(!source.includes(from))throw new Error('Konsol GLB v7 hedefi bulunamadı: '+label);
  source=source.replace(from,to);
}

replaceRequired(
`import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';`,
`import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';`,
'GLB loader importları');

replaceRequired(
`const clamp = (value, min, max) => Math.max(min, Math.min(max, value));`,
`const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const KONSOL_GLB_ASSET_VERSION = 'konsol-glb-professional-v7';
let sharedKonsolDetailPromise = null;`,
'GLB sürüm sabiti');

replaceRequired(
`    this.destroyed = false;
    this.scene = new THREE.Scene();`,
`    this.destroyed = false;
    this.detailModels = null;
    this.scene = new THREE.Scene();`,
'detail model durumu');

replaceRequired(
`    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, preserveDrawingBuffer: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;`,
`    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.94;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.environmentTexture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();
    this.scene.environment = this.environmentTexture;`,
'profesyonel renderer');

replaceRequired(
`    const hemi = new THREE.HemisphereLight(0xffffff, 0xb8c2bc, 2.3);
    this.scene.add(hemi);
    const key = new THREE.DirectionalLight(0xffffff, 3.2);
    key.position.set(6500, 9000, 6500);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    this.scene.add(key);
    const fill = new THREE.DirectionalLight(0xfff4c2, 1.1);
    fill.position.set(-5000, 3000, -4500);
    this.scene.add(fill);`,
`    const hemi = new THREE.HemisphereLight(0xffffff, 0x68736d, 1.75);
    this.scene.add(hemi);
    const key = new THREE.DirectionalLight(0xffffff, 4.0);
    key.position.set(7200, 10500, 7600);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.near = 100;
    key.shadow.camera.far = 45000;
    key.shadow.bias = -0.00018;
    this.scene.add(key);
    const fill = new THREE.DirectionalLight(0xffead2, 1.25);
    fill.position.set(-6200, 4200, -5200);
    this.scene.add(fill);
    const rim = new THREE.DirectionalLight(0xd9ecff, 0.75);
    rim.position.set(1500, 6500, -7500);
    this.scene.add(rim);`,
'profesyonel ışık');

replaceRequired(
`    this.update(options, false);
    this.setView('perspective');`,
`    this.update(options, false);
    this.loadProfessionalModels();
    this.setView('perspective');`,
'GLB yükleme başlangıcı');

const methods=String.raw`
  async loadProfessionalModels() {
    try {
      if (!sharedKonsolDetailPromise) {
        const draco = new DRACOLoader();
        draco.setDecoderPath('/draco/');
        draco.setDecoderConfig({ type:'wasm' });
        const loader = new GLTFLoader();
        loader.setDRACOLoader(draco);
        loader.setMeshoptDecoder(MeshoptDecoder);
        const asset = (name) => '/' + name + '.glb?v=' + KONSOL_GLB_ASSET_VERSION;
        sharedKonsolDetailPromise = Promise.all([
          loader.loadAsync(asset('b2b-ayak')),
          loader.loadAsync(asset('b2b-travers')),
          loader.loadAsync(asset('b2b-sac-arabag')),
        ]).finally(() => draco.dispose());
      }
      const [upright, traverse, tie] = await sharedKonsolDetailPromise;
      if (this.destroyed) return;
      this.detailModels = {
        upright: upright.scene,
        traverse: traverse.scene,
        tie: tie.scene,
      };
      this.update(this.options, false);
      this.fitPerspective(this.sectionAngle);
      this.canvas.dispatchEvent(new CustomEvent('rafex-konsol-glb-ready', {
        detail: { sources:['AYAK2.glb','TRAVERS.glb','SAC ARA BAĞ.glb'] },
      }));
    } catch (error) {
      sharedKonsolDetailPromise = null;
      console.warn('Konsol detay GLB yükleme hatası, geometrik yedek kullanılıyor.', error);
    }
  }

  detailMaterial(base, color) {
    const material = base?.clone ? base.clone() : new THREE.MeshStandardMaterial();
    if (material.color && Number.isFinite(color)) material.color.setHex(color);
    material.metalness = Math.max(0.42, Number(material.metalness) || 0);
    material.roughness = Math.min(0.46, Math.max(0.26, Number(material.roughness) || 0.34));
    material.envMapIntensity = 0.72;
    return material;
  }

  paintDetail(root, material) {
    root.traverse((part) => {
      if (!part.isMesh) return;
      part.castShadow = true;
      part.receiveShadow = true;
      const color = material?.color?.getHex?.();
      const list = Array.isArray(part.material) ? part.material : [part.material];
      const next = list.map((item) => this.detailMaterial(item || material, color));
      part.material = Array.isArray(part.material) ? next : next[0];
    });
    return root;
  }

  dominantProfileGeometry(source) {
    if (!source) return null;
    source.updateMatrixWorld(true);
    let best = null;
    source.traverse((part) => {
      if (!part.isMesh || !part.geometry) return;
      const geometry = part.geometry.clone();
      geometry.applyMatrix4(part.matrixWorld);
      geometry.computeBoundingBox();
      const size = geometry.boundingBox.getSize(new THREE.Vector3());
      const dims = [size.x,size.y,size.z].sort((a,b)=>a-b);
      const longest = dims[2];
      const middle = Math.max(1,dims[1]);
      const slenderness = longest / middle;
      const score = longest * Math.max(1, slenderness);
      if (!best || score > best.score) best = { geometry, size, score };
    });
    return best;
  }

  makeGlbProfile(source, length, targetAxis, width, depth, material) {
    const best = this.dominantProfileGeometry(source);
    if (!best) return null;
    const geometry = best.geometry;
    geometry.computeBoundingBox();
    const center = geometry.boundingBox.getCenter(new THREE.Vector3());
    geometry.translate(-center.x,-center.y,-center.z);
    const size = best.size;
    const sourceAxis = size.x >= size.y && size.x >= size.z ? 'x' : (size.z >= size.y ? 'z' : 'y');
    if (sourceAxis === 'x') geometry.rotateZ(Math.PI / 2);
    else if (sourceAxis === 'z') geometry.rotateX(-Math.PI / 2);
    if (targetAxis === 'z') geometry.rotateX(Math.PI / 2);
    geometry.computeBoundingBox();
    const finalSize = geometry.boundingBox.getSize(new THREE.Vector3());
    const mesh = new THREE.Mesh(geometry, material.clone());
    if (targetAxis === 'z') mesh.scale.set(
      width / Math.max(1,finalSize.x),
      depth / Math.max(1,finalSize.y),
      length / Math.max(1,finalSize.z),
    );
    else mesh.scale.set(
      width / Math.max(1,finalSize.x),
      length / Math.max(1,finalSize.y),
      depth / Math.max(1,finalSize.z),
    );
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.name = targetAxis === 'z' ? 'Ayak Profili · AYAK2 GLB' : 'Dikey Ayak · AYAK2 GLB';
    return mesh;
  }

  makeGlbPart(source, targetSize, material, targetLongAxis='z') {
    if (!source) return null;
    const raw = this.paintDetail(source.clone(true), material);
    const oriented = new THREE.Group();
    oriented.add(raw);
    oriented.updateMatrixWorld(true);
    let bounds = new THREE.Box3().setFromObject(oriented);
    const sourceSize = bounds.getSize(new THREE.Vector3());
    const center = bounds.getCenter(new THREE.Vector3());
    raw.position.sub(center);
    const sourceAxis = sourceSize.x >= sourceSize.y && sourceSize.x >= sourceSize.z ? 'x' : (sourceSize.z >= sourceSize.y ? 'z' : 'y');
    if (targetLongAxis === 'z') {
      if (sourceAxis === 'x') oriented.rotation.y = -Math.PI / 2;
      else if (sourceAxis === 'y') oriented.rotation.x = Math.PI / 2;
    } else if (targetLongAxis === 'y') {
      if (sourceAxis === 'x') oriented.rotation.z = Math.PI / 2;
      else if (sourceAxis === 'z') oriented.rotation.x = -Math.PI / 2;
    }
    const outer = new THREE.Group();
    outer.add(oriented);
    outer.updateMatrixWorld(true);
    bounds = new THREE.Box3().setFromObject(outer);
    const recenter = bounds.getCenter(new THREE.Vector3());
    oriented.position.sub(recenter);
    outer.updateMatrixWorld(true);
    bounds = new THREE.Box3().setFromObject(outer);
    const size = bounds.getSize(new THREE.Vector3());
    outer.scale.set(
      targetSize.x / Math.max(1,size.x),
      targetSize.y / Math.max(1,size.y),
      targetSize.z / Math.max(1,size.z),
    );
    return outer;
  }

  makeDetailedLink(a,b,material) {
    const start = new THREE.Vector3(...a);
    const end = new THREE.Vector3(...b);
    const delta = end.clone().sub(start);
    const length = delta.length();
    const detailed = this.detailModels?.tie
      ? this.makeGlbPart(this.detailModels.tie,{x:48,y:length,z:28},material,'y')
      : null;
    if (!detailed) return cylinderBetween(a,b,24,material);
    detailed.position.copy(start).add(end).multiplyScalar(0.5);
    detailed.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());
    detailed.name = 'Çapraz · SAC ARA BAĞ GLB detayı';
    return detailed;
  }

  addBaseHardware(x,uprightWidth,uprightDepth,material) {
    const plate = new THREE.Mesh(new THREE.BoxGeometry(uprightWidth + 105, 12, uprightDepth + 135), material.clone());
    plate.position.set(x,6,0);
    plate.castShadow = true;
    plate.receiveShadow = true;
    plate.name = 'Ayak taban plakası';
    this.root.add(plate);
    const boltMat = new THREE.MeshStandardMaterial({ color:0x77817c, metalness:0.82, roughness:0.26 });
    const boltGeo = new THREE.CylinderGeometry(9,9,18,16);
    [[-1,-1],[-1,1],[1,-1],[1,1]].forEach(([sx,sz])=>{
      const bolt = new THREE.Mesh(boltGeo,boltMat);
      bolt.position.set(x + sx*(uprightWidth/2+28),15,sz*(uprightDepth/2+38));
      bolt.castShadow = true;
      this.root.add(bolt);
    });
  }

  addArmConnector(x,y,z,side,material) {
    const plate = new THREE.Mesh(new THREE.BoxGeometry(150,225,18),material.clone());
    plate.position.set(x,y,z*side);
    plate.castShadow = true;
    this.root.add(plate);
    const boltMat = new THREE.MeshStandardMaterial({ color:0x6f7873, metalness:0.78, roughness:0.28 });
    const boltGeo = new THREE.CylinderGeometry(7,7,24,14);
    [-55,55].forEach((dy)=>{
      [-38,38].forEach((dx)=>{
        const bolt = new THREE.Mesh(boltGeo,boltMat);
        bolt.rotation.x = Math.PI/2;
        bolt.position.set(x+dx,y+dy,(z+12)*side);
        bolt.castShadow = true;
        this.root.add(bolt);
      });
    });
  }

`;
replaceRequired('  normalize(next = {}) {',methods+'  normalize(next = {}) {','GLB yardımcı metodları');

replaceRequired(
`      const upright = new THREE.Mesh(new THREE.BoxGeometry(uprightWidth, o.height, uprightDepth), uprightMat);
      upright.position.set(x, o.height / 2, 0);
      upright.castShadow = true;
      upright.receiveShadow = true;
      this.root.add(upright);`,
`      let upright = this.detailModels?.upright
        ? this.makeGlbProfile(this.detailModels.upright,o.height,'y',uprightWidth,uprightDepth,uprightMat)
        : null;
      if (!upright) upright = new THREE.Mesh(new THREE.BoxGeometry(uprightWidth, o.height, uprightDepth), uprightMat);
      upright.position.set(x, o.height / 2, 0);
      upright.castShadow = true;
      upright.receiveShadow = true;
      this.root.add(upright);`,
'GLB dikey ayak');

replaceRequired(
`      const baseDepth = o.doubleSided ? (o.baseDepth * 2 + uprightDepth) : (o.baseDepth + uprightDepth);
      const base = new THREE.Mesh(new THREE.BoxGeometry(uprightWidth, uprightDepth, baseDepth), baseMat);
      base.position.set(x, uprightDepth / 2, o.doubleSided ? 0 : o.baseDepth / 2);
      base.castShadow = true;
      base.receiveShadow = true;
      this.root.add(base);`,
`      const baseDepth = o.doubleSided ? (o.baseDepth * 2 + uprightDepth) : (o.baseDepth + uprightDepth);
      let base = this.detailModels?.upright
        ? this.makeGlbProfile(this.detailModels.upright,baseDepth,'z',uprightWidth,uprightDepth,baseMat)
        : null;
      if (!base) base = new THREE.Mesh(new THREE.BoxGeometry(uprightWidth, uprightDepth, baseDepth), baseMat);
      base.position.set(x, uprightDepth / 2, o.doubleSided ? 0 : o.baseDepth / 2);
      base.castShadow = true;
      base.receiveShadow = true;
      this.root.add(base);
      this.addBaseHardware(x,uprightWidth,uprightDepth,baseMat);`,
'GLB ayak profili');

replaceRequired(
`        const frontArm = new THREE.Mesh(new THREE.BoxGeometry(95, 115, o.armLength), armMat);
        frontArm.position.set(x, y, o.armLength / 2 + uprightDepth / 2);
        frontArm.castShadow = true;
        frontArm.receiveShadow = true;
        this.root.add(frontArm);`,
`        let frontArm = this.detailModels?.traverse
          ? this.makeGlbPart(this.detailModels.traverse,{x:95,y:115,z:o.armLength},armMat,'z')
          : null;
        if (!frontArm) frontArm = new THREE.Mesh(new THREE.BoxGeometry(95, 115, o.armLength), armMat);
        frontArm.position.set(x, y, o.armLength / 2 + uprightDepth / 2);
        frontArm.castShadow = true;
        frontArm.receiveShadow = true;
        frontArm.name = 'Konsol kolu · TRAVERS GLB detayı';
        this.root.add(frontArm);
        this.addArmConnector(x,y,uprightDepth/2+10,1,armMat);`,
'GLB konsol kolu');

replaceRequired(
`          this.root.add(backArm);
          const backStop = frontStop.clone();`,
`          this.root.add(backArm);
          this.addArmConnector(x,y,uprightDepth/2+10,-1,armMat);
          const backStop = frontStop.clone();`,
'arka kol bağlantı detayı');

replaceRequired(
`        this.root.add(cylinderBetween([x1, yLow, z], [x2, yHigh, z], 24, braceMat));
        this.root.add(cylinderBetween([x1, yHigh, z], [x2, yLow, z], 24, braceMat));`,
`        this.root.add(this.makeDetailedLink([x1, yLow, z], [x2, yHigh, z], braceMat));
        this.root.add(this.makeDetailedLink([x1, yHigh, z], [x2, yLow, z], braceMat));`,
'GLB çaprazlar');

replaceRequired(
`    disposeObject(this.scene);
    this.renderer?.dispose();`,
`    disposeObject(this.scene);
    this.environmentTexture?.dispose?.();
    this.renderer?.dispose();`,
'ortam kaynağı temizliği');

for(const required of [
  "KONSOL_GLB_ASSET_VERSION = 'konsol-glb-professional-v7'",
  "loader.loadAsync(asset('b2b-ayak'))",
  "loader.loadAsync(asset('b2b-travers'))",
  "loader.loadAsync(asset('b2b-sac-arabag'))",
  'makeGlbProfile(',
  'makeGlbPart(',
  'makeDetailedLink(',
  "frontArm.name = 'Konsol kolu · TRAVERS GLB detayı'",
  'this.renderer.toneMapping = THREE.ACESFilmicToneMapping',
]){
  if(!source.includes(required))throw new Error('Konsol GLB v7 doğrulaması eksik: '+required);
}

fs.writeFileSync(file,source);
console.log('Konsol GLB v7: AYAK2, TRAVERS ve SAC ARA BAĞ detayları profesyonel PBR 3D görünüme bağlandı.');
