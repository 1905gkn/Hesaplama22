import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const projectRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const workerPath = resolve(projectRoot, "dist/server/index.js");
const manifestPath = resolve(projectRoot, "dist/.openai/hosting.json");
const vercelEntryPath = resolve(projectRoot, "api/index.js");
const vercelConfigPath = resolve(projectRoot, "vercel.json");

const [source, manifest, vercelEntry, vercelConfig] = await Promise.all([
  readFile(workerPath, "utf8"),
  readFile(manifestPath, "utf8"),
  readFile(vercelEntryPath, "utf8"),
  readFile(vercelConfigPath, "utf8"),
]);
JSON.parse(manifest);
JSON.parse(vercelConfig);
assert.match(vercelEntry, /LEGACY_API_ORIGIN/);
assert.match(vercelEntry, /worker\.fetch/);

// A data URL forces ESM parsing even though the generated output has no package.json.
const moduleUrl = `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`;
const workerModule = await import(moduleUrl);
assert.equal(
  typeof workerModule.default?.fetch,
  "function",
  `${pathToFileURL(workerPath)} must export default.fetch`,
);

console.log("Artifact is valid ESM and exports default.fetch");
console.log("Vercel adapter and configuration are valid");
