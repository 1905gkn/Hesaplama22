import fs from 'node:fs';

const file='dist/server/index.js';
let source=fs.readFileSync(file,'utf8');
const match=source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);
if(!match)throw new Error('HTML_BASE64 not found for Konsol fields v5');
let html=Buffer.from(match[2],'base64').toString('utf8');
html=html.replace(/<style data-rafex-konsol-fields="v5">[\s\S]*?<\/style>/g,'').replace(/<script data-rafex-konsol-fields="v5">[\s\S]*?<\/script>/g,'');

const oldSpec=" function spec(){return{count:Math.max(2,n('konsolUprightCount',5)),spacing:n('konsolSpacing',1500),height:n('konsolHeight',4500),arm:n('konsolArmLength',1200),levels:Math.max(1,n('konsolLevels',4)),side:e('konsolSide')&&e('konsolSide').value==='double'?'double':'single'}}";
const newSpec=" function spec(){return{count:Math.max(2,n('konsolUprightCount',5)),spacing:n('konsolSpacing',1500),height:n('konsolHeight',4500),heightMode:e('konsolHeightMode')&&e('konsolHeightMode').value==='manual'?'manual':'auto',arm:n('konsolArmLength',1200),baseDepth:n('konsolBaseDepth',1200),levelLoad:n('konsolLevelLoad',500),legColor:'ral5010',armColor:e('konsolArmColor')&&e('konsolArmColor').value==='ral2004'?'ral2004':'ral1007',levels:Math.max(1,n('konsolLevels',4)),side:e('konsolSide')&&e('konsolSide').value==='double'?'double':'single'}}";
if(!html.includes(oldSpec))throw new Error('Konsol v3 spec fonksiyonu bulunamadı.');
html=html.replace(oldSpec,newSpec);
const oldFoot=" function footprint(s){return{w:Math.max(600,(s.count-1)*s.spacing+130),h:(s.side==='double'?s.arm*2:s.arm)+220}}";
const newFoot=" function footprint(s){var d=Math.max(s.arm,s.baseDepth||s.arm);return{w:Math.max(600,(s.count-1)*s.spacing+130),h:(s.side==='double'?d*2:d)+220}}";
if(!html.includes(oldFoot))throw new Error('Konsol v3 footprint fonksiyonu bulunamadı.');
html=html.replace(oldFoot,newFoot);

