import fs from 'node:fs';
import {evaluateKonsolWorkbook,recommendKonsolWorkbook} from '../client/konsol-workbook-engine.mjs';
const catalog=JSON.parse(fs.readFileSync('data/konsol-workbook.json','utf8'));
export function transform(html){
 if(html.includes('data-konsol-workbook="1"'))return html;
 const replace=(from,to)=>{if(!html.includes(from))throw Error('Workbook integration anchor missing: '+from.slice(0,90));html=html.replace(from,to);};
 const functionReplace=(signature,next,replacement)=>{const a=html.indexOf(signature),b=html.indexOf(next,a+signature.length);if(a<0||b<0)throw Error('Function missing '+signature);html=html.slice(0,a)+replacement+'\n'+html.slice(b);};
 // Remove the superseded catalogue observer, retaining geometry and input components.
 html=html.replace(/<script data-rafex-konsol-krs-catalog="v8">[\s\S]*?<\/script>/g,'');
 functionReplace('  function syncProfiles(preferRec){','  function renderCard(',`  function syncProfiles(preferRec){
    for(var pair of [['konsolUprightProfile','IPE '],['konsolArmProfile','NPI ']]){var select=el(pair[0]);if(!select)continue;var old=select.value,rows=window.rafexKonsolWorkbook.profiles.filter(p=>p.name.startsWith(pair[1]));var markup=rows.map(p=>'<option value="'+p.name.toLowerCase().replaceAll(' ','')+'">'+p.name+'</option>').join('');if(select.innerHTML!==markup){select.innerHTML=markup;select.value=old||rows[0].name.toLowerCase().replaceAll(' ','');}select.disabled=false;}
  }`);
 functionReplace('  function syncDepths(){','  function syncProfiles(',`  function syncDepths(){var sel=el('konsolArmLength');if(!sel)return;var old=Number(sel.value)||1000,values=[400,600,800,1000,1200,1250,1500,1800,2000,2500,3000];if(!values.includes(old))values.push(old);values.sort((a,b)=>a-b);sel.innerHTML=values.map(v=>'<option value="'+v+'">'+fmt(v)+' mm</option>').join('');sel.value=String(old);sel.disabled=false;syncProfiles(true);}`);
 functionReplace(' function compute(){',' function updateSelection(){',` function compute(){
  if(!e('konsolUprightProfile')||!e('konsolArmProfile'))return null;
  return window.rafexKonsolWorkbook.recommend({count:n('femSupportArms',0),levels:n('konsolLevels',0),gap:n('konsolLevelGap',0),arm:n('konsolArmLength',0),base:n('konsolBaseDepth',0),load:n('femUnitLoad',0),sides:e('konsolSide')?.value==='double'?2:1});
 }
`);
 functionReplace(' function updateSelection(){',' function scheduleSelection(){',` function updateSelection(){
  raf=0;syncDemand();var box=e('konsolAutoSelection'),up=e('konsolUprightProfile'),arm=e('konsolArmProfile'),result=compute();if(!box||!up||!arm||!result)return;
  var choice=result.choice,invalid=!result.valid;
  if(choice){applying=true;for(var pair of [[up,choice.u.key],[arm,choice.a.key]])if(pair[0].value!==pair[1]){pair[0].value=pair[1];pair[0].dispatchEvent(new Event('change',{bubbles:true}));}applying=false;}
  box.classList.toggle('invalid',invalid);box.innerHTML='<small>EXCEL · GELİŞMİŞ STATİK ANALİZ · S235</small><b>'+(choice?'Ayak '+choice.u.name+' · Kol '+choice.a.name:'UYGUN PROFİL ÖNERİSİ YOK')+'</b><span>'+(invalid?result.reason:fmt(result.load)+' kg/kat ÷ '+result.count+' kol = '+fmt(result.armLoad)+' kg/kol · Kat arası '+fmt(result.gap)+' mm · Ayak kullanım %'+fmt(choice.columnUsage*100)+' · Kol kullanım %'+fmt(choice.armUsage*100)+' · Toplam sehim '+choice.total.toLocaleString('tr-TR')+' / '+choice.totalLimit.toLocaleString('tr-TR')+' mm · En hafif uygun ayak–kol çifti')+'</span>';
  box.setAttribute('role',invalid?'alert':'status');box.setAttribute('aria-live','polite');window.__rafexKonsolSsiState=result;
 }
`);
 replace("<summary>SSI SCHÄFER tablo kontrolü nasıl çalışır?</summary><div class=\"tech-body\">Geçici seçim yalnız yüklenen SSI SCHÄFER KRS katalog satırlarını kullanır. Ayak yüksekliği, kol derinliği, profil veya kapasite tabloda birebir bulunmuyorsa ara değer hesabı, yuvarlama ve ekstrapolasyon yapılmaz; seçim ve çıktı işlemleri durdurulur.</div>","<summary>Excel hesabı nasıl çalışır?</summary><div class=\"tech-body\">Kaynak: KONSOL KOL KAPASİTE HESABI (1), ikinci sayfa. S235, E=200.000 N/mm² ve zayıf eksen burkulma mesafesi 2.000 mm sabittir. Kat yükü taşıyan kol adedine eşit bölünür; yük kol boyunca yayılı kabul edilir. Gerçek 3D kol kotları ve ayak boyu kullanılır. Ayak ve kol kapasitesi, L/200 yerel sehim ve min(15 mm, L/100) toplam sehim birlikte kontrol edilir. Uygun çiftler profil ağırlığına göre sıralanır. Hesap tek taraflı, 2–12 kol katı içindir.</div>");
 replace("#konsolFreeAdd,#konsolCreateOutput,#konsolProjectSave,#konsolPdf'","#konsolFreeAdd,#konsolCreateOutput,#konsolProjectSave,#konsolPdf,#rafexKonsolCommonSaveRack'");
 html=html.replaceAll('SSI SCHÄFER KRS TABLO KAPSAMI DIŞINDA','EXCEL HESABINDA UYGUN PROFİL YOK').replaceAll('Yalnız SSI SCHÄFER KRS tablo seçimi','Excel ikinci sayfa · Ayak ve kol seçimi').replaceAll(' mm — SSI KRS tablosunda yok',' mm').replaceAll('Manuel KRS H','Manuel').replaceAll('Kol derinliği / KRS (mm)','Kol derinliği (mm)');
 const engine=`<script data-konsol-workbook="1">(()=>{const profiles=${JSON.stringify(catalog.profiles)};${evaluateKonsolWorkbook.toString()}\n${recommendKonsolWorkbook.toString()}\nwindow.rafexKonsolWorkbook={profiles,recommend:s=>recommendKonsolWorkbook(profiles,s)};})();</script>`;
 replace('<script data-rafex-konsol-input-redesign="v11">',engine+'\n<script data-rafex-konsol-input-redesign="v11">');
 return html;
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-konsol-workbook.mjs')){
 const path='dist/server/index.js',source=fs.readFileSync(path,'utf8'),m=source.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('Missing HTML');
 const html=transform(Buffer.from(m[1],'base64').toString('utf8'));fs.writeFileSync(path,source.replace(m[1],Buffer.from(html).toString('base64')));console.log('Konsol: workbook profile and combined deflection selection installed.');
}
