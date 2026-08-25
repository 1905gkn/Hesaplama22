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
html=html
  .replace(/<style data-rafex-konsol-v[12]="1">[\s\S]*?<\/style>/g,'')
  .replace(/<script data-rafex-konsol-v[12]="1"[^>]*>[\s\S]*?<\/script>/g,'')
  .replace(/<script data-rafex-konsol-viewer-loader="v[12]"[^>]*><\/script>/g,'');
if(!html.includes('else if (name === "konsol") window.renderKonsol?.();'))html=html.replace('else if (name === "ayak") renderFoot();','else if (name === "ayak") renderFoot();\n        else if (name === "konsol") window.renderKonsol?.();');
const loader='<script data-rafex-konsol-viewer-loader="v2" defer src="/konsol-viewer.js?v=konsol-krs-v9"></script>';
html=html.replace('</head>',loader+'\n</head>');

const runtime=String.raw`
<style data-rafex-konsol-v2="1">
#page .konsol-shell{display:grid;grid-template-columns:minmax(330px,390px) minmax(0,1fr);gap:16px;align-items:start}
#page .konsol-panel,#page .konsol-view-card,#page .konsol-section-card{background:#fff;border:1px solid var(--line);border-radius:14px;padding:16px}
#page .konsol-panel h3,#page .konsol-view-card h3,#page .konsol-section-card h3{margin:0 0 12px;font-size:15px}
#page .konsol-grid{display:grid;grid-template-columns:1fr 1fr;gap:9px}
#page .konsol-field{display:grid;gap:5px;color:#536058;font-size:10px;font-weight:800;min-width:0}
#page .konsol-field input,#page .konsol-field select{width:100%;padding:10px;border:1px solid #e5d991;background:#fff8d5;border-radius:8px;font-weight:800;color:#17201b}
#page .konsol-field input:disabled,#page .konsol-field select:disabled{background:#f1f3f1;border-color:#dce2de;color:#57635c;opacity:.9}
#page .konsol-field.full{grid-column:1/-1}
#page .konsol-set-summary{margin-top:12px;padding:12px;border-radius:10px;background:#eef4f0;border-left:4px solid var(--g);font-size:12px;line-height:1.55}
#page .konsol-set-summary b{display:block;margin-bottom:4px;color:var(--g)}
#page .krs-native{grid-column:1/-1;border:1px solid #dbe5df;border-radius:11px;background:#f8fbf9;padding:10px;display:grid;gap:8px}
#page .krs-native-title{display:flex;justify-content:space-between;gap:8px;align-items:center;font-size:10px;font-weight:900;color:#315846}
#page .krs-native-title small{font-size:9px;color:#778179;font-weight:700}
#page .krs-native-cards{display:grid;grid-template-columns:1fr 1fr;gap:7px}
#page .krs-card{border:1px solid #dce6df;border-radius:9px;background:#fff;padding:9px;display:grid;gap:5px}
#page .krs-card.primary{border-color:#8db69f;background:#eff7f2}
#page .krs-card.bad{border-color:#e2b4b4;background:#fff4f4}
#page .krs-card h5{margin:0;font-size:9px;color:#315846}
#page .krs-card .profiles{font-size:12px;line-height:1.4;color:#23332b}
#page .krs-card .meta{font-size:9px;line-height:1.4;color:#6b766f}
#page .krs-card button{padding:7px 8px;background:#315846;color:#fff;border-radius:7px;font-size:9px;font-weight:900}
#page .krs-card button:disabled{opacity:.45;cursor:not-allowed}
#page .krs-status{grid-column:1/-1;padding:8px 9px;border-radius:8px;background:#eef4f0;color:#315846;font-size:9px;line-height:1.45}
#page .krs-status.bad{background:#fff0f0;color:#9b2f2f}
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
@media(max-width:620px){#page .krs-native-cards{grid-template-columns:1fr}}
</style>
<script data-rafex-konsol-v2="1" data-rafex-krs-native="v9">
(function(){
  if(window.__rafexKonsolNativeV9)return;window.__rafexKonsolNativeV9=true;
  var viewer=null,geometryRaf=0,applying=false;
  var HEIGHTS=[2500,3000,3500,4000,5000,6000],UORDER=[180,200,220,240,270,300],AORDER=[80,100,120,140];
  var U={
    single:{
      2500:{400:{180:6110},600:{180:4800},800:{180:3900},1000:{180:3340},1250:{180:2610}},
      3000:{400:{180:5300,200:7140},600:{180:4170,200:5730},800:{180:3560,200:4750},1000:{180:3025,200:4155},1250:{180:2280,200:3375}},
      3500:{600:{180:4690,200:6515,220:8520},800:{180:3380,200:5000,220:7000},1000:{180:2590,200:3830,220:5510},1250:{180:1965,200:2910,220:4185},1500:{180:1535,200:2295,220:3310},2000:{180:1010,200:1530,220:2230}},
      4000:{600:{200:5980,220:8400,240:10700},800:{200:4360,220:6250,240:8800},1000:{200:3360,220:4830,240:6810},1250:{200:2550,220:3670,240:5200},1500:{200:2020,220:2920,240:4140},2000:{200:1340,220:1960,240:2810}},
      5000:{600:{220:6670,240:9360,270:14010},800:{220:4880,240:6870,270:10260},1000:{220:3780,240:5350,270:7960},1250:{220:2890,240:4090,270:6140},1500:{220:2280,240:3250,270:4910},2000:{220:1550,240:2230,270:3400}},
      6000:{600:{240:7590,270:11420},800:{240:5640,270:8360,300:12140},1000:{240:4370,270:6570,300:9530},1250:{240:3350,270:5050,300:7390},1500:{240:2690,270:4070,300:5940},2000:{240:1820,270:2790,300:4120}}
    },
    double:{
      2500:{400:{180:6290},600:{180:4940},800:{180:4050},1000:{180:3470},1250:{180:2710}},
      3000:{400:{180:5450,200:7350},600:{180:4290,200:5900},800:{180:3700,200:4940},1000:{180:3140,200:4320},1250:{180:2390,200:3540}},
      3500:{600:{180:4870,200:6710,220:8770},800:{180:3480,200:5150,220:7210},1000:{180:2690,200:3980,220:5730},1250:{180:2040,200:3020,220:4350},1500:{180:1610,200:2410,220:3475},2000:{180:1080,200:1630,220:2380}},
      4000:{600:{200:6150,220:8650,240:11020},800:{200:4490,220:6430,240:9060},1000:{200:3490,220:5020,240:7080},1250:{200:2650,220:3810,240:5400},1500:{200:2120,220:3060,240:4340},2000:{200:1430,220:2090,240:3000}},
      5000:{600:{220:6870,240:9670,270:14410},800:{220:5020,240:7070,270:10560},1000:{220:3930,240:5560,270:8270},1250:{220:3005,240:4250,270:6380},1500:{220:2390,240:3410,270:5150},2000:{220:1650,240:2380,270:3630}},
      6000:{600:{240:7810,270:11760},800:{240:5800,270:8610,300:12500},1000:{240:4540,270:6830,300:9910},1250:{240:3480,270:5250,300:7680},1500:{240:2820,270:4270,300:6230},2000:{240:1940,270:2980,300:4405}}
    }
  };
  var ARM={400:{80:1445,100:2415},600:{80:1030,100:1755,120:2720,140:3035},800:{80:810,100:1370,120:2150,140:3125},1000:{80:640,100:1120,120:1755,140:2585},1250:{80:505,100:885,120:1420,140:2110},1500:{80:380,100:730,120:1170,140:1755},2000:{80:215,100:470,120:850,140:1285}};
  function el(id){return document.getElementById(id)}
  function num(id,f){var v=Number(el(id)&&el(id).value);return Number.isFinite(v)?v:f}
  function fmt(v){return Math.round(Number(v)||0).toLocaleString('tr-TR')}
  function sideKey(){return el('konsolSide')&&el('konsolSide').value==='double'?'double':'single'}
  function setPlan(count){var n=Math.max(2,Math.round(Number(count)||2)),out=[];while(n>0){if(n<=5){out.push(n);break}if(n===6){out.push(3,3);break}if(n===7){out.push(4,3);break}if(n===8){out.push(5,3);break}if(n===9){out.push(5,4);break}out.push(5);n-=5}return out}
  function planText(plan){return plan.map(function(n){return n+' ayaklı set'}).join(' + ')}
  function exactH(){var h=num('konsolHeight',0);return HEIGHTS.indexOf(h)>=0?h:0}
  function exactDepth(){var d=num('konsolArmLength',0);return ARM[d]?d:0}
  function row(){var h=exactH(),d=exactDepth();return h&&d&&U[sideKey()]&&U[sideKey()][h]&&U[sideKey()][h][d]||null}
  function validDepths(){var h=exactH(),t=h&&U[sideKey()]&&U[sideKey()][h];return t?Object.keys(t).map(Number).sort(function(a,b){return a-b}):[]}
  function demand(){var level=Math.max(0,num('konsolLevelLoad',0)),levels=Math.max(1,num('konsolLevels',1));return{level:level,side:level*levels}}
  function armAllowed(a,u){return a<=100||u>=220}
  function combos(){var r=row(),ar=ARM[exactDepth()],dem=demand(),out=[];if(!r||!ar)return out;UORDER.forEach(function(u){if(!r[u])return;AORDER.forEach(function(a){if(!ar[a]||!armAllowed(a,u))return;out.push({u:u,a:a,uc:r[u],ac:ar[a],safe:r[u]>=dem.side&&ar[a]>=dem.level})})});return out}
  function recommendations(){var safe=combos().filter(function(x){return x.safe});if(!safe.length)return[];safe.sort(function(x,y){return UORDER.indexOf(x.u)-UORDER.indexOf(y.u)||AORDER.indexOf(x.a)-AORDER.indexOf(y.a)});var first=safe[0],second=safe.find(function(x){return x.u>first.u||x.a>first.a})||first;return[first,second]}
  function setSelectOptions(sel,values,prefix,current){if(!sel)return;sel.innerHTML='';values.forEach(function(v){var o=document.createElement('option');o.value=prefix+v;o.textContent=(prefix==='ipe'?'IPE ':'INP ')+v;if(o.value===current)o.selected=true;sel.appendChild(o)})}
  function syncHeight(fromMode){var mode=el('konsolHeightMode'),h=el('konsolHeight'),gap=el('konsolLevelGap'),levels=Math.max(1,num('konsolLevels',4));if(!mode||!h||!gap)return;var old=Number(h.value)||4000;if(mode.value==='auto'){var computed=Math.max(100,Math.round((levels*Math.max(100,Number(gap.value)||1000))/100)*100);h.innerHTML='';if(HEIGHTS.indexOf(computed)<0){var bad=document.createElement('option');bad.value=String(computed);bad.textContent=fmt(computed)+' mm — SSI KRS tablosunda yok';h.appendChild(bad)}HEIGHTS.forEach(function(v){var o=document.createElement('option');o.value=v;o.textContent=fmt(v)+' mm';if(v===computed)o.selected=true;h.appendChild(o)});h.value=String(computed);h.disabled=true;gap.disabled=false}else{h.innerHTML='';HEIGHTS.forEach(function(v){var o=document.createElement('option');o.value=v;o.textContent=fmt(v)+' mm';h.appendChild(o)});var chosen=HEIGHTS.indexOf(old)>=0?old:(HEIGHTS.find(function(v){return v>=old})||6000);h.value=String(chosen);h.disabled=false;gap.value=String(Math.round(chosen/levels));gap.disabled=true}if(!fromMode)syncDepths()}
  function syncDepths(){var sel=el('konsolArmLength');if(!sel)return;var vals=validDepths(),old=Number(sel.value)||1000;sel.innerHTML='';if(!vals.length){var none=document.createElement('option');none.value='';none.textContent='Bu H için KRS derinliği yok';sel.appendChild(none);sel.disabled=true}else{vals.forEach(function(v){var o=document.createElement('option');o.value=v;o.textContent=fmt(v)+' mm';sel.appendChild(o)});var chosen=vals.indexOf(old)>=0?old:(vals.find(function(v){return v>=old})||vals[vals.length-1]);sel.value=String(chosen);sel.disabled=false}syncProfiles(true)}
  function syncProfiles(preferRec){var up=el('konsolUprightProfile'),ap=el('konsolArmProfile'),r=row(),ar=ARM[exactDepth()],recs=recommendations();if(!up||!ap)return;if(!r||!ar){up.innerHTML='<option value="">Katalogda yok</option>';ap.innerHTML='<option value="">Katalogda yok</option>';up.disabled=true;ap.disabled=true;renderKRS(recs);return}var oldU=up.value,ups=UORDER.filter(function(u){return !!r[u]});setSelectOptions(up,ups,'ipe',oldU);up.disabled=false;if(preferRec&&recs[0])up.value='ipe'+recs[0].u;var chosenU=Number((up.value||'').replace('ipe',''))||ups[0],oldA=ap.value,arms=AORDER.filter(function(a){return !!ar[a]&&armAllowed(a,chosenU)});setSelectOptions(ap,arms,'npi',oldA);ap.disabled=!arms.length;if(preferRec&&recs[0]&&arms.indexOf(recs[0].a)>=0)ap.value='npi'+recs[0].a;renderKRS(recs)}
  function renderCard(card,opt,index){if(!card)return;card.classList.toggle('primary',index===0&&!!opt);card.classList.toggle('bad',!opt);var h=card.querySelector('h5'),p=card.querySelector('.profiles'),m=card.querySelector('.meta'),b=card.querySelector('button');if(!opt){h.textContent='KATALOGDA UYGUN EŞLEŞME YOK';p.textContent='Ayak ve kol otomatik seçilemez.';m.textContent='H, derinlik veya yük SSI SCHÄFER KRS tablosundaki kombinasyonları aşıyor.';b.disabled=true;return}h.textContent=index===0?'EN KÜÇÜK UYGUN KRS':'BİR ÜST KRS SEÇENEĞİ';p.innerHTML='<b>Ayak:</b> IPE '+opt.u+'<br><b>Kol:</b> INP '+opt.a;m.textContent='Ayak '+fmt(opt.uc)+' kg/side · Kol '+fmt(opt.ac)+' kg UDL';b.disabled=false;b.textContent=(index+1)+'. seçeneği uygula'}
  function validateManual(){var st=el('krsStatus'),r=row(),ar=ARM[exactDepth()],dem=demand(),u=Number((el('konsolUprightProfile')&&el('konsolUprightProfile').value||'').replace('ipe','')),a=Number((el('konsolArmProfile')&&el('konsolArmProfile').value||'').replace('npi',''));if(!st)return;if(!r||!ar||!r[u]||!ar[a]||!armAllowed(a,u)){st.className='krs-status bad';st.textContent='Bu seçim SSI SCHÄFER KRS tablosunda yok; seçime izin verilmez.';return}var okU=r[u]>=dem.side,okA=ar[a]>=dem.level;st.className='krs-status'+(okU&&okA?'':' bad');st.textContent='H '+fmt(exactH())+' mm · derinlik '+fmt(exactDepth())+' mm · taraf yükü '+fmt(dem.side)+' kg · IPE '+u+' '+fmt(r[u])+' kg/side · INP '+a+' '+fmt(ar[a])+' kg UDL'+(okU&&okA?' · UYGUN':' · KAPASİTE YETERSİZ')}
  function renderKRS(recs){var cards=document.querySelectorAll('#krsNative .krs-card');renderCard(cards[0],recs[0],0);renderCard(cards[1],recs[1],1);validateManual()}
  function applyRec(index){var rec=recommendations()[index];if(!rec)return;applying=true;el('konsolUprightProfile').value='ipe'+rec.u;syncProfiles(false);el('konsolArmProfile').value='npi'+rec.a;applying=false;validateManual();scheduleGeometry()}
  function currentState(){var plan=setPlan(num('konsolUprightCount',5));return{uprightCount:Math.max(2,num('konsolUprightCount',5)),spacing:Math.max(300,num('konsolSpacing',1500)),height:Math.max(1000,num('konsolHeight',4000)),armLength:Math.max(250,num('konsolArmLength',1000)),baseDepth:Math.max(250,num('konsolBaseDepth',1000)),armColor:el('konsolArmColor')&&el('konsolArmColor').value==='ral2004'?'ral2004':'ral1007',uprightProfile:el('konsolUprightProfile')&&el('konsolUprightProfile').value||'ipe200',armProfile:el('konsolArmProfile')&&el('konsolArmProfile').value||'npi100',levels:Math.max(1,num('konsolLevels',4)),doubleSided:sideKey()==='double',setPlan:plan,angle:num('konsolAngle',35)}}
  function updateSummary(s){var summary=el('konsolSetSummary');if(summary)summary.innerHTML='<b>ÇAPRAZ SET DAĞILIMI</b>'+s.uprightCount+' ayak → '+planText(s.setPlan)+'<br><small>Toplam '+s.setPlan.length+' set · '+s.setPlan.reduce(function(a,b){return a+b},0)+' ayak kapsanıyor.</small>';if(el('konsolAngleValue'))el('konsolAngleValue').value=Math.round(s.angle)}
  function updateSectionSvg(s){var host=el('konsolSectionSvg');if(!host)return;var w=760,h=230,pad=45,span=w-pad*2,count=s.uprightCount,dx=count>1?span/(count-1):0,top=28,bottom=190,lines='';function ln(x1,y1,x2,y2,color,width){lines+='<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" stroke="'+color+'" stroke-width="'+width+'" stroke-linecap="round"/>'}for(var i=0;i<count;i++){var x=pad+i*dx;ln(x,top,x,bottom,'#005387',8);for(var l=1;l<=s.levels;l++){var y=bottom-(bottom-top)*(l/s.levels);ln(x,y,x+Math.min(55,s.armLength/25),y,'#d9ae17',7)}}var rowCount=s.height<=3500?3:(s.height<=4500?4:5),rows=[];for(var r=0;r<rowCount;r++)rows.push(bottom-(bottom-top)*(r/Math.max(1,rowCount-1)));var mid=rows[Math.floor(rows.length/2)],cursor=0;function braces(size){var actual=Math.min(size,count-cursor);if(actual<2)return;var xs=[];for(var q=0;q<actual;q++)xs.push(pad+(cursor+q)*dx);for(var b=0;b<actual-1;b++)rows.forEach(function(y){ln(xs[b],y,xs[b+1],y,'#d5443f',3)});var low=rows[0],high=rows[rows.length-1];if(actual===2){ln(xs[0],high,xs[1],mid,'#d5443f',3);ln(xs[0],low,xs[1],mid,'#d5443f',3)}else if(actual===3||actual===4){ln(xs[0],high,xs[1],mid,'#d5443f',3);ln(xs[0],low,xs[1],mid,'#d5443f',3);ln(xs[1],mid,xs[2],high,'#d5443f',3);ln(xs[1],mid,xs[2],low,'#d5443f',3)}else{var c=2;ln(xs[c-1],high,xs[c],mid,'#d5443f',3);ln(xs[c-1],low,xs[c],mid,'#d5443f',3);ln(xs[c],mid,xs[c+1],high,'#d5443f',3);ln(xs[c],mid,xs[c+1],low,'#d5443f',3)}cursor+=actual}s.setPlan.forEach(braces);host.innerHTML='<svg viewBox="0 0 '+w+' '+h+'"><rect width="'+w+'" height="'+h+'" fill="#fff"/><g>'+lines+'</g><text x="'+(w/2)+'" y="218" text-anchor="middle" font-family="Arial" font-size="12" font-weight="800" fill="#536058">KESİT AÇISI · '+Math.round(s.angle)+'°</text></svg>'}
  function doGeometry(){geometryRaf=0;var s=currentState();updateSummary(s);updateSectionSvg(s);if(viewer&&viewer.update)viewer.update(s)}
  function scheduleGeometry(){if(geometryRaf)return;geometryRaf=requestAnimationFrame(doGeometry)}
  function refreshAngle(){var s=currentState();if(el('konsolAngleValue'))el('konsolAngleValue').value=Math.round(s.angle);if(viewer&&viewer.setSectionAngle)viewer.setSectionAngle(s.angle);updateSectionSvg(s)}
  function updateAll(preferRec){if(applying)return;syncProfiles(preferRec);scheduleGeometry()}
  function mount(){var canvas=el('konsolCanvas');if(!canvas)return;if(!window.RafexKonsolViewer||!window.RafexKonsolViewer.mount){if(el('konsolViewerStatus'))el('konsolViewerStatus').textContent='Konsol 3D motoru hazırlanıyor…';window.addEventListener('rafex-konsol-viewer-ready',mount,{once:true});return}try{if(viewer&&viewer.destroy)viewer.destroy();viewer=window.RafexKonsolViewer.mount(canvas,currentState());if(el('konsolViewerStatus'))el('konsolViewerStatus').textContent='3D görünüm hazır';doGeometry()}catch(err){if(el('konsolViewerStatus'))el('konsolViewerStatus').textContent=(err&&err.message)||'3D görünüm açılamadı.'}}
  window.renderKonsol=function(){
    if(viewer&&viewer.destroy){try{viewer.destroy()}catch(_){}}viewer=null;if(geometryRaf){cancelAnimationFrame(geometryRaf);geometryRaf=0}
    var page=el('page');if(!page)return;
    page.innerHTML='<section class="hero"><div><p>RAF SİSTEMLERİ</p><h2>Konsol Kollu Raf</h2></div><div class="capacity"><small>SSI SCHÄFER KRS</small><b>KATALOG</b></div></section><div class="konsol-shell" style="margin-top:18px"><section class="konsol-panel"><h3>Proje Girdileri</h3><div class="konsol-grid">'+
    '<label class="konsol-field full">Proje adı<input id="konsolProjectName" placeholder="Proje adı"></label>'+
    '<label class="konsol-field">Ayak rengi<select id="konsolLegColor" disabled><option>RAL-5010</option></select></label><label class="konsol-field">Kol rengi<select id="konsolArmColor"><option value="ral1007">RAL-1007</option><option value="ral2004">RAL-2004</option></select></label>'+
    '<label class="konsol-field">Ayak profili<select id="konsolUprightProfile"></select></label><label class="konsol-field">Kol profili<select id="konsolArmProfile"></select></label>'+
    '<label class="konsol-field">Ayak yüksekliği modu<select id="konsolHeightMode"><option value="auto">Otomatik</option><option value="manual">Manuel KRS H</option></select></label><label class="konsol-field">En üst kol kotu / KRS H (mm)<select id="konsolHeight"></select></label>'+
    '<label class="konsol-field">Kat adedi<input id="konsolLevels" type="number" min="1" max="12" value="4"></label><label class="konsol-field">Kat arası mesafe (mm)<input id="konsolLevelGap" type="number" min="100" max="3000" step="50" value="1000"></label>'+
    '<label class="konsol-field">Kol derinliği / KRS (mm)<select id="konsolArmLength"></select></label><label class="konsol-field">Taban kat derinliği (mm)<input id="konsolBaseDepth" type="number" min="250" max="3500" step="50" value="1000"></label>'+
    '<label class="konsol-field">Kattaki ağırlık (kg)<input id="konsolLevelLoad" type="number" min="0" max="50000" step="50" value="500"></label><label class="konsol-field">Raf tipi<select id="konsolSide"><option value="single">Tek taraflı</option><option value="double">Çift taraflı</option></select></label>'+
    '<label class="konsol-field">Ayak adedi<input id="konsolUprightCount" type="number" min="2" max="30" value="5"></label><label class="konsol-field">Ayak aralığı (mm)<select id="konsolSpacing"><option value="1000">1.000</option><option value="1250">1.250</option><option value="1500" selected>1.500</option><option value="1750">1.750</option><option value="2000">2.000</option></select></label>'+
    '<div id="krsNative" class="krs-native"><div class="krs-native-title"><span>SSI SCHÄFER KRS KATALOG SEÇİMİ</span><small>interpolasyon yok</small></div><div class="krs-native-cards"><div class="krs-card"><h5></h5><div class="profiles"></div><div class="meta"></div><button type="button" data-krs-rec="0"></button></div><div class="krs-card"><h5></h5><div class="profiles"></div><div class="meta"></div><button type="button" data-krs-rec="1"></button></div></div><div id="krsStatus" class="krs-status"></div></div>'+
    '</div><div id="konsolSetSummary" class="konsol-set-summary"></div></section><section class="konsol-view-card"><div class="konsol-view-wrap"><div><h3>3D Görünüm</h3><div class="konsol-toolbar"><button data-kview="perspective" class="active">Perspektif</button><button data-kview="front">Ön</button><button data-kview="side">Yan</button><button data-kview="top">Üst</button></div></div><canvas id="konsolCanvas"></canvas><div id="konsolViewerStatus" class="konsol-status">3D görünüm yükleniyor…</div></div></section><section class="konsol-section-card"><h3>Kesit Yer Belirleme</h3><div class="konsol-section-grid"><div id="konsolSectionSvg" class="konsol-section-preview"></div><div><label class="konsol-field">Kesit açısı<div class="konsol-angle-row"><input id="konsolAngle" type="range" min="0" max="359" step="1" value="35"><input id="konsolAngleValue" type="number" min="0" max="359" value="35"></div></label><div class="foot-note"><b>Açı seçimi:</b> Kesit yönünü 0–359° arasında belirle. Açı hareketi 3D geometriyi yeniden kurmaz.</div></div></div></section></div>';
    syncHeight(false);syncDepths();syncProfiles(true);
    ['konsolUprightCount','konsolSpacing','konsolBaseDepth','konsolArmColor'].forEach(function(id){el(id).addEventListener('input',scheduleGeometry);el(id).addEventListener('change',scheduleGeometry)});
    el('konsolLevels').addEventListener('input',function(){syncHeight(false);syncDepths();updateAll(true)});
    el('konsolLevelGap').addEventListener('input',function(){if(el('konsolHeightMode').value==='auto'){syncHeight(false);syncDepths();updateAll(true)}});
    el('konsolHeightMode').addEventListener('change',function(){syncHeight(true);syncDepths();updateAll(true)});
    el('konsolHeight').addEventListener('change',function(){if(el('konsolHeightMode').value==='manual'){el('konsolLevelGap').value=String(Math.round(num('konsolHeight',4000)/Math.max(1,num('konsolLevels',4))))}syncDepths();updateAll(true)});
    el('konsolSide').addEventListener('change',function(){syncDepths();updateAll(true)});
    el('konsolArmLength').addEventListener('change',function(){syncProfiles(true);scheduleGeometry()});
    el('konsolLevelLoad').addEventListener('input',function(){syncProfiles(true);scheduleGeometry()});
    el('konsolUprightProfile').addEventListener('change',function(){syncProfiles(false);scheduleGeometry()});
    el('konsolArmProfile').addEventListener('change',function(){validateManual();scheduleGeometry()});
    page.querySelectorAll('[data-krs-rec]').forEach(function(btn){btn.addEventListener('click',function(){applyRec(Number(btn.dataset.krsRec)||0)})});
    el('konsolAngle').addEventListener('input',function(){el('konsolAngleValue').value=el('konsolAngle').value;refreshAngle()});
    el('konsolAngleValue').addEventListener('input',function(){var v=((Number(el('konsolAngleValue').value)||0)%360+360)%360;el('konsolAngle').value=v;refreshAngle()});
    page.querySelectorAll('[data-kview]').forEach(function(btn){btn.addEventListener('click',function(){page.querySelectorAll('[data-kview]').forEach(function(x){x.classList.toggle('active',x===btn)});if(viewer&&viewer.setView)viewer.setView(btn.dataset.kview)})});
    mount();
  };
})();
</script>`;
html=html.replace('</body>',runtime+'\n</body>');
for(const required of ['data-rafex-konsol-v2="1"','data-rafex-krs-native="v9"','/konsol-viewer.js?v=konsol-krs-v9','SSI SCHÄFER KRS KATALOG SEÇİMİ','En üst kol kotu / KRS H','Kat arası mesafe (mm)','Kattaki ağırlık (kg)','6000:{600:{240:7590,270:11420}','1250:{80:505,100:885,120:1420,140:2110}','AORDER=[80,100,120,140]'])if(!html.includes(required))throw new Error('Konsol v9 doğrulaması eksik: '+required);
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
console.log('Konsol native v9: tek runtime, exact SSI SCHAEFER KRS tablosu, top-arm H ve rAF performans akisi aktif.');