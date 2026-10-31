import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {layoutSnapshot} from './layout-3d-data.mjs';

let active=null;
function makeViewer(host,data){
 const scene=new THREE.Scene();scene.background=new THREE.Color('#f0f5f3');
 const camera=new THREE.PerspectiveCamera(45,1,.05,10000),renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.domElement.setAttribute('aria-label','Serbest yerleşimin üç boyutlu önizlemesi');host.append(renderer.domElement);
 const controls=new OrbitControls(camera,renderer.domElement);controls.maxPolarAngle=Math.PI/2-.01;controls.screenSpacePanning=true;
 const geometries=[],materials=[],parts={pallet:[]},geometry=new THREE.BoxGeometry(1,1,1);geometries.push(geometry);
 const box=(key,r,x,y,z,w,h,d)=>{if(key==='blue')key=r.footColor;if(key==='yellow')key=r.beamColor;parts[key]||=[];const c=Math.cos(-r.angle),s=Math.sin(-r.angle);parts[key].push({x:r.x+x*c-z*s,y,z:r.z+x*s+z*c,w,h,d,angle:r.angle});};
 for(const r of data.racks){
  const rows=r.deep?1:r.rows,rowDepth=r.deep?r.depth:Math.min(r.frameDepth,(r.depth-r.rowGap*(rows-1))/rows),pitch=rowDepth+r.rowGap;
  for(let row=0;row<rows;row++){
   const z=rows===1?0:(row-(rows-1)/2)*pitch;
   const spans=r.deep?Math.max(1,Math.ceil(r.depth/r.footPitch)):1;
   for(let j=0;j<=(r.deep?spans:0);j++)for(const side of [-1,1]){
    const h=positiveHeight(r.frameHeights[row]?.[side===-1?'left':'right'],r.height),zz=r.deep?-r.depth/2+j*r.depth/spans:z;
    if(r.deep)box('blue',r,side*r.width/2,h/2,zz,.085,h,.085);
    else for(const edge of [-1,1])box('blue',r,side*r.width/2,h/2,z+edge*rowDepth/2,.085,h,.085);
    if(!r.deep)for(let k=.5;k<h;k+=1)box('blue',r,side*r.width/2,k,z,.05,.045,rowDepth);
   }
   for(const y of r.floors){
    if(y>.01)for(const edge of [-1,1])box('yellow',r,0,y,z+edge*rowDepth/2,r.width,.12,.065);
    if(r.deep){for(const side of [-.3,.3])box('yellow',r,side*r.width,y+.08,0,.065,.1,r.depth);}
    // Loads are optional so large layouts open with light geometry.
    const count=r.deep?Math.max(1,Math.floor(r.depth/1.25)):r.pallets;
    for(let k=0;k<count;k++){
     const x=r.deep?0:-r.width/2+(k+.5)*r.width/count,zz=r.deep?-r.depth/2+(k+.5)*r.depth/count:z;
     box('pallet',r,x,y+.08+r.palletHeight/2,zz,r.deep?r.width*.8:r.width/count*.85,r.palletHeight,r.deep?r.depth/count*.85:rowDepth*.9);
    }
   }
  }
 }
 const dummy=new THREE.Object3D(),palletMeshes=[];
 const colors={ral5010:'#005078',ral5015:'#287ab5',pgv:'#aeb8bd',galvanized:'#aeb8bd',ral1007:'#e5bd00',ral1023:'#f2c500',ral2004:'#e25318',pallet:'#cda86e'};
 for(const key of Object.keys(parts)){const color=colors[key]||'#176090';
  const list=parts[key],mat=new THREE.MeshStandardMaterial({color,roughness:.75});materials.push(mat);if(!list.length)continue;
  const mesh=new THREE.InstancedMesh(geometry,mat,list.length);list.forEach((v,i)=>{dummy.position.set(v.x,v.y,v.z);dummy.rotation.set(0,v.angle,0);dummy.scale.set(v.w,v.h,v.d);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix)});scene.add(mesh);if(key==='pallet'){mesh.visible=false;palletMeshes.push(mesh);}
 }
 const bounds=new THREE.Box3();for(const r of data.racks){const radius=Math.hypot(r.width,r.depth)/2;bounds.expandByPoint(new THREE.Vector3(r.x-radius,0,r.z-radius));bounds.expandByPoint(new THREE.Vector3(r.x+radius,r.height,r.z+radius));}for(const p of data.points)bounds.expandByPoint(new THREE.Vector3(p.x,0,p.z));
 const center=bounds.getCenter(new THREE.Vector3()),size=bounds.getSize(new THREE.Vector3()),span=Math.max(size.x,size.z,size.y,5);
 const grid=new THREE.GridHelper(Math.ceil(span*1.4),Math.min(200,Math.ceil(span*1.4)),0x9aafa7,0xd6e0db);grid.position.set(center.x,-.02,center.z);scene.add(grid);
 const vertices=[];for(let i=0;i<data.points.length;i++){const next=(i+1)%data.points.length;if((next===0&&!data.closed)||data.breaks.includes(i))continue;const a=data.points[i],b=data.points[next];vertices.push(a.x,.025,a.z,b.x,.025,b.z);}
 const outline=new THREE.BufferGeometry();outline.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometries.push(outline);const lineMat=new THREE.LineBasicMaterial({color:0x19533e});materials.push(lineMat);scene.add(new THREE.LineSegments(outline,lineMat));
 scene.add(new THREE.HemisphereLight(0xffffff,0x8a9c93,2.5));const sun=new THREE.DirectionalLight(0xffffff,2);sun.position.set(center.x+30,50,center.z+20);scene.add(sun);
 const render=()=>renderer.render(scene,camera),resize=()=>{const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false);render()};
 function fit(top=false){controls.target.copy(center);const distance=span/Math.tan(camera.fov*Math.PI/360)*.55/Math.min(1,camera.aspect);camera.position.copy(center).add(top?new THREE.Vector3(.001,distance,0):new THREE.Vector3(distance*.6,distance*.65,distance*.7));camera.far=Math.max(1000,distance*20);camera.updateProjectionMatrix();controls.update();render();}
 controls.addEventListener('change',render);const observer=new ResizeObserver(resize);observer.observe(host);resize();fit();
 return {fit,loads(value){palletMeshes.forEach(m=>m.visible=value);render()},dispose(){observer.disconnect();controls.dispose();geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());scene.traverse(o=>{if(o.isInstancedMesh)o.dispose()});renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove();}};
}
function positiveHeight(mm,fallback){return Number(mm)>0?Number(mm)/1000:fallback}
function snapshot(){return layoutSnapshot(m2LayoutState,r=>{if(!r.b2bLayout)return {};try{const o=m2Rack3DOptions(r);return window.rafexEndFrameOptions?.(r,o)||o}catch{return {}}})}
function open(){
 const data=snapshot();if(!data.racks.length){alert('Önce serbest yerleşime raf ekleyin.');return;}
 let dialog=document.getElementById('rafexLayout3DDialog');if(!dialog){dialog=document.createElement('dialog');dialog.id='rafexLayout3DDialog';dialog.setAttribute('aria-labelledby','rafexLayout3DTitle');dialog.innerHTML='<header><div><h2 id="rafexLayout3DTitle">Yerleşim 3D Görünümü</h2><p>Konum ve ölçülere göre yerleşim önizlemesi</p></div><button type="button" data-close aria-label="3D görünümü kapat">Kapat ×</button></header><nav><button type="button" data-fit>Tümünü sığdır</button><button type="button" data-top>Üstten görünüm</button><label><input type="checkbox" data-loads> Paletleri göster</label><span data-count></span></nav><div class="rafex-layout3d-stage"></div><footer>Sürükle: döndür · Tekerlek: yakınlaştır · Sağ tuş: kaydır · Telefonda iki parmakla yakınlaştır / kaydır</footer>';document.body.append(dialog);dialog.querySelector('[data-close]').onclick=()=>dialog.close();dialog.addEventListener('close',()=>{active?.dispose();active=null});dialog.querySelector('[data-fit]').onclick=()=>active?.fit();dialog.querySelector('[data-top]').onclick=()=>active?.fit(true);dialog.querySelector('[data-loads]').onchange=e=>active?.loads(e.target.checked);}
 dialog.querySelector('[data-loads]').checked=false;dialog.querySelector('[data-count]').textContent=data.racks.length+' raf modülü';dialog.showModal();try{active=makeViewer(dialog.querySelector('.rafex-layout3d-stage'),data)}catch(e){active?.dispose();active=null;dialog.close();alert('3D görünüm açılamadı. Tarayıcınızda donanım hızlandırmasını kontrol edin.');console.error(e)}
}
window.rafexOpenLayout3D=open;
document.addEventListener('click',e=>{if(e.target.closest('[data-layout-3d]'))open()});
