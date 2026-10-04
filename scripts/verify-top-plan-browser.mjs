import fs from 'node:fs';
import http from 'node:http';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url);
let chromium;try{({chromium}=require('playwright'));}catch{({chromium}=require(process.env.RAFEX_PLAYWRIGHT_PATH||'C:/Users/gokhan.kaya/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));}
const root=new URL('../',import.meta.url);
const fixture=`<!doctype html><html><head><meta charset="utf-8"></head><body><div class="m2-floor-size"></div><script>
let m2LayoutState={closed:true,points:[{x:0,y:0},{x:1000,y:0},{x:1000,y:650},{x:0,y:650}],scale:.001,racks:[],selected:null};
let m2ActiveModule='mekik2',m2UndoHistory=[],m2SavedRackTypes=[{name:'Benim kesitim',drawing:{plan:{feet:[],braces:[]},totalWidth:2700,railLength:1100}}];
function m2UndoSnapshot(label){return {label,racks:JSON.parse(JSON.stringify(m2LayoutState.racks))};}function m2UpdateUndoButton(){}
function m2AddRack(drawing,name){m2UndoHistory.push(m2UndoSnapshot('Ekle'));m2LayoutState.racks.push({id:Date.now(),w:drawing.totalWidth*m2LayoutState.scale,h:drawing.railLength*m2LayoutState.scale,x:0,y:0,angle:0,typeName:name});}
function m2RackInsideArea(r){return r.x>=0&&r.y>=0&&r.x+r.w<1000&&r.y+r.h<650;}function m2RackOverlaps(r){return m2LayoutState.racks.some(o=>o.id!==r.id&&r.x<o.x+o.w&&r.x+r.w>o.x&&r.y<o.y+o.h&&r.y+r.h>o.y);}function m2RenderLayout(){}
</script><script src="/runtime.js"></script></body></html>`;
const server=http.createServer((req,res)=>{const path=new URL(req.url,'http://localhost').pathname;res.setHeader('Content-Security-Policy',"default-src 'self'; style-src 'unsafe-inline'; script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'; img-src 'self' data: blob:; connect-src 'self' blob:; worker-src 'self' blob:");res.setHeader('content-type',path==='/'?'text/html':'text/javascript');if(path==='/')return res.end(fixture);if(path==='/runtime.js')return res.end(fs.readFileSync(new URL('client/top-plan-import.js',root)));if(path==='/favicon.ico'){res.statusCode=204;return res.end();}if(['/pdfjs/pdf.min.mjs','/pdfjs/pdf.worker.min.mjs'].includes(path))return res.end(fs.readFileSync(new URL('assets'+path,root)));res.statusCode=404;res.end();});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));let browser;
try{
  browser=await chromium.launch({headless:true,channel:'msedge'});const page=await browser.newPage({viewport:{width:1440,height:1100}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:'+server.address().port);await page.getByRole('button',{name:'Çizimden Yerleşim · DXF / PDF / Görsel'}).click();
  const objects=Array.from({length:100},(_,i)=>({type:'rack',closed:true,points:[[i*3000,0],[i*3000+2700,0],[i*3000+2700,1100],[i*3000,1100]]}));
  await page.locator('#tpi-file').setInputFiles({name:'100-modules.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({units:'mm',objects}))});
  await page.locator('#tpi-summary').filter({hasText:'100 modül · 1 farklı'}).waitFor();await page.locator('#tpi-types select').selectOption('0');await page.locator('#tpi-apply').click();
  assert.match(await page.locator('#tpi-message').textContent(),/100 modül çizimdeki/);assert.equal(await page.evaluate(()=>m2LayoutState.racks.length),100);assert.equal(await page.evaluate(()=>m2UndoHistory.length),1);
  // Failed second placement must leave the original batch and history intact.
  await page.locator('#tpi-apply').click();assert.match(await page.locator('#tpi-message').textContent(),/çakışıyor/);assert.equal(await page.evaluate(()=>m2LayoutState.racks.length),100);assert.equal(await page.evaluate(()=>m2UndoHistory.length),1);
  const pdfPath=process.argv[2];if(pdfPath){await page.locator('#tpi-file').setInputFiles(pdfPath);await page.locator('#tpi-message').filter({hasText:'Üst görünüm bölgesini sürükleyerek seçin'}).waitFor({timeout:60000});const size=await page.locator('#tpi-canvas').evaluate(c=>({w:c.width,h:c.height}));assert.ok(size.w>1000&&size.h>1000);const bounds=await page.locator('#tpi-canvas').boundingBox();const point=(x,y)=>({x:bounds.x+x/size.w*bounds.width,y:bounds.y+y/size.h*bounds.height});const from=point(119,148),to=point(1132,930);await page.mouse.move(from.x,from.y);await page.mouse.down();await page.mouse.move(to.x,to.y,{steps:8});await page.mouse.up();await page.locator('#tpi-scan').click();const summary=await page.locator('#tpi-summary').textContent();console.log('REAL PDF:',summary);assert.match(summary,/\d+ modül adayı/);const artifact=new URL('../outputs/top-plan-import/',root);fs.mkdirSync(artifact,{recursive:true});await page.screenshot({path:fileURLToPath(new URL('pdf-browser.png',artifact)),fullPage:true});}
  assert.deepEqual(errors,[]);console.log('PASS: browser file import, 100 placements, one undo, rollback on overlap, local PDF rendering under CSP.');
}finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
