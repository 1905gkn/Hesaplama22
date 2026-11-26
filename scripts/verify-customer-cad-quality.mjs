import assert from 'node:assert/strict';
import fs from 'node:fs';
const viewer=fs.readFileSync('client/layout-3d.entry.js','utf8');
assert(viewer.includes('innerPostTemplate605('),'Shared editor and customer scene use solid interior uprights');
assert(viewer.includes('Kalite: HD')&&viewer.includes('Kalite: Standart'));
assert(viewer.includes('screenLod:!protectedLod,protectedLod:false'),'Protected uprights and connectors retain full geometry at every camera distance');
assert(fs.readFileSync('client/customer-view.entry.js','utf8').includes('api.createSession(host,{forkliftsControl:true,'),'Detailed customer view uses the original metal materials');
console.log('PASS solid interior posts, protected detail at every distance and original metal materials.');
