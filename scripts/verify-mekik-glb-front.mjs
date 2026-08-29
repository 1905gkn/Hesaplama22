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
const traverse = Buffer.from(read("assets/mekik-travers.glb.b64").toString("ascii"), "base64");
assert.equal(hash(main), "fc784a115cf36a33c1837a59b2d0aa81c7875ae0abda12889cdbac23904ad781");
assert.equal(hash(traverse), "9f19efef6cc435ee4ebf55df059b3ecbcdea4dc98b0a44ce470a3e91a1ef720d");

const source = text("client/mekik-front-viewer.entry.js");
assert.match(source, /const MAIN_URL = "\/mekik-son-hali\.glb"/);
assert.match(source, /const TRAVERSE_URL = "\/mekik-travers\.glb"/);
assert.match(source, /function isMekikScreen\(\)/);
assert.match(source, /m2ActiveModule === "mekik2"/);
assert.match(source, /for \(let bay = 0; bay < values\.bays; bay \+= 1\)/);
assert.match(source, /for \(let level = 0; level < values\.levels; level \+= 1\)/);
assert.match(source, /dataset\.glbReady = "true"/);

assert.equal(main.length, 2_006_944);
assert.equal(hash(read("dist/mekik-son-hali.glb")), hash(main));
assert.equal(hash(read("dist/mekik-travers.glb")), hash(traverse));
assert.ok(read("dist/mekik-front-viewer.js").length > 100_000);
const server = text("dist/server/index.js");
const encodedPortal = server.match(/^const HTML_BASE64\s*=\s*"([^"]+)";/m)?.[1];
assert.ok(encodedPortal, "Build içindeki portal bulunamadı");
assert.match(Buffer.from(encodedPortal, "base64").toString("utf8"), /mekik-front-viewer\.js/);

console.log("Mekik ön görünümü mekikson2.glb ana modeline bağlı ve build çıktısı doğrulandı");
