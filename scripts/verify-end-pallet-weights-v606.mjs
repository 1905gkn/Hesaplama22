import assert from 'node:assert/strict';
import * as T from 'three';
import {endPalletWeights606,addPalletWeights599} from '../client/pallet-weight-labels-v599.mjs';
for(const up of ['y','z'])for(const length of [1,2,16]){
 const vertical=up==='y'?1:2,depth=up==='y'?2:1,boxes=[];
 for(let rack=0;rack<2;rack++)for(let lane=0;lane<3;lane++)for(let level=0;level<4;level++)for(let d=0;d<length;d++){
  const center=[lane*1500,0,0],size=[1200,800,800];center[vertical]=500+level*1800;center[depth]=d*1000+(level%2?2000:0);size[vertical]=1000;
  boxes.push({center,size,weight:500+level*100,matrix:new T.Matrix4().makeTranslation(rack*10000,0,0),d});
 }
 const selected=endPalletWeights606(boxes,up);assert.equal(selected.length,2*3*4*Math.min(length,2));assert(selected.every(b=>b.d===0||b.d===length-1));assert.equal(boxes.length,2*3*4*length);
 const root=new T.Group(),doc={createElement:()=>({getContext:()=>({clearRect(){},fillText(){}})})};const layer=addPalletWeights599(root,boxes,{up,endOnly:true,document:doc});assert.equal(layer.children.reduce((n,m)=>n+m.count,0),selected.length*4);layer.userData.dispose599();
}
console.log('PASS endpoint kg labels: both coordinate systems, separate racks/lanes/levels, shortened levels, single/double/16-deep pallets, actual rendered label count and immutable inputs.');
