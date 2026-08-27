import fs from "node:fs";

const file = "dist/server/index.js";
let source = fs.readFileSync(file, "utf8");
const match = source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);
if (!match) throw new Error("HTML_BASE64 not found for B2B tunnel label v67");
let html = Buffer.from(match[2], "base64").toString("utf8");

html = html.replace(/<style data-rafex-tunnel-label="v67"><\/style>/g, "");

const planBefore = 'TÜNEL · ${fmt(rack.b2b.tunnelHeight)} mm';
const detailBefore = 'note.textContent="TÜNEL · "+Math.round(tunnel).toLocaleString("tr-TR")+" mm · Mevcut raf tipine bağlı proje detayı";';
if (!html.includes(planBefore)) throw new Error("B2B plan tünel yükseklik etiketi bulunamadı");
html = html.replaceAll(planBefore, "TÜNEL");
if (html.includes(detailBefore)) html = html.replaceAll(detailBefore, 'note.textContent="TÜNEL";');

const marker = '<style data-rafex-tunnel-label="v67"></style>';
const close = html.lastIndexOf("</body>");
if (close < 0) throw new Error("body close missing for B2B tunnel label v67");
html = html.slice(0, close) + marker + "\n" + html.slice(close);

for (const required of [
  'data-rafex-tunnel-label="v67"',
  'm2-b2b-joined-mark">TÜNEL</text>',
  'note.textContent="TÜNEL"',
]) if (!html.includes(required)) throw new Error("B2B tunnel label v67 missing: " + required);
if (html.includes(planBefore) || html.includes(detailBefore)) throw new Error("B2B tünel yüksekliği görünür etikette kaldı");

const encoded = Buffer.from(html).toString("base64");
source = source.slice(0, match.index) + match[0].replace(match[2], encoded) + source.slice(match.index + match[0].length);
fs.writeFileSync(file, source);
console.log("v67: B2B üst görünüş ve seçili raf bilgisinde yalnız TÜNEL yazısı gösterilir; yükseklik hesabı korunur.");
