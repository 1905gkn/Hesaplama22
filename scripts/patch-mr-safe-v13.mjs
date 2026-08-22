import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const portalPath = path.join(root, "portal.html");
const viewerPath = path.join(root, "client", "mr-viewer.entry.js");

function replaceRequired(source, from, to, label) {
  if (source.includes(to)) return source;
  if (!source.includes(from)) throw new Error(`MR v13: ${label} bulunamadi`);
  return source.replace(from, to);
}

let viewer = fs.readFileSync(viewerPath, "utf8");
viewer = replaceRequired(
  viewer,
  "new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.92, metalness: 0 })",
  "new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.95, metalness: 0 })",
  "B2B zemin malzemesi"
);
viewer = replaceRequired(
  viewer,
  "    this.grid.position.y = 1;\n    this.scene.add(this.grid);",
  "    this.grid.position.y = 1;\n    this.grid.visible = false;\n    this.scene.add(this.grid);",
  "B2B gibi temiz zemin"
);
viewer = replaceRequired(
  viewer,
  "      const gridSize = Math.max(1800, this.size.x, this.size.z) * 2.2;\n      this.grid.scale.setScalar(gridSize / 12000);\n      this.ground.scale.set(gridSize, gridSize, 1);",
  "      const gridSize = Math.max(1800, this.size.x, this.size.z) * 2.2;\n      this.grid.scale.setScalar(gridSize / 12000);\n      this.ground.geometry.dispose();\n      this.ground.geometry = new THREE.PlaneGeometry(Math.max(this.size.x * 1.55, 7000), Math.max(this.size.z * 2.4, 7000));\n      this.ground.position.set(this.center.x, this.bounds.min.y - 12, this.center.z);",
  "B2B zemin boyutlandirma"
);
fs.writeFileSync(viewerPath, viewer);

let portal = fs.readFileSync(portalPath, "utf8");
portal = portal.replaceAll('/mr-viewer.js?v=mr-system-3', '/mr-viewer.js?v=mr-system-13');
portal = portal.replace(/<style\s+data-rafex-mr-safe-v13="1">[\s\S]*?<\/style>\s*/g, "");
const style = `<style data-rafex-mr-safe-v13="1">
/* MR: son travers alani okunakli kalsin; panel daraldiginda input ezilmesin. */
.mr-mode .mr-height-mode{grid-template-columns:96px minmax(0,1fr)!important;gap:7px!important;width:100%!important}
.mr-mode .mr-height-mode select,.mr-mode .mr-height-mode input{width:100%!important;min-width:0!important}
.mr-mode .mr-top-traverse-field{grid-column:1/-1!important;min-width:0!important}
.mr-mode .mr-top-traverse-field input:disabled{opacity:.62!important}
/* Olculer ve Mesafeler 3D'nin icinde kalir; B2B benzeri temiz, acilir panel. */
.mr-mode .mr-measure-overlay{top:12px!important;bottom:auto!important;left:12px!important;width:min(390px,calc(100% - 24px))!important;max-height:calc(100% - 24px)!important}
.mr-mode .mr-measure-overlay .mr-distance-panel{max-height:330px!important;overflow:auto!important}
.mr-mode .mr-measure-overlay input[type=number]{min-height:36px!important;padding:7px 9px!important;border:1px solid #d8e1db!important;border-radius:7px!important;background:#fff!important}
@media(max-width:700px){.mr-mode .mr-height-mode{grid-template-columns:88px minmax(0,1fr)!important}.mr-mode .mr-measure-overlay{top:8px!important;left:8px!important;width:calc(100% - 16px)!important}}
</style>`;
const headEnd = portal.indexOf("</head>");
if (headEnd < 0) throw new Error("MR v13: head kapanisi bulunamadi");
portal = portal.slice(0, headEnd) + style + "\n  " + portal.slice(headEnd);
fs.writeFileSync(portalPath, portal);

console.log("MR v13: safe UI, B2B-style ground and cache version applied.");
