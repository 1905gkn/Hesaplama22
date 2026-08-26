import fs from "node:fs";
import path from "node:path";

const workerPath = path.join(process.cwd(), "dist/server/index.js");
let worker = fs.readFileSync(workerPath, "utf8");
const match = worker.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);
if (!match) throw new Error("Konsol Ortak Cizim UI v43: HTML_BASE64 bulunamadi");

let html = Buffer.from(match[2], "base64").toString("utf8");
html = html
  .replace(/<style\s+data-rafex-konsol-ortak-ui="v43">[\s\S]*?<\/style>/g, "")
  .replace(/<script\s+data-rafex-konsol-ortak-ui="v43">[\s\S]*?<\/script>/g, "");

const runtime = String.raw`<style data-rafex-konsol-ortak-ui="v43">
#page .konsol-free-card.konsol-ortak-floor{grid-column:1/-1;margin-top:18px;padding:16px;background:#fff;border:1px solid var(--line,#d8e2db);border-radius:14px}
#page .konsol-ortak-floor .konsol-free-head{display:flex;align-items:flex-end;justify-content:space-between;gap:12px;margin:0 0 10px}
#page .konsol-ortak-floor .konsol-free-head h3{margin:0;font-size:15px;color:var(--g,#173c2d)}
#page .konsol-ortak-floor .konsol-free-head p{margin:5px 0 0;color:var(--muted,#68736c);font-size:10px}
#page .konsol-area-summary{display:grid;grid-template-columns:repeat(2,minmax(105px,1fr));gap:8px;flex:0 0 auto}
#page .konsol-area-summary span{padding:7px 9px;border:1px solid #d8e2db;border-radius:8px;background:#f7faf8;color:#68736c;font-size:8px;font-weight:900;text-transform:uppercase}
#page .konsol-area-summary b{display:block;margin-top:2px;color:#173c2d;font-size:11px;text-transform:none}
#page .konsol-key-help{display:flex;align-items:center;gap:7px;flex-wrap:wrap;margin:0 0 10px;padding:8px 10px;border:1px solid #d8e2db;border-radius:9px;background:#f7faf8;color:#536058;font-size:9px;font-weight:800}
#page .konsol-key-help strong{color:#173c2d;font-size:9px;letter-spacing:.08em}
#page .konsol-key-help kbd{padding:3px 6px;border:1px solid #cbd8d0;border-radius:5px;background:#fff;color:#173c2d;font:900 9px Arial,sans-serif;box-shadow:0 1px 0 #cbd8d0}
#page .konsol-ortak-floor .konsol-free-tools{display:grid;grid-template-columns:minmax(280px,1fr) minmax(240px,.75fr);gap:18px;margin:0 0 10px;padding:12px 0;border-top:1px solid #e2e8e4;border-bottom:1px solid #e2e8e4}
#page .konsol-tool-group{display:flex;align-content:flex-start;align-items:flex-start;gap:7px;flex-wrap:wrap}
#page .konsol-tool-group-title{flex:0 0 100%;color:#728078;font-size:8px;font-weight:950;letter-spacing:.12em;text-transform:uppercase}
#page .konsol-ortak-floor .konsol-free-tools button{min-height:36px;padding:8px 12px;border:1px solid #c8d5cc;border-radius:8px;background:#f5f8f6;color:var(--g,#173c2d);font-size:10px;font-weight:800;cursor:pointer}
#page .konsol-ortak-floor .konsol-free-tools button.primary{background:var(--g,#173c2d);border-color:var(--g,#173c2d);color:#fff}
#page .konsol-ortak-floor .konsol-free-tools button.danger{background:#fff7f7;border-color:#e3bcbc;color:#9b2f2f}
#page .konsol-canvas-wrap{position:relative}
#page .konsol-canvas-frame{overflow:auto;border:1px solid #cbd6ce;border-radius:12px;background:#f8faf9}
#page #konsolFreeSvg{display:block;width:100%;height:auto;min-height:520px;aspect-ratio:5/3;border:0;border-radius:0;background:#fff;touch-action:none;user-select:none}
#page .konsol-layout-zoom{position:absolute;z-index:4;right:12px;top:12px;display:flex;gap:4px;padding:4px;border:1px solid #c8d5cc;border-radius:9px;background:#fffe;box-shadow:0 3px 12px #18352a18}
#page .konsol-layout-zoom button{min-width:32px;height:31px;padding:0;border:1px solid #d4ded7;border-radius:6px;background:#fff;color:#173c2d;font-weight:900;cursor:pointer}
#page .konsol-layout-zoom button:nth-child(2){min-width:49px;font-size:9px}
#page .konsol-ortak-floor .konsol-free-status{min-height:17px;margin:8px 0 0;color:#607067;font-size:10px;font-weight:700}
#page .konsol-floor-note{margin:8px 2px 0;padding:9px 12px;border-left:4px solid #e0a600;border-radius:7px;background:#fff9dc;color:#536058;font-size:10px;font-weight:800;line-height:1.5}
#page .konsol-pdf-card.konsol-ortak-report{grid-column:1/-1;display:block;margin:0;padding:0;border:0;background:transparent;overflow:visible}
#page .konsol-pdf-topbar,#page .konsol-project-actions{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:14px;border:1px solid #d5e0d8;border-radius:14px;background:#f5f9f6}
#page .konsol-pdf-title{display:flex;align-items:baseline;gap:3px;min-width:265px}
#page .konsol-pdf-title b,#page .konsol-project-actions b{color:#07130e;font-size:12px}
#page .konsol-pdf-title small,#page .konsol-project-actions small{color:#68736c;font-size:9px}
#page .konsol-output-actions{display:flex;align-items:flex-end;justify-content:flex-end;gap:8px;flex-wrap:wrap}
#page .konsol-output-actions label{display:grid;gap:3px;color:#34463d;font-size:7px;font-weight:950;letter-spacing:.08em}
#page .konsol-output-actions select{min-width:130px;height:38px;padding:7px 10px;border:1px solid #c8d5cc;border-radius:8px;background:#fff;color:#173c2d;font-size:9px;font-weight:900}
#page .konsol-output-actions button,#page .konsol-project-actions button{min-height:38px;padding:9px 13px;border:1px solid #c8d5cc;border-radius:8px;background:#fff;color:#173c2d;font-size:10px;font-weight:900;cursor:pointer}
#page .konsol-output-actions .primary-green,#page #konsolProjectSave{border-color:#173c2d;background:#173c2d;color:#fff}
#page .konsol-output-actions .primary-red,#page .konsol-project-actions #konsolPdf{border-color:#8b1723;background:#8b1723;color:#fff}
#page .konsol-output-check{display:flex!important;grid-auto-flow:column;align-items:center;gap:6px!important;height:38px;padding:0 10px;border:1px solid #c8d5cc;border-radius:8px;background:#fff;color:#173c2d!important;font-size:8px!important;white-space:nowrap}
#page .konsol-output-check input{width:14px;height:14px;margin:0;accent-color:#173c2d}
#page .konsol-output-preview{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px;padding:12px;border:1px solid #d5e0d8;border-radius:14px;background:#eef3f0}
#page .konsol-output-preview[hidden],#page .konsol-output-status[hidden]{display:none!important}
#page .konsol-output-preview.three{grid-template-columns:1fr 1fr 1fr}
#page .konsol-output-zone{position:relative;min-height:300px;padding:22px 8px 8px;border:1px solid #cdd8d1;border-radius:9px;background:#fff;overflow:hidden}
#page .konsol-output-zone>span{position:absolute;left:8px;top:7px;color:#6b7770;font-size:8px;font-weight:950;letter-spacing:.1em}
#page .konsol-output-zone img,#page .konsol-output-zone svg{display:block;width:100%;height:270px;object-fit:contain}
#page .konsol-output-empty{display:grid;place-items:center;height:270px;color:#809087;font-size:10px;font-weight:800;text-align:center}
#page .konsol-output-specs{display:grid;align-content:start;gap:6px;padding:10px}
#page .konsol-output-specs div{display:flex;justify-content:space-between;gap:10px;padding:7px;border-bottom:1px solid #e2e8e4;color:#68736c;font-size:9px;font-weight:800}
#page .konsol-output-specs b{color:#173c2d;text-align:right}
#page .konsol-output-status{margin-bottom:12px;padding:9px 14px;border:1px solid #dbe4de;border-top:0;border-radius:0 0 10px 10px;color:#607067;font-size:9px;font-weight:700;background:#fff}
#page .konsol-project-actions{margin-top:12px;min-height:76px}
#page .konsol-project-copy{display:grid;gap:2px}
#page .konsol-project-list{display:flex;gap:6px;flex-wrap:wrap;margin-top:4px}
#page .konsol-project-list button{min-height:26px;padding:5px 8px;background:#fff;color:#173c2d;font-size:8px}
#page .konsol-project-buttons{display:flex;gap:8px;align-items:center}
@media(max-width:1050px){#page .konsol-pdf-topbar,#page .konsol-project-actions{align-items:stretch;flex-direction:column}#page .konsol-output-actions,#page .konsol-project-buttons{justify-content:flex-start}}
@media(max-width:900px){#page .konsol-ortak-floor .konsol-free-head{align-items:stretch;flex-direction:column}#page .konsol-area-summary{width:100%}#page .konsol-ortak-floor .konsol-free-tools,#page .konsol-output-preview,#page .konsol-output-preview.three{grid-template-columns:1fr}#page .konsol-output-actions{justify-content:flex-start}}
</style>
<script data-rafex-konsol-ortak-ui="v43">(function(){
  if(window.__rafexKonsolOrtakUiV43)return;window.__rafexKonsolOrtakUiV43=true;
  var baseRender=window.renderKonsol,zoom=1,previewTimer=0,observer=null,projectKey='rafex_konsol_projects_v1';
  function e(id){return document.getElementById(id)}
  function fmt(value){try{return Math.round(Number(value)||0).toLocaleString('tr-TR')}catch(_){return String(value||0)}}
  function setZoom(next){zoom=Math.max(1,Math.min(2.4,Number(next)||1));var svg=e('konsolFreeSvg');if(!svg)return;var w=50000/zoom,h=30000/zoom;svg.setAttribute('viewBox',[(50000-w)/2,(30000-h)/2,w,h].join(' '));var label=e('konsolZoomLabel');if(label)label.textContent=Math.round(zoom*100)+'%'}
  function group(title,buttons){var node=document.createElement('div');node.className='konsol-tool-group';var label=document.createElement('span');label.className='konsol-tool-group-title';label.textContent=title;node.appendChild(label);buttons.forEach(function(button){if(button)node.appendChild(button)});return node}
  function snapshot(){
    var preview=e('konsolOutputPreview');if(!preview)return;
    var left=e('konsolOutput3D'),right=e('konsolOutputPlan'),specs=e('konsolOutputSpecs'),canvas=e('konsolCanvas'),svg=e('konsolFreeSvg');
    if(left){left.replaceChildren();if(canvas){try{var img=document.createElement('img');img.alt='Konsol kollu 3D görünüş';img.src=canvas.toDataURL('image/png');left.appendChild(img)}catch(_){}}if(!left.childNodes.length){var empty=document.createElement('div');empty.className='konsol-output-empty';empty.textContent='3D görünüş hazır olduğunda burada gösterilir.';left.appendChild(empty)}}
    if(right){right.replaceChildren();if(svg){var clone=svg.cloneNode(true);clone.removeAttribute('id');clone.setAttribute('aria-label','Konsol kollu serbest yerleşim çıktısı');right.appendChild(clone)}if(!right.childNodes.length){var none=document.createElement('div');none.className='konsol-output-empty';none.textContent='Serbest yerleşime raf eklediğinde burada gösterilir.';right.appendChild(none)}}
    if(specs){var value=function(id,fallback){return e(id)&&e(id).value||fallback};var rows=[['Sistem',value('konsolSide','single')==='double'?'Çift taraflı':'Tek taraflı'],['Ayak adedi',fmt(value('konsolUprightCount',2))],['Ayak merkez aralığı',fmt(value('konsolSpacing',1500))+' mm'],['Ayak yüksekliği',fmt(value('konsolHeight',4500))+' mm'],['Kol derinliği',fmt(value('konsolArmLength',1200))+' mm'],['Kattaki ağırlık',fmt(value('konsolLevelLoad',500))+' kg']];specs.innerHTML=rows.map(function(row){return'<div><span>'+row[0]+'</span><b>'+row[1]+'</b></div>'}).join('')}
    var status=e('konsolOutputStatus');if(status)status.textContent='Önizleme güncellendi · 3D görünüş ve Serbest Yerleşim tek yatay A4 çıktıda.';
  }
  function createOutput(){var preview=e('konsolOutputPreview'),status=e('konsolOutputStatus');if(preview)preview.hidden=false;if(status)status.hidden=false;snapshot();preview?.scrollIntoView?.({behavior:'smooth',block:'nearest'})}
  function projects(){try{return JSON.parse(localStorage.getItem(projectKey)||'[]')||[]}catch(_){return[]}}
  function renderProjects(){var list=e('konsolProjectList'),rows=projects();if(!list)return;list.innerHTML=rows.length?rows.map(function(row,index){return'<button type="button" data-konsol-project="'+index+'">'+row.name+' · '+row.date+'</button>'}).join(''):'<small>Henüz proje kaydı yok.</small>'}
  function saveProject(){var rows=projects(),name=(e('konsolProjectName')&&e('konsolProjectName').value||'Konsol Projesi').trim()||'Konsol Projesi';rows.unshift({name:name,date:new Date().toLocaleDateString('tr-TR')});rows=rows.slice(0,20);try{localStorage.setItem(projectKey,JSON.stringify(rows))}catch(_){}renderProjects();var status=e('konsolOutputStatus');if(status){status.hidden=false;status.textContent=name+' kaydedildi.'}}
  function toggleThird(){var preview=e('konsolOutputPreview'),zone=e('konsolOutputSpecZone'),on=!!e('konsolThreeView')?.checked;if(preview)preview.classList.toggle('three',on);if(zone)zone.hidden=!on;if(!preview?.hidden)snapshot()}
  function scheduleSnapshot(){clearTimeout(previewTimer);previewTimer=setTimeout(snapshot,180)}
  function enhance(){
    var page=e('page'),free=page&&page.querySelector('.konsol-free-card'),pdf=page&&page.querySelector('.konsol-pdf-card');if(!free||!pdf)return false;
    if(free.dataset.rafexOrtakUi==='1'){scheduleSnapshot();return true}free.dataset.rafexOrtakUi='1';free.classList.add('konsol-ortak-floor','m2-floor-editor');
    var head=free.querySelector('.konsol-free-head');if(head&&!head.querySelector('.konsol-area-summary')){var area=document.createElement('div');area.className='konsol-area-summary';area.innerHTML='<span>Alan eni<b>50.000 mm</b></span><span>Alan boyu<b>30.000 mm</b></span>';head.appendChild(area)}
    var tools=free.querySelector('.konsol-free-tools');if(tools&&!tools.querySelector('.konsol-tool-group')){var add=e('konsolFreeAdd'),dup=e('konsolFreeDup'),rotate=e('konsolFreeRotate'),del=e('konsolFreeDelete'),clear=e('konsolFreeClear');tools.replaceChildren(group('Raf İşlemleri',[add,dup,rotate,del]),group('Çizim İşlemleri',[clear]))}
    if(tools&&!free.querySelector('.konsol-key-help')){var help=document.createElement('div');help.className='konsol-key-help';help.innerHTML='<strong>KLAVYE</strong><kbd>DEL</kbd><span>Seçileni sil</span><kbd>ESC</kbd><span>Seçimi bırak</span><kbd>CTRL + D</kbd><span>Çoğalt</span>';tools.insertAdjacentElement('beforebegin',help)}
    var svg=e('konsolFreeSvg');if(svg&&!svg.closest('.konsol-canvas-wrap')){var wrap=document.createElement('div');wrap.className='konsol-canvas-wrap';var frame=document.createElement('div');frame.className='konsol-canvas-frame';svg.parentNode.insertBefore(wrap,svg);wrap.appendChild(frame);frame.appendChild(svg);var z=document.createElement('div');z.className='konsol-layout-zoom';z.setAttribute('aria-label','Yerleşim yakınlaştırma');z.innerHTML='<button type="button" data-konsol-zoom="out" aria-label="Yerleşimi uzaklaştır">−</button><button type="button" id="konsolZoomLabel" data-konsol-zoom="fit" title="Yerleşimi sığdır">100%</button><button type="button" data-konsol-zoom="in" aria-label="Yerleşimi yakınlaştır">+</button>';wrap.appendChild(z);z.addEventListener('click',function(event){var action=event.target&&event.target.dataset.konsolZoom;if(action==='out')setZoom(zoom-.2);if(action==='fit')setZoom(1);if(action==='in')setZoom(zoom+.2)})}
    var status=e('konsolFreeStatus');if(status&&!free.querySelector('.konsol-floor-note')){var note=document.createElement('div');note.className='konsol-floor-note';note.textContent='Rafı seçip sürükleyerek yerleştir. Alan dışına veya başka bir konsol rafının üzerine bırakılamaz.';status.insertAdjacentElement('afterend',note)}
    pdf.dataset.rafexOrtakUi='1';pdf.classList.add('konsol-ortak-report','m2-report-panel');var copy=pdf.querySelector(':scope>div'),print=e('konsolPdf');if(copy)copy.remove();var topbar=document.createElement('div');topbar.className='konsol-pdf-topbar';topbar.innerHTML='<div class="konsol-pdf-title"><b>PDF Çıktı Alanı</b><small>Konsol Kollu için tek proje çıktısı</small></div><div class="konsol-output-actions"><button type="button" id="konsolViewRefresh" class="primary-green">Görünüşü Güncelle</button><button type="button" id="konsolCreateOutput" class="primary-red">Çıktıyı Oluştur</button><label>ÇIKTI TİPİ<select aria-label="Konsol çıktı tipi"><option>Kurumsal Çıktı</option></select></label><label class="konsol-output-check"><input id="konsolProductTotal" type="checkbox">ÜRÜN DÖKÜMÜ TOPLU</label><label>ÇIKTI DİLİ<select id="konsolOutputLanguage"><option>TR · Türkçe</option><option>EN · English</option><option>FR · Français</option></select></label><label class="konsol-output-check"><input id="konsolThreeView" type="checkbox">3’LÜ GÖSTER</label></div>';pdf.appendChild(topbar);var output=document.createElement('div');output.id='konsolOutputPreview';output.className='konsol-output-preview';output.hidden=true;output.innerHTML='<section class="konsol-output-zone"><span>3D / ÖN GÖRÜNÜŞ</span><div id="konsolOutput3D"></div></section><section class="konsol-output-zone"><span>SERBEST YERLEŞİM</span><div id="konsolOutputPlan"></div></section><section class="konsol-output-zone" id="konsolOutputSpecZone" hidden><span>TEKNİK BİLGİLER</span><div id="konsolOutputSpecs" class="konsol-output-specs"></div></section>';var outputStatus=document.createElement('div');outputStatus.id='konsolOutputStatus';outputStatus.className='konsol-output-status';outputStatus.hidden=true;outputStatus.textContent='Çıktı önizlemesi hazırlanıyor…';var projectsBar=document.createElement('div');projectsBar.className='konsol-project-actions';projectsBar.innerHTML='<div class="konsol-project-copy"><b>Kayıtlı Konsol Projeleri</b><div id="konsolProjectList" class="konsol-project-list"></div></div><div class="konsol-project-buttons"><button type="button" id="konsolProjectSave">Projeyi Kaydet</button></div>';if(print){print.textContent='▣ PDF Oluştur';print.classList.add('m2-pdf-button');projectsBar.querySelector('.konsol-project-buttons').appendChild(print)}pdf.append(output,outputStatus,projectsBar);e('konsolViewRefresh').addEventListener('click',snapshot);e('konsolCreateOutput').addEventListener('click',createOutput);e('konsolProjectSave').addEventListener('click',saveProject);e('konsolThreeView').addEventListener('change',toggleThird);[e('konsolFreeAdd'),e('konsolFreeDup'),e('konsolFreeRotate'),e('konsolFreeDelete'),e('konsolFreeClear')].forEach(function(button){button&&button.addEventListener('click',scheduleSnapshot)});print&&print.addEventListener('click',snapshot,true);renderProjects();
    if(svg&&!observer){observer=new MutationObserver(scheduleSnapshot);observer.observe(svg,{childList:true,subtree:true})}
    setZoom(1);return true;
  }
  document.addEventListener('keydown',function(event){var page=e('page');if(!page||!page.querySelector('.konsol-shell')||event.target&&/INPUT|SELECT|TEXTAREA/.test(event.target.tagName))return;if(event.key==='Delete'){e('konsolFreeDelete')?.click()}else if(event.key==='Escape'){try{document.activeElement?.blur?.()}catch(_){}}else if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='d'){event.preventDefault();e('konsolFreeDup')?.click()}},true);
  window.rafexRefreshKonsolOutputV43=snapshot;
  window.renderKonsol=function(){if(typeof baseRender==='function')baseRender.apply(this,arguments);setTimeout(enhance,0)};
  function boot(){if(enhance())return;var tries=0,timer=setInterval(function(){tries++;if(enhance()||tries>40)clearInterval(timer)},150)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();</script>`;

const closing = html.lastIndexOf("</body>");
if (closing < 0) throw new Error("Konsol Ortak Cizim UI v43: </body> bulunamadi");
html = html.slice(0, closing) + runtime + "\n" + html.slice(closing);

for (const required of [
  'data-rafex-konsol-ortak-ui="v43"',
  '__rafexKonsolOrtakUiV43',
  'konsol-output-preview',
  'PDF Çıktı Alanı',
  'Kayıtlı Konsol Projeleri',
  'Çıktıyı Oluştur',
  'rafexRefreshKonsolOutputV43'
]) if (!html.includes(required)) throw new Error(`Konsol Ortak Cizim UI v43 dogrulama hatasi: ${required}`);

const encoded = Buffer.from(html, "utf8").toString("base64");
worker = worker.slice(0, match.index) + match[0].replace(match[2], encoded) + worker.slice(match.index + match[0].length);
fs.writeFileSync(workerPath, worker);
console.log("v43: Konsol Serbest Yerlesim ve PDF bolumleri Ortak Cizim duzenine getirildi.");
