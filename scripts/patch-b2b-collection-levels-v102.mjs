import fs from "node:fs";
import path from "node:path";

const workerPath = path.join(process.cwd(), "dist/server/index.js");
let worker = fs.readFileSync(workerPath, "utf8");
const match = worker.match(/(const\s+HTML_BASE64\s*=\s*)(["'])([A-Za-z0-9+/=]+)\2/);
if (!match) throw new Error("B2B collection levels v102: HTML_BASE64 bulunamadi");
let html = Buffer.from(match[3], "base64").toString("utf8");

html = html
  .replace(/<style\s+data-rafex-b2b-collection-levels="v102">[\s\S]*?<\/style>\s*/g, "")
  .replace(/<script\s+data-rafex-b2b-collection-levels="v102">[\s\S]*?<\/script>\s*/g, "");

const runtime = String.raw`<style data-rafex-b2b-collection-levels="v102">
#page.b2b-mode .b2b-collection-shell{display:grid;gap:9px;margin-top:9px}
#page.b2b-mode .b2b-collection-card{padding:11px;border:1px solid #d8c4c8;border-radius:10px;background:#fff9fa}
#page.b2b-mode .b2b-collection-head{display:flex;align-items:center;justify-content:space-between;gap:8px}
#page.b2b-mode .b2b-collection-head b{color:#5b111d;font-size:11px}
#page.b2b-mode .b2b-collection-remove{padding:5px 8px;border:0;border-radius:7px;background:#f1e3e6;color:#8b2637;font-size:9px;font-weight:850}
#page.b2b-mode .b2b-collection-base{display:grid;grid-template-columns:1fr 88px;gap:8px;align-items:end;margin-top:10px}
#page.b2b-mode .b2b-collection-base label,#page.b2b-mode .b2b-collection-floor label{display:grid;gap:4px;color:#67434a;font-size:9px;font-weight:850}
#page.b2b-mode .b2b-collection-base input,#page.b2b-mode .b2b-collection-floor input,#page.b2b-mode .b2b-collection-floor select{width:100%;min-height:36px;padding:7px 8px;border:1px solid #d8c6ca;border-radius:8px;background:#fff;color:#351218;font:800 10px Arial,sans-serif}
#page.b2b-mode .b2b-collection-floor{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:9px;padding:9px;border:1px solid #eadcdf;border-radius:9px;background:#fff}
#page.b2b-mode .b2b-collection-floor h4{grid-column:1/-1;margin:0;color:#5b111d;font-size:10px}
#page.b2b-mode .b2b-collection-count{display:grid;grid-template-columns:28px 1fr 28px;gap:4px;align-items:center}
#page.b2b-mode .b2b-collection-count button{min-height:36px;padding:0;border:1px solid #d8c6ca;border-radius:8px;background:#fff;color:#761b2a;font-size:15px;font-weight:900}
#page.b2b-mode .b2b-collection-count input{text-align:center}
#page.b2b-mode .b2b-collection-formula{padding:8px 9px;border-radius:8px;background:#f4e8eb;color:#6b2835;font-size:9px;line-height:1.45}
#page.b2b-mode .b2b-collection-formula b{color:#5b111d}
@media(max-width:520px){#page.b2b-mode .b2b-collection-floor{grid-template-columns:1fr}}
</style>
<script data-rafex-b2b-collection-levels="v102">(function(){
  if(window.__rafexB2BCollectionLevelsV102)return;window.__rafexB2BCollectionLevelsV102=true;
  var ZS={"ZS35|1.5":55,"ZS35|2":55,"ZS55|1.5":75,"ZS55|2":75,"ZS65|1.5":85,"ZS65|2":85};
  var state={enabled:false,groundGap:500,floors:[]},previousFirstPosition='ground',frame=0;
  function freshFloor(){return{trayWidth:300,trayThickness:.8,traverse:"ZS35|1.5",height:500}}
  function clone(value){try{return JSON.parse(JSON.stringify(value))}catch(e){return null}}
  function normalize(raw){
    raw=raw&&typeof raw==='object'?raw:{};var list=Array.isArray(raw.floors)?raw.floors:[];
    return{enabled:raw.enabled===true,groundGap:Math.max(0,Math.min(5000,Number(raw.groundGap)||500)),floors:(list.length?list:[freshFloor()]).slice(0,12).map(function(f){var key=ZS[f&&f.traverse]?f.traverse:"ZS35|1.5",tw=[200,250,300].includes(Number(f&&f.trayWidth))?Number(f.trayWidth):300,th=[.6,.8,1,1.2,1.5].includes(Number(f&&f.trayThickness))?Number(f.trayThickness):.8;return{trayWidth:tw,trayThickness:th,traverse:key,height:Math.max(100,Math.min(5000,Number(f&&f.height)||500))}})};
  }
  function plan(){var s=normalize(state),cursor=s.groundGap,rows=s.floors.map(function(f,index){var bottom=cursor,zsHeight=ZS[f.traverse]||55;cursor+=zsHeight+f.height;return{index:index,bottom:bottom,zsHeight:zsHeight,top:cursor,trayWidth:f.trayWidth,trayThickness:f.trayThickness,traverse:f.traverse,height:f.height}});return{groundGap:s.groundGap,floors:rows,totalHeight:cursor}}
  function fmt(value){return Math.round(Number(value)||0).toLocaleString('tr-TR')}
  function forceTraverse(){if(!state.enabled)return;var input=document.getElementById('b2bFirstPalletPosition');if(input){if(input.value!=='traverse')previousFirstPosition=input.value||'ground';input.value='traverse';var choice=input.closest('.b2b-field')?.querySelector('.b2b-choice');choice?.querySelectorAll('button').forEach(function(button){button.classList.toggle('active',(button.getAttribute('onclick')||'').includes("'traverse'"))})}}
  function notify(){forceTraverse();try{window.b2bApplyInputs?.({target:document.getElementById('b2bCollectionShell'),accessoryChange:true,deferred:true})}catch(error){console.warn('Toplama kati guncelleme',error)}queue()}
  function option(value,label,selected){return'<option value="'+value+'"'+(String(value)===String(selected)?' selected':'')+'>'+label+'</option>'}
  function render(){
    frame=0;var area=document.getElementById('b2bAccessoryArea');if(!area)return false;
    var picker=area.querySelector('.b2b-accessory-picker');if(picker&&!picker.querySelector('[data-b2b-collection-add]'))picker.insertAdjacentHTML('beforeend','<button type="button" data-b2b-collection-add onclick="rafexCollectionEnableV102()">Toplama Katı</button>');
    var shell=document.getElementById('b2bCollectionShell');if(!shell){shell=document.createElement('div');shell.id='b2bCollectionShell';shell.className='b2b-collection-shell';(area.querySelector('#b2bAccessoryList')||area.lastElementChild)?.before(shell)}
    if(!state.enabled){shell.innerHTML='';shell.hidden=true;return true}shell.hidden=false;forceTraverse();var p=plan();
    var floors=state.floors.map(function(f,index){var tray=[300,250,200].map(function(v){return option(v,v+' mm',f.trayWidth)}).join(''),th=[.6,.8,1,1.2,1.5].map(function(v){return option(v,String(v).replace('.',',')+' mm',f.trayThickness)}).join(''),zs=Object.keys(ZS).map(function(v){return option(v,v.replace('|',' · ')+' mm',f.traverse)}).join('');return'<section class="b2b-collection-floor"><h4>'+(index+1)+'. Toplama Katı</h4><label>Tava seçimi<select onchange="rafexCollectionFieldV102('+index+',\'trayWidth\',this.value)">'+tray+'</select></label><label>Kalınlık seçimi<select onchange="rafexCollectionFieldV102('+index+',\'trayThickness\',this.value)">'+th+'</select></label><label>ZS travers seçimi<select onchange="rafexCollectionFieldV102('+index+',\'traverse\',this.value)">'+zs+'</select></label><label>Kat yüksekliği (mm)<input type="number" min="100" max="5000" step="10" value="'+f.height+'" onchange="rafexCollectionFieldV102('+index+',\'height\',this.value)"></label></section>'}).join('');
    var formula=p.floors.map(function(f){return(f.index?'+ ':'')+(f.index===0?fmt(p.groundGap)+' zemin mesafesi + ':'')+fmt(f.zsHeight)+' '+f.traverse.replace('|','/')+' travers + '+fmt(f.height)+' kat yüksekliği'}).join(' ');
    shell.innerHTML='<section class="b2b-collection-card"><div class="b2b-collection-head"><b>Toplama Katı</b><button class="b2b-collection-remove" type="button" onclick="rafexCollectionRemoveV102()">Kaldır</button></div><div class="b2b-collection-base"><label>Z – 1. kat arası mesafe (mm)<input type="number" min="0" max="5000" step="10" value="'+state.groundGap+'" onchange="rafexCollectionGroundV102(this.value)"></label><label>Kat sayısı<div class="b2b-collection-count"><button type="button" onclick="rafexCollectionCountV102(-1)">−</button><input type="number" min="1" max="12" value="'+state.floors.length+'" onchange="rafexCollectionSetCountV102(this.value)"><button type="button" onclick="rafexCollectionCountV102(1)">+</button></div></label></div>'+floors+'<div class="b2b-collection-formula"><b>ZS toplama yüksekliği: '+fmt(p.totalHeight)+' mm</b><br>'+formula+'<br>Sonrasında CC traversli '+fmt(document.getElementById('b2bLevels')?.value||1)+' normal kat başlar.</div></section>';
    return true;
  }
  function queue(){if(!frame)frame=requestAnimationFrame(render)}
  window.rafexCollectionEnableV102=function(){if(!state.floors.length)state.floors=[freshFloor()];state.enabled=true;document.getElementById('b2bAccessoryArea')?.classList.add('open');render();notify()};
  window.rafexCollectionRemoveV102=function(){state.enabled=false;var input=document.getElementById('b2bFirstPalletPosition');if(input)input.value=previousFirstPosition||'ground';render();notify()};
  window.rafexCollectionGroundV102=function(value){state.groundGap=Math.max(0,Math.min(5000,Number(value)||0));render();notify()};
  window.rafexCollectionSetCountV102=function(value){var count=Math.max(1,Math.min(12,Math.round(Number(value)||1)));while(state.floors.length<count)state.floors.push(freshFloor());state.floors=state.floors.slice(0,count);render();notify()};
  window.rafexCollectionCountV102=function(delta){window.rafexCollectionSetCountV102(state.floors.length+(Number(delta)||0))};
  window.rafexCollectionFieldV102=function(index,key,value){var floor=state.floors[index];if(!floor)return;if(key==='traverse'&&ZS[value])floor.traverse=value;else if(key==='trayWidth')floor.trayWidth=[200,250,300].includes(Number(value))?Number(value):300;else if(key==='trayThickness')floor.trayThickness=[.6,.8,1,1.2,1.5].includes(Number(value))?Number(value):.8;else if(key==='height')floor.height=Math.max(100,Math.min(5000,Number(value)||500));render();notify()};
  window.rafexCollectionStateV102=function(){return clone(normalize(state))};window.rafexCollectionPlanV102=plan;
  function wrap(name,make){var current=window[name];if(typeof current!=='function'||current.__rafexCollectionV102)return false;var wrapped=make(current);wrapped.__rafexCollectionV102=true;if(current.__rafexAccessories)wrapped.__rafexAccessories=true;window[name]=wrapped;try{eval(name+'=wrapped')}catch(e){}return true}
  function installHooks(){
    wrap('b2bVerticalLayout',function(base){return function(){var out=base.apply(this,arguments);if(!state.enabled)return out;forceTraverse();var p=plan(),firstLoad=p.totalHeight+out.traverseHeight,automatic=Math.ceil((firstLoad+Math.max(0,out.inputLevels-1)*out.levelStep+(Number(window.b2bLastPalletOverlap)||Number(out.palletHeight)/2))/50)*50,manual=document.getElementById('b2bFootHeightMode')?.value==='manual'&&Number(document.getElementById('b2bFootHeight')?.value)>0;return{...out,levels:out.inputLevels,traverseLevels:out.inputLevels,groundPallet:false,firstLoadBottom:firstLoad,automaticFootHeight:automatic,footHeight:manual?Math.ceil(Number(document.getElementById('b2bFootHeight').value)/50)*50:automatic,collectionHeight:p.totalHeight,collectionFloors:clone(p.floors)}}});
    wrap('b2bReadInputState',function(base){return function(){var out=base.apply(this,arguments);return out?{...out,collectionLevels:clone(normalize(state))}:out}});
    wrap('b2bApplySavedInputState',function(base){return function(saved){state=normalize(saved&&saved.collectionLevels);var result=base.apply(this,arguments);setTimeout(function(){render();notify()},0);return result}});
    wrap('b2b3DOptions',function(base){return function(){var out=base.apply(this,arguments);if(!state.enabled)return{...out,collectionLevels:clone(normalize(state)),collectionFloors:[]};var p=plan(),levels=Math.max(1,Math.round(Number(document.getElementById('b2bLevels')?.value)||1)),cc=Number(out.traverseHeight)||140,pallet=Math.max(300,Number(out.palletHeight)||1200),gap=Math.max(0,Number(out.palletTraverseGap)||0),overlap=Math.max(0,Number(out.lastPalletOverlap)||pallet/2),footHeight=Math.ceil((p.totalHeight+cc+Math.max(0,levels-1)*(pallet+gap+cc)+overlap)/50)*50;return{...out,levels:levels,firstPalletPosition:'traverse',firstFloorGap:p.totalHeight,footHeight:footHeight,collectionLevels:clone(normalize(state)),collectionFloors:clone(p.floors)}}});
    wrap('b2bRefreshSummary',function(base){return function(){var result=base.apply(this,arguments);if(state.enabled){var vertical=window.b2bVerticalLayout?.(),node=document.getElementById('b2bAutoFootHeight');if(node&&vertical)node.textContent=fmt(vertical.footHeight)+' mm'}queue();return result}});
  }
  function metalize(root){root?.traverse?.(function(object){if(!object.isMesh)return;var list=Array.isArray(object.material)?object.material:[object.material],next=list.map(function(source){var material=source.clone();material.color?.setHex?.(0xaeb8bd);material.metalness=.48;material.roughness=.38;return material});object.material=Array.isArray(object.material)?next:next[0]})}
  function patchViewer(viewer){
    if(!viewer||viewer.__rafexCollectionV102)return viewer;viewer.__rafexCollectionV102=true;var base=viewer.addAccessories;if(typeof base!=='function')return viewer;
    viewer.addAccessories=function(section,sectionScale,depthScale){base.apply(this,arguments);var floors=Array.isArray(this.options.collectionFloors)?this.options.collectionFloors:[];if(!floors.length||!this.models?.traverse)return;var layer=new (this.content.constructor)();if(!layer||typeof layer.add!=='function')return;layer.name='B2B ZS Toplama Katlari';var clearLeft=126.70318603515625*sectionScale,clearWidth=this.options.sectionWidth,front=81.59595*depthScale,rear=1077.32687*depthScale,seat=Math.max(100,rear-front),self=this;
      floors.forEach(function(f){var height=Math.max(50,Number(f.zsHeight)||55),bottom=Math.max(0,Number(f.bottom)||0);[81.59595,1077.32687].forEach(function(offset,side){var beam=self.models.traverse.clone(true);beam.name=(f.traverse||'ZS35')+' Toplama '+(Number(f.index)+1)+' '+(side?'Arka':'On');beam.scale.set(sectionScale,depthScale,height/119.97255);beam.position.set(79.15549*sectionScale,offset*depthScale,69.90718*(height/119.97255)-bottom);metalize(beam);layer.add(beam)});if(self.models.tray&&typeof self.accessoryModel==='function'){var cursor=0,pieces=typeof self.trayPiecePlan==='function'?self.trayPiecePlan(clearWidth,f.trayWidth):[];pieces.forEach(function(pieceWidth,pieceIndex){var tray=self.accessoryModel(self.models.tray,{x:pieceWidth,y:seat,z:45},true);tray.name='Toplama Tava '+(Number(f.index)+1)+'-'+(pieceIndex+1)+' · '+String(f.trayThickness).replace('.',',')+' mm';tray.position.set(clearLeft+cursor,front,-(bottom+height));metalize(tray);layer.add(tray);cursor+=pieceWidth})}});section.add(layer)};return viewer;
  }
  function installViewer(){var service=window.RafexB2BViewer;if(!service||typeof service.mount!=='function'||service.mount.__rafexCollectionV102)return false;var base=service.mount,wrapped=function(){return patchViewer(base.apply(this,arguments))};wrapped.__rafexCollectionV102=true;service.mount=wrapped;try{var active=service.getActiveViewer?.();if(active)patchViewer(active)}catch(e){}return true}
  document.addEventListener('click',function(event){if(state.enabled&&event.target?.closest?.('.b2b-field:has(#b2bFirstPalletPosition) .b2b-choice'))setTimeout(function(){forceTraverse();notify()},0)},true);
  new MutationObserver(function(){installHooks();installViewer();queue()}).observe(document.documentElement,{childList:true,subtree:true});
  function boot(){installHooks();installViewer();queue();setTimeout(queue,120);setTimeout(queue,600)}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  window.addEventListener('rafex-b2b-viewer-ready',function(){installHooks();installViewer()});
})();</script>`;

const closing = html.lastIndexOf("</body>");
if (closing < 0) throw new Error("B2B collection levels v102: body bulunamadi");
html = html.slice(0, closing) + runtime + "\n" + html.slice(closing);
for (const required of ['data-rafex-b2b-collection-levels="v102"','Toplama Katı','Z – 1. kat arası mesafe','ZS65|2','trayThickness','collectionFloors']) {
  if (!html.includes(required)) throw new Error("B2B collection levels v102 dogrulama eksigi: " + required);
}
const encoded = Buffer.from(html, "utf8").toString("base64");
worker = worker.replace(match[0], `${match[1]}${match[2]}${encoded}${match[2]}`);
fs.writeFileSync(workerPath, worker);
console.log("v102: B2B aksesuarlarina ZS traversli Toplama Kati eklendi.");
