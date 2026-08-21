import fs from "node:fs";
import path from "node:path";

const workerPath = path.join(process.cwd(), "dist/server/index.js");
let worker = fs.readFileSync(workerPath, "utf8");
const match = worker.match(/(const\s+HTML_BASE64\s*=\s*)(["'])([A-Za-z0-9+/=]+)\2/);
if (!match) throw new Error("User request v5: HTML_BASE64 bulunamadi.");
let html = Buffer.from(match[3], "base64").toString("utf8");

// Onceki final K1 runtime'i H Travers/Tava K1'i bilerek gizliyordu. Kaldirip dogru tek-click akisina donuyoruz.
html = html
  .replace(/<style\s+data-rafex-final-live-controls="v3">[\s\S]*?<\/style>\s*/g, "")
  .replace(/<script\s+data-rafex-final-live-controls="v3">[\s\S]*?<\/script>\s*/g, "")
  .replace(/<style\s+data-rafex-user-request-v5="1">[\s\S]*?<\/style>\s*/g, "")
  .replace(/<script\s+data-rafex-user-request-v5="1">[\s\S]*?<\/script>\s*/g, "");

// Final-live-controls kaynak click handler'ini devre disi birakmisti. ZEMIN (0) dahil yeniden etkinlestir.
html = html.replaceAll(
  "if(levelButton){return;}",
  "if(levelButton){event.preventDefault();event.stopPropagation();const rawLevel=levelButton.dataset.level;const level=rawLevel!==undefined?Number(rawLevel):Number((levelButton.textContent||'').replace(/\\D/g,''));if(Number.isFinite(level)&&level>=0&&typeof window.m2ToggleCustomizeRackAccessoryLevel==='function')window.m2ToggleCustomizeRackAccessoryLevel(type,level);return;}"
);

const runtime = String.raw`<style data-rafex-user-request-v5="1">
/* Urun detaylari: URUN | KOD/OLCU | ADET; daha buyuk ve birbirine yakin. */
.m2-corporate-bom-head,.m2-corporate-bom-row{grid-template-columns:1.18fr 1.42fr .34fr!important}
.m2-corporate-bom-head span:nth-child(4),.m2-corporate-bom-row span:nth-child(4){display:none!important}
.m2-corporate-bom-head{font-size:10.8px!important}
.m2-corporate-bom-row{font-size:10.6px!important;line-height:1.12!important}
.m2-corporate-bom-head span,.m2-corporate-bom-row span{padding:4px 6px!important}

/* Serbest Cizim urun listesi: ad, kod ve adet yan yana; doluyken de kapanabilir. */
#page.rafex-free-drawing-page .rafex-system-product-row{display:grid!important;grid-template-columns:minmax(260px,650px) max-content!important;justify-content:start!important;column-gap:10px!important}
#page.rafex-free-drawing-page .rafex-system-product-row>span{display:grid!important;grid-template-columns:minmax(145px,1fr) minmax(100px,.9fr)!important;align-items:center!important;column-gap:10px!important;font-size:10.5px!important}
#page.rafex-free-drawing-page .rafex-system-product-row>span>b{font-size:10.8px!important}
#page.rafex-free-drawing-page .rafex-system-product-row>span>small{font-size:9.8px!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
#page.rafex-free-drawing-page .rafex-system-product-row>strong{font-size:10.8px!important;text-align:left!important}
#page.rafex-free-drawing-page details.rafex-system-product-disclosure:not([open])>.rafex-system-product-body{display:none!important}

/* K1 ve en ust aksesuar seviyeleri her tipte gorunur. Palet Dayama ZEMIN ayrica gelir. */
#m2CustomizeAccessories .m2-customize-accessory-levels button{display:inline-flex!important;align-items:center!important;justify-content:center!important;visibility:visible!important;pointer-events:auto!important}

/* Mekik karma kurumsal cikti: bir kart = sayfanin yarisi, sol on / sag yan ve ikisi de alana sigar. */
.m2-corporate-type-card.rafex-mekik-fit-v5{height:100%!important;min-height:0!important;display:grid!important;grid-template-columns:minmax(0,1fr) minmax(0,1fr)!important;grid-template-rows:28px minmax(0,1fr)!important;overflow:hidden!important}
.m2-corporate-type-card.rafex-mekik-fit-v5>strong{grid-column:1/-1!important;grid-row:1!important;display:flex!important;flex-direction:row!important;align-items:center!important;justify-content:flex-start!important;gap:10px!important;padding:4px 9px!important;min-height:0!important}
.m2-corporate-type-card.rafex-mekik-fit-v5>strong small{margin:0!important;padding:0!important;border:0!important}
.m2-corporate-type-card.rafex-mekik-fit-v5>.m2-corporate-view{grid-row:2!important;min-width:0!important;min-height:0!important;height:100%!important;overflow:hidden!important;display:grid!important;grid-template-rows:18px minmax(0,1fr)!important}
.m2-corporate-type-card.rafex-mekik-fit-v5>.m2-corporate-view svg{display:block!important;width:100%!important;height:100%!important;max-width:100%!important;max-height:100%!important;transform:scale(.88)!important;transform-origin:center center!important;overflow:visible!important}
</style>
<script data-rafex-user-request-v5="1">(function(){
  if(window.__rafexUserRequestV5)return;window.__rafexUserRequestV5=true;
  const low=(v)=>String(v||'').toLocaleLowerCase('tr-TR');
  const esc=(v)=>String(v==null?'':v).replace(/[&<>\"]/g,(c)=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]));
  const freePage=()=>document.getElementById('page')?.classList.contains('rafex-free-drawing-page')===true;
  const systemOf=(entry)=>{const d=entry?.drawing||entry||{};const x=String(entry?.rafexSystem||entry?.__rafexSystem||d.rafexSystem||'').toLowerCase();if(x==='b2b'||x==='mekik2')return x;return d.b2bLayout||d.b2b?'b2b':'mekik2';};
  const unit=(labels)=>labels?.unitEach||'adet';
  const rank=(name)=>typeof window.rafexProductRank==='function'?window.rafexProductRank(name):50;
  const stableSort=(rows)=>(rows||[]).map((row,index)=>({row,index})).sort((a,b)=>rank(a.row?.item||a.row?.name)-rank(b.row?.item||b.row?.name)||a.index-b.index).map(x=>x.row);
  const trayPieces=(clear,width)=>{clear=Math.max(0,Math.round(Number(clear)||0));width=[200,250,300].includes(Number(width))?Number(width):300;const full=Math.floor(clear/width),rem=clear-full*width;return full+(rem>=50?1:0);};

  function standardAccessoryRows(entry,labels){
    const d=entry?.drawing||entry||{};if(!(d.b2bLayout||d.b2b))return [];
    const mult=Math.max(1,Number(entry?.rackCount)||1),rowCount=Math.max(1,Number(d.b2bLayout?.rowCount)||(d.b2b?.rowType==='double'?2:1));
    const clear=Math.max(0,Number(d.b2bLayout?.sectionWidth)||Number(d.totalWidth)||0),out=[];
    (Array.isArray(d.b2b?.accessories)?d.b2b.accessories:[]).forEach((item)=>{
      const levels=[...new Set((item?.levels||[]).map(Number).filter(Number.isFinite))];if(!levels.length)return;
      const ground=levels.includes(0),normal=levels.filter(n=>n>=1).length;
      if(item.type==='palletStop'){
        const qty=(normal+(ground?2:0))*rowCount*mult;if(qty)out.push({item:'Palet Dayama',spec:'PALET DAYAMA',qty,unit:unit(labels)});
      }else if(item.type==='hTraverse'){
        const qty=normal*rowCount*mult;if(qty)out.push({item:'H Travers',spec:'H TRAVERS',qty,unit:unit(labels)});
      }else if(item.type==='tray'){
        const width=[200,250,300].includes(Number(item.width))?Number(item.width):300;
        const qty=normal*Math.max(1,trayPieces(clear,width))*rowCount*mult;if(qty)out.push({item:'Tava',spec:width+' mm',qty,unit:unit(labels)});
      }
    });
    return out;
  }
  function mergeRows(rows,extra){
    extra.forEach((r)=>{const found=rows.find(x=>low(x?.item)===low(r.item)&&low(x?.spec)===low(r.spec));if(found)found.qty=(Number(found.qty)||0)+(Number(r.qty)||0);else rows.push({...r});});return rows;
  }
  function cleanB2BRows(rows,entry,labels){
    rows=Array.isArray(rows)?rows.slice():[];const d=entry?.drawing||entry||{};if(!(d.b2bLayout||d.b2b))return stableSort(rows);
    const hasTeam=rows.some(r=>/ayak takımı|upright frame|cadre de montant/.test(low(r?.item)));
    rows=rows.filter((r)=>{
      const n=low(r?.item);
      if(hasTeam&&/ayak profili|upright profile|profil de montant/.test(n))return false;
      if(n==='palet dayama'||n==='h travers'||n==='tava')return false;
      return true;
    });
    mergeRows(rows,standardAccessoryRows(entry,labels));
    return stableSort(rows);
  }

  try{
    const prev=window.m2CorporateBomRows;
    if(typeof prev==='function'&&!prev.__rafexV5){const wrap=function(entry,labels){return cleanB2BRows(prev.apply(this,arguments)||[],entry,labels);};wrap.__rafexV5=true;try{m2CorporateBomRows=wrap}catch{}window.m2CorporateBomRows=wrap;}
  }catch(e){console.warn('v5 BOM',e)}

  function allLayoutAccessories(){
    const out=[];try{(m2LayoutState?.racks||[]).filter(r=>systemOf(r)==='b2b').forEach(r=>mergeRows(out,standardAccessoryRows({drawing:r,rackCount:1},{unitEach:'adet'})));}catch{}return out.map(r=>({name:r.item+(r.spec&&r.spec!==r.item?' · '+r.spec:''),qty:r.qty}));
  }
  try{
    const prev=window.m2LayoutProductRows;
    if(typeof prev==='function'&&!prev.__rafexV5){const wrap=function(){let rows=prev.apply(this,arguments)||[];rows=rows.filter(r=>{const n=low(r?.name);return !(/ayak profili|upright profile|profil de montant/.test(n)||n==='palet dayama'||n==='h travers'||n.startsWith('tava'));});mergeRows(rows,allLayoutAccessories().map(r=>({name:r.name,qty:r.qty})));return stableSort(rows);};wrap.__rafexV5=true;try{m2LayoutProductRows=wrap}catch{}window.m2LayoutProductRows=wrap;}
  }catch(e){console.warn('v5 layout BOM',e)}

  // Urun listesi acikken de summary'ye tiklayinca kesin olarak kapanir; tercih aninda kaydedilir.
  document.addEventListener('click',(event)=>{
    if(!freePage())return;const summary=event.target instanceof Element?event.target.closest('details.rafex-system-product-disclosure>summary'):null;if(!summary)return;
    const details=summary.parentElement,key=details?.dataset?.rafexProductSystem;if(!details||!key)return;
    event.preventDefault();event.stopPropagation();details.open=!details.open;
    try{const state=JSON.parse(localStorage.getItem('rafex_free_product_disclosures_v1')||'{}')||{};state[key]=details.open;localStorage.setItem('rafex_free_product_disclosures_v1',JSON.stringify(state));}catch{}
  },true);

  // B2B ust seciciler degisirken mevcut Serbest Cizim yerlesimini asla sifirlama.
  let pendingSnapshot=null;
  const clone=(v)=>{try{return structuredClone(v)}catch{try{return JSON.parse(JSON.stringify(v))}catch{return null}}};
  function snapshotIfNeeded(target){
    if(!freePage()||!(target instanceof Element))return;
    if(!(String(target.id||'').startsWith('b2b')||target.closest('.b2b-input-card')))return;
    try{if(!Array.isArray(m2LayoutState?.racks)||!m2LayoutState.racks.length)return;pendingSnapshot={state:clone(m2LayoutState),symbols:clone(typeof m2LayoutSymbols!=='undefined'?m2LayoutSymbols:[])};}catch{}
  }
  function restoreIfWiped(){
    if(!pendingSnapshot?.state?.racks?.length)return;try{if(Array.isArray(m2LayoutState?.racks)&&m2LayoutState.racks.length)return;}catch{}
    try{m2LayoutState=pendingSnapshot.state;if(typeof m2LayoutSymbols!=='undefined'&&Array.isArray(pendingSnapshot.symbols))m2LayoutSymbols=pendingSnapshot.symbols;if(typeof m2RenderLayout==='function')m2RenderLayout();if(typeof m2RenderLayoutProductList==='function')m2RenderLayoutProductList();}catch(e){console.warn('Serbest yerlesim restore',e)}
  }
  ['input','change'].forEach(type=>document.addEventListener(type,(event)=>{snapshotIfNeeded(event.target);setTimeout(restoreIfWiped,0);setTimeout(restoreIfWiped,40);},true));

  // Mekik kartlarini native SVG ile tekrar doldur. Eski runtime bos kart biraksa bile PDF oncesi yeniden kurulur.
  function repairMekikReport(){
    let types=[];try{types=typeof m2CorporateUsedTypes==='function'?m2CorporateUsedTypes():[]}catch{}
    if(!Array.isArray(types)||!types.length)return;
    const cards=[...document.querySelectorAll('#m2CorporatePreview .m2-corporate-type-card,.m2-corporate-preview .m2-corporate-type-card')];
    types.filter(e=>systemOf(e)==='mekik2').forEach((entry)=>{
      const d=entry?.drawing||entry||{},name=String(entry?.name||'').trim();
      let card=cards.find(c=>String(c.dataset.rafexTypeName||'').trim()===name&&!c.dataset.rafexV5Bound);
      if(!card)card=cards.find(c=>!c.querySelector('.rafex-report-3d-frame')&&!c.dataset.rafexV5Bound);
      if(!card)return;card.dataset.rafexV5Bound='1';card.dataset.rafexSystem='mekik2';card.classList.add('rafex-mekik-fit-v5');
      const views=[...card.querySelectorAll(':scope>.m2-corporate-view')];if(views.length<2)return;
      try{
        const front=typeof m2ReportElevationSvg==='function'?m2ReportElevationSvg(d,'front'):'';
        const side=typeof m2ReportElevationSvg==='function'?m2ReportElevationSvg(d,'side'):'';
        if(front){const h=views[0].querySelector(':scope>b')?.outerHTML||'<b>ÖNDEN GÖRÜNÜŞ</b>';views[0].innerHTML=h+front;}
        if(side){const h=views[1].querySelector(':scope>b')?.outerHTML||'<b>YAN GÖRÜNÜŞ</b>';views[1].innerHTML=h+side;}
      }catch(e){console.warn('Mekik report repair',e)}
    });
  }
  function scheduleRepair(){[0,40,140,360].forEach(ms=>setTimeout(repairMekikReport,ms));}
  try{const prev=window.m2RenderCorporateReport;if(typeof prev==='function'&&!prev.__rafexV5Repair){const wrap=function(){const r=prev.apply(this,arguments);scheduleRepair();return r};wrap.__rafexV5Repair=true;try{m2RenderCorporateReport=wrap}catch{}window.m2RenderCorporateReport=wrap;}}catch{}
  try{const prev=window.__rafexPrepareCorporatePrint;if(typeof prev==='function'&&!prev.__rafexV5Repair){const wrap=async function(){const r=await prev.apply(this,arguments);repairMekikReport();return r};wrap.__rafexV5Repair=true;window.__rafexPrepareCorporatePrint=wrap;}}catch{}
  scheduleRepair();
})();</script>`;

const bodyEnd = html.lastIndexOf('</body>');
if (bodyEnd < 0) throw new Error('User request v5: body kapanisi bulunamadi.');
html = html.slice(0, bodyEnd) + runtime + html.slice(bodyEnd);

if (!html.includes('data-rafex-user-request-v5="1"')) throw new Error('User request v5 runtime eklenemedi.');
if (html.includes('data-rafex-final-live-controls="v3"')) throw new Error('Eski K1 gizleme runtime final HTML icinde kaldi.');

const encoded = Buffer.from(html, 'utf8').toString('base64');
worker = worker.slice(0, match.index) + match[1] + match[2] + encoded + match[2] + worker.slice(match.index + match[0].length);
fs.writeFileSync(workerPath, worker);
console.log('FINAL v5: Mekik PDF geri dolumu, ZEMIN/K1/ust aksesuar akisi, 3 kolon urun detayi, acilir urun listeleri, Ayak Profili duplikasyon temizligi ve Serbest Cizim state korumasi aktif.');
