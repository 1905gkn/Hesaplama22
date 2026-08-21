import path from "node:path";
import vm from "node:vm";

const workerPath = path.join(process.cwd(), "dist/server/index.js");
const workerModule = await import(`${workerPath}?syntax-check=${Date.now()}`);
const response = await workerModule.default.fetch(
  new Request("https://runtime-verifier.invalid/"),
  {},
  {},
);
const html = await response.text();
const scripts = [...html.matchAll(/<script\\b([^>]*)>([\\s\\S]*?)<\\/script>/gi)];
const errors = [];

scripts.forEach((entry, index) => {
  const attributes = entry[1] || "";
  if (/\\bsrc\\s*=/.test(attributes)) return;
  try {
    new vm.Script(entry[2], { filename: `inline-runtime-${index}.js` });
  } catch (error) {
    errors.push(`inline #${index} ${attributes.trim()}: ${error.message}`);
  }
});

if (errors.length) {
  throw new Error(`Canli sayfaya gecersiz JavaScript yazilamaz:\n${errors.join("\n")}`);
}

console.log(`Final response runtime syntax verified: ${scripts.length} script blocks.`);
