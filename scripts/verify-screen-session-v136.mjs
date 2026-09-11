import fs from 'node:fs';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import {transform} from './patch-screen-session-v136.mjs';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE_PATH||'playwright');
const source=fs.readFileSync(process.argv[2]||'.perf-production.html','utf8');
const m=source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);
const html=transform(m?Buffer.from(m[2],'base64').toString():source);
assert.equal(transform(html),html);
for(const script of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g))if(!/\bsrc=|type=["'](?:module|application\/)/.test(script[1]))new vm.Script(script[2]);
const browser=await chromium.launch({channel:'msedge',headless:true});
const errors=[],writes=[];
try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  async function choose(id,value){const input=page.locator('#'+id),index=await input.evaluate((e,v)=>Array.from(e.options).findIndex(o=>o.value===v),value);await input.focus();await input.press('Home');for(let i=0;i<index;i++)await input.press('ArrowDown');await input.press('Enter');}
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error')console.log('CONSOLE',m.text().slice(0,250));});
  await page.route('**/*',route=>{
    const r=route.request(),u=new URL(r.url());
    if(r.method()!=='GET')writes.push(u.pathname);
    if(u.pathname==='/')return route.fulfill({contentType:'text/html',body:html});
    if(u.pathname==='/api/bootstrap')return route.fulfill({json:{needsSetup:false}});
    if(u.pathname==='/api/me')return route.fulfill({json:{user:{id:1,full_name:'Test',username:'test',role:'super',default_language:'tr',allowed_modules:['free','b2b','mekik2','mr','konsol','drive']}}});
    if(u.pathname.startsWith('/api/'))return route.fulfill({json:{rows:[],types:[],rackTypes:[],settings:{},projects:[],todos:[],users:[],notifications:[]}});
    return route.fulfill({contentType:'application/javascript',body:''});
  });
  await page.goto('https://rafex.test/');
  await page.waitForTimeout(3500);
  await page.locator('#nav [data-page="free"]').click();
  await page.waitForTimeout(700);
  console.log('ENTER',await page.locator('#page').innerText().then(s=>s.slice(0,350)),errors);
  await page.locator('#rafexAuthorityProjectName').fill('Local regression');
  await page.locator('#rafexNewProjectV133').first().click();
  await page.waitForTimeout(400);
  const fixture=await page.evaluate(()=>{
    drawMekik2();const drawing=b2bLayoutDrawing({...m2LastDrawing,b2b:b2bReadInputState()});
    m2LayoutState.points=[{x:0,y:0},{x:4000,y:0},{x:4000,y:4000},{x:0,y:4000}];m2LayoutState.scale=.04;m2LayoutState.closed=true;
    m2AddRack(drawing,'A');m2LayoutState.racks[0].staged=false;m2LayoutState.racks[0].freePlacement=false;
    const r=m2LayoutState.racks[0];m2LayoutSymbols=[{id:99001,type:'uakz',rackId:r.id,localX:0,localY:0,x:r.x,y:r.y,w:14.4,h:14.4,widthMm:360,depthMm:360,blocking:false}];
    m2ReportImages=['data:image/png;base64,AA==',null,null,null];m2RenderLayout();
    return {uuid:window.rafexProjectIdentityV133.uuid,racks:JSON.stringify(m2LayoutState.racks),symbols:JSON.stringify(m2LayoutSymbols)};
  });
  await choose('m2ReportType','summary');
  await choose('m2ReportLanguage','en');
  await page.locator('#m2ReportCompleteFront').check();
  for(const system of ['mekik2','mr','konsol','b2b']){
    await page.locator('input[name="rafexUnifiedSystem"][value="'+system+'"]').evaluate(e=>e.click());
    await page.waitForTimeout(1400);
    const result=await page.evaluate(()=>({uuid:window.rafexProjectIdentityV133?.uuid,editable:window.rafexCanEditProjectV134(),racks:JSON.stringify(m2LayoutState.racks),symbols:JSON.stringify(m2LayoutSymbols),type:document.getElementById('m2ReportType')?.value,lang:document.getElementById('m2ReportLanguage')?.value,three:document.getElementById('m2ReportCompleteFront')?.checked,button:document.querySelectorAll('#m2CreateOutputButton').length,newButtons:document.querySelectorAll('#rafexNewProjectV133').length,photo:m2ReportImages[0]}));
    console.log('COMMON',system,{...result,racks:result.racks.length,symbols:result.symbols.length});
    assert.equal(result.uuid,fixture.uuid);assert(result.editable);assert.equal(result.racks,fixture.racks);assert.equal(result.symbols,fixture.symbols);
    assert.equal(result.type,'summary');assert.equal(result.lang,'en');assert.equal(result.three,true);assert.equal(result.button,1);assert.equal(result.newButtons,1);assert(result.photo);
  }
  for(const [route,label] of [['b2b','B2B'],['mekik2','MEKİK'],['konsol','KONSOL KOLLU'],['mr','MR']]){
    await page.locator('#nav [data-page="'+route+'"]').click();await page.waitForTimeout(900);
    assert.equal(await page.locator('#page .hero h2,#page .mr-hero h2').first().innerText(),label);
    assert.equal(await page.evaluate(()=>window.rafexProjectIdentityV133?.uuid||null),null,'common identity must not contaminate standalone');
    await page.locator('#nav [data-page="free"]').click();await page.waitForTimeout(900);
    const result=await page.evaluate(()=>({uuid:window.rafexProjectIdentityV133?.uuid,editable:window.rafexCanEditProjectV134(),racks:JSON.stringify(m2LayoutState.racks),symbols:JSON.stringify(m2LayoutSymbols)}));
    console.log('RETURN',route,result.uuid,result.editable,await page.locator('#m2ReportType').inputValue());
    console.log('SETTINGS',JSON.stringify(await page.evaluate(()=>window.rafexScreenStateV136())));
    assert.equal(await page.locator('#m2ReportType').inputValue(),'summary','settings after standalone '+route);
    assert.equal(result.uuid,fixture.uuid);assert(result.editable);assert.equal(result.racks,fixture.racks);assert.equal(result.symbols,fixture.symbols);
  }
  await page.locator('#m2CreateOutputButton').click();await page.waitForTimeout(4500);
  console.log('OUTPUT',await page.locator('#m2FloorStatus').innerText());
  assert.equal(await page.locator('#m2ReportType').inputValue(),'summary');
  assert(await page.locator('#m2A4Sheet').isVisible());
  await page.waitForTimeout(13000);assert(await page.locator('#m2A4Sheet').isVisible(),'preview survives old 12s gate timeout');
  await page.screenshot({path:'.screen-v136-summary.png',fullPage:false});
  await choose('m2ReportType','corporate');
  await page.locator('#m2CreateOutputButton').click();await page.waitForTimeout(4500);
  assert(await page.locator('#m2CorporatePreview').isVisible());
  assert.equal(writes.length,0,'audit must never send writes');
  console.log('PASS v136: scoped sessions, geometry preserved, settings retained, preview visible, writes=0',errors);
}finally{await browser.close();}
