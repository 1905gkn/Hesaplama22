import fs from 'node:fs';
import assert from 'node:assert/strict';
import vm from 'node:vm';
const target=process.argv[2] || 'portal.html';
let html=fs.readFileSync(target,'utf8');
if(target.endsWith('.js')){
 const encoded=html.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);
 assert(encoded,'Missing application HTML');
 html=Buffer.from(encoded[1],'base64').toString();
}
assert(html.includes('/* site-localization-v202 */'),'Translation runtime missing');
assert(html.includes('/* report-localization-v275 */'),'Synchronous report translation missing');
assert(html.includes('Shelf Panel Calculation'),'English dictionary missing');
assert(html.includes('function refreshHomeLanguage()'),'Dashboard language refresh missing');
const change=html.slice(html.indexOf('async function changeProgramLanguage'),html.indexOf('const i18nObserver'));
assert(change.includes('refreshHomeLanguage();'),'Language switch must refresh dashboard');
assert(!change.includes('$("m2ReportLanguage").value = appLanguage'),'Report language must remain independent');
assert(html.includes('$("authLanguage")?.value || appLanguage || user.default_language'),'Login must preserve selected language');
let count=0;
for(const script of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)){
 if(script[0].includes('type="module"'))continue;
 new vm.Script(script[1]);count++;
}
console.log(`PASS: localization, login, independent report language and ${count} script syntax checks (${target}).`);
