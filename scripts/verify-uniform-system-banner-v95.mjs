import fs from "node:fs";

const source = fs.readFileSync("dist/server/index.js", "utf8");
const match = source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);
if (!match) throw new Error("v95 verify: HTML_BASE64 bulunamadi");
const html = Buffer.from(match[2], "base64").toString("utf8");

const exactly = (needle, count) => {
  const actual = html.split(needle).length - 1;
  if (actual !== count) throw new Error(`v95 verify: ${needle} sayisi ${actual}, beklenen ${count}`);
};

exactly('data-rafex-uniform-system-banner="v95"', 2);
exactly('id="rafexVersionInfoCard"', 1);

for (const required of [
  "height:128px!important",
  "place-items:center!important",
  "font-size:32px!important",
  "text-transform:uppercase!important",
  "page.insertAdjacentHTML('afterbegin','<section class=\"hero\"",
  "hero.innerHTML='<h2 data-rafex-system-banner-title>'+label+'</h2>'",
  "#rafexB2BReleaseBadge{display:none!important;}",
  "'rafexB2BReleaseBadge'",
  "removeKnownVersionCopies(card);",
]) if (!html.includes(required)) throw new Error(`v95 verify eksigi: ${required}`);

const bannerScript = html.match(/<script\s+data-rafex-uniform-system-banner="v95">([\s\S]*?)<\/script>/);
if (!bannerScript) throw new Error("v95 verify: banner runtime bulunamadi");
new Function(bannerScript[1]);

const versionScript = html.match(/<script\s+data-rafex-version-badge-position="v17">([\s\S]*?)<\/script>/);
if (!versionScript) throw new Error("v95 verify: version runtime bulunamadi");
new Function(versionScript[1]);

console.log("v95 verify: banner olcusu/yazisi ve tek surum karti kurallari dogrulandi.");
