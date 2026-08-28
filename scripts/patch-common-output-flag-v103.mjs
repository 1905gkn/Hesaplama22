import fs from "node:fs";

const file = "dist/server/index.js";
let source = fs.readFileSync(file, "utf8");
const match = source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);
if (!match) throw new Error("Common output flag v103: HTML_BASE64 bulunamadi");
let html = Buffer.from(match[2], "base64").toString("utf8");
if (!html.includes('data-rafex-common-output-add="v102"')) throw new Error("Common output flag v103: v102 bulunamadi");

const oldCode = "requestAnimationFrame(()=>{if(!isOutput)window.__rafexExplicitOutputV90=false});requestAnimationFrame(decorate);return";
const newCode = "if(isOutput)setTimeout(()=>{window.__rafexExplicitOutputV90=false},4500);else requestAnimationFrame(()=>{window.__rafexExplicitOutputV90=false});requestAnimationFrame(decorate);return";
if (!html.includes(oldCode) && !html.includes(newCode)) throw new Error("Common output flag v103: cikti click yolu bulunamadi");
if (html.includes(oldCode)) html = html.replace(oldCode, newCode);

if (!html.includes('data-rafex-common-output-flag="v103"')) {
  html = html.replace("</head>", '<meta data-rafex-common-output-flag="v103"></head>');
}
for (const token of ['data-rafex-common-output-flag="v103"', "setTimeout(()=>{window.__rafexExplicitOutputV90=false},4500)"]) {
  if (!html.includes(token)) throw new Error("Common output flag v103 dogrulama eksigi: " + token);
}

const encoded = Buffer.from(html, "utf8").toString("base64");
source = source.slice(0, match.index) + match[0].replace(match[2], encoded) + source.slice(match.index + match[0].length);
fs.writeFileSync(file, source);
console.log("v103: manuel cikti tamamlaninca explicit PDF kapisi yeniden kapatilir.");
