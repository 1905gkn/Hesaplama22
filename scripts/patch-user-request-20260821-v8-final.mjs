import fs from "node:fs";
import path from "node:path";

const workerPath = path.join(process.cwd(), "dist/server/index.js");
let worker = fs.readFileSync(workerPath, "utf8");
const match = worker.match(/(const\s+HTML_BASE64\s*=\s*)(["'])([A-Za-z0-9+/=]+)\2/);
if (!match) throw new Error("v8-final HTML_BASE64 bulunamadi");
let html = Buffer.from(match[3], "base64").toString("utf8");
html = html
  .replace(/<style\s+data-rafex-user-request-v8="1">[\s\S]*?<\/style>\s*/g, "")
  .replace(/<script\s+data-rafex-user-request-v8="1">[\s\S]*?<\/script>\s*/g, "");

const style = String.raw`<style data-rafex-user-request-v8="1">
/* Serbest ürün dökümü: Ürün | Kod | Adet. İçerik olsa da kapanır. */
#page.rafex-free-drawing-page .rafex-system-product-row{display:grid!important;grid-template-columns:minmax(170px,330px) minmax(110px,220px) max-content!important;justify-content:start!important;align-items:center!important;column-gap:12px!important;padding:7px 10px!important}
#page.rafex-free-drawing-page .rafex-system-product-row>span{display:contents!important}
#page.rafex-free-drawing-page .rafex-system-product-row>span>b{font-size:11.5px!important;line-height:1.2!important;color:#263a2f!important}
#page.rafex-free-drawing-page .rafex-system-product-row>span>small{font-size:10.8px!important;line-height:1.2!important;color:#5f7066!important;white-space:normal!important;overflow:visible!important;text-overflow:clip!important}
#page.rafex-free-drawing-page .rafex-system-product-row>strong{font-size:11.5px!important;line-height:1.2!important;text-align:left!important;white-space:nowrap!important}
#page.rafex-free-drawing-page details.rafex-system-product-disclosure:not([open])>.rafex-system-product-body{display:none!important}
#page.rafex-free-drawing-page details.rafex-system-product-disclosure>summary{cursor:pointer!important;pointer-events:auto!important}

/* Özelleştir aksesuar katları tıklanabilirliği son katmanda garanti. */
#m2CustomizeAccessories .m2-customize-accessory-levels button{pointer-events:auto!important;cursor:pointer!important;position:relative!important;z-index:3!important}
</style>`;

const runtime = String.raw`<script data-rafex-user-request-v8="1">(function(){
  if(window.__rafexUserRequestV8)return;window.__rafexUserRequestV8=true;
  const low=(v)=>String(v||'').toLocaleLowerCase('tr-TR');
  const clone=(v)=>{try{return structuredClone(v)}catch{try{return JSON.parse(JSON.stringify(v))}catch{return null}}};
  const freePage=()=>document.getElementById('page')?.classList.contains('rafex-free-drawing-page')===true;
  const systemOf=(entry)=>{const d=entry?.drawing||entry||{},x=String(entry?.rafexSystem||entry?.__rafexSystem||d.rafexSystem||'').toLowerCase();if(x==='b2b'||x==='mekik2')return x;return d.b2bLayout||d.b2b?'b2b':'mekik2';};
  const rowCountOf=(d)=>Math.max(1,Number(d?.b2bLayout?.rowCount)||(d?.b2b?.rowType==='double'?2:1));
  const trayPieces=(clear,width)=>{clear=Math.max(0,Math.round(Number(clear)||0));width=[200,250,300].includes(Number(width))?Number(width):300;const full=Math.floor(clear/width),rem=clear-full*width;return full+(rem>=50?1:0);};
  const palletHeightAt=(b,level)=>Number(b?.palletHeights?.[level])||Number(b?.palletHeight)||1200;
  const clearanceAt=(b,level)=>Number.isFinite(Number(b?.levelClearances?.[level]))?Number(b.levelClearances[level]):Number(b?.palletTraverseGap)||200;
  const traverseHeight=(b)=>Number(b?.traverseHeight)||140;
  function traverseBottom(b,level){
    if(level<0)return 0;
    if(String(b?.firstPalletPosition)==='traverse'){
      if(level===0)return Number(b?.firstFloorGap)||200;
      return loadBottom(b,level-1)+palletHeightAt(b,level-1)+clearanceAt(b,level-1);
    }
    return loadBottom(b,level)+palletHeightAt(b,level)+clearanceAt(b,level);
  }
  function loadBottom(b,level){
    if(level<0)return 0;
    if(String(b?.firstPalletPosition)!=='traverse'&&level===0)return 0;
    const supporting=String(b?.firstPalletPosition)==='traverse'?level:level-1;
    return traverseBottom(b,supporting)+traverseHeight(b);
  }
  function visibleAccessoryPlacements(d,item){
    const b=d?.b2b||{},tunnel=Math.max(0,Number(b.tunnelHeight)||0),levels=[...new Set((item?.levels||[]).map(Number).filter(Number.isFinite))],valid=[];
    levels.forEach((human)=>{
      if(human===0&&item.type==='palletStop'){
        if(tunnel<=0){valid.push({human:0,height:0});valid.push({human:0,height:250});}
        else {if(0>=tunnel)valid.push({human:0,height:0});if(250>=tunnel)valid.push({human:0,height:250});}
        return;
      }
      if(human<1||human>Math.max(1,Number(b.levels)||Number(d?.levels)||1))return;
      const level=human-1,support=traverseBottom(b,level)+traverseHeight(b);
      if(tunnel>0&&support<tunnel)return;
      valid.push({human,height:support});
    });
    return valid;
  }
  function currentAccessoryRows(entry,labels){
    const d=entry?.drawing||entry||{};if(!(d.b2bLayout||d.b2b))return [];
    const mult=Math.max(1,Number(entry?.rackCount)||1),rows=rowCountOf(d),clear=Math.max(0,Number(d?.b2bLayout?.sectionWidth)||Number(d?.totalWidth)||0),out=[];
    (Array.isArray(d?.b2b?.accessories)?d.b2b.accessories:[]).forEach((item)=>{
      const placements=visibleAccessoryPlacements(d,item);if(!placements.length)return;let qty=placements.length*rows*mult,spec='';
      if(item.type==='palletStop')spec='PALET DAYAMA';
      else if(item.type==='hTraverse')spec='H TRAVERS';
      else if(item.type==='tray'){const w=[200,250,300].includes(Number(item.width))?Number(item.width):300;qty*=Math.max(1,trayPieces(clear,w));spec=w+' mm';}
      else return;
      const itemName=item.type==='palletStop'?'Palet Dayama':item.type==='hTraverse'?'H Travers':'Tava';
      out.push({item:itemName,spec,code:spec,qty:Math.round(qty),unit:labels?.unitEach||'adet'});
    });
    return out;
  }
  function merge(rows,row){const key=low(row.item)+'|'+low(row.spec);const f=rows.find(x=>low(x?.item)+'|'+low(x?.spec)===key);if(f)f.qty=(Number(f.qty)||0)+(Number(row.qty)||0);else rows.push({...row});}
  function clipAnchorRows(rows,labels){const out=[];rows.forEach(r=>{const n=low(r?.item||r?.name),q=Math.max(0,Number(r?.qty)||0);if(!q)return;if(/uaks/.test(n)&&!/dübel|dubel|anchor/.test(n))out.push({item:'Klipsli Dübel',spec:'12x110 · UAKS',code:'12x110',qty:q*4,unit:labels?.unitEach||'adet'});else if(/uakz/.test(n)&&!/dübel|dubel|anchor/.test(n))out.push({item:'Klipsli Dübel',spec:'12x110 · UAKZ',code:'12x110',qty:q*4,unit:labels?.unitEach||'adet'});else if(/bariyer/.test(n)&&!/dübel|dubel|anchor/.test(n))out.push({item:'Klipsli Dübel',spec:'12x110 · BARİYER',code:'12x110',qty:q*8,unit:labels?.unitEach||'adet'});});return out;}
  function rank(name){return typeof window.rafexProductRank==='function'?window.rafexProductRank(name):50;}
  function normalizeB2BBom(base,entry,labels){
    let rows=Array.isArray(base)?base.map(r=>({...r})):[];const d=entry?.drawing||entry||{};if(!(d.b2bLayout||d.b2b))return rows;
    const hasTeam=rows.some(r=>/ayak takımı|upright frame|cadre de montant/.test(low(r?.item||r?.name)));
    rows=rows.filter(r=>{const n=low(r?.item||r?.name);if(hasTeam&&/ayak profili|upright profile|profil de montant/.test(n))return false;if(n==='palet dayama'||n==='h travers'||n==='tava'||n.startsWith('tava ·'))return false;if(/klipsli.*dübel|klipsli.*dubel|clip.*anchor/.test(n))return false;return true;});
    currentAccessoryRows(entry,labels).forEach(r=>merge(rows,r));
    clipAnchorRows(rows,labels).forEach(r=>merge(rows,r));
    rows.forEach(r=>{if(!r.code)r.code=codeOf(r.item||r.name,r.spec||'');});
    rows.sort((a,b)=>rank(a.item||a.name)-rank(b.item||b.name)||String(a.item||a.name||'').localeCompare(String(b.item||b.name||''),'tr'));
    return rows.filter(r=>Number(r.qty)>0);
  }
  function codeOf(item,spec){const n=low(item),s=String(spec||'').trim();if(/klipsli.*dübel|klipsli.*dubel/.test(n))return '12x110';if(s){const first=s.split('·')[0].trim();if(first)return first;}if(/uaks/.test(n))return 'UAKS';if(/uakz/.test(n))return 'UAKZ';if(/bariyer/.test(n))return 'BARİYER';return '—';}

  try{
    const prev=window.m2CorporateBomRows;
    if(typeof prev==='function'&&!prev.__rafexV8){const wrap=function(entry,labels){return normalizeB2BBom(prev.apply(this,arguments)||[],entry,labels||{unitEach:'adet'});};wrap.__rafexV8=true;try{m2CorporateBomRows=wrap}catch{}window.m2CorporateBomRows=wrap;}
  }catch(e){console.warn('v8 BOM',e)}

  // Ürün listelerinin açık/kapalı durumunu render sonrası da zorla koru.
  let openState={b2b:false,mekik2:false};try{openState={...openState,...JSON.parse(localStorage.getItem('rafex_free_product_disclosures_v1')||'{}')}}catch{}
  function saveOpen(){try{localStorage.setItem('rafex_free_product_disclosures_v1',JSON.stringify(openState))}catch{}}
  function decorateProducts(){
    if(!freePage())return;const host=document.getElementById('m2LayoutProductList');if(!host)return;
    try{openState={...openState,...JSON.parse(localStorage.getItem('rafex_free_product_disclosures_v1')||'{}')}}catch{}
    host.querySelectorAll('details.rafex-system-product-disclosure').forEach(details=>{const key=details.dataset.rafexProductSystem||'';if(key in openState)details.open=!!openState[key];});
    host.querySelectorAll('.rafex-system-product-row').forEach(row=>{const item=row.querySelector('span>b'),small=row.querySelector('span>small'),qty=row.querySelector(':scope>strong');if(!item||!qty)return;let code=codeOf(item.textContent,small?.textContent||'');if(!small){small=document.createElement('small');item.parentElement?.appendChild(small);}small.textContent=code;});
  }
  function scheduleProducts(){[0,20,80,180].forEach(ms=>setTimeout(()=>{try{if(typeof window.m2RenderLayoutProductList==='function')window.m2RenderLayoutProductList();}catch{}decorateProducts();refreshNativeParts();},ms));}
  window.rafexRefreshProductListsV8=scheduleProducts;

  let hostObserver=null;function bindProductObserver(){const host=document.getElementById('m2LayoutProductList');if(!host||host.dataset.rafexV8Observed)return;host.dataset.rafexV8Observed='1';hostObserver=new MutationObserver(()=>decorateProducts());hostObserver.observe(host,{childList:true,subtree:true});decorateProducts();}

  try{const prev=window.m2RenderLayoutProductList;if(typeof prev==='function'&&!prev.__rafexV8){const wrap=function(){const r=prev.apply(this,arguments);setTimeout(()=>{bindProductObserver();decorateProducts();},0);return r;};wrap.__rafexV8=true;try{m2RenderLayoutProductList=wrap}catch{}window.m2RenderLayoutProductList=wrap;}}catch{}

  // Özelleştir modalında canlı aksesuar adedi; Vazgeç'te eski state geri gelir.
  let customizeCtx=null;
  function currentCustomizeRack(){try{return m2LayoutState?.racks?.find(r=>r.id===m2CustomizeRackId)||null}catch{return null}}
  function syncDraftToRack(){const rack=currentCustomizeRack();if(!rack?.b2b)return;try{if(typeof m2CollectCustomizeRackAccessories==='function')rack.b2b.accessories=clone(m2CollectCustomizeRackAccessories())||[];const tun=document.getElementById('m2CustomizeTunnel'),th=document.getElementById('m2CustomizeTunnelHeight');rack.b2b.tunnelHeight=tun?.checked?Math.max(500,Number(th?.value)||3600):0;}catch{}scheduleProducts();}
  function wrapFn(name,after,before){try{const prev=window[name];if(typeof prev!=='function'||prev.__rafexV8)return;const wrap=function(){if(before)before.apply(this,arguments);const r=prev.apply(this,arguments);if(after)after.apply(this,arguments);return r;};wrap.__rafexV8=true;window[name]=wrap;try{eval(name+'=window[name]')}catch{}}catch{}}
  wrapFn('m2OpenCustomizeModal',function(){const rack=currentCustomizeRack();if(rack)customizeCtx={rackId:rack.id,accessories:clone(rack.b2b?.accessories||[]),tunnelHeight:Number(rack.b2b?.tunnelHeight)||0,committed:false};setTimeout(()=>{try{if(typeof m2LoadCustomizeRackAccessories==='function')m2LoadCustomizeRackAccessories(rack?.b2b?.accessories||[])}catch{}},0);});
  ['m2EnableCustomizeRackAccessory','m2RemoveCustomizeRackAccessory','m2ToggleCustomizeRackAccessoryLevel','m2AllCustomizeRackAccessoryLevels','m2SetCustomizeRackTrayWidth'].forEach(n=>wrapFn(n,()=>{setTimeout(syncDraftToRack,0);}));
  wrapFn('m2ApplyRackCustomization',()=>{if(customizeCtx)customizeCtx.committed=true;scheduleProducts();},()=>{if(customizeCtx)customizeCtx.committed=true;syncDraftToRack();});
  wrapFn('m2CloseCustomizeModal',()=>{if(customizeCtx&&!customizeCtx.committed){try{const rack=m2LayoutState?.racks?.find(r=>r.id===customizeCtx.rackId);if(rack?.b2b){rack.b2b.accessories=clone(customizeCtx.accessories)||[];rack.b2b.tunnelHeight=customizeCtx.tunnelHeight;}}catch{}scheduleProducts();}customizeCtx=null;});

  document.addEventListener('input',(event)=>{if(event.target?.id==='m2CustomizeTunnelHeight')setTimeout(syncDraftToRack,0);},true);
  document.addEventListener('change',(event)=>{if(event.target?.id==='m2CustomizeTunnel')setTimeout(syncDraftToRack,0);},true);

  // Serbest Çizim: üst B2B girişleri değişirken yerleşim state'i değişmesin/sıfırlanmasın.
  let layoutSnap=null;
  function isGuardTarget(target){return freePage()&&target instanceof Element&&!target.closest('#m2CustomizeModal')&&(String(target.id||'').startsWith('b2b')||!!target.closest('.b2b-input-card'));}
  function takeSnap(target){if(!isGuardTarget(target))return;try{layoutSnap=clone(m2LayoutState)}catch{layoutSnap=null}}
  function restoreSnap(){if(!layoutSnap)return;try{const current=JSON.stringify({r:m2LayoutState?.racks,p:m2LayoutState?.points,c:m2LayoutState?.closed});const before=JSON.stringify({r:layoutSnap.racks,p:layoutSnap.points,c:layoutSnap.closed});if(current===before)return;Object.keys(m2LayoutState).forEach(k=>delete m2LayoutState[k]);Object.assign(m2LayoutState,clone(layoutSnap));if(typeof m2RenderLayout==='function')m2RenderLayout();scheduleProducts();}catch(e){console.warn('v8 layout restore',e)}}
  ['input','change'].forEach(type=>document.addEventListener(type,(event)=>{takeSnap(event.target);setTimeout(restoreSnap,0);setTimeout(restoreSnap,60);setTimeout(restoreSnap,180);},true));

  // Native B2B ürün alanında aksesuar çıkarınca adet anında düşsün; tunnelHeight de hesaba girsin.
  function refreshNativeParts(){
    const host=document.getElementById('m2Parts');if(!host)return;host.querySelectorAll('[data-rafex-b2b-extra-v4],[data-rafex-b2b-extra-v8]').forEach(n=>n.remove());
    let state=null;try{state=typeof b2bReadInputState==='function'?b2bReadInputState():null}catch{}if(!state)return;
    const drawing={b2b:state,b2bLayout:{rowCount:state.rowType==='double'?2:1,sectionWidth:(typeof b2bPalletGeometry==='function'?Number(b2bPalletGeometry()?.sectionWidth)||0:0)}};
    currentAccessoryRows({drawing,rackCount:1},{unitEach:'adet'}).forEach(row=>{const div=document.createElement('div');div.className='m2-part';div.dataset.rafexB2BExtraV8='1';div.innerHTML='<span>'+String(row.item)+' · '+String(row.code||row.spec||'')+'</span><b>'+Math.round(Number(row.qty)||0).toLocaleString('tr-TR')+' adet</b>';host.appendChild(div);});
  }
  ['rafexAccessoryAdd','rafexAccessoryRemove','rafexAccessoryToggleLevel','rafexAccessoryAllLevels','rafexAccessorySetTrayWidth'].forEach(n=>wrapFn(n,()=>{[0,30,120].forEach(ms=>setTimeout(()=>{refreshNativeParts();scheduleProducts();},ms));}));
  wrapFn('b2bApplyInputs',()=>{setTimeout(refreshNativeParts,0);setTimeout(refreshNativeParts,120);});
  wrapFn('m2RenderLayout',()=>{setTimeout(()=>{bindProductObserver();decorateProducts();},0);});

  setTimeout(()=>{bindProductObserver();decorateProducts();refreshNativeParts();},0);
})();</script>`;

const end = html.lastIndexOf("</body>");
if (end < 0) throw new Error("v8-final body yok");
html = html.slice(0,end)+style+runtime+html.slice(end);
if(!html.includes('data-rafex-user-request-v8="1"'))throw new Error('v8-final marker yok');
const encoded=Buffer.from(html,'utf8').toString('base64');
worker=worker.slice(0,match.index)+match[1]+match[2]+encoded+match[2]+worker.slice(match.index+match[0].length);
fs.writeFileSync(workerPath,worker);
console.log('FINAL v8: aksesuar kat click/save-load, dinamik tunnel, canlı adet/kod, kapanabilir ürün listeleri, klipsli dübel ve Serbest state koruması aktif.');
