import assert from 'node:assert/strict';import fs from 'node:fs';
import {customerRackDistance,customerWallDistance,savedCustomerMeasures} from '../client/customer-distance.mjs';
const rack=(id,x,z=0,angle=0)=>({id,name:id,x,z,angle,system:'mr',width:2,depth:1,height:3,levels:2,foot:.06,beam:.07,modules:1,floors:[.2,1.2],palletHeights:[1,1],accessories:[]});
const data={racks:[rack('A',0),rack('B',5)],gapBasis:'Raftan rafa',visibleClearances:[],clearancesByRack:{A:[{key:'wall:A:left',kind:'wall',label:'999 mm',a:[-2,.12,0],b:[-1,.12,0]}]}};
const source=JSON.stringify(data);assert.deepEqual(savedCustomerMeasures(data),[],'Never show automatically computed clearances');
assert.equal(customerRackDistance(data,'A','B').mm,3000);assert.equal(customerRackDistance(data,'B','A').mm,3000);assert.equal(customerRackDistance(data,'A','A'),null);
data.racks[1]=rack('B',5,0,Math.PI/2);assert.equal(customerRackDistance(data,'A','B').mm,3500);
data.racks[1]=rack('B',3,2);assert.equal(customerRackDistance(data,'A','B').mm,1414);
data.racks[1]=rack('B',0);assert.equal(customerRackDistance(data,'A','B').mm,0);
const b2b={...rack('A',0),system:'b2b',rows:2,rowGap:.2,frameDepth:1.1,depth:2.4,palletDepth:1.2,palletWidth:.8,pallets:2,frameHeights:[],beamYs:[null,1.1],collectionFloors:[]};
const double={racks:[b2b,{...structuredClone(b2b),id:'B',z:5}],gapBasis:'Raftan rafa'};assert.equal(customerRackDistance(double,'A','B').mm,2600);
double.gapBasis='Paletten palete';assert.equal(customerRackDistance(double,'A','B').mm,2500);
const saved={key:'pair:A:B',kind:'pair',rackIds:['A','B'],mm:2222,label:'2.222 mm',a:[0,.12,0],b:[2.222,.12,0]};double.clearancesByRack={A:[saved]};assert.equal(customerRackDistance(double,'A','B').mm,2222,'Keep original plan measurement formula when available');assert.deepEqual(savedCustomerMeasures(double),[]);
double.visibleClearances=[saved];assert.equal(savedCustomerMeasures(double).length,1);assert.equal(JSON.stringify(saved).includes('requested'),false);
assert.equal(JSON.parse(source).racks[1].x,5);
const wallData={...double,wallSegments:[{a:{x:-10,z:5},b:{x:10,z:5}}],points:[],symbols:[]};
assert.equal(customerWallDistance(wallData,'A',0,'Raftan rafa').mm,3680);
assert.equal(customerWallDistance(wallData,'A',0,'Paletten palete').mm,3630);
assert.equal(customerWallDistance(wallData,'missing',0),null);
assert.equal(customerWallDistance(wallData,'A',999),null);
assert.equal(customerRackDistance(double,'A','B','Raftan rafa').mm,2600,'Explicit frame basis bypasses saved pallet relation');
const page=fs.readFileSync(new URL('./customer-view-page.mjs',import.meta.url),'utf8'),runtime=fs.readFileSync(new URL('../client/customer-view.entry.js',import.meta.url),'utf8');assert.ok(page.includes('Arasını Hesapla'));assert.ok(!page.includes('id="wallGaps"'));assert.ok(!page.includes('id="gaps"'));assert.ok(runtime.includes('savedMeasuresOnly:true'));assert.ok(!runtime.includes('const all=new Map(Object.values(data.clearancesByRack'));
console.log('PASS: saved-only dimensions; same/reversed/rotated/diagonal/overlapping racks; double-row frame vs pallet gap; original plan relations; read-only measurement UI');


