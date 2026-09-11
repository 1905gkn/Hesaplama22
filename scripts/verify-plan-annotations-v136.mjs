import fs from 'node:fs';
import assert from 'node:assert/strict';
import vm from 'node:vm';
const s=fs.readFileSync(process.argv[2]||'dist/server/index.js','utf8');
const html=Buffer.from(s.match(/const\s+HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/)[1],'base64').toString();
for(const m of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g))if(m[1].trim()&&!m[0].includes('type="module"')&&!m[0].includes('application/json'))new vm.Script(m[1]);
const sizing=html.slice(html.indexOf('const areaPointsV136='),html.indexOf('if ($("m2ShowFlowArrows")',html.indexOf('const areaPointsV136=')));
const size=new Function('cellW','palletRowH','m2LayoutState',sizing+'return {flowFont,flowH};');
for(const meters of [50,100])for(const pallet of [800,1000,1200]){
  const scale=530/(meters*1000),row=pallet*scale,limit=meters===50?1:1.5;
  const result=size(1000*scale,row,{scale,points:[{x:0,y:0},{x:meters*1000*scale,y:meters*1000*scale}]});
  assert(result.flowFont*1.35<=row*.84*limit,'arrow with outline must fit pallet limit');
  assert(result.flowH<=row*.84*limit,'arrow container must fit pallet limit');
}
const start=html.indexOf('function compactNameplateV136('),end=html.indexOf('function decorateRack(',start),attributes={};
const text={textContent:'E',getBBox:()=>({x:30,y:20,width:8,height:12})},plate={setAttribute:(k,v)=>attributes[k]=Number(v)};
const context=vm.createContext({getComputedStyle:()=>({display:'block',fontSize:'12px'})});
vm.runInContext(html.slice(start,end),context);
context.compactNameplateV136({querySelector:()=>plate,querySelectorAll:()=>[text]});
assert.equal(attributes.width,8+12*.44);assert.equal(attributes.height,12+12*.44);
assert(html.includes("'#4056a1','#087f8c','#b43f8d','#6b416f'"));
assert(html.includes('typeColor = m2TypeColor(rack.typeName);'));
console.log('PASS v136: 50m/100m arrow limits, compact nameplate, distinct E color and runtime syntax.');
