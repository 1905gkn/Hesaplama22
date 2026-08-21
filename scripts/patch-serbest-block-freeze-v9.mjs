import fs from "node:fs";
import path from "node:path";

const workerPath = path.join(process.cwd(), "dist/server/index.js");
let worker = fs.readFileSync(workerPath, "utf8");
const match = worker.match(/(const\s+HTML_BASE64\s*=\s*)(["'])([A-Za-z0-9+/=]+)\2/);
if (!match) throw new Error("v9 serbest freeze HTML_BASE64 bulunamadi");

let html = Buffer.from(match[3], "base64").toString("utf8");
const unsafe = "hostObserver.observe(host,{childList:true,subtree:true});decorateProducts();";
const safe = "hostObserver.observe(host,{childList:true});decorateProducts();";
if (!html.includes(unsafe)) throw new Error("v9 serbest freeze observer deseni bulunamadi");
html = html.replace(unsafe, safe);

const encoded = Buffer.from(html, "utf8").toString("base64");
worker = worker.slice(0, match.index) + match[1] + match[2] + encoded + match[2] + worker.slice(match.index + match[0].length);
fs.writeFileSync(workerPath, worker);
console.log("v9: Serbest yerlesimde blok/raf eklenince urun listesi MutationObserver dongusu kesildi.");
