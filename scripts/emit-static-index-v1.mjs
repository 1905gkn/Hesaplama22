import fs from "node:fs";
import crypto from "node:crypto";

const serverPath = "dist/server/index.js";
const outputPath = "dist/index.html";
const source = fs.readFileSync(serverPath, "utf8");
const match = source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);

if (!match) {
  throw new Error("HTML_BASE64 bulunamadi; statik giris sayfasi olusturulamadi.");
}

let html = Buffer.from(match[2], "base64").toString("utf8");
if (!html.startsWith("<!doctype html>")) {
  throw new Error("Cozulen ana sayfa beklenen HTML biciminde degil.");
}

const assetDirectory = "dist/inline-assets";
fs.mkdirSync(assetDirectory, { recursive: true });
const emittedAssets = new Set();
html = html.replace(
  /data:(image\/(?:png|jpeg|webp|gif|svg\+xml));base64,([A-Za-z0-9+/=]+)/gi,
  (_whole, mime, encoded) => {
    const buffer = Buffer.from(encoded, "base64");
    const extension = mime.toLowerCase() === "image/jpeg" ? "jpg" : mime.split("/")[1].replace("+xml", "");
    const digest = crypto.createHash("sha256").update(buffer).digest("hex").slice(0, 20);
    const fileName = `${digest}.${extension}`;
    if (!emittedAssets.has(fileName)) {
      fs.writeFileSync(`${assetDirectory}/${fileName}`, buffer);
      emittedAssets.add(fileName);
    }
    return `/inline-assets/${fileName}`;
  },
);

fs.writeFileSync(outputPath, html);
console.log(`Static entry v2: ${html.length} baytlik ana sayfa ve ${emittedAssets.size} tekil gorsel ayrildi.`);
