import {transformSync} from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const marker='rack-performance-v498';
function replaceOnce(source,anchor,replacement,label){
  if(!source.includes(anchor))throw Error('v498 missing '+label);
  return source.replace(anchor,replacement);
}

// Dispose only resources owned by this drawing; GLB resources stay shared.
export function clearMekikResourcesV498(){
  const sharedGeometry=new Set(),sharedMaterial=new Set();
  for(const model of Object.values(this.models||{}))model.root?.traverse(node=>{
    if(node.geometry)sharedGeometry.add(node.geometry);
    for(const material of Array.isArray(node.material)?node.material:node.material?[node.material]:[])sharedMaterial.add(material);
  });
  const geometry=new Set(),materials=new Set();
  this.root.traverse(node=>{
    if(node.geometry&&!sharedGeometry.has(node.geometry))geometry.add(node.geometry);
    for(const material of Array.isArray(node.material)?node.material:node.material?[node.material]:[])if(!sharedMaterial.has(material))materials.add(material);
  });
  geometry.forEach(item=>item.dispose());materials.forEach(item=>item.dispose());
  this.root.clear();
}

// The main MR view can instance identical parts. Detached export scenes retain
// their original meshes because layoutAccessoryGeometry reads individual parts.
export function batchMrPartsV498(root){
  const T=globalThis.RafexThree,groups=new Map();
  root.updateMatrixWorld(true);
  root.traverse(node=>{
    if(!node.isMesh||node.isInstancedMesh||node.children.length||Array.isArray(node.material))return;
    let materials=groups.get(node.geometry);if(!materials)groups.set(node.geometry,materials=new Map());
    let flags=materials.get(node.material);if(!flags)materials.set(node.material,flags=new Map());
    const key=[node.castShadow,node.receiveShadow,node.renderOrder,node.layers.mask].join(':');
    let items=flags.get(key);if(!items)flags.set(key,items=[]);items.push(node);
  });
  const inverse=root.matrixWorld.clone().invert(),matrix=new T.Matrix4();
  for(const materials of groups.values())for(const flags of materials.values())for(const items of flags.values()){
    if(items.length<2)continue;
    const first=items[0],mesh=new T.InstancedMesh(first.geometry,first.material,items.length);
    mesh.name=first.name;mesh.castShadow=first.castShadow;mesh.receiveShadow=first.receiveShadow;
    mesh.renderOrder=first.renderOrder;mesh.layers.mask=first.layers.mask;
    items.forEach((item,index)=>{matrix.multiplyMatrices(inverse,item.matrixWorld);mesh.setMatrixAt(index,matrix);item.removeFromParent();});
    mesh.instanceMatrix.needsUpdate=true;mesh.computeBoundingBox();mesh.computeBoundingSphere();root.add(mesh);
  }
}

export function disposeMrInstancesV498(root){
  root?.traverse?.(node=>{if(node.isInstancedMesh)node.dispose();});
}

export function observeKonsolDetachV498(viewer){
  if(viewer.canvas.id!=='konsolCanvas')return;
  const page=document.getElementById('page');if(!page)return;
  viewer.detachObserverV498=new MutationObserver(()=>{if(!viewer.canvas.isConnected)viewer.destroy();});
  viewer.detachObserverV498.observe(page,{childList:true});
}

export function transformMekik(code){
  if(code.includes(marker))return code;
  const old='clearRoot(){for(;this.root.children.length;)this.root.remove(this.root.children[0])}';
  code=replaceOnce(code,old,'clearRoot(){clearMekikResourcesV498.call(this)}','Mekik resource cleanup');
  const start=code.indexOf('function mn(){');
  if(start<0)throw Error('v498 missing Mekik controls');
  const setup=`function mekikControlKeyV498(){const page=document.getElementById('page');return JSON.stringify([page?.dataset?.rafexCommonSystem,...Array.from(document.querySelectorAll('#page .m2-form input,#page .m2-form select,#page .m2-traverse-placeholder select,#page .m2-traverse-placeholder button')).map(node=>[node.id,node.value,node.checked,node.getAttribute('aria-pressed')])]);}let mekikControlsHostV498=null,mekikControlsKeyV498='';function mn(){const hostV498=document.querySelector('#page .m2-form'),keyV498=mekikControlKeyV498();if(hostV498===mekikControlsHostV498&&keyV498===mekikControlsKeyV498)return;mnUncachedV498();mekikControlsHostV498=hostV498;mekikControlsKeyV498=mekikControlKeyV498();}function mnUncachedV498(){`;
  code=code.slice(0,start)+code.slice(start).replace('function mn(){',setup);
  code=replaceOnce(code,'let i=document.getElementById("m2Front");if(!i)return;if(Tn()', 'let i=document.getElementById("m2Front");if(!i||!i.getClientRects().length)return;if(Tn()','Mekik hidden preview guard');
  return `/* ${marker} */\n${clearMekikResourcesV498.toString()}\n`+code;
}

