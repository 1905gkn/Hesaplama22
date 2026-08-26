import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const workerPath = path.join(process.cwd(), "dist/server/index.js");

// Final Mekik label guard.
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

// Konsol viewer: deliksiz IPE/INP görünümü, taban, çapraz düzeni, üst kol devamı ve temiz plan görünüşü.
await import(`./patch-konsol-viewer-foot-v4.mjs?build=${Date.now()}`);
await import(`./patch-konsol-viewer-fields-v5.mjs?build=${Date.now()}`);
await import(`./patch-konsol-viewer-brace-v7.mjs?build=${Date.now()}`);
await import(`./patch-konsol-viewer-top-arm-v8.mjs?build=${Date.now()}`);
await import(`./patch-konsol-viewer-top-v8.mjs?build=${Date.now()}`);
await import(`./patch-konsol-viewer-product-support-v12.mjs?build=${Date.now()}`);
await import(`./patch-konsol-viewer-loads-v13.mjs?build=${Date.now()}`);

// Konsol ana ekranı: exact SSI SCHÄFER KRS + kullanıcı akışı + FEM 10.2.09 ön kontrol katmanı.
await import(`./patch-konsol-cantilever-v2.mjs?build=${Date.now()}`);
await import(`./patch-konsol-request-v3.mjs?build=${Date.now()}`);
await import(`./patch-konsol-request-v3-printfix-v1.mjs?build=${Date.now()}`);
await import(`./patch-konsol-fem-10209-v10.mjs?build=${Date.now()}`);
await import(`./patch-free-konsol-plan-v38.mjs?build=${Date.now()}`);
await import(`./patch-free-nav-ortak-cizim-v39.mjs?build=${Date.now()}`);
await import(`./patch-konsol-input-redesign-v11.mjs?build=${Date.now()}`);
await import(`./patch-konsol-product-support-v12.mjs?build=${Date.now()}`);
await import(`./patch-konsol-load-switch-v13.mjs?build=${Date.now()}`);
await import(`./patch-konsol-ortak-cizim-ui-v43.mjs?build=${Date.now()}`);
await import(`./patch-konsol-bottom-workspace-v44.mjs?build=${Date.now()}`);
await import(`./patch-konsol-section-positioner-v45.mjs?build=${Date.now()}`);
await import(`./patch-konsol-common-drawing-v46.mjs?build=${Date.now()}`);
await import(`./patch-single-module-customize-v47.mjs?build=${Date.now()}`);
await import(`./patch-common-drawing-viewport-v49.mjs?build=${Date.now()}`);

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
    const stack = String(error && error.stack || error).split("\n").slice(0, 7).join("\n");
    errors.push(`inline #${index} ${attributes.trim()}:\n${stack}`);
  }
});

if (errors.length) {
  throw new Error(`Canli sayfaya gecersiz JavaScript yazilamaz:\n${errors.join("\n")}`);
}

