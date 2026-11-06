import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const file=process.argv[2]||'dist/index.html';let html=fs.readFileSync(file,'utf8');if(!file.endsWith('.html')){const m=html.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);assert(m);html=Buffer.from(m[2],'base64').toString();}
assert(html.includes('data-catalog-report="v520"'));
const script=html.match(/<script data-drawing-catalog="v158">([\s\S]*?)<\/script>/)[1];
for(const status of [401,403,409,413,500]){
 const identity={drawingCatalogId:452,drawingCatalogRevision:3},node={textContent:'',dataset:{}};
 const c={structuredClone,Event,document:{getElementById:id=>id==='rafexAuthorityProjectName'?{value:'Kontrol'}:id==='rafexProjectStartStatusV157'?node:null,addEventListener(){}},req:async()=>{const error=new Error('Sunucu ayrıntısı '+status);error.status=status;throw error;}};
 c.window={rafexProjectIdentityV133:identity,rafexProjectTypesV133:[{id:1,drawing:{}}]};vm.runInNewContext(script,c);
 assert.equal(await c.window.rafexSaveDrawingCatalogV158(),false);assert.equal(c.window.rafexLastCatalogErrorV520.status,status);assert.equal(identity.drawingCatalogRevision,3);assert.equal(identity.drawingCatalogId,452);assert.equal(c.window.rafexProjectSavingV133,false);
 c.req=async()=>({revision:3});assert.equal(await c.window.rafexSaveDrawingCatalogV158(),true);assert.equal(c.window.rafexLastCatalogErrorV520,null);
}
assert(html.includes('const width=Math.max(320,target.clientWidth||'));
assert(html.includes("...details.filter(section=>!section.querySelector('.m2-corporate-final')),...sharedFinals"));
for(const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g))if(!/src=|application\/json/.test(m[1]))new vm.Script(m[2]);
console.log('PASS v520: server error details retained, retry clears stale errors, rejected writes do not advance identity, shared pallet final, actual report width, inline JS parses');