export function transformMR(code){
  if(code.includes(marker))return code;
  code=code.replace(/this\.frameDirty=(?:!0|true)/g,'this.invalidateV498()');
  const cameraWake=code.match(/this\.controls=new [\w$]+\(this\.camera,[\w$]+\),/)?.[0];if(!cameraWake)throw Error('v498 missing MR camera wake');
  code=replaceOnce(code,cameraWake,cameraWake+'this.controls.addEventListener("change",()=>this.requestFrameV498()),','MR camera wake');
  const rotate=code.match(/setAutoRotate\((\w+)\)\{this\.controls\.autoRotate=!!\1,this\.controls\.autoRotateSpeed=\.75\}/)?.[0];if(!rotate)throw Error('v498 missing MR programmatic rotation wake');
  code=replaceOnce(code,rotate,rotate.slice(0,-1)+',this.requestFrameV498()}','MR programmatic rotation wake');
  const dirty=code.match(/this\.controls\.update\(\),([\w$]+)\(this\)&&\(/);if(!dirty)throw Error('v498 missing MR dirty frame');
  code=replaceOnce(code,dirty[0],'this.controls.update(),this.changedV498='+dirty[1]+'(this),this.changedV498&&(','MR dirty frame');
  code=replaceOnce(code,'this.animationFrame=requestAnimationFrame(this.animate)}}destroy(){','(this.changedV498||this.controls.autoRotate)&&this.requestFrameV498()}}requestFrameV498(){if(this.renderer&&this.controls&&!this.destroyed&&!document.hidden&&this.visibilityV147?.visible!==false&&this.animationFrame==null)this.animationFrame=requestAnimationFrame(()=>this.animate())}invalidateV498(){this.frameDirty=true;this.requestFrameV498()}destroy(){','MR stop idle frames');
  code=replaceOnce(code,'this.root.updateMatrixWorld(!0),this.bounds.setFromObject(this.root)', 'this.canvas.id==="mrCanvas"&&batchMrPartsV498(this.root),this.root.updateMatrixWorld(!0),this.bounds.setFromObject(this.root)','MR identical part batching');
  code=replaceOnce(code,'this.disposeDimensions(),this.root.clear();','this.disposeDimensions(),disposeMrInstancesV498(this.root),this.root.clear();','MR instance buffers on rebuild');
  code=replaceOnce(code,'this.disposeDimensions(),this.canvas.removeEventListener','this.disposeDimensions(),disposeMrInstancesV498(this.root),this.canvas.removeEventListener','MR instance buffers on destroy');
  return `/* ${marker} */\n${batchMrPartsV498.toString()}\n${disposeMrInstancesV498.toString()}\n`+code;
}

export function transformKonsol(code){
  if(code.includes(marker))return code;
  const dirtyFrame=/return\(([\w$]+)\.renderDirty\|\|\1\.renderCameraKey!==([\w$]+)\)&&\(\1\.renderer\.render\(\1\.scene,([\w$]+)\),\1\.renderCameraKey=\2,\1\.renderDirty=!1\),!0}/;
  if(!dirtyFrame.test(code))throw Error('v498 missing Konsol stop idle frames');
  code=code.replace(dirtyFrame,(_,v,key,camera)=>'const changedV498='+v+'.renderDirty||'+v+'.renderCameraKey!=='+key+';return changedV498&&('+v+'.renderer.render('+v+'.scene,'+camera+'),'+v+'.renderCameraKey='+key+','+v+'.renderDirty=!1),!!(changedV498||'+v+'.controls.autoRotate)}');
  code=code.replace(/this\.renderDirty=!0/g,'this.invalidateV498()');
  const cameraWake=code.match(/this\.controls=new [\w$]+\(this\.camera,[\w$]+\),/)?.[0];if(!cameraWake)throw Error('v498 missing Konsol controls');
  code=replaceOnce(code,cameraWake,cameraWake+'this.controls.addEventListener("change",()=>this.requestFrameV498()),observeKonsolDetachV498(this),','Konsol camera wake');
  const frameName=code.match(/([\w$]+)\(this\)&&\(this\.raf=requestAnimationFrame\(\(\)=>this\.loop\(\)\)\)\}\}destroy\(\)\{/)?.[1];if(!frameName)throw Error('v498 missing Konsol frame');
  code=replaceOnce(code,frameName+'(this)&&(this.raf=requestAnimationFrame(()=>this.loop()))}}destroy(){',frameName+'(this)&&this.requestFrameV498()}}requestFrameV498(){if(!this.destroyed&&!document.hidden&&this.renderVisibility?.visible!==false&&this.raf==null)this.raf=requestAnimationFrame(()=>this.loop())}invalidateV498(){this.renderDirty=true;this.requestFrameV498()}destroy(){','Konsol invalidation');
  code=replaceOnce(code,'this.renderVisibility?.dispose(),this.resizeObserver?.disconnect()', 'this.renderVisibility?.dispose(),this.detachObserverV498?.disconnect(),this.resizeObserver?.disconnect()','Konsol idle navigation cleanup');
  return `/* ${marker} */\n${observeKonsolDetachV498.toString()}\n`+code;
}

