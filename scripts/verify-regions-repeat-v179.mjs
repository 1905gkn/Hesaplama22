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
 assert.deepEqual(await page.locator('[data-region-ground-v180] rect').evaluate(n=>['x','y','width','height'].map(k=>Number(n.getAttribute(k)))),[700,0,500,400]);
 assert.deepEqual(await page.locator('[data-regions-v179] text').evaluate(n=>['x','y'].map(k=>Number(n.getAttribute(k)))),[950,200]);
 assert(await page.evaluate(()=>{const floor=document.querySelector('[data-region-ground-v180]'),rack=document.querySelector('#m2LayoutContent [data-rack]');return !!(floor.compareDocumentPosition(rack)&Node.DOCUMENT_POSITION_FOLLOWING);}));
 await page.evaluate(()=>m2SetLayoutTool('dimension'));
 await page.locator('#m2LayoutSvg').screenshot({path:'outputs/regions-v180-ground-label.png'});
 await page.locator('[data-regions-v179] text').scrollIntoViewIfNeeded();
 const labelBox=await page.locator('[data-regions-v179] text').boundingBox();
 await page.mouse.move(labelBox.x+labelBox.width/2,labelBox.y+labelBox.height/2);await page.mouse.down();await page.mouse.move(labelBox.x+labelBox.width/2+35,labelBox.y+labelBox.height/2+25,{steps:5});await page.mouse.up();
 assert(await page.evaluate(()=>{const g=rafexRegionGroupsV179().find(g=>g.name==='Depo <A>');return Math.abs(m2DimensionOffsets['region:'+g.id]?.x)>1&&Math.abs(m2DimensionOffsets['region:'+g.id]?.y)>1;}));
 await page.evaluate(()=>m2SetLayoutTool('dimension'));
 const summed=await page.evaluate(()=>{
  const map=new Map();for(const g of rafexRegionGroupsV179())for(const r of rafexRegionInventoryV179(g.racks,g.symbols)){const k=r.name+'|'+r.spec+'|'+r.unit;map.set(k,(map.get(k)||0)+r.qty);}return Object.fromEntries(map);
 });
 assert.deepEqual(summed,Object.fromEntries(totals.map(r=>[r.name+'|'+r.spec+'|'+r.unit,r.qty])));
 // The offline fixture stubs external dictionary assets; use its embedded dictionary for report tests.
 const dictionaryStart=html.indexOf('function m2ReportDictionary(language)');
 await page.evaluate(source=>{m2ReportDictionary=window.m2ReportDictionary=new Function('return ('+source+')')();},html.slice(dictionaryStart,html.indexOf('function m2CorporateUsedTypes()',dictionaryStart)).trim());
 const ordinary=await page.evaluate(()=>m2CorporateBomPages([],m2ReportDictionary('tr'),true).join(''));
 assert(!ordinary.includes('data-region-bom-v181'));
 await page.locator('#rafexReportRegionsV181').check();
 const separated=await page.evaluate(()=>m2CorporateBomPages([],m2ReportDictionary('tr'),true));
 assert.equal(separated.length,3);
 assert(separated[0].includes('Sevkiyat')&&separated[1].includes('Depo &lt;A&gt;')&&separated[2].includes('Ayrılmamış bölge'));
 const unassignedBefore=await page.evaluate(()=>{const r=m2LayoutState.racks.find(r=>!r.rafexRegionV179);const before={id:r.id,name:r.typeName,key:r.rafexCatalogKey};r.typeName='Z';r.rafexCatalogKey='b2b:Z';m2RenderLayoutProductList();return before;});
 const typedPages=await page.evaluate(()=>m2CorporateBomPages([],m2ReportDictionary('tr'),true));
 assert.equal(typedPages.length,4);
 assert(typedPages.some(p=>p.includes('Ayrılmamış bölge · Z')));
 assert((await page.locator('#m2LayoutProductList').textContent()).includes('Ayrılmamış bölge · Z'));
 await page.evaluate(before=>{const r=m2LayoutState.racks.find(r=>r.id===before.id);r.typeName=before.name;r.rafexCatalogKey=before.key;m2RenderLayoutProductList();},unassignedBefore);
 assert(await page.evaluate(()=>document.getElementById('m2ReportProductTotal').closest('label').nextElementSibling.contains(document.getElementById('rafexReportRegionsV181'))));
 await page.locator('.rafex-report-list-options-v181').screenshot({path:'outputs/regions-v181-options.png'});
 await page.locator('#rafexReportRegionsV181').uncheck();
 assert.equal(await page.evaluate(()=>m2CorporateBomPages([],m2ReportDictionary('tr'),true).join('')),ordinary);
 // Persistence through the same plain layout serialization used by saves/area switches.
 const regions=await page.evaluate(()=>JSON.stringify(m2LayoutState.racks.map(r=>r.rafexRegionV179)));
 await page.evaluate(()=>{m2LayoutState=JSON.parse(JSON.stringify(m2LayoutState));m2RenderLayout();});
 assert.equal(await page.evaluate(()=>JSON.stringify(m2LayoutState.racks.map(r=>r.rafexRegionV179))),regions);
 await page.evaluate(()=>m2SaveProject());
 assert(savedDocument,'Expected a mock project save: '+await page.locator('#m2ProjectSaveMsg').textContent());
 assert(savedDocument.payload.layout.racks.some(r=>r.rafexRegionV179?.name==='Sevkiyat'));
 assert.deepEqual(savedDocument.payload.layout.racks.find(r=>r.rafexRegionV179?.name==='Depo <A>').rafexRegionV179.box,{left:700,right:1200,top:0,bottom:400});
 assert(Object.keys(savedDocument.payload.layout.dimensionOffsets).some(k=>k.startsWith('region:')));
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
 console.log('PASS: repeat/cancel/inventory regression; exact selected ground rectangle below racks; centered label; dimension-tool drag; saved region bounds and label offsets.');
}finally{await browser.close();}
