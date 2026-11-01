import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const source=fs.readFileSync('scripts/patch-common-system-previews-v115.mjs','utf8');
const show=source.slice(source.indexOf(' async function show('),source.indexOf(' function ensureLane('));
new vm.Script(show);
for(const system of ['mekik2','drive']){
 const status={outerHTML:'',textContent:''},title={},body={innerHTML:'',querySelector:()=>status},modal={hidden:true,querySelector:s=>s==='.rsv115-body'?body:title};let captured;
 const ctx={detailToken:0,detailViewer:null,closeDetail(){},ensureDetail:()=>modal,systemOf:()=>system,label:s=>s,meta:()=>'<meta>',esc:s=>String(s).replaceAll('&','&amp;').replaceAll('"','&quot;'),window:{rafexCaptureTechnicalViews:async(d,s)=>{captured={d,s};return{front:'data:image/svg+xml,front',side:'data:image/svg+xml,side'}}}};
 vm.createContext(ctx);vm.runInContext(show,ctx);const drawing={levels:4,totalWidth:5850,railLength:4500};await ctx.show({drawing},'C');assert.equal(captured.d,drawing);assert.equal(captured.s,system);assert.ok(status.outerHTML.includes('data:image/svg+xml,front'));assert.ok(status.outerHTML.includes('data:image/svg+xml,side'));assert.ok(!body.innerHTML.includes('<svg'),'Never display a generic fallback as a real technical view');
 ctx.window.rafexCaptureTechnicalViews=async()=>{throw Error('offline')};await ctx.show({drawing},'C');assert.ok(status.textContent.includes('offline'));
}
console.log('PASS Mekik and Drive-In detail: saved geometry routed to native front/side capture; explicit loading failure instead of misleading schematic.');
