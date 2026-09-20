import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const source=fs.readFileSync('scripts/patch-common-drawing-single-line-letter-v58.mjs','utf8');
const runtime=source.match(/const runtime = String.raw`([\s\S]*?)`;/)[1];
const script=runtime.match(/<script[^>]*>([\s\S]*?)<\/script>/)[1];
new vm.Script(script);
assert(!runtime.includes('non-scaling-stroke'));
assert(runtime.includes('baseSize=11'));
assert(runtime.includes('Math.max(.1,Math.min(2'),'rendered type-letter scale must honor the 10% control value');
assert(!runtime.includes('Math.max(.5,Math.min(2'),'hidden 50% rendering floor must be removed');
assert(runtime.includes('function rackSystemName(group)'),'Drive-In and Mekik system labels must be derived from each rack');
assert(runtime.includes('return "Drive-In"')&&runtime.includes('return "Mekik"'),'both requested system names must be rendered');
assert(runtime.includes('systemFont=4.2*scale'),'system names must use the same scale ratio as the section letter');
assert(runtime.includes('class","rafex-single-line-system-v58"'),'system names must be emitted into the SVG output');
assert(runtime.includes('path.setAttribute("style","fill:none;stroke-width:1.5px;'));
const helperContext=vm.createContext({window:{m2LayoutState:{racks:[
  {id:1,rafexSystem:'drive'},
  {id:2,rafexSystem:'mekik2'},
  {id:3,rafexSystem:'b2b',b2bLayout:{}},
]}}});
const scaleHelper=script.slice(script.indexOf('function letterScale'),script.indexOf('function letterContrast'));
const systemHelper=script.slice(script.indexOf('function rackSystemName'),script.indexOf('function decorateGroup'));
vm.runInContext(scaleHelper+'\n'+systemHelper,helperContext);
const group=(id)=>({getAttribute:(name)=>name==='data-rack'?String(id):''});
helperContext.window.rafexCommonTypeLetterScaleV65=()=>.1;
assert.equal(helperContext.letterScale(),.1,'10% scale must reach the SVG decorator unchanged');
assert.equal(helperContext.rackSystemName(group(1)),'Drive-In');
assert.equal(helperContext.rackSystemName(group(2)),'Mekik');
assert.equal(helperContext.rackSystemName(group(3)),'','B2B must not receive a Drive-In/Mekik subtitle');
const scaleSource=fs.readFileSync('scripts/patch-common-drawing-type-letter-scale-v65.mjs','utf8');
assert(scaleSource.includes('min="10" max="200" step="5"'),'type-letter input must allow 10%');
assert(scaleSource.includes('Math.max(10,Math.min(200'),'stored and entered type-letter scale must clamp to 10–200%');
assert(!scaleSource.includes('min="50" max="200" step="5"'),'old 50% lower bound must not remain');

// Exercise the real decorator and both report serialization mechanisms. Source
// label sizes intentionally differ to represent single and double depth rows.
const racks=[7,12].map((size,row)=>`<g data-rack="${row}" data-type-color="#2878d0"><rect class="m2-b2b-plan-pallet" x="10" y="${10+row*35}" width="180" height="${row?25:14}" fill="#c78330"/>${[30,65,100,135,170].map(x=>`<g><text class="m2-b2b-plan-label" x="${x}" y="${20+row*35}" style="font-size:${size}px">B</text></g>`).join('')}</g>`).join('');
const fixture=`<!doctype html><meta charset="utf-8"><title>Plan harfi ölçek kontrolü</title><style>body{font:16px Arial}svg{display:block;background:#f8faf9}iframe{border:0;width:440px;height:170px}</style><div id="page"><h2>Serbest yerleşim</h2><svg id="m2LayoutSvg" width="800" viewBox="0 0 210 85">${racks}</svg><h2>Çıktı önizlemesi (yarı ölçek)</h2><div id="preview"></div><h2>Bağımsız PDF içeriği (CSS taşınmadan)</h2><iframe id="print"></iframe><p id="result">Kontrol bekleniyor</p></div>${runtime}<script>
rafexCommonSingleLineLetterV58.decorate();
const original=document.getElementById('m2LayoutSvg'),copy=original.cloneNode(true);copy.removeAttribute('id');copy.setAttribute('width','400');document.getElementById('preview').appendChild(copy);
const raw=original.outerHTML.replace('id="m2LayoutSvg"','').replace('width="800"','width="400"');
document.getElementById('print').srcdoc='<style>text{display:none}</style>'+raw;
const marks=Array.from(original.querySelectorAll('.rafex-single-line-letter-v58'));
const scales=marks.map(m=>m.getAttribute('transform').split('scale(')[1]);
document.getElementById('result').textContent=marks.length===2&&new Set(scales).size===1?'PASS: Tekli ve çift sıra aynı harf ölçüsü':'FAIL';
</script>`;
fs.mkdirSync('outputs/letter-review',{recursive:true});
fs.writeFileSync('outputs/letter-review/index.html',fixture);
console.log('Glyph syntax and export-safe style checks passed; browser fixture ready.');
