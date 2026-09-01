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
  .replace(/<script\s+data-rafex-common-save-mekik-front="v9[12]">[\s\S]*?<\/script>\s*/g, "");

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

const runtime = String.raw`<script data-rafex-common-save-mekik-front="v92">(function(){
  if(window.__rafexCommonSaveMekikFrontV92)return;
  window.__rafexCommonSaveMekikFrontV92=true;

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
  if(typeof nativeFetch==='function'){
    window.fetch=function(input,init){
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
  }

  var originalProjection=window.m2MekikSetProjection;
  function n(value,fallback){var x=Number(value);return Number.isFinite(x)?x:fallback;}
  function frontProjection(drawing,x,y,width,height){
    drawing=drawing||{};
    var bays=Math.max(1,Math.min(20,Math.round(n(drawing.bays,1))));
    var levels=Math.max(1,Math.min(15,Math.round(n(drawing.levels,1))));
    var firstRail=Math.max(0,n(drawing.firstRailHeight,430));
    var levelH=Math.max(380,n(drawing.levelH,1580));
    var palletH=Math.max(300,n(drawing.palletHeight,1200));
    var rackH=Math.max(firstRail+(levels-1)*levelH+palletH,n(drawing.totalRackHeight,0));
    var totalW=Math.max(1000,n(drawing.totalWidth,n(drawing.widthMm,bays*1400)));
    var padX=Math.max(24,totalW*0.035),padTop=Math.max(70,rackH*0.075),padBottom=Math.max(35,rackH*0.035);
    var vw=totalW+padX*2,vh=rackH+padTop+padBottom;
    var bayW=totalW/bays,uprightW=Math.max(45,Math.min(110,n(drawing.footType,90)));
    var palletW=Math.min(bayW*.72,Math.max(520,n(drawing.palW,1200)*.88));
    var boxH=Math.max(120,palletH*.72),palletBase=Math.max(90,Math.min(166,palletH*.16));
    var steel='#00679d',steelDark='#002f4a',yellow='#f0c400',blue='#073a6d',blue2='#0b4e87',wood='#d99a49',woodDark='#8a541f',box='#c98b3d';
    var parts='';
    for(var i=0;i<=bays;i++){
      var ux=i*bayW-uprightW/2;
      if(i===0)ux=0;if(i===bays)ux=totalW-uprightW;
      parts+='<g><rect x="'+ux+'" y="'+padTop+'" width="'+uprightW+'" height="'+rackH+'" rx="4" fill="'+steel+'" stroke="'+steelDark+'" stroke-width="5"/><line x1="'+(ux+uprightW*.28)+'" y1="'+(padTop+8)+'" x2="'+(ux+uprightW*.28)+'" y2="'+(padTop+rackH-8)+'" stroke="#eef1f2" stroke-width="4" opacity=".8"/><rect x="'+(ux-uprightW*.18)+'" y="'+(padTop+rackH-16)+'" width="'+(uprightW*1.36)+'" height="16" fill="#8e979b" stroke="'+steelDark+'" stroke-width="3"/></g>';
    }
    for(var l=0;l<levels;l++){
      var railZ=firstRail+l*levelH;
      var railY=padTop+rackH-railZ;
      for(var b=0;b<bays;b++){
        var bx=b*bayW;
        var innerL=bx+uprightW*.72,innerR=(b+1)*bayW-uprightW*.72;
        var beamY=railY-32;
        parts+='<rect x="'+innerL+'" y="'+beamY+'" width="'+Math.max(8,innerR-innerL)+'" height="28" rx="3" fill="'+yellow+'" stroke="#9f8400" stroke-width="3"/>';
        parts+='<rect x="'+(innerL+8)+'" y="'+(beamY+30)+'" width="'+Math.max(8,innerR-innerL-16)+'" height="34" rx="5" fill="'+blue+'" stroke="#03294d" stroke-width="3"/>';
        parts+='<rect x="'+(innerL+14)+'" y="'+(beamY+36)+'" width="'+Math.max(8,innerR-innerL-28)+'" height="9" rx="3" fill="'+blue2+'" opacity=".95"/>';
        parts+='<rect x="'+(innerL-18)+'" y="'+(beamY-4)+'" width="18" height="38" rx="2" fill="'+yellow+'" stroke="#9f8400" stroke-width="3"/><rect x="'+innerR+'" y="'+(beamY-4)+'" width="18" height="38" rx="2" fill="'+yellow+'" stroke="#9f8400" stroke-width="3"/>';
        var px=bx+(bayW-palletW)/2,py=beamY-palletBase-boxH+7;
        parts+='<rect x="'+px+'" y="'+py+'" width="'+palletW+'" height="'+boxH+'" rx="2" fill="'+box+'" stroke="'+woodDark+'" stroke-width="4"/>';
        parts+='<rect x="'+px+'" y="'+(py+boxH)+'" width="'+palletW+'" height="'+palletBase+'" rx="2" fill="'+wood+'" stroke="'+woodDark+'" stroke-width="4"/><line x1="'+(px+palletW*.12)+'" y1="'+(py+boxH+palletBase*.45)+'" x2="'+(px+palletW*.88)+'" y2="'+(py+boxH+palletBase*.45)+'" stroke="'+woodDark+'" stroke-width="5"/>';
      }
    }
    parts+='<line x1="0" y1="'+(padTop+rackH)+'" x2="'+totalW+'" y2="'+(padTop+rackH)+'" stroke="#26313b" stroke-width="8"/>';
    return '<g data-rafex-mekik-front="restored-v91" aria-label="Mekik raf referans on gorunusu"><svg x="'+x+'" y="'+y+'" width="'+width+'" height="'+height+'" viewBox="'+(-padX)+' 0 '+vw+' '+vh+'" preserveAspectRatio="xMidYMid meet" overflow="visible">'+parts+'</svg></g>';
  }

  if(typeof originalProjection==='function'){
    window.m2MekikSetProjection=function(mode,drawing,x,y,width,height){
      if(mode==='front')return frontProjection(drawing,x||0,y||0,width||200,height||112);
      return originalProjection.apply(this,arguments);
    };
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
  'data-rafex-common-save-mekik-front="v92"',
  "body.module='ortak'",
  "nav.classList.contains('active')",
  'rafexIsCommonProjectRecordV92',
  '<option value="ortak">Ortak Çizim</option>',
  'module === "ortak"',
  'data-rafex-mekik-front="restored-v91"'
]) if (!html.includes(required)) throw new Error("Nearest gap/v91 dogrulama eksigi: "+required);

const encoded = Buffer.from(html, "utf8").toString("base64");
worker = worker.replace(match[0], `${match[1]}${match[2]}${encoded}${match[2]}`);
fs.writeFileSync(workerPath, worker);
console.log("v90/v92: Ortak Cizim kayit, liste ve gecmis acma zinciri module=ortak olarak sabitlendi; eski yanlis siniflanan ortak kayitlar izlerinden taninir.");
