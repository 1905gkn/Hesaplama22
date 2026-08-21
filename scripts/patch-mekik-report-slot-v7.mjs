import fs from "node:fs";
import path from "node:path";

const workerPath = path.join(process.cwd(), "dist/server/index.js");
let worker = fs.readFileSync(workerPath, "utf8");
const match = worker.match(/(const\s+HTML_BASE64\s*=\s*)(["'])([A-Za-z0-9+/=]+)\2/);
if (!match) throw new Error("Mekik report slot v7: HTML_BASE64 bulunamadi.");
let html = Buffer.from(match[3], "base64").toString("utf8");

html = html
  .replace(/<style\s+data-rafex-mekik-report-slot="v7">[\s\S]*?<\/style>\s*/g, "")
  .replace(/<script\s+data-rafex-mekik-report-slot="v7">[\s\S]*?<\/script>\s*/g, "");

// Aynı isimli B2B ve Mekik tiplerinin tek rapor kartında birleşmesini engelle.
html = html.replace(
  'const name=entry.name||`Tip ${index+1}`,key=String(name).trim().toLocaleUpperCase("tr-TR"),drawing=entry.drawing||entry,current=map.get(key),nextCount=Number(drawing?.b2bLayout?.palletCount)||0,',
  'const name=entry.name||`Tip ${index+1}`,drawing=entry.drawing||entry,rafexSystem=String(entry?.rafexSystem||entry?.__rafexSystem||drawing?.rafexSystem||"").toLowerCase()||((drawing?.b2bLayout||drawing?.b2b)?"b2b":"mekik2"),key=`${rafexSystem}|${String(name).trim().toLocaleUpperCase("tr-TR")}`,current=map.get(key),nextCount=Number(drawing?.b2bLayout?.palletCount)||0,'
);

html = html.replace(
  'const name=String(entry.name||`TİP ${index+1}`).trim(),key=name.toLocaleUpperCase("tr-TR"),drawing=entry.drawing||entry,count=Number(drawing?.b2bLayout?.palletCount)||0;',
  'const name=String(entry.name||`TİP ${index+1}`).trim(),drawing=entry.drawing||entry,rafexSystem=String(entry?.rafexSystem||entry?.__rafexSystem||drawing?.rafexSystem||"").toLowerCase()||((drawing?.b2bLayout||drawing?.b2b)?"b2b":"mekik2"),key=`${rafexSystem}|${name.toLocaleUpperCase("tr-TR")}`,count=Number(drawing?.b2bLayout?.palletCount)||0;'
);

// Standart kartlara sistem etiketi koy. Böylece sonradan kart seçimi isim benzerliğine bağlı kalmaz.
html = html.replaceAll(
  '<article class="m2-corporate-type-card" data-rafex-type-name="${esc(rawTypeName)}" style="--m2-type-color:${typeAccents[index]}">',
  '<article class="m2-corporate-type-card" data-rafex-system="${d.b2bLayout||d.b2b?\'b2b\':\'mekik2\'}" data-rafex-type-name="${esc(rawTypeName)}" style="--m2-type-color:${typeAccents[index]}">'
);

const runtime = String.raw`<style data-rafex-mekik-report-slot="v7">
/* Mekik karti native rapor izgara mantiginda kalir: bilgi | on | yan. */
.m2-corporate-type-card.rafex-mekik-slot-v7{
  min-width:0!important;min-height:0!important;height:100%!important;
  display:grid!important;grid-template-columns:12% 44% 44%!important;
  grid-template-rows:minmax(0,1fr)!important;overflow:hidden!important;
}
.m2-corporate-type-card.rafex-mekik-slot-v7>strong{
  grid-column:1!important;grid-row:1!important;min-width:0!important;min-height:0!important;
  display:flex!important;flex-direction:column!important;align-items:center!important;
  justify-content:center!important;gap:7px!important;padding:5px 3px!important;
}
.m2-corporate-type-card.rafex-mekik-slot-v7>.m2-corporate-view{
  grid-row:1!important;min-width:0!important;min-height:0!important;height:100%!important;
  display:grid!important;grid-template-rows:18px minmax(0,1fr)!important;
  overflow:hidden!important;position:relative!important;
}
.m2-corporate-type-card.rafex-mekik-slot-v7>.m2-corporate-view:nth-of-type(1){grid-column:2!important}
.m2-corporate-type-card.rafex-mekik-slot-v7>.m2-corporate-view:nth-of-type(2){grid-column:3!important}
.m2-corporate-type-card.rafex-mekik-slot-v7>.m2-corporate-view>svg{
  display:block!important;position:static!important;inset:auto!important;left:auto!important;right:auto!important;
  top:auto!important;bottom:auto!important;margin:0!important;transform:none!important;translate:none!important;
  width:100%!important;height:100%!important;max-width:100%!important;max-height:100%!important;
  min-width:0!important;min-height:0!important;overflow:hidden!important;contain:layout paint!important;
}
/* V4/V5'in kart disina tasma yaratabilen görünür overflow/transform kurallarini kesin olarak etkisizlestir. */
.m2-corporate-page .m2-corporate-type-grid,.m2-corporate-page .m2-corporate-type-card{overflow:hidden!important}
</style>
<script data-rafex-mekik-report-slot="v7">(function(){
  if(window.__rafexMekikReportSlotV7)return;window.__rafexMekikReportSlotV7=true;
  const systemOf=(entry)=>{const d=entry?.drawing||entry||{};const x=String(entry?.rafexSystem||entry?.__rafexSystem||d?.rafexSystem||'').toLowerCase();if(x==='b2b'||x==='mekik2')return x;return d?.b2bLayout||d?.b2b?'b2b':'mekik2';};
  const nameOf=(entry)=>String(entry?.name||'').trim();
  function cardSystem(card){
    const tagged=String(card?.dataset?.rafexSystem||'').toLowerCase();if(tagged==='b2b'||tagged==='mekik2')return tagged;
    if(card?.querySelector('.rafex-report-3d-frame,.rafex-b2b-report-perspective'))return 'b2b';
    return '';
  }
  function usedTypes(){try{return typeof m2CorporateUsedTypes==='function'?m2CorporateUsedTypes():[]}catch{return[]}}
  function repair(){
    const mekik=(usedTypes()||[]).filter(e=>systemOf(e)==='mekik2');if(!mekik.length)return;
    const cards=[...document.querySelectorAll('.m2-corporate-type-card')],used=new Set();
    mekik.forEach((entry)=>{
      const name=nameOf(entry),d=entry?.drawing||entry||{};
      const exact=cards.filter(c=>!used.has(c)&&String(c.dataset.rafexTypeName||'').trim()===name&&cardSystem(c)!=='b2b');
      const card=exact.find(c=>cardSystem(c)==='mekik2')||exact[0]||null;
      if(!card)return;used.add(card);
      card.dataset.rafexSystem='mekik2';
      card.classList.remove('rafex-mekik-fit-v4','rafex-mekik-fit-v5');
      card.classList.add('rafex-mekik-slot-v7');
      const views=[...card.querySelectorAll(':scope>.m2-corporate-view')];if(views.length<2)return;
      try{
        const front=typeof m2ReportElevationSvg==='function'?m2ReportElevationSvg(d,'front'):'';
        const side=typeof m2ReportElevationSvg==='function'?m2ReportElevationSvg(d,'side'):'';
        if(front){const h=views[0].querySelector(':scope>b')?.outerHTML||'<b>ÖNDEN GÖRÜNÜŞ</b>';views[0].innerHTML=h+front;}
        if(side){const h=views[1].querySelector(':scope>b')?.outerHTML||'<b>YAN GÖRÜNÜŞ</b>';views[1].innerHTML=h+side;}
      }catch(e){console.warn('Mekik v7 report repair',e)}
    });
  }
  function schedule(){[0,40,120,320,700,1200].forEach(ms=>setTimeout(repair,ms));}
  try{const prev=window.m2RenderCorporateReport;if(typeof prev==='function'&&!prev.__rafexMekikSlotV7){const wrap=function(){const out=prev.apply(this,arguments);schedule();return out};wrap.__rafexMekikSlotV7=true;try{m2RenderCorporateReport=wrap}catch{}window.m2RenderCorporateReport=wrap;}}catch(e){}
  try{const prev=window.__rafexPrepareCorporatePrint;if(typeof prev==='function'&&!prev.__rafexMekikSlotV7){const wrap=async function(){repair();const out=await prev.apply(this,arguments);repair();setTimeout(repair,50);return out};wrap.__rafexMekikSlotV7=true;window.__rafexPrepareCorporatePrint=wrap;}}catch(e){}
  document.addEventListener('click',(event)=>{const el=event.target instanceof Element?event.target:null;if(el?.closest?.('[data-rafex-corporate-print],#m2PrintCorporateReport,#m2CorporatePrintButton')){repair();setTimeout(repair,30);}},true);
  schedule();
})();</script>`;

const bodyEnd = html.lastIndexOf("</body>");
if (bodyEnd < 0) throw new Error("Mekik report slot v7: body bulunamadi.");
html = html.slice(0, bodyEnd) + runtime + html.slice(bodyEnd);

const encoded = Buffer.from(html, "utf8").toString("base64");
worker = worker.slice(0, match.index) + match[1] + match[2] + encoded + match[2] + worker.slice(match.index + match[0].length);
fs.writeFileSync(workerPath, worker);
console.log("FINAL v7: Mekik rapor kartlari kendi slotlarina kilitlendi; B2B/Mekik tip gruplama sistem bazli ayrildi.");
