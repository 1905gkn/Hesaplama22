import fs from "node:fs";
import path from "node:path";

const workerPath = path.join(process.cwd(), "dist/server/index.js");
let worker = fs.readFileSync(workerPath, "utf8");
const match = worker.match(/(const\s+HTML_BASE64\s*=\s*)(["'])([A-Za-z0-9+/=]+)\2/);
if (!match) throw new Error("HTML_BASE64 build çıktısında bulunamadı.");
let html = Buffer.from(match[3], "base64").toString("utf8");

const replaceRequired = (from, to, label) => {
  if (html.includes(from)) html = html.replaceAll(from, to);
  else if (!html.includes(to)) throw new Error(`${label} bulunamadı.`);
};

replaceRequired(
  'add(labels.items.safetyPin,"",traverseQty*2);',
  'add(labels.items.safetyPin,"EPHR",traverseQty*2);',
  "Emniyet pimi kodu",
);

replaceRequired(
  'add(labels.items.straightBrace,`${fmt(straightTie.length)} × ${fmt(straightTie.width)} mm · galvaniz`,straightTie.count*tieStations);',
  'add(labels.items.straightBrace,`DAB09${String(Math.round(straightTie.length)).padStart(5,"0")} · ${fmt(straightTie.length)} × ${fmt(straightTie.width)} mm · galvaniz`,straightTie.count*tieStations);',
  "Düz arabağ BOM kodu",
);

replaceRequired(
  'add("UAKZ ayak koruma","Bu raf tipine bağlı",uakz);',
  'add("UAKZ ayak koruma","UAKZ",uakz);',
  "UAKZ BOM kodu",
);

replaceRequired(
  'const stationFactor=rack.sharedFootWith?1:2,qty=plan.count*stationFactor,key=`${fmt(plan.length)} × ${fmt(plan.width)} mm · galvaniz`;straightTies.set(key,(straightTies.get(key)||0)+qty);',
  'const stationFactor=rack.sharedFootWith?1:2,qty=plan.count*stationFactor,code=`DAB09${String(Math.round(plan.length)).padStart(5,"0")}`,key=`${code} · ${fmt(plan.length)} × ${fmt(plan.width)} mm · galvaniz`;straightTies.set(key,(straightTies.get(key)||0)+qty);',
  "Düz arabağ yerleşim kodu",
);

// Düz arabağ zaten raf tipi BOM hesabında bulunuyor. Koruma/yerleşim sayfasında tekrar
// ayrı satır üretme; böylece Toplu Ürün Dökümü içinde diğer raf ürünleriyle beraber toplanır.
replaceRequired(
  '.filter((row)=>!/^(Raf modülü|Ayak takımı|Travers(?: ·|$))/.test(row.name))',
  '.filter((row)=>!/^(Raf modülü|Ayak takımı|Travers(?: ·|$)|Düz arabağ(?: ·|$))/.test(row.name))',
  "Düz arabağ toplam BOM filtresi",
);

replaceRequired(
  'return{item:row.name,spec:"Serbest yerleşim",qty:Math.max(0,qty),unit:labels.unitEach};',
  'return{item:row.name,spec:row.name==="UAKZ ayak koruma"?"UAKZ":"Serbest yerleşim",qty:Math.max(0,qty),unit:labels.unitEach};',
  "Serbest UAKZ kodu",
);

const encoded = Buffer.from(html, "utf8").toString("base64");
worker = worker.slice(0, match.index) + match[1] + match[2] + encoded + match[2] + worker.slice(match.index + match[0].length);
fs.writeFileSync(workerPath, worker);

const check = Buffer.from(encoded, "base64").toString("utf8");
for (const token of ["EPHR", "UAKZ", "DAB09${String(Math.round(straightTie.length)).padStart(5,\"0\")}"]) {
  if (!check.includes(token)) throw new Error(`BOM doğrulaması başarısız: ${token}`);
}
