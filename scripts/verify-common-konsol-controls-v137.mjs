import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {transform as session} from './patch-screen-session-v136.mjs';
import {transform} from './patch-common-konsol-controls-v137.mjs';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE_PATH||'playwright');
const source=fs.readFileSync(process.argv[2]||'.perf-production.html','utf8');
const encoded=source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);
const original=session(encoded?Buffer.from(encoded[2],'base64').toString():source),html=transform(original);
assert.equal(transform(html),html);
assert.equal(html.match(/<script\b[\s\S]*?<\/script>/g).join(''),original.match(/<script\b[\s\S]*?<\/script>/g).join(''),'all runtime/save handlers unchanged');
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[],writes=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',route=>{
  const r=route.request(),u=new URL(r.url());if(r.method()!=='GET')writes.push(u.pathname);
  if(u.pathname==='/')return route.fulfill({contentType:'text/html',body:html});
  if(u.pathname==='/api/bootstrap')return route.fulfill({json:{needsSetup:false}});
  if(u.pathname==='/api/me')return route.fulfill({json:{user:{id:1,full_name:'Test',role:'super',allowed_modules:['free','b2b','mekik2','mr','konsol','drive']}}});
  if(u.pathname.startsWith('/api/'))return route.fulfill({json:{rows:[],types:[],rackTypes:[],projects:[],settings:{},todos:[],users:[],notifications:[]}});
  return route.fulfill({contentType:'application/javascript',body:''});
 });
 await page.goto('https://rafex.test/');await page.waitForTimeout(2500);
 await page.locator('#nav [data-page="free"]').click();await page.waitForTimeout(700);
 await page.locator('#rafexAuthorityProjectName').fill('Konsol UI regression');
 await page.locator('#rafexNewProjectV133').click();await page.waitForTimeout(400);
 await page.locator('input[name="rafexUnifiedSystem"][value="konsol"]').evaluate(e=>e.click());await page.waitForTimeout(1800);
 for(const width of [1440,900,390]){
  await page.setViewportSize({width,height:1000});await page.waitForTimeout(400);
  assert.equal(await page.locator('#konsolBottomWorkspace').isVisible(),false);
  assert.equal(await page.locator('.konsol-section-card').isVisible(),false);
  assert(await page.locator('#m2ReportType').isVisible(),'shared PDF controls retained');
  const metrics=await page.locator('#rafexKonsolCommonSaveRack').evaluate(e=>{const b=e.getBoundingClientRect(),shell=document.querySelector('#page .konsol-shell').getBoundingClientRect();return {color:getComputedStyle(e).backgroundColor,expected:getComputedStyle(document.documentElement).getPropertyValue('--y').trim(),width:b.width,shellWidth:shell.width,top:b.top,shellBottom:shell.bottom,count:document.querySelectorAll('#rafexKonsolCommonSaveRack').length};});
  assert.equal(metrics.count,1);assert(Math.abs(metrics.width-metrics.shellWidth)<2);assert(metrics.top>=metrics.shellBottom);assert(metrics.top-metrics.shellBottom<35);
  assert.equal(metrics.color,'rgb(242, 197, 0)');console.log('COMMON',width,metrics);
 }
 await page.setViewportSize({width:1440,height:1000});
 await page.locator('#nav [data-page="konsol"]').click();await page.waitForTimeout(1800);
 assert(await page.locator('#konsolBottomWorkspace').isVisible(),'standalone workspace remains');
 assert(await page.locator('.konsol-section-card').isVisible(),'standalone section placement remains');
 await page.locator('#nav [data-page="free"]').click();await page.waitForTimeout(1800);
 assert.equal(await page.locator('#konsolBottomWorkspace').isVisible(),false);assert(await page.locator('#m2ReportType').isVisible());
 await page.locator('#rafexKonsolCommonSaveRack').scrollIntoViewIfNeeded();
 await page.screenshot({path:'.konsol-controls-v137.png'});
 assert.deepEqual(errors,[]);assert.deepEqual(writes,[]);
 console.log('PASS v137: common duplicates hidden, yellow full-width save, standalone preserved, no writes');
}finally{await browser.close();}