const runtime=String.raw`
<style data-rafex-konsol-fields="v5">
#page .konsol-field select:disabled,#page .konsol-field input:disabled{opacity:.78;cursor:not-allowed;background:#f1f3f1;border-color:#dce2de;color:#405048}
#page .konsol-field .konsol-height-mode{margin-bottom:2px}
#page .konsol-v5-note{grid-column:1/-1;padding:9px 10px;border-radius:8px;background:#eef4f0;color:#315846;font-size:10px;line-height:1.45}
</style>
<script data-rafex-konsol-fields="v5">
(function(){
 if(window.__rafexKonsolFieldsV5)return;window.__rafexKonsolFieldsV5=true;
 var finalRender=window.renderKonsol;
 function e(id){return document.getElementById(id)}
 function n(id,f){var x=Number(e(id)&&e(id).value);return Number.isFinite(x)&&x>0?x:f}
 function fmt(v){try{return Math.round(Number(v)||0).toLocaleString('tr-TR')}catch(_){return String(Math.round(Number(v)||0))}}
 function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
 function autoHeight(){return Math.max(1000,Math.round((Math.max(1,n('konsolLevels',4))*1000+500)/100)*100)}
 function triggerViewer(){var arm=e('konsolArmLength');if(arm)arm.dispatchEvent(new Event('input',{bubbles:true}))}
 function syncHeight(){var mode=e('konsolHeightMode'),height=e('konsolHeight');if(!mode||!height)return;if(mode.value==='manual'){height.disabled=false}else{height.value=autoHeight();height.disabled=true}height.dispatchEvent(new Event('input',{bubbles:true}))}
 function patchViewer(){
   var api=window.RafexKonsolViewer;if(!api||typeof api.mount!=='function'||api.__fieldsV5)return;
   var originalMount=api.mount.bind(api);api.__fieldsV5=true;
   api.mount=function(canvas,options){
     function enrich(next){var out=Object.assign({},next||{});out.baseDepth=n('konsolBaseDepth',1200);out.armColor=e('konsolArmColor')&&e('konsolArmColor').value==='ral2004'?'ral2004':'ral1007';out.legColor='ral5010';return out}
     var viewer=originalMount(canvas,enrich(options));
     if(viewer&&typeof viewer.update==='function'){var originalUpdate=viewer.update.bind(viewer);viewer.update=function(next,refit){return originalUpdate(enrich(next),refit)}}
     return viewer;
   };
 }
 function printPdf(){
   var canvas=e('konsolCanvas'),img='';try{img=canvas&&canvas.toDataURL('image/png')}catch(_){img=''}
   var free=e('konsolFreeSvg'),freeHtml=free?free.outerHTML:'';
   var project=esc((e('konsolProjectName')&&e('konsolProjectName').value)||'Konsol Kollu Raf Projesi');
   var side=e('konsolSide')&&e('konsolSide').value==='double'?'Çift taraflı':'Tek taraflı';
   var mode=e('konsolHeightMode')&&e('konsolHeightMode').value==='manual'?'Manuel':'Otomatik';
   var armColor=e('konsolArmColor')&&e('konsolArmColor').value==='ral2004'?'RAL-2004':'RAL-1007';
   var w=window.open('','_blank');if(!w)return;
   var body='<!doctype html><html><head><meta charset="utf-8"><title>'+project+'</title><style>@page{size:A4 landscape;margin:10mm}*{box-sizing:border-box}body{font-family:Arial;color:#162019;margin:0}.head{display:flex;justify-content:space-between;align-items:end;border-bottom:3px solid #f2c500;padding-bottom:8px;margin-bottom:8px}.head h1{margin:0;font-size:21px}.head b{color:#173c2d}.spec{display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin-bottom:8px}.spec div{background:#f3f6f4;padding:7px;border-radius:5px}.spec small{display:block;color:#68736c;font-size:8px}.spec b{font-size:10px}.views{display:grid;grid-template-columns:1fr 1fr;gap:8px}.card{border:1px solid #dce4df;border-radius:7px;padding:7px}.card h2{margin:0 0 6px;font-size:13px;color:#173c2d}.card img,.card svg{width:100%;height:145mm;object-fit:contain}</style></head><body><div class="head"><div><h1>'+project+'</h1><b>RAFEX · KONSOL KOLLU</b></div><span>Yatay A4 Proje Sayfası</span></div><div class="spec"><div><small>Sistem</small><b>'+side+'</b></div><div><small>Ayak arası</small><b>'+fmt(n('konsolSpacing',1500))+' mm</b></div><div><small>Ayak yüksekliği</small><b>'+fmt(n('konsolHeight',4500))+' mm · '+mode+'</b></div><div><small>Kat derinliği</small><b>'+fmt(n('konsolArmLength',1200))+' mm</b></div><div><small>Taban Kat derinliği</small><b>'+fmt(n('konsolBaseDepth',1200))+' mm</b></div><div><small>Kattaki ağırlık</small><b>'+fmt(n('konsolLevelLoad',500))+' kg</b></div><div><small>Ayak rengi</small><b>RAL-5010</b></div><div><small>Kol rengi</small><b>'+armColor+'</b></div><div><small>Ayak adedi</small><b>'+fmt(n('konsolUprightCount',5))+'</b></div><div><small>Kat adedi</small><b>'+fmt(n('konsolLevels',4))+'</b></div></div><div class="views"><div class="card"><h2>3D / Ön Görünüş</h2>'+(img?'<img src="'+img+'">':'')+'</div><div class="card"><h2>Serbest Yerleşim</h2>'+freeHtml+'</div></div><script>setTimeout(function(){window.print()},400)<\/script></body></html>';
   w.document.open();w.document.write(body);w.document.close();
 }
 function enhance(){
   var page=e('page'),grid=page&&page.querySelector('.konsol-grid');if(!grid||e('konsolLevelLoad'))return;
   var height=e('konsolHeight'),heightLabel=height&&height.closest('label');
   if(height&&heightLabel){if(heightLabel.firstChild&&heightLabel.firstChild.nodeType===3)heightLabel.firstChild.nodeValue='Ayak yüksekliği';var mode=document.createElement('select');mode.id='konsolHeightMode';mode.className='konsol-height-mode';mode.innerHTML='<option value="auto" selected>Otomatik</option><option value="manual">Manuel</option>';heightLabel.insertBefore(mode,height);mode.addEventListener('change',syncHeight)}
   var arm=e('konsolArmLength'),armLabel=arm&&arm.closest('label');if(armLabel&&armLabel.firstChild&&armLabel.firstChild.nodeType===3)armLabel.firstChild.nodeValue='Kat derinliği (mm)';
   var base=document.createElement('label');base.className='konsol-field';base.innerHTML='Taban Kat derinliği (mm)<input id="konsolBaseDepth" type="number" min="250" max="3500" step="50" value="1200">';if(armLabel)armLabel.insertAdjacentElement('afterend',base);else grid.appendChild(base);
   var load=document.createElement('label');load.className='konsol-field';load.innerHTML='Kattaki ağırlık (kg)<input id="konsolLevelLoad" type="number" min="0" max="50000" step="50" value="500">';base.insertAdjacentElement('afterend',load);
   var leg=document.createElement('label');leg.className='konsol-field';leg.innerHTML='Ayak rengi<select id="konsolLegColor" disabled><option value="ral5010" selected>RAL-5010</option></select>';load.insertAdjacentElement('afterend',leg);
   var color=document.createElement('label');color.className='konsol-field';color.innerHTML='Kol rengi<select id="konsolArmColor"><option value="ral1007" selected>RAL-1007</option><option value="ral2004">RAL-2004</option></select>';leg.insertAdjacentElement('afterend',color);
   var note=document.createElement('div');note.className='konsol-v5-note';note.innerHTML='<b>Renk ve geometri bağlantısı aktif:</b> Ayak RAL-5010 sabit; kol RAL-1007 / RAL-2004 seçimi, Kat derinliği ve Taban Kat derinliği 3D modele uygulanır.';color.insertAdjacentElement('afterend',note);
   e('konsolBaseDepth').addEventListener('input',triggerViewer);e('konsolArmColor').addEventListener('change',triggerViewer);
   var levels=e('konsolLevels');if(levels)levels.addEventListener('input',function(){if(e('konsolHeightMode')&&e('konsolHeightMode').value==='auto')syncHeight()});
   var pdf=e('konsolPdf');if(pdf)pdf.onclick=printPdf;
   syncHeight();triggerViewer();
 }
 patchViewer();window.addEventListener('rafex-konsol-viewer-ready',patchViewer);
 window.renderKonsol=function(){var page=e('page');if(page)delete page.dataset.konsolRequestV3;if(typeof finalRender==='function')finalRender();setTimeout(enhance,0)};
})();
</script>`;

html=html.replace('</body>',runtime+'\n</body>');
for(const required of ['data-rafex-konsol-fields="v5"','Kattaki ağırlık','Kat derinliği (mm)','Taban Kat derinliği (mm)','RAL-5010','RAL-1007','RAL-2004','konsolHeightMode','Otomatik','Manuel','baseDepth:n(\'konsolBaseDepth\'']){
  if(!html.includes(required))throw new Error('Konsol fields v5 doğrulaması eksik: '+required);
}
const encoded=Buffer.from(html).toString('base64');
source=source.slice(0,match.index)+match[0].replace(match[2],encoded)+source.slice(match.index+match[0].length);
fs.writeFileSync(file,source);
console.log('Konsol v5: Kattaki ağırlık, Kat/Taban Kat derinliği, RAL renkleri ve Otomatik/Manuel ayak yüksekliği eklendi.');
