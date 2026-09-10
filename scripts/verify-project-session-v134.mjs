import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)('playwright');
const source=fs.readFileSync(path.resolve('.tmp-v109/build/dist/server/index.js'),'utf8');
const html=Buffer.from(source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/)[2],'base64').toString();
const browser=await chromium.launch({channel:'msedge',headless:true});
const errors=[],posts=[];let records=[];
try{
  const context=await browser.newContext({viewport:{width:1440,height:1000}});
  await context.route('**/*',async route=>{
    const u=new URL(route.request().url());
    if(u.pathname==='/')return route.fulfill({contentType:'text/html',body:html});
    if(u.pathname==='/api/bootstrap')return route.fulfill({json:{needsSetup:false}});
    if(u.pathname==='/api/me')return route.fulfill({json:{user:{id:1,fullName:'Test',username:'test',role:'super',defaultLanguage:'tr',allowed_modules:['free','b2b','mr','drive','mekik2','konsol']}}});
    if(u.pathname==='/api/projects'&&route.request().method()==='POST'){
      const body=route.request().postDataJSON();posts.push(body);
      records=[{id:789,serial_no:123,project_name:body.projectName,module:body.module,payload:body.payload,username:'test',created_at:new Date().toISOString()}];
      return route.fulfill({json:{ok:true,serialNo:123}});
    }
    if(u.pathname==='/api/projects')return route.fulfill({json:{projects:records}});
    if(u.pathname.startsWith('/api/'))return route.fulfill({json:{rows:[],types:[],rackTypes:[],settings:{},projects:[]}});
    return route.fulfill({contentType:'application/javascript',body:''});
  });
  async function openCommon(page){
    page.on('pageerror',error=>errors.push(error.message));
    await page.goto('https://rafex.test/');await page.waitForTimeout(1300);
    // This isolated 2D/persistence harness stubs GPU bundles. Hide their
    // never-completing loading overlay; the real live UI is checked separately.
    await page.addStyleTag({content:'html body #app #page #b2b3DLoading{display:none!important;pointer-events:none!important}'});
    await page.locator('#nav button[data-page="free"]').click();
    try{await page.waitForSelector('#rafexProjectNumberV134',{timeout:10000});}catch(error){console.log(JSON.stringify({errors,ui:await page.evaluate(()=>({active:document.querySelector('#nav button.active')?.outerHTML,name:!!document.getElementById('rafexAuthorityProjectName'),button:!!document.getElementById('rafexNewProjectV133'),text:document.getElementById('page')?.textContent.slice(0,600)}))}));throw error;}await page.waitForTimeout(1300);
  }
  const page=await context.newPage();await openCommon(page);
  async function state(){return page.evaluate(()=>({
    unlocked:rafexCanEditProjectV134(),uuid:window.rafexProjectIdentityV133?.uuid,number:document.querySelector('#rafexProjectNumberV134 span')?.textContent,
    fieldLocked:!!document.querySelector('#m2AreaW')?.closest('[inert]'),historyLocked:!!document.querySelector('#m2ProjectList')?.closest('[inert]'),
    name:document.querySelector('#rafexAuthorityProjectName')?.value,racks:m2LayoutState.racks.length
  }));}
  assert.deepEqual((({unlocked,fieldLocked,historyLocked,number})=>({unlocked,fieldLocked,historyLocked,number}))(await state()),{unlocked:false,fieldLocked:true,historyLocked:false,number:'—'});
  await page.locator('#rafexNewProjectV133').click();
  assert.equal((await state()).unlocked,false);assert.equal(posts.length,0);
  await page.evaluate(()=>m2SaveProject());assert.equal(posts.length,0,'Save is guarded even before DOM gating settles');
  await page.locator('body').press('Control+s');assert.equal(await page.evaluate(()=>m2MultiSelect.active),false,'Selection shortcut is blocked before a project opens');
  await page.locator('#rafexAuthorityProjectName').fill('Session test');
  await page.locator('#rafexNewProjectV133').click();await page.waitForTimeout(100);
  const opened=await state();assert(opened.unlocked&&!opened.fieldLocked);assert.equal(opened.name,'Session test');assert.equal(opened.racks,0);assert.match(opened.number,/^P-/);assert.equal(posts.length,0,'Starting a draft does not create a server record');
  await page.locator('input[name="rafexUnifiedSystem"][value="b2b"]').check({force:true});await page.waitForTimeout(500);
  assert.equal((await state()).uuid,opened.uuid,'System changes preserve project identity');assert((await state()).unlocked);
  await page.getByRole('button',{name:'Alanı Belirle',exact:true}).click();
  await page.evaluate(()=>{const drawing=b2bLayoutDrawing({...m2LastDrawing,b2b:b2bReadInputState()});m2AddRack(drawing,'A');});
  await page.getByRole('button',{name:'Projeyi Kaydet',exact:true}).click();
  await page.waitForTimeout(400);assert.equal(posts.length,1);assert.equal(posts[0].payload.projectIdentity.uuid,opened.uuid);assert.equal(posts[0].payload.projectIdentity.displayNumber,opened.number);
  await page.locator('#nav button[data-page="free"]').click();await page.waitForTimeout(700);
  assert.equal((await state()).unlocked,false,'Returning after save requires opening a project');
  await page.getByRole('button',{name:'#123 · Session test',exact:true}).click();await page.waitForTimeout(200);
  const restored=await state();assert(restored.unlocked&&!restored.fieldLocked);assert.equal(restored.uuid,opened.uuid);assert.equal(restored.number,opened.number);assert.equal(restored.racks,1);
  await page.getByRole('button',{name:'Proje Geçmişi',exact:true}).click();
  await page.locator('#historyModal .history-summary').first().click();
  await page.locator('#historyModal').getByRole('button',{name:'Projeyi Aç',exact:true}).click();await page.waitForTimeout(300);
  assert.equal((await state()).uuid,opened.uuid,'Global Project History opens the same project, not a copy');assert.equal((await state()).racks,1);assert((await state()).unlocked);
  const second=await context.newPage();await openCommon(second);
  await second.locator('#rafexAuthorityProjectName').fill('Session test');await second.locator('#rafexNewProjectV133').click();
  const secondUuid=await second.evaluate(()=>window.rafexProjectIdentityV133.uuid);assert.notEqual(secondUuid,opened.uuid,'Two tabs must allocate different project identities');assert.equal((await state()).uuid,opened.uuid);
  assert.equal(errors.length,0,errors.join('\n'));
  console.log('PASS v134: locked inputs, required name, zero-write draft, stable identity across systems, normal save/reopen and separate concurrent tabs');
}finally{await browser.close();}
