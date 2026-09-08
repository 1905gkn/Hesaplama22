import fs from "node:fs";
import path from "node:path";

const workerPath = path.join(process.cwd(), "dist/server/index.js");
let worker = fs.readFileSync(workerPath, "utf8");
const match = worker.match(/(const\s+HTML_BASE64\s*=\s*)(["'])([A-Za-z0-9+/=]+)\2/);
if (!match) throw new Error("Nearest gap v90: HTML_BASE64 bulunamadi");
let html = Buffer.from(match[3], "base64").toString("utf8");
if (!html.includes('data-rafex-common-independent="v44"')) throw new Error("Nearest gap v90: Ortak Cizim v44 bulunamadi");

html = html
  .replace(/<meta\s+data-rafex-common-nearest-gap="v90"[^>]*>\s*/g, "")
  .replace(/<script\s+data-rafex-common-nearest-gap="v90">[\s\S]*?<\/script>\s*/g, "")
  .replace(/<script\s+data-rafex-common-save-mekik-front="v9[12]">[\s\S]*?<\/script>\s*/g, "")
  .replace(/<script\s+data-rafex-common-save-only="v92">[\s\S]*?<\/script>\s*/g, "");

function replaceFunction(source, signature, replacement) {
  const start = source.indexOf(signature);
  if (start < 0) throw new Error(`Nearest gap v90: ${signature} bulunamadi`);
  const braceStart = source.indexOf("{", start);
  if (braceStart < 0) throw new Error(`Nearest gap v90: ${signature} govde basi bulunamadi`);
  let depth = 0;
  let quote = null;
  let escape = false;
  for (let i = braceStart; i < source.length; i++) {
    const ch = source[i];
    if (quote) {
      if (escape) { escape = false; continue; }
      if (ch === "\\") { escape = true; continue; }
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') { quote = ch; continue; }
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) return source.slice(0, start) + replacement + source.slice(i + 1);
    }
  }
  throw new Error(`Nearest gap v90: ${signature} govde sonu bulunamadi`);
}

const nearestAllPairs = `  function allPairs(){
    var racks=Array.isArray(m2LayoutState&&m2LayoutState.racks)?m2LayoutState.racks:[];
    if(!racks.length)return [];
    var activeId=m2LayoutState&&m2LayoutState.selected;
    if(activeId==null&&typeof m2MeasurementRack==='function'){
      var measured=m2MeasurementRack();activeId=measured&&measured.id;
    }
    if(activeId==null)return [];
    var active=racks.find(function(rack){return Number(rack.id)===Number(activeId);});
    if(!active)return [];
    var best=null,bestDistance=Infinity;
    for(var i=0;i<racks.length;i+=1){
      var other=racks[i];if(!other||Number(other.id)===Number(active.id))continue;
      var pair=pairCandidate(active,other);if(!pair)continue;
      var distance=Math.max(0,Number(pair.distance)||0);
      if(distance<bestDistance){bestDistance=distance;best=pair;}
    }
    return best?[best]:[];
  }`;
html = replaceFunction(html, "  function allPairs(){", nearestAllPairs);

const historyFilterNeedle = '<option value="b2b">B2B</option><option value="mekik2">Mekik</option>';
const historyFilterReplacement = '<option value="ortak">Ortak Çizim</option><option value="b2b">B2B</option><option value="mekik2">Mekik</option>';
if (!html.includes(historyFilterNeedle) && !html.includes(historyFilterReplacement)) {
  throw new Error("v92: Proje gecmisi tip filtresi bulunamadi");
}
html = html.replace(historyFilterNeedle, historyFilterReplacement);

const historyNameNeedle = `        return module === "b2b"
          ? "B2B"`;
const historyNameReplacement = `        return module === "ortak"
          ? "ORTAK ÇİZİM"
          : module === "b2b"
          ? "B2B"`;
if (!html.includes(historyNameNeedle) && !html.includes(historyNameReplacement)) {
  throw new Error("v92: Proje gecmisi modul etiketi bulunamadi");
}
html = html.replace(historyNameNeedle, historyNameReplacement);

html = html.replace(
  'if (p.module === "mekik2" || p.module === "b2b") {',
  'if (p.module === "mekik2" || p.module === "b2b" || p.module === "ortak") {'
);
html = html.replace(
  ': p.module === "mekik2" || p.module === "b2b"\n                          ?',
  ': p.module === "mekik2" || p.module === "b2b" || p.module === "ortak"\n                          ?'
);

const copyNeedle = `        if (moduleKey === "mekik2" || moduleKey === "b2b") {
          $("historyModal").classList.remove("open");
          m2OpeningProjectFromHistory = true;
          const targetModule = moduleKey === "b2b" ? "b2b" : "mekik2";
          try { showPage(targetModule); } finally { m2OpeningProjectFromHistory = false; }
          m2ProjectRecords = projects.filter((entry) => String(entry.module || "").toLocaleLowerCase("tr-TR").replace(/[\\s_-]+/g, "") === targetModule);`;
const copyReplacement = `        if (moduleKey === "mekik2" || moduleKey === "b2b" || moduleKey === "ortak") {
          $("historyModal").classList.remove("open");
          m2OpeningProjectFromHistory = true;
          const targetModule = moduleKey === "ortak" ? "ortak" : moduleKey === "b2b" ? "b2b" : "mekik2";
          try { showPage(targetModule === "ortak" ? "free" : targetModule); } finally { m2OpeningProjectFromHistory = false; }
          m2ProjectRecords = projects.filter((entry) => String(entry.module || "").toLocaleLowerCase("tr-TR").replace(/[\\s_-]+/g, "") === targetModule);`;
if (!html.includes(copyNeedle) && !html.includes(copyReplacement)) {
  throw new Error("v92: Proje gecmisinden acma zinciri bulunamadi");
}
html = html.replace(copyNeedle, copyReplacement);

html = html.replace(
  "label.innerHTML='<input type=\"checkbox\" '+(pinnedPairGaps.has(key)?'checked':'')+' onchange=\"rafexToggleRackPairGap('+pair.a.id+','+pair.b.id+',this.checked)\" aria-label=\"Raf arası '+(index+1)+' ölçüsünü göster\"><span>Raf arası '+(index+1)+'</span><input type=\"number\" min=\"0\" step=\"1\" value=\"'+mm+'\" oninput=\"event.stopPropagation()\" onchange=\"rafexSetRackPairDistance('+pair.a.id+','+pair.b.id+',this.value,'+rack.id+')\" aria-label=\"Raf arası '+(index+1)+' mesafesi milimetre\">';",
  "label.innerHTML='<input type=\"checkbox\" '+(pinnedPairGaps.has(key)?'checked':'')+' onchange=\"rafexToggleRackPairGap('+pair.a.id+','+pair.b.id+',this.checked)\" aria-label=\"En yakın raf ölçüsünü göster\"><span>En yakın raf</span><input type=\"number\" min=\"0\" step=\"1\" value=\"'+mm+'\" oninput=\"event.stopPropagation()\" onchange=\"rafexSetRackPairDistance('+pair.a.id+','+pair.b.id+',this.value,'+rack.id+')\" aria-label=\"En yakın raf mesafesi milimetre\">';"
);

// This runtime owns only common-project persistence/history normalization.
// The old v92 block also replaced m2MekikSetProjection with a hand-drawn SVG,
// which raced the current Three.js/GLB renderer and made preview/PDF disagree.
const runtime = String.raw`<script data-rafex-common-save-only="v92">(function(){
  if(window.__rafexCommonSaveOnlyV92)return;
  window.__rafexCommonSaveOnlyV92=true;

  function realCommon(){
    var page=document.getElementById('page');
    var nav=document.querySelector('#nav button[data-page="free"]');
    var picker=document.getElementById('rafexUnifiedSystemPicker');
    return !!(page&&nav&&nav.classList.contains('active')&&picker&&page.contains(picker)&&(page.dataset.rafexFreeDrawing==='1'||page.classList.contains('rafex-free-drawing-page')));
  }

  function commonTrace(project){
    if(!project||typeof project!=='object')return false;
    var payload=project.payload&&typeof project.payload==='object'?project.payload:{};
    if(String(project.module||'').toLowerCase()==='ortak'||payload.rafexCommonDrawing===true||String(payload.module||'').toLowerCase()==='ortak')return true;
    var racks=Array.isArray(payload.layout&&payload.layout.racks)?payload.layout.racks:[];
    return racks.some(function(rack){return !!(rack&&(rack.rafexCatalogKey||rack.rafexGlobalTypeLetter||rack.rafexSectionLetter)&&rack.rafexSystem);});
  }

  function normalizeProject(project){
    if(!commonTrace(project)||String(project.module||'').toLowerCase()==='ortak')return project;
    return Object.assign({},project,{rafexOriginalModule:project.module,module:'ortak'});
  }

  function normalizeProjects(rows){return Array.isArray(rows)?rows.map(normalizeProject):[];}
  window.rafexIsCommonProjectRecordV92=commonTrace;

  var originalLoadProjects=typeof loadProjects==='function'?loadProjects:null;
  if(originalLoadProjects){
    var commonLoadProjects=async function(){var result=await originalLoadProjects.apply(this,arguments);try{projects=normalizeProjects(projects);}catch(error){console.warn('Ortak Cizim gecmisi normalize edilemedi',error);}return result;};
    try{loadProjects=commonLoadProjects;}catch(error){}
    window.loadProjects=commonLoadProjects;
  }

  var originalRefreshProjects=typeof m2RefreshProjects==='function'?m2RefreshProjects:null;
  if(originalRefreshProjects){
    var commonRefreshProjects=async function(){
      if(!realCommon())return originalRefreshProjects.apply(this,arguments);
      try{
        var result=await req('/api/projects');
        m2ProjectRecords=normalizeProjects(result&&result.projects).filter(function(project){return project.module==='ortak';});
        m2RenderProjects();
      }catch(error){var status=document.getElementById('m2FloorStatus');if(status)status.textContent=error&&error.message||'Ortak Cizim projeleri getirilemedi.';}
    };
    try{m2RefreshProjects=commonRefreshProjects;}catch(error){}
    window.m2RefreshProjects=commonRefreshProjects;
  }

  var nativeFetch=window.fetch;
  if(typeof nativeFetch==='function'&&!nativeFetch.__rafexCommonSaveOnlyV92){
    var wrappedFetch=function(input,init){
      var url=typeof input==='string'?input:(input&&input.url)||'';
      var opts=init||{};
      if(realCommon()&&/\/api\/projects(?:\?|$)/.test(url)&&String(opts.method||'GET').toUpperCase()==='POST'&&typeof opts.body==='string'){
        try{
          var body=JSON.parse(opts.body);
            body.module='ortak';
            if(body.payload&&typeof body.payload==='object'){
              body.payload.module='ortak';
              body.payload.rafexCommonDrawing=true;
          }
          opts=Object.assign({},opts,{body:JSON.stringify(body)});
        }catch(error){console.warn('Ortak Cizim kayit govdesi normalize edilemedi',error);}
      }
      return nativeFetch.call(this,input,opts);
    };
    wrappedFetch.__rafexCommonSaveOnlyV92=true;
    window.fetch=wrappedFetch;
  }
})();</script>`;

html = html.replace("</head>", '<meta data-rafex-common-nearest-gap="v90"></head>');
const closing=html.lastIndexOf("</body>");
if(closing<0)throw new Error("v91: </body> bulunamadi");
html=html.slice(0,closing)+runtime+"\n"+html.slice(closing);

for (const required of [
  'data-rafex-common-nearest-gap="v90"',
  'var best=null,bestDistance=Infinity',
  'return best?[best]:[];',
  '<span>En yakın raf</span>',
  'data-rafex-common-save-only="v92"',
  "body.module='ortak'",
  "nav.classList.contains('active')",
  'rafexIsCommonProjectRecordV92',
  '<option value="ortak">Ortak Çizim</option>',
  'module === "ortak"',
  '__rafexCommonSaveOnlyV92=true'
]) if (!html.includes(required)) throw new Error("Nearest gap/v91 dogrulama eksigi: "+required);

const encoded = Buffer.from(html, "utf8").toString("base64");
worker = worker.replace(match[0], `${match[1]}${match[2]}${encoded}${match[2]}`);
fs.writeFileSync(workerPath, worker);
if (html.includes('data-rafex-common-save-mekik-front="v92"') || html.includes('data-rafex-mekik-front="restored-v91"')) {
  throw new Error("v92: eski Mekik on gorunus override'i build icinde kaldi");
}
if (!html.includes('data-rafex-common-save-only="v92"')) throw new Error("v92: save-only runtime eklenemedi");
console.log("v90/v92: Ortak Cizim kayit/gecmis normalizasyonu korundu; eski Mekik SVG on gorunus override'i kaldirildi.");
