import fs from "node:fs";
import { buildPdfFootCountGroups } from "./pdf-foot-count-core-v128.mjs";

const file = "dist/server/index.js";
let source = fs.readFileSync(file, "utf8");
const match = source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);
if (!match) throw new Error("HTML_BASE64 not found for PDF foot count v128");
let html = Buffer.from(match[2], "base64").toString("utf8");

html = html
  .replace(/<style data-rafex-pdf-foot-count="v128">[\s\S]*?<\/style>/g, "")
  .replace(/<script data-rafex-pdf-foot-count="v128">[\s\S]*?<\/script>/g, "");

const groupBuilder = buildPdfFootCountGroups.toString().replace("buildPdfFootCountGroups", "rafexBuildPdfFootCountGroupsV128");
const runtime = String.raw`
<style data-rafex-pdf-foot-count="v128">
.rafex-pdf-foot-label-v128{pointer-events:none}
.rafex-pdf-foot-label-v128 rect{fill:#fff!important;fill-opacity:.98!important;stroke:#0b2b45!important;stroke-width:1.5!important;vector-effect:non-scaling-stroke;rx:2;ry:2}
.rafex-pdf-foot-label-v128 text{fill:#0b2b45!important;font:900 7px Arial,sans-serif!important;letter-spacing:.01em;paint-order:stroke;stroke:#fff;stroke-width:1.4px;stroke-linejoin:round;text-rendering:geometricPrecision}
.rafex-pdf-foot-label-v128 .rafex-pdf-foot-label-main-v128{font-size:8px!important}
.rafex-pdf-foot-summary-v128{position:absolute;z-index:12;right:8px;bottom:7px;width:min(49%,310px);overflow:hidden;border:2px solid #0b2b45;border-radius:5px;background:#fff;box-shadow:0 2px 7px #0b2b4529;color:#0b2b45;font:800 8px/1.2 Arial,sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.rafex-pdf-foot-summary-v128>strong{display:block;padding:5px 7px;background:#0b2b45;color:#fff;font-size:9px;letter-spacing:.04em}
.rafex-pdf-foot-summary-v128 .rafex-pdf-foot-summary-row-v128{display:grid;grid-template-columns:25px minmax(0,1fr) 44px 52px;gap:3px;align-items:center;padding:4px 6px;border-top:1px solid #cad6de}
.rafex-pdf-foot-summary-v128 .rafex-pdf-foot-summary-row-v128:first-of-type{border-top:0}
.rafex-pdf-foot-summary-v128 .rafex-pdf-foot-summary-total-v128{background:#eaf2f6;font-weight:900}
.rafex-pdf-foot-summary-v128 span,.rafex-pdf-foot-summary-v128 b{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.rafex-pdf-foot-count-body-v128{position:absolute;inset:13% 2.2% 5%;display:flex;flex-direction:column;gap:10px}
.rafex-pdf-foot-count-note-v128{padding:10px 13px;border-left:6px solid #3e8fb2;background:#edf4f8;color:#294d66;font-size:12px;line-height:1.35}
.rafex-pdf-foot-count-grid-v128{overflow:hidden;border:2px solid #0b2b45;border-radius:7px;background:#fff}
.rafex-pdf-foot-count-row-v128{display:grid;grid-template-columns:7% 30% 10% 10% 10% 15% 18%;align-items:stretch;min-height:34px;border-top:1px solid #b8c8d5}
.rafex-pdf-foot-count-row-v128:first-child{border-top:0}
.rafex-pdf-foot-count-row-v128>*{display:flex;align-items:center;padding:6px 8px;border-left:1px solid #b8c8d5;font-size:12px;line-height:1.15}
.rafex-pdf-foot-count-row-v128>*:first-child{border-left:0}
.rafex-pdf-foot-count-head-v128{min-height:42px;background:#0b2b45;color:#fff;font-weight:900;text-transform:uppercase}
.rafex-pdf-foot-count-total-v128{background:#dceaf1;color:#0b2b45;font-weight:900}
.rafex-pdf-foot-count-row-v128 b{font-size:14px}
@media print{.rafex-pdf-foot-summary-v128{box-shadow:none}.rafex-pdf-foot-count-grid-v128{break-inside:avoid}}
</style>
<script data-rafex-pdf-foot-count="v128">(function(){
  if(window.__rafexPdfFootCountV128)return;
  window.__rafexPdfFootCountV128=true;
  ${groupBuilder}
  function byId(id){return document.getElementById(id)}
  function racks(){try{return Array.isArray(m2LayoutState.racks)?m2LayoutState.racks:[]}catch(_){return[]}}
  function groups(){return rafexBuildPdfFootCountGroupsV128(racks())}
  function safe(value){return String(value==null?'':value).replace(/[&<>"']/g,function(char){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]})}
  function number(value){try{return Math.round(Number(value)||0).toLocaleString((byId('m2ReportLanguage')?.value||'tr')==='tr'?'tr-TR':'en-US')}catch(_){return String(Math.round(Number(value)||0))}}
  function words(){var lang=byId('m2ReportLanguage')?.value||'tr';return lang==='en'?{title:'UPRIGHT COUNT TABLE',note:'Counted from connected rack groups. Shared frames are counted once.',module:'MODULE',row:'ROW',team:'UPRIGHT FRAME',upright:'UPRIGHT / BASE',total:'PROJECT TOTAL',block:'BLOCK / TYPE'}:lang==='fr'?{title:'TABLEAU DE COMPTAGE DES MONTANTS',note:'Comptage par groupes de racks reliés. Les cadres communs ne sont comptés qu’une fois.',module:'MODULE',row:'RANGÉE',team:'CADRE',upright:'MONTANT / PIED',total:'TOTAL PROJET',block:'BLOC / TYPE'}:{title:'AYAK SAYIM TABLOSU',note:'Birbirine bağlı raf gruplarından hesaplanmıştır. Ortak ayak takımları yalnızca bir kez sayılır.',module:'MODÜL',row:'SIRA',team:'AYAK TAKIMI',upright:'DİKME / PABUÇ',total:'PROJE TOPLAMI',block:'BLOK / TİP'}}
  function decorateSvg(svg,list){
    if(!svg)return;svg.querySelectorAll('.rafex-pdf-foot-label-v128').forEach(function(node){node.remove()});
    var view=(svg.getAttribute('viewBox')||'0 0 1000 650').trim().split(/\s+/).map(Number),vx=Number.isFinite(view[0])?view[0]:0,vy=Number.isFinite(view[1])?view[1]:0,vw=Number.isFinite(view[2])&&view[2]>0?view[2]:1000,vh=Number.isFinite(view[3])&&view[3]>0?view[3]:650;
    var ns='http://www.w3.org/2000/svg',boxW=Math.max(112,Math.min(146,vw*.15)),boxH=Math.max(25,Math.min(31,vh*.048)),fontScale=Math.max(.8,Math.min(1.35,vw/1000)),placed=[];
    (list||groups()).forEach(function(group){
      var x=Math.max(vx+4,Math.min(vx+vw-boxW-4,group.bounds.cx-boxW/2)),y=group.bounds.bottom+7;
      if(y+boxH>vy+vh-4)y=group.bounds.top-boxH-7;
      for(var attempt=0;attempt<6&&placed.some(function(box){return x<box.x+box.w&&x+boxW>box.x&&y<box.y+box.h&&y+boxH>box.y});attempt++)y+=boxH+4;
      if(y+boxH>vy+vh-4)y=Math.max(vy+4,group.bounds.top-boxH-7);placed.push({x:x,y:y,w:boxW,h:boxH});
      var node=document.createElementNS(ns,'g');node.setAttribute('class','rafex-pdf-foot-label-v128');node.setAttribute('transform','translate('+x+' '+y+')');node.setAttribute('data-group',group.code);
      var rect=document.createElementNS(ns,'rect');rect.setAttribute('width',boxW);rect.setAttribute('height',boxH);node.appendChild(rect);
      var main=document.createElementNS(ns,'text');main.setAttribute('x',6);main.setAttribute('y',10*fontScale);main.setAttribute('class','rafex-pdf-foot-label-main-v128');main.textContent=group.code+' · '+group.moduleCount+' MODÜL';node.appendChild(main);
      var sub=document.createElementNS(ns,'text');sub.setAttribute('x',6);sub.setAttribute('y',21*fontScale);sub.textContent=group.footTeamCount+' AYAK TK · '+group.uprightCount+' DİKME';node.appendChild(sub);svg.appendChild(node);
    });
  }
  function summary(host,list){
    if(!host)return;host.querySelectorAll('.rafex-pdf-foot-summary-v128').forEach(function(node){node.remove()});if(!list.length)return;
    var w=words(),totalTeams=list.reduce(function(sum,item){return sum+item.footTeamCount},0),totalUprights=list.reduce(function(sum,item){return sum+item.uprightCount},0),shown=list.slice(0,4);
    var node=document.createElement('div');node.className='rafex-pdf-foot-summary-v128';node.innerHTML='<strong>'+safe(w.title)+'</strong>'+shown.map(function(item){return '<div class="rafex-pdf-foot-summary-row-v128"><b>'+safe(item.code)+'</b><span title="'+safe(item.block)+'">'+safe(item.block)+'</span><span>'+number(item.footTeamCount)+' TK</span><span>'+number(item.uprightCount)+' DİKME</span></div>'}).join('')+(list.length>shown.length?'<div class="rafex-pdf-foot-summary-row-v128"><b>+'+(list.length-shown.length)+'</b><span>Diğer gruplar</span><span></span><span></span></div>':'')+'<div class="rafex-pdf-foot-summary-row-v128 rafex-pdf-foot-summary-total-v128"><b>Σ</b><span>'+safe(w.total)+'</span><span>'+number(totalTeams)+' TK</span><span>'+number(totalUprights)+' DİKME</span></div>';host.appendChild(node);
  }
  function tablePages(list){
    var w=words(),pages=[];
    for(var start=0;start<Math.max(1,list.length);start+=14){
      var slice=list.slice(start,start+14),section=document.createElement('section');section.className='m2-corporate-page rafex-pdf-foot-count-page-v128';
      var rows=slice.map(function(item){return '<div class="rafex-pdf-foot-count-row-v128"><b>'+safe(item.code)+'</b><span>'+safe(item.block)+'</span><span>'+safe(item.system)+'</span><span>'+number(item.moduleCount)+'</span><span>'+number(item.rowCount)+'</span><b>'+number(item.footTeamCount)+'</b><b>'+number(item.uprightCount)+'</b></div>'}).join('');
      var totals=list.reduce(function(out,item){out.modules+=item.moduleCount;out.teams+=item.footTeamCount;out.uprights+=item.uprightCount;return out},{modules:0,teams:0,uprights:0});
      var totalRow=start+14>=list.length?'<div class="rafex-pdf-foot-count-row-v128 rafex-pdf-foot-count-total-v128"><b>Σ</b><b>'+safe(w.total)+'</b><span>—</span><b>'+number(totals.modules)+'</b><span>—</span><b>'+number(totals.teams)+'</b><b>'+number(totals.uprights)+'</b></div>':'';
      section.innerHTML='<header class="m2-corporate-page-header"><img src="/rafex-logo.png" alt="Rafex"><b>'+safe(w.title)+(list.length>14?' · '+(Math.floor(start/14)+1):'')+'</b></header><div class="rafex-pdf-foot-count-body-v128"><div class="rafex-pdf-foot-count-note-v128">'+safe(w.note)+'</div><div class="rafex-pdf-foot-count-grid-v128"><div class="rafex-pdf-foot-count-row-v128 rafex-pdf-foot-count-head-v128"><span>GRUP</span><span>'+safe(w.block)+'</span><span>SİSTEM</span><span>'+safe(w.module)+'</span><span>'+safe(w.row)+'</span><span>'+safe(w.team)+'</span><span>'+safe(w.upright)+'</span></div>'+rows+totalRow+'</div></div>';pages.push(section);
    }
    return pages;
  }
  function renumber(host){var pages=Array.from(host.querySelectorAll(':scope > .m2-corporate-page')),total=pages.length;pages.forEach(function(page,index){page.querySelectorAll(':scope > .m2-corporate-page-footer').forEach(function(node){node.remove()});var footer=document.createElement('footer');footer.className='m2-corporate-page-footer';footer.textContent=(index+1)+' / '+total;page.appendChild(footer)})}
  var baseA4=typeof m2RenderA4Report==='function'?m2RenderA4Report:null;
  if(baseA4){var wrappedA4=function(){var result=baseA4.apply(this,arguments),list=groups(),host=byId('m2ReportFloor'),svg=host?.querySelector(':scope > svg');decorateSvg(svg,list);summary(host,list);return result};wrappedA4.__rafexPdfFootCountV128=true;m2RenderA4Report=wrappedA4;window.m2RenderA4Report=wrappedA4}
  var baseBuild=typeof m2BuildCorporatePages==='function'?m2BuildCorporatePages:null;
  if(baseBuild){var wrappedBuild=function(){var raw=baseBuild.apply(this,arguments),template=document.createElement('template');template.innerHTML=raw;var host=template.content,list=groups();host.querySelectorAll('.m2-corporate-floor svg').forEach(function(svg){decorateSvg(svg,list)});var floor=host.querySelector('.m2-corporate-floor')?.closest('.m2-corporate-page'),cursor=floor;tablePages(list).forEach(function(page){if(cursor){cursor.after(page);cursor=page}else host.appendChild(page)});var shell=document.createElement('div');shell.appendChild(host.cloneNode(true));renumber(shell);return shell.innerHTML};wrappedBuild.__rafexPdfFootCountV128=true;m2BuildCorporatePages=wrappedBuild;window.m2BuildCorporatePages=wrappedBuild}
  window.rafexPdfFootCountV128={groups:groups,decorateSvg:decorateSvg,refresh:function(){if(typeof m2RefreshActiveReport==='function')m2RefreshActiveReport()}};
})();</script>`;

const close = html.lastIndexOf("</body>");
if (close < 0) throw new Error("body close missing for PDF foot count v128");
html = html.slice(0, close) + runtime + "\n" + html.slice(close);

for (const required of [
  'data-rafex-pdf-foot-count="v128"',
  "rafexBuildPdfFootCountGroupsV128",
  "AYAK SAYIM TABLOSU",
  "DİKME / PABUÇ",
  "rafex-pdf-foot-label-v128",
  "rafexPdfFootCountV128",
]) if (!html.includes(required)) throw new Error("PDF foot count v128 missing: " + required);

const encoded = Buffer.from(html).toString("base64");
source = source.slice(0, match.index) + match[0].replace(match[2], encoded) + source.slice(match.index + match[0].length);
fs.writeFileSync(file, source);
console.log("v128: PDF genel yerlesim grup etiketleri ve ayak/dikme sayim tablosu eklendi.");

