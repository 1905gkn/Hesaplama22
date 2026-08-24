import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const workerPath = path.join(process.cwd(), "dist/server/index.js");

// Final Mekik label guard. JavaScript's \b does not treat the Turkish dotless
// "ı" as a word character, so "Ayak takımı" used to be renamed again on every
// MutationObserver pass: "Ayak takımı takımı takımı ...".
{
  let workerSource = fs.readFileSync(workerPath, "utf8");
  const htmlMatch = workerSource.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);
  if (!htmlMatch) throw new Error("HTML_BASE64 not found for Mekik label guard");
  let html = Buffer.from(htmlMatch[2], "base64").toString("utf8");
  const brokenGuard = "!/^Ayak (takımı|Profili)\\b/i.test(value)";
  const fixedGuard = "!/^Ayak (?:takımı|Profili)(?=\\s|$)/i.test(value)";
  if (html.includes(brokenGuard)) html = html.replace(brokenGuard, fixedGuard);
  if (!html.includes(fixedGuard)) throw new Error("Mekik Ayak takımı tekrar koruması uygulanamadı");
  const encoded = Buffer.from(html).toString("base64");
  workerSource = workerSource.slice(0, htmlMatch.index) + htmlMatch[0].replace(htmlMatch[2], encoded) + workerSource.slice(htmlMatch.index + htmlMatch[0].length);
  fs.writeFileSync(workerPath, workerSource);
  console.log("Mekik Ayak takımı tekrar döngüsü koruması aktif.");
}

await import(`./patch-free-info-system-modules-v27.mjs?build=${Date.now()}`);
await import(`./build-drive-in-assets-v1.mjs?build=${Date.now()}`);
await import(`./patch-drive-in-mekik-v1.mjs?build=${Date.now()}`);

// Konsol viewer kaynağında ayak profili dikey ayağın aynı renk devamıdır.
await import(`./patch-konsol-viewer-foot-v4.mjs?build=${Date.now()}`);
// Son kullanıcı alanları viewer bundle oluşturulmadan önce kaynakta uygulanır.
await import(`./patch-konsol-viewer-fields-v5.mjs?build=${Date.now()}`);
// Konsol Kollu ana 3D ekranı ve kullanıcının serbest yerleşim/PDF katmanı.
await import(`./patch-konsol-cantilever-v2.mjs?build=${Date.now()}`);
await import(`./patch-konsol-request-v3.mjs?build=${Date.now()}`);
// Kattaki ağırlık, derinlikler, RAL renkleri ve otomatik/manüel ayak yüksekliği.
await import(`./patch-konsol-fields-v6.mjs?build=${Date.now()}`);

const workerModule = await import(`${workerPath}?syntax-check=${Date.now()}`);
const response = await workerModule.default.fetch(
  new Request("https://runtime-verifier.invalid/"),
  {},
  {},
);
const html = await response.text();
const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];
const errors = [];

scripts.forEach((entry, index) => {
  const attributes = entry[1] || "";
  if (/\bsrc\s*=/.test(attributes)) return;
  try {
    new vm.Script(entry[2], { filename: `inline-runtime-${index}.js` });
  } catch (error) {
    errors.push(`inline #${index} ${attributes.trim()}: ${error.message}`);
  }
});

if (errors.length) {
  throw new Error(`Canli sayfaya gecersiz JavaScript yazilamaz:\n${errors.join("\n")}`);
}

if (!html.includes('data-rafex-free-info-modules="v27"')) throw new Error("Serbest bilgi modül v27 canlı HTML içinde bulunamadı");
if (!html.includes('data-rafex-drive-in-mekik="v1"')) throw new Error("Drive In Mekik klonu canlı HTML içinde bulunamadı");
if (!html.includes('/drive-in-viewer.js?v=drive-in-front-v2')) throw new Error("Drive In viewer yükleyicisi canlı HTML içinde bulunamadı");
if (!html.includes('data-rafex-konsol-v2="1"')) throw new Error("Konsol Kollu ekranı canlı HTML içinde bulunamadı");
if (!html.includes('/konsol-viewer.js?v=konsol-v2')) throw new Error("Konsol Kollu viewer yükleyicisi canlı HTML içinde bulunamadı");
if (!html.includes('data-rafex-konsol-request="v3"')) throw new Error("Konsol son kullanıcı istekleri canlı HTML içinde bulunamadı");
if (!html.includes('data-rafex-konsol-fields="v6"')) throw new Error("Konsol eksik kullanıcı alanları canlı HTML içinde bulunamadı");
for (const required of ["Kattaki ağırlık", "Kat derinliği (mm)", "Taban Kat derinliği (mm)", "RAL-5010", "RAL-1007", "RAL-2004", "konsolHeightMode"]) {
  if (!html.includes(required)) throw new Error(`Konsol v6 alanı canlı HTML içinde bulunamadı: ${required}`);
}
console.log(`Final response runtime syntax verified: ${scripts.length} script blocks.`);
