import fs from 'node:fs';

const file='dist/server/index.js';
let source=fs.readFileSync(file,'utf8');
const match=source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);
if(!match)throw new Error('HTML_BASE64 not found for FEM 10.2.09 Konsol v10');
let html=Buffer.from(match[2],'base64').toString('utf8');
html=html.replace(/<style data-rafex-konsol-fem="v10">[\s\S]*?<\/style>/g,'').replace(/<script data-rafex-konsol-fem="v10">[\s\S]*?<\/script>/g,'');

const runtime=String.raw`
<style data-rafex-konsol-fem="v10">
#page .fem10209{grid-column:1/-1;border:1px solid #cadbd1;border-radius:12px;background:#f7faf8;padding:11px;display:grid;gap:10px}
#page .fem10209-head{display:flex;justify-content:space-between;align-items:flex-start;gap:10px}
#page .fem10209-head h4{margin:0;font-size:11px;color:#214d39;letter-spacing:.02em}
#page .fem10209-head small{display:block;margin-top:3px;color:#738078;font-size:9px;line-height:1.35}
#page .fem10209-badge{white-space:nowrap;padding:5px 7px;border-radius:999px;background:#e7f0ea;color:#315846;font-size:8px;font-weight:900}
#page .fem10209-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
#page .fem10209-field{display:grid;gap:4px;font-size:9px;font-weight:800;color:#536058}
#page .fem10209-field input,#page .fem10209-field select{width:100%;padding:8px;border:1px solid #d6dfd9;border-radius:7px;background:#fff;color:#17201b;font-weight:800}
#page .fem10209-field.full{grid-column:1/-1}
#page .fem10209-metrics{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px}
#page .fem10209-metric{border:1px solid #dde5df;border-radius:8px;background:#fff;padding:8px;min-width:0}
#page .fem10209-metric small{display:block;color:#758078;font-size:8px;line-height:1.3}
#page .fem10209-metric b{display:block;margin-top:3px;color:#21392d;font-size:11px;line-height:1.3}
#page .fem10209-checks{display:grid;gap:6px}
#page .fem10209-check{padding:8px 9px;border-radius:8px;font-size:9px;line-height:1.45;border-left:4px solid #d3a900;background:#fff8d5;color:#665800}
#page .fem10209-check.ok{border-left-color:#3e7b58;background:#eef7f1;color:#28563d}
#page .fem10209-check.bad{border-left-color:#ba4343;background:#fff0f0;color:#8f2f2f}
#page .fem10209-foot{font-size:8px;line-height:1.45;color:#67736c;background:#eef3f0;border-radius:8px;padding:8px}
@media(max-width:620px){#page .fem10209-grid,#page .fem10209-metrics{grid-template-columns:1fr}}
</style>
<script data-rafex-konsol-fem="v10">
(function(){
 if(window.__rafexKonsolFEM10209V10)return;window.__rafexKonsolFEM10209V10=true;
 var baseRender=window.renderKonsol,raf=0,writingLoad=false;
 function e(id){return document.getElementById(id)}
 function n(id,f){var v=Number(e(id)&&e(id).value);return Number.isFinite(v)?v:f}
 function fmt(v,d){var x=Number(v);if(!Number.isFinite(x))return '-';return x.toLocaleString('tr-TR',{minimumFractionDigits:d||0,maximumFractionDigits:d||0})}
 function kNfromKg(kg){return Math.max(0,Number(kg)||0)*9.81/1000}
 function labelText(id,text){var node=e(id),lab=node&&node.closest('label');if(lab&&lab.firstChild&&lab.firstChild.nodeType===3)lab.firstChild.nodeValue=text}
 function continuityFactor(arms){if(arms>=5)return 1.05;if(arms===4)return 1.10;if(arms===3)return 1.15;return 1.00}
 function manualQph(h){if(h<=3000)return 1.0;if(h>=6000)return 0.5;return 1-(h-3000)/6000}
 function interp(h,points){if(h<=points[0][0])return points[0][1];for(var i=1;i<points.length;i++){if(h<=points[i][0]){var a=points[i-1],b=points[i],t=(h-a[0])/(b[0]-a[0]);return a[1]+(b[1]-a[1])*t}}return points[points.length-1][1]}
 function clearance(h,len){var x;if(len<=3000)x=interp(h,[[3000,200],[6000,250],[9000,300],[13000,400]]);else if(len<=6000)x=interp(h,[[3000,250],[6000,300],[9000,350],[13000,450]]);else x=interp(h,[[3000,300],[6000,350],[9000,400],[13000,500]]);var y=interp(h,[[3000,75],[6000,100],[9000,150],[13000,200]]);return{x:x,y:y}}
 function state(){
   var hTop=Math.max(0,n('konsolHeight',0)),gap=Math.max(100,n('konsolLevelGap',1000)),levels=Math.max(1,Math.round(n('konsolLevels',1))),arm=Math.max(0,n('konsolArmLength',0)),base=Math.max(0,n('konsolBaseDepth',0)),direct=Math.max(0,n('konsolLevelLoad',0));
   var mode=e('femLoadMode')&&e('femLoadMode').value||'direct',unit=Math.max(0,n('femUnitLoad',direct)),supports=Math.max(2,Math.round(n('femSupportArms',2))),method=e('femMethod')&&e('femMethod').value||'simplified';
   var initial=mode==='unit'?unit/supports:direct,k=mode==='unit'&&method==='simplified'?continuityFactor(supports):1,char=initial*k;
   var handling=e('femHandling')&&e('femHandling').value||'manual',qph=handling==='manual'?manualQph(hTop):Math.max(.25,n('femAutoQph',.25));
   var productLen=Math.max(1,n('femProductLength',3000)),cl=clearance(hTop,productLen),visualH=hTop+gap/2;
   return{hTop:hTop,gap:gap,levels:levels,arm:arm,base:base,direct:direct,mode:mode,unit:unit,supports:supports,method:method,initial:initial,k:k,char:char,handling:handling,qph:qph,productLen:productLen,clear:cl,visualH:visualH,outdoor:e('femEnvironment')&&e('femEnvironment').value==='outdoor',asym:e('femLoadSymmetry')&&e('femLoadSymmetry').value==='asym'}
 }
 function metric(name,value){return '<div class="fem10209-metric"><small>'+name+'</small><b>'+value+'</b></div>'}
 function check(cls,title,text){return '<div class="fem10209-check '+cls+'"><b>'+title+'</b><br>'+text+'</div>'}
 function render(){
   raf=0;var box=e('fem10209'),s=state();if(!box)return;
   if(s.mode==='unit'&&s.method==='simplified'&&!writingLoad){writingLoad=true;var load=e('konsolLevelLoad');if(load&&Math.abs(Number(load.value||0)-s.char)>.1){load.value=String(Math.round(s.char*10)/10);load.dispatchEvent(new Event('input',{bubbles:true}));load.dispatchEvent(new Event('change',{bubbles:true}))}writingLoad=false}
   var auto=e('femAutoQph');if(auto)auto.disabled=s.handling!=='automatic';
   var qpvKg=s.char*.25,ulsKn=kNfromKg(s.char)*1.4,armDef=s.arm/200,colX=s.hTop/200,colZ=s.hTop<=6000?(s.hTop/100+(s.hTop*s.hTop)/2000000):null;
   var aphArm=s.handling==='manual'?'1,25 kN':'Ekipman tedarikçisi',baseOk=s.base>=s.arm&&s.arm>0,geometryMsg='Htop '+fmt(s.hTop)+' mm · görsel/toplam ayak yaklaşık '+fmt(s.visualH)+' mm (üst uzatma min. kat arası/2).';
   var metrics='';
   metrics+=metric('Başlangıç kol yükü Qin',fmt(s.initial,1)+' kg');
   metrics+=metric('Süreklilik katsayısı k',s.method==='simplified'?fmt(s.k,2):'Hassas analiz gerekli');
   metrics+=metric('Karakteristik kol yükü',fmt(s.char,1)+' kg');
   metrics+=metric('Qpv düşey yerleştirme',fmt(qpvKg,1)+' kg ≈ '+fmt(kNfromKg(qpvKg),2)+' kN');
   metrics+=metric('Qph yatay yerleştirme',fmt(s.qph,2)+' kN');
   metrics+=metric('ULS birim yük bileşeni γQ=1,4',fmt(ulsKn,2)+' kN');
   metrics+=metric('Kol sehim limiti',fmt(armDef,1)+' mm (L/200)');
   metrics+=metric('Kol maksimum burulma', '6°');
   metrics+=metric('Kolon X sehim limiti',fmt(colX,1)+' mm (H/200)');
   metrics+=metric('Kolon Z sehim limiti',colZ==null?'H>6000: ayrı FEM bağıntısı':fmt(colZ,1)+' mm');
   metrics+=metric('Minimum yatay açıklık X4',fmt(s.clear.x,0)+' mm');
   metrics+=metric('Minimum düşey açıklık Y3',fmt(s.clear.y,0)+' mm');
   e('fem10209Metrics').innerHTML=metrics;
   var checks='';
   checks+=check('ok','H / Htop ayrımı',geometryMsg+' FEM, toplam kolon yüksekliği H ile en üst kol kotu Htop değerlerini ayrı tanımlar; bu panel ikisini ayrı gösterir.');
   checks+=check(baseOk?'ok':'bad','Kol–taban geometrisi',baseOk?'Kol izdüşümü taban uzunluğunu aşmıyor.':'Kol uzunluğu taban derinliğinden büyük; FEM 11.2.2 kontrolüne göre düzeltilmeli.');
   checks+=check('','Bağlantı ve kol kontrolü','Apv yukarı accidental = 5 kN (kol ucu ve kökü ayrı). Yatay accidental: kol ucu '+aphArm+'; taban ucu 2,5 kN. Kol/bağlantı dayanımı ve sehim için analiz veya test gerekir.');
   checks+=check('','Çapraz sistemi','Basitleştirilmiş down-aisle yönteminde ayaklar çiftler halinde, yatay+diyagonal elemanlarla tamamen çaprazlanmalı; çapraz en az en üst kol kotuna kadar devam etmeli ve üst kol seviyesinde kolonun faktörlü maksimum eksenel yükünün %2,5’i için tasarlanmalı.');
   checks+=check('','Taban ve ankraj','Her taban–zemin bağlantısı en az 3 kN çekme ve 5 kN kesmeyi aktarabilmeli. Nihai ankraj ve taban kontrolü zemin/ankraj verileriyle ayrıca yapılmalı.');
   if(s.asym)checks+=check('bad','Asimetrik yük','Otomatik katalog onayı yeterli değildir; Annex D etkileri ve gerçek kol reaksiyonları için özel statik kontrol gerekir.');
   if(s.outdoor)checks+=check('bad','Dış ortam','Rüzgâr ve gerekirse kar yükleri ulusal düzenlemelere göre ayrıca hesaba katılmalı; bu ön kontrol bunları çözmez.');
   if(s.handling==='automatic')checks+=check('','Otomatik elleçleme','Qph ekipman tedarikçisi tarafından verilmeli ve 0,25 kN’dan küçük olamaz. Üst kılavuz kuvvetleri varsa ayrıca modele girilmeli.');
   checks+=check('','FEM analiz kapsamı','Bu ekran FEM 10.2.09 girişlerini, yük aksiyonlarını ve limitleri düzenler. Global 2D/3D ikinci mertebe analiz, burkulma, birleşim rijitliği, taban ve ankraj hesabı çözülmeden “FEM statik olarak onaylı” sonucu üretmez.');
   e('fem10209Checks').innerHTML=checks;
 }
 function schedule(){if(raf)return;raf=requestAnimationFrame(render)}
 function enhance(){
   var page=e('page'),grid=page&&page.querySelector('.konsol-grid'),krs=e('krsNative');if(!grid||!krs||e('fem10209'))return;
   labelText('konsolHeight','En üst kol kotu Htop / seçim H (mm)');
   labelText('konsolLevelLoad','Kattaki ağırlık / kol yükü (kg)');
   var box=document.createElement('section');box.id='fem10209';box.className='fem10209';
   box.innerHTML='<div class="fem10209-head"><div><h4>FEM 10.2.09 · KONSOL KOLLU ÖN KONTROL</h4><small>June 2015 · KRS katalog seçimi ayrı, FEM mühendislik kontrolü ayrı yürür.</small></div><span class="fem10209-badge">FEM 10.2.09</span></div><div class="fem10209-grid"><label class="fem10209-field">Yük giriş tipi<select id="femLoadMode"><option value="direct">Kol başına mevcut yük</option><option value="unit">Ürün toplam ağırlığı</option></select></label><label class="fem10209-field">Hesap yöntemi<select id="femMethod"><option value="simplified">Basitleştirilmiş · Table 6</option><option value="accurate">Hassas yöntem · analiz gerekli</option></select></label><label class="fem10209-field">Ürün toplam ağırlığı Qu (kg)<input id="femUnitLoad" type="number" min="0" step="10" value="1000"></label><label class="fem10209-field">Ürünü taşıyan kol adedi na<input id="femSupportArms" type="number" min="2" max="20" step="1" value="2"></label><label class="fem10209-field">Ürün uzunluğu (mm)<input id="femProductLength" type="number" min="1" step="50" value="3000"></label><label class="fem10209-field">Elleçleme<select id="femHandling"><option value="manual">Forklift / manuel kontrollü</option><option value="automatic">Otomatik sistem</option></select></label><label class="fem10209-field">Otomatik sistem Qph (kN)<input id="femAutoQph" type="number" min="0.25" step="0.05" value="0.25" disabled></label><label class="fem10209-field">Ortam<select id="femEnvironment"><option value="indoor">İç ortam</option><option value="outdoor">Dış ortam</option></select></label><label class="fem10209-field full">Yük yerleşimi<select id="femLoadSymmetry"><option value="sym">Simetrik / normal yerleşim</option><option value="asym">Asimetrik / özel yerleşim</option></select></label></div><div id="fem10209Metrics" class="fem10209-metrics"></div><div id="fem10209Checks" class="fem10209-checks"></div><div class="fem10209-foot"><b>Kaynak mantığı:</b> Kol yükü 9.4.2; yerleştirme/accidental yükleri 6.3–6.4; yük katsayıları 7.4; H/Htop ve burkulma 9.7.5; taban/ankraj 9.10–9.12; analiz 10; sehim limitleri 11; açıklıklar Annex C. Katalogda olmayan SSI KRS kombinasyonu yine seçilemez.</div>';
   krs.insertAdjacentElement('beforebegin',box);
   ['femLoadMode','femMethod','femUnitLoad','femSupportArms','femProductLength','femHandling','femAutoQph','femEnvironment','femLoadSymmetry','konsolHeight','konsolLevelGap','konsolLevels','konsolArmLength','konsolBaseDepth','konsolLevelLoad','konsolSide'].forEach(function(id){var node=e(id);if(!node||node.dataset.fem10209Bound)return;node.dataset.fem10209Bound='1';node.addEventListener('input',schedule);node.addEventListener('change',schedule)});
   schedule();
 }
 window.renderKonsol=function(){if(typeof baseRender==='function')baseRender();setTimeout(enhance,0)};
 document.addEventListener('click',function(ev){if(ev.target.closest('[data-page="konsol"]'))setTimeout(enhance,80)});
 setTimeout(enhance,200);
})();
</script>`;

const close=html.lastIndexOf('</body>');
if(close<0)throw new Error('body close missing for FEM 10.2.09 Konsol v10');
html=html.slice(0,close)+runtime+'\n'+html.slice(close);
for(const required of ['data-rafex-konsol-fem="v10"','FEM 10.2.09 · KONSOL KOLLU ÖN KONTROL','femSupportArms','Qpv düşey yerleştirme','Apv yukarı accidental = 5 kN','3 kN çekme ve 5 kN kesme','Kol sehim limiti','Minimum yatay açıklık X4'])if(!html.includes(required))throw new Error('FEM 10.2.09 Konsol v10 eksik: '+required);
const encoded=Buffer.from(html).toString('base64');
source=source.slice(0,match.index)+match[0].replace(match[2],encoded)+source.slice(match.index+match[0].length);
fs.writeFileSync(file,source);
console.log('Konsol FEM v10: FEM 10.2.09 proje girdileri, yük aksiyonları, limitler ve mühendislik ön kontrol paneli aktif.');
