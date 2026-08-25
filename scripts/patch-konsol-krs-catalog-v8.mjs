import fs from 'node:fs';

const file='dist/server/index.js';
let source=fs.readFileSync(file,'utf8');
const match=source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);
if(!match)throw new Error('HTML_BASE64 not found for Konsol KRS v8');
let html=Buffer.from(match[2],'base64').toString('utf8');

// Eski formullu oneriyi tarayicidan tamamen kaldir; build-time kesit/capraz duzeltmeleri korunur.
html=html
  .replace(/<style data-rafex-konsol-recommendations="v7">[\s\S]*?<\/style>/g,'')
  .replace(/<script data-rafex-konsol-recommendations="v7">[\s\S]*?<\/script>/g,'')
  .replace(/<style data-rafex-konsol-krs-catalog="v8">[\s\S]*?<\/style>/g,'')
  .replace(/<script data-rafex-konsol-krs-catalog="v8">[\s\S]*?<\/script>/g,'');

// Otomatik yukseklik = en ust kol kotu: kat adedi x kat arasi mesafe.
const oldAuto="function autoHeight(){var levels=Math.max(1,positive('konsolLevels',4));var gap=Math.max(100,positive('konsolLevelGap',1000));return Math.max(1000,Math.round((levels*gap+500)/100)*100)}";
const newAuto="function autoHeight(){var levels=Math.max(1,positive('konsolLevels',4));var gap=Math.max(100,positive('konsolLevelGap',1000));return Math.max(1000,Math.round((levels*gap)/100)*100)}";
if(html.includes(oldAuto))html=html.replace(oldAuto,newAuto);
else if(!html.includes(newAuto))throw new Error('Konsol v6 autoHeight hedefi bulunamadi.');

