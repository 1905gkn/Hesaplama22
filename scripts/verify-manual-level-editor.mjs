import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {manualRuntime} from './b2b-manual-height-v121.mjs';
const {chromium}=createRequire(import.meta.url)('playwright');
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.setContent(`<input id="m2CustomizeLevels" value="3" max="8"><input id="m2CustomizePalletHeight" value="1200"><input id="m2CustomizeManualLevels" type="checkbox"><script>
 var rack={id:1,levels:3,palletWeight:1000,b2b:{firstPalletPosition:'ground',footHeightMode:'manual'}};
 var m2LayoutState={racks:[rack]};var b2bLastPalletOverlap=600;
 function b2bReadInputState(){return {levels:3}}function b2bApplySavedInputState(){}function b2bVerticalLayout(){return {}}function b2bFootCalculationInputs(){return {}}function b2bApplyInputs(){}
 function b2b3DOptions(){return {levels:Number(document.getElementById('m2CustomizeLevels').value),firstPalletPosition:rack.b2b.firstPalletPosition,firstFloorGap:200,palletCount:3,palletHeight:1200,traverseHeight:140,footHeight:9000,sectionWidth:2700}}
 window.rafexB2BCustomizeOptionsV120=b2b3DOptions;
 </script>${manualRuntime}`);
 await page.evaluate(()=>{rafexLoadManualCustomizeV121(rack);rafexOpenManualHeightV121('custom');});
 const rows=page.locator('.level-row');assert.equal(await rows.count(),3);
 await rows.nth(1).locator('[data-weight]').fill('4321');
 await page.locator('[data-insert-level]').selectOption('1');await page.locator('[data-add-level]').click();
 assert.equal(await rows.count(),4);assert.equal(await rows.nth(2).locator('[data-weight]').inputValue(),'4321');
 await page.locator('[data-cancel]').click();assert.equal(await page.locator('#m2CustomizeLevels').inputValue(),'3');
 await page.evaluate(()=>rafexOpenManualHeightV121('custom'));
 assert.equal(await rows.count(),3);
 await page.locator('[data-add-level]').click();assert.equal(await rows.count(),4);
 await page.locator('[data-save]').click();assert.equal(await page.locator('#m2CustomizeLevels').inputValue(),'4');
 await page.evaluate(()=>rafexSaveManualV121(rack));assert.equal(await page.evaluate(()=>rack.b2b.manualLevelSpecs.length),4);
 await page.evaluate(()=>rafexOpenManualHeightV121('custom'));
 await rows.nth(1).locator('[data-remove-level]').click();assert.equal(await rows.count(),3);
 assert.equal(await rows.first().locator('[data-remove-level]').isDisabled(),true);
 await page.locator('[data-save]').click();assert.equal(await page.locator('#m2CustomizeLevels').inputValue(),'3');
 await page.evaluate(()=>rafexOpenManualHeightV121('custom'));
 for(let i=0;i<5;i++)await page.locator('[data-add-level]').click();
 assert.equal(await page.locator('[data-add-level]').isDisabled(),true);
 await page.locator('[data-save]').click();assert.match(await page.locator('.error').textContent(),/ayak boyunu aşıyor/);
 assert.equal(await page.locator('#m2CustomizeLevels').inputValue(),'3');
 await page.locator('[data-cancel]').click();
 assert.deepEqual(errors,[]);
 console.log('PASS: insert between levels/at top, preserve edited rows, cancel, apply count, persisted manual specs, remove and ground protection.');
}finally{await browser.close();}
