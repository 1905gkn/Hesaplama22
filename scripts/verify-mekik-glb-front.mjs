import assert from "node:assert/strict";
import fs from "node:fs";
import crypto from "node:crypto";

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url));
const text = (path) => read(path).toString("utf8");
const hash = (value) => crypto.createHash("sha256").update(value).digest("hex");

const mainParts = fs.readdirSync(new URL("../assets/mekik-son-hali.b64.parts/", import.meta.url))
  .sort()
  .map((name) => read(`assets/mekik-son-hali.b64.parts/${name}`).toString("ascii"));
const main = Buffer.from(mainParts.join(""), "base64");
assert.equal(main.length, 2_006_944);
assert.equal(hash(main), "fc784a115cf36a33c1837a59b2d0aa81c7875ae0abda12889cdbac23904ad781");

const source = text("client/mekik-front-viewer.entry.js");
assert.match(source, /DRACOLoader/);
assert.match(source, /const MAIN_URL = "\/mekik-son-hali\.glb"/);
assert.match(source, /HR 100 AYAK 5500/);
assert.match(source, /MEKIK TRAVERS MONTA L1500-28/);
assert.match(source, /MEKIK TRAVERS 40X80X2 PROFIL\|CC100 KONNEKTÖR/);
assert.match(source, /const UPRIGHT_SELECTOR = "\.m2-front-upright"/);
assert.match(source, /const TRAVERS_SELECTOR = "\.m2-front-traverse-set"/);
assert.match(source, /uprightRects\.forEach/);
assert.match(source, /traversRects\.forEach/);
assert.match(source, /dataset\.glbLayout = "uploaded-exact-node-map-v98"/);
assert.match(source, /dataset\.glbReady = "true"/);

assert.equal(hash(read("dist/mekik-son-hali.glb")), hash(main));
assert.ok(read("dist/mekik-front-viewer.js").length > 100_000);

const server = text("dist/server/index.js");
const encodedPortal = server.match(/^const HTML_BASE64\s*=\s*"([^"]+)";/m)?.[1];
assert.ok(encodedPortal, "Build icindeki portal bulunamadi");
const portal = Buffer.from(encodedPortal, "base64").toString("utf8");
assert.match(portal, /mekik-front-viewer\.js/);
assert.doesNotMatch(portal, /data-rafex-mekik-glb-front="v94"/);

console.log("Mekik on gorunumu yeni ayak/travers GLB node adlarina gore exact ana GLB'den kuruluyor; eski v94 override yok.");
