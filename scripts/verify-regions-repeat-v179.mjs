import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {transform} from './patch-regions-repeat-v179.mjs';
const html=transform(fs.readFileSync(process.argv[2]||'outputs/live-after-v170.html','utf8'));
fs.writeFileSync('outputs/regions-v179-test.html',html);
assert.equal(transform(html),html);
for(const m of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g))if(m[1].trim())new vm.Script(m[1]);
const {chromium}=createRequire(import.meta.url)(process.env.RAFEX_PLAYWRIGHT_PATH||'playwright');
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 const page=await browser.newPage({viewport:{width:1698,height:1114}});
 page.setDefaultTimeout(10000);
 const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
 let savedDocument=null;
 await page.route('**/*',r=>{
  const p=new URL(r.request().url()).pathname;
  if(p==='/')return r.fulfill({contentType:'text/html',body:html});
  if(p==='/api/bootstrap')return r.fulfill({json:{needsSetup:false}});
  if(p==='/api/me')return r.fulfill({json:{user:{id:1,fullName:'Test',username:'test',role:'super',allowed_modules:['free','b2b']}}});
  if(p.startsWith('/api/drawing-projects')&&['POST','PUT','PATCH'].includes(r.request().method()))return r.fulfill({json:{project:{...r.request().postDataJSON(),id:1,revision:0,rackTypes:[]}}});
  if(p==='/api/projects'&&r.request().method()==='POST'){savedDocument=r.request().postDataJSON();return r.fulfill({json:{project:{id:42,...savedDocument}}});}
  if(p.startsWith('/api/'))return r.fulfill({json:{rows:[],types:[],projects:[],settings:{}}});
  return r.fulfill({contentType:'application/javascript',body:''});
 });
 await page.goto('https://rafex-configurator.vercel.app');await page.locator('#nav button[data-page="free"]').click();
 await page.locator('#rafexAuthorityProjectName').fill('Regions test');await page.locator('#rafexNewProjectV133').click();
 await page.waitForFunction(()=>!window.rafexProjectSavingV133&&document.querySelector('#rafexProjectNumberV134 span')?.textContent==='1');
 await page.locator('#rafexOpenLayoutScreen').click();
 await page.waitForFunction(()=>document.getElementById('page').dataset.rafexWorkflowScreen==='layout');
 await page.evaluate(()=>{
  m2LayoutState.points=[{x:0,y:0},{x:5000,y:0},{x:5000,y:1200},{x:0,y:1200}];m2LayoutState.closed=true;
  const d=m2B2BRecordV108(b2bLayoutDrawing({...m2LastDrawing,b2b:b2bReadInputState()}));m2AddRack(d,'A');
  const r=m2LayoutState.racks[0];r.x=200;r.y=200;r.freePlacement=false;r.staged=false;r.locked=true;m2LayoutState.selected=r.id;m2RenderLayout();
 });
 await page.locator('#rafexRepeatCountV179').waitFor({state:'attached'});
 await page.locator('#rafexRepeatCountV179').fill('20');
 assert(await page.evaluate(()=>rafexRegionsV179.repeat()),await page.locator('#m2FloorStatus').textContent());
 assert.equal(await page.evaluate(()=>m2LayoutState.racks.length),21);
 const before=await page.evaluate(()=>JSON.stringify(m2LayoutState.racks));
 await page.locator('#rafexRepeatCountV179').fill('1000');
 assert.equal(await page.evaluate(()=>rafexRegionsV179.repeat()),false);
 assert.equal(await page.evaluate(()=>JSON.stringify(m2LayoutState.racks)),before);
 const totals=await page.evaluate(()=>rafexLayoutInventoryRowsV44());
 // Cancel never changes stored rack data.
 await page.evaluate(()=>rafexRegionsV179.choose({left:0,right:650,top:0,bottom:400}));
 await page.locator('#rafexRegionDialogV179 [data-cancel]').click();
 assert.equal(await page.evaluate(()=>JSON.stringify(m2LayoutState.racks)),before);
 // List-only region has no paint and includes exactly the selected centers.
 await page.evaluate(()=>rafexRegionsV179.choose({left:0,right:650,top:0,bottom:400}));
 await page.locator('#rafexRegionDialogV179 [data-edit]').click();
 await page.locator('#rafexRegionDialogV179 [data-name]').fill('Sevkiyat');
 await page.locator('#rafexRegionDialogV179 [data-list]').click();
 assert(await page.locator('#m2LayoutProductList').textContent().then(t=>t.includes('Sevkiyat')));
 assert.equal(await page.locator('[data-regions-v179] rect').count(),0);
 // Colored region and escaped name.
 await page.evaluate(()=>rafexRegionsV179.choose({left:700,right:1200,top:0,bottom:400}));
 await page.locator('#rafexRegionDialogV179 [data-edit]').click();
 await page.locator('#rafexRegionDialogV179 [data-name]').fill('Depo <A>');
 await page.locator('#rafexRegionDialogV179 [data-color]').fill('#3366cc');
 await page.locator('#rafexRegionDialogV179 [data-paint]').click();
 assert.equal(await page.locator('[data-regions-v179] text').textContent(),'Depo <A>');
 const summed=await page.evaluate(()=>{
  const map=new Map();for(const g of rafexRegionGroupsV179())for(const r of rafexRegionInventoryV179(g.racks,g.symbols)){const k=r.name+'|'+r.spec+'|'+r.unit;map.set(k,(map.get(k)||0)+r.qty);}return Object.fromEntries(map);
 });
 assert.deepEqual(summed,Object.fromEntries(totals.map(r=>[r.name+'|'+r.spec+'|'+r.unit,r.qty])));
 // Persistence through the same plain layout serialization used by saves/area switches.
 const regions=await page.evaluate(()=>JSON.stringify(m2LayoutState.racks.map(r=>r.rafexRegionV179)));
 await page.evaluate(()=>{m2LayoutState=JSON.parse(JSON.stringify(m2LayoutState));m2RenderLayout();});
 assert.equal(await page.evaluate(()=>JSON.stringify(m2LayoutState.racks.map(r=>r.rafexRegionV179))),regions);
 await page.evaluate(()=>m2SaveProject());
 assert(savedDocument,'Expected a mock project save: '+await page.locator('#m2ProjectSaveMsg').textContent());
 assert(savedDocument.payload.layout.racks.some(r=>r.rafexRegionV179?.name==='Sevkiyat'));
 assert.equal(await page.locator('[data-regions-v179] text').textContent(),'Depo <A>');
 // Pointer selection follows SVG coordinates after zoom/scroll, without moving racks.
 await page.locator('#rafexRegionV179').click();
 await page.locator('#m2LayoutSvg').scrollIntoViewIfNeeded();
 const positions=await page.locator('#m2LayoutSvg').evaluate(svg=>[ {x:190,y:190},{x:600,y:300} ].map(v=>{const p=svg.createSVGPoint();p.x=v.x;p.y=v.y;const q=p.matrixTransform(svg.getScreenCTM());return {x:q.x,y:q.y};}));
 await page.mouse.move(positions[0].x,positions[0].y);await page.mouse.down();await page.mouse.move(positions[1].x,positions[1].y,{steps:4});await page.mouse.up();
 await page.locator('#rafexRegionDialogV179').waitFor({state:'visible'});
 await page.locator('#rafexRegionDialogV179 [data-cancel]').click();
 assert.equal(await page.evaluate(()=>JSON.stringify(m2LayoutState.racks.map(r=>r.rafexRegionV179))),regions);
 await page.locator('#m2LayoutProductList').screenshot({path:'outputs/regions-v179-products.png'});
 await page.locator('#m2AutoFillControls').screenshot({path:'outputs/regions-v179-repeat.png'});
 // One undo removes only the most recent colored region, not the list-only one.
 await page.evaluate(()=>m2UndoLastAction());
 assert.equal(await page.locator('[data-regions-v179] rect').count(),0);
 assert(await page.evaluate(()=>m2LayoutState.racks.some(r=>r.rafexRegionV179?.name==='Sevkiyat')));
 await page.evaluate(()=>{
  const r=structuredClone(m2LayoutState.racks[0]);r.x=300;r.y=300;r.angle=90;r.joinGroup=null;r.sharedFootWith=null;delete r.rafexRegionV179;
  m2LayoutState.racks=[r];m2LayoutState.selected=r.id;m2LayoutSymbols=[{id:999,rackId:r.id,type:'uaks',x:r.x-10,y:r.y-10,w:4,h:4,angle:90}];m2RenderLayout();
  document.getElementById('rafexRepeatCountV179').value='2';
 });
 assert(await page.evaluate(()=>rafexRegionsV179.repeat()));
 assert(await page.evaluate(()=>m2LayoutState.racks.length===3&&Math.abs(m2LayoutState.racks[0].x-m2LayoutState.racks[2].x)<.01&&m2LayoutSymbols.length===3&&m2LayoutState.racks[0].b2b!==m2LayoutState.racks[1].b2b));
 assert.deepEqual(errors,[]);
 console.log('PASS: exactly 20 additional blocks; atomic capacity rejection; cancel unchanged; list-only and painted regions; additive inventory totals; serialized region persistence.');
}finally{await browser.close();}