export function transformHtml(html){
  if(html.includes('data-rack-performance="v498"'))return html;
  const edgeStart=html.indexOf('  function syncEdge(){'),edgeEnd=html.indexOf('  function cleanSectionTypes(){}',edgeStart);
  if(edgeStart<0||edgeEnd<0)throw Error('v498 missing edge preference sync');
  html=html.slice(0,edgeStart)+`  var edgeEditorSyncedV498=null,edgePreferenceSyncedV498=null;
  function syncEdge(){if(!freePage())return;var editor=document.getElementById('m2EdgeEditor');if(!editor)return;var pref=localStorage.getItem(EDGE_KEY);if(pref==null){pref='1';localStorage.setItem(EDGE_KEY,pref);}if(edgeEditorSyncedV498===editor&&edgePreferenceSyncedV498===pref)return;edgeEditorSyncedV498=editor;edgePreferenceSyncedV498=pref;try{m2EdgeEditorVisible=pref==='1';}catch(e){return;}if(document.getElementById('page')?.dataset?.rafexWorkflowScreen==='layout'&&typeof m2RenderLayout==='function')m2RenderLayout();}
`+html.slice(edgeEnd);
  html=replaceOnce(html,'function doGeometry(){geometryRaf=0;var s=currentState();updateSummary(s);updateSectionSvg(s);if(viewer&&viewer.update)viewer.update(s)}',`let geometryTimerV498=0,geometryKeyV498='',geometryViewerV498=null;
  function doGeometry(){geometryRaf=0;if(!el('konsolCanvas')?.isConnected)return;var s=currentState(),key=JSON.stringify(s);if(key===geometryKeyV498&&viewer===geometryViewerV498)return;geometryKeyV498=key;geometryViewerV498=viewer;updateSummary(s);updateSectionSvg(s);if(viewer&&viewer.update)viewer.update(s)}`,'Konsol unchanged update guard');
  html=replaceOnce(html,'function scheduleGeometry(){if(geometryRaf)return;geometryRaf=requestAnimationFrame(doGeometry)}', 'function scheduleGeometry(){clearTimeout(geometryTimerV498);if(geometryRaf){cancelAnimationFrame(geometryRaf);geometryRaf=0;}geometryTimerV498=setTimeout(()=>{geometryTimerV498=0;geometryRaf=requestAnimationFrame(doGeometry)},90)}','Konsol coalesce input and change');
  html=replaceOnce(html,'viewer=null;if(geometryRaf){cancelAnimationFrame(geometryRaf);geometryRaf=0}', 'viewer=null;clearTimeout(geometryTimerV498);geometryTimerV498=0;if(geometryRaf){cancelAnimationFrame(geometryRaf);geometryRaf=0}','Konsol navigation timer cleanup');
  html=replaceOnce(html,'function renderPlan(p,{x=0,y=0,scale=1,braces=true}={}) {','function renderPlan(p,{x=0,y=0,scale=1,braces=true,compact=false}={}) {','compact native plan option');
  const footStart=html.indexOf('  const foot=(cx,cy,h)=>'),footEnd=html.indexOf('\n  let out=',footStart);
  if(footStart<0||footEnd<0)throw Error('v498 missing native foot');
  const oldFoot=html.slice(footStart,footEnd);
  const compactFoot="<g class=\"rafex-plan-foot-v143\" transform=\"translate(${cx-p.foot/2} ${cy})\"><path d=\"M${p.foot*.22} 0h${p.foot*.56}v${h}h${-p.foot*.56}zM0 0h${p.foot}v${p.foot*.18}H0zM0 ${h-p.foot*.18}h${p.foot}v${p.foot*.18}H0z\" fill=\"${p.footFinish||'#a8b0b3'}\" stroke=\"#59636b\" stroke-width=\"${p.foot*.035}\"/><path d=\"M${p.foot/2} ${p.foot*.18}V${h-p.foot*.18}\" stroke=\"#8b949a\" stroke-width=\"${p.foot*.028}\"/></g>";
  html=html.slice(0,footStart)+oldFoot.replace('=>`','=>compact?`'+compactFoot+'`:`')+html.slice(footEnd);
  const palletStart=html.indexOf('  if(p.showPallets)for(let row=0;row<p.depth;row++)'),palletEnd=html.indexOf('\n  if(braces)',palletStart);
  if(palletStart<0||palletEnd<0)throw Error('v498 missing plan pallet loop');
  const oldPallet=html.slice(palletStart,palletEnd);
  html=html.slice(0,palletStart)+`  if(compact&&p.showPallets){for(let row=0;row<p.depth;row++){let d='';for(let bay=0;bay<p.bays;bay++){const px=p.foot+bay*p.pitch+(p.pitch-p.foot-p.palW)/2;d+='M'+px+' '+p.positions[row]+'h'+p.palW+'v'+p.palD+'h'+(-p.palW)+'z';}out+='<path class="rafex-plan-pallet-v143" data-pallet-row="'+(row+1)+'" d="'+d+'" fill="#dfbd72" stroke="#c38838" stroke-width="'+(p.palW/80)+'"/>';}}else
`+oldPallet+html.slice(palletEnd);
  html=replaceOnce(html,'window.rafexRenderPlanV143(window.rafexPlanDetailV143(m2LastDrawing),{x:left,y:topY,scale:topScale,braces:false})','window.rafexRenderPlanV143(window.rafexPlanDetailV143(m2LastDrawing),{x:left,y:topY,scale:topScale,braces:false,compact:true})','compact configuration top view only');
  html=html.replace(/\/(mr|konsol|mekik-front)-viewer\.js(\?[^"'\s<>]*)?/g,(_,name,query='')=>'/'+name+'-viewer.js'+query+(query?'&':'?')+'performance=v498');
  const bodyEnd=html.lastIndexOf('</body>');if(bodyEnd<0)throw Error('v498 missing document body');
  return html.slice(0,bodyEnd)+'<script data-rack-performance="v498">window.rafexRackPerformanceVersion="v498";</script>'+html.slice(bodyEnd);
}

export function apply(root=process.cwd()){
  const serverFile=path.join(root,'dist/server/index.js');
  let server=fs.existsSync(serverFile)?fs.readFileSync(serverFile,'utf8'):null;
  for(const [name,transform,constant] of [['mekik-front',transformMekik,'RAFEX_MEKIK_FRONT_VIEWER_BASE64'],['mr',transformMR,'MR_VIEWER_BASE64'],['konsol',transformKonsol,'KONSOL_VIEWER_BASE64']]){
    const file=path.join(root,'dist',name+'-viewer.js'),code=transform(fs.readFileSync(file,'utf8'));try{new vm.Script(code,{filename:name+'-viewer-v498.js'});}catch(error){console.error('v498 parse failure in '+name);try{transformSync(code,{loader:'js'});}catch(parsed){for(const e of parsed.errors||[]){const p=e.location;console.error(JSON.stringify({viewer:name,text:e.text,line:p?.line,column:p?.column,near:p?.lineText?.slice(Math.max(0,p.column-180),p.column+180)}));}}console.error('MR animation fragment: '+code.slice(code.indexOf('animate(){'),code.indexOf('animate(){')+3000));throw error;}fs.writeFileSync(file,code);
    if(server){const re=new RegExp('(const '+constant+' = ["\x27])([A-Za-z0-9+/=]+)(["\x27])');if(!re.test(server))throw Error('v498 missing '+constant);server=server.replace(re,(_,a,b,c)=>a+Buffer.from(code).toString('base64')+c);}
  }
  for(const relative of ['dist/index.html']){const file=path.join(root,relative);if(fs.existsSync(file)){const html=transformHtml(fs.readFileSync(file,'utf8'));validateHtml(html);fs.writeFileSync(file,html);}}
  if(server){const match=server.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);if(!match)throw Error('v498 missing HTML_BASE64');const html=transformHtml(Buffer.from(match[2],'base64').toString('utf8'));validateHtml(html);server=server.replace(match[0],match[0].replace(match[2],Buffer.from(html).toString('base64')));fs.writeFileSync(serverFile,server);}
  console.log('PASS v498: resource cleanup, demand frames, batched MR parts, compact top plans and coalesced controls.');
}
export function validateHtml(html){for(const script of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi))if(!/\bsrc\s*=|application\/json|application\/ld\+json/.test(script[1]))new vm.Script(script[2]);}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))apply();

