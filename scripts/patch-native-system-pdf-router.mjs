import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const workerPath = path.join(root, "dist/server/index.js");
const marker = 'data-rafex-native-system-pdf-router="v1"';

let worker = fs.readFileSync(workerPath, "utf8");
const match = worker.match(/(const\s+HTML_BASE64\s*=\s*)(["'])([A-Za-z0-9+/=]+)\2/);
if (!match) throw new Error("Native system PDF router: HTML_BASE64 bulunamadi.");

let html = Buffer.from(match[3], "base64").toString("utf8");
if (!html.includes('data-rafex-b2b-section-positioner-fallback="v5"')) throw new Error("Native system PDF router: B2B Kesit Yer Belirleme bulunamadi.");
if (!html.includes('data-rafex-unified-section-positioner="v1"')) throw new Error("Native system PDF router: Mekik Kesit Yer Belirleme bulunamadi.");

// 1) B2B Kesit Yer Belirleme sadece B2B çizimlerini toplasın. Böylece Mekik veya
// ileride eklenecek başka sistemlerin kurumsal çıktı kartlarını perspektife çevirmesin.
const b2bDrawingNeedle = '        const drawing = entry?.drawing || entry;\n        if (!drawing) return;\n        const label = safeKey';
const b2bDrawingReplacement = '        const drawing = entry?.drawing || entry;\n        if (!drawing || !(drawing?.b2b || drawing?.b2bLayout)) return;\n        const label = safeKey';
if (!html.includes(b2bDrawingNeedle)) throw new Error("Native system PDF router: B2B drawing filtre noktasi bulunamadi.");
html = html.replace(b2bDrawingNeedle, b2bDrawingReplacement);

const b2bCardNeedle = '      [...host.querySelectorAll(".m2-corporate-type-card")].forEach((card, index) => {\n        const rawTitle =';
const b2bCardReplacement = '      [...host.querySelectorAll(".m2-corporate-type-card")].forEach((card, index) => {\n        if (card.dataset.rafexSystem && card.dataset.rafexSystem !== "b2b") return;\n        const rawTitle =';
const b2bV19CardNeedle = '      [...host.querySelectorAll(\'.m2-corporate-type-card,.rafex-v19-type-card[data-rafex-system="b2b"]\')].forEach((card, index) => {\n        const rawTitle =';
const b2bV19CardReplacement = '      [...host.querySelectorAll(\'.m2-corporate-type-card,.rafex-v19-type-card[data-rafex-system="b2b"]\')].forEach((card, index) => {\n        if (card.dataset.rafexSystem && card.dataset.rafexSystem !== "b2b") return;\n        const rawTitle =';
if (html.includes(b2bCardNeedle)) html = html.replace(b2bCardNeedle, b2bCardReplacement);
else if (html.includes(b2bV19CardNeedle)) html = html.replace(b2bV19CardNeedle, b2bV19CardReplacement);
else throw new Error("Native system PDF router: B2B card filtre noktasi bulunamadi.");

// 2) Aynı raf tipi adı farklı sistemlerde kullanılabilsin. Kurumsal raporun tip anahtarı
// sistem adını da içerir; B2B A ile Mekik A artık tek tip gibi birleşmez.
const usedStart = html.indexOf('      function m2CorporateUsedTypes() {');
const usedEnd = html.indexOf('\n      function m2CorporateCutTypes(types){', usedStart);
if (usedStart < 0 || usedEnd < 0) throw new Error("Native system PDF router: m2CorporateUsedTypes bulunamadi.");
const usedFunction = `      function m2CorporateUsedTypes() {
        const map = new Map();
        m2LayoutState.racks.forEach((rack, index) => {
          const name = rack.typeName || \`Tip \${index + 1}\`, blockName=String(rack.blockName||\"\").trim(), rafexSystem=rack.rafexSystem||(rack.b2bLayout||rack.b2b?\"b2b\":\"mekik2\"), key = \`\${rafexSystem}|\${name}|\${blockName}|\${rack.widthMm}|\${rack.depthMm}|\${rack.bays}|\${rack.levels}|\${rack.depth}|\${rack.b2bLayout?.palletCount||0}|\${rack.b2bLayout?.rowCount||0}\`;
          if (!map.has(key)) map.set(key, { name, blockName, rafexSystem, rackCount:0, footTeamCount:0, rackIds:[], drawing:{...rack,rafexSystem,totalWidth:rack.widthMm,railLength:rack.depthMm,plan:rack.plan} });
          const entry=map.get(key),rowCount=Math.max(1,Number(rack.b2bLayout?.rowCount)||1);entry.rackCount+=1;entry.footTeamCount+=rack.b2bLayout?2*rowCount-(rack.sharedFootWith?rowCount:0):0;entry.rackIds.push(rack.id);
        });
        return [...map.values()];
      }`;
html = html.slice(0, usedStart) + usedFunction + html.slice(usedEnd);

const cutStart = html.indexOf('      function m2CorporateCutTypes(types){');
const cutEnd = html.indexOf('\n      function m2CorporateHeader', cutStart);
if (cutStart < 0 || cutEnd < 0) throw new Error("Native system PDF router: m2CorporateCutTypes bulunamadi.");
const cutFunction = `      function m2CorporateCutTypes(types){
        const map=new Map();(types||[]).forEach((entry,index)=>{const name=entry.name||\`Tip \${index+1}\`,drawing=entry.drawing||entry,rafexSystem=entry.rafexSystem||drawing.rafexSystem||(drawing?.b2bLayout||drawing?.b2b?\"b2b\":\"mekik2\"),key=rafexSystem+\"|\"+String(name).trim().toLocaleUpperCase(\"tr-TR\"),current=map.get(key),nextCount=Number(drawing?.b2bLayout?.palletCount)||0,palletTotal=nextCount*Math.max(0,Number(drawing?.levels)||0)*Math.max(1,Number(drawing?.b2bLayout?.rowCount)||1)*Math.max(1,Number(entry.rackCount)||1);if(!current)map.set(key,{...entry,rafexSystem,name,palletTotal});else{current.rackCount=(Number(current.rackCount)||0)+(Number(entry.rackCount)||0);current.footTeamCount=(Number(current.footTeamCount)||0)+(Number(entry.footTeamCount)||0);current.palletTotal=(Number(current.palletTotal)||0)+palletTotal;if(nextCount>(Number((current.drawing||current)?.b2bLayout?.palletCount)||0))current.drawing=drawing;}});return[...map.values()];
      }`;
html = html.slice(0, cutStart) + cutFunction + html.slice(cutEnd);

// Varyant grupları da sistem bazında ayrı tutulur.
const variantNeedle = 'const variantGroups=new Map();types.forEach((entry,index)=>{const name=String(entry.name||`TİP ${index+1}`).trim(),key=name.toLocaleUpperCase("tr-TR"),drawing=entry.drawing||entry,count=Number(drawing?.b2bLayout?.palletCount)||0;if(!variantGroups.has(key))variantGroups.set(key,{key,id:encodeURIComponent(key),name,entries:new Map()});';
const variantReplacement = 'const variantGroups=new Map();types.forEach((entry,index)=>{const name=String(entry.name||`TİP ${index+1}`).trim(),drawing=entry.drawing||entry,rafexSystem=entry.rafexSystem||drawing.rafexSystem||(drawing?.b2bLayout||drawing?.b2b?"b2b":"mekik2"),key=rafexSystem+"|"+name.toLocaleUpperCase("tr-TR"),count=Number(drawing?.b2bLayout?.palletCount)||0;if(!variantGroups.has(key))variantGroups.set(key,{key,id:encodeURIComponent(key),name,rafexSystem,entries:new Map()});';
if (html.includes(variantNeedle)) html = html.replace(variantNeedle, variantReplacement);

// 3) Önceki Mekik katmanı B2B kartlarına asla dokunmasın.
const mekikCardNeedle = 'cards.forEach(function(card){var name=titleOfCard(card);var cardSections=byName.get(name);if(!cardSections||!cardSections.length)return;';
const mekikCardReplacement = 'cards.forEach(function(card){if(card.dataset.rafexSystem&&card.dataset.rafexSystem!=="mekik2")return;var name=titleOfCard(card);var cardSections=byName.get(name);if(!cardSections||!cardSections.length)return;';
if (!html.includes(mekikCardNeedle)) throw new Error("Native system PDF router: Mekik card filtre noktasi bulunamadi.");
html = html.replace(mekikCardNeedle, mekikCardReplacement);

html = html.replace(/<style\s+data-rafex-native-system-pdf-router="v1">[\s\S]*?<\/style>\s*<script\s+data-rafex-native-system-pdf-router="v1">[\s\S]*?<\/script>/g, "");

const runtime = String.raw`<style data-rafex-native-system-pdf-router="v1">
.m2-corporate-type-card[data-rafex-system="mekik2"]>.m2-corporate-view{position:relative!important;overflow:hidden!important}
.m2-corporate-type-card[data-rafex-system="mekik2"]>.m2-corporate-view>svg[data-rafex-native-positioned="1"]{position:absolute!important;max-width:none!important;transform-origin:center center!important}
.m2-corporate-type-card[data-rafex-system]>.rafex-native-system-chip{position:absolute;right:7px;top:7px;z-index:6;padding:3px 6px;border-radius:999px;background:#173c2d;color:#fff;font:900 7px Arial;letter-spacing:.04em;pointer-events:none}
.m2-corporate-type-card[data-rafex-system="mekik2"]>.rafex-native-system-chip{background:#315f88}
</style>
<script data-rafex-native-system-pdf-router="v1">(function(){
  if(window.__rafexNativeSystemPdfRouterV1)return;
  window.__rafexNativeSystemPdfRouterV1=true;

  var MEKIK_STORAGE='rafex_mekik_section_placement_v1';
  var mekikTypes=[];
  var mekikLoading=null;
  var adapters=new Map();

  function norm(value){return String(value||'').trim().replace(/\s+/g,' ').toLocaleLowerCase('tr-TR');}
  function systemOf(entry){var drawing=entry&&entry.drawing||entry||{};return entry&&entry.rafexSystem||drawing.rafexSystem||(drawing.b2bLayout||drawing.b2b?'b2b':'mekik2');}
  function typeNameOfCard(card){return String(card?.dataset?.rafexTypeName||card?.querySelector(':scope > strong > span')?.textContent||card?.querySelector(':scope > strong')?.textContent||'').replace(/\s+TİPİ$/i,'').trim();}
  function readMekikSettings(){try{return JSON.parse(localStorage.getItem(MEKIK_STORAGE)||'{}')||{};}catch{return {};}}
  function viewSetting(raw){raw=raw||{};var num=function(value,fallback){var n=Number(value);return Number.isFinite(n)?n:fallback;};return{x:Math.max(-80,Math.min(80,num(raw.x,0))),y:Math.max(-80,Math.min(80,num(raw.y,0))),scale:Math.max(.35,Math.min(2.5,num(raw.scale,1))),rotation:Math.max(-180,Math.min(180,num(raw.rotation,0)))};}
  function normalizeAngle(value){var n=Math.round(Number(value)||0);return((n%360)+360)%360;}
  function modeForAngle(angle){angle=normalizeAngle(angle);return angle===90||angle===270?'side':'front';}

  async function requestJson(url){
    try{if(typeof req==='function')return await req(url);}catch{}
    var response=await fetch(url,{credentials:'same-origin'});if(!response.ok)throw new Error('HTTP '+response.status);return await response.json();
  }
  async function loadMekikTypes(){
    if(mekikTypes.length)return mekikTypes;if(mekikLoading)return mekikLoading;
    mekikLoading=(async function(){try{var result=await requestJson('/api/mekik2-types');mekikTypes=(Array.isArray(result?.types)?result.types:[]).filter(function(entry){return entry?.id&&entry?.name&&entry?.drawing;});return mekikTypes;}catch(error){console.warn('Native PDF router Mekik tiplerini okuyamadi',error);return[];}finally{mekikLoading=null;}})();return mekikLoading;
  }

  function corporateTypes(){try{return typeof m2CorporateUsedTypes==='function'?m2CorporateUsedTypes():[];}catch{return[];}}
  function tagCards(){
    var types=corporateTypes(),byName=new Map();
    types.forEach(function(entry){var name=norm(entry?.name);if(!name)return;if(!byName.has(name))byName.set(name,[]);byName.get(name).push(entry);});
    ['m2CorporatePreview','m2CorporatePrint','m2CorporatePrintArea'].forEach(function(hostId){
      var host=document.getElementById(hostId);if(!host)return;
      host.querySelectorAll('.m2-corporate-type-card').forEach(function(card){
        var name=norm(typeNameOfCard(card)),candidates=byName.get(name)||[],system=card.dataset.rafexSystem||'';
        if(!system&&candidates.length===1)system=systemOf(candidates[0]);
        if(!system&&card.querySelector('.m2-set-projection'))system='mekik2';
        if(!system&&candidates.some(function(entry){return systemOf(entry)==='b2b';}))system='b2b';
        if(!system&&candidates.length)system=systemOf(candidates[0]);
        if(system)card.dataset.rafexSystem=system;
        card.style.position='relative';
        if(system&&!card.querySelector(':scope > .rafex-native-system-chip')){var chip=document.createElement('span');chip.className='rafex-native-system-chip';chip.textContent=system==='b2b'?'B2B':system==='mekik2'?'MEKİK':String(system).toUpperCase();card.appendChild(chip);}
      });
    });
  }

  function usedMekikSections(types){
    var byName=new Map(types.map(function(type){return[norm(type.name),type];})),result=new Map(),racks=Array.isArray(window.m2LayoutState?.racks)?m2LayoutState.racks:[];
    racks.forEach(function(rack){var sys=rack.rafexSystem||(rack.b2bLayout||rack.b2b?'b2b':'mekik2');if(sys!=='mekik2')return;var type=byName.get(norm(rack.typeName||rack.name));if(!type)return;var angle=normalizeAngle(rack.angle),key=String(type.id)+'|'+angle;if(!result.has(key))result.set(key,{key:'mekik:'+type.id+':'+angle,name:type.name,typeId:type.id,angle,mode:modeForAngle(angle),drawing:type.drawing});});
    return Array.from(result.values());
  }

  function resetNativeView(view){
    if(!view)return;view.removeAttribute('data-rafex-perspective-hidden');view.removeAttribute('data-rafex-mekik-hidden');view.style.removeProperty('display');
    var svg=view.querySelector(':scope > svg')||view.querySelector('svg');if(!svg)return;
    svg.dataset.rafexNativePositioned='1';svg.style.setProperty('left','50%','important');svg.style.setProperty('top','50%','important');svg.style.setProperty('width','100%','important');svg.style.setProperty('height','100%','important');svg.style.setProperty('object-fit','contain','important');
    return svg;
  }
  function applySettingToSvg(svg,setting){if(!svg)return;svg.style.setProperty('left',(50+setting.x)+'%','important');svg.style.setProperty('top',(50+setting.y)+'%','important');svg.style.setProperty('transform','translate(-50%,-50%) scale('+setting.scale+') rotate('+setting.rotation+'deg)','important');}

  async function restoreMekikNativeOutput(){
    tagCards();var types=await loadMekikTypes(),sections=usedMekikSections(types),settings=readMekikSettings(),byName=new Map();
    sections.forEach(function(section){var key=norm(section.name);if(!byName.has(key))byName.set(key,[]);byName.get(key).push(section);});
    ['m2CorporatePreview','m2CorporatePrint','m2CorporatePrintArea'].forEach(function(hostId){
      var host=document.getElementById(hostId);if(!host)return;
      host.querySelectorAll('.m2-corporate-type-card').forEach(function(card){
        if(card.dataset.rafexSystem!=='mekik2')return;
        card.classList.remove('rafex-perspective-output','rafex-mekik-section-output-card');
        card.querySelectorAll(':scope > .rafex-mekik-sections-grid').forEach(function(node){node.remove();});
        var views=Array.from(card.querySelectorAll(':scope > .m2-corporate-view'));if(!views.length)return;
        views.forEach(function(view){view.removeAttribute('data-rafex-perspective-primary');resetNativeView(view);});
        var cardSections=byName.get(norm(typeNameOfCard(card)))||[],frontSection=cardSections.find(function(section){return section.mode==='front';}),sideSection=cardSections.find(function(section){return section.mode==='side';});
        var frontSvg=resetNativeView(views[0]),sideSvg=resetNativeView(views[1]);
        if(frontSvg&&frontSection)applySettingToSvg(frontSvg,viewSetting(settings[frontSection.key]));
        if(sideSvg&&sideSection)applySettingToSvg(sideSvg,viewSetting(settings[sideSection.key]));
        if(views[0])views[0].dataset.rafexNativeOutput='mekik-front';if(views[1])views[1].dataset.rafexNativeOutput='mekik-side';
      });
    });
  }

  async function applyRegisteredAdapters(){
    tagCards();var types=corporateTypes(),byName=new Map();types.forEach(function(entry){var key=norm(entry.name);if(!byName.has(key))byName.set(key,[]);byName.get(key).push(entry);});
    var jobs=[];['m2CorporatePreview','m2CorporatePrint','m2CorporatePrintArea'].forEach(function(hostId){var host=document.getElementById(hostId);if(!host)return;host.querySelectorAll('.m2-corporate-type-card[data-rafex-system]').forEach(function(card){var system=card.dataset.rafexSystem,adapter=adapters.get(system);if(!adapter)return;var entry=(byName.get(norm(typeNameOfCard(card)))||[]).find(function(item){return systemOf(item)===system;})||null;jobs.push(Promise.resolve(adapter(card,{system,entry})));});});await Promise.allSettled(jobs);
  }

  async function normalizeOutputs(){await restoreMekikNativeOutput();await applyRegisteredAdapters();}
  window.rafexRegisterPdfOutputAdapter=function(system,adapter){if(system&&typeof adapter==='function')adapters.set(String(system),adapter);};
  window.rafexNormalizeNativePdfOutputs=normalizeOutputs;

  try{
    var originalRender=window.m2RenderCorporateReport||m2RenderCorporateReport;
    if(typeof originalRender==='function'){
      var wrappedRender=function(){var result=originalRender.apply(this,arguments);tagCards();setTimeout(tagCards,40);setTimeout(function(){normalizeOutputs();},760);setTimeout(function(){normalizeOutputs();},1180);return result;};
      try{m2RenderCorporateReport=wrappedRender;}catch{}window.m2RenderCorporateReport=wrappedRender;
    }
  }catch(error){console.warn('Native PDF router kurumsal rapor kancasi kurulamadi',error);}

  try{
    var originalPrepare=window.__rafexPrepareCorporatePrint;
    window.__rafexPrepareCorporatePrint=async function(){if(typeof originalPrepare==='function')await originalPrepare.apply(this,arguments);await normalizeOutputs();};
  }catch(error){console.warn('Native PDF router yazdirma kancasi kurulamadi',error);}

  function boot(){tagCards();loadMekikTypes();setTimeout(function(){normalizeOutputs();},900);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();</script>`;

const closing = html.lastIndexOf("</body>");
if (closing < 0) throw new Error("Native system PDF router: </body> bulunamadi.");
html = html.slice(0, closing) + runtime + "\n" + html.slice(closing);

const encoded = Buffer.from(html, "utf8").toString("base64");
worker = worker.replace(match[0], `${match[1]}${match[2]}${encoded}${match[2]}`);
fs.writeFileSync(workerPath, worker);

const finalHtml = Buffer.from(encoded, "base64").toString("utf8");
for (const required of [marker, "rafexRegisterPdfOutputAdapter", "rafexNormalizeNativePdfOutputs", "drawing?.b2b || drawing?.b2bLayout", "rafexSystem=rack.rafexSystem"]) {
  if (!finalHtml.includes(required)) throw new Error(`Native system PDF router dogrulama hatasi: ${required}`);
}
console.log("FINAL: PDF sistem yönlendiricisi aktif; B2B kendi perspektif çıktısını, Mekik kendi ön/yan çıktısını korur; yeni sistemler native adapter ile aynı akışa bağlanır (v1).");
