import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {transform} from './patch-drawing-catalog-v158.mjs';
const {chromium}=createRequire(import.meta.url)(process.env.RAFEX_PLAYWRIGHT_PATH||'playwright');
let html=transform(fs.readFileSync(process.argv[2]||'outputs/production-v157-final.html','utf8').replace('if(registry&&(current||[]).length)name=appendedName();','if(registry)name=appendedName();'));
const trayRuntime=fs.readFileSync('client/tray-calculator.js','utf8');
html=html.replace(/  \/\/ Use the existing calculation permission[\s\S]*?(?=  const previous=showPage;)/,trayRuntime.slice(trayRuntime.indexOf('  // Tray calculation'),trayRuntime.indexOf('  const previous=showPage;')));
html=html.replaceAll("'ayak','travers','mr'","'ayak','travers','tava','mr'").replaceAll("travers:'04',mr:'05',drive:'06',mekik2:'07',konsol:'08',admin:'09'","travers:'04',tava:'05',mr:'06',drive:'07',mekik2:'08',konsol:'09',admin:'10'");
assert.equal(transform(html),html);
for(const m of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g))if(m[1].trim())new vm.Script(m[1]);
fs.writeFileSync('outputs/drawing-catalog-v158.html',html);
const browser=await chromium.launch({channel:'msedge',headless:true});
let records=[],historyWrites=0,updates=0,fail=false;
try{
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',r=>{
  const path=new URL(r.request().url()).pathname,method=r.request().method();
  if(path==='/')return r.fulfill({contentType:'text/html',body:html});
  if(path==='/api/drawing-projects'&&method==='POST'){
   const b=r.request().postDataJSON();let project=records.find(p=>p.uuid===b.uuid);
   if(!project){project={...b,id:records.length+1,revision:0,rackTypes:[]};records.push(project);}
   return r.fulfill({json:{project}});
  }
  if(path.match(/\/api\/drawing-projects\/\d+\/types/)){
   if(fail)return r.fulfill({status:503,json:{error:'Test kayıt hatası'}});
   const p=records.find(p=>p.id===Number(path.split('/')[3])),b=r.request().postDataJSON();
   assert.equal(b.revision,p.revision);p.rackTypes=b.rackTypes;p.revision++;updates++;
   return r.fulfill({json:{revision:p.revision}});
  }
  if(path==='/api/drawing-projects')return r.fulfill({json:{projects:records}});
  if(path==='/api/projects'){if(method!=='GET')historyWrites++;return r.fulfill({json:{projects:[{id:999,serial_no:999,project_name:'HISTORY ONLY',payload:{rackTypes:[]}}]}});}
  if(path==='/api/bootstrap')return r.fulfill({json:{needsSetup:false}});
  if(path==='/api/me')return r.fulfill({json:{user:{id:1,fullName:'Test',username:'test',role:'super',defaultLanguage:'tr',allowed_modules:['free','b2b','mr','drive','mekik2','konsol']}}});
  if(path.startsWith('/api/'))return r.fulfill({json:{rows:[],types:[],rackTypes:[],projects:[],settings:{}}});
  return r.fulfill({contentType:'application/javascript',body:''});
 });
 await page.goto('https://rafex-configurator.vercel.app');
 await page.locator('#nav button[data-page="free"]').waitFor();
 const result=await page.evaluate(()=>{
  const old=me.allowed_modules;me.allowed_modules=['tava'];applyModuleVisibility();
  const trayOnly={tava:canViewModule('tava'),travers:canViewModule('travers')};
  me.allowed_modules=['travers'];applyModuleVisibility();
  const traversOnly={tava:canViewModule('tava'),travers:canViewModule('travers')};
  adminUsers=[{id:123,username:'test',allowed_modules:'["tava"]'}];openModuleAccess(123);
  const list=[...document.querySelectorAll('#moduleAccessList input')].map(n=>({key:n.value,checked:n.checked,label:n.parentElement.textContent.trim()}));
  me.allowed_modules=old;applyModuleVisibility();
  return {trayOnly,traversOnly,list,nav:[...document.querySelectorAll('#nav button')].map(n=>({key:n.dataset.page,text:n.textContent.trim()}))};
 });
 assert.deepEqual(result.trayOnly,{tava:true,travers:false});assert.deepEqual(result.traversOnly,{tava:false,travers:true});
 const index=result.nav.findIndex(n=>n.key==='travers');assert.equal(result.nav[index+1].key,'tava');assert.equal(result.nav[index+1].text,'05Tava Hesabı');assert.equal(result.nav[index+2].text,'06MR');
 assert.equal(result.list.find(n=>n.key==='tava').checked,true);assert.equal(result.list.find(n=>n.key==='travers').checked,false);assert.equal(result.list.find(n=>n.key==='travers').label,'Travers Hesaplama');
 assert.deepEqual(errors,[]);console.log('PASS: independent tray checkbox and visibility, 05 tray immediately below Travers, following numbers shifted.');
}finally{await browser.close();}

