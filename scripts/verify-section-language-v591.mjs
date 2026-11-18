import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';import {build} from 'esbuild';
import {translateAccessoryText591 as tr} from '../client/report-accessory-language-v591.mjs';
import {transform,transformViewerSource} from './section-dimensions-language-v591.mjs';
import {transformViewerSource as collection} from './collection-only-v584.mjs';
import {transformViewerSource as labels} from './accessory-labels-v384.mjs';
for(const lang of ['en','fr'])for(const text of ['Tavalı','H travers','Palet dayama','Kat teli','Toplama katı','Toplama katı ZS travers','Toplama katı tavası','Hafif deprem çaprazı','Bariyer koruma','UAKZ ayak koruma','TOPLAMA 18 · 425 mm','Z–TOPLAMA 1 · 500 mm']){
 const translated=tr(text,lang);assert.notEqual(translated,text,text+' '+lang);assert.equal(tr(text,'tr'),text);assert.equal(tr(translated,lang),translated);for(const n of text.match(/\d+/g)||[])assert(translated.includes(n));
}
assert.equal(tr('SEWS TYPE B · HR90.80.2,0','en'),'SEWS TYPE B · HR90.80.2,0');assert.equal(tr('Kat teli\nToplama katı','fr'),'Platelage grillagé\nNiveau de picking');
const source=fs.readFileSync('client/b2b-viewer.entry.js','utf8').replace('levels: clamp(Math.round(Number(next.levels) || 4), 1, 15),','levels: clamp(Math.round(Number(next.levels) || 4), 1, 25),');
const b2b=transformViewerSource(labels(collection(source))),mr=transformViewerSource(fs.readFileSync('client/mr-viewer.entry.js','utf8'),'mr');
const mrProduction=fs.readFileSync('client/mr-viewer.entry.js','utf8').replace(/    if \(this.config.dimensions.markers\) \{[\s\S]*?\n    \}/,'    if (this.config.dimensions.markers) {\n      this.addDimensionLabel(layer, x-420, uprightHeight, z, `AYAK BOYU · ${this.dimensionValue(uprightHeight)}`, 760, "uprightHeight");\n    }');
assert(transformViewerSource(mrProduction,'mr').includes('if (this.config.dimensions.uprightHeight) {'));
assert.equal(transformViewerSource(b2b),b2b);
const start=b2b.indexOf('    const topPallet ='),end=b2b.indexOf('    const eyeStart =',start),block=b2b.slice(start,end);
for(const topPallet of [false,true])for(const uprightHeight of [false,true])for(const levels of [0,3]){
 const marks=[],model={options:{levels,dimensions:{topPallet,uprightHeight}},loadBottom:()=>5000,palletHeightAt:()=>1200,uprightHeight:()=>6500,dimensionValue:String,addLevelMarker(...args){marks.push(args[4]);}};
 vm.runInNewContext('function draw(){'+block+'}draw.call(model)',{model,markersLayer:{},markerX:0,frontY:0,rackWidth:2700});
 assert.equal(marks.some(s=>s.includes('ÜST PALET')),topPallet&&levels>0);assert.equal(marks.some(s=>s.includes('AYAK BOYU')),uprightHeight);
}
const html=transform(fs.readFileSync(process.argv[2]||'local-review/index.html','utf8'));assert.equal(transform(html),html);assert(!html.includes('data-rafex-dimension="markers"'));assert(html.includes('data-rafex-dimension="topPallet"'));assert(html.includes('data-rafex-dimension="uprightHeight"'));
const cloneStart=html.indexOf('  function cloneView(value = {}, defaults = DEFAULT_VIEW)'),cloneEnd=html.indexOf('  function loadSettings()',cloneStart),context={DIMENSION_DEFAULTS:{markers:true},DEFAULT_VIEW:{dimensions:{markers:true}},clamp:(x,a,b)=>Math.min(b,Math.max(a,x)),number:(x,d)=>Number.isFinite(Number(x))?Number(x):d};vm.createContext(context);vm.runInContext(html.slice(cloneStart,cloneEnd),context);
for(const value of [true,false]){const migrated=context.cloneView({dimensions:{markers:value}});assert.equal(migrated.dimensions.topPallet,value);assert.equal(migrated.dimensions.uprightHeight,value);}
const explicit=context.cloneView({dimensions:{markers:true,topPallet:false,uprightHeight:true}});assert.equal(explicit.dimensions.topPallet,false);assert.equal(explicit.dimensions.uprightHeight,true);
for(const text of [b2b,mr])await build({stdin:{contents:text,resolveDir:process.cwd()+'/client'},bundle:true,write:false,format:'iife',target:'es2022',logLevel:'silent'});
for(const m of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g))if(m[1].trim())new vm.Script(m[1]);
console.log('PASS independent top-pallet/upright toggles, all combinations and zero-level sections, legacy migration, EN/FR accessory and picking captions, preserved codes/numbers, two viewer builds and inline syntax.');

