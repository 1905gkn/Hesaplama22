import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)('playwright');
const build=path.resolve(process.argv[2]||'.tmp-v109/build/dist');
const source=fs.readFileSync(path.join(build,'server/index.js'),'utf8');
const html=Buffer.from(source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/)[2],'base64').toString();
const browser=await chromium.launch({channel:'msedge',headless:true});
const errors=[],requests=[];
try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  page.on('pageerror',error=>errors.push(error.message));
  await page.route('**/*',async route=>{
    const u=new URL(route.request().url());
    if(u.pathname==='/')return route.fulfill({contentType:'text/html',body:html});
    if(u.pathname==='/api/bootstrap')return route.fulfill({json:{needsSetup:false}});
    if(u.pathname==='/api/me')return route.fulfill({json:{user:{id:1,fullName:'Test',username:'test',role:'super',defaultLanguage:'tr'}}});
    if(u.pathname==='/api/projects'&&route.request().method()==='POST'){requests.push(route.request().postDataJSON());return route.fulfill({json:{ok:true,serialNo:123}});}
    if(u.pathname==='/api/projects')return route.fulfill({json:{projects:[]}});
    if(u.pathname.startsWith('/api/'))return route.fulfill({json:{rows:[],rackTypes:[],settings:{},projects:[]}});
    // Fixtures deliberately do not load 3D engines; these tests exercise the
    // production 2D renderer, persistence and PDF SVG, not GPU model loading.
    return route.fulfill({contentType:'application/javascript',body:''});
  });
  await page.goto('https://rafex.test/');await page.waitForTimeout(900);
  await page.evaluate(()=>{renderB2B();m2ActiveModule='b2b';drawMekik2();const drawing=b2bLayoutDrawing({...m2LastDrawing,b2b:b2bReadInputState()});m2AddRack(drawing,'A');window.fixtureV133=structuredClone(m2LayoutState.racks[0]);});
  const results=await page.evaluate(async()=>{
    if(!window.fixtureV133)throw Error('B2B fixture missing');
    const results=[];
    for(const count of [100,400,800]){
      m2LayoutState.racks=Array.from({length:count},(_,i)=>({...structuredClone(fixtureV133),id:1000+i,x:20+(i%25)*36,y:20+Math.floor(i/25)*18,w:28,h:12,angle:0,freePlacement:false,staged:false,sharedFootWith:null,joinGroup:null}));
      m2LayoutState.scale=.01;m2LayoutState.points=[{x:0,y:0},{x:1000,y:0},{x:1000,y:700},{x:0,y:700}];m2LayoutState.closed=true;m2LayoutState.selected=null;
      m2RenderLayout();await new Promise(resolve=>setTimeout(resolve,300));m2RenderLayout();
      const nodes=Array.from(document.querySelectorAll('#m2LayoutContent [data-rack]'));
      const commit=window.rafexCommitLayoutV133;
      const bench=()=>{const times=[];for(let i=0;i<3;i++){const t=performance.now();m2RenderLayout();times.push(performance.now()-t);}return times.sort((a,b)=>a-b)[1];};
      const retainedMs=bench();
      const retained=nodes.filter(node=>node.isConnected).length;
      window.rafexCommitLayoutV133=(layer,raw)=>{layer.innerHTML=raw;};
      const rebuildMs=bench();window.rafexCommitLayoutV133=commit;
      m2RenderLayout();m2RenderLayout();
      const stable=document.querySelector('[data-rack="1001"]'),changed=document.querySelector('[data-rack="1000"]');
      m2LayoutState.racks[0].b2b.showPallets=false;m2LayoutState.racks[0].b2bLayout.showPallets=false;
      m2LayoutState.racks[0].x+=1;m2RenderLayout();
      const untouchedRetained=stable===document.querySelector('[data-rack="1001"]');
      const changedReplaced=changed!==document.querySelector('[data-rack="1000"]');
      const svg=document.getElementById('m2LayoutSvg');
      const originals=svg.querySelectorAll('.m2-b2b-plan-upright:not(.rafex-profile-merge-source-v61)').length;
      const paths=svg.querySelectorAll('path.rafex-pdf-upright-overlay-v132').length;
      const segments=Array.from(svg.querySelectorAll('path.rafex-pdf-upright-overlay-v132')).reduce((n,p)=>n+(p.getAttribute('d').match(/M/g)||[]).length,0);
      const paint=svg.querySelector('path.rafex-pdf-upright-overlay-v132');
      results.push({count,retainedMs,rebuildMs,retained,untouchedRetained,changedReplaced,originals,paths,segments,stroke:paint&&getComputedStyle(paint).strokeWidth,dom:svg.querySelectorAll('*').length});
    }
    return results;
  });
  console.log(JSON.stringify({results,errors},null,2));
  for(const r of results){assert.equal(r.retained,r.count);assert(r.untouchedRetained&&r.changedReplaced);assert.equal(r.originals,r.segments);assert.equal(r.stroke,'3px');assert(r.paths<r.originals);}
  const flows=await page.evaluate(async()=>{
    m2LayoutState.racks=m2LayoutState.racks.slice(0,2);
    m2LayoutState.racks[1].sharedFootWith=m2LayoutState.racks[0].id;
    m2LayoutState.racks[1].sharedFootSide='left';
    m2LayoutState.racks.forEach(r=>r.joinGroup='fixture-group');
    m2LayoutState.selected=1000;m2RenderLayout();
    const originals=JSON.stringify(m2LayoutState.racks);
    m2PushUndo('Test');m2LayoutState.racks[0].x+=20;m2RenderLayout();m2UndoLastAction();
    const undo=JSON.stringify(m2LayoutState.racks)===originals;
    m2LayoutState.selected=1000;m2RotateRack();const rotated=m2LayoutState.racks.every(r=>r.angle===90);if(rotated)m2UndoLastAction();
    m2LayoutState.selected=1000;m2DuplicateRack();const duplicated=m2LayoutState.racks.length>2;if(duplicated)m2UndoLastAction();
    m2LayoutState.selected=1000;m2RenderLayout();
    const origins=m2LayoutState.racks.map(r=>({id:r.id,x:r.x,y:r.y}));
    const stableNode=document.querySelector('[data-rack="1000"]');
    m2LayoutState.drag={id:1000,originX:origins[0].x,originY:origins[0].y,groupMembers:origins};m2PushFastDragUndo(m2LayoutState.drag);
    m2ApplyGroupTranslation(origins,0,2);m2PerfRenderSingleRackDragFrame();
    const dragged=m2FinishRetainedDragV107(m2LayoutState.drag);
    const dragRetained=stableNode===document.querySelector('[data-rack="1000"]');
    m2UndoLastAction();const dragUndo=m2LayoutState.racks.every((r,i)=>r.x===origins[i].x&&r.y===origins[i].y);
    const source={projectName:'Bağımsız test',module:'ortak',payload:{version:1,module:'ortak',rafexCommonDrawing:true,drawing:structuredClone(m2LayoutState.racks[0]),rackTypes:[{id:21,name:'A',__rafexUnified:true,__rafexSystem:'b2b',drawing:structuredClone(fixtureV133),logId:'old-log'}],layout:{...structuredClone(m2LayoutState),symbols:[]}}};
    const before=JSON.stringify(source),copy=rafexIndependentProjectV133(source,crypto.randomUUID(),Date.now());
    m2PushUndo('Old project');rafexOpenIndependentV133(copy);
    const fresh=m2LayoutState.racks;
    const links=fresh.length===2&&fresh[1].sharedFootWith===fresh[0].id&&fresh[0].id!==1000;
    const undoEmpty=m2UndoHistory.length===0;
    const ownedTypes=m2SavedRackTypes[0]?.logId===copy.payload.rackTypes[0].logId&&window.rafexProjectIdentityV133?.uuid===copy.payload.projectIdentity.uuid;
    const sourceIntact=JSON.stringify(source)===before;
    // Reopen through the normal loader and ensure IDs and dimensions survive.
    m2ApplyProjectRecord({project_name:copy.projectName,module:'ortak',payload:copy.payload},false);
    const reopen=m2LayoutState.racks.every((r,i)=>r.id===copy.payload.layout.racks[i].id&&r.widthMm===copy.payload.layout.racks[i].widthMm);
    document.getElementById('m2CreateOutputButton').click();
    await new Promise(resolve=>setTimeout(resolve,3800));
    const pdf=document.querySelector('#m2CorporatePreview .m2-corporate-floor svg');
    const pdfPaths=pdf?pdf.querySelectorAll('path.rafex-pdf-upright-overlay-v132').length:0;
    return {undo,rotated,duplicated,dragged,dragRetained,dragUndo,links,undoEmpty,ownedTypes,sourceIntact,reopen,pdfPaths,button:!!document.getElementById('rafexIndependentSaveV133')};
  });
  console.log(JSON.stringify({flows,errors},null,2));
  for(const key of ['undo','rotated','duplicated','dragged','dragRetained','dragUndo','links','undoEmpty','ownedTypes','sourceIntact','reopen','button'])assert(flows[key],key);
  assert(flows.pdfPaths>0,'PDF must retain upright overlay paths');
  assert.equal(errors.length,0,errors.join('\n'));
  console.log('PASS: retained render at 100/400/800 racks; snapshot reopen, joins, undo, PDF paths and source isolation');
}finally{await browser.close();}
