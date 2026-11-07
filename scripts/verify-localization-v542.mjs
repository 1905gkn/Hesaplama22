import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {createInterfaceTranslator} from '../client/translation-core-v542.mjs';
import {transform} from './patch-site-localization-v202.mjs';
const rows=JSON.parse(fs.readFileSync('client/site-translations.json','utf8')),translate=createInterfaceTranslator(rows);
assert.equal(new Set(rows.map(r=>r[0])).size,rows.length,'duplicate source labels');
for(const row of rows){assert.equal(row.length,3);for(const value of row)assert.equal(typeof value,'string');assert(row.every(s=>s.trim()),'empty translation');}
for(const language of ['en','fr'])for(const source of ['Mühendislik Hesapları','Dinamik Rapor Talebi','Statik Rapor Talebi','Diğer Raporlar ve Talepler Talebi','Palet tipi 2','Revizyon 12','Yorumlar (3)','CRM numarası *','Ürün tipi','Görüntüle','Veri Gir / Yanıtla','NOTLARIM VE BANA ATANANLAR','Müşteri tarafından onaylandı','3D Yerleşim','Blok adlarını göster','RAFTA TOPLAM PALET','Düz arabağ','MR Ayak Toplama'].filter(s=>s!=='RAFTA TOPLAM PALET'))assert.notEqual(translate(source,language),source,source+' / '+language);
assert.equal(translate('Raftan rafa: Açık','en'),'Rack to rack: On');
assert.equal(translate('Revizyon 3 · Çalışılıyor','fr'),'Révision 3 · En cours');
assert.equal(translate('Firma adı ara','en'),'Search: Company name');
for(const language of ['tr','en','fr'])for(const source of ['CC125x50x1,50 ST37 · 2.700 mm · 1000 kg','TLKFS0150002700','RAL 5010','MH-00003'])assert.equal(translate(source,language),source,'engineering values must remain unchanged');
const quotesSource=fs.readFileSync('scripts/attributed-quotes-v358.js','utf8'),quotes=JSON.parse(quotesSource.slice(quotesSource.indexOf('['),quotesSource.indexOf('];')+1));
for(const quote of quotes)for(const language of ['en','fr']){assert.notEqual(translate('“'+quote.text+'”',language),'“'+quote.text+'”');assert.equal(translate(quote.text,'tr'),quote.text);}
// Run the actual DOM text update routine across TR -> EN -> FR -> TR.
// In particular, translating an implicit option must never change its value.
const source=fs.readFileSync('client/site-localization.js','utf8'),routine=source.slice(source.indexOf('  function updateText('),source.indexOf('  function apply('));
const context={stats:{textChecks:0},textState:new WeakMap(),i18nOriginalText:new WeakMap(),translate};vm.createContext(context);vm.runInContext(routine+';this.update=updateText;',context);
const option={tagName:'OPTION',value:'Giydirme',hasAttribute(){return !!this.explicit},setAttribute(key,value){this.explicit=value},closest(){return null}},node={nodeValue:'Giydirme',parentElement:option};
for(const language of ['en','fr','tr'])context.update(node,language);
assert.equal(option.explicit,'Giydirme');assert.equal(node.nodeValue,'Giydirme');
const note={nodeValue:'Açık',parentElement:{tagName:'SPAN',closest(){return true}}};context.update(note,'en');assert.equal(note.nodeValue,'Open');context.update(note,'fr');assert.equal(note.nodeValue,'Ouvert');context.update(note,'tr');assert.equal(note.nodeValue,'Açık');
const weather={nodeValue:'Açık',parentElement:{tagName:'SPAN',closest(){return null}}};context.update(weather,'en');assert.equal(weather.nodeValue,'Clear');
const assigned={nodeValue:'Gökhan Kaya · Açık',parentElement:{tagName:'SPAN',closest(){return true}}};context.update(assigned,'en');assert.equal(assigned.nodeValue,'Gökhan Kaya · Open');context.update(assigned,'fr');assert.equal(assigned.nodeValue,'Gökhan Kaya · Ouvert');context.update(assigned,'tr');assert.equal(assigned.nodeValue,'Gökhan Kaya · Açık');
context.attributeState=new WeakMap();context.i18nOriginalAttributes=new WeakMap();context.languageFor=()=> 'fr';context.protectedSelector='textarea';
const attributeRoutine=source.slice(source.indexOf('  function updateAttributes('),source.indexOf('  i18nObserver.disconnect();'));
vm.runInContext(attributeRoutine+';this.attributes=updateAttributes;',context);
const textarea={tagName:'TEXTAREA',value:'Kullanıcının değiştirilmemesi gereken notu',props:{placeholder:'Notunuzu veya yapılacak işi yazın…'},closest(){return this},hasAttribute(k){return k in this.props},getAttribute(k){return this.props[k]},setAttribute(k,v){this.props[k]=v}};
context.attributes(textarea);assert.equal(textarea.props.placeholder,'Saisissez votre note ou tâche…');assert.equal(textarea.value,'Kullanıcının değiştirilmemesi gereken notu');
const patched=transform('<html><body><script>const UI_TRANSLATIONS={en:{},fr:{}};let applyTranslations,translatedUiText;const i18nObserver={disconnect(){}};const i18nOriginalText=new WeakMap(),i18nOriginalAttributes=new WeakMap();</script></body></html>');
for(const match of patched.matchAll(/<script>([\s\S]*?)<\/script>/g))new vm.Script(match[1]);
assert(patched.includes('rafexTranslateExtended542='));
const result=await build({entryPoints:['client/customer-view.entry.js'],bundle:true,format:'iife',minify:true,target:'es2022',write:false});new vm.Script(result.outputFiles[0].text);
const engineering=fs.readFileSync('client/engineering-v488.js','utf8');new vm.Script(engineering);
console.log(`PASS v542: ${rows.length} complete labels, ${quotes.length} quotes, EN/FR/TR switching, unchanged option values/codes, contextual status, inline app and customer bundle.`);
