import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const source=fs.readFileSync('client/layout-3d.entry.js','utf8'),fn=source.match(/ function movement580\(\)\{[^\n]+\}/)?.[0];assert(fn);
let time=100,sequence=0,renders=0;const timers=new Map();
const api=vm.runInNewContext('let motionUntil580=0,motionTimer580=0;'+fn+';({move:movement580,until:()=>motionUntil580})',{performance:{now:()=>time},setTimeout:(run,delay)=>{assert.equal(delay,180);timers.set(++sequence,run);return sequence},clearTimeout:id=>timers.delete(id),render:()=>renders++});
api.move();assert.equal(api.until(),260);time=140;api.move();assert.equal(api.until(),300);assert.equal(timers.size,1);timers.values().next().value();assert.equal(api.until(),0);assert.equal(renders,3);
assert(source.includes('clearTimeout(motionTimer580);motionUntil580=0;'));assert(source.includes('maxPixelError:performance.now()<motionUntil580?1.25:.35'));
console.log('PASS camera motion restarts one settle timer, settled camera restores refined detail, inactive scenes clear the timer.');
