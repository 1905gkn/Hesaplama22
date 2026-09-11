import fs from 'node:fs';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import {transform as a} from './patch-screen-session-v136.mjs';
import {transform as b} from './patch-common-konsol-controls-v137.mjs';
import {transform as c} from './patch-common-wall-fit-v138.mjs';
import {transform as d} from './patch-common-zoom-header-v139.mjs';
import {transform as margins} from './patch-pdf-layout-margin-v140.mjs';
import {transform} from './patch-pdf-tight-fit-v141.mjs';
const source=fs.readFileSync(process.argv[2]||'.perf-production.html','utf8'),m=source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);
const html=transform(margins(d(c(b(a(m?Buffer.from(m[2],'base64').toString():source))))));
assert.equal(transform(html),html);
for(const s of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g))if(!/\bsrc=|type=["'](?:module|application\/)/.test(s[1]))new vm.Script(s[2]);
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE_PATH||'playwright');
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
 await page.locator('#rafexAuthorityProjectName').fill('PDF margin regression');await page.locator('#rafexNewProjectV133').click();
 for(const [w,h] of [[200000,100000],[100000,100000],[200000,200000]]){
  await page.locator('#m2AreaW').fill(String(w));await page.locator('#m2AreaH').fill(String(h));await page.getByRole('button',{name:'Alanı Belirle',exact:true}).click();
  await page.waitForTimeout(200);
  await page.evaluate(()=>{drawMekik2();m2AddRack(b2bLayoutDrawing({...m2LastDrawing,b2b:b2bReadInputState()}),'A');const rack=m2LayoutState.racks[0],p=m2LayoutState.points[0];m2LayoutState.racks=Array.from({length:500},(_,i)=>({...structuredClone(rack),id:1000+i,x:p.x+8+(i%25)*19,y:p.y+8+Math.floor(i/25)*20,staged:false,freePlacement:false}));m2LayoutState.selected=null;m2RenderLayout();});
  const before=await page.evaluate(()=>JSON.stringify({r:m2LayoutState.racks,p:m2LayoutState.points}));let fitted;
  const report=page.locator('#m2ReportType'),index=await report.evaluate(e=>[...e.options].findIndex(o=>o.value==='summary'));
  await report.focus();await report.press('Home');for(let i=0;i<index;i++)await report.press('ArrowDown');await report.press('Enter');
  await page.locator('#m2CreateOutputButton').click();await page.waitForTimeout(4000);
  console.log('OUTPUT',await page.evaluate(()=>({type:document.getElementById('m2ReportType').value,status:document.getElementById('m2FloorStatus').textContent,panels:[...document.querySelectorAll('.m2-report-panel')].map(p=>({...p.dataset})),editable:rafexCanEditProjectV134()})),errors);
  await page.waitForFunction(()=>document.querySelector('#m2ReportFloor svg[data-rafex-pdf-margin="v141"]'),{},{timeout:5000});
  for(const zoom of [0,-1,1]){
   await page.evaluate(z=>{rafexOpenPdfGateV89();m2ZoomLayout(0,true);for(let i=0;i<4;i++)if(z)m2ZoomLayout(z);},zoom);await page.waitForTimeout(100);
   const result=await page.evaluate(()=>{const source=document.getElementById('m2LayoutSvg'),view=source.getAttribute('viewBox'),copy=rafexPdfLayoutCloneV140(source),v=copy.getAttribute('viewBox').split(' ').map(Number),b=copy.getAttribute('data-rafex-pdf-bounds').split(' ').map(Number);m2RenderA4Report();const corporate=document.createElement('template');corporate.innerHTML=m2BuildCorporatePages();return{view,after:source.getAttribute('viewBox'),v,b,summary:document.querySelector('#m2ReportFloor svg').getAttribute('viewBox'),corporate:corporate.content.querySelector('.m2-corporate-floor svg').getAttribute('viewBox'),racks:copy.querySelectorAll('[data-rack]').length,aspect:copy.style.aspectRatio};});
   assert.equal(result.view,result.after,'PDF generation does not change editor zoom');assert.equal(result.aspect,'');assert.equal(result.corporate,result.v.join(' '));assert(result.racks>=500);
   const sv=result.summary.split(' ').map(Number);assert(Math.abs((result.b[0]-sv[0])/sv[2]-.16)<1e-8);assert(Math.abs((result.b[1]-sv[1])/sv[3]-.16)<1e-8);
   const [x,y,vw,vh]=result.v,[l,t,r,b]=result.b;assert.equal(x,l);assert.equal(y,t);assert.equal(vw,r-l);assert.equal(vh,b-t);
   assert(Math.abs((l+r)/2-500)<3,'drawing is centered on walls, not the editor ruler');
   if(fitted)assert.deepEqual(result.v,fitted,'PDF view must be independent of zoom');else fitted=result.v;
   const rulerCheck=await page.evaluate(()=>{const s=document.getElementById('m2LayoutSvg'),r=s.querySelector('.m2-metre-ruler'),before=s.outerHTML,copy=rafexPdfLayoutCloneV140(s),next=copy.querySelector('.m2-metre-ruler');return{unchanged:s.outerHTML===before,ruler:next?.outerHTML===r?.outerHTML,separate:next?.parentElement.getAttribute('data-rafex-pdf-ruler')};});
   assert(rulerCheck.unchanged);assert(rulerCheck.ruler);assert.equal(rulerCheck.separate,'v141');
  }
  assert.equal(await page.evaluate(()=>JSON.stringify({r:m2LayoutState.racks,p:m2LayoutState.points})),before);
  console.log('PASS PDF bounds',w,h,fitted,'500 racks, 3 zoom levels, both output modes');
 }
 // Exercise the real corporate print builder and print CSS, without opening a native dialog.
 await page.evaluate(async()=>{window.print=()=>{};window.__rafexPrepareCorporatePrint=async()=>{};await m2PrintCorporateReport();});await page.waitForTimeout(3200);await page.emulateMedia({media:'print'});
 const margins=await page.evaluate(()=>{const svg=document.querySelector('#m2CorporatePrint .m2-corporate-floor svg'),page=svg.closest('.m2-corporate-page').getBoundingClientRect(),r=svg.getBoundingClientRect(),v=svg.getAttribute('viewBox').split(' ').map(Number),b=svg.getAttribute('data-rafex-pdf-bounds').split(' ').map(Number),s=Math.min(r.width/v[2],r.height/v[3]),ox=r.left+(r.width-v[2]*s)/2,oy=r.top+(r.height-v[3]*s)/2;return{left:(ox+(b[0]-v[0])*s-page.left)/page.width,right:(page.right-ox-(b[2]-v[0])*s)/page.width,top:(oy+(b[1]-v[1])*s-page.top)/page.height,bottom:(page.bottom-oy-(b[3]-v[1])*s)/page.height};});
 console.log('PRINT PAGE MARGINS',margins);for(const n of Object.values(margins))assert(n>=.1-1e-4);
 assert(Math.abs(margins.left-margins.right)<.001,'symmetric horizontal page margins');
 assert(Math.abs(margins.left-.1)<.001||Math.abs(margins.bottom-.1)<.001,'maximal fit touches a safe-frame axis');
 fs.mkdirSync('tmp/pdfs',{recursive:true});await page.pdf({path:'tmp/pdfs/layout-margin-v140.pdf',printBackground:true,preferCSSPageSize:true});
 await page.evaluate(()=>{window.dispatchEvent(new Event('afterprint'));rafexOpenPdfGateV89();m2PrintA4Report();});await page.waitForTimeout(500);
 assert.equal(await page.locator('#m2A4PrintSheet svg[data-rafex-pdf-margin="v141"]').count(),1,'summary print uses the same fitted export');
 const summaryMargins=await page.evaluate(()=>{const svg=document.querySelector('#m2A4PrintSheet svg[data-rafex-pdf-margin="v141"]'),p=document.getElementById('m2A4PrintSheet').getBoundingClientRect(),r=svg.getBoundingClientRect(),v=svg.getAttribute('viewBox').split(' ').map(Number),b=svg.getAttribute('data-rafex-pdf-bounds').split(' ').map(Number),s=Math.min(r.width/v[2],r.height/v[3]),ox=r.left+(r.width-v[2]*s)/2,oy=r.top+(r.height-v[3]*s)/2;return[(ox+(b[0]-v[0])*s-p.left)/p.width,(p.right-ox-(b[2]-v[0])*s)/p.width,(oy+(b[1]-v[1])*s-p.top)/p.height,(p.bottom-oy-(b[3]-v[1])*s)/p.height];});
 console.log('SUMMARY PAGE MARGINS',summaryMargins);for(const margin of summaryMargins)assert(margin>=.1);
 await page.pdf({path:'tmp/pdfs/layout-margin-v140-summary.pdf',printBackground:true,preferCSSPageSize:true});
 assert.deepEqual(errors,[]);assert.deepEqual(writes,[]);console.log('PASS PDF v141: centered maximal fit, ruler retained separately, no editor mutations');
}finally{await browser.close();}
