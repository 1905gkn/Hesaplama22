import fs from "node:fs";
import path from "node:path";

const workerPath = path.join(process.cwd(), "dist/server/index.js");
let worker = fs.readFileSync(workerPath, "utf8");
const match = worker.match(/(const\s+HTML_BASE64\s*=\s*)(["'])([A-Za-z0-9+/=]+)\2/);
if (!match) throw new Error("B2B collection products v110: HTML_BASE64 bulunamadi");
let html = Buffer.from(match[3], "base64").toString("utf8");

html = html.replace(/<script\s+data-rafex-b2b-collection-products="v110">[\s\S]*?<\/script>\s*/g, "");

const runtime = String.raw`<script data-rafex-b2b-collection-products="v110">(function(){
  if(window.__rafexB2BCollectionProductsV110)return;
  window.__rafexB2BCollectionProductsV110=true;
  var MARK='data-rafex-collection-product-v110';
  function low(value){return String(value||'').toLocaleLowerCase('tr-TR')}
  function fmtDecimal(value){return String(Number(value)||0).replace('.',',')}
  function rowCount(d){return Math.max(1,Number(d&&d.b2bLayout&&d.b2bLayout.rowCount)||(d&&d.b2b&&d.b2b.rowType==='double'?2:1))}
  function clearWidth(d){return Math.max(0,Math.round(Number(d&&d.b2bLayout&&d.b2bLayout.sectionWidth)||Number(d&&d.totalWidth)||0))}
  function trayCount(clear,width){clear=Math.max(0,Math.round(Number(clear)||0));width=[200,250,300].includes(Number(width))?Number(width):300;var full=Math.floor(clear/width),rem=clear-full*width;return full+(rem>=50?1:0)}
  function collectionRows(entry,labels){
    var d=entry&&entry.drawing?entry.drawing:entry||{},collection=d&&d.b2b&&d.b2b.collectionLevels;
    if(!collection||collection.enabled!==true||!Array.isArray(collection.floors))return [];
    var multiplier=Math.max(1,Number(entry&&entry.rackCount)||1),rows=rowCount(d),clear=clearWidth(d),unit=labels&&labels.unitEach||'adet',map=new Map();
    function add(item,spec,qty){qty=Math.max(0,Math.round(Number(qty)||0));if(!qty)return;var key=low(item)+'|'+low(spec),current=map.get(key)||{item:item,spec:spec,code:spec,qty:0,unit:unit};current.qty+=qty;map.set(key,current)}
    collection.floors.forEach(function(floor){
      var traverse=String(floor&&floor.traverse||'ZS55|1.5').split('|'),traverseType=traverse[0]||'ZS55',traverseThickness=Number(traverse[1])||1.5;
      var trayWidth=[200,250,300].includes(Number(floor&&floor.trayWidth))?Number(floor.trayWidth):300,trayThickness=Number(floor&&floor.trayThickness)||.8;
      add('Toplama Katı ZS Travers',traverseType+' · '+fmtDecimal(traverseThickness)+' mm · L '+clear.toLocaleString('tr-TR')+' mm',2*rows*multiplier);
      add('Toplama Katı Tava',trayWidth+' mm · '+fmtDecimal(trayThickness)+' mm',trayCount(clear,trayWidth)*rows*multiplier);
    });
    return Array.from(map.values());
  }
  window.rafexB2BCollectionProductRowsV110=collectionRows;
  function isCollectionRow(row){return /^toplama katı (zs travers|tava)/.test(low(row&& (row.item||row.name)))}
  function mergeBom(rows,extras){var out=(Array.isArray(rows)?rows:[]).filter(function(row){return !isCollectionRow(row)}).map(function(row){return Object.assign({},row)});extras.forEach(function(extra){var found=out.find(function(row){return low(row&&row.item)===low(extra.item)&&low(row&&row.spec)===low(extra.spec)});if(found)found.qty=(Number(found.qty)||0)+extra.qty;else out.push(Object.assign({},extra))});return out}
  function mergeLayout(rows,extras){var out=(Array.isArray(rows)?rows:[]).filter(function(row){return !isCollectionRow(row)}).map(function(row){return Object.assign({},row)});extras.forEach(function(extra){var row={name:extra.item,spec:extra.spec,qty:extra.qty,unit:extra.unit},found=out.find(function(item){return low(item&&item.name)===low(row.name)&&low(item&&item.spec)===low(row.spec)});if(found)found.qty=(Number(found.qty)||0)+row.qty;else out.push(row)});return out}
  try{
    var baseBom=window.m2CorporateBomRows;
    if(typeof baseBom==='function'&&!baseBom.__rafexCollectionProductsV110){var bom=function(entry,labels){return mergeBom(baseBom.apply(this,arguments),collectionRows(entry,labels||{unitEach:'adet'}))};bom.__rafexCollectionProductsV110=true;window.m2CorporateBomRows=bom;try{m2CorporateBomRows=bom}catch(e){}}
  }catch(error){console.warn('Toplama katı PDF ürünleri',error)}
  try{
    var baseDirect=window.m2DirectLayoutProductRows;
    if(typeof baseDirect==='function'&&!baseDirect.__rafexCollectionProductsV110){var direct=function(systemFilter){var rows=baseDirect.apply(this,arguments);if(systemFilter&&systemFilter!=='b2b')return rows;var extras=[];try{(m2LayoutState&&m2LayoutState.racks||[]).filter(function(rack){return !!(rack&&rack.b2bLayout)&&!(rack&&rack.b2b&&rack.b2b.mr)}).forEach(function(rack){extras=extras.concat(collectionRows({drawing:rack,rackCount:1},{unitEach:'adet'}))})}catch(e){}return mergeLayout(rows,extras)};direct.__rafexCollectionProductsV110=true;window.m2DirectLayoutProductRows=direct;try{m2DirectLayoutProductRows=direct}catch(e){}}
  }catch(error){console.warn('Toplama katı yerleşim ürünleri',error)}
  function nativeRows(){var state=null;try{state=typeof b2bReadInputState==='function'?b2bReadInputState():null}catch(e){}if(!state)return[];var clear=0;try{clear=Number(b2bPalletGeometry&&b2bPalletGeometry().sectionWidth)||0}catch(e){}return collectionRows({drawing:{b2b:state,b2bLayout:{rowCount:state.rowType==='double'?2:1,sectionWidth:clear}},rackCount:1},{unitEach:'adet'})}
  function refresh(){
    var host=document.getElementById('m2Parts');if(host){host.querySelectorAll('['+MARK+']').forEach(function(node){node.remove()});nativeRows().forEach(function(row){var div=document.createElement('div');div.className='m2-part';div.setAttribute(MARK,'1');div.innerHTML='<span>'+row.item+' · '+row.spec+'</span><b>'+Math.round(row.qty).toLocaleString('tr-TR')+' adet</b>';host.appendChild(div)})}
    try{if(document.getElementById('page')&&document.getElementById('page').classList.contains('rafex-free-drawing-page')&&typeof m2RenderLayoutProductList==='function')m2RenderLayoutProductList()}catch(e){}
  }
  ['rafexCollectionAdd','rafexCollectionRemove','rafexCollectionAddFloor','rafexCollectionRemoveFloor','rafexCollectionSet','rafexCollectionEnableV102','rafexCollectionRemoveV102','rafexCollectionGroundV102','rafexCollectionSetCountV102','rafexCollectionCountV102','rafexCollectionFieldV102'].forEach(function(name){try{var base=window[name];if(typeof base!=='function'||base.__rafexCollectionProductsV110)return;var wrapped=function(){var result=base.apply(this,arguments);setTimeout(refresh,0);setTimeout(refresh,80);return result};wrapped.__rafexCollectionProductsV110=true;window[name]=wrapped}catch(e){}});
  document.addEventListener('change',function(event){if(event.target&&event.target.closest&&event.target.closest('.b2b-collection-card'))setTimeout(refresh,0)},true);
  setTimeout(refresh,0);setTimeout(refresh,250);
})();</script>`;

const runtimeScript = runtime.match(/<script[^>]*>([\s\S]*)<\/script>/);
if (!runtimeScript) throw new Error("B2B collection products v110: runtime script bulunamadi");
new Function(runtimeScript[1]);

const closing = html.lastIndexOf("</body>");
if (closing < 0) throw new Error("B2B collection products v110: body kapanisi bulunamadi");
html = html.slice(0, closing) + runtime + "\n" + html.slice(closing);
for (const required of ['data-rafex-b2b-collection-products="v110"','Toplama Katı ZS Travers','Toplama Katı Tava','collectionLevels','trayThickness']) {
  if (!html.includes(required)) throw new Error("B2B collection products v110 dogrulama eksigi: " + required);
}
const encoded = Buffer.from(html, "utf8").toString("base64");
worker = worker.replace(match[0], `${match[1]}${match[2]}${encoded}${match[2]}`);
fs.writeFileSync(workerPath, worker);
console.log("v110: Toplama katı ZS travers ve tava tip/adetleri ürün listesi ile PDF dökümüne bağlandı.");
