import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),{chromium}=require('playwright');
const source=fs.readFileSync('.tmp-cold-store-before.html','utf8');
const attrs=['data-rafex-common-system-isolation','data-rafex-uniform-system-banner','data-rafex-runtime-authority','data-rafex-uniform-color-controls'];
const scripts=attrs.map(attr=>{const match=source.match(new RegExp('<script '+attr+'="[^"]+">[\\s\\S]*?<\\/script>'));assert(match,attr);return match[0];}).join('\n');
const fixture=`<!doctype html><html><body><nav id="nav"><button class="active" data-page="free">Ortak Çizim</button></nav><h1 id="pageTitle">Ortak Çizim</h1><div id="page" class="rafex-common-independent rafex-free-drawing-page" data-rafex-free-context-system="mr" data-rafex-common-active="1" data-rafex-free-drawing="1"><section class="hero" data-rafex-system-banner="common"><h2 data-rafex-system-banner-title>ORTAK ÇİZİM</h2></section><section id="rafexUnifiedSystemPicker"><input type="radio" name="rafexUnifiedSystem" value="mr" checked><input type="radio" name="rafexUnifiedSystem" value="mekik2"></section><label>Proje adı<input id="mrProjectName" value="Cold Store test"></label><select id="mrUprightFinish"><option>RAL 5010 · Mavi</option><option>PGV · Galvaniz</option></select><select id="mrTraverseFinish"><option>RAL 1007 · Sarı</option></select></div>${scripts}</body></html>`;
const scratch=fs.mkdtempSync(path.join(os.tmpdir(),'rafex-idle-'));
fs.mkdirSync(path.join(scratch,'dist/server'),{recursive:true});
const file=path.join(scratch,'dist/server/index.js');
fs.writeFileSync(file,`const HTML_BASE64='${Buffer.from(fixture).toString('base64')}';`);
for(const name of ['patch-common-system-isolation-v1.mjs','patch-uniform-color-controls-v1.mjs'])execFileSync(process.execPath,[path.resolve('scripts',name)],{cwd:scratch});
const after=Buffer.from(fs.readFileSync(file,'utf8').match(/HTML_BASE64='([^']+)'/)[1],'base64').toString();
const browser=await chromium.launch({headless:true,channel:process.env.RAFEX_TEST_BROWSER_CHANNEL||'msedge'});
try{
  const results=[];
  for(const [name,html] of [['before',fixture],['after',after]]){
    const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.setContent(html);await page.waitForTimeout(1100);
    await page.evaluate(()=>{window.changes=0;new MutationObserver(records=>window.changes+=records.length).observe(document.body,{childList:true,subtree:true,attributes:true});});
    await page.waitForTimeout(400);const changes=await page.evaluate(()=>window.changes);
    results.push({name,idleMutations400ms:changes});
    if(name==='before')assert(changes>10,'Regression must reproduce old self-triggering loop');
    else{
      assert.equal(changes,0,'Updated page must settle');
      assert.equal(await page.locator('#mrUprightFinish option').first().textContent(),'RAL 5010');
      await page.locator('#rafexAuthorityProjectName').fill('Sabit Proje');
      await page.locator('input[value="mekik2"]').check();await page.waitForTimeout(100);
      await page.evaluate(()=>document.getElementById('page').dataset.rafexFreeContextSystem='mr');
      await page.waitForTimeout(100);
      assert.equal(await page.locator('#page').getAttribute('data-rafex-common-system'),'mekik2');
      assert.equal(await page.locator('#page').getAttribute('data-rafex-authority-system'),'mekik2');
      assert.equal(await page.locator('#rafexAuthorityProjectName').inputValue(),'Sabit Proje');
      await page.evaluate(()=>window.changes=0);await page.waitForTimeout(400);
      assert.equal(await page.evaluate(()=>window.changes),0,'System switch must settle');
    }
    assert.deepEqual(errors,[]);await page.close();
  }
  console.log(JSON.stringify({pass:true,results,checks:'Old MR loop reproduced; fixed idle and system switching settle; selected system wins over rack context; project name preserved'},null,2));
}finally{await browser.close();}
