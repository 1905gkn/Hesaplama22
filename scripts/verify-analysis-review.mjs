import assert from 'node:assert/strict';
import {reviewAnswers} from '../client/pdf-analysis-review.mjs';
const audit={quantities:[{name:'A',detected:2474,capacity:44532},{name:'A1',detected:118,capacity:1062},{name:'B',detected:90,capacity:1620},{name:'B1',detected:6,capacity:54}],schedule:[{name:'A',palletsPerBay:18,palletLevels:9},{name:'A1',palletsPerBay:9,palletLevels:9},{name:'B',palletsPerBay:18,palletLevels:9},{name:'B1',palletsPerBay:9,palletLevels:9}]};
const answers={beams:'7',stack:'2',gap:'200',reviewed:true};
assert.equal(reviewAnswers(audit,answers).capacity,47268);
assert(reviewAnswers(audit,answers).quantities.every(q=>q.difference===0));
assert.equal(reviewAnswers(audit,{...answers,stack:'1'}).capacity,42016);
for(const key of ['beams','stack','gap'])assert.throws(()=>reviewAnswers(audit,{...answers,[key]:''}));
assert.throws(()=>reviewAnswers(audit,{...answers,reviewed:false}));
assert.throws(()=>reviewAnswers(audit,{...answers,beams:'7.5'}));
console.log('PASS: explicit answers required, stacked ground capacity 47268, single ground 42016, missing answers and unreviewed values blocked.');
if(process.argv.includes('--browser')){
 const {createRequire}=await import('node:module'),fs=await import('node:fs');
 const {chromium}=createRequire(import.meta.url)('playwright'),browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  const page=await browser.newPage({serviceWorkers:'block'});
  await page.route('**/*',r=>r.fulfill({contentType:r.request().url().endsWith('.mjs')?'application/javascript':'text/html',body:r.request().url().endsWith('.mjs')?fs.readFileSync('client/pdf-analysis-review.mjs','utf8'):'<main id="review"></main>'}));
  await page.goto('https://review.test');
  await page.evaluate(async audit=>{const {renderReview}=await import('/review.mjs');window.item={audit:{...audit,scale:1,bays:[{cx:10,cy:10,depth:5,top:5,bottom:15,type:'A'}]}};window.accepted=[];renderReview(document.querySelector('main'),item,a=>accepted.push(a));},audit);
  await page.locator('[data-selective-prepare]').click();assert.equal(await page.evaluate(()=>accepted.length),0);
  await page.locator('[data-analysis-answer="beams"]').fill('7');await page.locator('[data-analysis-answer="stack"]').selectOption('2');await page.locator('[data-analysis-answer="gap"]').fill('200');
  assert((await page.locator('[role=status]').textContent()).includes('47268'));
  await page.locator('[data-analysis-reviewed]').check();await page.locator('[data-selective-prepare]').click();assert.equal(await page.evaluate(()=>accepted[0].capacity),47268);
  await page.locator('[data-analysis-answer="stack"]').selectOption('1');assert.equal(await page.locator('[data-analysis-reviewed]').isChecked(),false);assert((await page.locator('[role=status]').textContent()).includes('42016'));
  assert.equal(await page.locator('svg rect').count(),1);console.log('PASS browser: questions, live comparison, explicit review, changed-answer invalidation, source map.');
 }finally{await browser.close();}
}
