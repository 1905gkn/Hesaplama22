import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createTypeColors} from './type-colors-v144.mjs';
const r=createTypeColors(),names=Array.from({length:1000},(_,i)=>{let n=i+1,s='';while(n){n--;s=String.fromCharCode(65+n%26)+s;n=Math.floor(n/26)}return s;});
const colors=names.map(r.color);assert.equal(new Set(colors).size,1000);assert.notEqual(r.color('A'),r.color('I'));
assert.deepEqual(colors.slice(0,6),['#e00024','#0055ff','#008a30','#8200c9','#009fac','#ed008c'],'first types use distinct categorical colors');
assert.notEqual(r.color('A'),r.color('Raf 1'));assert.notEqual(r.color('Raf 1'),r.color('Blok 1'));
const restored=createTypeColors(JSON.parse(JSON.stringify(r.assigned)));for(const name of names.reverse())assert.equal(restored.color(name),r.color(name));
for(const hex of colors){const rgb=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255),max=Math.max(...rgb),min=Math.min(...rgb),d=max-min;let h=max===rgb[0]?((rgb[1]-rgb[2])/d)%6:max===rgb[1]?(rgb[2]-rgb[0])/d+2:(rgb[0]-rgb[1])/d+4;h=(h*60+360)%360;assert(h<20||h>=100,'pallet-like warm hue excluded');}
const s=fs.readFileSync(process.argv[2]||'dist/server/index.js','utf8'),html=Buffer.from(s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/)[1],'base64').toString();
for(const m of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g))if(m[1].trim()&&!/type="(?:module|application\/json)"/.test(m[0]))new vm.Script(m[1]);
assert(html.includes('function m2TypeColor(typeName) {return window.rafexTypeColorV144(typeName);'));
assert(html.includes('function colorFor(value){return window.rafexTypeColorV144(value);'));
assert(html.includes("key='rafex-type-colors-v145'"),'replace the former similar-tone assignments');
console.log('PASS v144: 1000 unique colors, reload stability, all entrypoints and pallet hue exclusion.');
