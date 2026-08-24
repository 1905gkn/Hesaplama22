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
  .rafex-cad-edge-hit{fill:none;stroke:transparent;stroke-width:18;pointer-events:stroke;cursor:pointer}
  .rafex-cad-edge-dialog{width:min(430px,calc(100vw - 32px));border:1px solid #cad5cf;border-radius:14px;padding:0;box-shadow:0 24px 70px #10211955}
  .rafex-cad-edge-dialog::backdrop{background:#10211999}
  .rafex-cad-edge-head{padding:17px 20px;background:#173c2d;color:#fff}
  .rafex-cad-edge-head b{display:block;font-size:15px}.rafex-cad-edge-head small{display:block;margin-top:5px;color:#c6d7cf}
  .rafex-cad-edge-body{display:grid;gap:8px;padding:18px 20px}.rafex-cad-edge-body label{font-size:10px;font-weight:900;color:#536058}.rafex-cad-edge-body input{width:100%;margin-top:6px;padding:11px;border:1px solid #d0d9d4;border-radius:8px;font-size:15px;font-weight:900}
  .rafex-cad-edge-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:0 20px 18px}.rafex-cad-edge-actions button{padding:10px 8px}.rafex-cad-edge-actions .danger{background:#fff0f0;color:#a12626;border:1px solid #e7b7b7}.rafex-cad-edge-actions .draw{background:#e8f6fd;color:#075b87;border:1px solid #9bc9df}
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
  function cadFolderDb(){return new Promise(function(resolve,reject){var request=indexedDB.open('rafex-cad-folders',1);request.onupgradeneeded=function(){if(!request.result.objectStoreNames.contains('handles'))request.result.createObjectStore('handles');};request.onsuccess=function(){resolve(request.result);};request.onerror=function(){reject(request.error);};});}
  async function loadCadFolder(){try{var db=await cadFolderDb();return await new Promise(function(resolve,reject){var tx=db.transaction('handles','readonly'),request=tx.objectStore('handles').get('rafex-export-folder');request.onsuccess=function(){resolve(request.result||null);};request.onerror=function(){reject(request.error);};});}catch(error){return null;}}
  async function saveCadFolder(handle){try{var db=await cadFolderDb();await new Promise(function(resolve,reject){var tx=db.transaction('handles','readwrite');tx.objectStore('handles').put(handle,'rafex-export-folder');tx.oncomplete=resolve;tx.onerror=function(){reject(tx.error);};});}catch(error){}}
  async function chooseCadImport(input){
    if(typeof window.showDirectoryPicker!=='function'||typeof window.showOpenFilePicker!=='function'){input.click();return;}
    try{
      var folder=await loadCadFolder(),permission=folder&&typeof folder.queryPermission==='function'?await folder.queryPermission({mode:'read'}):'prompt';
      if(!folder||String(folder.name||'').toLowerCase()!=='rafex'||permission==='denied'){
        alert('İlk kullanım: Şimdi C:\\Rafex klasörünü seç. Bu izin kaydedilecek ve sonraki aktarımlar doğrudan aynı klasörden açılacak.');
        folder=await window.showDirectoryPicker({id:'rafex-cad-export-folder',mode:'read'});
        if(String(folder?.name||'').toLowerCase()!=='rafex')throw new Error('Lütfen C:\\Rafex klasörünü seç.');
        await saveCadFolder(folder);
      }else if(permission!=='granted'&&typeof folder.requestPermission==='function'){
        permission=await folder.requestPermission({mode:'read'});if(permission!=='granted')throw new Error('C:\\Rafex klasör okuma izni verilmedi.');
      }
      var handles=await window.showOpenFilePicker({id:'rafex-cad-import-file',startIn:folder,multiple:false,types:[{description:'RAFEX CAD JSON',accept:{'application/json':['.json']}}]});
      if(handles&&handles[0])await importFile(await handles[0].getFile());
    }catch(error){if(error?.name==='AbortError')return;status(error?.message||'C:\\Rafex klasörü açılamadı.');alert(error?.message||'C:\\Rafex klasörü açılamadı.');}
  }
  function restoreCad(){try{if(!Array.isArray(m2LayoutState.cadElements)||!m2LayoutState.cadElements.length){var items=(Array.isArray(m2LayoutSymbols)?m2LayoutSymbols:[]).filter(function(item){return item&&item.cadImported&&item.cadElement;});if(items.length)m2LayoutState.cadElements=items.map(function(item){return item.cadElement;});}}catch(error){}}
  function renderCad(){
    restoreCad();var content=document.getElementById('m2LayoutContent');if(!content)return;content.querySelector('.rafex-cad-layer')?.remove();
    var elements=[];try{elements=Array.isArray(m2LayoutState.cadElements)?m2LayoutState.cadElements:[];}catch(error){}
    var ns='http://www.w3.org/2000/svg',layer=document.createElementNS(ns,'g');layer.setAttribute('class','rafex-cad-layer');layer.setAttribute('data-rafex-cad-layer','v56');
    try{var points=Array.isArray(m2LayoutState.points)?m2LayoutState.points:[],breaks=m2LayoutState.pathBreaks||[],edgeCount=m2LayoutState.closed?points.length:Math.max(0,points.length-1);for(var edgeIndex=0;edgeIndex<edgeCount;edgeIndex++){if(!m2LayoutState.closed&&breaks.includes(edgeIndex))continue;var start=points[edgeIndex],end=points[(edgeIndex+1)%points.length],hit=document.createElementNS(ns,'line');hit.setAttribute('x1',start.x);hit.setAttribute('y1',start.y);hit.setAttribute('x2',end.x);hit.setAttribute('y2',end.y);hit.setAttribute('class','rafex-cad-edge-hit');hit.setAttribute('data-cad-edge',String(edgeIndex));layer.appendChild(hit);}var edgeButton=document.getElementById('m2EdgeDimensionsButton');if(edgeButton){edgeButton.textContent='Kenar Uzunluk Bilgisi';edgeButton.title='Kenar uzunluklarını göster veya gizle';}document.querySelectorAll('#m2EdgeEditor .m2-edge-field').forEach(function(field,index){field.hidden=!m2LayoutState.closed&&breaks.includes(index);});}catch(error){}
    elements.forEach(function(element){if(!Array.isArray(element.points)||element.points.length<2)return;var node=document.createElementNS(ns,element.closed&&element.points.length>=3?'polygon':'polyline'),kind=['wall','column','door','obstacle'].includes(element.type)?element.type:'wall';node.setAttribute('points',element.points.map(function(point){return Number(point.x).toFixed(2)+','+Number(point.y).toFixed(2);}).join(' '));node.setAttribute('class','rafex-cad-'+kind);layer.appendChild(node);});
    content.insertBefore(layer,content.firstChild);
  }
  function ensureEdgeDialog(){var dialog=document.getElementById('rafexCadEdgeDialog');if(dialog)return dialog;document.body.insertAdjacentHTML('beforeend','<dialog class="rafex-cad-edge-dialog" id="rafexCadEdgeDialog"><div class="rafex-cad-edge-head"><b>Kenar Uzunluk Bilgisi</b><small>Kenar ölçüsünü değiştirebilir, silebilir veya çift tıkladığın noktadan çizime devam edebilirsin.</small></div><div class="rafex-cad-edge-body"><label>Kenar uzunluğu (mm)<input id="rafexCadEdgeLength" type="number" min="1" step="1"></label></div><div class="rafex-cad-edge-actions"><button type="button" onclick="rafexCloseCadEdgeV57()">Vazgeç</button><button type="button" class="danger" onclick="rafexDeleteCadEdgeV57()">Kenarı Sil</button><button type="button" class="draw" onclick="rafexContinueCadEdgeV58()">Çizime Devam Et</button><button type="button" onclick="rafexApplyCadEdgeV57()">Ölçüyü Uygula</button></div></dialog>');return document.getElementById('rafexCadEdgeDialog');}
  function openEdgeDialog(index,clickPoint){var points=m2LayoutState.points||[],start=points[index],end=points[(index+1)%points.length];if(!start||!end)return;var dx=end.x-start.x,dy=end.y-start.y,length2=dx*dx+dy*dy,t=length2?Math.max(0,Math.min(1,((clickPoint.x-start.x)*dx+(clickPoint.y-start.y)*dy)/length2)):0,anchor={x:start.x+dx*t,y:start.y+dy*t},dialog=ensureEdgeDialog(),input=document.getElementById('rafexCadEdgeLength');dialog.dataset.edge=String(index);dialog.dataset.anchorX=String(anchor.x);dialog.dataset.anchorY=String(anchor.y);input.value=String(Math.max(1,Math.round(Math.hypot(dx,dy)/Math.max(.0001,Number(m2LayoutState.scale)||.04))));dialog.showModal();setTimeout(function(){input.focus();input.select();},20);}
  window.rafexCloseCadEdgeV57=function(){document.getElementById('rafexCadEdgeDialog')?.close();};
  window.rafexApplyCadEdgeV57=function(){var dialog=document.getElementById('rafexCadEdgeDialog'),index=Number(dialog?.dataset.edge),points=m2LayoutState.points||[],start=points[index],end=points[(index+1)%points.length],lengthMm=Math.max(1,Number(document.getElementById('rafexCadEdgeLength')?.value)||1);if(!start||!end)return;var dx=end.x-start.x,dy=end.y-start.y,current=Math.hypot(dx,dy);if(current<.0001)return;var target=lengthMm*Math.max(.0001,Number(m2LayoutState.scale)||.04),ratio=target/current;end.x=start.x+dx*ratio;end.y=start.y+dy*ratio;m2LayoutState.edgeDimensions[index]=true;dialog.close();m2RenderLayout();status((index+1)+'. kenar '+Math.round(lengthMm).toLocaleString('tr-TR')+' mm olarak güncellendi.');};
  window.rafexDeleteCadEdgeV57=function(){var dialog=document.getElementById('rafexCadEdgeDialog'),index=Number(dialog?.dataset.edge);if(!Number.isInteger(index))return;if(!confirm((index+1)+'. kenar silinsin mi?'))return;if(m2LayoutState.closed){var points=m2LayoutState.points||[];m2LayoutState.points=points.slice(index+1).concat(points.slice(0,index+1));m2LayoutState.closed=false;m2LayoutState.openFinished=true;m2LayoutState.pathBreaks=[];m2LayoutState.edgeDimensions=Array(m2LayoutState.points.length).fill(true);}else{m2LayoutState.pathBreaks=Array.from(new Set((m2LayoutState.pathBreaks||[]).concat(index))).sort(function(a,b){return a-b;});m2LayoutState.edgeDimensions[index]=false;}dialog.close();m2RenderLayout();status((index+1)+'. CAD kenarı silindi; diğer çizgiler korundu.');};
  window.rafexContinueCadEdgeV58=function(){var dialog=document.getElementById('rafexCadEdgeDialog'),index=Number(dialog?.dataset.edge),anchor={x:Number(dialog?.dataset.anchorX),y:Number(dialog?.dataset.anchorY)};if(!Number.isInteger(index)||!Number.isFinite(anchor.x)||!Number.isFinite(anchor.y))return;var points=m2LayoutState.points||[];if(m2LayoutState.closed){points=points.concat([{x:points[0].x,y:points[0].y}]);m2LayoutState.points=points;m2LayoutState.closed=false;m2LayoutState.pathBreaks=[];m2LayoutState.edgeDimensions=Array(points.length).fill(true);}m2LayoutState.pathBreaks=(m2LayoutState.pathBreaks||[]).map(function(edge){return edge>index?edge+1:edge;});m2LayoutState.points.splice(index+1,0,anchor);m2LayoutState.edgeDimensions.splice(index+1,0,true);m2LayoutState.drawFromIndex=index+1;m2LayoutState.branchSourceIndex=index+1;m2LayoutState.openFinished=false;m2LayoutState.areaEditMode=true;m2LayoutState.mode='draw';m2LayoutState.hover=null;document.getElementById('m2FreeButton')?.classList.add('active');document.getElementById('m2AreaEditButton')?.classList.add('active');dialog.close();m2RenderLayout();status('Çift tıklanan kenar noktası başlangıç seçildi. İmleçle yönü gösterip ölçüyü yazabilir veya çizim alanına tıklayabilirsin.');};
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
      var areas=objects.filter(function(object){return object.type==='area'&&object.points.length>=2;});if(!areas.length)throw new Error('RAFEX_ALAN sınırı bulunamadı. CAD’de önce Alan Sınırı ile açık veya kapalı bir çizgi oluştur.');var singleClosed=areas.length===1&&areas[0].closed,filterArea=singleClosed?areas[0]:null,nonArea=objects.filter(function(object){return object.type!=='area'&&(!filterArea||touchesArea(object,filterArea.points));}),fitPoints=areas.reduce(function(all,object){return all.concat(object.points);},[]).concat(nonArea.reduce(function(all,object){return all.concat(object.points);},[]));
      var xs=fitPoints.map(function(point){return point.x;}),ys=fitPoints.map(function(point){return point.y;}),minX=Math.min.apply(Math,xs),maxX=Math.max.apply(Math,xs),minY=Math.min.apply(Math,ys),maxY=Math.max.apply(Math,ys),width=Math.max(1,maxX-minX),height=Math.max(1,maxY-minY),scale=Math.min(880/width,530/height),centerX=(minX+maxX)/2,centerY=(minY+maxY)/2,toCanvas=function(point){return{x:500+(point.x-centerX)*scale,y:325-(point.y-centerY)*scale};},layoutPoints=[],pathBreaks=[];
      areas.forEach(function(object){var points=object.points.slice(),first=points[0],last=points[points.length-1];if(singleClosed&&Math.hypot(first.x-last.x,first.y-last.y)<.001)points.pop();else if(!singleClosed&&object.closed&&Math.hypot(first.x-last.x,first.y-last.y)>=.001)points.push({x:first.x,y:first.y});if(layoutPoints.length)pathBreaks.push(layoutPoints.length-1);layoutPoints=layoutPoints.concat(points.map(toCanvas));});
      var imported=nonArea.map(function(object){return{type:object.type,closed:object.closed,points:object.points.map(toCanvas)};});
      m2LayoutState.scale=scale;m2LayoutState.points=layoutPoints;m2LayoutState.pathBreaks=singleClosed?[]:pathBreaks;m2LayoutState.cadElements=imported;m2LayoutState.closed=singleClosed;m2LayoutState.openFinished=!singleClosed;m2LayoutState.areaEditMode=false;m2LayoutState.mode='idle';m2LayoutState.racks=[];m2LayoutState.selected=null;m2LayoutState.edgeDimensions=Array(layoutPoints.length).fill(true);(m2LayoutState.pathBreaks||[]).forEach(function(index){m2LayoutState.edgeDimensions[index]=false;});m2LayoutState.showAreaDimensions=true;try{m2EdgeEditorVisible=true;}catch(error){}collisionSymbols(imported);var widthInput=document.getElementById('m2AreaW'),heightInput=document.getElementById('m2AreaH'),projectInput=document.getElementById('m2ProjectName'),projectName=String(payload?.projectName||'').trim();if(widthInput)widthInput.value=String(Math.round(width));if(heightInput)heightInput.value=String(Math.round(height));if(projectInput&&projectName){projectInput.value=projectName;projectInput.dispatchEvent(new Event('input',{bubbles:true}));projectInput.dispatchEvent(new Event('change',{bubbles:true}));}m2RenderLayout();status((projectName?projectName+' · ':'')+'AutoCAD çiziminden '+areas.length+' ayrı alan çizgisi ve '+imported.length+' RAFEX elemanı aktarıldı. Kenar uzunlukları gösteriliyor.');
    }catch(error){status('AutoCAD aktarımı başarısız: '+(error?.message||'Dosya okunamadı.'));alert(error?.message||'AutoCAD dosyası okunamadı.');}
  }
  function ensureButton(){
    var areaButton=Array.from(document.querySelectorAll('.m2-floor-size button')).find(function(button){return /Alanı Belirle|Define Area|Définir/i.test(button.textContent||'')||String(button.getAttribute('onclick')||'').includes('m2CreateRectangle');});if(!areaButton)return;var grid=areaButton.closest('.m2-floor-size');if(!grid)return;grid.classList.add('rafex-cad-import-grid');var input=grid.querySelector('#m2CadImportInput'),button=grid.querySelector('.rafex-cad-import-button');if(!input){input=document.createElement('input');input.id='m2CadImportInput';input.type='file';input.hidden=true;input.accept='.json,.rafex.json,application/json';input.addEventListener('change',function(){importFile(input.files&&input.files[0]);input.value='';});grid.insertBefore(input,areaButton);}if(!button){button=document.createElement('button');button.type='button';button.className='rafex-cad-import-button';button.addEventListener('click',function(){chooseCadImport(input);});grid.insertBefore(button,areaButton);}button.textContent=buttonLabel();button.title=buttonLabel()+' · C:\\Rafex klasörü ilk seçimden sonra kalıcı olarak hatırlanır.';
  }
  var originalRender=typeof m2RenderLayout==='function'?m2RenderLayout:null;if(originalRender){var wrappedRender=function(){var result=originalRender.apply(this,arguments);renderCad();return result;};try{m2RenderLayout=wrappedRender;}catch(error){}window.m2RenderLayout=wrappedRender;}
  var originalClear=typeof m2ClearLayout==='function'?m2ClearLayout:null;if(originalClear){var wrappedClear=function(){try{m2LayoutState.cadElements=[];}catch(error){}return originalClear.apply(this,arguments);};try{m2ClearLayout=wrappedClear;}catch(error){}window.m2ClearLayout=wrappedClear;}
  var observerQueued=false;new MutationObserver(function(){if(observerQueued)return;observerQueued=true;requestAnimationFrame(function(){observerQueued=false;ensureButton();});}).observe(document.body,{childList:true,subtree:true});ensureButton();renderCad();
  document.addEventListener('dblclick',function(event){var edge=event.target?.closest?.('[data-cad-edge]');if(!edge)return;event.preventDefault();event.stopImmediatePropagation();var point=typeof m2SvgPoint==='function'?m2SvgPoint(event):{x:0,y:0};openEdgeDialog(Number(edge.dataset.cadEdge),point);},true);
  window.rafexImportCadFileV56=importFile;
})();
</script>`;
  const bodyEnd = html.lastIndexOf("</body>");
  if (bodyEnd < 0) throw new Error("CAD v56: body kapanisi bulunamadi.");
  html = html.slice(0, bodyEnd) + runtime + "\n" + html.slice(bodyEnd);
}

for (const required of [marker, "AutoCAD’den Aktar", "rafex_alan:'area'", "pathBreaks.push(layoutPoints.length-1)", "Kenar Uzunluk Bilgisi", "rafexDeleteCadEdgeV57", "rafexContinueCadEdgeV58", "rafex-cad-folders", "showDirectoryPicker", "payload?.projectName", "window.rafexImportCadFileV56"]) {
  if (!html.includes(required)) throw new Error(`CAD v56 dogrulama hatasi: ${required}`);
}

const encoded = Buffer.from(html, "utf8").toString("base64");
const payloadOffset = match.index + match[0].indexOf(match[2]);
worker = worker.slice(0, payloadOffset) + encoded + worker.slice(payloadOffset + match[2].length);
fs.writeFileSync(workerPath, worker);
console.log("CAD v56: AutoCAD RAFEX alan aktarimi Serbest Cizim'e eklendi.");
