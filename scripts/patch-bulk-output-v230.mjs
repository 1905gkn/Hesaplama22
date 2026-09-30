import fs from 'node:fs';
export function transform(html){if(html.includes('bulk-output-v230'))return html;
function replace(a,b){if(!html.includes(a))throw Error('Missing '+a.slice(0,90));html=html.replace(a,b)}
replace('      function m2ToggleJoinMode() {','      function m2ToggleJoinMode() {\n        if(window.rafexBulkJoinV230?.())return;');
replace('  function schedule(){[0,20,60,120,240,480,900,1500,2300,3100].forEach(function(ms){setTimeout(rebuild,ms)})}',`  window.rafexRebuildSectionsV230=rebuild;
  let rebuildTimerV230;
  function schedule(){clearTimeout(rebuildTimerV230);if(window.__rafexManualOutputBuild)return;rebuildTimerV230=setTimeout(rebuild,40)}`);
replace('  function schedulePdf(delay){clearTimeout(pdfTimer);pdfTimer=setTimeout(syncPdf,delay||30);}', '  window.rafexSyncSectionLabelsV230=syncPdf;\n  function schedulePdf(delay){clearTimeout(pdfTimer);if(window.__rafexManualOutputBuild)return;pdfTimer=setTimeout(syncPdf,delay||30);}');
replace('schedulePdf(40);setTimeout(syncPdf,420);setTimeout(syncPdf,1150);setTimeout(syncPdf,3250);return result;', 'schedulePdf(40);return result;');
replace('// Existing section repair passes settle within 3100ms.\n      await wait(3200);', '// Finish legacy short repair passes, then build section pages deterministically.\n      await wait(400);\n      if(type===\'corporate\'){window.rafexRebuildSectionsV230?.();window.rafexSyncSectionLabelsV230?.();}');
replace('await base.rafexRenderSelectedB2BSections?.(true);','await base.rafexRenderSelectedB2BSections?.(false);');
replace('window.rafexRenderSelectedB2BSections = async function(force = true) {\n    saved = loadSettings();',`window.rafexRenderSelectedB2BSections = async function(force = false) {
    saved = loadSettings();
    for(const type of collectRackTypes())if(!saved.sections[type.key])saved.sections[type.key]=defaultsFor(type.key);`);
replace('    if (window[api]) return Promise.resolve(true);\n    if (viewerLoads[system])', `    if (window[api]) return Promise.resolve(true);
    if(typeof window.rafexLoadViewerOnDemandV3==='function')return Promise.resolve(window.rafexLoadViewerOnDemandV3(system)).then(()=>{if(!window[api])throw Error(system+' 3D motoru hazırlanamadı');return true;});
    if (viewerLoads[system])`);
const script=`<script data-rafex="bulk-output-v230">
window.rafexBulkJoinV230=function(){
 const selected=new Set([...(m2MultiSelect?.rackIds||[])].map(Number));if(selected.size<2)return false;
 const racks=m2LayoutState.racks,groups=new Set(racks.filter(r=>selected.has(Number(r.id))).map(r=>r.joinGroup).filter(Boolean));
 racks.forEach(r=>{if(r.joinGroup&&groups.has(r.joinGroup))selected.add(Number(r.id))});
 const members=racks.filter(r=>selected.has(Number(r.id))),status=t=>{const el=document.getElementById('m2FloorStatus');if(el)el.textContent=t;};
 const seed=members[0],system=r=>window.rafexRackSystemOf?.(r)||'b2b',angle=r=>((Number(r.angle)||0)%360+360)%360,profile=r=>String(r.footProfile||r.footProfileKey||r.b2b?.footProfile||'').replace(/\\s+/g,'').toLowerCase();
 if(members.length<2)return false;
 if(members.some(r=>!r.b2bLayout||system(r)!==system(seed)||Math.abs(angle(r)-angle(seed))>.1||r.b2bLayout.rowCount!==seed.b2bLayout.rowCount||Math.abs(r.h-seed.h)>.5||profile(r)!==profile(seed)||m2B2BFootWidth(r)!==m2B2BFootWidth(seed))){status('Toplu birleşim için aynı yöndeki, aynı sıra tipindeki ve aynı ayak profiline sahip rafları seç.');return true;}
 const rad=angle(seed)*Math.PI/180,ux=Math.cos(rad),uy=Math.sin(rad),cross=r=>-(r.x+r.w/2)*uy+(r.y+r.h/2)*ux,along=r=>(r.x+r.w/2)*ux+(r.y+r.h/2)*uy;
 if(Math.max(...members.map(cross))-Math.min(...members.map(cross))>Math.max(.5,m2LayoutState.scale*50)){status('Toplu birleştirmek için aynı sıradaki rafları seç.');return true;}
 members.sort((a,b)=>along(a)-along(b));const planned=[{...members[0]}],ids=members.map(r=>r.id),foot=m2B2BFootWidth(seed)*m2LayoutState.scale;
 for(let i=1;i<members.length;i++){const prev=planned[i-1],r=members[i],step=(prev.w+r.w)/2-foot;if(step<=0){status('Raf genişliği ortak ayak birleşimine uygun değil.');return true;}planned.push({...r,x:prev.x+prev.w/2+ux*step-r.w/2,y:prev.y+prev.h/2+uy*step-r.h/2});}
 if(planned.some(r=>!m2RackInsideArea(r,r.x,r.y,r.angle)||m2RackOverlapsExcept(r,r.x,r.y,r.angle,ids))){status('Birleşim konumunda duvar, kolon veya başka raf var; seçili sıra değiştirilmedi.');return true;}
 m2PushUndo('Toplu raf birleştirme');const group='join-bulk-'+Date.now();
 planned.forEach((p,i)=>{Object.assign(members[i],{x:p.x,y:p.y,joinGroup:group,sharedFootWith:i?members[i-1].id:null,sharedFootSide:i?'left':null,freePlacement:false,staged:false,locked:true});});
 m2JoinMode=false;m2JoinFirstRackId=null;document.getElementById('m2JoinRackButton')?.classList.remove('active');document.getElementById('m2JoinRackButton')?.setAttribute('aria-pressed','false');
 m2RenderLayout();status(members.length+' modül ortak ayaklı tek sıra olarak birleştirildi.');return true;
};</script>`;
const at=html.lastIndexOf('</body>');return html.slice(0,at)+script+html.slice(at)}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-bulk-output-v230.mjs')){const file='dist/server/index.js',s=fs.readFileSync(file,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('Missing HTML');fs.writeFileSync(file,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));}
