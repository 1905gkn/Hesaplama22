import fs from 'node:fs';

const file='dist/server/index.js';
let source=fs.readFileSync(file,'utf8');
const match=source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);
if(!match)throw new Error('HTML_BASE64 not found for Konsol fields v6');
let html=Buffer.from(match[2],'base64').toString('utf8');
html=html.replace(/<style data-rafex-konsol-fields="v6">[\s\S]*?<\/style>/g,'').replace(/<script data-rafex-konsol-fields="v6">[\s\S]*?<\/script>/g,'');

const oldSpec=" function spec(){return{count:Math.max(2,n('konsolUprightCount',5)),spacing:n('konsolSpacing',1500),height:n('konsolHeight',4500),arm:n('konsolArmLength',1200),levels:Math.max(1,n('konsolLevels',4)),side:e('konsolSide')&&e('konsolSide').value==='double'?'double':'single'}}";
const newSpec=" function spec(){return{count:Math.max(2,n('konsolUprightCount',5)),spacing:n('konsolSpacing',1500),height:n('konsolHeight',4500),heightMode:e('konsolHeightMode')&&e('konsolHeightMode').value==='manual'?'manual':'auto',arm:n('konsolArmLength',1200),baseDepth:n('konsolBaseDepth',1200),levelLoad:n('konsolLevelLoad',500),legColor:'ral5010',armColor:e('konsolArmColor')&&e('konsolArmColor').value==='ral2004'?'ral2004':'ral1007',uprightProfile:e('konsolUprightProfile')&&e('konsolUprightProfile').value||'ipe180',armProfile:e('konsolArmProfile')&&e('konsolArmProfile').value||'npi120',levels:Math.max(1,n('konsolLevels',4)),side:e('konsolSide')&&e('konsolSide').value==='double'?'double':'single'}}";
if(html.includes(oldSpec))html=html.replace(oldSpec,newSpec);
else if(!html.includes("uprightProfile:e('konsolUprightProfile')"))throw new Error('Konsol v3 spec fonksiyonu bulunamadı.');
const oldFoot=" function footprint(s){return{w:Math.max(600,(s.count-1)*s.spacing+130),h:(s.side==='double'?s.arm*2:s.arm)+220}}";
const newFoot=" function footprint(s){var d=Math.max(s.arm,s.baseDepth||s.arm);return{w:Math.max(600,(s.count-1)*s.spacing+130),h:(s.side==='double'?d*2:d)+220}}";
if(html.includes(oldFoot))html=html.replace(oldFoot,newFoot);
else if(!html.includes('Math.max(s.arm,s.baseDepth||s.arm)'))throw new Error('Konsol v3 footprint fonksiyonu bulunamadı.');

