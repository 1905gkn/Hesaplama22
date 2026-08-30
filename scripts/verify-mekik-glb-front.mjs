import assert from "node:assert/strict";
import fs from "node:fs";

const readText = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

const nativePatch = readText("scripts/patch-mekik-native-front-details-v13.mjs");
const viewer = readText("client/mekik-front-viewer.entry.js");
const vercel = readText("vercel.json");
const pkg = readText("package.json");

assert.match(nativePatch, /m2MekikSetProjection\('front'/);
assert.match(nativePatch, /rafex-mekik-native-front-v13/);
assert.match(nativePatch, /ÖNDEN GÖRÜNÜŞ/);

assert.match(viewer, /native-front-restore-v100/);
assert.match(viewer, /const FRONT_STAGE_ID = "m2Front"/);
assert.match(viewer, /m2-front-upright/);
assert.match(viewer, /m2-front-traverse-set/);
assert.match(viewer, /m2-glb-front-shell/);
assert.doesNotMatch(viewer, /GLTFLoader|DRACOLoader|WebGLRenderer|mekik-son-hali\.glb/);

assert.match(vercel, /bash scripts\/vercel-git-build\.sh/);
assert.doesNotMatch(vercel, /patch-mekik-real-front-v95/);
assert.match(pkg, /patch-mekik-native-front-details-v13\.mjs/);
assert.doesNotMatch(pkg, /patch-mekik-real-front-v95\.mjs/);

const serverUrl = new URL("../dist/server/index.js", import.meta.url);
if (fs.existsSync(serverUrl)) {
  const server = fs.readFileSync(serverUrl, "utf8");
  const encodedPortal = server.match(/^const HTML_BASE64\s*=\s*"([^"]+)";/m)?.[1];
  assert.ok(encodedPortal, "Build icindeki portal bulunamadi");
  const portal = Buffer.from(encodedPortal, "base64").toString("utf8");
  assert.match(portal, /data-rafex-mekik-native-front-details="v13"/);
  assert.match(portal, /rafex-mekik-native-front-v13/);
  assert.doesNotMatch(portal, /data-rafex-mekik-real-glb-front="v95"/);
}

console.log("Mekik ana on gorunum native SVG olarak aktif; Three.js/GLB overlay kapali ve eski portal projection korunuyor.");
