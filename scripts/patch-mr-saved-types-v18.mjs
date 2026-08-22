import fs from "node:fs";
import path from "node:path";

const portalPath = path.join(process.cwd(), "portal.html");
let portal = fs.readFileSync(portalPath, "utf8");

function replaceRequired(from, to, label) {
  if (portal.includes(to)) return;
  if (!portal.includes(from)) throw new Error(`MR v19: ${label} bulunamadi`);
  portal = portal.replace(from, to);
}

function indexRequired(marker, from = 0, label = marker) {
  const index = portal.indexOf(marker, from);
  if (index < 0) throw new Error(`MR v19: ${label} bulunamadi`);
  return index;
}

// Legacy backend /api/mr-types vermiyor (404). MR tiplerini calisan B2B tip
// deposunda sakla; drawing.b2b.mr bayragi ile B2B kayitlarindan ayir.
replaceRequired(
  'const m2TypeApi = () => m2ActiveModule === "b2b" ? "/api/b2b-types" : m2ActiveModule === "mr" ? "/api/mr-types" : "/api/mekik2-types";',
  'const m2TypeApi = () => m2ActiveModule === "b2b" ? "/api/b2b-types" : m2ActiveModule === "mr" ? "/api/b2b-types" : "/api/mekik2-types";',
  "MR tip API"
);

// Kaydet alanindaki kucuk MR BLOKLARI panelini kaynak seviyesinde kaldir.
portal = portal.replace(
  /<div class="mr-block-panel"><div class="mr-block-head"><b>MR BLOKLARI<\/b><small id="mrBlockCount">0\/26<\/small><\/div><div class="mr-block-list" id="mrBlockList"><\/div><\/div>/g,
  ""
);
portal = portal.replace(
  /Mevcut MR ölçülerini A–Z bloklarından biri olarak kaydeder\./g,
  "Mevcut MR ölçülerini kayıtlı MR raf tiplerine ekler."
);

// Tek yetkili liste alttaki genis KAYITLI MR RAF TIPLERI listesi olsun.
{
  const start = indexRequired("      function mrRenderBlocksV7(){", 0, "mrRenderBlocksV7");
  const end = indexRequired("      window.mrSelectBlockV7=", start, "mrSelectBlockV7");
  portal = portal.slice(0, start) + "      function mrRenderBlocksV7(){mrNormalizeBlocksV7();}\n" + portal.slice(end);
}

// B2B ve MR ayni calisan backend tablosunu kullaniyor. Ekranda iki sistemin
// kayitlarini kesin olarak birbirinden ayir; MR harfleri A'dan bagimsiz baslasin.
{
  const oldLine = '          m2SavedRackTypes = Array.isArray(result.types) ? result.types.filter((entry) => entry?.id && entry?.name && entry?.drawing?.plan && (m2ActiveModule!=="mr" || entry?.drawing?.b2b?.mr)).map((entry, index) => ({ ...entry, name:["b2b","mr"].includes(m2ActiveModule) ? b2bTypeLetter(entry.name, entry.typeNo || index + 1) : entry.name, source:"server" })) : [];';
  const newLines = '          const rawTypes=Array.isArray(result.types)?result.types:[];\n          m2SavedRackTypes=rawTypes.filter((entry)=>entry?.id&&entry?.name&&entry?.drawing?.plan&&(m2ActiveModule==="mr"?Boolean(entry?.drawing?.b2b?.mr):m2ActiveModule==="b2b"?!entry?.drawing?.b2b?.mr:true)).map((entry,index)=>({...entry,name:m2ActiveModule==="mr"?b2bTypeLetter("",index+1):m2ActiveModule==="b2b"?b2bTypeLetter(entry.name,entry.typeNo||index+1):entry.name,source:"server"}));';
  replaceRequired(oldLine, newLines, "kayitli tip filtreleme");
}

