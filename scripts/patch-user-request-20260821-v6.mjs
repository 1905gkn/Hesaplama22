import fs from "node:fs";
import path from "node:path";

const workerPath=path.join(process.cwd(),"dist/server/index.js");
let worker=fs.readFileSync(workerPath,"utf8");
const match=worker.match(/(const\s+HTML_BASE64\s*=\s*)(["'])([A-Za-z0-9+/=]+)\2/);
if(!match)throw new Error("v6 HTML_BASE64 bulunamadi");
let html=Buffer.from(match[3],"base64").toString("utf8");
html=html.replace(/<script\s+data-rafex-user-request-v6="1">[\s\S]*?<\/script>\s*/g,"");

const runtime=String.raw`<script data-rafex-user-request-v6="1">(function(){
  if(window.__rafexUserRequestV6)return;window.__rafexUserRequestV6=true;
  const low=(v)=>String(v||'').toLocaleLowerCase('tr-TR');
  const systemOf=(r)=>String(r?.rafexSystem||'').toLowerCase()==='b2b'||r?.b2bLayout||r?.b2b?'b2b':'mekik2';
  const trayPieces=(clear,width)=>{clear=Math.max(0,Math.round(Number(clear)||0));width=[200,250,300].includes(Number(width))?Number(width):300;const full=Math.floor(clear/width),rem=clear-full*width;return full+(rem>=50?1:0)};
  function accessoryRows(){
    const map=new Map();
    try{(m2LayoutState?.racks||[]).filter(r=>systemOf(r)==='b2b').forEach(r=>{
      const rowCount=Math.max(1,Number(r?.b2bLayout?.rowCount)||(r?.b2b?.rowType==='double'?2:1));
      const clear=Math.max(0,Number(r?.b2bLayout?.sectionWidth)||Number(r?.totalWidth)||0);
      (Array.isArray(r?.b2b?.accessories)?r.b2b.accessories:[]).forEach(item=>{
        const levels=[...new Set((item?.levels||[]).map(Number).filter(Number.isFinite))],ground=levels.includes(0),normal=levels.filter(n=>n>=1).length;let name='',qty=0,spec='';
        if(item.type==='palletStop'){name='Palet Dayama';spec='PALET DAYAMA';qty=(normal+(ground?2:0))*rowCount;}
        else if(item.type==='hTraverse'){name='H Travers';spec='H TRAVERS';qty=normal*rowCount;}
        else if(item.type==='tray'){const w=[200,250,300].includes(Number(item.width))?Number(item.width):300;name='Tava';spec=w+' mm';qty=normal*Math.max(1,trayPieces(clear,w))*rowCount;}
        if(!name||!qty)return;const key=name+'|'+spec,cur=map.get(key)||{name:name+(spec?' · '+spec:''),qty:0};cur.qty+=qty;map.set(key,cur);
      });
    });}catch{}
    return [...map.values()];
  }
  try{
    const prev=window.m2LayoutProductRows;
    if(typeof prev==='function'&&!prev.__rafexV6){
      const wrap=function(){
        let rows=prev.apply(this,arguments)||[];const extras=accessoryRows(),wrongAdded=extras.reduce((s,r)=>s+(Number(r.qty)||0),0);
        rows=Array.isArray(rows)?rows.map(r=>({...r})):[];
        // v5 genel merge, layout satirlarinda item yerine name kullanildigi icin ekstra adedi ilk satira ekleyebiliyordu.
        if(wrongAdded>0&&rows.length&&Number(rows[0].qty)>=wrongAdded)rows[0].qty=Number(rows[0].qty)-wrongAdded;
        rows=rows.filter(r=>{const n=low(r?.name);return !(n==='palet dayama'||n==='h travers'||n.startsWith('tava ·'));});
        extras.forEach(e=>{const f=rows.find(r=>low(r?.name)===low(e.name));if(f)f.qty=(Number(f.qty)||0)+e.qty;else rows.push({...e});});
        if(typeof window.rafexProductRank==='function')rows.sort((a,b)=>window.rafexProductRank(a.name)-window.rafexProductRank(b.name)||String(a.name||'').localeCompare(String(b.name||''),'tr'));
        return rows.filter(r=>Number(r.qty)>0);
      };wrap.__rafexV6=true;try{m2LayoutProductRows=wrap}catch{}window.m2LayoutProductRows=wrap;
    }
  }catch(e){console.warn('v6 layout urun duzeltme',e)}
})();</script>`;
const bodyEnd=html.lastIndexOf('</body>');if(bodyEnd<0)throw new Error('v6 body yok');html=html.slice(0,bodyEnd)+runtime+html.slice(bodyEnd);
const encoded=Buffer.from(html,'utf8').toString('base64');
worker=worker.slice(0,match.index)+match[1]+match[2]+encoded+match[2]+worker.slice(match.index+match[0].length);
fs.writeFileSync(workerPath,worker);
console.log('FINAL v6: Serbest Cizim B2B aksesuar adetleri dogru satirlara ayrildi; ilk urun satirina yanlis adet eklenmesi engellendi.');
