import fs from 'node:fs';
import vm from 'node:vm';
export function batchMrPartsV498(root){
 const T=globalThis.RafexThree,groups=new Map();root.updateMatrixWorld(true);
 root.traverse(node=>{
  if(!node.isMesh||node.isInstancedMesh||node.children.length||Array.isArray(node.material))return;
  let materials=groups.get(node.geometry);if(!materials)groups.set(node.geometry,materials=new Map());
  let flags=materials.get(node.material);if(!flags)materials.set(node.material,flags=new Map());
  const key=[node.castShadow,node.receiveShadow,node.renderOrder,node.layers.mask,node.matrixWorld.determinant()<0].join(':');
  let items=flags.get(key);if(!items)flags.set(key,items=[]);items.push(node);
 });
 const inverse=root.matrixWorld.clone().invert(),matrix=new T.Matrix4(),reflection=new T.Matrix4().makeScale(-1,1,1);
 for(const materials of groups.values())for(const flags of materials.values())for(const items of flags.values()){
  if(items.length<2)continue;
  const first=items[0],mirrored=first.matrixWorld.determinant()<0;
  let geometry=first.geometry;
  // WebGL instancing cannot render negative determinants correctly. Bake the
  // reflection once and reverse winding, then keep all instance matrices positive.
  if(mirrored){
   geometry=geometry.clone().applyMatrix4(reflection);
   if(!geometry.index)geometry.setIndex(Array.from({length:geometry.attributes.position.count},(_,i)=>i));
   const indices=geometry.index.array;
   for(let i=0;i<indices.length;i+=3){const swap=indices[i+1];indices[i+1]=indices[i+2];indices[i+2]=swap;}
   geometry.index.needsUpdate=true;geometry.computeBoundingBox();geometry.computeBoundingSphere();
  }
  const mesh=new T.InstancedMesh(geometry,first.material,items.length);
  mesh.userData.reflectedGeometryV500=mirrored;mesh.name=first.name;
  mesh.castShadow=first.castShadow;mesh.receiveShadow=first.receiveShadow;mesh.renderOrder=first.renderOrder;mesh.layers.mask=first.layers.mask;
  items.forEach((item,index)=>{matrix.multiplyMatrices(inverse,item.matrixWorld);if(mirrored)matrix.multiply(reflection);mesh.setMatrixAt(index,matrix);item.removeFromParent();});
  mesh.instanceMatrix.needsUpdate=true;mesh.computeBoundingBox();mesh.computeBoundingSphere();root.add(mesh);
 }
}
export function disposeMrInstancesV498(root){root?.traverse?.(node=>{if(node.isInstancedMesh){if(node.userData.reflectedGeometryV500)node.geometry.dispose();node.dispose();}});}
export function transformMR(code){
 if(code.includes('/* finishes-v500 */'))return code;
 const start=code.indexOf('function batchMrPartsV498('),end=code.indexOf('(()=>{',code.indexOf('function disposeMrInstancesV498('));
 if(start<0||end<0)throw Error('v500 MR batch helpers missing');
 // The next bundled module starts with var; preserve all bundled viewer code.
 return code.slice(0,start)+'/* finishes-v500 */\n'+batchMrPartsV498.toString()+'\n'+disposeMrInstancesV498.toString()+'\n'+code.slice(end);
}
export function transformHtml(html){
 if(html.includes('data-finishes="v500"'))return html;
 html=html.replace(/(<script\b[^>]*data-rafex-drive-in-mekik="v1"[^>]*>)([\s\S]*?)(<\/script>)/,(_,a,s,z)=>{
  if(!s.includes('const config=()=>({'))throw Error('v500 Drive config missing');
  s=s.replace('const config=()=>({',`const config=()=>({
    footColor:document.querySelector('#page .rafex-mekik-foot-color')?.value||m2LastDrawing?.mekikFootColor||'ral5010',
    traverseColor:document.querySelector('#page .rafex-mekik-traverse-color')?.value||m2LastDrawing?.mekikTraverseColor||'ral1007',`);
  return a+s+z;
 });
 html=html.replace(/(<(?:style|script)\b[^>]*data-rafex-common-mekik-view-colors="v1"[^>]*>)([\s\S]*?)(<\/(?:style|script)>)/g,(_,a,s,z)=>a+s.replaceAll('[data-rafex-common-system="mekik2"]',':is([data-rafex-common-system="mekik2"],[data-rafex-common-system="drive"])').replace("page.getAttribute('data-rafex-common-system')==='mekik2'","['mekik2','drive'].includes(page.getAttribute('data-rafex-common-system'))")+z);
 const restore="row.append(foot,beam);form.prepend(row);";
 if(!html.includes(restore))throw Error('v500 uniform controls missing');
 html=html.replace(restore,"try{if(typeof m2LastDrawing!=='undefined'&&m2LastDrawing?.rafexSystem===key&&['ral1007','ral2004'].includes(m2LastDrawing.mekikTraverseColor))beam.querySelector('select').value=m2LastDrawing.mekikTraverseColor;}catch(_){}"+restore);
 html=html.replace("return d?.rafexSystem==='drive'||d?.systemType==='drive'?'#68757f':'#004f7c';","return '#004f7c';");
 const runtime=`<script data-finishes="v500">(()=>{
  const snapshot=()=>{try{const p=document.getElementById('page'),s=p?.dataset.rafexCommonSystem||p?.dataset.m2Module;if(!['drive','mekik2'].includes(s))return;const f=p.querySelector('.rafex-mekik-foot-color'),b=p.querySelector('.rafex-mekik-traverse-color');if(typeof m2LastDrawing!=='undefined'&&m2LastDrawing){if(f)m2LastDrawing.mekikFootColor=f.value;if(b)m2LastDrawing.mekikTraverseColor=b.value;}}catch{}};
  const draw=window.drawMekik2;if(typeof draw==='function')drawMekik2=window.drawMekik2=function(){snapshot();const result=draw.apply(this,arguments);snapshot();return result;};
  document.addEventListener('change',e=>{if(e.target.matches?.('.rafex-mekik-foot-color,.rafex-mekik-traverse-color')){snapshot();window.drawMekik2?.();}},true);
 })();</script>`;
 const end=html.lastIndexOf('</body>');if(end<0)throw Error('body missing');
 html=html.slice(0,end)+runtime+html.slice(end);
 html=html.replace(/\/(mr|drive-in)-viewer\.js(\?[^"'\s<>]*)?/g,(_,name,q='')=>'/'+name+'-viewer.js'+q+(q?'&':'?')+'finishes=v500');
 for(const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g))if(!/src=|application\/json/.test(m[1]))new vm.Script(m[2]);
 return html;
}
export function apply(){
 const mr='dist/mr-viewer.js';const code=transformMR(fs.readFileSync(mr,'utf8'));new vm.Script(code);fs.writeFileSync(mr,code);
 const server='dist/server/index.js';if(fs.existsSync(server)){
  let s=fs.readFileSync(server,'utf8');const m=s.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);if(!m)throw Error('HTML missing');s=s.replace(m[0],m[0].replace(m[2],Buffer.from(transformHtml(Buffer.from(m[2],'base64').toString())).toString('base64')));
  const re=/(const MR_VIEWER_BASE64 = ["'])([A-Za-z0-9+/=]+)(["'])/;if(!re.test(s))throw Error('MR bundle missing');s=s.replace(re,(_,a,b,z)=>a+Buffer.from(code).toString('base64')+z);fs.writeFileSync(server,s);
 }
 if(fs.existsSync('dist/index.html'))fs.writeFileSync('dist/index.html',transformHtml(fs.readFileSync('dist/index.html','utf8')));
 console.log('PASS v500: mirrored MR tray normals and selected Drive-In finishes.');
}
if(process.argv[1]?.endsWith('finishes-v500.mjs'))apply();
