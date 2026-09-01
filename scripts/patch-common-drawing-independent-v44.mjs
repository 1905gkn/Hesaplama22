import fs from "node:fs";
import path from "node:path";

const workerPath = path.join(process.cwd(), "dist/server/index.js");
let worker = fs.readFileSync(workerPath, "utf8");
const match = worker.match(/(const\s+HTML_BASE64\s*=\s*)(["'])([A-Za-z0-9+/=]+)\2/);
if (!match) throw new Error("Common drawing v44: HTML_BASE64 bulunamadi");

let html = Buffer.from(match[3], "base64").toString("utf8");
html = html
  .replace(/<style\s+data-rafex-common-independent="v44">[\s\S]*?<\/style>\s*/g, "")
  .replace(/<script\s+data-rafex-common-independent="v44">[\s\S]*?<\/script>\s*/g, "");

const runtime = String.raw`<style data-rafex-common-independent="v44">
#page.rafex-common-independent .rafex-free-mode-note{align-items:flex-start!important;padding:12px 14px!important;border:1px solid #b9d0c0!important;border-left:6px solid #173c2d!important;background:#f2f7f3!important}
#page.rafex-common-independent .rafex-free-mode-note b{white-space:nowrap;color:#173c2d!important}
#page.rafex-common-independent .m2-floor-editor{border:2px solid #b9d0c0!important;border-radius:13px!important;box-shadow:0 10px 26px rgba(23,60,45,.08)!important;background:#fff!important}
#page.rafex-common-independent .m2-saved-types{border-color:#b9d0c0!important;background:#fbfdfb!important}
.rafex-common-pair-gap .m2-rack-distance{stroke:#e09b00!important;stroke-width:2!important;stroke-dasharray:6 4!important}
.rafex-common-pair-gap .m2-measure-hit{fill:transparent!important;stroke:none!important;cursor:pointer!important;pointer-events:all!important}
.rafex-common-pair-gap .m2-rack-distance-label{fill:#6f4700!important;font:900 8.5px Arial!important;paint-order:stroke!important;stroke:#fff!important;stroke-width:2.5px!important;cursor:pointer!important;pointer-events:auto!important}
.rafex-common-system-badge{display:inline-flex!important;align-items:center!important;justify-content:center!important;min-width:42px!important;margin-right:6px!important;padding:3px 6px!important;border-radius:999px!important;background:#173c2d!important;color:#fff!important;font-size:8px!important;font-weight:950!important;letter-spacing:.04em!important}
.rafex-v19-type-card[data-rafex-system="mekik2"] .rafex-common-system-badge{background:#315f88!important}
.rafex-v19-type-card[data-rafex-system="mr"] .rafex-common-system-badge{background:#8a6300!important}
.rafex-v19-type-card[data-rafex-system="b2b"] .rafex-common-system-badge{background:#173c2d!important}
.rafex-section-list .rafex-mekik-section-divider{display:none!important}
.rafex-section-list button[data-rafex-system="mekik2"] .rafex-common-system-badge{background:#315f88!important}
.rafex-section-list button[data-rafex-system="mr"] .rafex-common-system-badge{background:#8a6300!important}
.rafex-common-cut-label{font-weight:950!important;color:#0b2b45!important}
</style><script data-rafex-common-independent="v44">(function(){
  if(window.__rafexCommonIndependentV44)return;
  window.__rafexCommonIndependentV44=true;

  var SYSTEM_LABELS={b2b:'B2B',mekik2:'MEKİK',mr:'MR',drive:'DRIVE-IN',konsol:'KONSOL'};
  var SYSTEM_ORDER={b2b:0,mekik2:1,mr:2,drive:3,konsol:4};
  var COLORS=['#d9485f','#2878d0','#138a62','#9b51c8','#e07a18','#087f8c','#b43f8d','#65731f'];
  var catalog=[];
  var catalogLoading=null;
  var catalogLoadedAt=0;
  var pdfTimer=0;
  var modalTimer=0;
  var syncingPdf=false;
  var pinnedPairGaps=new Set();

  function isFree(){
    var page=document.getElementById('page');
    return !!(page&&(page.dataset.rafexFreeDrawing==='1'||page.classList.contains('rafex-free-drawing-page')));
  }
  function letter(number){
    var n=Math.max(1,Number(number)||1),value='';
    while(n>0){n-=1;value=String.fromCharCode(65+n%26)+value;n=Math.floor(n/26);}
    return value;
  }
  function letterNo(value){
    var text=String(value||'').trim().toUpperCase(),number=0;
    if(!/^[A-Z]+$/.test(text))return 999999;
    for(var i=0;i<text.length;i+=1)number=number*26+text.charCodeAt(i)-64;
    return number;
  }
  function systemOf(value){
    var drawing=value&&value.drawing||value||{};
    var raw=String(value&&value.__rafexSystem||value&&value.rafexSystem||drawing.rafexSystem||'').toLowerCase();
    if(raw)return raw;
    if(drawing.b2b&&drawing.b2b.mr===true||drawing.plan&&drawing.plan.mr===true||drawing.systemType==='mr')return 'mr';
    if(drawing.b2bLayout||drawing.b2b)return 'b2b';
    return 'mekik2';
  }
  function systemLabel(key){return SYSTEM_LABELS[key]||String(key||'RAF').toUpperCase();}
  function colorFor(value){
    var index=letterNo(value);
    if(index!==999999)return COLORS[(index-1)%COLORS.length];
    var text=String(value||'RAF'),hash=0;
    for(var i=0;i<text.length;i+=1)hash=(hash*31+text.charCodeAt(i))>>>0;
    return COLORS[hash%COLORS.length];
  }
  function entryKey(entry){return entry?String(entry.__rafexSystem||systemOf(entry))+':'+String(entry.id==null?'':entry.id):'';}
  function status(text){var box=document.getElementById('m2FloorStatus');if(box)box.textContent=text;}
  function createdTime(entry){var value=Date.parse(entry&&entry.createdAt||entry&&entry.created_at||'');return Number.isFinite(value)?value:0;}
  function originalName(entry){return String(entry&&entry.__rafexOriginalName||entry&&entry.name||'Raf').trim();}

  var previousTypeColor=typeof m2TypeColor==='function'?m2TypeColor:null;
  function commonTypeColor(name){return /^[A-Z]+$/.test(String(name||'').trim().toUpperCase())?colorFor(name):(previousTypeColor?previousTypeColor(name):colorFor(name));}
  try{m2TypeColor=commonTypeColor}catch(error){}
  window.m2TypeColor=commonTypeColor;

  function normalizeCatalogEntry(entry,system){
    var copy={};Object.keys(entry||{}).forEach(function(key){copy[key]=entry[key]});
    copy.__rafexOriginalName=String(entry&&entry.name||'Raf').trim();
    copy.__rafexSystem=system;
    copy.__rafexSystemLabel=systemLabel(system);
    copy.__rafexApi=system==='mekik2'||system==='drive'?'/api/mekik2-types':'/api/b2b-types';
    copy.__rafexUnified=true;
    return copy;
  }
  function validEntry(entry){return !!(entry&&entry.id&&entry.name&&entry.drawing&&entry.drawing.plan);}
  function isMrEntry(entry){var d=entry&&entry.drawing||{};return d.systemType==='mr'||d.b2b&&d.b2b.mr===true||d.plan&&d.plan.mr===true;}
  async function loadCatalog(force){
    if(!isFree())return [];
    if(catalogLoading)return catalogLoading;
    if(!force&&catalog.length&&Date.now()-catalogLoadedAt<2500){installCatalog();return catalog;}
    catalogLoading=(async function(){
      var settled=await Promise.allSettled([req('/api/b2b-types'),req('/api/mekik2-types')]);
      var merged=[];
      if(settled[0].status==='fulfilled'){
        var b2bRows=Array.isArray(settled[0].value&&settled[0].value.types)?settled[0].value.types:[];
        b2bRows.filter(validEntry).forEach(function(entry){merged.push(normalizeCatalogEntry(entry,isMrEntry(entry)?'mr':'b2b'));});
      }
      if(settled[1].status==='fulfilled'){
        var mekikRows=Array.isArray(settled[1].value&&settled[1].value.types)?settled[1].value.types:[];
        mekikRows.filter(validEntry).forEach(function(entry){merged.push(normalizeCatalogEntry(entry,String(entry&&entry.drawing&&entry.drawing.rafexSystem||'').toLowerCase()==='drive'?'drive':'mekik2'));});
      }
      merged.sort(function(a,b){
        var time=createdTime(a)-createdTime(b);if(time)return time;
        var system=(SYSTEM_ORDER[a.__rafexSystem]||0)-(SYSTEM_ORDER[b.__rafexSystem]||0);if(system)return system;
        return (Number(a.typeNo)||Number(a.id)||0)-(Number(b.typeNo)||Number(b.id)||0);
      });
      merged.forEach(function(entry,index){
        entry.name=letter(index+1);
        entry.__rafexGlobalLetter=entry.name;
        entry.drawing=Object.assign({},entry.drawing,{rafexSystem:entry.__rafexSystem,rafexSystemLabel:entry.__rafexSystemLabel,rafexCatalogKey:entryKey(entry),rafexOriginalTypeName:entry.__rafexOriginalName,rafexGlobalTypeLetter:entry.name});
      });
      catalog=merged;catalogLoadedAt=Date.now();installCatalog();
      status('Kayıtlı tipler ortak sıraya alındı: '+catalog.map(function(entry){return entry.name+' '+entry.__rafexSystemLabel;}).join(' · '));
      return catalog;
    })();
    try{return await catalogLoading;}finally{catalogLoading=null;}
  }
  function installCatalog(){
    if(!isFree())return;
    var selected=Array.isArray(m2SavedRackTypes)?m2SavedRackTypes[m2SelectedSavedType]:null;
    var selectedKey=entryKey(selected);
    m2SavedRackTypes=catalog.slice().sort(function(a,b){return letterNo(a.name)-letterNo(b.name);});
    var index=selectedKey?m2SavedRackTypes.findIndex(function(entry){return entryKey(entry)===selectedKey;}):-1;
    m2SelectedSavedType=m2SavedRackTypes.length?(index>=0?index:0):null;
    if(typeof m2RenderSavedRackTypes==='function')m2RenderSavedRackTypes();
  }

  var previousRefresh=typeof m2RefreshSavedRackTypes==='function'?m2RefreshSavedRackTypes:null;
  async function commonRefresh(){if(isFree())return loadCatalog(true);return previousRefresh?previousRefresh.apply(this,arguments):[];}
  try{m2RefreshSavedRackTypes=commonRefresh}catch(error){}
  window.m2RefreshSavedRackTypes=commonRefresh;
  window.rafexUnifiedCatalogSync=function(){if(isFree())loadCatalog(false).catch(function(error){console.warn('Ortak katalog yuklenemedi',error);status(error&&error.message||'Kayıtlı raf tipleri getirilemedi.');});};
  window.rafexUnifiedDeleteSavedRackType=async function(index){
    if(!isFree())return;
    var entry=m2SavedRackTypes[index];if(!entry)return;
    if(!confirm(entry.name+' · '+entry.__rafexSystemLabel+' raf tipini silmek istediğinizden emin misiniz?'))return;
    try{await req(entry.__rafexApi+'/'+Number(entry.id),{method:'DELETE',body:'{}'});catalog=catalog.filter(function(item){return entryKey(item)!==entryKey(entry);});catalogLoadedAt=0;await loadCatalog(true);status(entry.name+' · '+entry.__rafexSystemLabel+' silindi.');}
    catch(error){status(error&&error.message||'Raf tipi silinemedi.');}
  };
  async function deleteAllCommon(){
    if(!isFree()&&typeof previousDeleteAll==='function')return previousDeleteAll.apply(this,arguments);
    if(!catalog.length){status('Silinecek kayıtlı raf tipi yok.');return;}
    if(!confirm('B2B, Mekik, Drive-In ve MR altındaki TÜM kayıtlı raf tiplerini silmek istediğinizden emin misiniz?'))return;
    try{await Promise.all([req('/api/b2b-types',{method:'DELETE',body:'{}'}),req('/api/mekik2-types',{method:'DELETE',body:'{}'})]);catalog=[];m2SavedRackTypes=[];m2SelectedSavedType=null;if(typeof m2RenderSavedRackTypes==='function')m2RenderSavedRackTypes();status('Tüm sistemlerdeki kayıtlı raf tipleri silindi.');}
    catch(error){status(error&&error.message||'Kayıtlı raf tipleri silinemedi.');}
  }
  var previousDeleteAll=typeof m2DeleteAllSavedRackTypes==='function'?m2DeleteAllSavedRackTypes:null;
  try{m2DeleteAllSavedRackTypes=deleteAllCommon}catch(error){}
  window.m2DeleteAllSavedRackTypes=deleteAllCommon;

  function rackSignature(rack){
    var system=systemOf(rack),source=String(rack.rafexOriginalTypeName||rack.typeName||rack.name||'Raf').trim(),block=String(rack.blockName||'').trim();
    return [system,source,block,Math.round(Number(rack.widthMm)||0),Math.round(Number(rack.depthMm)||0),Number(rack.bays)||0,Number(rack.levels)||0,Number(rack.depth)||0,Number(rack.b2bLayout&&rack.b2bLayout.palletCount)||0,Number(rack.b2bLayout&&rack.b2bLayout.rowCount)||0].join('|');
  }
  function savedLetterForRack(rack){
    var direct=String(rack&&rack.rafexGlobalTypeLetter||'').trim().toUpperCase();
    if(/^[A-Z]+$/.test(direct))return direct;
    var key=String(rack&&rack.rafexCatalogKey||''),entry=key&&catalog.find(function(item){return entryKey(item)===key;});
    var saved=String(entry&&entry.name||'').trim().toUpperCase();
    return /^[A-Z]+$/.test(saved)?saved:'';
  }
  function layoutGroups(apply){
    var groups=[],map=new Map(),racks=Array.isArray(m2LayoutState&&m2LayoutState.racks)?m2LayoutState.racks:[];
    racks.forEach(function(rack,index){
      if(!rack)return;
      if(!rack.rafexOriginalTypeName)rack.rafexOriginalTypeName=String(rack.typeName||rack.name||'Raf').trim();
      var key=rackSignature(rack),group=map.get(key),savedLetter=savedLetterForRack(rack);
      if(!group){group={key:key,letter:savedLetter||letter(groups.length+1),system:systemOf(rack),first:index,racks:[]};map.set(key,group);groups.push(group);}
      group.racks.push(rack);
    });
    if(apply!==false)groups.forEach(function(group){group.racks.forEach(function(rack){rack.typeName=group.letter;rack.typeColor=colorFor(group.letter);rack.rafexSystem=group.system;rack.rafexSystemLabel=systemLabel(group.system);rack.rafexSectionLetter=group.letter;if(!rack.rafexGlobalTypeLetter&&savedLetterForRack(rack))rack.rafexGlobalTypeLetter=group.letter;});});
    return groups;
  }

  var previousAddRack=typeof m2AddRack==='function'?m2AddRack:null;
  function commonAddRack(drawing,typeName){
    if(!previousAddRack)return;
    if(!isFree())return previousAddRack.apply(this,arguments);
    var selected=Array.isArray(m2SavedRackTypes)?m2SavedRackTypes[m2SelectedSavedType]:null;
    var chosen=selected&&(!drawing||selected.drawing===drawing||entryKey(selected)===String(drawing&&drawing.rafexCatalogKey||''))?selected:null;
    var system=chosen?chosen.__rafexSystem:systemOf(drawing||{}),before=Array.isArray(m2LayoutState&&m2LayoutState.racks)?m2LayoutState.racks.length:0;
    var result=previousAddRack.call(this,drawing,typeName);
    var racks=Array.isArray(m2LayoutState&&m2LayoutState.racks)?m2LayoutState.racks:[];
    racks.slice(before).forEach(function(rack){rack.rafexSystem=system;rack.rafexSystemLabel=systemLabel(system);rack.rafexCatalogKey=chosen?entryKey(chosen):String(drawing&&drawing.rafexCatalogKey||'');rack.rafexOriginalTypeName=chosen?chosen.__rafexOriginalName:String(typeName||rack.typeName||systemLabel(system));rack.rafexGlobalTypeLetter=chosen?chosen.name:String(drawing&&drawing.rafexGlobalTypeLetter||typeName||'');});
    layoutGroups(true);
    return result;
  }
  if(previousAddRack){try{m2AddRack=commonAddRack}catch(error){}window.m2AddRack=commonAddRack;}
  function commonAddSelected(){
    if(!isFree()&&typeof previousAddSelected==='function')return previousAddSelected.apply(this,arguments);
    var entry=m2SavedRackTypes[m2SelectedSavedType];if(!entry){status('Önce kayıtlı bir raf tipi seç.');return;}
    var before=m2LayoutState.racks.length;commonAddRack(entry.drawing,entry.name);if(m2LayoutState.racks.length>before)status(entry.name+' · '+entry.__rafexSystemLabel+' ortak çizim alanına eklendi.');
  }
  var previousAddSelected=typeof m2AddSelectedSavedRack==='function'?m2AddSelectedSavedRack:null;
  try{m2AddSelectedSavedRack=commonAddSelected}catch(error){}
  window.m2AddSelectedSavedRack=commonAddSelected;

  function pairCandidate(a,b){
    if(!a||!b||Number(a.id)===Number(b.id)||a.joinGroup&&b.joinGroup===a.joinGroup)return null;
    var A=m2CombinedRackBounds(a),B=m2RackBounds(b),candidates=[];
    var y1=Math.max(A.top,B.top),y2=Math.min(A.bottom,B.bottom),x1=Math.max(A.left,B.left),x2=Math.min(A.right,B.right),candidate;
    if(A.right<=B.left&&y1<=y2){candidate=m2ClearRackGapLine(a,b,'right',A.right,B.left,y1,y2);if(candidate)candidates.push(candidate);}
    if(B.right<=A.left&&y1<=y2){candidate=m2ClearRackGapLine(a,b,'left',A.left,B.right,y1,y2);if(candidate)candidates.push(candidate);}
    if(A.bottom<=B.top&&x1<=x2){candidate=m2ClearRackGapLine(a,b,'bottom',A.bottom,B.top,x1,x2);if(candidate)candidates.push(candidate);}
    if(B.bottom<=A.top&&x1<=x2){candidate=m2ClearRackGapLine(a,b,'top',A.top,B.bottom,x1,x2);if(candidate)candidates.push(candidate);}
    candidates.sort(function(first,second){return first.distance-second.distance;});
    var best=candidates[0];if(!best)return null;
    best.a=a;best.b=b;best.clearanceMm=m2RackClearanceMm(a,b,best.direction);return best;
  }
  function roughPairBounds(a,b,A,B){
    if(!a||!b||!A||!B||Number(a.id)===Number(b.id)||a.joinGroup&&b.joinGroup===a.joinGroup)return null;
    var y1=Math.max(A.top,B.top),y2=Math.min(A.bottom,B.bottom),x1=Math.max(A.left,B.left),x2=Math.min(A.right,B.right);
    if(A.right<=B.left&&y1<=y2)return {direction:'right',distance:B.left-A.right};
    if(B.right<=A.left&&y1<=y2)return {direction:'left',distance:A.left-B.right};
    if(A.bottom<=B.top&&x1<=x2)return {direction:'bottom',distance:B.top-A.bottom};
    if(B.bottom<=A.top&&x1<=x2)return {direction:'top',distance:A.top-B.bottom};
    return null;
  }
  function allPairs(){
    var racks=Array.isArray(m2LayoutState&&m2LayoutState.racks)?m2LayoutState.racks:[],unique=new Map(),byId=new Map(),combinedBounds=new Map(),rackBounds=new Map(),focusIds=new Set();
    racks.forEach(function(rack){var id=Number(rack&&rack.id);if(!Number.isFinite(id))return;byId.set(id,rack);combinedBounds.set(id,m2CombinedRackBounds(rack));rackBounds.set(id,m2RackBounds(rack));});
    var selectedId=Number(m2LayoutState&&m2LayoutState.selected);if(Number.isFinite(selectedId)&&byId.has(selectedId))focusIds.add(selectedId);
    pinnedPairGaps.forEach(function(key){String(key).split(':').map(Number).filter(Number.isFinite).forEach(function(id){if(byId.has(id))focusIds.add(id);});});
    Array.from(focusIds).forEach(function(id){var a=byId.get(id);if(!a)return;
      var nearest={};
      racks.forEach(function(b){var bId=Number(b&&b.id),rough=roughPairBounds(a,b,combinedBounds.get(id),rackBounds.get(bId)),current=rough&&nearest[rough.direction];if(rough&&(!current||rough.distance<current.distance))nearest[rough.direction]={distance:rough.distance,b:b};});
      Object.keys(nearest).forEach(function(direction){var target=nearest[direction].b,pair=pairCandidate(a,target);if(!pair)return;var first=Math.min(Number(a.id),Number(target.id)),second=Math.max(Number(a.id),Number(target.id)),key=first+':'+second;if(!unique.has(key))unique.set(key,pair);});
    });
    pinnedPairGaps.forEach(function(key){var ids=String(key).split(':').map(Number),a=byId.get(ids[0]),b=byId.get(ids[1]),pair=pairCandidate(a,b);if(pair&&!unique.has(key))unique.set(key,pair);});
    return Array.from(unique.values());
  }
  function pairKey(pair){var first=Math.min(Number(pair.a.id),Number(pair.b.id)),second=Math.max(Number(pair.a.id),Number(pair.b.id));return first+':'+second;}
  function pairMm(pair){var scale=Math.max(.000001,Number(m2LayoutState.scale)||0);return Math.max(0,Math.round(pair.distance/scale)-Number(pair.clearanceMm||0));}
  function pairTouches(pair,rackId){return Number(pair.a.id)===Number(rackId)||Number(pair.b.id)===Number(rackId);}
  function renderPairControls(pairs){
    var wallEditor=document.getElementById('m2WallEditor'),rack=typeof m2MeasurementRack==='function'?m2MeasurementRack():null;if(!wallEditor||!rack)return;
    Array.from(wallEditor.querySelectorAll('label')).forEach(function(label){var span=label.querySelector('span');if(span&&String(span.textContent||'').trim()==='En yakın raf arası')label.remove();});
    var rackPairs=pairs.filter(function(pair){return pairTouches(pair,rack.id);}).sort(function(a,b){var order={left:0,right:1,top:2,bottom:3};return (order[a.direction]||0)-(order[b.direction]||0)||a.distance-b.distance;});
    if(m2PinnedDimensions&&m2PinnedDimensions.gap&&rackPairs[0]){pinnedPairGaps.add(pairKey(rackPairs[0]));m2PinnedDimensions.gap=false;}
    rackPairs.forEach(function(pair,index){
      var label=document.createElement('label'),key=pairKey(pair),mm=pairMm(pair);label.className='m2-edge-field dimension-field';label.dataset.rafexPairField=key;
      label.innerHTML='<input type="checkbox" '+(pinnedPairGaps.has(key)?'checked':'')+' onchange="rafexToggleRackPairGap('+pair.a.id+','+pair.b.id+',this.checked)" aria-label="Raf arası '+(index+1)+' ölçüsünü göster"><span>Raf arası '+(index+1)+'</span><input type="number" min="0" step="1" value="'+mm+'" oninput="event.stopPropagation()" onchange="rafexSetRackPairDistance('+pair.a.id+','+pair.b.id+',this.value,'+rack.id+')" aria-label="Raf arası '+(index+1)+' mesafesi milimetre">';
      wallEditor.appendChild(label);
    });
  }
  function renderPairGuides(pairs){
    if(!isFree()||m2LayoutState.drag||window.m2SymbolDrag||window.m2DimensionDrag)return;
    var layer=document.getElementById('m2LayoutContent');if(!layer)return;
    layer.querySelectorAll('.m2-distance-guide[data-rack-gap],.rafex-common-pair-gap').forEach(function(node){node.remove();});
    var activeId=m2LayoutState.selected,currentKeys=new Set(pairs.map(pairKey));pinnedPairGaps.forEach(function(key){if(!currentKeys.has(key))pinnedPairGaps.delete(key);});
    var visible=pairs.filter(function(pair){return activeId!=null&&pairTouches(pair,activeId)||pinnedPairGaps.has(pairKey(pair));});
    var markup=visible.map(function(pair){
      var mm=pairMm(pair),mx=(pair.ax+pair.bx)/2,my=(pair.ay+pair.by)/2,key='pair-gap:'+pair.a.id+':'+pair.b.id,label=m2DimensionPosition(key,mx,my-8),moveId=activeId!=null&&pairTouches(pair,activeId)?activeId:pair.b.id;
      return '<g class="m2-distance-guide rafex-common-pair-gap" data-rack-gap="'+mm+'" data-gap-a="'+pair.a.id+'" data-gap-b="'+pair.b.id+'"><line x1="'+pair.ax+'" y1="'+pair.ay+'" x2="'+pair.bx+'" y2="'+pair.by+'" class="m2-rack-distance"/><circle cx="'+pair.ax+'" cy="'+pair.ay+'" r="4" fill="#e09b00"/><circle cx="'+pair.bx+'" cy="'+pair.by+'" r="4" fill="#e09b00"/><rect x="'+(label.x-52)+'" y="'+(label.y-14)+'" width="104" height="22" rx="5" class="m2-measure-hit" onpointerdown="event.preventDefault();event.stopPropagation();rafexPromptRackPairDistance('+pair.a.id+','+pair.b.id+','+mm+','+moveId+')"/><text x="'+label.x+'" y="'+label.y+'" text-anchor="middle" class="m2-rack-distance-label m2-dimension-movable" data-dimension-key="'+key+'" data-dimension-axis="'+(Math.abs(pair.ax-pair.bx)<Math.abs(pair.ay-pair.by)?'vertical':'horizontal')+'" onpointerdown="event.preventDefault();event.stopPropagation();rafexPromptRackPairDistance('+pair.a.id+','+pair.b.id+','+mm+','+moveId+')">RAF ARASI '+fmt(mm)+' mm</text></g>';
    }).join('');
    if(markup)layer.insertAdjacentHTML('beforeend',markup);
  }
  function setPairDistance(aId,bId,value,moveId){
    var a=m2LayoutState.racks.find(function(rack){return Number(rack.id)===Number(aId);}),b=m2LayoutState.racks.find(function(rack){return Number(rack.id)===Number(bId);});
    var pair=pairCandidate(a,b);if(!pair)return;
    var moving=Number(moveId)===Number(a.id)?a:b,moveA=moving===a,scale=Math.max(.000001,Number(m2LayoutState.scale)||0),desired=(Math.max(0,Number(value)||0)+Number(pair.clearanceMm||0))*scale,delta=desired-pair.distance,nextX=moving.x,nextY=moving.y;
    if(pair.direction==='right')nextX+=moveA?-delta:delta;if(pair.direction==='left')nextX+=moveA?delta:-delta;if(pair.direction==='bottom')nextY+=moveA?-delta:delta;if(pair.direction==='top')nextY+=moveA?delta:-delta;
    if(typeof m2PushUndo==='function')m2PushUndo('Raf arası ölçü');
    if(!m2MoveRackOrJoinedGroup(moving,nextX,nextY)){if(typeof m2DiscardUndo==='function')m2DiscardUndo();status('Girilen raf arası ölçüsü alan dışına çıkıyor veya başka bir rafla çakışıyor.');}
    else status('Seçilen iki rafın arası '+fmt(Math.max(0,Number(value)||0))+' mm yapıldı.');
    m2RenderLayout();
  }
  window.rafexSetRackPairDistance=setPairDistance;
  window.rafexToggleRackPairGap=function(aId,bId,visible){var key=Math.min(Number(aId),Number(bId))+':'+Math.max(Number(aId),Number(bId));if(visible)pinnedPairGaps.add(key);else pinnedPairGaps.delete(key);m2RenderLayout();};
  window.rafexPromptRackPairDistance=function(aId,bId,current,moveId){
    if(typeof m2OpenMeasureEditor!=='function')return;
    m2OpenMeasureEditor('Seçilen iki rafın arası',current,function(value){setPairDistance(aId,bId,value,moveId);});
  };

  var previousRender=typeof m2RenderLayout==='function'?m2RenderLayout:null;
  function commonRender(){
    if(isFree())layoutGroups(true);
    var result=previousRender?previousRender.apply(this,arguments):undefined;
    if(isFree()){var pairs=allPairs();renderPairControls(pairs);renderPairGuides(pairs);}
    return result;
  }
  if(previousRender){try{m2RenderLayout=commonRender}catch(error){}window.m2RenderLayout=commonRender;}

  function decorateIndependent(){
    var page=document.getElementById('page');if(!page)return;
    page.classList.toggle('rafex-common-independent',isFree());
    if(!isFree())return;
    var note=page.querySelector('.rafex-free-mode-note'),noteHtml='<b>BAĞIMSIZ ORTAK ÇİZİM ALANI</b><span>Sistem seçimi yalnız üstteki modül girdilerini değiştirir. Alan, kayıtlı tip sırası, ölçüler, renkler ve PDF kesit sırası bütün sistemler için ortaktır.</span>';
    if(note&&note.dataset.rafexCommonNote!=='v44'){note.dataset.rafexCommonNote='v44';if(note.innerHTML!==noteHtml)note.innerHTML=noteHtml;}
  }

  function groupByLetter(){var map=new Map();layoutGroups(true).forEach(function(group){map.set(group.letter,group);});return map;}
  function syncPdfHost(host){
    if(!host)return;
    var groupMap=groupByLetter(),cards=Array.from(host.querySelectorAll('.rafex-v19-type-card,.m2-corporate-type-card'));
    cards.forEach(function(card,index){
      var raw=String(card.dataset.rafexTypeName||card.querySelector('.rafex-v19-card-head span')&&card.querySelector('.rafex-v19-card-head span').textContent||'').trim().split(/\s+/)[0].toUpperCase();
      var group=groupMap.get(raw)||Array.from(groupMap.values())[index];if(!group)return;
      var color=colorFor(group.letter),label=systemLabel(group.system),head=card.querySelector('.rafex-v19-card-head');
      card.dataset.rafexTypeName=group.letter;card.dataset.rafexSystem=group.system;card.style.setProperty('--m2-type-color',color);card.style.borderLeftColor=color;
      if(head){var span=head.querySelector('span');if(span&&span.textContent!==group.letter+' · '+label)span.textContent=group.letter+' · '+label;var badge=head.querySelector('.rafex-common-system-badge');if(!badge){badge=document.createElement('small');badge.className='rafex-common-system-badge';head.appendChild(badge);}if(badge.textContent!==label)badge.textContent=label;}
    });
    var pages=Array.from(host.querySelectorAll(':scope>.rafex-v19-type-page')),ordered=cards.filter(function(card){return card.classList.contains('rafex-v19-type-card');}).sort(function(a,b){return letterNo(a.dataset.rafexTypeName)-letterNo(b.dataset.rafexTypeName);});
    if(pages.length&&ordered.length){pages.forEach(function(page,index){var grid=page.querySelector('.rafex-v19-type-grid');if(!grid)return;var wanted=ordered.slice(index*2,index*2+2),current=Array.from(grid.children),same=current.length===wanted.length&&current.every(function(card,i){return card===wanted[i];});if(!same)grid.replaceChildren.apply(grid,wanted);var shouldHide=index*2>=ordered.length;if(page.hidden!==shouldHide)page.hidden=shouldHide;});}
    var cutIndex=0;
    ordered.forEach(function(card){
      var label=systemLabel(card.dataset.rafexSystem),special=Array.from(card.querySelectorAll('.rafex-mekik-output-section'));
      var views=special.length?special:Array.from(card.querySelectorAll(':scope>.rafex-v19-view')).filter(function(view){return view.dataset.rafexMekikHidden!=='1'&&view.style.display!=='none';});
      views.forEach(function(view){cutIndex+=1;var cut=letter(cutIndex),title=view.querySelector('.rafex-v19-view-title,.rafex-mekik-output-label');if(title){var base=String(title.textContent||'GÖRÜNÜŞ').replace(/^KESİT\s+[A-Z]+\s+·\s+[^·]+\s+·\s+/i,'').replace(/^MEKİK\s+·\s+/i,'');var text='KESİT '+cut+' · '+label+' · '+base;if(title.textContent!==text)title.textContent=text;title.classList.add('rafex-common-cut-label');}view.dataset.rafexGlobalCut=cut;});
    });
  }
  function syncPdf(){
    if(syncingPdf)return;syncingPdf=true;
    try{['m2CorporatePreview','m2CorporatePrint','m2CorporatePrintArea'].forEach(function(id){syncPdfHost(document.getElementById(id));});}
    finally{syncingPdf=false;}
  }
  function schedulePdf(delay){clearTimeout(pdfTimer);pdfTimer=setTimeout(syncPdf,delay||30);}

  var previousCorporate=typeof m2RenderCorporateReport==='function'?m2RenderCorporateReport:null;
  if(previousCorporate){var commonCorporate=function(){if(isFree())layoutGroups(true);var result=previousCorporate.apply(this,arguments);schedulePdf(40);setTimeout(syncPdf,420);setTimeout(syncPdf,1150);setTimeout(syncPdf,3250);return result;};try{m2RenderCorporateReport=commonCorporate}catch(error){}window.m2RenderCorporateReport=commonCorporate;}

  function buttonTypeInfo(button){
    if(button.dataset.rafexTypeLetter){return {system:button.dataset.rafexSystem||'b2b',typeLetter:button.dataset.rafexTypeLetter,sort:letterNo(button.dataset.rafexTypeLetter),detail:button.dataset.rafexSectionDetail||''};}
    var groups=layoutGroups(true),b=button.querySelector('b'),text=String(b&&b.childNodes&&b.childNodes[0]&&b.childNodes[0].textContent||b&&b.textContent||'').trim(),mekik=button.classList.contains('rafex-mekik-section-entry');
    if(mekik){var original=text.split('·')[0].trim(),entry=catalog.find(function(item){return item.__rafexSystem==='mekik2'&&item.__rafexOriginalName===original;});return {system:'mekik2',typeLetter:entry&&entry.name||original,sort:letterNo(entry&&entry.name||original),detail:String(b&&b.querySelector('small')&&b.querySelector('small').textContent||'')};}
    var type=text.split('·')[0].trim().split(/\s+/).pop().toUpperCase(),group=groups.find(function(item){return item.letter===type;});return {system:group&&group.system||'b2b',typeLetter:group&&group.letter||type,sort:letterNo(group&&group.letter||type),detail:''};
  }
  function normalizeSectionModal(){
    var modal=document.getElementById('m2SectionPlacementModal'),list=modal&&modal.querySelector('[data-rafex-section-list]');if(!list)return;
    list.querySelectorAll('.rafex-mekik-section-divider').forEach(function(node){node.hidden=true;});
    var buttons=Array.from(list.querySelectorAll('button')).map(function(button,index){return {button:button,info:buttonTypeInfo(button),index:index};});
    buttons=buttons.filter(function(item){if(!item.button.classList.contains('rafex-mekik-section-entry')&&item.info.system==='mekik2'){item.button.remove();return false;}return true;});
    buttons.sort(function(a,b){return a.info.sort-b.info.sort||a.index-b.index;});
    var wantedOrder=buttons.map(function(item){return item.button;}),currentOrder=Array.from(list.querySelectorAll('button')),sameOrder=currentOrder.length===wantedOrder.length&&currentOrder.every(function(button,index){return button===wantedOrder[index];});
    buttons.forEach(function(item,index){
      var sectionLetter=letter(index+1),button=item.button,b=button.querySelector('b'),round=button.querySelector(':scope>span:first-child'),label=systemLabel(item.info.system);
      button.dataset.rafexGlobalSectionLetter=sectionLetter;button.dataset.rafexSystem=item.info.system;button.dataset.rafexTypeLetter=item.info.typeLetter;button.dataset.rafexSectionDetail=item.info.detail||'';if(round&&round.textContent!==sectionLetter)round.textContent=sectionLetter;
      if(b){var small=b.querySelector('small'),detail=item.info.detail||String(small&&small.textContent||''),wanted='<span class="rafex-common-system-badge">'+label+'</span>'+sectionLetter+' · '+item.info.typeLetter+' TİPİ'+(detail?'<small>'+detail+'</small>':'');if(b.innerHTML!==wanted)b.innerHTML=wanted;}
    });
    if(!sameOrder)wantedOrder.forEach(function(button){list.appendChild(button);});
  }
  function scheduleModal(delay){clearTimeout(modalTimer);modalTimer=setTimeout(normalizeSectionModal,delay||20);}
  document.addEventListener('click',function(event){
    var sectionButton=event.target.closest&&event.target.closest('[data-rafex-section-list] button');
    if(sectionButton){var cut=sectionButton.dataset.rafexGlobalSectionLetter,label=systemLabel(sectionButton.dataset.rafexSystem),type=sectionButton.dataset.rafexTypeLetter;setTimeout(function(){var title=document.querySelector('[data-rafex-active-section]'),mekikTitle=document.querySelector('[data-rafex-mekik-title]'),cardTitle=document.querySelector('[data-rafex-mekik-card-title]'),meta=document.querySelector('[data-rafex-mekik-meta-section]'),text=cut+' · '+label+' · '+type+' TİPİ';if(title&&!title.hidden)title.textContent=text;if(mekikTitle&&!mekikTitle.closest('[hidden]'))mekikTitle.textContent=text;if(cardTitle&&!cardTitle.closest('[hidden]'))cardTitle.textContent='KESİT '+cut+' · '+label;if(meta&&!meta.closest('[hidden]'))meta.textContent='Kesit '+cut;},30);}
    if(event.target.closest&&event.target.closest('#m2SectionPlacementButton')){setTimeout(normalizeSectionModal,80);setTimeout(normalizeSectionModal,560);}
    if(event.target.closest&&event.target.closest('input[name="rafexUnifiedSystem"],.rafex-system-option'))setTimeout(function(){decorateIndependent();loadCatalog(false);},0);
  },true);

  var observer=new MutationObserver(function(records){
    var needsPdf=false,needsModal=false,needsDecorate=false;
    records.forEach(function(record){var target=record.target&&record.target.nodeType===1?record.target:record.target&&record.target.parentElement;if(!target)return;if(target.id==='m2CorporatePreview'||target.closest&&target.closest('#m2CorporatePreview,#m2CorporatePrint,#m2CorporatePrintArea'))needsPdf=true;if(target.id==='m2SectionPlacementModal'||target.closest&&target.closest('#m2SectionPlacementModal'))needsModal=true;if(!(target.closest&&target.closest('.rafex-free-mode-note'))&&(target.id==='page'||target.closest&&target.closest('#page')))needsDecorate=true;});
    if(needsPdf)schedulePdf(20);if(needsModal)scheduleModal(20);if(needsDecorate)decorateIndependent();
  });
  function boot(){decorateIndependent();if(document.body)observer.observe(document.body,{childList:true,subtree:true});if(isFree()){loadCatalog(true);layoutGroups(true);if(typeof m2RenderLayout==='function')m2RenderLayout();}schedulePdf(120);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();</script>`;

const bodyEnd = html.lastIndexOf("</body>");
if (bodyEnd < 0) throw new Error("Common drawing v44: body bulunamadi");
html = html.slice(0, bodyEnd) + runtime + "\n" + html.slice(bodyEnd);

for (const required of [
  'data-rafex-common-independent="v44"',
  'BAĞIMSIZ ORTAK ÇİZİM ALANI',
  'rafexPromptRackPairDistance',
  'rafexGlobalSectionLetter',
  'rafexGlobalTypeLetter',
  'savedLetterForRack',
  'KESİT '
]) if (!html.includes(required)) throw new Error(`Common drawing v44: dogrulama eksik: ${required}`);

const encoded = Buffer.from(html, "utf8").toString("base64");
worker = worker.slice(0, match.index) + match[1] + match[2] + encoded + match[2] + worker.slice(match.index + match[0].length);
fs.writeFileSync(workerPath, worker);
console.log("v44: Ortak Cizim bagimsiz; tum raf aralari duzenlenebilir, tipler ve kesitler sistemden bagimsiz alfabetik siradadir.");
