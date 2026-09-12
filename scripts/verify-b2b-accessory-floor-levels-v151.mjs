import fs from 'node:fs';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import vm from 'node:vm';

const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE_PATH||'playwright');
const html=fs.readFileSync('.tmp-v109/build/dist/index.html','utf8');
assert(html.includes('/* b2b-accessory-floor-levels-v151 */'));
assert(!html.includes('[0, 250].forEach((baseHeight, groundIndex)'));
assert(html.includes("stop.name = 'Palet Dayama K1'"));
assert(html.includes("numericLevel>=this.options.levels"));
const placementStart=html.indexOf('  const palletHeightAt='),placementEnd=html.indexOf('  function currentAccessoryRows(',placementStart);
assert(placementStart>0&&placementEnd>placementStart);
const placementContext=vm.createContext({});
vm.runInContext(html.slice(placementStart,placementEnd)+';globalThis.place=visibleAccessoryPlacements',placementContext);
const placement=(position,type,levels)=>placementContext.place({levels:5,b2b:{levels:5,firstPalletPosition:position,palletHeight:1200,traverseHeight:140,palletTraverseGap:200}},{type,levels});
assert.equal(placement('ground','palletStop',[0,1,2,3,4,5]).length,5);
assert.equal(placement('ground','hTraverse',[1,2,3,4,5]).length,4);
assert.equal(placement('ground','tray',[1,2,3,4,5]).length,4);
assert.equal(placement('traverse','palletStop',[1,2,3,4,5]).length,5);
assert.equal(placement('traverse','hTraverse',[1,2,3,4,5]).length,5);
assert.equal(placement('traverse','tray',[1,2,3,4,5]).length,5);
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[],writes=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.route('**/*',route=>{
    const path=new URL(route.request().url()).pathname;
    if(route.request().method()!=='GET')writes.push(path);
    if(path==='/')return route.fulfill({contentType:'text/html',body:html});
    if(path==='/api/bootstrap')return route.fulfill({json:{needsSetup:false}});
    if(path==='/api/me')return route.fulfill({json:{user:{id:1,fullName:'Test',username:'test',role:'super',defaultLanguage:'tr',allowed_modules:['free','b2b','mr','drive','mekik2','konsol']}}});
    if(path.startsWith('/api/'))return route.fulfill({json:{rows:[],types:[],rackTypes:[],projects:[],settings:{}}});
    return route.fulfill({contentType:'application/javascript',body:''});
  });
  await page.goto('https://rafex.test/');
  await page.waitForTimeout(1200);
  await page.addStyleTag({content:'#b2b3DLoading{display:none!important;pointer-events:none!important}'});
  await page.locator('#nav button[data-page="b2b"]').click();
  await page.waitForTimeout(700);
  await page.locator('#b2bLevels').fill('5');

  const check=async(position,expectedStop,expectedH,expectedTray)=>{
    await page.evaluate(value=>{
      document.getElementById('b2bFirstPalletPosition').value=value;
      b2bApplyInputs({target:document.getElementById('b2bFirstPalletPosition'),accessoryChange:true});
      rafexAccessoryRemove(2);rafexAccessoryRemove(1);rafexAccessoryRemove(0);
      rafexAccessoryAdd('palletStop');rafexAccessoryAdd('hTraverse');rafexAccessoryAdd('tray');
    },position);
    const cards=page.locator('#b2bAccessoryList .b2b-accessory-card');
    assert.deepEqual(await cards.nth(0).locator('.b2b-accessory-levels button').allTextContents(),expectedStop);
    assert.deepEqual(await cards.nth(1).locator('.b2b-accessory-levels button').allTextContents(),expectedH);
    assert.deepEqual(await cards.nth(2).locator('.b2b-accessory-levels button').allTextContents(),expectedTray);
    await cards.nth(0).getByRole('button',{name:'Tüm Katlar',exact:true}).click();
    await cards.nth(1).getByRole('button',{name:'Tüm Katlar',exact:true}).click();
    await cards.nth(2).getByRole('button',{name:'Tüm Katlar',exact:true}).click();
    return page.evaluate(()=>b2b3DOptions().accessories.map(item=>({type:item.type,levels:item.levels})));
  };

  const ground=await check('ground',['K1','K2','K3','K4','K5'],['K2','K3','K4','K5'],['K2','K3','K4','K5']);
  assert.deepEqual(ground,[{type:'palletStop',levels:[0,1,2,3,4]},{type:'hTraverse',levels:[1,2,3,4]},{type:'tray',levels:[1,2,3,4]}]);
  const traverse=await check('traverse',['K1','K2','K3','K4','K5'],['K1','K2','K3','K4','K5'],['K1','K2','K3','K4','K5']);
  assert.deepEqual(traverse,[{type:'palletStop',levels:[1,2,3,4,5]},{type:'hTraverse',levels:[1,2,3,4,5]},{type:'tray',levels:[1,2,3,4,5]}]);
  assert.deepEqual(errors,[]);assert.deepEqual(writes,[]);
  console.log(JSON.stringify({ground,traverse,errors,writes}));
}finally{await browser.close()}