// MR kaydi her zaman canli MR formundan uretilsin ve calisan /api/b2b-types
// endpointine yazilsin. Sonra ana liste sunucudan tekrar cekilsin.
{
  const start = indexRequired("      window.mrSaveRackV6=async()=>{", 0, "mrSaveRackV6");
  const end = indexRequired("      mrConfigurationV2=function(){", start, "mrConfigurationV2");
  const save = `      window.mrSaveRackV6=async()=>{
        m2ActiveModule="mr";
        const button=$("mrSaveRackButton"),status=$("mrSaveRackStatus");
        const drawing=JSON.parse(JSON.stringify(mrLayoutDrawingV4()));
        m2LastDrawing=drawing;
        if(button)button.disabled=true;
        if(status)status.textContent="MR raf tipi kaydediliyor…";
        try{
          const response=await req("/api/b2b-types",{method:"POST",body:JSON.stringify({drawing})});
          const saved=response?.type||response?.rackType||response;
          await m2RefreshSavedRackTypes();
          m2SelectedSavedType=m2SavedRackTypes.findIndex((entry)=>Number(entry.id)===Number(saved?.id));
          if(m2SelectedSavedType<0)m2SelectedSavedType=m2SavedRackTypes.length?m2SavedRackTypes.length-1:null;
          const entry=m2SelectedSavedType==null?null:m2SavedRackTypes[m2SelectedSavedType];
          const name=entry?.name||(m2SelectedSavedType==null?"MR":b2bTypeLetter("",m2SelectedSavedType+1));
          mrSavedRackDrawingV6=JSON.parse(JSON.stringify(entry?.drawing||saved?.drawing||drawing));
          if(button)button.textContent=name+" Bloğu Kaydedildi";
          m2RenderSavedRackTypes();
          m2RenderSelectedRackInfo();
          if(status)status.textContent=name+" bloğu kaydedildi ve Kayıtlı MR Raf Tipleri listesine eklendi.";
        }catch(error){
          if(status)status.textContent="Kaydedilemedi: "+(error?.message||"MR raf tipi kaydedilemedi.");
        }finally{
          if(button)button.disabled=false;
        }
      };
`;
  portal = portal.slice(0, start) + save + portal.slice(end);
}

// Ana MR listesi render edilirken artik kucuk panel rendereri cagrilmasin.
portal = portal.replace(
  /m2RenderSelectedRackInfo\(\);if\(typeof mrRenderBlocksV7==="function"\)mrRenderBlocksV7\(\);return;/g,
  "m2RenderSelectedRackInfo();return;"
);

// Final MR sayfasi kurulurken aktif modulu Mekik2 taban rendererindan ONCE MR
// olarak sabitle. Boylece ilk liste istegi de dogrudan B2B deposundan MR filtresiyle gelir.
{
  const renderStart = portal.lastIndexOf("      renderMR=function(){");
  if (renderStart < 0) throw new Error("MR v19: final renderMR bulunamadi");
  const call = portal.indexOf("        renderMekik2();", renderStart);
  if (call < 0) throw new Error("MR v19: final renderMekik2 bulunamadi");
  const before = portal.slice(Math.max(renderStart, call - 80), call);
  if (!before.includes('m2ActiveModule="mr";')) {
    portal = portal.slice(0, call) + '        m2ActiveModule="mr";\n' + portal.slice(call);
  }
}

// Render sirasinda eski kaynaklardan panel tekrar eklenirse DOM'dan da temizle.
portal = portal.replace(/<style data-rafex-mr-v18="1">[\s\S]*?<\/style>\s*/g, "");
portal = portal.replace(/<style data-rafex-mr-saved-types-v19="1">[\s\S]*?<\/style>\s*/g, "");
portal = portal.replace(/<script data-rafex-mr-saved-types-v19="1">[\s\S]*?<\/script>\s*/g, "");
const runtime = `<style data-rafex-mr-saved-types-v19="1">
.mr-mode .mr-block-panel{display:none!important}
.mr-mode .mr-rack-save{display:grid!important;grid-template-columns:minmax(140px,220px) 1fr!important;align-items:center!important;gap:10px!important}
</style>
<script data-rafex-mr-saved-types-v19="1">
(()=>{const clean=()=>document.querySelectorAll(".mr-block-panel").forEach((el)=>el.remove());clean();new MutationObserver(clean).observe(document.documentElement,{childList:true,subtree:true});})();
</script>`;
const bodyEnd = portal.lastIndexOf("</body>");
if (bodyEnd < 0) throw new Error("MR v19: body kapanisi bulunamadi");
portal = portal.slice(0, bodyEnd) + runtime + "\n" + portal.slice(bodyEnd);

fs.writeFileSync(portalPath, portal);
console.log("MR v19: kucuk MR BLOKLARI paneli kaldirildi; MR kayitlari calisan B2B deposunda ayri filtreyle saklanip ana listede gosteriliyor.");
