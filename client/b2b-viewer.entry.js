import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";

const SOURCE_CLEAR_LEFT = 126.70318603515625;
const SOURCE_SECTION_WIDTH = 2700;
const SOURCE_LEVEL_STEP = 1200;
const SOURCE_DEPTH = 1200;
const SOURCE_FRAME_DEPTH = 1242.1502685546875;
const SOURCE_PALLET_DEPTH_MIN = 41.540748596191406;
const SOURCE_TRAVERSE_BEAM_BOTTOM = 69.90718;
const SOURCE_TRAVERSE_BEAM_HEIGHT = 119.97255;
const SOURCE_TRAVERSE_X_OFFSET = 79.15549;
const SOURCE_TRAVERSE_FRONT_OFFSET = 81.59595;
const SOURCE_TRAVERSE_BACK_OFFSET = 1077.32687;
const SOURCE_LOAD_BOTTOM = 227.79448;
const ASSET_VERSION = "b2b-sac-arabag-glb-501";
const COLORS = {
  ral5010: 0x005078,
  ral5015: 0x287ab5,
  galvanized: 0xaeb8bd,
  pgv: 0xaeb8bd,
  ral1007: 0xe5bd00,
  ral1023: 0xf2c500,
  ral2004: 0xe25318,
};
let sharedModelsPromise = null;

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

