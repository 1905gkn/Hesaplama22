import assert from 'node:assert/strict';
import {completeCustomerPlan} from '../client/customer-plan.mjs';
const racks=Array.from({length:288},(_,i)=>({id:i,name:i===0?'<script>bad</script>':'A',system:'mr',x:(i%16)*3,z:Math.floor(i/16)*5,angle:i%2?Math.PI/2:0,width:2.4,depth:.8,height:3.5,foot:.06,beam:.085,modules:1,floors:[.2,1.2,2.2],accessories:[{type:'tray',levels:[1,2,3]}],typeColor:'#194f39'}));
const data={racks,points:[],symbols:[],floorLoops:[],wallSegments:[],wallless:true,visibleClearances:[{a:[0,0,0],b:[2,0,0],label:'2.000 mm'}]},before=JSON.stringify(data),svg=completeCustomerPlan(data);
assert.equal((svg.match(/data-rack-id=/g)||[]).length,288,'Every saved rack is rendered independently of camera/viewport');
assert(!svg.includes('<script>'));assert(svg.includes('&lt;script&gt;'));assert(svg.includes('2.000 mm'),'Saved measurements retained');
const [x,z,w,h]=svg.match(/viewBox="([^"]+)/)[1].split(' ').map(Number);assert(x<0&&z<0&&x+w>46&&z+h>85,'Full rotated rack extent and bottom row fit inside padded viewBox');assert.equal(JSON.stringify(data),before,'Read-only share data is unchanged');assert.equal(completeCustomerPlan({racks:[]}),null);
console.log('PASS complete customer plan: 288 racks, rotated bottom/right bounds, saved measurements, escaped text and unchanged source.');
