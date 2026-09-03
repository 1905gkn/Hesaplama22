import fs from "node:fs";

const file = "dist/server/index.js";
let source = fs.readFileSync(file, "utf8");
const match = source.match(/(const HTML_BASE64\s*=\s*)(["'])([A-Za-z0-9+/=]+)\2/);
if (!match) throw new Error("v99: HTML_BASE64 bulunamadı.");

let html = Buffer.from(match[3], "base64").toString("utf8");
html = html.replace(/<style\s+data-rafex-common-control-standard="v99">[\s\S]*?<\/style>\s*/g, "");

const css = String.raw`<style data-rafex-common-control-standard="v99">
/* Yalnız Ortak Çizim: bütün sistemlerin kontrol tipolojisi B2B ölçülerine bağlanır. */
#page[data-rafex-common-active="1"]{
  --rafex-control-h:40px;--rafex-control-radius:9px;--rafex-control-gap:10px;
  --rafex-control-border:#cfd9d3;--rafex-control-bg:#fff;--rafex-control-text:#263a30;
  --rafex-control-muted:#66766d;--rafex-control-focus:var(--rafex-common-accent,#214f3b)
}
#page[data-rafex-common-active="1"] :where(.m2-form,.b2b-input-body,.mr-form,.konsol-grid,.fem10209-grid){gap:var(--rafex-control-gap)!important}
#page[data-rafex-common-active="1"] :where(label,.input-field,.b2b-field,.konsol-field,.fem10209-field){
  min-width:0;color:var(--rafex-control-muted)!important;font:850 10px/1.35 Arial,sans-serif!important;letter-spacing:0!important;text-transform:none
}
#page[data-rafex-common-active="1"] :where(label,.input-field,.b2b-field,.konsol-field,.fem10209-field)>:where(input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"]):not([type="range"]):not([type="color"]),select),
#page[data-rafex-common-active="1"] :where(.m2-form,.b2b-input-body,.mr-form,.konsol-grid,.fem10209-grid) :where(input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"]):not([type="range"]):not([type="color"]),select){
  width:100%!important;height:var(--rafex-control-h)!important;min-height:var(--rafex-control-h)!important;max-height:var(--rafex-control-h)!important;
  margin-top:6px!important;padding:8px 10px!important;box-sizing:border-box!important;border:1px solid var(--rafex-control-border)!important;
  border-radius:var(--rafex-control-radius)!important;background:var(--rafex-control-bg)!important;color:var(--rafex-control-text)!important;
  font:800 12px/1 Arial,sans-serif!important;box-shadow:none!important;outline:none!important
}
#page[data-rafex-common-active="1"] :where(input,select):focus-visible{border-color:var(--rafex-control-focus)!important;box-shadow:0 0 0 3px color-mix(in srgb,var(--rafex-control-focus) 18%,transparent)!important}
#page[data-rafex-common-active="1"] :where(input[type="checkbox"],input[type="radio"]){width:16px!important;height:16px!important;min-height:16px!important;margin:0!important;padding:0!important;accent-color:var(--rafex-control-focus)!important}
#page[data-rafex-common-active="1"] input[type="range"]{width:100%!important;accent-color:var(--rafex-control-focus)!important}
#page[data-rafex-common-active="1"] input[type="color"]{width:100%!important;height:var(--rafex-control-h)!important;min-height:var(--rafex-control-h)!important;margin-top:6px!important;padding:4px!important;border:1px solid var(--rafex-control-border)!important;border-radius:var(--rafex-control-radius)!important;background:#fff!important}
#page[data-rafex-common-active="1"] :where(.m2-form,.b2b-input-body,.mr-form,.konsol-grid,.fem10209-grid,.m2-export,.m2-view-tabs,.m2-floor-tools,.b2b-3d-toolbar,.mr-view-toolbar,.konsol-toolbar) button:not(.m2-spacing-close):not(.module-access-close){
  min-height:38px!important;padding:8px 12px!important;border:1px solid var(--rafex-control-border)!important;border-radius:var(--rafex-control-radius)!important;
  background:#f7faf8!important;color:#294638!important;font:900 10px/1.15 Arial,sans-serif!important;letter-spacing:0!important;box-shadow:none!important
}
#page[data-rafex-common-active="1"] :where(.m2-form,.b2b-input-body,.mr-form,.konsol-grid,.fem10209-grid,.m2-export,.m2-view-tabs,.m2-floor-tools,.b2b-3d-toolbar,.mr-view-toolbar,.konsol-toolbar) button:hover{border-color:var(--rafex-control-focus)!important;background:color-mix(in srgb,var(--rafex-control-focus) 8%,#fff)!important}
#page[data-rafex-common-active="1"] :where(.m2-segment,.b2b-choice,.mr-view-toolbar,.konsol-toolbar,.m2-view-tabs){gap:6px!important}
#page[data-rafex-common-active="1"] :where(.m2-segment,.b2b-choice,.mr-view-toolbar,.konsol-toolbar,.m2-view-tabs) button.active,
#page[data-rafex-common-active="1"] :where(.m2-segment,.b2b-choice,.mr-view-toolbar,.konsol-toolbar,.m2-view-tabs) button[aria-pressed="true"],
#page[data-rafex-common-active="1"] :where(.m2-export,.m2-floor-tools) button.primary-tool,
#page[data-rafex-common-active="1"] :where(.m2-export,.m2-floor-tools) button.active{
  border-color:var(--rafex-control-focus)!important;background:var(--rafex-control-focus)!important;color:#fff!important
}
#page[data-rafex-common-active="1"] :where(.m2-foot-choice-row,.b2b-special-summary,.m2-export-actions,.konsol-angle-row){gap:8px!important;align-items:center!important}
#page[data-rafex-common-active="1"] :where(.m2-foot-recommendation,.m2-limit,.b2b-field small,.konsol-field small,.fem10209-field small){font:700 9px/1.4 Arial,sans-serif!important;color:#718078!important}
#page[data-rafex-common-active="1"] :where(.m2-config-card,.b2b-input-card,.mr-panel,.konsol-panel,.fem10209){border-radius:14px!important;border-color:#d8e1dc!important;box-shadow:none!important}
#page[data-rafex-common-active="1"] :where(.m2-spacing-close,.module-access-close,.m2-manual-plan-remove){width:36px!important;height:36px!important;min-height:36px!important;padding:0!important;border-radius:9px!important}
@media(max-width:720px){
  #page[data-rafex-common-active="1"]{--rafex-control-h:42px;--rafex-control-gap:9px}
  #page[data-rafex-common-active="1"] :where(.m2-form,.mr-form,.konsol-grid,.fem10209-grid){grid-template-columns:1fr!important}
}
</style>`;

const closing = html.lastIndexOf("</body>");
if (closing < 0) throw new Error("v99: </body> bulunamadı.");
html = html.slice(0, closing) + css + "\n" + html.slice(closing);
for (const required of ['data-rafex-common-control-standard="v99"','--rafex-control-h:40px','.b2b-input-body','.konsol-grid','.mr-form']) {
  if (!html.includes(required)) throw new Error("v99 doğrulama eksik: " + required);
}
const encoded = Buffer.from(html, "utf8").toString("base64");
source = source.replace(match[0], `${match[1]}${match[2]}${encoded}${match[2]}`);
fs.writeFileSync(file, source);
console.log("v99: Ortak Çizim kontrol boyutları, fontları ve seçim tipolojisi birleştirildi.");
