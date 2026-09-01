import fs from "node:fs";

const serverPath = "dist/server/index.js";
const outputPath = "dist/index.html";
const source = fs.readFileSync(serverPath, "utf8");
const match = source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);

if (!match) {
  throw new Error("HTML_BASE64 bulunamadi; statik giris sayfasi olusturulamadi.");
}

const html = Buffer.from(match[2], "base64").toString("utf8");
if (!html.startsWith("<!doctype html>")) {
  throw new Error("Cozulen ana sayfa beklenen HTML biciminde degil.");
}

fs.writeFileSync(outputPath, html);
console.log(`Static entry v1: ${html.length} baytlik ana sayfa sunucu fonksiyonundan ayrildi.`);