if (!html.includes('data-rafex-free-info-modules="v27"')) throw new Error("Serbest bilgi modül v27 canlı HTML içinde bulunamadı");
if (!html.includes('data-rafex-drive-in-mekik="v1"')) throw new Error("Drive In Mekik klonu canlı HTML içinde bulunamadı");
if (!html.includes('/drive-in-viewer.js?v=drive-in-front-v2')) throw new Error("Drive In viewer yükleyicisi canlı HTML içinde bulunamadı");
if (!html.includes('data-rafex-konsol-v2="1"')) throw new Error("Konsol Kollu ekranı canlı HTML içinde bulunamadı");
if (!html.includes('data-rafex-krs-native="v9"')) throw new Error("Konsol native KRS v9 canlı HTML içinde bulunamadı");
if (!html.includes('/konsol-viewer.js?v=konsol-krs-v9')) throw new Error("Konsol KRS viewer yükleyicisi canlı HTML içinde bulunamadı");
if (!html.includes('data-rafex-konsol-request="v3"')) throw new Error("Konsol son kullanıcı istekleri canlı HTML içinde bulunamadı");
if (!html.includes('data-rafex-konsol-fem="v10"')) throw new Error("FEM 10.2.09 Konsol ön kontrol katmanı canlı HTML içinde bulunamadı");
if (!html.includes('data-rafex-konsol-free-plan="v38"')) throw new Error("Konsol Serbest Cizim temiz 2D plan katmanı canlı HTML içinde bulunamadı");
if (!html.includes('data-rafex-konsol-input-redesign="v11"')) throw new Error("Konsol Excel girdi ve FEM ön seçim v11 canlı HTML içinde bulunamadı");
if (!html.includes('data-rafex-konsol-product-support="v12"')) throw new Error("Konsol ürün taşıma ve yarım aralık taşma v12 canlı HTML içinde bulunamadı");
if (!html.includes('data-rafex-konsol-load-switch="v13"')) throw new Error("Konsol ürün görünümü seçimi v13 canlı HTML içinde bulunamadı");
if (!html.includes('data-rafex-konsol-ortak-ui="v43"')) throw new Error("Konsol Ortak Cizim uyumlu Serbest Yerlesim ve PDF arayuzu canlı HTML içinde bulunamadı");
if (!html.includes('data-rafex-konsol-bottom-workspace="v44"')) throw new Error("Konsol Serbest Cizim ve PDF alt ekran yerlesimi canlı HTML içinde bulunamadı");
if (!html.includes('data-rafex-konsol-section-positioner="v45"')) throw new Error("Konsol B2B uyumlu Kesit Yer Belirleme canlı HTML içinde bulunamadı");
if (!html.includes('data-rafex-konsol-common-drawing="v46"')) throw new Error("Konsol Ortak Çizim ekran düzeni canlı HTML içinde bulunamadı");
if (!html.includes('data-rafex-single-module-customize="v47"')) throw new Error("Birleşik blokta tek modül özelleştirme v47 canlı HTML içinde bulunamadı");
if (!html.includes('data-rafex-common-drawing-viewport="v49"')) throw new Error("Ortak Çizim akıllı görünüm v49 canlı HTML içinde bulunamadı");
for (const required of ["rafexCommonDrawingFocusSelectedV49","rafexCommonDrawingFitAllV49","Seçili Rafa Yaklaş","Tüm Projeyi Göster","rafex-type-contour"]) if (!html.includes(required)) throw new Error("Ortak Çizim görünüm özelliği bulunamadı: " + required);
for (const required of ["RAF / DUVAR UZAKLIKLARI","Kenar Uzunluk Bilgisi","Kayıtlı Konsol Raf Tipleri","Tüm Kenar Ölçülerini Gizle","rafexRenderKonsolCommonDrawingV46"]) if (!html.includes(required)) throw new Error(`Konsol Ortak Çizim alanı bulunamadı: ${required}`);
for (const required of ["KAYITLI KONSOL BLOKLARI","ALAN VE KESİT ÇİZGİSİ","Kenar çizgileri","Blok adları","rafexOpenKonsolSectionPositionerV45"]) if (!html.includes(required)) throw new Error(`Konsol Kesit Yer Belirleme özelliği bulunamadı: ${required}`);
if (!html.includes("shell.insertAdjacentElement('afterend',bottom)")) throw new Error("Konsol alt ekranları ana kabuğun dışına alınmadı");
if (!html.includes('rafexValidateKonsolSsiTableV14')) throw new Error("Konsol exact SSI tablo kapsam kilidi canlı HTML içinde bulunamadı");
if (!html.includes('data-rafex-free-nav-ortak="v39"')) throw new Error("Sol menude Ortak Cizim etiketi canlı HTML içinde bulunamadı");
if (!html.includes("const LABEL='Ortak Çizim'")) throw new Error("Ortak Cizim sol menu etiketi doğrulanamadı");
if (html.includes('data-rafex-konsol-fields="v6"')) throw new Error("Eski Konsol fields v6 runtime canlı HTML içinde kaldı");
if (html.includes('data-rafex-konsol-recommendations="v7"')) throw new Error("Eski formüllü Konsol v7 runtime canlı HTML içinde kaldı");
if (html.includes('data-rafex-konsol-krs-catalog="v8"')) throw new Error("Eski katmanlı KRS v8 runtime canlı HTML içinde kaldı");
if (html.includes('<script>setTimeout(function(){window.print()},400)')) throw new Error("Konsol v3 eski nested print script canlı HTML içinde kaldı");

for (const required of [
  "SSI SCHÄFER KRS KATALOG SEÇİMİ",
  "En üst kol kotu / KRS H (mm)",
  "Kat arası mesafe (mm)",
  "Kol derinliği / KRS (mm)",
  "Kattaki ağırlık (kg)",
  "RAL-5010", "RAL-1007", "RAL-2004",
  "UORDER=[180,200,220,240,270,300]",
  "AORDER=[80,100,120,140]",
  "6000:{600:{240:7590,270:11420}",
  "1250:{80:505,100:885,120:1420,140:2110}"
]) {
  if (!html.includes(required)) throw new Error(`Konsol native KRS alanı canlı HTML içinde bulunamadı: ${required}`);
}

for (const required of [
  "SSI SCHÄFER KRS TABLO SEÇİMİ",
  "TAHMİN / EKSTRAPOLASYON YOK",
  "TABLO KAPSAMI DIŞINDA",
  "Profil seçimi, Serbest Yerleşim ekleme, proje kaydı ve PDF çıktısı durduruldu",
  "#konsolFreeAdd,#konsolCreateOutput,#konsolProjectSave,#konsolPdf"
]) {
  if (!html.includes(required)) throw new Error(`Konsol SSI kapsam kilidi canlı HTML içinde bulunamadı: ${required}`);
}

for (const required of [
  "FEM 10.2.09 · KONSOL KOLLU ÖN KONTROL",
  "Ürün toplam ağırlığı Qu (kg)",
  "Ürünü taşıyan kol adedi na",
  "Qpv düşey yerleştirme",
  "Apv yukarı accidental = 5 kN",
  "3 kN çekme ve 5 kN kesme",
  "Kol sehim limiti",
  "Minimum yatay açıklık X4",
  "Global 2D/3D ikinci mertebe analiz"
]) {
  if (!html.includes(required)) throw new Error(`FEM 10.2.09 Konsol alanı canlı HTML içinde bulunamadı: ${required}`);
}

const konsolViewerPath = path.join(process.cwd(), "dist/konsol-viewer.js");
const konsolViewer = fs.readFileSync(konsolViewerPath, "utf8");
for (const required of ["ipe180", "ipe300", "npi80", "npi140", "RAFEX_KONSOL_TOP_V8", "productLength", "productHeight", "liftClearance", "loadKonsolArmModel", "loadType", "RAFEX_KONSOL_DIMENSIONS_V13"]) {
  if (!konsolViewer.includes(required)) throw new Error(`Konsol viewer bundle içinde bulunamadı: ${required}`);
}
if (konsolViewer.includes('konsol-glb-professional-v7')) throw new Error("Konsol eski delikli GLB katmanı viewer bundle içinde kalmış");
console.log(`Final response runtime syntax verified: ${scripts.length} script blocks.`);
