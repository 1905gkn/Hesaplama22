import fs from 'node:fs';
import {createTypeColors} from './type-colors-v144.mjs';
const file='dist/server/index.js',source=fs.readFileSync(file,'utf8'),m=source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);
let html=Buffer.from(m[2],'base64').toString();
const replace=(a,b)=>{if(!html.includes(a))throw Error('Missing color anchor: '+a);html=html.replace(a,b)};
replace("function typeColor(i){return['#D94F64','#369A73','#2F80C0','#D39A16','#8159B7','#E06B38','#138C91','#B84E88'][i%8]}","function typeColor(i){return window.rafexTypeColorV144(labelFor(i))}");
replace('color=row.color||s.typeColor||typeColor(i);','color=window.rafexTypeColorV144(row.name||labelFor(i));');
replace("letterColor=it.spec.typeColor||palette[i%palette.length];","letterColor=window.rafexTypeColorV144(it.spec.typeName||window.rafexTypeLetterV144(i));");
replace('color=rack.typeColor||(group&&group.getAttribute("data-type-color"))||"#2878d0";', 'color=window.rafexTypeColorV144(rack.typeName);');
for(const signature of ['function m2TypeColor(typeName) {','function colorFor(value){']){
  if(!html.includes(signature))throw Error('Missing type color entrypoint '+signature);
  html=html.replace(signature,signature+'return window.rafexTypeColorV144('+(signature.includes('typeName')?'typeName':'value')+');');
}
const runtime=`<script data-rafex-type-colors="v144">(function(){
const create=${createTypeColors.toString()},key='rafex-type-colors-v144';let saved={};try{saved=JSON.parse(localStorage.getItem(key)||'{}')||{}}catch(_){}
const registry=create(saved);window.rafexTypeColorV144=function(name){const before=Object.keys(registry.assigned).length,color=registry.color(name);if(Object.keys(registry.assigned).length!==before)try{localStorage.setItem(key,JSON.stringify(registry.assigned))}catch(_){}return color};
window.rafexTypeLetterV144=function(i){let n=i+1,s='';while(n>0){n--;s=String.fromCharCode(65+n%26)+s;n=Math.floor(n/26)}return s};
})();</script>`;
const first=html.indexOf('<script');html=html.slice(0,first)+runtime+html.slice(first);
fs.writeFileSync(file,source.replace(m[0],m[0].replace(m[2],Buffer.from(html).toString('base64'))));
console.log('v144: unique persistent type colors, no eight-type repetition.');
