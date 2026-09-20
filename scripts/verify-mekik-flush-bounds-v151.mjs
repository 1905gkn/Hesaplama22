import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const portal = fs.readFileSync("portal.html", "utf8");
const start = portal.indexOf("function m2RackVisualSideOverhang");
const end = portal.indexOf("\n      function m2RackLocalPoint", start);
assert.notEqual(start, -1, "Mekik dış sınırı fonksiyonu bulunmalı");
assert.notEqual(end, -1, "Mekik dış sınırı test dilimi bulunmalı");

const context = vm.createContext({ Math, String });
vm.runInContext(portal.slice(start, end), context);

const base = { x: 10, y: 20, w: 100, h: 50, angle: 0, depthMm: 2500, plan: { feet: [1200] } };
const explicit = { ...base, id: 1, rafexSystem: "mekik2", systemType: "fifo" };
const legacy = { ...base, id: 2, systemType: "filo" };
const drive = { ...base, id: 3, rafexSystem: "drive", systemType: "fifo" };
const other = { ...base, id: 4, rafexSystem: "konsol", systemType: "konsol" };

assert.equal(context.m2RackVisualSideOverhang(explicit), 0, "Etiketli Mekik görünmeyen yan tampon taşımamalı");
assert.equal(context.m2RackVisualSideOverhang(legacy), 0, "Eski Mekik kayıtları da görünmeyen yan tampon taşımamalı");
assert.equal(context.m2RackVisualSideOverhang(drive), 0, "Drive-In görünmeyen yan tampon taşımamalı");
assert.equal(context.m2RackBounds(explicit).right, explicit.x + explicit.w, "Mekik sağ dış sınırı çizilen çerçevede bitmeli");
assert.equal(context.m2RackBounds(legacy).left, legacy.x, "Eski Mekik sol dış sınırı çizilen çerçevede başlamalı");
assert.ok(context.m2RackVisualSideOverhang(other) > 0, "Diğer sistemlerin mevcut ayak taşması korunmalı");

const left = context.m2RackBounds(explicit);
const rightRack = { ...drive, id: 5, x: explicit.x + explicit.w };
const right = context.m2RackBounds(rightRack);
assert.equal(left.right, right.left, "Yan yana Mekik ve Drive-In blokları 0 mm'de tam temas etmeli");
console.log("Mekik ve Drive-In sıfır yan boşluk doğrulaması geçti.");
