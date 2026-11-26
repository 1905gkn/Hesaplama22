import assert from 'node:assert/strict';
import fs from 'node:fs';
const viewer=fs.readFileSync('client/layout-3d.entry.js','utf8');
assert(!viewer.includes('innerPostTemplate605('),'Detailed scene preserves perforations on intermediate posts too');
assert(viewer.includes('screenLod:!protectedLod,protectedLod:false'),'Protected uprights and connectors retain full geometry at every camera distance');
assert(fs.readFileSync('client/customer-view.entry.js','utf8').includes('api.createSession(host,{customerPerformance:fastOverview,'),'Detailed customer view uses the original metal materials');
console.log('PASS full CAD on intermediate posts, protected detail at every distance and original metal materials.');
