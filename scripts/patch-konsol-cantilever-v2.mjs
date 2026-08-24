import fs from 'node:fs';
import { buildSync } from 'esbuild';

const workerFile = 'dist/server/index.js';
const viewerEntry = 'client/konsol-viewer.entry.js';
const viewerOut = 'dist/konsol-viewer.js';
buildSync({entryPoints:[viewerEntry],bundle:true,format:'iife',minify:true,target:'es2022',outfile:viewerOut});

let source=fs.readFileSync(workerFile,'utf8');
const match=source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);
if(!match)throw new Error('HTML_BASE64 not found for Konsol v2');
let html=Buffer.from(match[2],'base64').toString('utf8');
html=html.replace(/<style data-rafex-konsol-v[12]="1">[\s\S]*?<\/style>/g,'').replace(/<script data-rafex-konsol-v[12]="1">[\s\S]*?<\/script>/g,'').replace(/<script data-rafex-konsol-viewer-loader="v1"[^>]*><\/script>/g,'');
if(!html.includes('else if (name === "konsol") window.renderKonsol?.();'))html=html.replace('else if (name === "ayak") renderFoot();','else if (name === "ayak") renderFoot();\n        else if (name === "konsol") window.renderKonsol?.();');
const loader='<script data-rafex-konsol-viewer-loader="v2" defer src="/konsol-viewer.js?v=konsol-v2"></script>';
html=html.replace('</head>',loader+'\n</head>');

