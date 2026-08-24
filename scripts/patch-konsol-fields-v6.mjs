import fs from 'node:fs';

const file='dist/server/index.js';
let source=fs.readFileSync(file,'utf8');
const match=source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);
if(!match)throw new Error('HTML_BASE64 not found for Konsol fields v6');
let html=Buffer.from(match[2],'base64').toString('utf8');
html=html.replace(/<style data-rafex-konsol-fields="v6">[\s\S]*?<\/style>/g,'').replace(/<script data-rafex-konsol-fields="v6">[\s\S]*?<\/script>/g,'');

const runtime=String.raw`
<style data-rafex-konsol-fields="v6">
#page .konsol-field input:disabled,#page .konsol-field select:disabled{opacity:.78;cursor:not-allowed;background:#f1f3f1;border-color:#dce2de;color:#405048}
#page .konsol-height-mode{margin-bottom:3px}
#page .konsol-v6-note{grid-column:1/-1;padding:9px 10px;border-radius:8px;background:#eef4f0;color:#315846;font-size:10px;line-height:1.45}
</style>
<script data-rafex-konsol-fields="v6">
(function(){
 if(window.__rafexKonsolFieldsV6)return;window.__rafexKonsolFieldsV6=true;
 var finalRender=window.renderKonsol;
 function e(id){return document.getElementById(id)}
 function positive(id,f){var v=Number(e(id)&&e(id).value);return Number.isFinite(v)&&v>0?v:f}
 function autoHeight(){return Math.max(1000,Math.round((Math.max(1,positive('konsolLevels',4))*1000+500)/100)*100)}
 function refreshViewer(){var arm=e('konsolArmLength');if(arm)arm.dispatchEvent(new Event('input',{bubbles:true}))}
 function syncHeight(){var mode=e('konsolHeightMode'),height=e('konsolHeight');if(!mode||!height)return;if(mode.value==='manual'){height.disabled=false}else{height.value=autoHeight();height.disabled=true}height.dispatchEvent(new Event('input',{bubbles:true}))}
 function patchViewer(){
   var api=window.RafexKonsolViewer;if(!api||typeof api.mount!=='function'||api.__konsolFieldsV6)return;
   var originalMount=api.mount.bind(api);api.__konsolFieldsV6=true;
   api.mount=function(canvas,options){
     function enrich(next){var out=Object.assign({},next||{});out.baseDepth=positive('konsolBaseDepth',1200);out.armColor=e('konsolArmColor')&&e('konsolArmColor').value==='ral2004'?'ral2004':'ral1007';out.legColor='ral5010';return out}
     var viewer=originalMount(canvas,enrich(options));
     if(viewer&&typeof viewer.update==='function'){var originalUpdate=viewer.update.bind(viewer);viewer.update=function(next,refit){return originalUpdate(enrich(next),refit)}}
     return viewer;
   };
 }
 function relabelInput(id,text){var input=e(id),label=input&&input.closest('label');if(label&&label.firstChild&&label.firstChild.nodeType===3)label.firstChild.nodeValue=text;return label}
 function enhance(){
   var page=e('page'),grid=page&&page.querySelector('.konsol-grid');if(!grid||e('konsolLevelLoad'))return;
   var height=e('konsolHeight'),heightLabel=height&&height.closest('label');
   if(height&&heightLabel){
     if(heightLabel.firstChild&&heightLabel.firstChild.nodeType===3)heightLabel.firstChild.nodeValue='Ayak yüksekliği';
     var mode=document.createElement('select');mode.id='konsolHeightMode';mode.className='konsol-height-mode';mode.innerHTML='<option value="auto" selected>Otomatik</option><option value="manual">Manuel</option>';heightLabel.insertBefore(mode,height);mode.addEventListener('change',syncHeight);
   }
   var armLabel=relabelInput('konsolArmLength','Kat derinliği (mm)');
   var base=document.createElement('label');base.className='konsol-field';base.innerHTML='Taban Kat derinliği (mm)<input id="konsolBaseDepth" type="number" min="250" max="3500" step="50" value="1200">';if(armLabel)armLabel.insertAdjacentElement('afterend',base);else grid.appendChild(base);
   var load=document.createElement('label');load.className='konsol-field';load.innerHTML='Kattaki ağırlık (kg)<input id="konsolLevelLoad" type="number" min="0" max="50000" step="50" value="500">';base.insertAdjacentElement('afterend',load);
   var leg=document.createElement('label');leg.className='konsol-field';leg.innerHTML='Ayak rengi<select id="konsolLegColor" disabled><option value="ral5010" selected>RAL-5010</option></select>';load.insertAdjacentElement('afterend',leg);
   var color=document.createElement('label');color.className='konsol-field';color.innerHTML='Kol rengi<select id="konsolArmColor"><option value="ral1007" selected>RAL-1007</option><option value="ral2004">RAL-2004</option></select>';leg.insertAdjacentElement('afterend',color);
   var note=document.createElement('div');note.className='konsol-v6-note';note.textContent='Ayak RAL-5010 sabit. Kol RAL-1007 / RAL-2004 seçimi ile Kat derinliği ve Taban Kat derinliği 3D modele bağlıdır.';color.insertAdjacentElement('afterend',note);
   e('konsolBaseDepth').addEventListener('input',refreshViewer);e('konsolArmColor').addEventListener('change',refreshViewer);
   var levels=e('konsolLevels');if(levels)levels.addEventListener('input',function(){if(e('konsolHeightMode')&&e('konsolHeightMode').value==='auto')syncHeight()});
   syncHeight();refreshViewer();
 }
 patchViewer();window.addEventListener('rafex-konsol-viewer-ready',patchViewer);
 window.renderKonsol=function(){var page=e('page');if(page)delete page.dataset.konsolRequestV3;if(typeof finalRender==='function')finalRender();setTimeout(enhance,0)};
})();
</script>`;

const bodyClose=html.lastIndexOf('</body>');
if(bodyClose<0)throw new Error('Konsol fields v6 gerçek body kapanışı bulunamadı.');
html=html.slice(0,bodyClose)+runtime+'\n'+html.slice(bodyClose);
for(const required of ['data-rafex-konsol-fields="v6"','Kattaki ağırlık','Kat derinliği (mm)','Taban Kat derinliği (mm)','RAL-5010','RAL-1007','RAL-2004','konsolHeightMode','Otomatik','Manuel']){
  if(!html.includes(required))throw new Error('Konsol fields v6 doğrulaması eksik: '+required);
}
const encoded=Buffer.from(html).toString('base64');
source=source.slice(0,match.index)+match[0].replace(match[2],encoded)+source.slice(match.index+match[0].length);
fs.writeFileSync(file,source);
console.log('Konsol v6: eksik alanlar gerçek body kapanışına güvenli şekilde eklendi.');
