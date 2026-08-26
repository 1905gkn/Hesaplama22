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
#page .konsol-pdf-card.konsol-ortak-report{grid-column:1/-1;display:block;margin:0;padding:0;border:1px solid #d5e0d8;border-radius:14px;background:#fff;overflow:hidden}
#page .konsol-ortak-report .m2-report-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 14px;border-bottom:1px solid #dbe4de;background:#f5f9f6}
#page .konsol-ortak-report .m2-report-head b{display:block;color:#173c2d;font-size:12px}
#page .konsol-ortak-report .m2-report-head small{display:block;margin-top:3px;color:#68736c;font-size:9px}
#page .konsol-output-actions{display:flex;align-items:flex-end;justify-content:flex-end;gap:8px;flex-wrap:wrap}
#page .konsol-output-actions label{display:grid;gap:3px;color:#68736c;font-size:7px;font-weight:950;letter-spacing:.08em}
#page .konsol-output-actions select{min-width:150px;padding:8px;border:1px solid #c8d5cc;border-radius:8px;background:#fff;color:#173c2d;font-size:10px;font-weight:800}
#page .konsol-output-actions button{min-height:36px;padding:8px 12px;border:1px solid #c8d5cc;border-radius:8px;background:#fff;color:#173c2d;font-size:10px;font-weight:900;cursor:pointer}
#page .konsol-output-actions #konsolPdf{border-color:#7f1623;background:#7f1623;color:#fff}
#page .konsol-output-preview{display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:12px;background:#eef3f0}
#page .konsol-output-zone{position:relative;min-height:300px;padding:22px 8px 8px;border:1px solid #cdd8d1;border-radius:9px;background:#fff;overflow:hidden}
#page .konsol-output-zone>span{position:absolute;left:8px;top:7px;color:#6b7770;font-size:8px;font-weight:950;letter-spacing:.1em}
#page .konsol-output-zone img,#page .konsol-output-zone svg{display:block;width:100%;height:270px;object-fit:contain}
#page .konsol-output-empty{display:grid;place-items:center;height:270px;color:#809087;font-size:10px;font-weight:800;text-align:center}
#page .konsol-output-status{padding:9px 14px;border-top:1px solid #dbe4de;color:#607067;font-size:9px;font-weight:700;background:#fff}
@media(max-width:900px){#page .konsol-ortak-floor .konsol-free-head,#page .konsol-ortak-report .m2-report-head{align-items:stretch;flex-direction:column}#page .konsol-area-summary{width:100%}#page .konsol-ortak-floor .konsol-free-tools,#page .konsol-output-preview{grid-template-columns:1fr}#page .konsol-output-actions{justify-content:flex-start}}
</style>
<script data-rafex-konsol-ortak-ui="v43">(function(){
  if(window.__rafexKonsolOrtakUiV43)return;window.__rafexKonsolOrtakUiV43=true;
  var baseRender=window.renderKonsol,zoom=1,previewTimer=0,observer=null;
  function e(id){return document.getElementById(id)}
  function fmt(value){try{return Math.round(Number(value)||0).toLocaleString('tr-TR')}catch(_){return String(value||0)}}
  function setZoom(next){zoom=Math.max(1,Math.min(2.4,Number(next)||1));var svg=e('konsolFreeSvg');if(!svg)return;var w=50000/zoom,h=30000/zoom;svg.setAttribute('viewBox',[(50000-w)/2,(30000-h)/2,w,h].join(' '));var label=e('konsolZoomLabel');if(label)label.textContent=Math.round(zoom*100)+'%'}
  function group(title,buttons){var node=document.createElement('div');node.className='konsol-tool-group';var label=document.createElement('span');label.className='konsol-tool-group-title';label.textContent=title;node.appendChild(label);buttons.forEach(function(button){if(button)node.appendChild(button)});return node}
  function snapshot(){
    var preview=e('konsolOutputPreview');if(!preview)return;
    var left=e('konsolOutput3D'),right=e('konsolOutputPlan'),canvas=e('konsolCanvas'),svg=e('konsolFreeSvg');
    if(left){left.replaceChildren();if(canvas){try{var img=document.createElement('img');img.alt='Konsol kollu 3D görünüş';img.src=canvas.toDataURL('image/png');left.appendChild(img)}catch(_){}}if(!left.childNodes.length){var empty=document.createElement('div');empty.className='konsol-output-empty';empty.textContent='3D görünüş hazır olduğunda burada gösterilir.';left.appendChild(empty)}}
    if(right){right.replaceChildren();if(svg){var clone=svg.cloneNode(true);clone.removeAttribute('id');clone.setAttribute('aria-label','Konsol kollu serbest yerleşim çıktısı');right.appendChild(clone)}if(!right.childNodes.length){var none=document.createElement('div');none.className='konsol-output-empty';none.textContent='Serbest yerleşime raf eklediğinde burada gösterilir.';right.appendChild(none)}}
    var status=e('konsolOutputStatus');if(status)status.textContent='Önizleme güncellendi · 3D görünüş ve Serbest Yerleşim tek yatay A4 çıktıda.';
  }
  function scheduleSnapshot(){clearTimeout(previewTimer);previewTimer=setTimeout(snapshot,180)}
  function enhance(){
    var page=e('page'),free=page&&page.querySelector('.konsol-free-card'),pdf=page&&page.querySelector('.konsol-pdf-card');if(!free||!pdf)return false;
    if(free.dataset.rafexOrtakUi==='1'){scheduleSnapshot();return true}free.dataset.rafexOrtakUi='1';free.classList.add('konsol-ortak-floor','m2-floor-editor');
    var head=free.querySelector('.konsol-free-head');if(head&&!head.querySelector('.konsol-area-summary')){var area=document.createElement('div');area.className='konsol-area-summary';area.innerHTML='<span>Alan eni<b>50.000 mm</b></span><span>Alan boyu<b>30.000 mm</b></span>';head.appendChild(area)}
    var tools=free.querySelector('.konsol-free-tools');if(tools&&!tools.querySelector('.konsol-tool-group')){var add=e('konsolFreeAdd'),dup=e('konsolFreeDup'),rotate=e('konsolFreeRotate'),del=e('konsolFreeDelete'),clear=e('konsolFreeClear');tools.replaceChildren(group('Raf İşlemleri',[add,dup,rotate,del]),group('Çizim İşlemleri',[clear]))}
    if(tools&&!free.querySelector('.konsol-key-help')){var help=document.createElement('div');help.className='konsol-key-help';help.innerHTML='<strong>KLAVYE</strong><kbd>DEL</kbd><span>Seçileni sil</span><kbd>ESC</kbd><span>Seçimi bırak</span><kbd>CTRL + D</kbd><span>Çoğalt</span>';tools.insertAdjacentElement('beforebegin',help)}
    var svg=e('konsolFreeSvg');if(svg&&!svg.closest('.konsol-canvas-wrap')){var wrap=document.createElement('div');wrap.className='konsol-canvas-wrap';var frame=document.createElement('div');frame.className='konsol-canvas-frame';svg.parentNode.insertBefore(wrap,svg);wrap.appendChild(frame);frame.appendChild(svg);var z=document.createElement('div');z.className='konsol-layout-zoom';z.setAttribute('aria-label','Yerleşim yakınlaştırma');z.innerHTML='<button type="button" data-konsol-zoom="out" aria-label="Yerleşimi uzaklaştır">−</button><button type="button" id="konsolZoomLabel" data-konsol-zoom="fit" title="Yerleşimi sığdır">100%</button><button type="button" data-konsol-zoom="in" aria-label="Yerleşimi yakınlaştır">+</button>';wrap.appendChild(z);z.addEventListener('click',function(event){var action=event.target&&event.target.dataset.konsolZoom;if(action==='out')setZoom(zoom-.2);if(action==='fit')setZoom(1);if(action==='in')setZoom(zoom+.2)})}
    var status=e('konsolFreeStatus');if(status&&!free.querySelector('.konsol-floor-note')){var note=document.createElement('div');note.className='konsol-floor-note';note.textContent='Rafı seçip sürükleyerek yerleştir. Alan dışına veya başka bir konsol rafının üzerine bırakılamaz.';status.insertAdjacentElement('afterend',note)}
    pdf.dataset.rafexOrtakUi='1';pdf.classList.add('konsol-ortak-report','m2-report-panel');var copy=pdf.querySelector(':scope>div'),print=e('konsolPdf');var reportHead=document.createElement('div');reportHead.className='m2-report-head';var title=document.createElement('div');title.innerHTML='<b>Konsol Kollu Yatay A4 Proje Sayfası</b><small>3D görünüş, temel ölçüler ve Serbest Yerleşim aynı proje çıktısında</small>';var actions=document.createElement('div');actions.className='konsol-output-actions';actions.innerHTML='<label>ÇIKTI TİPİ<select aria-label="Konsol çıktı tipi"><option>Detay / Kurumsal Çıktı</option></select></label><button type="button" id="konsolPreviewRefresh">Önizlemeyi Güncelle</button>';if(print){print.textContent='PDF Oluştur';print.classList.add('m2-pdf-button');actions.appendChild(print)}reportHead.append(title,actions);if(copy)copy.remove();pdf.prepend(reportHead);var output=document.createElement('div');output.id='konsolOutputPreview';output.className='konsol-output-preview';output.innerHTML='<section class="konsol-output-zone"><span>3D / ÖN GÖRÜNÜŞ</span><div id="konsolOutput3D"></div></section><section class="konsol-output-zone"><span>SERBEST YERLEŞİM</span><div id="konsolOutputPlan"></div></section>';var outputStatus=document.createElement('div');outputStatus.id='konsolOutputStatus';outputStatus.className='konsol-output-status';outputStatus.textContent='Çıktı önizlemesi hazırlanıyor…';pdf.append(output,outputStatus);e('konsolPreviewRefresh').addEventListener('click',snapshot);[e('konsolFreeAdd'),e('konsolFreeDup'),e('konsolFreeRotate'),e('konsolFreeDelete'),e('konsolFreeClear')].forEach(function(button){button&&button.addEventListener('click',scheduleSnapshot)});print&&print.addEventListener('click',snapshot,true);
    if(svg&&!observer){observer=new MutationObserver(scheduleSnapshot);observer.observe(svg,{childList:true,subtree:true})}
    setZoom(1);scheduleSnapshot();return true;
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
  'Önizlemeyi Güncelle',
  'Konsol Kollu Yatay A4 Proje Sayfası',
  'rafexRefreshKonsolOutputV43'
]) if (!html.includes(required)) throw new Error(`Konsol Ortak Cizim UI v43 dogrulama hatasi: ${required}`);

const encoded = Buffer.from(html, "utf8").toString("base64");
worker = worker.slice(0, match.index) + match[0].replace(match[2], encoded) + worker.slice(match.index + match[0].length);
fs.writeFileSync(workerPath, worker);
console.log("v43: Konsol Serbest Yerlesim ve PDF bolumleri Ortak Cizim duzenine getirildi.");
