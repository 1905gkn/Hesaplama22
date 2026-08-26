import fs from 'node:fs';

const file = 'dist/server/index.js';
let source = fs.readFileSync(file, 'utf8');
const match = source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);
if (!match) throw new Error('HTML_BASE64 not found for Konsol input redesign v11');
let html = Buffer.from(match[2], 'base64').toString('utf8');
if (!html.includes('data-rafex-konsol-v2="1"') || !html.includes('data-rafex-konsol-fem="v10"')) {
  throw new Error('Konsol v11 için mevcut KRS v9 ve FEM v10 çalışma ekranı bulunamadı.');
}
html = html
  .replace(/<style data-rafex-konsol-input-redesign="v11">[\s\S]*?<\/style>/g, '')
  .replace(/<script data-rafex-konsol-input-redesign="v11">[\s\S]*?<\/script>/g, '');

const runtime = String.raw`
<style data-rafex-konsol-input-redesign="v11">
#page .konsol-shell{grid-template-columns:minmax(340px,410px) minmax(720px,1fr)!important;gap:18px!important}
#page .konsol-panel{padding:15px!important;position:sticky;top:12px;max-height:calc(100vh - 24px);overflow:auto;scrollbar-width:thin}
#page .konsol-panel>h3{font-size:17px!important;margin-bottom:5px!important}
#page .konsol-panel>h3:after{content:'Yalnız SSI SCHÄFER KRS tablo seçimi';display:block;margin-top:4px;color:#718078;font-size:10px;font-weight:700}
#page .konsol-grid{grid-template-columns:1fr 1fr!important;gap:8px!important}
#page .konsol-load-length-row{grid-column:1/-1;display:grid;grid-template-columns:1fr 1fr;gap:8px}
#page .konsol-load-length-row .fem10209-field{min-width:0}

#page .konsol-field{font-size:9px!important}
#page .konsol-field input,#page .konsol-field select{padding:8px!important;min-height:35px}
#page .konsol-view-card{padding:14px!important;min-width:0}
#page .konsol-view-card h3{font-size:17px!important}
#page #konsolCanvas{height:min(76vh,820px)!important;min-height:680px!important;background:linear-gradient(180deg,#f7faf8 0%,#eef3f0 100%)!important}
#page .krs-native,#page #krs8Recommendation,#page .konsol-rec-wrap{display:none!important}
#page .konsol-field:has(#konsolLevelLoad){display:none!important}
#page .konsol-field:has(#konsolUprightProfile) select,#page .konsol-field:has(#konsolArmProfile) select{pointer-events:none;background:#eaf4ee!important;border-color:#8db69f!important;color:#174b32!important}
#page .fem10209{padding:10px!important;background:#f8fbf9!important}
#page .fem10209-head small{display:none!important}
#page .fem10209-grid{gap:7px!important}
#page .fem10209-field:has(#femLoadMode),#page .fem10209-field:has(#femMethod),#page .fem10209-field:has(#femEnvironment),#page .fem10209-field:has(#femLoadSymmetry){display:none!important}
#page .fem10209-field:has(#femHandling) select,#page .fem10209-field:has(#femAutoQph) input{pointer-events:none;background:#eef4f0!important;color:#214d39!important}
#page .fem10209-metrics,#page .fem10209-checks,#page .fem10209-foot{display:none!important}
#page .konsol-assumption-strip{grid-column:1/-1;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px}
#page .konsol-assumption{border:1px solid #d8e3dc;border-radius:8px;background:#fff;padding:8px;min-width:0}
#page .konsol-assumption small{display:block;color:#748078;font-size:8px;font-weight:800}
#page .konsol-assumption b{display:block;margin-top:3px;color:#214d39;font-size:11px}
#page .konsol-auto-selection{grid-column:1/-1;border:1px solid #8db69f;border-left:5px solid #2f7651;border-radius:10px;background:#eef7f1;padding:10px 11px}
#page .konsol-auto-selection small{display:block;color:#557064;font-size:8px;font-weight:900;letter-spacing:.04em}
#page .konsol-auto-selection b{display:block;margin-top:4px;color:#153f2b;font-size:14px}
#page .konsol-auto-selection span{display:block;margin-top:3px;color:#53675d;font-size:9px;line-height:1.4}
#page .konsol-auto-selection.invalid{border-color:#b4232f!important;border-left-color:#b4232f!important;background:#fff0f1!important}
#page .konsol-auto-selection.invalid small,#page .konsol-auto-selection.invalid b,#page .konsol-auto-selection.invalid span{color:#8b1723!important}
#page .konsol-tech-details{grid-column:1/-1;border:1px solid #d8e3dc;border-radius:9px;background:#fff;overflow:hidden}
#page .konsol-tech-details summary{cursor:pointer;padding:9px 10px;color:#315846;font-size:9px;font-weight:900;list-style-position:inside}
#page .konsol-tech-details .tech-body{padding:0 10px 10px;color:#65736b;font-size:8px;line-height:1.45}
#page .konsol-section-card,#page .konsol-free-card,#page .konsol-pdf-card{grid-column:1/-1!important}
@media(max-width:1250px){#page .konsol-shell{grid-template-columns:minmax(320px,360px) minmax(620px,1fr)!important}#page #konsolCanvas{min-height:600px!important}}
@media(max-width:1050px){#page .konsol-shell{grid-template-columns:1fr!important}#page .konsol-panel{position:static;max-height:none}#page #konsolCanvas{height:650px!important;min-height:520px!important}}
@media(max-width:620px){#page #konsolCanvas{height:520px!important;min-height:460px!important}.konsol-assumption-strip{grid-template-columns:1fr!important}}
</style>
<script data-rafex-konsol-input-redesign="v11">
(function(){
 if(window.__rafexKonsolInputRedesignV11)return;window.__rafexKonsolInputRedesignV11=true;
 var baseRender=window.renderKonsol,observer=null,raf=0,applying=false;
 var U=[
  {key:'ipe180',label:'IPE 180',kg:18.8,A:23.9,W:166.4,iz:2.0},
  {key:'ipe200',label:'IPE 200',kg:22.4,A:28.5,W:220.6,iz:2.2},
  {key:'ipe220',label:'IPE 220',kg:26.2,A:33.4,W:285.4,iz:2.4},
  {key:'ipe240',label:'IPE 240',kg:30.7,A:39.1,W:366.6,iz:2.6},
  {key:'ipe270',label:'IPE 270',kg:36.1,A:45.9,W:483.9,iz:3.0},
  {key:'ipe300',label:'IPE 300',kg:42.2,A:53.8,W:628.3,iz:3.3}
 ];
 var A=[
  {key:'npi80',label:'NPI 80',kg:5.9,Iy:77.8,W:22.8},
  {key:'npi100',label:'NPI 100',kg:8.3,Iy:171,W:39.8},
  {key:'npi120',label:'NPI 120',kg:11.1,Iy:328,W:63.6},
  {key:'npi140',label:'NPI 140',kg:14.3,Iy:573,W:95.4}
 ];
 var HEIGHTS=[2500,3000,3500,4000,5000,6000];
 var KRS_U={
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
 var KRS_ARM={400:{80:1445,100:2415},600:{80:1030,100:1755,120:2720,140:3035},800:{80:810,100:1370,120:2150,140:3125},1000:{80:640,100:1120,120:1755,140:2585},1250:{80:505,100:885,120:1420,140:2110},1500:{80:380,100:730,120:1170,140:1755},2000:{80:215,100:470,120:850,140:1285}};
 function e(id){return document.getElementById(id)}
 function setValue(id,value){var node=e(id);if(!node)return;node.value=value;node.dispatchEvent(new Event('change',{bubbles:true}))}
 function relabel(id,text){var node=e(id),label=node&&node.closest('label');if(label&&label.firstChild&&label.firstChild.nodeType===3)label.firstChild.nodeValue=text}
 function n(id,f){var v=Number(e(id)&&e(id).value);return Number.isFinite(v)?v:f}
 function fmt(v){return Math.round(Number(v)||0).toLocaleString('tr-TR')}
 function available(select,list){var values=Array.from(select&&select.options||[]).map(function(o){return o.value});return list.filter(function(p){return values.indexOf(p.key)>=0})}
 function syncDemand(){
   if(applying)return;var load=Math.max(0,n('femUnitLoad',0)),arms=Math.max(1,Math.round(n('femSupportArms',2))),hidden=e('konsolLevelLoad'),count=e('konsolUprightCount');
   applying=true;
   if(hidden&&Math.abs(Number(hidden.value||0)-load)>.01){hidden.value=String(load);hidden.dispatchEvent(new Event('input',{bubbles:true}));hidden.dispatchEvent(new Event('change',{bubbles:true}))}
   if(count&&Number(count.value)!==arms){count.value=String(arms);count.dispatchEvent(new Event('input',{bubbles:true}));count.dispatchEvent(new Event('change',{bubbles:true}))}
   applying=false;
 }
 function compute(){
   var up=e('konsolUprightProfile'),ap=e('konsolArmProfile');if(!up||!ap)return null;
   var count=Math.max(1,Math.round(n('femSupportArms',2))),levels=Math.max(1,Math.round(n('konsolLevels',1))),h=n('konsolHeight',0),arm=n('konsolArmLength',0),level=Math.max(0,n('femUnitLoad',0)),side=e('konsolSide')&&e('konsolSide').value==='double'?'double':'single';
   var tableHeight=HEIGHTS.indexOf(h)>=0,row=tableHeight&&KRS_U[side]&&KRS_U[side][h]&&KRS_U[side][h][arm]||null,armRow=KRS_ARM[arm]||null,sideDemand=level*levels,ups=available(up,U),arms=available(ap,A),all=[];
   if(row&&armRow)ups.forEach(function(u){var ui=Number(u.key.replace('ipe','')),uc=row[ui];if(!uc)return;arms.forEach(function(a){var ai=Number(a.key.replace('npi','')),ac=armRow[ai];if(!ac||ai>100&&ui<220)return;all.push({u:u,a:a,uc:uc,ac:ac,cap:Math.min(uc/levels,ac),safe:uc>=sideDemand&&ac>=level})})});
   var safe=all.filter(function(x){return x.safe}),choice=safe[0]||null,reason='';
   if(!tableHeight)reason='Ayak yüksekliği '+fmt(h)+' mm SSI SCHÄFER KRS tablosunda yok.';else if(!row)reason='H '+fmt(h)+' mm ve kol derinliği '+fmt(arm)+' mm kombinasyonu SSI SCHÄFER KRS tablosunda yok.';else if(!armRow)reason='Kol derinliği '+fmt(arm)+' mm SSI SCHÄFER kol tablosunda yok.';else if(!choice)reason=fmt(level)+' kg/kat ve '+levels+' kat için SSI SCHÄFER tablosunda yeterli ayak-kol profili yok.';
   return{choice:choice,level:level,total:sideDemand,design:sideDemand,count:count,levels:levels,sides:side==='double'?2:1,h:h,arm:arm,reason:reason,valid:!!choice}
 }
 function updateSelection(){
   raf=0;syncDemand();var box=e('konsolAutoSelection'),up=e('konsolUprightProfile'),arm=e('konsolArmProfile'),result=compute();if(!box||!up||!arm||!result)return;
   var choice=result.choice,invalid=!result.valid;
   if(choice){applying=true;if(up.value!==choice.u.key){up.value=choice.u.key;up.dispatchEvent(new Event('change',{bubbles:true}))}if(arm.value!==choice.a.key){arm.value=choice.a.key;arm.dispatchEvent(new Event('change',{bubbles:true}))}applying=false}
   box.classList.toggle('invalid',invalid);box.innerHTML='<small>SSI SCHÄFER KRS TABLO SEÇİMİ · TAHMİN / EKSTRAPOLASYON YOK</small><b>'+(choice?'Ayak '+choice.u.label+' · Kol '+choice.a.label:'TABLO KAPSAMI DIŞINDA')+'</b><span>'+(invalid?result.reason+' Profil seçimi, Serbest Yerleşim ekleme, proje kaydı ve PDF çıktısı durduruldu.':fmt(result.level)+' kg/kat × '+result.levels+' kat = '+fmt(result.total)+' kg taraf yükü · ayak kapasitesi '+fmt(choice.uc)+' kg/side · kol kapasitesi '+fmt(choice.ac)+' kg UDL · SSI KRS tablosuna göre 3D modele uygulandı')+'</span>';
   box.setAttribute('role',invalid?'alert':'status');box.setAttribute('aria-live','polite');window.__rafexKonsolSsiState=result;
 }
 function scheduleSelection(){if(!raf)raf=requestAnimationFrame(updateSelection)}
 function enhance(){
   var page=e('page'),grid=page&&page.querySelector('.konsol-grid'),fem=e('fem10209');if(!grid||!fem)return;
   if(e('konsolLoadLengthRow'))return;
   page.dataset.konsolInputRedesign='1';
   var panel=page.querySelector('.konsol-panel>h3');if(panel)panel.textContent='Konsol Girdi Bölümü';
   setValue('femLoadMode','direct');setValue('femMethod','simplified');setValue('femHandling','manual');setValue('femEnvironment','indoor');setValue('femLoadSymmetry','sym');
   var handling=e('femHandling');if(handling){handling.innerHTML='<option value="manual">Forklift</option>';handling.value='manual';handling.setAttribute('aria-readonly','true')}
   var qph=e('femAutoQph');if(qph){qph.value='0.25';qph.disabled=true;qph.setAttribute('aria-label','Otomatik sistem Qph bilgi değeri 0,25 kN')}
   var env=e('femEnvironment');if(env){env.innerHTML='<option value="indoor">İç ortam</option>';env.value='indoor'}
   relabel('femUnitLoad','Her katın ürün ağırlığı (kg)');relabel('femSupportArms','Ürünü taşıyan kol adedi na');relabel('femProductLength','Ürün uzunluğu (mm)');relabel('femHandling','Elleçleme');
   var spacingLabel=e('konsolSpacing')&&e('konsolSpacing').closest('label'),weightLabel=e('femUnitLoad')&&e('femUnitLoad').closest('label'),lengthLabel=e('femProductLength')&&e('femProductLength').closest('label');
   if(spacingLabel&&weightLabel&&lengthLabel){var inputRow=document.createElement('div');inputRow.id='konsolLoadLengthRow';inputRow.className='konsol-load-length-row';spacingLabel.insertAdjacentElement('afterend',inputRow);inputRow.appendChild(weightLabel);inputRow.appendChild(lengthLabel)}
   relabel('femAutoQph','Otomatik sistem Qph (kN) · bilgi');relabel('konsolUprightProfile','Otomatik ayak profili');relabel('konsolArmProfile','Otomatik kol profili');
   var strip=document.createElement('div');strip.className='konsol-assumption-strip';strip.innerHTML='<div class="konsol-assumption"><small>ORTAM</small><b>İç ortam</b></div><div class="konsol-assumption"><small>ÇEVRESEL YÜKLER</small><b>Rüzgâr / kar uygulanmaz</b></div>';
   fem.querySelector('.fem10209-grid').insertAdjacentElement('afterend',strip);
   var auto=document.createElement('div');auto.id='konsolAutoSelection';auto.className='konsol-auto-selection';strip.insertAdjacentElement('afterend',auto);
   var details=document.createElement('details');details.className='konsol-tech-details';details.innerHTML='<summary>SSI SCHÄFER tablo kontrolü nasıl çalışır?</summary><div class="tech-body">Geçici seçim yalnız yüklenen SSI SCHÄFER KRS katalog satırlarını kullanır. Ayak yüksekliği, kol derinliği, profil veya kapasite tabloda birebir bulunmuyorsa ara değer hesabı, yuvarlama ve ekstrapolasyon yapılmaz; seçim ve çıktı işlemleri durdurulur.</div>';auto.insertAdjacentElement('afterend',details);
   ['konsolUprightProfile','konsolArmProfile','konsolHeight','konsolLevelGap','konsolLevels','konsolArmLength','konsolBaseDepth','konsolSide','femUnitLoad','femSupportArms'].forEach(function(id){var node=e(id);if(node){node.addEventListener('input',scheduleSelection);node.addEventListener('change',scheduleSelection)}});
   if(observer)observer.disconnect();observer=new MutationObserver(scheduleSelection);if(e('konsolUprightProfile'))observer.observe(e('konsolUprightProfile'),{childList:true,subtree:true,attributes:true});if(e('konsolArmProfile'))observer.observe(e('konsolArmProfile'),{childList:true,subtree:true,attributes:true});
   setTimeout(updateSelection,30);
 }
 window.renderKonsol=function(){if(typeof baseRender==='function')baseRender();setTimeout(enhance,20)};
 window.rafexValidateKonsolSsiTableV14=function(){var result=compute();if(result)window.__rafexKonsolSsiState=result;return result};
 document.addEventListener('click',function(ev){var blocked=ev.target.closest('#konsolFreeAdd,#konsolCreateOutput,#konsolProjectSave,#konsolPdf');if(!blocked)return;var result=compute();if(result&&result.valid)return;ev.preventDefault();ev.stopImmediatePropagation();updateSelection();window.alert('SSI SCHÄFER KRS TABLO KAPSAMI DIŞINDA\n\n'+(result&&result.reason||'Geçerli bir katalog eşleşmesi bulunamadı.')+'\n\nProfil seçimi ve çıktı işlemi durduruldu.')},true);
 document.addEventListener('click',function(ev){if(ev.target.closest('[data-page="konsol"]'))setTimeout(enhance,120)});
 setTimeout(enhance,300);
})();
</script>`;

const close = html.lastIndexOf('</body>');
if (close < 0) throw new Error('body close missing for Konsol input redesign v11');
html = html.slice(0, close) + runtime + '\n' + html.slice(close);
for (const required of [
  'data-rafex-konsol-input-redesign="v11"',
  'Konsol Girdi Bölümü',
  'Forklift',
  'Rüzgâr / kar uygulanmaz',
  'SSI SCHÄFER KRS TABLO SEÇİMİ',
  'TABLO KAPSAMI DIŞINDA',
  'rafexValidateKonsolSsiTableV14',
  'height:min(76vh,820px)',
  'konsolLoadLengthRow',
]) if (!html.includes(required)) throw new Error('Konsol input redesign v11 eksik: ' + required);
const encoded = Buffer.from(html).toString('base64');
source = source.slice(0, match.index) + match[0].replace(match[2], encoded) + source.slice(match.index + match[0].length);
fs.writeFileSync(file, source);
console.log('Konsol v11/v14: yalnız exact SSI SCHÄFER KRS tablosu, kapsam dışı hata kilidi ve büyük 3D alanı aktif.');
