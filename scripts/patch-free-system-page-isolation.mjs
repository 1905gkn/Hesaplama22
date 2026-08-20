import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const workerPath = path.join(root, "dist/server/index.js");

let worker = fs.readFileSync(workerPath, "utf8");
const match = worker.match(/(const\s+HTML_BASE64\s*=\s*)(["'])([A-Za-z0-9+/=]+)\2/);
if (!match) throw new Error("Free system page isolation: HTML_BASE64 bulunamadi.");

let html = Buffer.from(match[3], "base64").toString("utf8");
if (!html.includes('data-rafex-unified-free-system-controls="v1"')) {
  throw new Error("Free system page isolation: Serbest Cizim sistem kontrol runtime bulunamadi.");
}

// patch-unified-free-system-controls Serbest Cizim icin iki eski global B2B
// cift-tik kosulunu raf sistemine gore degistiriyor. Bu son pas, o farki sadece
// Serbest Cizim sayfasinda etkin tutar. Normal B2B/Mekik sayfalarinda eski
// m2ActiveModule davranisi birebir korunur.
const mixedTap = 'if ((rack?.rafexSystem === "b2b" || rack?.b2bLayout || rack?.b2b) && !m2MultiSelect.rackIds.has(id) && m2LastRackTap.id === id && now - m2LastRackTap.at < 520)';
const isolatedTap = 'if ((((document.getElementById("page")?.dataset?.rafexFreeDrawing === "1" || document.getElementById("page")?.classList?.contains("rafex-free-drawing-page")) ? (rack?.rafexSystem === "b2b" || rack?.b2bLayout || rack?.b2b) : m2ActiveModule === "b2b")) && !m2MultiSelect.rackIds.has(id) && m2LastRackTap.id === id && now - m2LastRackTap.at < 520)';
let tapCount = 0;
if (html.includes(mixedTap)) {
  tapCount = html.split(mixedTap).length - 1;
  html = html.replaceAll(mixedTap, isolatedTap);
} else if (!html.includes(isolatedTap)) {
  throw new Error("Free system page isolation: cift tik kosulu bulunamadi.");
}

const mixedDbl = '          if (!rackNode) return;\n          const rack = m2LayoutState.racks.find((item) => item.id === Number(rackNode.dataset.rack));\n          if (!(rack?.rafexSystem === "b2b" || rack?.b2bLayout || rack?.b2b)) return;\n          event.preventDefault(); event.stopPropagation();\n          m2StartAutoFillGuide(Number(rackNode.dataset.rack));';
const isolatedDbl = '          if (!rackNode) return;\n          const rafexFreePage = document.getElementById("page")?.dataset?.rafexFreeDrawing === "1" || document.getElementById("page")?.classList?.contains("rafex-free-drawing-page");\n          if (rafexFreePage) {\n            const rack = m2LayoutState.racks.find((item) => item.id === Number(rackNode.dataset.rack));\n            if (!(rack?.rafexSystem === "b2b" || rack?.b2bLayout || rack?.b2b)) return;\n          } else if (m2ActiveModule !== "b2b") return;\n          event.preventDefault(); event.stopPropagation();\n          m2StartAutoFillGuide(Number(rackNode.dataset.rack));';
let dblCount = 0;
if (html.includes(mixedDbl)) {
  dblCount = html.split(mixedDbl).length - 1;
  html = html.replaceAll(mixedDbl, isolatedDbl);
} else if (!html.includes(isolatedDbl)) {
  throw new Error("Free system page isolation: dblclick kosulu bulunamadi.");
}

// Serbest Cizim runtime icindeki ekstra tus/dblclick dinleyicileri zaten isFree()
// ile sinirli. CSS de #page.rafex-free-drawing-page altina scope edilmis durumda.
// Burada yalnizca kaynak seviyesinde degisen iki global kosulu izole ediyoruz.
if (!html.includes('if(!isFree()||event.defaultPrevented)return;')) {
  throw new Error("Free system page isolation: klavye kisayolu Serbest Cizim guard bulunamadi.");
}
if (!html.includes("if(!isFree())return;\n    var rackNode=event.target?.closest?.('#m2LayoutSvg [data-rack]');")) {
  throw new Error("Free system page isolation: Serbest Cizim dblclick guard bulunamadi.");
}

const encoded = Buffer.from(html, "utf8").toString("base64");
worker = worker.replace(match[0], `${match[1]}${match[2]}${encoded}${match[2]}`);
fs.writeFileSync(workerPath, worker);

const finalMatch = worker.match(/(const\s+HTML_BASE64\s*=\s*)(["'])([A-Za-z0-9+/=]+)\2/);
const finalHtml = Buffer.from(finalMatch[3], "base64").toString("utf8");
for (const required of [isolatedTap, isolatedDbl, 'data-rafex-unified-free-system-controls="v1"']) {
  if (!finalHtml.includes(required)) throw new Error(`Free system page isolation dogrulama hatasi: ${required.slice(0, 90)}`);
}

console.log(`FINAL: B2B ve Mekik ana sayfalari orijinal davranista; Serbest Cizim sistem kontrolleri sadece Serbest Cizim'e izole edildi. tap=${tapCount}, dbl=${dblCount}`);
