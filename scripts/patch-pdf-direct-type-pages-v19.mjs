import fs from "node:fs";
import path from "node:path";

const workerPath = path.join(process.cwd(), "dist/server/index.js");
let worker = fs.readFileSync(workerPath, "utf8");
const match = worker.match(/(const\s+HTML_BASE64\s*=\s*)(["'])([A-Za-z0-9+/=]+)\2/);
if (!match) throw new Error("PDF direct type pages v19: HTML_BASE64 bulunamadi");
let html = Buffer.from(match[3], "base64").toString("utf8");
html = html
  .replace(/<style\s+data-rafex-pdf-direct-types="v19">[\s\S]*?<\/style>\s*/g, "")
  .replace(/<script\s+data-rafex-pdf-direct-types="v19">[\s\S]*?<\/script>\s*/g, "");

const runtime = String.raw`<style data-rafex-pdf-direct-types="v19">
/* FINAL PDF AUTHORITY — type-driven, never fixed by left/right system. */
.rafex-v19-type-page .rafex-v19-type-grid{
  position:absolute!important;
  inset:12.5% .65% 7%!important;
  display:grid!important;
  grid-template-columns:repeat(2,minmax(0,1fr))!important;
  grid-template-rows:minmax(0,1fr)!important;
  gap:6px!important;
  width:auto!important;height:auto!important;
  align-items:stretch!important;
  overflow:hidden!important;
}
.rafex-v19-type-card{
  min-width:0!important;min-height:0!important;
  width:100%!important;height:100%!important;
  margin:0!important;box-sizing:border-box!important;
  display:grid!important;overflow:hidden!important;
  border:1px solid #aebdcc!important;
  border-left:6px solid var(--m2-type-color,#1d5f8a)!important;
  border-radius:5px!important;background:#fff!important;
}
.rafex-v19-type-card>.rafex-v19-card-head{
  grid-column:1!important;grid-row:1!important;
  display:flex!important;flex-direction:row!important;
  align-items:center!important;justify-content:center!important;
  gap:8px!important;padding:3px 8px!important;
  background:#edf4f8!important;color:#0b2b45!important;
  border-bottom:1px solid #c6d2dc!important;
  font:900 11px/1 Arial,sans-serif!important;text-align:center!important;
}
.rafex-v19-card-head small{font:900 8px/1 Arial,sans-serif!important;color:#31516a!important}
.rafex-v19-view{
  min-width:0!important;min-height:0!important;width:100%!important;height:100%!important;
  display:grid!important;grid-template-rows:20px minmax(0,1fr)!important;
  position:relative!important;overflow:hidden!important;background:#fff!important;
}
.rafex-v19-view>.rafex-v19-view-title{
  display:grid!important;place-items:center!important;
  padding:1px!important;background:#dceaf1!important;color:#0b2b45!important;
  font:900 8px/1 Arial,sans-serif!important;text-align:center!important;
}
.rafex-v19-view>.rafex-v19-visual{
  min-width:0!important;min-height:0!important;width:100%!important;height:100%!important;
  display:grid!important;place-items:center!important;overflow:hidden!important;
}
.rafex-v19-view svg,.rafex-v19-view canvas,.rafex-v19-view img{
  display:block!important;width:100%!important;height:100%!important;
  max-width:100%!important;max-height:100%!important;min-width:0!important;min-height:0!important;
  object-fit:contain!important;margin:auto!important;
}
/* Mekik: its half-page is split only inside the card: FRONT 50% + SIDE 50%. */
.rafex-v19-type-card[data-rafex-system="mekik2"]{
  grid-template-columns:minmax(0,1fr)!important;
  grid-template-rows:28px minmax(0,1fr) minmax(0,1fr)!important;
}
.rafex-v19-type-card[data-rafex-system="mekik2"]>.rafex-v19-view:nth-of-type(1){grid-column:1!important;grid-row:2!important;border-bottom:1px solid #c6d2dc!important}
.rafex-v19-type-card[data-rafex-system="mekik2"]>.rafex-v19-view:nth-of-type(2){grid-column:1!important;grid-row:3!important}
/* B2B: its half-page is one full-height FRONT view. */
.rafex-v19-type-card[data-rafex-system="b2b"]{
  grid-template-columns:minmax(0,1fr)!important;
  grid-template-rows:28px minmax(0,1fr)!important;
}
.rafex-v19-type-card[data-rafex-system="b2b"]>.rafex-v19-view{grid-column:1!important;grid-row:2!important}
/* Detailed Mekik callouts from the approved technical front view. */
.rafex-v19-mekik-callouts{position:absolute;inset:20px 0 0;z-index:9;pointer-events:none;font-family:Arial,sans-serif}
.rafex-v19-mekik-callouts .top-stack{position:absolute;top:4px;left:50%;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:3px;white-space:nowrap}
.rafex-v19-mekik-callouts .side-gap{font:900 7px/1 Arial;color:#6c5600;background:#fff5bd;padding:2px 5px;border-radius:7px}
.rafex-v19-mekik-callouts .column-gap{font:900 7px/1 Arial;color:#fff;background:#173c2d;padding:4px 12px;border-radius:10px;min-width:145px;text-align:center}
.rafex-v19-mekik-callouts .pallet-chip{font:900 7px/1 Arial;color:#4d4300;background:#fff3a5;border:1px solid #d2a900;padding:3px 7px;border-radius:9px}
.rafex-v19-mekik-callouts .upright-chip{position:absolute;right:3.5%;top:47%;transform:translateY(-50%);background:#173c2d;color:#fff;border-radius:7px;padding:6px 9px;text-align:center;font:900 6.5px/1.2 Arial;min-width:84px}
.rafex-v19-mekik-callouts .upright-chip b{display:block;margin-top:2px;font-size:10px}
@media print{
  .rafex-v19-type-page .rafex-v19-type-grid{grid-template-columns:50% 50%!important;gap:0!important}
  .rafex-v19-type-page{break-after:page!important;page-break-after:always!important}
}
</style>
<script data-rafex-pdf-direct-types="v19">(function(){
  if(window.__rafexPdfDirectTypesV19)return;window.__rafexPdfDirectTypesV19=true;
  function fmtN(v){var n=Math.round(Number(v)||0);try{return n.toLocaleString('tr-TR')}catch(e){return String(n)}}
  function htmlEsc(v){return String(v==null?'':v).replace(/[&<>\"]/g,function(ch){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[ch]||ch})}
  function systemOf(entry){
    var d=entry&&entry.drawing||entry||{};
    var x=String(entry&&entry.rafexSystem||entry&&entry.__rafexSystem||d&&d.rafexSystem||'').toLowerCase();
    if(x==='b2b'||x==='mekik2'||x==='drive')return x;
    return d&&((d.b2bLayout)||(d.b2b))?'b2b':'mekik2';
  }
  function typeName(entry,index){return String(entry&&entry.name||entry&&entry.typeName||('Tip '+(index+1))).trim()}
  function usedTypes(){
    /* The PDF must reflect what is physically present in Serbest Cizim.  Some
       report entry points run before the saved-type cache is refreshed, so the
       live layout is the source of truth and the legacy helper is only a
       fallback. */
    try{
      if(typeof m2LayoutState!=='undefined'&&Array.isArray(m2LayoutState.racks)&&m2LayoutState.racks.length){
        return m2LayoutState.racks.filter(function(rack){return !!rack}).map(function(rack,index){
          return {name:String(rack.typeName||rack.name||('Raf Tipi '+(index+1))).trim(),drawing:rack,rackCount:1,rafexSystem:rack.rafexSystem||(rack.b2bLayout||rack.b2b?'b2b':'mekik2')};
        });
      }
    }catch(e){console.warn('v19 layout racks',e)}
    try{return typeof m2CorporateUsedTypes==='function'?(m2CorporateUsedTypes()||[]):[]}catch(e){console.warn('v19 used types',e);return[]}
  }
  function groupedUsed(){
    var map=new Map();
    usedTypes().forEach(function(entry,index){
      var sys=systemOf(entry),name=typeName(entry,index),key=sys+'|'+name.toLocaleUpperCase('tr-TR');
      if(!map.has(key)){map.set(key,{system:sys,name:name,entry:entry,rackCount:0,first:index})}
      var g=map.get(key),count=Math.max(1,Number(entry&&entry.rackCount)||1);
      g.rackCount+=count;
      var current=g.entry&&g.entry.drawing||g.entry||{},next=entry&&entry.drawing||entry||{};
      var curScore=sys==='b2b'?(Number(current&&current.b2bLayout&&current.b2bLayout.palletCount)||0):(Number(current&&current.bays)||0)*(Number(current&&current.depth)||0);
      var nextScore=sys==='b2b'?(Number(next&&next.b2bLayout&&next.b2bLayout.palletCount)||0):(Number(next&&next.bays)||0)*(Number(next&&next.depth)||0);
      if(nextScore>curScore)g.entry=entry;
    });
    return Array.from(map.values()).sort(function(a,b){return a.first-b.first});
  }
  function palletTotal(group){
    var d=group.entry&&group.entry.drawing||group.entry||{},count=Math.max(1,Number(group.rackCount)||1);
    if(group.system==='b2b')return (Number(d&&d.b2bLayout&&d.b2bLayout.palletCount)||0)*Math.max(0,Number(d&&d.levels)||0)*Math.max(1,Number(d&&d.b2bLayout&&d.b2bLayout.rowCount)||1)*count;
    return Math.max(0,Number(d&&d.bays)||0)*Math.max(0,Number(d&&d.levels)||0)*Math.max(0,Number(d&&d.depth)||0)*count;
  }
  function headHtml(group,index){
    var title=group.system==='b2b'&&/^[A-ZÇĞİÖŞÜ]+$/i.test(group.name)?group.name+' TİPİ':group.name;
    return '<div class="rafex-v19-card-head"><span>'+htmlEsc(title)+'</span><small>'+fmtN(palletTotal(group))+' PALET</small><small>'+fmtN(group.rackCount)+' ADET</small></div>';
  }
  function mekikSvg(d,mode){
    try{
      /* The approved technical renderer belongs to the FRONT cut only.  The
         SIDE cut intentionally keeps the earlier native compact projection. */
      if(mode==='front'&&typeof m2SharedScaleReportSvg==='function'){
        var technical=m2SharedScaleReportSvg(d,'front',true);
        if(technical)return technical;
      }
      if(mode==='front'&&typeof m2ReportElevationSvg==='function'){
        var report=m2ReportElevationSvg(d,mode);
        if(report)return report;
      }
      if(typeof m2MekikSetProjection!=='function')return '';
      var projection=m2MekikSetProjection(mode,d,0,0,200,112);
      var aria=mode==='front'?'Detaylı Mekik ön görünüş':'Mekik yan görünüş';
      return '<svg class="rafex-v19-mekik-'+mode+(mode==='side'?' rafex-mekik-native-side-v13':'')+'" viewBox="0 0 200 112" preserveAspectRatio="xMidYMid meet" role="img" aria-label="'+aria+'"><rect width="200" height="112" fill="#fff"/><g transform="translate(8 7) scale(.84)">'+projection+'</g></svg>';
    }catch(e){console.warn('v19 mekik svg',mode,e);return ''}
  }
  function mekikCallouts(d){
    var pallet=Math.max(600,Number(d&&d.palW)||1200),column=pallet+150,levels=Math.max(1,Math.min(15,Number(d&&d.levels)||1));
    var levelH=Math.max(380,Math.min(5000,Number(d&&d.levelH)||1580)),loadH=Math.max(300,Math.min(3000,Number(d&&d.palletHeight)||levelH-380));
    var first=Math.max(0,Math.min(5000,Number(d&&d.firstRailHeight)||430)),upright=first+(levels-1)*levelH+loadH/2;
    var side=Number(d&&d.sideClearance)||Number(d&&d.sideGap)||75;
    return '<div class="rafex-v19-mekik-callouts"><div class="top-stack"><span class="side-gap">YAN BOŞLUK · '+fmtN(side)+' + '+fmtN(side)+' mm</span><span class="column-gap">KOLON ARALIĞI · '+fmtN(column)+' mm</span><span class="pallet-chip">PALET · '+fmtN(pallet)+' mm</span></div><span class="upright-chip">AYAK UZUNLUĞU<b>'+fmtN(upright)+' mm</b></span></div>';
  }
  function gapSummary(d){try{return typeof m2PalletGapSummary==='function'?String(m2PalletGapSummary(d&&d.palletGaps||d&&d.plan&&d.plan.gaps||[])||''):''}catch(e){return''}}
  function buildMekikCard(group,index){
    var d=group.entry&&group.entry.drawing||group.entry||{};
    var front=mekikSvg(d,'front'),side=mekikSvg(d,'side');
    return '<article class="rafex-v19-type-card" data-rafex-system="mekik2" data-rafex-type-name="'+htmlEsc(group.name)+'" style="--m2-type-color:#1d5f8a">'+headHtml(group,index)+
      '<div class="rafex-v19-view"><div class="rafex-v19-view-title">ÖNDEN GÖRÜNÜŞ</div><div class="rafex-v19-visual">'+front+'</div></div>'+
      '<div class="rafex-v19-view"><div class="rafex-v19-view-title">YAN GÖRÜNÜŞ</div><div class="rafex-v19-visual">'+side+'</div></div></article>';
  }
  function driveSvg(d){
    var bays=Math.max(1,Math.min(20,Number(d&&d.bays)||1)),levels=Math.max(1,Math.min(12,Number(d&&d.levels)||1));
    var palW=Math.max(300,Number(d&&d.palW)||800),first=Math.max(0,Number(d&&d.firstRailHeight||d&&d.firstLevelHeight)||430),spacing=Math.max(380,Number(d&&d.levelH||d&&d.levelSpacing)||1580),palH=Math.max(300,Number(d&&d.palletHeight)||1200);
    var bayClear=Math.max(950,palW+150),total=bays*(bayClear+100)+100,totalH=first+(levels-1)*spacing+palH+220;
    var x0=20,y0=98,w=164,h=78,sx=w/Math.max(1,total),sz=h/Math.max(1,totalH),out=['<svg class="rafex-v19-drive-front" viewBox="0 0 200 112" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Drive-In teknik ön görünüş"><rect width="200" height="112" fill="#fff"/>'];
    for(var i=0;i<=bays;i++){var x=x0+i*(bayClear+100)*sx;out.push('<rect x="'+(x-1.5).toFixed(2)+'" y="'+(y0-h).toFixed(2)+'" width="3" height="'+h.toFixed(2)+'" rx="1" fill="#8f9893" stroke="#48544d" stroke-width=".5"/>');}
    for(var level=0;level<levels;level++){var support=first+level*spacing,y=y0-support*sz;for(var bay=0;bay<bays;bay++){var left=x0+(bay*(bayClear+100)+100)*sx,right=x0+(bay*(bayClear+100)+100+bayClear)*sx,cx=(left+right)/2,pw=Math.min(palW,bayClear-180)*sx,ph=Math.max(5,palH*sz);out.push('<rect x="'+left.toFixed(2)+'" y="'+(y-1).toFixed(2)+'" width="'+(right-left).toFixed(2)+'" height="2" fill="#d9aa00" stroke="#8e6d00" stroke-width=".35"/>');out.push('<path d="M'+left.toFixed(2)+' '+(y+1).toFixed(2)+' L'+right.toFixed(2)+' '+(y+1).toFixed(2)+'" stroke="#64716a" stroke-width="1" stroke-dasharray="2 1"/>');out.push('<rect x="'+(cx-pw/2).toFixed(2)+'" y="'+(y-ph-1).toFixed(2)+'" width="'+pw.toFixed(2)+'" height="'+ph.toFixed(2)+'" fill="#c8954b" fill-opacity=".82" stroke="#76501f" stroke-width=".45"/>');}}
    out.push('<line x1="'+x0+'" y1="102" x2="'+(x0+w)+'" y2="102" stroke="#174d36" stroke-width=".7"/><text x="100" y="109" text-anchor="middle" font-size="4.6" font-weight="800" fill="#174d36">TOPLAM '+fmtN(total)+' mm · GÖZ '+fmtN(bayClear)+' mm</text><text x="5" y="60" transform="rotate(-90 5 60)" text-anchor="middle" font-size="4.4" font-weight="800" fill="#174d36">YÜKSEKLİK '+fmtN(totalH)+' mm</text></svg>');return out.join('');
  }
  function buildDriveCard(group,index){
    var d=group.entry&&group.entry.drawing||group.entry||{};
    return '<article class="rafex-v19-type-card" data-rafex-system="drive" data-rafex-type-name="'+htmlEsc(group.name)+'" style="--m2-type-color:#7b4d14">'+headHtml(group,index)+'<div class="rafex-v19-view rafex-v19-drive-view"><div class="rafex-v19-view-title">DRIVE-IN · ÖNDEN TEKNİK GÖRÜNÜŞ</div><div class="rafex-v19-visual">'+driveSvg(d)+'</div></div></article>';
  }
  function b2bFront(d){
    try{
      var labels=typeof m2ReportDictionary==='function'?m2ReportDictionary((document.getElementById('m2ReportLanguage')||{}).value||'tr'):undefined;
      if(typeof m2B2BReportPerspectiveSvg==='function')return m2B2BReportPerspectiveSvg(d,labels,false)||'';
    }catch(e){console.warn('v19 b2b front',e)}
    return '';
  }
  function buildB2BCard(group,index){
    var d=group.entry&&group.entry.drawing||group.entry||{},visual=b2bFront(d);
    return '<article class="rafex-v19-type-card" data-rafex-system="b2b" data-rafex-type-name="'+htmlEsc(group.name)+'" style="--m2-type-color:#1d5f8a">'+headHtml(group,index)+
      '<div class="rafex-v19-view"><div class="rafex-v19-view-title">ÖNDEN GÖRÜNÜŞ · 3D İLE AYNI MODÜL</div><div class="rafex-v19-visual">'+visual+'</div></div></article>';
  }
  function buildCard(group,index){return group.system==='b2b'?buildB2BCard(group,index):group.system==='drive'?buildDriveCard(group,index):buildMekikCard(group,index)}
  function makePage(groups,pageIndex){
    var page=document.createElement('section');page.className='m2-corporate-page rafex-v19-type-page';page.id='rafex-type-page-'+(pageIndex+1);
    var header=document.createElement('header');header.className='m2-corporate-page-header';header.innerHTML='<img src="/rafex-logo.png" alt="Rafex"><b>RAF KESİTLERİ · '+(pageIndex+1)+'</b>';page.appendChild(header);
    var grid=document.createElement('div');grid.className='rafex-v19-type-grid';grid.innerHTML=groups.map(buildCard).join('');page.appendChild(grid);
    var note=document.createElement('div');note.className='m2-corporate-cut-note';note.textContent='Zemin hariç katlarda kat aralarında travers ölçüsü gösterilmemiştir. Toplam ayak boyunda travers ölçüleri hesaplanmıştır.';page.appendChild(note);
    return page;
  }
  function isOldTypePage(page){
    if(!page||page.classList.contains('rafex-v19-type-page'))return false;
    if(page.querySelector('.m2-corporate-type-grid,.m2-corporate-type-card'))return true;
    var h=String(page.querySelector('.m2-corporate-page-header b')&&page.querySelector('.m2-corporate-page-header b').textContent||'').toUpperCase();
    return h.indexOf('RAF KESİTLERİ')>=0||h.indexOf('RACK SECTIONS')>=0||h.indexOf('COUPES DU RAYONNAGE')>=0;
  }
  function renumber(host){
    var pages=Array.from(host.querySelectorAll(':scope>.m2-corporate-page')).filter(function(p){return getComputedStyle(p).display!=='none'});
    pages.forEach(function(page,index){var f=page.querySelector(':scope>.m2-corporate-page-footer');if(!f){f=document.createElement('footer');f.className='m2-corporate-page-footer';page.appendChild(f)}f.textContent=(index+1)+' / '+pages.length});
  }
  function rebuildHost(host){
    if(!host)return;
    var groups=groupedUsed();if(!groups.length)return;
    Array.from(host.querySelectorAll(':scope>.m2-corporate-page')).filter(isOldTypePage).forEach(function(p){p.remove()});
    host.querySelectorAll(':scope>.rafex-v19-type-page').forEach(function(p){p.remove()});
    var pages=Array.from(host.querySelectorAll(':scope>.m2-corporate-page'));
    var floorPage=pages.find(function(p){return !!p.querySelector('.m2-corporate-floor')});
    /* Older/free-drawing report shells do not carry the corporate-floor class.
       Insert after the floor page when available, otherwise after the final
       existing report page so B2B and Mekik sections never disappear. */
    if(!floorPage)floorPage=pages[pages.length-1];
    if(!floorPage){floorPage=document.createElement('section');floorPage.className='m2-corporate-page rafex-v19-anchor-page';host.appendChild(floorPage)}
    var anchor=floorPage;
    for(var start=0,pageIndex=0;start<groups.length;start+=2,pageIndex++){
      var page=makePage(groups.slice(start,start+2),pageIndex);anchor.insertAdjacentElement('afterend',page);anchor=page;
    }
    renumber(host);
  }
  function rebuild(){['m2CorporatePreview','m2CorporatePrint','m2CorporatePrintArea'].forEach(function(id){rebuildHost(document.getElementById(id))})}
  function schedule(){[0,20,60,120,240,480,900,1500,2300,3100].forEach(function(ms){setTimeout(rebuild,ms)})}
  try{
    var prev=window.m2RenderCorporateReport;
    if(typeof prev==='function'&&!prev.__rafexV19){var wrap=function(){var out=prev.apply(this,arguments);schedule();return out};wrap.__rafexV19=true;try{m2RenderCorporateReport=wrap}catch(e){}window.m2RenderCorporateReport=wrap}
  }catch(e){}
  try{
    var prep=window.__rafexPrepareCorporatePrint;
    if(typeof prep==='function'&&!prep.__rafexV19){var wrapPrep=async function(){var out=await prep.apply(this,arguments);rebuild();await new Promise(function(r){requestAnimationFrame(function(){rebuild();r()})});return out};wrapPrep.__rafexV19=true;window.__rafexPrepareCorporatePrint=wrapPrep}
  }catch(e){}
  schedule();
})();</script>`;

const bodyEnd = html.lastIndexOf("</body>");
if (bodyEnd < 0) throw new Error("PDF direct type pages v19: body bulunamadi");
html = html.slice(0, bodyEnd) + runtime + html.slice(bodyEnd);
const encoded = Buffer.from(html, "utf8").toString("base64");
worker = worker.slice(0, match.index) + match[1] + match[2] + encoded + match[2] + worker.slice(match.index + match[0].length);
fs.writeFileSync(workerPath, worker);
console.log("FINAL v19: type pages rebuilt directly from used Serbest racks; Mekik front/side and B2B front-only half-page cards.");
