import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {buildNavigation,createTraffic} from './forklift-navigation.mjs';

// Detailed geometry is merged once per finish; each vehicle only updates a
// handful of instance matrices. No textures, lights, shadows or pixel-ratio changes.
export function createForkliftFleet(scene,traffic){
 const group=new THREE.Group();group.name='Automatic forklifts';scene.add(group);
 const pools=new Map(),materials=new Map(),geometries=[],batches=[],dummy=new THREE.Object3D(),root=new THREE.Object3D(),matrix=new THREE.Matrix4();
 const prototypes={box:new THREE.BoxGeometry(1,1,1),round:new RoundedBoxGeometry(1,1,1,3,.12),sphere:new THREE.SphereGeometry(.5,12,8),cylinder:new THREE.CylinderGeometry(1,1,1,12),torus:new THREE.TorusGeometry(1,.065,6,20)};
 const finishes={yellow:[0xe4ad13,.53,.18],frame:[0x2a3135,.62,.22],metal:[0x8c999f,.43,.65],rubber:[0x232528,.96,0],blue:[0x244d70,.88,0],skin:[0xbc906d,.92,0],red:[0xc94837,.6,.05],lamp:[0xf3e3ba,.5,.05]};
 function material(key){if(!materials.has(key)){const [color,roughness,metalness]=finishes[key];materials.set(key,new THREE.MeshStandardMaterial({color,roughness,metalness}));}return materials.get(key);}
 function bake(geometry,x,y,z,w=1,h=1,d=1,rx=0,ry=0,rz=0){dummy.position.set(x,y,z);dummy.rotation.set(rx,ry,rz);dummy.scale.set(w,h,d);dummy.updateMatrix();const g=geometry.index?geometry.toNonIndexed():geometry.clone();g.applyMatrix4(dummy.matrix);return g;}
 function add(key,shape,x,y,z,w,h,d,rx=0,ry=0,rz=0){if(!pools.has(key))pools.set(key,[]);pools.get(key).push(bake(prototypes[shape],x,y,z,w,h,d,rx,ry,rz));}
 const box=(key,...p)=>add(key,'box',...p),round=(key,...p)=>add(key,'round',...p);
 function rod(key,a,b,r){const direction=new THREE.Vector3().subVectors(new THREE.Vector3(...b),new THREE.Vector3(...a)),q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),direction.clone().normalize()),m=new THREE.Matrix4().compose(new THREE.Vector3(...a).add(new THREE.Vector3(...b)).multiplyScalar(.5),q,new THREE.Vector3(r,direction.length(),r));const g=prototypes.cylinder.toNonIndexed().applyMatrix4(m);if(!pools.has(key))pools.set(key,[]);pools.get(key).push(g);}
 // Rounded chassis, counterweight, access step and battery cover.
 round('yellow',-.08,.39,0,1.65,.40,1.05);round('yellow',-.57,.66,0,.65,.74,1.04);round('yellow',-.25,.81,0,.72,.12,.89);
 box('frame',.11,.69,0,.88,.08,.86);box('metal',.02,.58,-.48,.62,.045,.20);box('metal',.02,.58,.48,.62,.045,.20);
 round('frame',-.36,.98,0,.48,.13,.56);round('frame',-.59,1.22,0,.14,.46,.56,0,0,-.10);
 // Rear grille, vents and tail lamps.
 box('frame',-.903,.65,0,.022,.28,.65);for(let i=0;i<5;i++)box('metal',-.917,.55+i*.045,0,.014,.012,.55);
 for(const z of [-.37,.37]){round('red',-.91,.86,z,.03,.08,.13);box('frame',-.52,.55,z<0?-.535:.535,.42,.10,.02);}
 // Overhead guard, five roof bars, mirrors and work lamps.
 for(const x of [-.78,.43])for(const z of [-.48,.48])box('frame',x,1.49,z,.065,1.39,.065);
 for(const z of [-.51,.51])round('frame',-.17,2.20,z,1.42,.095,.10);
 for(const x of [-.8,-.48,-.16,.16,.47])box('frame',x,2.20,0,.06,.07,1.02);
 for(const z of [-.43,.43]){round('lamp',.48,2.10,z,.11,.11,.13);box('frame',.41,1.95,z<0?-.57:.57,.07,.16,.07);}
 box('frame',-.65,2.27,0,.16,.04,.16);add('yellow','sphere',-.65,2.34,0,.14,.14,.14);
 // Duplex mast, slide rails, hydraulic cylinder, chains and fork carriage.
 for(const z of [-.38,.38]){box('frame',.64,1.28,z,.13,2.22,.12);box('metal',.72,1.04,z,.055,1.66,.055);box('frame',.69,1.35,z*.63,.035,1.58,.025);for(let j=0;j<12;j++)box('metal',.715,.64+j*.11,z*.63,.015,.035,.028);}
 box('frame',.64,2.36,0,.14,.09,.87);box('frame',.76,.42,0,.13,.23,.91);box('metal',.84,.49,0,.04,.045,.88);
 rod('metal',[.55,.3,0],[.55,1.22,0],.047);rod('metal',[.55,1.20,0],[.55,1.88,0],.025);
 rod('frame',[.51,.65,-.13],[.51,1.75,-.13],.018);rod('frame',[.51,.65,.13],[.51,1.75,.13],.018);
 const forkShape=new THREE.Shape();forkShape.moveTo(0,0);forkShape.lineTo(0,.07);forkShape.lineTo(.66,.055);forkShape.lineTo(.74,.025);forkShape.lineTo(.74,0);forkShape.closePath();
 const forkGeometry=new THREE.ExtrudeGeometry(forkShape,{depth:.11,bevelEnabled:false,steps:1});
 for(const z of [-.25,.25]){box('metal',.79,.40,z,.085,.54,.11);if(!pools.has('metal'))pools.set('metal',[]);pools.get('metal').push(bake(forkGeometry,.78,.12,z-.055));}forkGeometry.dispose();
 // Steering wheel, console and seated operator.
 round('frame',.29,.91,0,.21,.26,.53);rod('metal',[.28,.90,0],[.28,1.22,0],.025);add('frame','torus',.28,1.23,0,.18,.18,.18,0,Math.PI/2,0);
 round('blue',-.34,1.30,0,.38,.57,.43,0,0,.09);add('skin','sphere',-.31,1.73,0,.31,.33,.29);add('yellow','sphere',-.31,1.86,0,.35,.18,.34);
 for(const sign of [-1,1]){rod('blue',[-.29,1.46,sign*.22],[.01,1.22,sign*.26],.075);rod('blue',[.01,1.22,sign*.26],[.25,1.22,sign*.17],.060);add('skin','sphere',.25,1.22,sign*.17,.12,.12,.12);rod('blue',[-.32,1.04,sign*.13],[.10,.79,sign*.15],.085);rod('blue',[.10,.79,sign*.15],[.20,.59,sign*.15],.065);round('frame',.27,.56,sign*.15,.25,.12,.17);}
 function merged(list){const g=mergeGeometries(list,false);list.forEach(p=>p.dispose());geometries.push(g);return g;}
 for(const [key,list] of pools){const mesh=new THREE.InstancedMesh(merged(list),material(key),traffic.agents.length);mesh.frustumCulled=false;mesh.name='forklift-'+key;group.add(mesh);batches.push({mesh,wheels:false});}
 // Rounded tyres, side walls and five-bolt hubs. Two shared wheel geometries
 // roll with signed travel, including reversing down a narrow aisle.
 const tyre=[],hub=[];tyre.push(bake(prototypes.cylinder,0,0,0,.97,.60,.97,Math.PI/2));
 const wall=new THREE.TorusGeometry(.81,.16,6,20);for(const z of [-.24,.24])tyre.push(bake(wall,0,0,z));wall.dispose();
 for(let i=0;i<18;i++){const a=i*Math.PI/9;tyre.push(bake(prototypes.box,.97*Math.cos(a),.97*Math.sin(a),0,.18,.045,.58,0,0,a-Math.PI/2));}
 hub.push(bake(prototypes.cylinder,0,0,0,.43,.77,.43,Math.PI/2));for(const z of [-.40,.40])for(let i=0;i<5;i++){const a=i*Math.PI*2/5;hub.push(bake(prototypes.cylinder,.28*Math.cos(a),.28*Math.sin(a),z,.055,.045,.055,Math.PI/2));}
 for(const [key,list] of [['rubber',tyre],['metal',hub]]){const mesh=new THREE.InstancedMesh(merged(list),material(key),traffic.agents.length*4);mesh.frustumCulled=false;mesh.name='forklift-wheels-'+key;group.add(mesh);batches.push({mesh,wheels:true});}
 Object.values(prototypes).forEach(g=>g.dispose());
 const wheels=[[-.61,.24,-.49,.22],[-.61,.24,.49,.22],[.48,.30,-.49,.28],[.48,.30,.49,.28]];
 function update(){for(const {mesh,wheels:wheelBatch} of batches){let index=0;for(const a of traffic.agents){root.position.set(a.x,0,a.z);root.rotation.set(0,a.angle,0);root.updateMatrix();if(!wheelBatch){mesh.setMatrixAt(index++,root.matrix);continue;}for(const [x,y,z,r] of wheels){dummy.position.set(x,y,z);dummy.rotation.set(0,0,-(a.wheelTravel||0)/r);dummy.scale.setScalar(r);dummy.updateMatrix();mesh.setMatrixAt(index++,matrix.multiplyMatrices(root.matrix,dummy.matrix));}}mesh.instanceMatrix.needsUpdate=true;}}
 update();return {group,agents:traffic.agents,update,dispose(){group.removeFromParent();for(const {mesh} of batches)mesh.dispose();for(const m of materials.values())m.dispose();geometries.forEach(g=>g.dispose());}};
}
export async function prepareForklifts(scene,data,parts,cancelled){const nav=await buildNavigation(data,parts,{cancelled,yieldTask:()=>new Promise(resolve=>setTimeout(resolve,0))});if(cancelled()||!nav)return null;const traffic=createTraffic(nav,Math.min(3,Math.max(1,Math.ceil(data.racks.length/100))));if(!traffic.agents.length)return null;const fleet=createForkliftFleet(scene,traffic);return {...fleet,count:traffic.agents.length,tick(dt){traffic.step(dt);fleet.update();}};}