class B2BViewer {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.options = options;
    this.models = null;
    this.frame = null;
    this.view = "perspective";
    this.destroyed = false;
    this.dimensionLabels = [];
    this.dimensionWorldPosition = new THREE.Vector3();
    this.onResize = this.onResize.bind(this);
    this.animate = this.animate.bind(this);

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.88;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf7eff1);
    this.scene.fog = new THREE.Fog(0xf7eff1, 32000, 70000);
    this.camera = new THREE.PerspectiveCamera(28, 1, 5, 200000);
    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.075;
    this.controls.enablePan = true;
    this.controls.screenSpacePanning = true;
    this.controls.minDistance = 500;
    this.controls.maxDistance = 100000;
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = 0.65;

    this.scene.add(new THREE.HemisphereLight(0xffffff, 0x6f5960, 2.1));
    const key = new THREE.DirectionalLight(0xffffff, 3.6);
    key.position.set(9000, 12000, 9500);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.near = 100;
    key.shadow.camera.far = 45000;
    key.shadow.bias = -0.00015;
    this.scene.add(key);
    const fill = new THREE.DirectionalLight(0xffe9d4, 1.35);
    fill.position.set(-8000, 5000, 6000);
    this.scene.add(fill);

    this.content = new THREE.Group();
    this.scene.add(this.content);
    this.ground = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.MeshStandardMaterial({ color: 0xe8dcdf, roughness: 0.95, metalness: 0 }),
    );
    this.ground.rotation.x = -Math.PI / 2;
    this.ground.receiveShadow = true;
    this.scene.add(this.ground);

    this.resizeObserver = new ResizeObserver(this.onResize);
    this.resizeObserver.observe(canvas.parentElement || canvas);
    this.onResize();
    this.load();
    requestAnimationFrame(this.animate);
  }

  emit(name, detail = {}) {
    this.canvas.dispatchEvent(new CustomEvent(name, { detail }));
  }

  async load() {
    this.emit("b2b-viewer-loading");
    try {
      if (!sharedModelsPromise) {
        const draco = new DRACOLoader();
        draco.setDecoderPath("/draco/");
        draco.setDecoderConfig({ type: "wasm" });
        const loader = new GLTFLoader();
        loader.setDRACOLoader(draco);
        loader.setMeshoptDecoder(MeshoptDecoder);
        const source = (name) => `/${name}.glb?v=${ASSET_VERSION}`;
        sharedModelsPromise = Promise.all([
          loader.loadAsync(source("b2b-takim")),
          loader.loadAsync(source("b2b-palet")),
          loader.loadAsync(source("b2b-travers")),
          loader.loadAsync(source("b2b-ayak")),
          loader.loadAsync(source("b2b-sac-arabag")),
        ]).finally(() => draco.dispose());
      }
      const [module, pallet, traverse, foot, straightTie] = await sharedModelsPromise;
      if (this.destroyed) return;
      this.models = {
        module: module.scene.clone(true),
        pallet: pallet.scene.clone(true),
        traverse: traverse.scene.clone(true),
        foot: foot.scene.clone(true),
        straightTie: straightTie.scene.clone(true),
      };
      this.stripBuiltInLoads(this.models.module);
      this.update(this.options, true);
      this.emit("b2b-viewer-ready", {
        sources: ["TAKIM (1)", "PALET(2)", "TRAVERS(2)", "AYAK2(1)", "SAC ARA BAĞ"],
      });
    } catch (error) {
      sharedModelsPromise = null;
      console.error("B2B GLB yükleme hatası", error);
      this.emit("b2b-viewer-error", { message: error?.message || "GLB yüklenemedi" });
    }
  }

  stripBuiltInLoads(root) {
    const removals = [];
    root.traverse((object) => {
      const name = (object.name || "").toLocaleUpperCase("tr-TR");
      if (name.includes("KUTU") || name.includes("PALET")) removals.push(object);
    });
    removals.sort((a, b) => this.depth(b) - this.depth(a)).forEach((object) => object.parent?.remove(object));
  }

  depth(object) {
    let value = 0;
    for (let node = object; node?.parent; node = node.parent) value += 1;
    return value;
  }

  normalizeOptions(next = {}) {
    const count = clamp(Math.round(Number(next.palletCount) || 3), 1, 4);
    const width = clamp(Number(next.palletWidth) || 800, 300, 3000);
    const depth = clamp(Number(next.palletDepth) || 1200, 300, 3000);
    const calculated = count * width + (count + 1) * 75;
    const sectionWidth = count === 4 && width === 800 ? 3600 : calculated;
    return {
      moduleCount: clamp(Math.round(Number(next.moduleCount) || 4), 1, 50),
      palletCount: count,
      palletWidth: width,
      palletDepth: depth,
      palletHeight: clamp(Number(next.palletHeight) || 800, 300, 1800),
      levels: clamp(Math.round(Number(next.levels) || 4), 1, 15),
      rowType: next.rowType === "double" ? "double" : "single",
      rowGap: clamp(Number(next.rowGap) || 200, 0, 3000),
      straightTieCount: clamp(Math.round(Number(next.straightTieCount) || 0), 0, 20),
      straightTiePositions: Array.isArray(next.straightTiePositions) ? next.straightTiePositions.map(Number).filter((value) => Number.isFinite(value) && value > 0) : [],
      palletTraverseGap: clamp(Number.isFinite(Number(next.palletTraverseGap)) ? Number(next.palletTraverseGap) : 200, 0, 2000),
      levelClearances: Array.isArray(next.levelClearances) ? next.levelClearances.map((value) => clamp(Number(value) || 0, 0, 5000)) : [],
      palletHeights: Array.isArray(next.palletHeights) ? next.palletHeights.map((value) => clamp(Number(value) || 800, 300, 3000)) : [],
      tunnelHeight: clamp(Number(next.tunnelHeight) || 0, 0, 30000),
      firstPalletPosition: next.firstPalletPosition === "traverse" ? "traverse" : "ground",
      firstFloorGap: clamp(Number.isFinite(Number(next.firstFloorGap)) ? Number(next.firstFloorGap) : 200, 0, 2000),
      lastPalletOverlap: clamp(Number(next.lastPalletOverlap) || (Number(next.palletHeight) || 800) / 2, 0, 3000),
      frontPalletGap: clamp(Number.isFinite(Number(next.frontPalletGap)) ? Number(next.frontPalletGap) : 50, 0, 1000),
      rearPalletGap: clamp(Number.isFinite(Number(next.rearPalletGap)) ? Number(next.rearPalletGap) : 50, 0, 1000),
      traverseHeight: clamp(Number(next.traverseHeight) || 140, 50, 500),
      footHeight: Number(next.footHeight) > 0 ? clamp(Number(next.footHeight), 500, 30000) : null,
      showPallets: next.showPallets !== false,
      dimensions: {
        levels: next.dimensions?.levels !== false,
        markers: next.dimensions?.markers !== false,
        eye: next.dimensions?.eye !== false,
        width: next.dimensions?.width !== false,
        depth: next.dimensions?.depth !== false,
      },
      sectionWidth,
      footColor: next.footColor || "ral5010",
      traverseColor: next.traverseColor || "ral1007",
    };
  }

  update(next = {}, initial = false) {
    this.options = this.normalizeOptions({ ...this.options, ...next });
    if (!this.models) return;
    while (this.content.children.length) this.content.remove(this.content.children[0]);
    this.dimensionLabels = [];

    const sectionScale = this.options.sectionWidth / SOURCE_SECTION_WIDTH;
    const sectionPitch = this.options.sectionWidth + 120;
    const frameDepth = Math.max(100, this.options.palletDepth - this.options.frontPalletGap - this.options.rearPalletGap);
    const depthScale = frameDepth / SOURCE_FRAME_DEPTH;
    const rowCount = this.options.rowType === "double" ? 2 : 1;
    const targetHeight = Math.max(500, this.uprightHeight());
    const verticalScale = targetHeight / 5006.16;
    for (let rowIndex = 0; rowIndex < rowCount; rowIndex += 1) {
      const row = new THREE.Group();
      row.name = `B2B ${rowIndex + 1}. sıra`;
      row.position.y = rowIndex * (frameDepth + this.options.rowGap);
      for (let moduleIndex = 0; moduleIndex < this.options.moduleCount; moduleIndex += 1) {
        const section = new THREE.Group();
        section.name = `B2B Bölüm ${moduleIndex + 1}`;
        const frame = this.models.module.clone(true);
        this.stripFrameSupports(frame);
        frame.scale.set(sectionScale, depthScale, verticalScale);
        this.applyRackMaterials(frame);
        section.add(frame);
        this.addTraverses(section, sectionScale, depthScale);
        if (this.options.showPallets) this.addLoads(section, sectionScale);
        section.position.x = moduleIndex * sectionPitch;
        row.add(section);
      }
      this.content.add(row);
    }
    if (rowCount === 2 && this.options.straightTieCount > 0) this.addStraightTies(sectionPitch, frameDepth, sectionScale, targetHeight);
    this.content.rotation.x = Math.PI / 2;
    this.addDimensions(sectionPitch);
    this.content.updateMatrixWorld(true);
    this.addGround();
    this.fitCamera(initial ? "perspective" : this.view);
  }

  applyRackMaterials(root) {
    const footColor = COLORS[this.options.footColor] ?? COLORS.ral5010;
    const traverseColor = COLORS[this.options.traverseColor] ?? COLORS.ral1007;
    root.traverse((object) => {
      if (!object.isMesh) return;
      object.castShadow = true;
      object.receiveShadow = true;
      const isArray = Array.isArray(object.material);
      const materials = isArray ? object.material : [object.material];
      const changed = materials.map((source) => {
        const material = source.clone();
        const name = `${object.name || ""} ${material.name || ""}`.toLocaleUpperCase("tr-TR");
        if (name.includes("DİAGONEL") || name.includes("DIAGONEL") || name.includes("ÇAĞRAZ")) material.color.setHex(COLORS.galvanized);
        else if (name.includes("TRAVERS") || name.includes("KONNEKTÖR")) material.color.setHex(traverseColor);
        else if (name.includes("AYAK") || name.includes("HRTD")) material.color.setHex(footColor);
        material.metalness = 0.28;
        material.roughness = 0.62;
        material.envMapIntensity = 0.32;
        return material;
      });
      object.material = isArray ? changed : changed[0];
    });
  }

  stripFrameSupports(root) {
    const removals = [];
    root.traverse((object) => {
      const name = (object.name || "").toLocaleUpperCase("tr-TR");
      if (name.includes("TRAVERS") || name.includes("KONNEKTÖR")) removals.push(object);
    });
    removals.sort((a, b) => this.depth(b) - this.depth(a)).forEach((object) => object.parent?.remove(object));
  }

  addStraightTies(sectionPitch, frameDepth, sectionScale, targetHeight) {
    const gap = Math.max(1, this.options.rowGap);
    const layer = new THREE.Group();
    layer.name = "B2B Düz Arabağlar · SAC ARA BAĞ GLB";

    const makeTie = () => {
      const source = this.models.straightTie.clone(true);
      const bounds = new THREE.Box3().setFromObject(source);
      const center = bounds.getCenter(new THREE.Vector3());
      const size = bounds.getSize(new THREE.Vector3());
      source.position.sub(center);
      source.rotation.z = Math.PI / 2;
      source.scale.set(1, (gap + 140) / Math.max(1, size.x), 1);
      source.traverse((part) => {
        if (!part.isMesh) return;
        part.castShadow = true;
        part.receiveShadow = true;
        const materials = Array.isArray(part.material) ? part.material : [part.material];
        const galvanized = materials.map((base) => {
          const material = base.clone();
          material.color.setHex(COLORS.galvanized);
          material.metalness = 0.52;
          material.roughness = 0.34;
          material.envMapIntensity = 0.42;
          return material;
        });
        part.material = Array.isArray(part.material) ? galvanized : galvanized[0];
      });
      const tie = new THREE.Group();
      tie.userData.source = "SAC ARA BAĞ.glb";
      tie.userData.sourceSize = { x:size.x, y:size.y, z:size.z };
      tie.add(source);
      return tie;
    };

    for (let moduleIndex = 0; moduleIndex < this.options.moduleCount; moduleIndex += 1) {
      const moduleX = moduleIndex * sectionPitch;
      const leftX = SOURCE_CLEAR_LEFT * sectionScale;
      const rightX = leftX + this.options.sectionWidth;
      for (let index = 0; index < this.options.straightTieCount; index += 1) {
        const height = this.options.straightTiePositions[index] || targetHeight * (index + 1) / (this.options.straightTieCount + 1);
        [leftX, rightX].forEach((x) => {
          const tie = makeTie();
          tie.name = `Düz Arabağ ${index + 1} · SAC ARA BAĞ`;
          tie.position.set(moduleX + x, frameDepth + gap / 2, -height);
          layer.add(tie);
        });
      }
    }
    this.content.add(layer);
  }

  addTraverses(section, sectionScale, depthScale) {
    const traverseCount = this.options.firstPalletPosition === "traverse" ? this.options.levels : Math.max(0, this.options.levels - 1);
    for (let level = 0; level < traverseCount; level += 1) {
      if (this.options.tunnelHeight > 0 && this.traverseTop(level) <= this.options.tunnelHeight) continue;
      const verticalScale = this.options.traverseHeight / SOURCE_TRAVERSE_BEAM_HEIGHT;
      [SOURCE_TRAVERSE_FRONT_OFFSET, SOURCE_TRAVERSE_BACK_OFFSET].forEach((depthOffset, side) => {
        const traverse = this.models.traverse.clone(true);
        traverse.name = `B2B Travers K${level + 1} ${side === 0 ? "Ön" : "Arka"}`;
        traverse.scale.set(sectionScale, depthScale, verticalScale);
        traverse.position.set(
          SOURCE_TRAVERSE_X_OFFSET * sectionScale,
          depthOffset * depthScale,
          SOURCE_TRAVERSE_BEAM_BOTTOM * verticalScale - this.traverseBottom(level),
        );
        this.applyRackMaterials(traverse);
        section.add(traverse);
      });
    }
  }

  addLoads(section, sectionScale) {
    const { palletCount, palletWidth, palletDepth, palletHeight, levels, sectionWidth } = this.options;
    const gap = (sectionWidth - palletCount * palletWidth) / (palletCount + 1);
    for (let level = 0; level < levels; level += 1) {
      const loadBottom = this.loadBottom(level);
      if (this.options.tunnelHeight > 0 && loadBottom < this.options.tunnelHeight) continue;
      for (let position = 0; position < palletCount; position += 1) {
        const x = SOURCE_CLEAR_LEFT * sectionScale + gap + position * (palletWidth + gap);
        const levelPalletHeight = this.palletHeightAt(level);
        const loadHeightScale = levelPalletHeight / 966.1927337646484;
        const loadDepthScale = palletDepth / SOURCE_DEPTH;
        const load = this.models.pallet.clone(true);
        load.name = `B2B Paletli Yük K${level + 1}-${position + 1}`;
        load.position.set(x - 30.177644729614258, -this.options.frontPalletGap - SOURCE_PALLET_DEPTH_MIN * loadDepthScale, SOURCE_LOAD_BOTTOM * loadHeightScale - loadBottom);
        load.scale.set(
          palletWidth / 800,
          loadDepthScale,
          loadHeightScale,
        );
        this.applyUserPalletMaterials(load);
        section.add(load);
      }
    }
  }

  applyUserPalletMaterials(root) {
    root.traverse((object) => {
      if (!object.isMesh) return;
      object.castShadow = true;
      object.receiveShadow = true;
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      const changed = materials.map((source) => {
        const material = source.clone();
        const name = (object.name || "").toLocaleUpperCase("tr-TR");
        material.color.setHex(name.includes("KUTU") ? 0xc58b47 : 0x9a6028);
        material.metalness = 0.04;
        material.roughness = 0.94;
        material.envMapIntensity = 0.12;
        return material;
      });
      object.material = Array.isArray(object.material) ? changed : changed[0];
    });
  }

  levelStep() {
    return this.options.palletHeight + this.options.palletTraverseGap + this.options.traverseHeight;
  }

  palletHeightAt(level) {
    return this.options.palletHeights[level] || this.options.palletHeight;
  }

  clearanceAt(level) {
    return this.options.levelClearances[level] ?? this.options.palletTraverseGap;
  }

  loadBottom(level) {
    if (this.options.firstPalletPosition === "ground" && level === 0) return 0;
    const supportingTraverse = this.options.firstPalletPosition === "traverse" ? level : level - 1;
    return this.traverseBottom(supportingTraverse) + this.options.traverseHeight;
  }

  traverseBottom(level) {
    if (this.options.firstPalletPosition === "traverse") {
      if (level === 0) return this.options.firstFloorGap;
      return this.loadBottom(level - 1) + this.palletHeightAt(level - 1) + this.clearanceAt(level - 1);
    }
    return this.loadBottom(level) + this.palletHeightAt(level) + this.clearanceAt(level);
  }

  addDimensions(sectionPitch) {
    const layer = new THREE.Group();
    layer.name = "B2B 3D Ölçüler";
    const dimensionGroup = (name) => { const group=new THREE.Group();group.name=name;layer.add(group);return group; };
    const levelsLayer=dimensionGroup("Kat ölçüleri"),markersLayer=dimensionGroup("Kot ölçüleri"),eyeLayer=dimensionGroup("Göz ölçüsü"),widthLayer=dimensionGroup("Genişlik ölçüsü"),depthLayer=dimensionGroup("Derinlik ölçüsü");
    const sectionScale = this.options.sectionWidth / SOURCE_SECTION_WIDTH;
    const frameWidth = 2942.650634765625 * sectionScale;
    const rackWidth = (this.options.moduleCount - 1) * sectionPitch + frameWidth;
    const rowCount = this.options.rowType === "double" ? 2 : 1;
    const frameDepth = Math.max(100, this.options.palletDepth - this.options.frontPalletGap - this.options.rearPalletGap);
    const rackDepth = rowCount * frameDepth + (rowCount - 1) * this.options.rowGap;
    const lineX = -Math.max(720, sectionPitch * 0.22), markerX = lineX - 1180, frontY = rackDepth + 340;
    const traverseCount = this.options.firstPalletPosition === "traverse" ? this.options.levels : Math.max(0, this.options.levels - 1);

    if (this.options.dimensions.levels && traverseCount > 0) {
      this.addVerticalDimension(levelsLayer, lineX, frontY, 0, this.traverseTop(0), `ZEMİN → T1 ÜSTÜ  ·  ${this.dimensionValue(this.traverseTop(0))}`, 0);
      for (let level = 1; level < traverseCount; level += 1) {
        this.addVerticalDimension(
          levelsLayer,
          lineX,
          frontY,
          this.traverseTop(level - 1),
          this.traverseBottom(level),
          `T${level} ÜSTÜ → T${level + 1} ALTI  ·  ${this.dimensionValue(this.traverseBottom(level) - this.traverseTop(level - 1))}`,
          0,
        );
      }
    }

    const topPallet = this.loadBottom(this.options.levels - 1) + this.palletHeightAt(this.options.levels - 1);
    if (this.options.dimensions.markers) {
      this.addLevelMarker(markersLayer, markerX, frontY, topPallet, `ÜST PALET KOTU  ·  ${this.dimensionValue(topPallet)}`, 0);
      this.addLevelMarker(markersLayer, markerX, frontY, this.uprightHeight(), `AYAK BOYU  ·  ${this.dimensionValue(this.uprightHeight())}`, 0);
    }

    const eyeStart = SOURCE_CLEAR_LEFT * sectionScale;
    if (this.options.dimensions.eye) this.addHorizontalDimension(eyeLayer, eyeStart, eyeStart + this.options.sectionWidth, rackDepth + 360, 0, `GÖZ  ·  ${this.dimensionValue(this.options.sectionWidth)}`);
    if (this.options.dimensions.width) this.addHorizontalDimension(widthLayer, 0, rackWidth, rackDepth + 650, 0, `GENİŞLİK  ·  ${this.dimensionValue(rackWidth)}`);
    if (this.options.dimensions.depth) this.addDepthDimension(depthLayer, rackWidth + 420, 0, rackDepth, 0, `DERİNLİK  ·  ${this.dimensionValue(rackDepth)}`);
    this.content.add(layer);
  }

  dimensionValue(value) {
    return `${Math.round(value).toLocaleString("tr-TR")} mm`;
  }

  traverseTop(level) {
    return this.traverseBottom(level) + this.options.traverseHeight;
  }

  dimensionMaterial() {
    return new THREE.LineBasicMaterial({ color:0x2467ff, depthTest:false, transparent:true, opacity:1 });
  }

  addLine(layer, points) {
    const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), this.dimensionMaterial());
    line.renderOrder = 100;
    layer.add(line);
  }

  addPoint(layer, position) {
    const marker = new THREE.Mesh(
      new THREE.SphereGeometry(36, 12, 8),
      new THREE.MeshBasicMaterial({ color:0x2467ff, depthTest:false }),
    );
    marker.position.copy(position);
    marker.renderOrder = 102;
    layer.add(marker);
  }

  addVerticalDimension(layer, x, y, from, to, label, witnessX) {
    const bottom = new THREE.Vector3(x, y, -from), top = new THREE.Vector3(x, y, -to);
    this.addLine(layer, [bottom, top]);
    this.addLine(layer, [bottom, new THREE.Vector3(witnessX, y, -from)]);
    this.addLine(layer, [top, new THREE.Vector3(witnessX, y, -to)]);
    const arrow = 157.5;
    this.addLine(layer, [new THREE.Vector3(x - arrow, y, -from - arrow), bottom, new THREE.Vector3(x + arrow, y, -from - arrow)]);
    this.addLine(layer, [new THREE.Vector3(x - arrow, y, -to + arrow), top, new THREE.Vector3(x + arrow, y, -to + arrow)]);
    this.addPoint(layer, bottom); this.addPoint(layer, top);
    this.addDimensionLabel(layer, x - 470, y, (from + to) / 2, label, 800);
  }

  addLevelMarker(layer, x, y, height, label, witnessX) {
    const point = new THREE.Vector3(witnessX, y, -height);
    this.addLine(layer, [new THREE.Vector3(x, y, -height), point]);
    this.addPoint(layer, point);
    this.addDimensionLabel(layer, x - 470, y, height, label, 800);
  }

  addHorizontalDimension(layer, from, to, y, height, label) {
    const left = new THREE.Vector3(from, y, -height), right = new THREE.Vector3(to, y, -height), arrow = 157.5;
    this.addLine(layer, [left, right]);
    this.addLine(layer, [left, new THREE.Vector3(from, 0, -height)]);
    this.addLine(layer, [right, new THREE.Vector3(to, 0, -height)]);
    this.addLine(layer, [new THREE.Vector3(from + arrow, y - arrow, -height), left, new THREE.Vector3(from + arrow, y + arrow, -height)]);
    this.addLine(layer, [new THREE.Vector3(to - arrow, y - arrow, -height), right, new THREE.Vector3(to - arrow, y + arrow, -height)]);
    this.addPoint(layer, left); this.addPoint(layer, right);
    this.addDimensionLabelAt(layer, (from + to) / 2, y - 180, -height, label, 680);
  }

  addDepthDimension(layer, x, from, to, height, label) {
    const front = new THREE.Vector3(x, from, -height), back = new THREE.Vector3(x, to, -height), arrow = 157.5;
    this.addLine(layer, [front, back]);
    this.addLine(layer, [new THREE.Vector3(0, from, -height), front]);
    this.addLine(layer, [new THREE.Vector3(0, to, -height), back]);
    this.addLine(layer, [new THREE.Vector3(x - arrow, from + arrow, -height), front, new THREE.Vector3(x + arrow, from + arrow, -height)]);
    this.addLine(layer, [new THREE.Vector3(x - arrow, to - arrow, -height), back, new THREE.Vector3(x + arrow, to - arrow, -height)]);
    this.addPoint(layer, front); this.addPoint(layer, back);
    this.addDimensionLabelAt(layer, x + 380, (from + to) / 2, -height, label, 680);
  }

  addDimensionLabel(layer, x, y, height, text, width = 800) {
    this.addDimensionLabelAt(layer, x, y, -height, text, width);
  }

  addDimensionLabelAt(layer, x, y, z, text, width = 800) {
    const canvas = document.createElement("canvas"), scale = 4, dimensionScale = 1.5, labelWidth = width * dimensionScale, labelHeight = 112 * dimensionScale;
    canvas.width = labelWidth * scale; canvas.height = labelHeight * scale;
    const context = canvas.getContext("2d");
    context.scale(scale, scale); context.font = "900 66px Arial";
    context.fillStyle = "rgba(57,169,232,.99)"; context.beginPath(); context.roundRect(0, 0, labelWidth, labelHeight, 24); context.fill();
    context.strokeStyle = "#0b6fa9"; context.lineWidth = 5; context.stroke();
    context.fillStyle = "#fff"; context.textAlign = "center"; context.textBaseline = "middle"; context.fillText(text, labelWidth / 2, labelHeight / 2);
    const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; texture.anisotropy = Math.min(16, this.renderer.capabilities.getMaxAnisotropy());
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map:texture, depthTest:false, transparent:true }));
    sprite.position.set(x, y, z); sprite.scale.set(width * 2.025, 247.5, 1); sprite.userData.dimensionLabel=true;sprite.userData.baseScale=sprite.scale.clone();sprite.renderOrder = 101;this.dimensionLabels.push(sprite);layer.add(sprite);
  }

  uprightHeight() {
    return this.options.footHeight || (this.loadBottom(this.options.levels - 1) + this.options.lastPalletOverlap);
  }

  contentBounds() {
    return new THREE.Box3().setFromObject(this.content);
  }

  addGround() {
    const bounds = this.contentBounds();
    const size = bounds.getSize(new THREE.Vector3());
    const center = bounds.getCenter(new THREE.Vector3());
    this.ground.geometry.dispose();
    this.ground.geometry = new THREE.PlaneGeometry(Math.max(size.x * 1.55, 7000), Math.max(size.z * 2.4, 7000));
    this.ground.position.set(center.x, bounds.min.y - 12, center.z);
  }

  fitCamera(view = "perspective") {
    this.view = view;
    const bounds = this.contentBounds();
    if (bounds.isEmpty()) return;
    const size = bounds.getSize(new THREE.Vector3());
    const center = bounds.getCenter(new THREE.Vector3());
    const vFov = THREE.MathUtils.degToRad(this.camera.fov);
    const fitHeight = size.y / (2 * Math.tan(vFov / 2));
    const fitWidth = size.x / (2 * Math.tan(vFov / 2) * Math.max(this.camera.aspect, 0.25));
    const distance = Math.max(fitHeight, fitWidth, size.z * 1.2) * 1.28;
    let direction;
    if (view === "front") direction = new THREE.Vector3(0, 0.04, 1);
    else if (view === "side") direction = new THREE.Vector3(1, 0.04, 0);
    else direction = new THREE.Vector3(0.86, 0.48, 1);
    direction.normalize();
    this.camera.position.copy(center).addScaledVector(direction, distance);
    this.camera.near = Math.max(5, distance / 500);
    this.camera.far = Math.max(200000, distance * 12);
    this.camera.updateProjectionMatrix();
    this.controls.target.copy(center);
    this.controls.update();
  }

  setView(view) {
    this.fitCamera(view);
  }

  setAutoRotate(enabled) {
    this.controls.autoRotate = Boolean(enabled);
    this.controls.update();
  }

  zoom(factor) {
    const direction = this.camera.position.clone().sub(this.controls.target);
    const distance = clamp(direction.length() * factor, this.controls.minDistance, this.controls.maxDistance);
    this.camera.position.copy(this.controls.target).add(direction.setLength(distance));
    this.controls.update();
  }

  setCameraAngles(azimuth = 35, elevation = 28) {
    const bounds = this.contentBounds();
    if (bounds.isEmpty()) return;
    const center = bounds.getCenter(new THREE.Vector3());
    const radius = Math.max(this.camera.position.distanceTo(this.controls.target), 1000);
    const theta = THREE.MathUtils.degToRad(Number(azimuth) || 0);
    const phi = THREE.MathUtils.degToRad(clamp(Number(elevation) || 0, -80, 80));
    this.camera.position.set(
      center.x + radius * Math.cos(phi) * Math.sin(theta),
      center.y + radius * Math.sin(phi),
      center.z + radius * Math.cos(phi) * Math.cos(theta),
    );
    this.controls.target.copy(center);
    this.controls.update();
  }

  onResize() {
    const rect = this.canvas.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width));
    const height = Math.max(1, Math.round(rect.height));
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  animate() {
    if (this.destroyed) return;
    this.controls.update();
    this.dimensionLabels.forEach((object)=>{object.getWorldPosition(this.dimensionWorldPosition);const ratio=clamp(this.camera.position.distanceTo(this.dimensionWorldPosition)/12000,1,2.65),base=object.userData.baseScale;object.scale.set(base.x*ratio,base.y*ratio,1);});
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.animate);
  }

  destroy() {
    this.destroyed = true;
    this.resizeObserver.disconnect();
    this.controls.dispose();
    this.renderer.dispose();
  }
}

let active = null;
window.RafexB2BViewer = {
  mount(canvas, options) {
    if (!(canvas instanceof HTMLCanvasElement)) throw new Error("B2B 3D tuvali bulunamadı.");
    active?.destroy();
    active = new B2BViewer(canvas, options);
    return active;
  },
  update(options) {
    active?.update(options);
  },
  setView(view) {
    active?.setView(view);
  },
  zoom(factor) {
    active?.zoom(factor);
  },
  setAutoRotate(enabled) {
    active?.setAutoRotate(enabled);
  },
  setCameraAngles(azimuth, elevation) {
    active?.setCameraAngles(azimuth, elevation);
  },
  destroy() {
    active?.destroy();
    active = null;
  },
};

window.dispatchEvent(new CustomEvent("rafex-b2b-viewer-ready"));