const runtime=String.raw`
<style data-rafex-konsol-v2="1">
#page .konsol-shell{display:grid;grid-template-columns:minmax(310px,360px) minmax(0,1fr);gap:16px;align-items:start}
#page .konsol-panel,#page .konsol-view-card,#page .konsol-section-card{background:#fff;border:1px solid var(--line);border-radius:14px;padding:16px}
#page .konsol-panel h3,#page .konsol-view-card h3,#page .konsol-section-card h3{margin:0 0 12px;font-size:15px}
#page .konsol-grid{display:grid;grid-template-columns:1fr 1fr;gap:9px}
#page .konsol-field{display:grid;gap:5px;color:#536058;font-size:10px;font-weight:800}
#page .konsol-field input,#page .konsol-field select{width:100%;padding:10px;border:1px solid #e5d991;background:#fff8d5;border-radius:8px;font-weight:800}
#page .konsol-field.full{grid-column:1/-1}
#page .konsol-set-summary{margin-top:12px;padding:12px;border-radius:10px;background:#eef4f0;border-left:4px solid var(--g);font-size:12px;line-height:1.55}
#page .konsol-set-summary b{display:block;margin-bottom:4px;color:var(--g)}
#page .konsol-view-wrap{display:grid;gap:10px}
#page .konsol-toolbar{display:flex;flex-wrap:wrap;gap:7px}
#page .konsol-toolbar button{padding:8px 11px;background:#edf2ee;color:var(--g);border:1px solid #dbe5de}
#page .konsol-toolbar button.active{background:var(--g);color:#fff}
#page #konsolCanvas{display:block;width:100%;height:620px;border-radius:11px;border:1px solid #dfe6e1;background:#f7faf8;touch-action:none}
#page .konsol-status{font-size:11px;color:var(--muted)}
#page .konsol-section-card{grid-column:1/-1}
#page .konsol-section-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
#page .konsol-section-preview{min-height:230px;border:1px solid #dde5df;border-radius:10px;overflow:hidden;background:#fff}
#page .konsol-section-preview svg{width:100%;height:230px;display:block}
#page .konsol-angle-row{display:grid;grid-template-columns:1fr 110px;gap:8px;align-items:end}
#page .konsol-angle-row input[type=range]{width:100%}
@media(max-width:1050px){#page .konsol-shell{grid-template-columns:1fr}#page .konsol-section-card{grid-column:auto}#page #konsolCanvas{height:520px}}
</style>
<script data-rafex-konsol-v2="1">
(function(){
  var viewer=null;
  function el(id){return document.getElementById(id)}
  function setPlan(count){var n=Math.max(2,Math.round(Number(count)||2)),out=[];while(n>0){if(n===2){out.push(2);break}if(n===3){out.push(3);break}if(n===4){out.push(2,2);break}if(n%3===1){out.push(2,2);n-=4}else if(n%3===2){out.push(2);n-=2}else{out.push(3);n-=3}}return out}
  function state(){return{uprightCount:Math.max(2,Number(el('konsolUprightCount')&&el('konsolUprightCount').value)||5),spacing:Math.max(300,Number(el('konsolSpacing')&&el('konsolSpacing').value)||1500),height:Math.max(1000,Number(el('konsolHeight')&&el('konsolHeight').value)||4500),armLength:Math.max(250,Number(el('konsolArmLength')&&el('konsolArmLength').value)||1200),levels:Math.max(1,Number(el('konsolLevels')&&el('konsolLevels').value)||4),doubleSided:!!el('konsolSide')&&el('konsolSide').value==='double',setPlan:setPlan(el('konsolUprightCount')&&el('konsolUprightCount').value),angle:Number(el('konsolAngle')&&el('konsolAngle').value)||35}}
  function planText(plan){return plan.map(function(n){return n+' ayaklı set'}).join(' + ')}
  function updateSectionSvg(s){var host=el('konsolSectionSvg');if(!host)return;var w=760,h=230,pad=45,span=w-pad*2,count=s.uprightCount,dx=count>1?span/(count-1):0,top=36,bottom=190,lines='';for(var i=0;i<count;i++){var x=pad+i*dx;lines+='<line x1="'+x+'" y1="'+top+'" x2="'+x+'" y2="'+bottom+'" stroke="#9aa6a0" stroke-width="8"/>';for(var l=1;l<=s.levels;l++){var y=bottom-(bottom-top)*(l/(s.levels+1));lines+='<line x1="'+x+'" y1="'+y+'" x2="'+(x+Math.min(55,s.armLength/25))+'" y2="'+y+'" stroke="#d9ae17" stroke-width="7"/>'}}var cursor=0;s.setPlan.forEach(function(size){for(var j=0;j<size-1;j++){var x1=pad+(cursor+j)*dx,x2=pad+(cursor+j+1)*dx;lines+='<line x1="'+x1+'" y1="'+(bottom-8)+'" x2="'+x2+'" y2="'+(top+12)+'" stroke="#315846" stroke-width="4"/><line x1="'+x1+'" y1="'+(top+12)+'" x2="'+x2+'" y2="'+(bottom-8)+'" stroke="#315846" stroke-width="4"/>'}cursor+=size});host.innerHTML='<svg viewBox="0 0 '+w+' '+h+'" role="img" aria-label="Konsol kollu kesit önizleme"><rect width="'+w+'" height="'+h+'" fill="#fff"/><g>'+lines+'</g><text x="'+(w/2)+'" y="218" text-anchor="middle" font-family="Arial" font-size="12" font-weight="800" fill="#536058">KESİT AÇISI · '+Math.round(s.angle)+'°</text></svg>'}
  function refresh(){var s=state(),summary=el('konsolSetSummary');if(summary)summary.innerHTML='<b>ÇAPRAZ SET DAĞILIMI</b>'+s.uprightCount+' ayak → '+planText(s.setPlan)+'<br><small>Toplam '+s.setPlan.length+' set · '+s.setPlan.reduce(function(a,b){return a+b},0)+' ayak kapsanıyor.</small>';if(el('konsolAngleValue'))el('konsolAngleValue').value=Math.round(s.angle);if(viewer&&viewer.update)viewer.update(s);if(viewer&&viewer.setSectionAngle)viewer.setSectionAngle(s.angle);updateSectionSvg(s)}
  function mount(){var canvas=el('konsolCanvas');if(!canvas)return;if(!window.RafexKonsolViewer||!window.RafexKonsolViewer.mount){if(el('konsolViewerStatus'))el('konsolViewerStatus').textContent='Konsol 3D motoru hazırlanıyor…';window.addEventListener('rafex-konsol-viewer-ready',mount,{once:true});return}try{if(viewer&&viewer.destroy)viewer.destroy();viewer=window.RafexKonsolViewer.mount(canvas,state());if(el('konsolViewerStatus'))el('konsolViewerStatus').textContent='3D görünüm hazır';refresh()}catch(err){if(el('konsolViewerStatus'))el('konsolViewerStatus').textContent=(err&&err.message)||'3D görünüm açılamadı.'}}
  window.renderKonsol=function(){var page=el('page');if(!page)return;page.innerHTML='<section class="hero"><div><p>RAF SİSTEMLERİ</p><h2>Konsol Kollu Raf</h2></div><div class="capacity"><small>3D + KESİT</small><b>AKTİF</b></div></section><div class="konsol-shell" style="margin-top:18px"><section class="konsol-panel"><h3>Proje Girdileri</h3><div class="konsol-grid"><label class="konsol-field full">Proje adı<input id="konsolProjectName" placeholder="Proje adı"></label><label class="konsol-field">Ayak adedi<input id="konsolUprightCount" type="number" min="2" max="30" value="5"></label><label class="konsol-field">Ayak aralığı (mm)<input id="konsolSpacing" type="number" min="300" value="1500"></label><label class="konsol-field">Ayak yüksekliği (mm)<input id="konsolHeight" type="number" min="1000" value="4500"></label><label class="konsol-field">Kol uzunluğu (mm)<input id="konsolArmLength" type="number" min="250" value="1200"></label><label class="konsol-field">Kat adedi<input id="konsolLevels" type="number" min="1" max="12" value="4"></label><label class="konsol-field">Raf tipi<select id="konsolSide"><option value="single">Tek taraflı</option><option value="double">Çift taraflı</option></select></label></div><div id="konsolSetSummary" class="konsol-set-summary"></div></section><section class="konsol-view-card"><div class="konsol-view-wrap"><div><h3>3D Görünüm</h3><div class="konsol-toolbar"><button data-kview="perspective" class="active">Perspektif</button><button data-kview="front">Ön</button><button data-kview="side">Yan</button><button data-kview="top">Üst</button></div></div><canvas id="konsolCanvas"></canvas><div id="konsolViewerStatus" class="konsol-status">3D görünüm yükleniyor…</div></div></section><section class="konsol-section-card"><h3>Kesit Yer Belirleme</h3><div class="konsol-section-grid"><div id="konsolSectionSvg" class="konsol-section-preview"></div><div><label class="konsol-field">Kesit açısı<div class="konsol-angle-row"><input id="konsolAngle" type="range" min="0" max="359" step="1" value="35"><input id="konsolAngleValue" type="number" min="0" max="359" value="35"></div></label><div class="foot-note"><b>Açı seçimi:</b> Kesit yönünü 0–359° arasında belirle. 3D kamera ve kesit önizlemesi aynı açıya göre güncellenir.</div></div></div></section></div>';['konsolUprightCount','konsolSpacing','konsolHeight','konsolArmLength','konsolLevels','konsolSide'].forEach(function(id){el(id).addEventListener('input',refresh)});el('konsolAngle').addEventListener('input',function(){el('konsolAngleValue').value=el('konsolAngle').value;refresh()});el('konsolAngleValue').addEventListener('input',function(){var v=((Number(el('konsolAngleValue').value)||0)%360+360)%360;el('konsolAngle').value=v;refresh()});page.querySelectorAll('[data-kview]').forEach(function(btn){btn.addEventListener('click',function(){page.querySelectorAll('[data-kview]').forEach(function(x){x.classList.toggle('active',x===btn)});if(viewer&&viewer.setView)viewer.setView(btn.dataset.kview)})});mount()};
})();
</script>`;
html=html.replace('</body>',runtime+'\n</body>');
for(const required of ['data-rafex-konsol-v2="1"','/konsol-viewer.js?v=konsol-v2','ÇAPRAZ SET DAĞILIMI','Kesit Yer Belirleme'])if(!html.includes(required))throw new Error('Konsol v2 doğrulaması eksik: '+required);
const encoded=Buffer.from(html).toString('base64');
source=source.slice(0,match.index)+match[0].replace(match[2],encoded)+source.slice(match.index+match[0].length);

const jsB64=fs.readFileSync(viewerOut).toString('base64');
const anchor='const DRACO_DECODER_BASE64 = ';
const anchorIndex=source.indexOf(anchor);
if(anchorIndex<0)throw new Error('Konsol viewer sabit ekleme noktası bulunamadı.');
source=source.slice(0,anchorIndex)+'const KONSOL_VIEWER_BASE64 = "'+jsB64+'";\n'+source.slice(anchorIndex);
const routeAnchor='    if (path === "/b2b-viewer.js")';
if(!source.includes(routeAnchor))throw new Error('Konsol viewer route ekleme noktası bulunamadı.');
source=source.replace(routeAnchor,'    if (path === "/konsol-viewer.js") return new Response(Uint8Array.from(atob(KONSOL_VIEWER_BASE64),(c)=>c.charCodeAt(0)),{headers:{"content-type":"text/javascript; charset=utf-8","cache-control":"no-store","x-content-type-options":"nosniff"}});\n'+routeAnchor);
fs.writeFileSync(workerFile,source);
console.log('Konsol Kollu v2: 3D, 2/3 ayaklı set dağılımı ve açılı kesit ekranı eklendi.');
