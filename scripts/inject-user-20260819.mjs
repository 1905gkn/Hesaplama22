import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const workerPath = path.join(root, "dist/server/index.js");
const marker = 'data-rafex-user-20260819="v1"';

let worker = fs.readFileSync(workerPath, "utf8");
const match = worker.match(/(const\s+HTML_BASE64\s*=\s*)(["'])([A-Za-z0-9+/=]+)\2/);
if (!match) throw new Error("HTML_BASE64 build çıktısında bulunamadı.");
let html = Buffer.from(match[3], "base64").toString("utf8");

// Kesit Yer Belirleme: açıyı açık isimleriyle göster.
html = html.replaceAll(
  'if (angles) angles.textContent = `${Math.round(value.azimuth)}° / ${Math.round(value.elevation)}°`;',
  'if (angles) { const az=Math.round(value.azimuth), el=Math.round(value.elevation); angles.textContent = `Yatay açı: ${az}° · Yukarı/Aşağı: ${el>=0?"+":""}${el}°`; }',
);
html = html.replaceAll(
  '<small data-rafex-angle-label style="margin-left:8px;color:#68736c">41° / 24°</small>',
  '<small data-rafex-angle-label style="margin-left:8px;color:#68736c">Yatay açı: 41° · Yukarı/Aşağı: +24°</small>',
);

const runtime = `<script ${marker}>(function(){
  if(window.__rafexUser20260819V1)return;window.__rafexUser20260819V1=true;

  const num=(v,f=0)=>Number.isFinite(Number(v))?Number(v):f;
  const rackLevels=(rack)=>Math.max(1,Math.round(num(rack?.levels ?? rack?.b2b?.levels ?? rack?.b2bLayout?.levels,1)));
  const isDouble=(rack)=>Math.round(num(rack?.b2bLayout?.rowCount, rack?.b2b?.rowType==='double'?2:1))===2;
  const rowGap=(rack)=>Math.max(0,Math.round(num(rack?.b2bLayout?.rowGap ?? rack?.b2b?.rowGap,125)));
  const seismicInfo=(rack)=>isDouble(rack)?('KAT: '+rackLevels(rack)+' · ÇİFT SIRA ARASI: '+rowGap(rack)+' mm'):('KAT: '+rackLevels(rack)+' · BASIC: 125 mm');

  try{
    const original=window.m2SeismicBraceSvg;
    if(typeof original==='function'&&!original.__rafexInfo){
      const wrapped=function(brace){
        const svg=original.apply(this,arguments);if(!svg)return svg;
        try{
          const racks=(brace?.rackIds||[]).map(id=>m2LayoutState?.racks?.find(r=>r.id===Number(id))).filter(Boolean);
          if(!racks.length)return svg;
          const x=racks.reduce((s,r)=>s+(num(r.x)+num(r.w)/2),0)/racks.length;
          const y=racks.reduce((s,r)=>s+(num(r.y)+num(r.h)/2),0)/racks.length;
          const label=seismicInfo(racks[0]);
          const text='<text x="'+x+'" y="'+(y+22)+'" text-anchor="middle" class="m2-layout-label rafex-seismic-info" style="font-size:12px;font-weight:900;fill:#173c2d;stroke:#fff;stroke-width:3px;paint-order:stroke">'+label+'</text>';
          return svg.replace(/<\/g>\s*$/,text+'</g>');
        }catch{return svg;}
      };wrapped.__rafexInfo=true;window.m2SeismicBraceSvg=wrapped;
    }
  }catch(e){console.warn('Deprem çaprazı bilgisi eklenemedi',e)}

  try{
    const originalBom=window.m2CorporateBomRows;
    if(typeof originalBom==='function'&&!originalBom.__rafexSeismicBom){
      const wrapped=function(entry,labels){
        const rows=originalBom.apply(this,arguments)||[];
        try{
          const ids=new Set((Array.isArray(entry?.rackIds)?entry.rackIds:[]).map(Number));
          const seen=new Set();let heavy=0;
          (m2LayoutState?.racks||[]).forEach(rack=>{
            if(ids.size&&!ids.has(Number(rack.id)))return;
            (rack.seismicBraces||[]).forEach(brace=>{if(brace?.type!=='heavy')return;const key=(brace.rackIds||[]).map(Number).sort((a,b)=>a-b).join('-');if(seen.has(key))return;seen.add(key);heavy++;});
          });
          if(heavy>0&&!rows.some(row=>String(row.item||'').toLowerCase().includes('ağır deprem'))){rows.push({item:'Ağır deprem çaprazı',spec:'Serbest yerleşim seçimine göre',qty:heavy,unit:labels?.unitEach||'adet'});}
          const hasStraight=rows.some(row=>String(row.item||'').toLowerCase().includes('düz arabağ'));
          if(!hasStraight){
            const drawing=entry?.drawing||entry;const plan=typeof b2bStraightTiePlan==='function'?b2bStraightTiePlan(drawing):null;
            const rc=Math.round(num(drawing?.b2bLayout?.rowCount,drawing?.b2b?.rowType==='double'?2:1));
            const footTeams=Math.max(0,num(drawing?.bays,0)+1)*Math.max(1,rc);const stations=rc===2?footTeams/rc:0;const qty=Math.round(num(plan?.count,0)*stations*Math.max(1,num(entry?.rackCount,1)));
            if(qty>0)rows.push({item:'Düz arabağ',spec:Math.round(num(plan?.length,0))+' × '+Math.round(num(plan?.width,0))+' mm · galvaniz',qty,unit:labels?.unitEach||'adet'});
          }
        }catch(e){console.warn('Döküm ek bilgileri hazırlanamadı',e)}
        return rows;
      };wrapped.__rafexSeismicBom=true;window.m2CorporateBomRows=wrapped;
    }
  }catch(e){console.warn('Kurumsal döküm genişletilemedi',e)}
})();</script>`;

const style = `<style data-rafex-user-20260819-style="v1">
.rafex-seismic-info{pointer-events:none}
.m2-corporate-bom-card h3{font-size:20px!important;line-height:1.2!important;padding:14px 16px!important}
.m2-corporate-bom-head{font-size:12px!important;font-weight:900!important}
.m2-corporate-bom-row{font-size:12px!important;min-height:38px!important;padding-top:9px!important;padding-bottom:9px!important}
.m2-corporate-bom-meta{font-size:11px!important;padding:10px 14px!important}
[data-rafex-angle-label]{display:inline-block!important;margin-top:5px!important;padding:5px 8px!important;border-radius:6px!important;background:#edf2ee!important;color:#173c2d!important;font-size:10px!important;font-weight:900!important}
</style>`;

if(!html.includes(marker)){
  const bodyEnd=html.lastIndexOf("</body>");if(bodyEnd<0)throw new Error("Portal </body> bulunamadı.");
  html=html.slice(0,bodyEnd)+style+runtime+html.slice(bodyEnd);
}

if(!html.includes('Yatay açı: ${az}° · Yukarı/Aşağı:')) throw new Error('Kesit açı verisi eklenemedi.');
if(!html.includes('Ağır deprem çaprazı')||!html.includes('BASIC: 125 mm')) throw new Error('Deprem/döküm verileri eklenemedi.');

const encoded=Buffer.from(html,"utf8").toString("base64");
worker=worker.slice(0,match.index)+match[1]+match[2]+encoded+match[2]+worker.slice(match.index+match[0].length);
fs.writeFileSync(workerPath,worker);
