import assert from 'node:assert/strict';
import {pngDimensions} from '../client/pdf-raster-reader.mjs';
const bytes=new Uint8Array(24);bytes.set([137,80,78,71,13,10,26,10],0);bytes.set([73,72,68,82],12);const v=new DataView(bytes.buffer);v.setUint32(16,2292);v.setUint32(20,491);
assert.deepEqual(pngDimensions(bytes),{width:2292,height:491});
assert.throws(()=>pngDimensions(bytes.slice(0,12)),/Geçerli/);const wrong=bytes.slice();wrong[0]=0;assert.throws(()=>pngDimensions(wrong),/Geçerli/);
v.setUint32(16,16001);assert.throws(()=>pngDimensions(bytes),/32 milyon/);v.setUint32(16,8000);v.setUint32(20,8000);assert.throws(()=>pngDimensions(bytes),/32 milyon/);v.setUint32(16,0);assert.throws(()=>pngDimensions(bytes),/32 milyon/);
console.log('PASS PNG signature, dimensions, invalid files and decompressed image limits.');
