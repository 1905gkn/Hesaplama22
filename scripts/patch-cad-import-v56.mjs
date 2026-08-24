import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const workerPath = path.join(root, "dist/server/index.js");
let worker = fs.readFileSync(workerPath, "utf8");
const match = worker.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);
if (!match) throw new Error("CAD v56: HTML_BASE64 bulunamadi.");
let html = Buffer.from(match[2], "base64").toString("utf8");
const marker = 'data-rafex-cad-import="v56"';

if (!html.includes(marker)) {
  const runtime = String.raw`
<style ${marker}>
  .m2-floor-size.rafex-cad-import-grid{grid-template-columns:120px 120px auto auto!important}
  .rafex-cad-import-button{min-height:42px;margin:0;padding:11px 14px;border:1px solid #1b78a8;border-radius:8px;background:#e8f6fd;color:#075b87;font-size:10px;font-weight:900;white-space:nowrap;cursor:pointer}
  .rafex-cad-layer{pointer-events:none}
  .rafex-cad-wall{fill:none;stroke:#111;stroke-width:2.2;stroke-linecap:square;stroke-linejoin:miter}
  .rafex-cad-column{fill:#7d8790;fill-opacity:.8;stroke:#39444d;stroke-width:1.8}
  .rafex-cad-door{fill:none;stroke:#247aa6;stroke-width:2.2;stroke-dasharray:7 4}
  .rafex-cad-obstacle{fill:#f2b900;fill-opacity:.2;stroke:#9b7100;stroke-width:2;stroke-dasharray:6 3}
  #m2LayoutContent [data-symbol^="cad-import-"]{display:none!important}
</style>
<script ${marker}>
(function(){
  if(window.__rafexCadImportV56)return;window.__rafexCadImportV56=true;
  var seq=0;
  function esc(value){return String(value).replace(/[&<>"']/g,function(char){return({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[char];});}
  function polygonArea(points){var total=0;for(var i=0;i<points.length;i++){var a=points[i],b=points[(i+1)%points.length];total+=a.x*b.y-b.x*a.y;}return Math.abs(total)/2;}
  function pointInPolygon(point,polygon){var inside=false;for(var i=0,j=polygon.length-1;i<polygon.length;j=i++){var a=polygon[i],b=polygon[j],cross=(point.x-a.x)*(b.y-a.y)-(point.y-a.y)*(b.x-a.x);if(Math.abs(cross)<.001&&point.x>=Math.min(a.x,b.x)-.001&&point.x<=Math.max(a.x,b.x)+.001&&point.y>=Math.min(a.y,b.y)-.001&&point.y<=Math.max(a.y,b.y)+.001)return true;if((a.y>point.y)!==(b.y>point.y)&&point.x<(b.x-a.x)*(point.y-a.y)/(b.y-a.y)+a.x)inside=!inside;}return inside;}
  function touchesArea(object,area){if(object.points.some(function(point){return pointInPolygon(point,area);} ))return true;for(var i=0;i<object.points.length-1;i++){var a=object.points[i],b=object.points[i+1];if(pointInPolygon({x:(a.x+b.x)/2,y:(a.y+b.y)/2},area))return true;}return false;}
  function status(message){var node=document.getElementById('m2FloorStatus');if(node)node.textContent=message;}
  function language(){var value=String(document.documentElement.lang||localStorage.getItem('language')||localStorage.getItem('rafexLanguage')||'tr').toLowerCase();return value.startsWith('fr')?'fr':value.startsWith('en')?'en':'tr';}
  function buttonLabel(){return language()==='fr'?'Importer depuis AutoCAD':language()==='en'?'Import from AutoCAD':'AutoCAD’den Aktar';}
  function restoreCad(){try{if(!Array.isArray(m2LayoutState.cadElements)||!m2LayoutState.cadElements.length){var items=(Array.isArray(m2LayoutSymbols)?m2LayoutSymbols:[]).filter(function(item){return item&&item.cadImported&&item.cadElement;});if(items.length)m2LayoutState.cadElements=items.map(function(item){return item.cadElement;});}}catch(error){}}
  function renderCad(){
    restoreCad();var content=document.getElementById('m2LayoutContent');if(!content)return;content.querySelector('.rafex-cad-layer')?.remove();
    var elements=[];try{elements=Array.isArray(m2LayoutState.cadElements)?m2LayoutState.cadElements:[];}catch(error){}
    if(!elements.length)return;var ns='http://www.w3.org/2000/svg',layer=document.createElementNS(ns,'g');layer.setAttribute('class','rafex-cad-layer');layer.setAttribute('data-rafex-cad-layer','v56');
    elements.forEach(function(element){if(!Array.isArray(element.points)||element.points.length<2)return;var node=document.createElementNS(ns,element.closed&&element.points.length>=3?'polygon':'polyline'),kind=['wall','column','door','obstacle'].includes(element.type)?element.type:'wall';node.setAttribute('points',element.points.map(function(point){return Number(point.x).toFixed(2)+','+Number(point.y).toFixed(2);}).join(' '));node.setAttribute('class','rafex-cad-'+kind);layer.appendChild(node);});
    content.insertBefore(layer,content.firstChild);
  }
  function collisionSymbols(elements){
    var old=[];try{old=Array.isArray(m2LayoutSymbols)?m2LayoutSymbols.filter(function(item){return !item?.cadImported;}):[];}catch(error){}
    var additions=elements.filter(function(element){return element.type==='column'||element.type==='obstacle';}).map(function(element){var xs=element.points.map(function(point){return point.x;}),ys=element.points.map(function(point){return point.y;}),x=Math.min.apply(Math,xs),y=Math.min.apply(Math,ys),w=Math.max(2,Math.max.apply(Math,xs)-x),h=Math.max(2,Math.max.apply(Math,ys)-y);return{id:'cad-import-'+Date.now()+'-'+(++seq),type:element.type==='column'?'column':'barrier',x:x,y:y,w:w,h:h,angle:0,cadImported:true,cadElement:element};});
    try{m2LayoutSymbols=old.concat(additions);}catch(error){}
  }
  async function importFile(file){
    if(!file)return;try{
      if(file.size>10*1024*1024)throw new Error('Dosya 10 MB sınırını aşıyor.');var payload=JSON.parse(await file.text());if(String(payload?.unit||'').toLowerCase()!=='mm')throw new Error('Çizim birimi mm olmalıdır.');if(!Array.isArray(payload?.objects))throw new Error('Geçerli RAFEX çizim verisi bulunamadı.');
      var typeMap={area:'area',wall:'wall',column:'column',door:'door',obstacle:'obstacle',rafex_alan:'area',rafex_duvar:'wall',rafex_kolon:'column',rafex_kapi:'door',rafex_engel:'obstacle'};
      var objects=payload.objects.slice(0,5000).map(function(object){var raw=String(object?.type||object?.layer||'').trim().toLowerCase(),type=typeMap[raw],points=Array.isArray(object?.points)?object.points.slice(0,10000).map(function(point){return{x:Number(point?.[0]),y:Number(point?.[1])};}).filter(function(point){return Number.isFinite(point.x)&&Number.isFinite(point.y);}):[];return{type:type,closed:Boolean(object?.closed),points:points};}).filter(function(object){return object.type&&object.points.length>=2;});
      var areas=objects.filter(function(object){return object.type==='area'&&object.closed&&object.points.length>=3;});if(!areas.length)throw new Error('Kapalı RAFEX_ALAN sınırı bulunamadı. CAD’de önce Alan Sınırı ile alanı işaretle.');areas.sort(function(a,b){return polygonArea(b.points)-polygonArea(a.points);});var area=areas[0],areaPoints=area.points.slice(),first=areaPoints[0],last=areaPoints[areaPoints.length-1];if(areaPoints.length>3&&Math.hypot(first.x-last.x,first.y-last.y)<.001)areaPoints.pop();
      var xs=areaPoints.map(function(point){return point.x;}),ys=areaPoints.map(function(point){return point.y;}),minX=Math.min.apply(Math,xs),maxX=Math.max.apply(Math,xs),minY=Math.min.apply(Math,ys),maxY=Math.max.apply(Math,ys),width=Math.max(1,maxX-minX),height=Math.max(1,maxY-minY),scale=Math.min(880/width,530/height),centerX=(minX+maxX)/2,centerY=(minY+maxY)/2,toCanvas=function(point){return{x:500+(point.x-centerX)*scale,y:325-(point.y-centerY)*scale};};
      var imported=objects.filter(function(object){return object!==area&&object.type!=='area'&&touchesArea(object,areaPoints);}).map(function(object){return{type:object.type,closed:object.closed,points:object.points.map(toCanvas)};});
      m2LayoutState.scale=scale;m2LayoutState.points=areaPoints.map(toCanvas);m2LayoutState.pathBreaks=[];m2LayoutState.cadElements=imported;m2LayoutState.closed=true;m2LayoutState.openFinished=false;m2LayoutState.areaEditMode=false;m2LayoutState.mode='idle';m2LayoutState.racks=[];m2LayoutState.selected=null;collisionSymbols(imported);var widthInput=document.getElementById('m2AreaW'),heightInput=document.getElementById('m2AreaH');if(widthInput)widthInput.value=String(Math.round(width));if(heightInput)heightInput.value=String(Math.round(height));m2RenderLayout();status('AutoCAD çiziminden 1 alan ve '+imported.length+' RAFEX elemanı aktarıldı; alan dışındaki nesneler alınmadı.');
    }catch(error){status('AutoCAD aktarımı başarısız: '+(error?.message||'Dosya okunamadı.'));alert(error?.message||'AutoCAD dosyası okunamadı.');}
  }
  function ensureButton(){
    var areaButton=Array.from(document.querySelectorAll('.m2-floor-size button')).find(function(button){return /Alanı Belirle|Define Area|Définir/i.test(button.textContent||'')||String(button.getAttribute('onclick')||'').includes('m2CreateRectangle');});if(!areaButton)return;var grid=areaButton.closest('.m2-floor-size');if(!grid)return;grid.classList.add('rafex-cad-import-grid');var input=grid.querySelector('#m2CadImportInput'),button=grid.querySelector('.rafex-cad-import-button');if(!input){input=document.createElement('input');input.id='m2CadImportInput';input.type='file';input.hidden=true;input.accept='.json,.rafex.json,application/json';input.addEventListener('change',function(){importFile(input.files&&input.files[0]);input.value='';});grid.insertBefore(input,areaButton);}if(!button){button=document.createElement('button');button.type='button';button.className='rafex-cad-import-button';button.addEventListener('click',function(){input.click();});grid.insertBefore(button,areaButton);}button.textContent=buttonLabel();button.title=buttonLabel();
  }
  var originalRender=typeof m2RenderLayout==='function'?m2RenderLayout:null;if(originalRender){var wrappedRender=function(){var result=originalRender.apply(this,arguments);renderCad();return result;};try{m2RenderLayout=wrappedRender;}catch(error){}window.m2RenderLayout=wrappedRender;}
  var originalClear=typeof m2ClearLayout==='function'?m2ClearLayout:null;if(originalClear){var wrappedClear=function(){try{m2LayoutState.cadElements=[];}catch(error){}return originalClear.apply(this,arguments);};try{m2ClearLayout=wrappedClear;}catch(error){}window.m2ClearLayout=wrappedClear;}
  var observerQueued=false;new MutationObserver(function(){if(observerQueued)return;observerQueued=true;requestAnimationFrame(function(){observerQueued=false;ensureButton();renderCad();});}).observe(document.body,{childList:true,subtree:true});ensureButton();renderCad();
  window.rafexImportCadFileV56=importFile;
})();
</script>`;
  const bodyEnd = html.lastIndexOf("</body>");
  if (bodyEnd < 0) throw new Error("CAD v56: body kapanisi bulunamadi.");
  html = html.slice(0, bodyEnd) + runtime + "\n" + html.slice(bodyEnd);
}

for (const required of [marker, "AutoCAD’den Aktar", "rafex_alan:'area'", "touchesArea(object,areaPoints)", "window.rafexImportCadFileV56"]) {
  if (!html.includes(required)) throw new Error(`CAD v56 dogrulama hatasi: ${required}`);
}

const encoded = Buffer.from(html, "utf8").toString("base64");
const payloadOffset = match.index + match[0].indexOf(match[2]);
worker = worker.slice(0, payloadOffset) + encoded + worker.slice(payloadOffset + match[2].length);
fs.writeFileSync(workerPath, worker);
console.log("CAD v56: AutoCAD RAFEX alan aktarimi Serbest Cizim'e eklendi.");
