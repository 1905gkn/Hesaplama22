import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const html=fs.readFileSync('portal.html','utf8');
const start=html.indexOf('const UI_TRANSLATIONS =');
const end=html.indexOf('      function applyTranslations(',start);
const context={appLanguage:'tr'};
vm.createContext(context);
vm.runInContext(html.slice(start,end)+';this.translate=translatedUiText;this.terms=RACK_TERMINOLOGY;',context);
for(const [tr,en,fr] of context.terms){
 assert.equal(context.translate(tr,'en'),en);
 assert.equal(context.translate(tr,'fr'),fr);
 assert.equal(context.translate(tr,'tr'),tr);
}
for(const lang of ['tr','en','fr'])assert.equal(context.translate('CC125x50x1,50 ST37 · 2.700 mm · 1000 kg',lang),'CC125x50x1,50 ST37 · 2.700 mm · 1000 kg');
const reportStart=html.indexOf('function m2ReportDictionary(language)');
vm.runInContext(html.slice(reportStart,html.indexOf('function m2CorporateUsedTypes()',reportStart)),context);
assert.equal(context.m2ReportDictionary('en').items.traverse,'Beam');
assert.equal(context.m2ReportDictionary('fr').items.traverse,'Lisse');
assert.equal(context.m2ReportDictionary('fr').items.footTeam,'Échelle');
assert.equal(context.m2ReportDictionary('tr').items.traverse,'Travers');
assert.deepEqual(Object.keys(context.m2ReportDictionary('en')).sort(),Object.keys(context.m2ReportDictionary('fr')).sort());
console.log('PASS: '+context.terms.length+' technical labels in EN/FR/TR, report terminology, unchanged profile codes and numeric text.');
