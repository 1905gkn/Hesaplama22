import fs from "node:fs";
import path from "node:path";

const portalPath = path.join(process.cwd(), "portal.html");
let html = fs.readFileSync(portalPath, "utf8");

const recommendationPattern = /function footSelectRecommendedProfiles\(table, heightIndex, load\) \{[\s\S]*?recommendations: \[first, second\]\.filter\(Boolean\),\s*\};\s*\}/g;
const recommendationMatches = html.match(recommendationPattern) || [];
if (!recommendationMatches.length) {
  throw new Error("Ayak profil öneri fonksiyonu bulunamadı.");
}

html = html.replace(recommendationPattern, `function footSelectRecommendedProfiles(table, heightIndex, load) {
        const qualified = table.profiles
          .filter((profile) => profile.c[heightIndex] >= load)
          .sort(
            (a, b) =>
              a.weight - b.weight || a.c[heightIndex] - b.c[heightIndex],
          );
        const preferred20 = qualified.find((profile) => profile.thickness === 2) || null;
        const preferred15 = qualified.find((profile) => profile.thickness === 1.5) || null;
        const pairPreference = document.getElementById("foot15vs20Priority")?.value || "2";
        let first = null;
        let second = null;

        if (preferred20 && preferred15) {
          first = pairPreference === "1.5" ? preferred15 : preferred20;
          second = pairPreference === "1.5" ? preferred20 : preferred15;
        } else {
          first = preferred15 || qualified[0] || null;
          second = qualified.find((profile) => profile !== first && profile.thickness !== first?.thickness)
            || qualified.find((profile) => profile !== first)
            || null;
        }

        return {
          qualified,
          recommendations: [first, second].filter(Boolean),
        };
      }`);

const loadFieldNeedle = '<label class="input-field">Ayak takımı yükü (kg)<input id="fload" type="number" min="1" placeholder="Örn. 11800"></label></div><div class="foot-note">';
const loadFieldReplacement = '<label class="input-field">Ayak takımı yükü (kg)<input id="fload" type="number" min="1" placeholder="Örn. 11800"></label><label class="input-field">1,5 / 2,0 mm sıralaması<select id="foot15vs20Priority"><option value="2" selected>2,0 mm önce</option><option value="1.5">1,5 mm önce</option></select></label></div><div class="foot-note">';
if (!html.includes(loadFieldNeedle)) {
  throw new Error("Ayak hesaplama yük alanı bulunamadı.");
}
html = html.split(loadFieldNeedle).join(loadFieldReplacement);

const oldRule = 'Sonuçlar Ly 1.200 mm ve Ly 600 mm için ayrı hesaplanır.';
const newRule = 'Sonuçlar Ly 1.200 mm ve Ly 600 mm için ayrı hesaplanır. Yalnızca 1,5 mm ve 2,0 mm profillerin ikisi de uygunsa varsayılan sırada 2,0 mm önce gelir; istersen üstteki seçimden bu iki profilin sırasını değiştirebilirsin.';
html = html.split(oldRule).join(newRule);

html = html.replace(/<style\s+data-rafex-fixed-sidebar-foot=["'][^"']+["'][^>]*>[\s\S]*?<\/style>/gi, "");
const style = `<style data-rafex-fixed-sidebar-foot="v2">
.input-field select{width:100%;margin-top:6px;padding:10px;border:1px solid #e5d991;background:#fff8d5;border-radius:8px;color:#17201b;font-weight:800;outline:0}
.input-field select:focus{border-color:#b89b00;box-shadow:0 0 0 3px #f2c50033}
:root{--rafex-side-width:240px}
.shell{display:block!important;min-height:100dvh!important}
.side{position:fixed!important;left:0!important;top:0!important;bottom:0!important;width:var(--rafex-side-width)!important;height:100dvh!important;min-height:100dvh!important;max-height:100dvh!important;padding:20px 14px!important;background:var(--g2)!important;color:#fff!important;display:flex!important;flex-direction:column!important;overflow-y:auto!important;overflow-x:hidden!important;z-index:1200!important}
.side-brand{flex:0 0 auto!important;padding:5px 6px 18px!important}
.side-logo{width:184px!important;max-width:100%!important;max-height:none!important;height:auto!important;object-fit:contain!important}
.side .nav{display:block!important;flex:0 0 auto!important;margin-top:18px!important;padding-bottom:0!important;overflow:visible!important}
.side .nav button{width:100%!important;min-width:0!important;display:flex!important;align-items:center!important;gap:10px!important;margin:4px 0!important;padding:11px 12px!important;white-space:normal!important;font-size:inherit!important;text-align:left!important}
.side .nav i{width:24px!important;flex:0 0 24px!important}
.side .userbox{position:static!important;left:auto!important;right:auto!important;bottom:auto!important;width:auto!important;margin-top:auto!important;padding:12px!important;display:block!important;flex:0 0 auto!important;background:#ffffff0d!important;border-radius:10px!important}
.side .userbox .program-language{display:grid!important;margin-bottom:12px!important;padding-bottom:12px!important}
.side .userbox .logout{width:100%!important;margin-top:9px!important}
.content{margin-left:var(--rafex-side-width)!important;width:calc(100% - var(--rafex-side-width))!important;min-width:0!important}
@media(max-width:760px){
  .shell{display:block!important;min-height:100dvh!important}
  .side{position:fixed!important;left:0!important;top:0!important;bottom:0!important;width:var(--rafex-side-width)!important;height:100dvh!important;min-height:100dvh!important;max-height:100dvh!important;padding:20px 14px!important;display:flex!important;flex-direction:column!important;overflow-y:auto!important;overflow-x:hidden!important}
  .side-brand{padding:5px 6px 18px!important}
  .side-logo{width:184px!important;max-height:none!important}
  .side .nav{display:block!important;margin-top:18px!important;padding-bottom:0!important;overflow:visible!important}
  .side .nav button{width:100%!important;min-width:0!important;margin:4px 0!important;padding:11px 12px!important;white-space:normal!important;font-size:inherit!important}
  .side .nav i{width:24px!important}
  .side .userbox{position:static!important;margin-top:auto!important;display:block!important;padding:12px!important}
  .content{margin-left:0!important;width:100%!important;min-width:0!important}
}
</style>`;
const headEnd = html.indexOf("</head>");
if (headEnd < 0) throw new Error("Portal </head> bulunamadı.");
html = html.slice(0, headEnd) + style + html.slice(headEnd);

if (!html.includes('id="foot15vs20Priority"')) throw new Error("1,5 / 2,0 mm sıralama seçicisi eklenemedi.");
if (!html.includes('preferred20 && preferred15')) throw new Error("1,5 / 2,0 mm koşullu sıralama kuralı eklenemedi.");
if (!html.includes('data-rafex-fixed-sidebar-foot="v2"')) throw new Error("Sabit yan menü stili eklenemedi.");

fs.writeFileSync(portalPath, html);
console.log(`Ayak 1,5/2,0 mm sıralaması ve tam boy sabit yan menü eklendi (${recommendationMatches.length} öneri fonksiyonu güncellendi).`);

