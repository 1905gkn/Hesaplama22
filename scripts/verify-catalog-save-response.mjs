import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const source=fs.readFileSync(new URL('./drawing-catalog-v158.js',import.meta.url),'utf8');
for(const [revision,success] of [[3,true],[4,true],[2,false],[undefined,false],['3',false]]){
 const identity={drawingCatalogId:7,drawingCatalogRevision:3};
 const status={textContent:''};
 const context={structuredClone,Event,document:{getElementById:id=>id==='rafexAuthorityProjectName'?{value:'Test'}:id==='rafexProjectStartStatusV157'?status:null,addEventListener(){}},req:async()=>({revision})};
 context.window={rafexProjectIdentityV133:identity,rafexProjectTypesV133:[{id:1,drawing:{}}]};
 vm.runInNewContext(source,context);
 assert.equal(await context.window.rafexSaveDrawingCatalogV158(),success,String(revision));
 assert.equal(identity.drawingCatalogRevision,success?revision:3);
 assert.equal(context.window.rafexProjectSavingV133,false);
}
console.log('PASS: unchanged/increased revisions succeed; stale/missing/string revisions rejected; save lock released.');
