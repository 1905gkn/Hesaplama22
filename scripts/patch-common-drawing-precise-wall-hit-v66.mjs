import fs from "node:fs";

const file = "dist/server/index.js";
let source = fs.readFileSync(file, "utf8");
const match = source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);
if (!match) throw new Error("HTML_BASE64 not found for precise wall distance hit v66");
let html = Buffer.from(match[2], "base64").toString("utf8");

html = html.replace(/<style data-rafex-precise-wall-hit="v66">[\s\S]*?<\/style>/g, "");

const runtime = String.raw`
<style data-rafex-precise-wall-hit="v66">
/* Duvar mesafelerinde yalnız görünen mm yazısı tıklanır; geniş şeffaf hit kutusu pasiftir. */
#page #m2LayoutSvg .m2-measure-hit[data-dimension-key^="wall:"]{pointer-events:none!important;cursor:default!important}
#page #m2LayoutSvg .m2-wall-distance-label[data-dimension-key^="wall:"]{pointer-events:visiblePainted!important;cursor:pointer}
</style>`;

const close = html.lastIndexOf("</body>");
if (close < 0) throw new Error("body close missing for precise wall distance hit v66");
html = html.slice(0, close) + runtime + "\n" + html.slice(close);

for (const required of [
  'data-rafex-precise-wall-hit="v66"',
  '.m2-measure-hit[data-dimension-key^="wall:"]{pointer-events:none!important',
  '.m2-wall-distance-label[data-dimension-key^="wall:"]{pointer-events:visiblePainted!important',
]) if (!html.includes(required)) throw new Error("Precise wall distance hit v66 missing: " + required);

const encoded = Buffer.from(html).toString("base64");
source = source.slice(0, match.index) + match[0].replace(match[2], encoded) + source.slice(match.index + match[0].length);
fs.writeFileSync(file, source);
console.log("v66: Duvar mesafelerinde genis seffaf tiklama alani kapatildi; yalniz gorunen mm yazisi tiklanir.");
