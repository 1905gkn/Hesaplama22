import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';

const root = process.cwd();
const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'rafex-authority-check-'));
const retired = [
  ['data-rafex-common-project-name', 'v87'],
  ['data-rafex-common-project-name-scope', 'v88'],
  ['data-rafex-common-no-project-name', 'v91'],
];
const fixture = `<!doctype html><html><body><div id="nav"><button class="active" data-page="free">Ortak</button></div><div id="page" class="rafex-common-independent"><section data-rafex-system-banner="common"></section><div id="rafexUnifiedSystemPicker"><input type="radio" name="rafexUnifiedSystem" value="b2b" checked></div><label>Proje adı<input id="b2bProjectName" value="Başlangıç"></label></div>${retired.map(([attr, version])=>`<script ${attr}="${version}">throw new Error('Retired controller executed')</script>`).join('')}</body></html>`;
fs.mkdirSync(path.join(scratch, 'dist/server'), { recursive: true });
const workerFile = path.join(scratch, 'dist/server/index.js');
fs.writeFileSync(workerFile, `const HTML_BASE64 = '${Buffer.from(fixture).toString('base64')}';`);
execFileSync(process.execPath, [path.join(root, 'scripts/patch-runtime-authority-v2.mjs')], { cwd: scratch });
const output = fs.readFileSync(workerFile, 'utf8');
execFileSync(process.execPath, [path.join(root, 'scripts/patch-runtime-authority-v2.mjs')], { cwd: scratch });
assert.equal(fs.readFileSync(workerFile, 'utf8'), output, 'Build patch must be idempotent');
const html = Buffer.from(output.match(/HTML_BASE64 = '([^']+)'/)[1], 'base64').toString();
for (const [attr, version] of retired) assert(!html.includes(`<script ${attr}="${version}">`));
const runtime = html.match(/<script data-rafex-runtime-authority="v2">([\s\S]*?)<\/script>/)[1];
new vm.Script(runtime);

// Exercise the actual worker fetch handler: code must never fall back to old cache.
const workerSource = fs.readFileSync(path.join(root, 'worker/index.js'), 'utf8');
const sw = workerSource.match(/const SERVICE_WORKER = `([^`]+)`;/)[1];
const handlers = {}, removed = [], fetches = [];
let offline = false, cacheReads = 0;
vm.runInNewContext(sw, {
  URL, Response, location: { origin: 'https://rafex.test' },
  self: { addEventListener: (name, fn) => { handlers[name] = fn; }, skipWaiting: async()=>{}, clients: { claim: async()=>{} } },
  caches: { keys: async()=>['rafex-pwa-v5','rafex-pwa-v6','other-app'], delete: async key=>removed.push(key), open: async()=>({ match: async()=>{cacheReads++;return new Response('cached icon');},put: async()=>{} }) },
  fetch: async(request, options)=>{fetches.push({request,options});if(offline)throw new Error('offline');return new Response('current');},
});
let work;
handlers.activate({ waitUntil: promise=>{work=promise;} }); await work;
assert.deepEqual(removed, ['rafex-pwa-v5']);
function request(url, mode='cors') {
  let response;
  handlers.fetch({request:{url:'https://rafex.test'+url,method:'GET',mode},respondWith:promise=>{response=promise;},waitUntil:()=>{}});
  return response;
}
assert.equal(await (await request('/b2b-viewer.js')).text(), 'current');
assert.equal(fetches.at(-1).options.cache, 'no-store');
offline=true;
await assert.rejects(request('/b2b-viewer.js'));
await assert.rejects(request('/', 'navigate'));
assert.equal(cacheReads, 0);
assert.equal(await (await request('/rafex-logo.png')).text(), 'cached icon');
assert.equal(request('/api/projects'), undefined);

// Use the installed browser runtime without adding an application dependency.
const require = createRequire(import.meta.url);
const {chromium}=require('playwright');
const browser=await chromium.launch({headless:true,...(process.env.RAFEX_TEST_BROWSER_CHANNEL?{channel:process.env.RAFEX_TEST_BROWSER_CHANNEL}:{})});
try {
  const page=await browser.newPage();
  const errors=[];page.on('pageerror', error=>errors.push(error.message));
  await page.setContent(html);
  await page.waitForTimeout(800);
  assert.equal(await page.locator('#rafexAuthorityProjectName').inputValue(), 'Başlangıç');
  await page.locator('#rafexAuthorityProjectName').fill('Ortak Deneme');
  await page.waitForTimeout(80);
  assert.equal(await page.locator('#b2bProjectName').inputValue(), 'Ortak Deneme');
  await page.evaluate(()=>{window.changes=0;new MutationObserver(records=>window.changes+=records.length).observe(document.body,{subtree:true,attributes:true,childList:true});});
  await page.waitForTimeout(250);
  assert.equal(await page.evaluate(()=>window.changes),0,'Idle runtime must settle');
  await page.evaluate(()=>{document.querySelector('#rafexUnifiedSystemPicker input').value='mekik2';document.querySelector('#rafexUnifiedSystemPicker input').dispatchEvent(new Event('change',{bubbles:true}));});
  await page.waitForTimeout(80);
  assert.equal(await page.locator('#rafexAuthorityProjectName').inputValue(),'Ortak Deneme');
  await page.locator('#rafexAuthorityProjectName').fill('');await page.waitForTimeout(80);
  assert.equal(await page.locator('#b2bProjectName').inputValue(),'');
  await page.evaluate(()=>document.querySelector('#nav button').setAttribute('data-page','home'));
  await page.evaluate(()=>window.RafexRuntimeAuthority.sync());
  assert.equal(await page.locator('#rafexAuthorityProjectName').count(),0);
  assert(await page.locator('#b2bProjectName').isVisible());
  assert.deepEqual(errors,[]);
} finally {await browser.close();}
console.log('PASS: retired controllers absent; idle settles; project values/scope preserved; old code cache disabled; unrelated caches preserved.');
console.log('Test fixture:',scratch);
