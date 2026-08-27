import fs from "node:fs";

const file = "dist/server/index.js";
let source = fs.readFileSync(file, "utf8");
const match = source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);
if (!match) throw new Error("HTML_BASE64 not found for common drawing group duplicate v64");
let html = Buffer.from(match[2], "base64").toString("utf8");

html = html.replace(/<script data-rafex-common-group-duplicate="v64">[\s\S]*?<\/script>/g, "");

const runtime = String.raw`
<script data-rafex-common-group-duplicate="v64">
(function(){
  if(window.__rafexCommonGroupDuplicateV64)return;
  window.__rafexCommonGroupDuplicateV64=true;
  var baseDuplicate=typeof m2DuplicateRack==="function"?m2DuplicateRack:null;
  function clonePlain(value){return JSON.parse(JSON.stringify(value))}
  function selectionIds(){try{return Array.from(m2MultiSelect.rackIds||[]).map(Number).filter(Number.isFinite)}catch(_){return[]}}
  function groupBounds(racks){
    var boxes=racks.map(function(rack){return m2RackBounds(rack)}),left=Math.min.apply(null,boxes.map(function(box){return box.left})),right=Math.max.apply(null,boxes.map(function(box){return box.right})),top=Math.min.apply(null,boxes.map(function(box){return box.top})),bottom=Math.max.apply(null,boxes.map(function(box){return box.bottom}));
    return {left:left,right:right,top:top,bottom:bottom,width:right-left,height:bottom-top};
  }
  function duplicateSelectedGroup(){
    var ids=selectionIds();if(ids.length<2)return false;
    var selectedSet=new Set(ids),sources=m2LayoutState.racks.filter(function(rack){return selectedSet.has(Number(rack.id))});if(sources.length<2)return false;
    var stamp=Date.now(),idMap=new Map(),groupMap=new Map(),braceSequence=0;
    sources.forEach(function(rack,index){idMap.set(Number(rack.id),stamp+index)});
    sources.forEach(function(rack){if(rack.joinGroup&&!groupMap.has(rack.joinGroup))groupMap.set(rack.joinGroup,"copy-"+stamp+"-"+groupMap.size)});
    var copies=sources.map(function(rack){
      var copy=clonePlain(rack),newId=idMap.get(Number(rack.id));copy.id=newId;copy.joinGroup=rack.joinGroup?groupMap.get(rack.joinGroup)||null:null;
      copy.sharedFootWith=idMap.has(Number(rack.sharedFootWith))?idMap.get(Number(rack.sharedFootWith)):null;if(!copy.sharedFootWith)copy.sharedFootSide=null;
      if(copy.independentBlockId)copy.independentBlockId="independent-"+newId;
      copy.seismicBraces=(rack.seismicBraces||[]).map(function(brace){var mapped=(brace.rackIds||[]).map(Number).filter(function(id){return idMap.has(id)}).map(function(id){return idMap.get(id)});if(!mapped.length&&brace.type==="light")mapped=[newId];if(!mapped.length)return null;var next=clonePlain(brace);next.id=stamp+10000+(braceSequence++);next.rackIds=mapped;return next}).filter(Boolean);
      copy.freePlacement=false;copy.staged=false;copy.locked=true;return copy;
    });
    var bounds=groupBounds(sources),valid=function(dx,dy){return copies.every(function(copy,index){var sourceRack=sources[index],x=sourceRack.x+dx,y=sourceRack.y+dy;return m2RackInsideArea(copy,x,y,copy.angle)&&!m2RackOverlaps(copy,x,y,copy.angle)})},candidates=[[bounds.width+24,0],[-bounds.width-24,0],[0,bounds.height+24],[0,-bounds.height-24],[24,24]],offset=null;
    candidates.some(function(candidate){if(valid(candidate[0],candidate[1])){offset={dx:candidate[0],dy:candidate[1]};return true}return false});
    if(!offset){for(var y=0;y<=650-bounds.height&&!offset;y+=10)for(var x=0;x<=1000-bounds.width;x+=10){var dx=x-bounds.left,dy=y-bounds.top;if(valid(dx,dy)){offset={dx:dx,dy:dy};break}}}
    if(!offset){$("m2FloorStatus").textContent="Seçili blokların toplu kopyası için çakışmasız boş alan bulunamadı.";return true}
    copies.forEach(function(copy,index){copy.x=sources[index].x+offset.dx;copy.y=sources[index].y+offset.dy});
    var selectedSymbols=m2LayoutSymbols.filter(function(symbol){return m2MultiSelect.symbolIds.has(symbol.id)||selectedSet.has(Number(symbol.rackId))}),symbolIds=new Set(),symbolCopies=selectedSymbols.map(function(symbol,index){var copy=clonePlain(symbol);copy.id=stamp+20000+index;symbolIds.add(copy.id);if(idMap.has(Number(symbol.rackId)))copy.rackId=idMap.get(Number(symbol.rackId));else copy.rackId=null;copy.x=(Number(symbol.x)||0)+offset.dx;copy.y=(Number(symbol.y)||0)+offset.dy;return copy});
    m2PushUndo("Toplu blok çoğaltma");m2LayoutState.racks.push.apply(m2LayoutState.racks,copies);m2LayoutSymbols.push.apply(m2LayoutSymbols,symbolCopies);
    m2MultiSelect.rackIds=new Set(copies.map(function(copy){return copy.id}));m2MultiSelect.symbolIds=symbolIds;m2MultiSelect.active=false;m2MultiSelect.start=null;m2MultiSelect.hover=null;m2LayoutState.selected=copies[0].id;m2SelectedSymbolId=null;
    try{m2SyncAttachedProtections()}catch(_){}$("m2SelectRackButton")?.classList.remove("active");$("m2LayoutSvg")?.classList.remove("m2-multi-selecting");$("m2FloorStatus").textContent=copies.length+" blok, konumları korunarak topluca çoğaltıldı.";m2RenderLayout();try{m2RefreshActiveReport()}catch(_){}return true;
  }
  if(baseDuplicate)m2DuplicateRack=function(){if(duplicateSelectedGroup())return;return baseDuplicate.apply(this,arguments)};
  window.rafexDuplicateSelectedBlocksV64=duplicateSelectedGroup;
})();
</script>`;

const close = html.lastIndexOf("</body>");
if (close < 0) throw new Error("body close missing for common drawing group duplicate v64");
html = html.slice(0, close) + runtime + "\n" + html.slice(close);

for (const required of [
  'data-rafex-common-group-duplicate="v64"',
  "rafexDuplicateSelectedBlocksV64",
  "Toplu blok çoğaltma",
  "konumları korunarak topluca çoğaltıldı",
  "m2MultiSelect.rackIds=new Set",
  "copy.sharedFootWith=idMap.has",
]) if (!html.includes(required)) throw new Error("Common drawing group duplicate v64 missing: " + required);

const encoded = Buffer.from(html).toString("base64");
source = source.slice(0, match.index) + match[0].replace(match[2], encoded) + source.slice(match.index + match[0].length);
fs.writeFileSync(file, source);
console.log("v64: Serbest Cizim toplu secilen bloklari konumlari ve baglari korunarak cogaltir.");