const runtime=String.raw`
<style data-rafex-konsol-krs-catalog="v8">
#page .krs8-wrap{grid-column:1/-1;display:grid;gap:8px;margin-top:2px}
#page .krs8-head{display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:10px;font-weight:900;color:#315846;letter-spacing:.03em}
#page .krs8-head small{font-size:9px;color:#758078;font-weight:700;letter-spacing:0}
#page .krs8-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
#page .krs8-card{border:1px solid #dce6df;border-radius:10px;padding:10px;background:#f8fbf9;display:grid;gap:7px}
#page .krs8-card.primary{border-color:#90b8a2;background:#eff7f2}
#page .krs8-card.bad{border-color:#e1b1b1;background:#fff5f5}
#page .krs8-card h5{margin:0;font-size:10px;color:#315846}
#page .krs8-profiles{font-size:12px;line-height:1.45;color:#26352e}
#page .krs8-meta{font-size:9px;color:#6d786f;line-height:1.45}
#page .krs8-card button{padding:8px 9px;border-radius:7px;background:#315846;color:#fff;font-size:10px;font-weight:900}
#page .krs8-card button:disabled{opacity:.45;cursor:not-allowed}
#page .krs8-status{font-size:9px;padding:8px 9px;border-radius:7px;background:#eef4f0;color:#315846;line-height:1.45}
#page .krs8-status.bad{background:#fff0f0;color:#9b2f2f}
#page .krs8-catalog-select{width:100%;padding:10px;border:1px solid #e5d991;background:#fff8d5;border-radius:8px;font-weight:800;color:#17201b}
@media(max-width:700px){#page .krs8-grid{grid-template-columns:1fr}}
</style>
<script data-rafex-konsol-krs-catalog="v8">
(function(){
 if(window.__rafexKonsolKRSCatalogV8)return;window.__rafexKonsolKRSCatalogV8=true;
 var HEIGHTS=[2500,3000,3500,4000,5000,6000];
 var UORDER=[180,200,220,240,270,300];
 var AORDER=[80,100,120,140];
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
 var applying=false,manual=false,last=[];
 function e(id){return document.getElementById(id)}
 function n(id,f){var v=Number(e(id)&&e(id).value);return Number.isFinite(v)?v:f}
 function fmt(v){return Math.round(Number(v)||0).toLocaleString('tr-TR')}
 function side(){return e('konsolSide')&&e('konsolSide').value==='double'?'double':'single'}
 function exactHeight(){var h=n('konsolHeight',0);return HEIGHTS.indexOf(h)>=0?h:0}
 function exactDepth(){var d=n('konsolArmLength',0);return ARM[d]?d:0}
 function row(){var h=exactHeight(),d=exactDepth();return h&&d&&U[side()]&&U[side()][h]&&U[side()][h][d]||null}
 function validDepths(){var h=exactHeight(),t=h&&U[side()]&&U[side()][h];return t?Object.keys(t).map(Number).sort(function(a,b){return a-b}):[]}
 function demand(){var level=Math.max(0,n('konsolLevelLoad',0)),levels=Math.max(1,n('konsolLevels',1));return{level:level,side:level*levels}}
 function armAllowedForU(a,u){return a<=100||u>=220}
 function combos(){var r=row(),d=exactDepth(),ar=d&&ARM[d],dem=demand(),out=[];if(!r||!ar)return out;UORDER.forEach(function(u){if(!r[u])return;AORDER.forEach(function(a){if(!ar[a]||!armAllowedForU(a,u))return;out.push({u:u,a:a,uc:r[u],ac:ar[a],safe:r[u]>=dem.side&&ar[a]>=dem.level})})});return out}
 function recommendations(){var all=combos(),safe=all.filter(function(x){return x.safe});if(!safe.length)return[];safe.sort(function(x,y){return UORDER.indexOf(x.u)-UORDER.indexOf(y.u)||AORDER.indexOf(x.a)-AORDER.indexOf(y.a)});var first=safe[0],second=safe.filter(function(x){return x.u>first.u||x.a>first.a})[0]||first;return[first,second]}
 function setOptions(select,values,prefix,current){if(!select)return;select.innerHTML='';values.forEach(function(v){var o=document.createElement('option');o.value=(prefix==='ipe'?'ipe':'npi')+v;o.textContent=(prefix==='ipe'?'IPE ':'INP ')+v;if(String(current)===String(o.value))o.selected=true;select.appendChild(o)})}
 function rebuildManualOptions(preferRec){var up=e('konsolUprightProfile'),ap=e('konsolArmProfile'),r=row(),d=exactDepth(),ar=d&&ARM[d];if(!up||!ap)return;if(!r||!ar){up.innerHTML='<option>Katalogda yok</option>';ap.innerHTML='<option>Katalogda yok</option>';up.disabled=true;ap.disabled=true;return}var oldU=up.value,ups=UORDER.filter(function(u){return !!r[u]});setOptions(up,ups,'ipe',oldU);up.disabled=false;var chosen=Number((up.value||'').replace('ipe',''))||ups[0];if(preferRec&&last[0]){up.value='ipe'+last[0].u;chosen=last[0].u}var oldA=ap.value,arms=AORDER.filter(function(a){return !!ar[a]&&armAllowedForU(a,chosen)});setOptions(ap,arms,'npi',oldA);if(preferRec&&last[0]&&arms.indexOf(last[0].a)>=0)ap.value='npi'+last[0].a;ap.disabled=false}
 function ensureDepthSelect(){var input=e('konsolArmLength');if(!input)return null;var sel=e('konsolArmDepthCatalog');if(!sel){sel=document.createElement('select');sel.id='konsolArmDepthCatalog';sel.className='krs8-catalog-select';input.style.display='none';input.insertAdjacentElement('afterend',sel);sel.addEventListener('change',function(){if(!sel.value)return;input.value=sel.value;input.dispatchEvent(new Event('input',{bubbles:true}));input.dispatchEvent(new Event('change',{bubbles:true}));updateAll(true)})}var values=validDepths(),cur=Number(input.value)||0;sel.innerHTML='';if(values.indexOf(cur)<0){var bad=document.createElement('option');bad.value='';bad.textContent=(cur?fmt(cur)+' mm — SSI KRS tablosunda yok':'Katalog derinliği seçin');bad.selected=true;bad.disabled=true;sel.appendChild(bad)}values.forEach(function(v){var o=document.createElement('option');o.value=v;o.textContent=fmt(v)+' mm';if(v===cur)o.selected=true;sel.appendChild(o)});sel.disabled=!values.length;return sel}
 function labelTopHeight(){var h=e('konsolHeight'),lab=h&&h.closest('label');if(lab&&lab.firstChild&&lab.firstChild.nodeType===3)lab.firstChild.nodeValue='En üst kol kotu / KRS H (mm)'}
 function renderCard(card,opt,index){if(!card)return;card.classList.toggle('primary',index===0);card.classList.toggle('bad',!opt);var title=card.querySelector('h5'),pro=card.querySelector('.krs8-profiles'),meta=card.querySelector('.krs8-meta'),btn=card.querySelector('button');if(!opt){title.textContent='KATALOGDA UYGUN EŞLEŞME YOK';pro.textContent='Ayak ve kol seçimi yapılamaz.';meta.textContent='Yük, H veya derinlik SSI KRS tablosundaki kombinasyonları aşıyor.';btn.disabled=true;return}title.textContent=index===0?'EN KÜÇÜK UYGUN KRS':'BİR ÜST KRS SEÇENEĞİ';pro.innerHTML='<b>Ayak:</b> IPE '+opt.u+'<br><b>Kol:</b> INP '+opt.a;meta.textContent='Ayak kapasitesi '+fmt(opt.uc)+' kg/side · kol kapasitesi '+fmt(opt.ac)+' kg UDL';btn.disabled=false;btn.textContent=(index+1)+'. seçeneği uygula'}
 function validateManual(){var st=e('krs8Status'),r=row(),d=exactDepth(),ar=d&&ARM[d],dem=demand(),u=Number((e('konsolUprightProfile')&&e('konsolUprightProfile').value||'').replace('ipe','')),a=Number((e('konsolArmProfile')&&e('konsolArmProfile').value||'').replace('npi',''));if(!st)return;if(!r||!ar||!r[u]||!ar[a]||!armAllowedForU(a,u)){st.className='krs8-status bad';st.textContent='SSI KRS tablosunda bu kombinasyon yok; seçim kapalı.';return}var ok=r[u]>=dem.side&&ar[a]>=dem.level;st.className='krs8-status'+(ok?'':' bad');st.textContent=(ok?'UYGUN':'KAPASİTE YETERSİZ')+' · taraf yükü '+fmt(dem.side)+' kg / IPE kapasite '+fmt(r[u])+' kg · kol yükü '+fmt(dem.level)+' kg / INP kapasite '+fmt(ar[a])+' kg'}
 function apply(index){var opt=last[index];if(!opt)return;applying=true;var up=e('konsolUprightProfile'),ap=e('konsolArmProfile');if(up){up.value='ipe'+opt.u;up.dispatchEvent(new Event('change',{bubbles:true}))}rebuildManualOptions(false);if(ap){ap.value='npi'+opt.a;ap.dispatchEvent(new Event('change',{bubbles:true}))}applying=false;manual=false;validateManual()}
 function updateAll(preferRec){ensureDepthSelect();last=recommendations();var host=e('krs8Recommendation'),cards=host&&host.querySelectorAll('.krs8-card');if(cards){renderCard(cards[0],last[0],0);renderCard(cards[1],last[1],1)}rebuildManualOptions(!!preferRec);validateManual()}
 function enhance(){var profileRow=document.querySelector('#page .konsol-profile-row');if(!profileRow)return;labelTopHeight();var note=document.querySelector('#page .konsol-v6-note');if(note)note.textContent='SSI SCHÄFER KRS katalog seçimi: yalnız tabloda bulunan H, derinlik, IPE ve INP kombinasyonları seçilebilir. Interpolasyon ve formül ile katalog dışı profil üretimi yoktur.';if(!e('krs8Recommendation')){var wrap=document.createElement('div');wrap.id='krs8Recommendation';wrap.className='krs8-wrap';wrap.innerHTML='<div class="krs8-head"><span>SSI SCHÄFER KRS KATALOG SEÇİMİ</span><small>yalnız katalog satırları</small></div><div class="krs8-grid"><div class="krs8-card primary"><h5></h5><div class="krs8-profiles"></div><div class="krs8-meta"></div><button type="button" data-krs8="0"></button></div><div class="krs8-card"><h5></h5><div class="krs8-profiles"></div><div class="krs8-meta"></div><button type="button" data-krs8="1"></button></div></div><div id="krs8Status" class="krs8-status"></div>';profileRow.insertAdjacentElement('afterend',wrap);wrap.querySelectorAll('button[data-krs8]').forEach(function(b){b.addEventListener('click',function(){apply(Number(b.dataset.krs8))})})}
 var up=e('konsolUprightProfile'),ap=e('konsolArmProfile');if(up&&!up.dataset.krs8){up.dataset.krs8='1';up.addEventListener('change',function(){manual=!applying;rebuildManualOptions(false);validateManual()})}if(ap&&!ap.dataset.krs8){ap.dataset.krs8='1';ap.addEventListener('change',function(){manual=!applying;validateManual()})}
 ['konsolHeight','konsolLevels','konsolLevelGap','konsolLevelLoad','konsolSide'].forEach(function(id){var x=e(id);if(x&&!x.dataset.krs8){x.dataset.krs8='1';x.addEventListener('input',function(){setTimeout(function(){updateAll(!manual)},0)});x.addEventListener('change',function(){setTimeout(function(){updateAll(!manual)},0)})}});
 updateAll(true)}
 var baseRender=window.renderKonsol;window.renderKonsol=function(){if(typeof baseRender==='function')baseRender();setTimeout(enhance,0)};
 new MutationObserver(function(){if(document.querySelector('#page .konsol-profile-row'))enhance()}).observe(document.documentElement,{subtree:true,childList:true});
 setTimeout(enhance,100);
})();
</script>`;

const bodyClose=html.lastIndexOf('</body>');
if(bodyClose<0)throw new Error('Konsol KRS v8 body kapanisi bulunamadi.');
html=html.slice(0,bodyClose)+runtime+'\n'+html.slice(bodyClose);
for(const required of ['data-rafex-konsol-krs-catalog="v8"','SSI SCHÄFER KRS KATALOG SEÇİMİ','En üst kol kotu / KRS H (mm)','KATALOGDA UYGUN EŞLEŞME YOK','INP 140','6000:{600:{240:7590,270:11420}']){
 if(!html.includes(required))throw new Error('Konsol KRS v8 dogrulama eksigi: '+required);
}
if(html.includes('data-rafex-konsol-recommendations="v7"'))throw new Error('Eski formullu Konsol v7 runtime hala canli HTML icinde.');
const encoded=Buffer.from(html).toString('base64');
source=source.slice(0,match.index)+match[0].replace(match[2],encoded)+source.slice(match.index+match[0].length);
fs.writeFileSync(file,source);
console.log('Konsol KRS v8: SSI SCHAEFER katalog tablolari disinda profil/derinlik secimi kapatildi; otomatik H en ust kol kotuna baglandi.');
