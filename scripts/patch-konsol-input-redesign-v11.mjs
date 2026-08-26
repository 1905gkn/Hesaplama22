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
#page .konsol-panel>h3:after{content:'Excel girişleriyle otomatik KRS seçimi';display:block;margin-top:4px;color:#718078;font-size:10px;font-weight:700}
#page .konsol-grid{grid-template-columns:1fr 1fr!important;gap:8px!important}
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
 var FY=355,E=210000,GQ=1.5,ALPHA=.34,DEF=200;
 function e(id){return document.getElementById(id)}
 function setValue(id,value){var node=e(id);if(!node)return;node.value=value;node.dispatchEvent(new Event('change',{bubbles:true}))}
 function relabel(id,text){var node=e(id),label=node&&node.closest('label');if(label&&label.firstChild&&label.firstChild.nodeType===3)label.firstChild.nodeValue=text}
 function n(id,f){var v=Number(e(id)&&e(id).value);return Number.isFinite(v)?v:f}
 function fmt(v){return Math.round(Number(v)||0).toLocaleString('tr-TR')}
 function continuity(arms){if(arms>=5)return 1.05;if(arms===4)return 1.10;if(arms===3)return 1.15;return 1}
 function braceRows(h){return h<=3500?3:(h<=4500?4:5)}
 function armCap(p,L){L=Math.max(250,L);var mpl=p.W*FY/1000;var strength=2*mpl/(L/1000)/GQ/9.81*1000;var deflection=8*E*(p.Iy*10000)/(DEF*L*L)/9.81;return Math.max(0,Math.min(strength,deflection))}
 function uprightCap(p,count,levels,h,arm){var area=p.A*100,iz=p.iz*10,lcr=Math.max(1,h/Math.max(1,braceRows(h)-1));var ncr=Math.PI*Math.PI*E*area*iz*iz/(lcr*lcr)/1000;var lambda=Math.sqrt((area*FY)/(Math.max(.001,ncr)*1000));var phi=.5*(1+ALPHA*(lambda-.2)+lambda*lambda);var root=Math.sqrt(Math.max(0,phi*phi-lambda*lambda));var chi=Math.min(1,1/Math.max(.0001,phi+root));var nb=chi*area*FY/1000;var mpl=p.W*FY/1000;var denom=1/Math.max(.001,nb)+(arm/1000)/Math.max(.001,mpl);return(count/Math.max(1,levels))/denom/GQ/9.81*1000}
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
   var count=Math.max(1,Math.round(n('femSupportArms',2))),levels=Math.max(1,Math.round(n('konsolLevels',1))),h=Math.max(1000,n('konsolHeight',4500)),arm=Math.max(250,n('konsolArmLength',1000)),base=Math.max(250,n('konsolBaseDepth',arm)),level=Math.max(0,n('femUnitLoad',0)),sides=e('konsolSide')&&e('konsolSide').value==='double'?2:1,k=continuity(count),demand=level*k*sides;
   var ups=available(up,U),arms=available(ap,A),all=[];
   ups.forEach(function(u){arms.forEach(function(a){var ac=armCap(a,arm)*count*sides,uc=uprightCap(u,count,levels,h,arm),cap=Math.min(ac,uc),weight=u.kg*count*((h/1000)+(base/1000)*sides)+a.kg*count*levels*(arm/1000)*sides;all.push({u:u,a:a,cap:cap,ac:ac,uc:uc,weight:weight,safe:demand<=cap,usage:cap?demand/cap:99})})});
   all.sort(function(x,y){return x.weight-y.weight||x.cap-y.cap});var safe=all.filter(function(x){return x.safe}),choice=safe[0]||all.slice().sort(function(x,y){return y.cap-x.cap})[0]||null;
   return{choice:choice,level:level,total:level*levels*sides,design:demand,k:k,count:count,levels:levels,sides:sides}
 }
 function updateSelection(){
   raf=0;syncDemand();var box=e('konsolAutoSelection'),up=e('konsolUprightProfile'),arm=e('konsolArmProfile'),result=compute();if(!box||!up||!arm||!result)return;
   var choice=result.choice,invalid=!choice||!choice.safe;
   if(choice){applying=true;if(up.value!==choice.u.key){up.value=choice.u.key;up.dispatchEvent(new Event('change',{bubbles:true}))}if(arm.value!==choice.a.key){arm.value=choice.a.key;arm.dispatchEvent(new Event('change',{bubbles:true}))}applying=false}
   box.innerHTML='<small>FEM MUHAFAZAKÂR OTOMATİK ÖN SEÇİM</small><b>'+(choice?'Ayak '+choice.u.label+' · Kol '+choice.a.label:'Uygun profil bulunamadı')+'</b><span>'+fmt(result.level)+' kg/kat × '+result.levels+' kat'+(result.sides===2?' × 2 taraf':'')+' = '+fmt(result.total)+' kg toplam · na '+result.count+' · k '+result.k.toLocaleString('tr-TR',{minimumFractionDigits:2,maximumFractionDigits:2})+(choice?' · ön kapasite '+fmt(choice.cap)+' kg/kat · kullanım %'+Math.round(choice.usage*100):'')+(invalid?' · KAPASİTE AŞIMI':' · 3D modele uygulandı')+'</span>';
   box.style.borderColor=invalid?'#d88':'#8db69f';box.style.background=invalid?'#fff2f2':'#eef7f1';
 }
 function scheduleSelection(){if(!raf)raf=requestAnimationFrame(updateSelection)}
 function enhance(){
   var page=e('page'),grid=page&&page.querySelector('.konsol-grid'),fem=e('fem10209');if(!grid||!fem||page.dataset.konsolInputRedesign==='1')return;
   page.dataset.konsolInputRedesign='1';
   var panel=page.querySelector('.konsol-panel>h3');if(panel)panel.textContent='Konsol Girdi Bölümü';
   setValue('femLoadMode','direct');setValue('femMethod','simplified');setValue('femHandling','manual');setValue('femEnvironment','indoor');setValue('femLoadSymmetry','sym');
   var handling=e('femHandling');if(handling){handling.innerHTML='<option value="manual">Forklift</option>';handling.value='manual';handling.setAttribute('aria-readonly','true')}
   var qph=e('femAutoQph');if(qph){qph.value='0.25';qph.disabled=true;qph.setAttribute('aria-label','Otomatik sistem Qph bilgi değeri 0,25 kN')}
   var env=e('femEnvironment');if(env){env.innerHTML='<option value="indoor">İç ortam</option>';env.value='indoor'}
   relabel('femUnitLoad','Her katın ürün ağırlığı (kg)');relabel('femSupportArms','Ürünü taşıyan kol adedi na');relabel('femProductLength','Ürün uzunluğu (mm)');relabel('femHandling','Elleçleme');
   var spacingLabel=e('konsolSpacing')&&e('konsolSpacing').closest('label'),weightLabel=e('femUnitLoad')&&e('femUnitLoad').closest('label'),lengthLabel=e('femProductLength')&&e('femProductLength').closest('label');
   if(spacingLabel&&weightLabel&&lengthLabel){spacingLabel.insertAdjacentElement('afterend',weightLabel);weightLabel.insertAdjacentElement('afterend',lengthLabel)}
   relabel('femAutoQph','Otomatik sistem Qph (kN) · bilgi');relabel('konsolUprightProfile','Otomatik ayak profili');relabel('konsolArmProfile','Otomatik kol profili');
   var strip=document.createElement('div');strip.className='konsol-assumption-strip';strip.innerHTML='<div class="konsol-assumption"><small>ORTAM</small><b>İç ortam</b></div><div class="konsol-assumption"><small>ÇEVRESEL YÜKLER</small><b>Rüzgâr / kar uygulanmaz</b></div>';
   fem.querySelector('.fem10209-grid').insertAdjacentElement('afterend',strip);
   var auto=document.createElement('div');auto.id='konsolAutoSelection';auto.className='konsol-auto-selection';strip.insertAdjacentElement('afterend',auto);
   var details=document.createElement('details');details.className='konsol-tech-details';details.innerHTML='<summary>Neden kapasite SSI tablosundan daha düşük?</summary><div class="tech-body">Bu ön seçim eski proje FEM tablosundaki muhafazakâr yöntemi kullanır: γQ = 1,50, kol için hem dayanım hem L/200 sehim sınırı, ayak için burkulma azaltma eğrisi ve eksenel yük + eğilme etkileşimi birlikte kontrol edilir. SSI katalog değerleri sistem testlerine ve üretici bağlantı kabullerine dayanabildiği için daha yüksek çıkabilir. Seçimde yalnız mevcut SSI KRS profil seçenekleri arasından FEM hesabını geçen en hafif kombinasyon kullanılır.</div>';auto.insertAdjacentElement('afterend',details);
   ['konsolUprightProfile','konsolArmProfile','konsolHeight','konsolLevelGap','konsolLevels','konsolArmLength','konsolBaseDepth','konsolSide','femUnitLoad','femSupportArms'].forEach(function(id){var node=e(id);if(node){node.addEventListener('input',scheduleSelection);node.addEventListener('change',scheduleSelection)}});
   if(observer)observer.disconnect();observer=new MutationObserver(scheduleSelection);if(e('konsolUprightProfile'))observer.observe(e('konsolUprightProfile'),{childList:true,subtree:true,attributes:true});if(e('konsolArmProfile'))observer.observe(e('konsolArmProfile'),{childList:true,subtree:true,attributes:true});
   setTimeout(updateSelection,30);
 }
 window.renderKonsol=function(){if(typeof baseRender==='function')baseRender();setTimeout(enhance,20)};
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
  'FEM MUHAFAZAKÂR OTOMATİK ÖN SEÇİM',
  'height:min(76vh,820px)',
]) if (!html.includes(required)) throw new Error('Konsol input redesign v11 eksik: ' + required);
const encoded = Buffer.from(html).toString('base64');
source = source.slice(0, match.index) + match[0].replace(match[2], encoded) + source.slice(match.index + match[0].length);
fs.writeFileSync(file, source);
console.log('Konsol v11: Excel girdileri, sade otomatik profil seçimi, büyük 3D alanı ve sabit çevresel bilgi aktif.');
