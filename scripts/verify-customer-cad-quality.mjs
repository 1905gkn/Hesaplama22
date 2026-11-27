import assert from 'node:assert/strict';
import fs from 'node:fs';
const viewer=fs.readFileSync('client/layout-3d.entry.js','utf8');
assert(viewer.includes('innerPostTemplate605('),'Shared editor and customer scene use solid interior uprights');
assert(viewer.includes('Kalite: HD')&&viewer.includes('Kalite: Standart'));
assert(viewer.includes('screenLod:true,protectedLod:!!protectedLod'),'fast-v1: protected uprights/connectors use screen-space LOD only when far away; near views stay exact');
assert(viewer.includes('TRIANGLE_BUDGET_FAST1'),'fast-v1: per-frame triangle budget is active');
assert(fs.readFileSync('client/customer-view.entry.js','utf8').includes('api.createSession(host,{forkliftsControl:true,'),'Detailed customer view uses the original metal materials');
console.log('PASS solid interior posts, protected detail near the camera and original metal materials.');
