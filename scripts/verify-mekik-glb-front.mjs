import assert from "node:assert/strict";
import fs from "node:fs";
import crypto from "node:crypto";
import zlib from "node:zlib";

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url));
const text = (path) => read(path).toString("utf8");
const hash = (value) => crypto.createHash("sha256").update(value).digest("hex");
const decodeBrotliBase64 = (path) => zlib.brotliDecompressSync(Buffer.from(text(path).trim(), "base64"));

const ayak = decodeBrotliBase64("assets/mekik-front-ayak.glb.br.b64");
const travers = decodeBrotliBase64("assets/mekik-front-travers.glb.br.b64");
assert.equal(ayak.length, 17_779_976);
assert.equal(travers.length, 1_091_012);
assert.equal(hash(ayak), "aa99563f97e978e17d5fc164cf5da5aa56378ee7592e00a193a248b41cff85eb");
assert.equal(hash(travers), "56fc0a842c22513f32232b6ba85d94f7bc6fb2ac1aafda553a81be8873c21deb");

const source = text("client/mekik-front-viewer.entry.js");
assert.match(source, /const AYAK_URL = "\/mekik-front-ayak\.glb"/);
assert.match(source, /const TRAVERS_URL = "\/mekik-front-travers\.glb"/);
assert.match(source, /const UPRIGHT_SELECTOR = "\.m2-front-upright"/);
assert.match(source, /const TRAVERS_SELECTOR = "\.m2-front-traverse-set"/);
assert.match(source, /normalizeTemplate\(ayak\.scene, true\)/);
assert.match(source, /normalizeTemplate\(travers\.scene, false\)/);
assert.match(source, /uprightRects\.forEach/);
assert.match(source, /traversRects\.forEach/);
assert.match(source, /dataset\.glbLayout = "uploaded-component-overlay-v97"/);
assert.match(source, /dataset\.glbReady = "true"/);

assert.equal(hash(read("dist/mekik-front-ayak.glb")), hash(ayak));
assert.equal(hash(read("dist/mekik-front-travers.glb")), hash(travers));
assert.ok(read("dist/mekik-front-viewer.js").length > 100_000);

const server = text("dist/server/index.js");
assert.match(server, /const MEKIK_FRONT_AYAK_BASE64/);
assert.match(server, /const MEKIK_FRONT_TRAVERS_BASE64/);
assert.match(server, /path === "\/mekik-front-ayak\.glb"/);
assert.match(server, /path === "\/mekik-front-travers\.glb"/);
const encodedPortal = server.match(/^const HTML_BASE64\s*=\s*"([^"]+)";/m)?.[1];
assert.ok(encodedPortal, "Build icindeki portal bulunamadi");
const portal = Buffer.from(encodedPortal, "base64").toString("utf8");
assert.match(portal, /mekik-front-viewer\.js/);
assert.doesNotMatch(portal, /data-rafex-mekik-glb-front="v94"/);

console.log("Mekik on gorunumu yuklenen ayak + travers GLB bilesenlerine bagli; eski v94 override yok.");
