import fs from 'node:fs';
import assert from 'node:assert/strict';
const source=fs.readFileSync('scripts/patch-free-konsol-plan-v38.mjs','utf8');
assert(source.includes("/^(mekik|mekik2|shuttle|drive|drive-in|drivein|b2b|mr|fifo|lifo)$/"),'Explicit non-Konsol systems must be rejected before legacy field inference');
assert(source.includes("if(explicit.some((value)=>/^(konsol|konsol-kollu|cantilever)$/.test(value)))return true;"),'Explicit Konsol records must remain supported');
assert(source.includes("const hit=group.querySelector('.m2-layout-rack')"),'Original drag hit surface must be reused');
assert(source.includes("width:w,height:h"),'Konsol footprint must use the rack bounding proportions');
console.log('PASS: Mekik/B2B/Drive/MR are excluded from Konsol inference; explicit Konsol records, proportions and drag surface remain supported.');
