import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const workerPath = path.join(process.cwd(), "dist/server/index.js");
const worker = fs.readFileSync(workerPath, "utf8");
const match = worker.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);
if (!match) throw new Error("Inline runtime verifier: HTML_BASE64 bulunamadi");

const html = Buffer.from(match[2], "base64").toString("utf8");
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

console.log(`Inline runtime syntax verified: ${scripts.length} script blocks.`);
