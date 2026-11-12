import assert from 'node:assert/strict';import vm from 'node:vm';import {transform} from './consistent-preview-v527.mjs';
const html=`<body><script>function height(rows,gap,profiles,manual){let h={value:manual};let mode={value:manual?'manual':'auto'};let el=id=>({value:profiles[id]});let computed=rows?rows.reduce((sum,r)=>sum+r.distance,0)+Number(gap.value):0;if(mode.value==='auto')h.value=String(computed);return h.value;}</script></body>`;
const result=transform(html),js=result.match(/<script>([\s\S]*?)<\/script>/)[1],height=vm.runInNewContext(js+';height');
const rows=Array.from({length:4},()=>({distance:1000})),gap={value:1000};
assert.equal(height(rows,gap,{konsolArmProfile:'npi80',konsolUprightProfile:'ipe160'},null),'5500');
assert.equal(height(rows,gap,{konsolArmProfile:'npi80',konsolUprightProfile:'ipe80'},null),'5400');
assert.equal(height(rows,gap,{konsolArmProfile:'npi80',konsolUprightProfile:'ipe160'},'5750'),'5750');
assert.equal(height(rows,{value:1020},{konsolArmProfile:'npi80',konsolUprightProfile:'ipe160'},null),'5500');
assert.equal(height(rows,{value:1021},{konsolArmProfile:'npi80',konsolUprightProfile:'ipe160'},null),'5550');
console.log('PASS actual height patch: profile thickness, upward 50mm rounding, boundary and manual height preservation');