const runtime=String.raw`
<style data-rafex-konsol-fields="v6">
#page .konsol-field input:disabled,#page .konsol-field select:disabled{opacity:.8;cursor:not-allowed;background:#f1f3f1;border-color:#dce2de;color:#405048}
#page .konsol-v6-pair{grid-column:1/-1;display:grid;grid-template-columns:1fr 1fr;gap:9px}
#page .konsol-v6-pair .konsol-field{min-width:0}
#page .konsol-height-mode{width:100%}
#page .konsol-v6-note{grid-column:1/-1;padding:9px 10px;border-radius:8px;background:#eef4f0;color:#315846;font-size:10px;line-height:1.45}
@media(max-width:700px){#page .konsol-v6-pair{grid-template-columns:1fr}}
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
     function enrich(next){var out=Object.assign({},next||{});out.baseDepth=positive('konsolBaseDepth',1200);out.armColor=e('konsolArmColor')&&e('konsolArmColor').value==='ral2004'?'ral2004':'ral1007';out.legColor='ral5010';out.uprightProfile=e('konsolUprightProfile')&&e('konsolUprightProfile').value||'ipe180';out.armProfile=e('konsolArmProfile')&&e('konsolArmProfile').value||'npi120';return out}
     var viewer=originalMount(canvas,enrich(options));
     if(viewer&&typeof viewer.update==='function'){var originalUpdate=viewer.update.bind(viewer);viewer.update=function(next,refit){return originalUpdate(enrich(next),refit)}}
     return viewer;
   };
 }
 function setLabelText(input,text){var label=input&&input.closest('label');if(label&&label.firstChild&&label.firstChild.nodeType===3)label.firstChild.nodeValue=text;return label}
 function makePair(cls){var row=document.createElement('div');row.className='konsol-v6-pair '+cls;return row}
 function enhance(){
   var page=e('page'),grid=page&&page.querySelector('.konsol-grid');if(!grid||e('konsolLevelLoad'))return;
   var project=e('konsolProjectName'),projectLabel=project&&project.closest('label');
   var height=e('konsolHeight'),heightLabel=setLabelText(height,'Ayak yüksekliği (mm)');
   var arm=e('konsolArmLength'),armLabel=setLabelText(arm,'Kat derinliği (mm)');

   var leg=document.createElement('label');leg.className='konsol-field';leg.innerHTML='Ayak rengi<select id="konsolLegColor" disabled><option value="ral5010" selected>RAL-5010</option></select>';
   var color=document.createElement('label');color.className='konsol-field';color.innerHTML='Kol rengi<select id="konsolArmColor"><option value="ral1007" selected>RAL-1007</option><option value="ral2004">RAL-2004</option></select>';
   var colorRow=makePair('konsol-color-row');colorRow.appendChild(leg);colorRow.appendChild(color);

   var up=document.createElement('label');up.className='konsol-field';up.innerHTML='Ayak profili<select id="konsolUprightProfile"><option value="ipe180" selected>IPE 180</option><option value="ipe200">IPE 200</option><option value="ipe220">IPE 220</option><option value="ipe240">IPE 240</option><option value="ipe270">IPE 270</option><option value="ipe300">IPE 300</option></select>';
   var ap=document.createElement('label');ap.className='konsol-field';ap.innerHTML='Kol profili<select id="konsolArmProfile"><option value="npi80">NPI 80</option><option value="npi100">NPI 100</option><option value="npi120" selected>NPI 120</option><option value="npi140">NPI 140</option><option value="npi160">NPI 160</option><option value="npi180">NPI 180</option><option value="npi200">NPI 200</option><option value="npi220">NPI 220</option></select>';
   var profileRow=makePair('konsol-profile-row');profileRow.appendChild(up);profileRow.appendChild(ap);

   var modeLabel=document.createElement('label');modeLabel.className='konsol-field';modeLabel.innerHTML='Ayak yüksekliği modu<select id="konsolHeightMode" class="konsol-height-mode"><option value="auto" selected>Otomatik</option><option value="manual">Manuel</option></select>';
   var heightRow=makePair('konsol-height-row');heightRow.appendChild(modeLabel);if(heightLabel)heightRow.appendChild(heightLabel);

   var base=document.createElement('label');base.className='konsol-field';base.innerHTML='Taban Kat derinliği (mm)<input id="konsolBaseDepth" type="number" min="250" max="3500" step="50" value="1200">';
   var depthRow=makePair('konsol-depth-row');if(armLabel)depthRow.appendChild(armLabel);depthRow.appendChild(base);

   var load=document.createElement('label');load.className='konsol-field';load.innerHTML='Kattaki ağırlık (kg)<input id="konsolLevelLoad" type="number" min="0" max="50000" step="50" value="500">';
   var note=document.createElement('div');note.className='konsol-v6-note';note.textContent='3D profil görünümü deliksizdir. Ayak IPE 180–300, kol NPI 80–220 aralığında seçilir. Ayak RAL-5010 sabit; kol RAL-1007 veya RAL-2004 seçilebilir.';

   var anchor=projectLabel;
   [colorRow,profileRow,heightRow,depthRow,load,note].forEach(function(node){if(anchor){anchor.insertAdjacentElement('afterend',node);anchor=node}else grid.appendChild(node)});

   e('konsolHeightMode').addEventListener('change',syncHeight);
   ['konsolBaseDepth','konsolArmColor','konsolUprightProfile','konsolArmProfile'].forEach(function(id){var node=e(id);if(node)node.addEventListener(node.tagName==='SELECT'?'change':'input',refreshViewer)});
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
for(const required of ['data-rafex-konsol-fields="v6"','Kattaki ağırlık','Kat derinliği (mm)','Taban Kat derinliği (mm)','RAL-5010','RAL-1007','RAL-2004','konsolHeightMode','Otomatik','Manuel','IPE 180','IPE 300','NPI 80','NPI 220','konsol-color-row','konsol-height-row','konsol-depth-row']){
  if(!html.includes(required))throw new Error('Konsol fields v6 doğrulaması eksik: '+required);
}
const encoded=Buffer.from(html).toString('base64');
source=source.slice(0,match.index)+match[0].replace(match[2],encoded)+source.slice(match.index+match[0].length);
fs.writeFileSync(file,source);
console.log('Konsol v6: renkler proje adının altına, yükseklik modu ve derinlikler yan yana; IPE/NPI profil seçimleri eklendi.');
