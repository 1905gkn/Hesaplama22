import assert from 'node:assert/strict';
import {sealDetail,readDetail} from './rack-detail-snapshot-v135.mjs';
const original={b2b:{palletCount:3},levels:4,b2bLayout:{palletCount:3,palletWidth:800,palletDepth:1200,sectionWidth:2700,rowCount:2,rowGap:200}};
const saved=sealDetail(original,{b2b:{moduleCount:4,moduleOptions:[{palletCount:3,sectionWidth:2700}],palletCount:3,palletWidth:800,sectionWidth:2700,rowType:'double',footHeight:4900,traverseBottoms:[1300,2600,3900]}});
const narrow=structuredClone(saved);Object.assign(narrow.b2bLayout,{palletCount:2,sectionWidth:1825});
const view=readDetail(narrow,'b2b');assert.equal(view.sectionWidth,1825);assert.equal(view.palletCount,2);assert.equal(view.moduleCount,1);assert.equal(view.moduleOptions,null);assert.equal(view.footHeight,4900);assert.deepEqual(view.traverseBottoms,[1300,2600,3900]);assert.equal(readDetail(saved,'b2b').sectionWidth,2700);
narrow.b2bLayout.sectionWidth=2400;assert.equal(readDetail(narrow,'b2b').sectionWidth,2400);
console.log('PASS narrow copied bay overrides stale 2700/three-pallet snapshot, preserves heights and imported custom widths');
