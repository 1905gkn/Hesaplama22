import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
import {transform} from './export-products-v323.mjs';
const context={TextEncoder};vm.createContext(context);
for(const name of ['product-code-rules-v322.js','export-products-xlsx-v323.js'])vm.runInContext(fs.readFileSync(new URL('../client/'+name,import.meta.url),'utf8'),context);
const rows=[{name:'Ayak takımı',spec:'HR100042001100200 · HR100.80.2,0 · Yükseklik 4.200 mm · Derinlik 1.100 mm',qty:91},{name:'Travers',spec:'CCT1503600150050150 · 3.600 mm · CC150x50x1,50 ST52',qty:2842},{name:'=Özel & <ürün>',spec:'Başlangıç 00123',qty:0}];
const bytes=context.rafexProductWorkbookV323(rows);assert.equal(new DataView(bytes.buffer).getUint32(0,true),0x04034b50);
const text=new TextDecoder().decode(bytes);assert(text.includes('t="inlineStr"'));assert(text.includes('HR100042001100200'));assert(text.includes('<v>2842</v>'));assert(text.includes('=Özel &amp; &lt;ürün&gt;'));assert(text.includes('Başlangıç 00123'));
assert.throws(()=>context.rafexProductWorkbookV323([{name:'Bad',qty:NaN}]));
if(process.argv[2]){
 const html=transform(fs.readFileSync(process.argv[2],'utf8'));assert.equal(transform(html),html);
 for(const script of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g))new vm.Script(script[1]);
 assert(html.includes('class="rafex-floor-export-row"'));assert.equal(html.match(/id="rafexExportProductsV323"/g).length,1);
}
if(process.argv[3])fs.writeFileSync(process.argv[3],bytes);
console.log('PASS v323: genuine XLSX package, text codes, numeric quantities, XML escaping, one export control and inline syntax.');

