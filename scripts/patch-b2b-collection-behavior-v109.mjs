import fs from 'node:fs';
import vm from 'node:vm';
import {pathToFileURL} from 'node:url';

export const helpers=String.raw`
      function b2bCollectionPlanV109(state={}) {
        const collection=state.collectionLevels;
        if(!collection?.enabled)return {floors:[],totalHeight:0};
        let cursor=Math.max(0,Number(collection.groundGap)||0);
        const floors=(collection.floors||[]).map((floor,index)=>{
          const zsHeight=({ZS35:55,ZS55:75,ZS65:85})[String(floor.traverse).split('|')[0]]||55;
          const bottom=cursor;cursor+=zsHeight+Math.max(100,Number(floor.height)||500);
          return {...floor,index,bottom,zsHeight,top:cursor};
        });
        return {floors,totalHeight:cursor};
      }
      function b2bHeightV109(options) {
        const levels=Math.max(1,Number(options.levels)||1),beam=Number(options.traverseHeight)||140;
        let top=options.firstPalletPosition==='traverse'?Math.max(0,Number(options.firstFloorGap)||0)+beam:0;
        for(let i=0;i<levels-1;i++)top+=(Number(options.palletHeights?.[i])||Number(options.palletHeight)||1200)+(Number(options.levelClearances?.[i]??options.palletTraverseGap)||0)+beam;
        return {minimum:Math.max(500,top),automatic:Math.max(500,Math.ceil((top+Number(options.lastPalletOverlap??(Number(options.palletHeight)||1200)/2))/50)*50)};
      }
      function b2bValidateHeightV109(options,state,report=true) {
        if(state?.footHeightMode!=='manual')return true;
        const minimum=b2bHeightV109(options).minimum,value=Number(state.footHeight);
        const valid=Number.isFinite(value)&&value>=minimum;
        if(!valid&&report)alert('Manuel ayak boyu en üst traversin üst kotundan kısa olamaz. En az '+Math.ceil(minimum)+' mm girin.');
        return valid;
      }
      function b2bCollectionRowsV109(drawing,multiplier=1) {
        if(!drawing?.b2b||drawing.b2b.mr)return [];
        const layout=drawing.b2bLayout||{},state=drawing.b2b,plan=b2bCollectionPlanV109(state),rows=[];
        const count=Math.max(1,Number(layout.rowCount)||(state.rowType==='double'?2:1))*multiplier;
        const width=Math.round(Number(layout.sectionWidth)||m2B2BSectionWidth(layout,layout.palletCount||state.palletCount||1));
        for(const floor of plan.floors){
          if(Number(state.tunnelHeight)>0&&floor.bottom<Number(state.tunnelHeight))continue;
          rows.push({name:'ZS toplama traversi',spec:floor.traverse.replace('|',' · ')+' mm · '+width+' mm',qty:2*count,unit:'adet'});
          const trayWidth=Number(floor.trayWidth)||300,full=Math.floor(width/trayWidth),remainder=width-full*trayWidth;
          const spec=w=>w+' × '+(Number(layout.frameDepth)||1100)+' mm · '+String(floor.trayThickness||.8).replace('.',',')+' mm';
          if(full)rows.push({name:'Toplama katı tavası',spec:spec(trayWidth),qty:full*count,unit:'adet'});
          if(remainder>=50)rows.push({name:'Toplama katı tavası',spec:spec(remainder)+' · kesim',qty:count,unit:'adet'});
        }
        return rows;
      }
`;

export function transform(html){
  if(html.includes('function b2bCollectionPlanV109('))return html;
  const replace=(from,to)=>{if(!html.includes(from))throw Error('B2B v109 anchor missing: '+from.slice(0,90));html=html.replace(from,to);};
  replace('      function b2bVerticalLayout() {',helpers+'\n      function b2bVerticalLayout() {');
  replace('      function m2AddRack(drawing = null, typeName = null) {',`      function m2AddRack(drawing = null, typeName = null) {
        const selectedSystemV109=document.querySelector('#rafexUnifiedSystemPicker input:checked')?.value;
        const selectedTypeV109=m2SavedRackTypes[m2SelectedSavedType];
        if(!drawing&&selectedSystemV109==='b2b'&&!(selectedTypeV109?.__rafexSystem==='b2b'||selectedTypeV109?.drawing?.b2b)){
          const liveStateV109=b2bReadInputState(),liveVerticalV109=b2bVerticalLayout();
          drawing=m2B2BRecordV108({...m2LastDrawing,b2b:liveStateV109,levels:Number(liveStateV109.levels)||1,palletHeight:Number(liveStateV109.palletHeight)||1200,palletWeight:Number(liveStateV109.palletWeight)||0,sideUprightHeight:liveVerticalV109.footHeight,plan:{feet:[liveVerticalV109.footHeight],braces:[...(m2LastDrawing?.plan?.braces||[])]}});
        }`);
  replace('const liveB2BState=isB2B?b2bReadInputState():null,liveB2BHeight=',"if(isB2B&&!b2bValidateHeightV109(b2b3DOptions(),b2bReadInputState()))return;\n        const liveB2BState=isB2B?b2bReadInputState():null,liveB2BHeight=");
  replace('      function m2ApplyRackCustomization() {','      function m2ApplyRackCustomization() {\n        const candidateV109=m2LayoutState.racks.find(item=>item.id===m2CustomizeRackId);\n        if(candidateV109?.b2b&&!candidateV109.b2b.mr){const o=m2Rack3DOptions(candidateV109);o.levels=Number($("m2CustomizeLevels")?.value)||1;o.palletHeight=Number($("m2CustomizePalletHeight")?.value)||1200;const custom=$("m2CustomizeManualLevels")?.checked?m2CustomizeLevelData():[];o.palletHeights=custom.map(x=>x.palletHeight);o.levelClearances=custom.map(x=>Math.max(0,x.interval-x.palletHeight-o.traverseHeight));if(!b2bValidateHeightV109(o,candidateV109.b2b))return;}');
  replace('        let height=state.firstPalletPosition===', '        const collectionV109=b2bCollectionPlanV109(state);\n        if(collectionV109.floors.length){return b2bHeightV109({levels,palletHeight:defaultPallet,traverseHeight,firstPalletPosition:"traverse",firstFloorGap:collectionV109.totalHeight,palletTraverseGap:defaultClearance,palletHeights:custom.map(x=>x.palletHeight),levelClearances:custom.map(x=>Math.max(0,x.interval-x.palletHeight-traverseHeight)),lastPalletOverlap:lastOverlap}).automatic;}\n        let height=state.firstPalletPosition===');
  replace('if(!systemFilter||systemFilter==="b2b")m2LayoutAccessoryRows()', 'if(!systemFilter||systemFilter==="b2b")m2LayoutState.racks.forEach(rack=>b2bCollectionRowsV109(rack).forEach(row=>add(row.name,row.qty,row.spec,row.unit)));\n        if(!systemFilter||systemFilter==="b2b")m2LayoutAccessoryRows()');
  replace('          const rackIds=new Set(Array.isArray(entry.rackIds)?entry.rackIds:[])', '          b2bCollectionRowsV109(drawing,multiplier).forEach(row=>add(row.name,row.spec,row.qty));\n          const rackIds=new Set(Array.isArray(entry.rackIds)?entry.rackIds:[])');
  // Keep the chosen input intact; changing upright length must not compress the levels.
  html=html.replaceAll('Math.max(500,Math.ceil(manualHeight/50)*50)','Math.max(500,manualHeight)');
  html=html.replace('manual?Math.ceil(Number($("b2bFootHeight").value)/50)*50:automaticFootHeight','manual?Number($("b2bFootHeight").value):automaticFootHeight');
  html=html.replace(/        if \(manualHeight && Number\(\$\("b2bFootHeight"\)\?\.value\) > 0\) \{[\s\S]*?\n        \}/,'');
  const css=`<style data-rafex-b2b-behavior="v109">
  #page #m2LayoutProductList{display:flex!important;flex-direction:row!important;flex-wrap:nowrap!important;gap:8px!important;overflow-x:auto!important;align-items:stretch!important}
  #page #m2LayoutProductList>.m2-layout-product{flex:0 0 240px!important;min-width:240px!important}
  #page details.rafex-system-product-disclosure[open]>.rafex-system-product-body{display:flex!important;flex-direction:row!important;flex-wrap:nowrap!important;overflow-x:auto!important;gap:8px!important}
  #page .rafex-system-product-body>.rafex-system-product-row{flex:0 0 240px!important;width:240px!important;min-width:240px!important;max-width:240px!important;height:auto!important;max-height:none!important}
  #page.rafex-free-drawing-page #m2LayoutProductList.rafex-block-counts-v3{display:block!important;overflow:visible!important}
  #page.rafex-free-drawing-page #m2LayoutProductList .rafex-block-count-group{display:flex!important;flex-flow:row nowrap!important;align-items:stretch!important;gap:8px!important;overflow-x:auto!important;padding:8px!important}
  #page.rafex-free-drawing-page #m2LayoutProductList .rafex-block-count-group>h4{flex:0 0 138px!important;display:flex!important;align-items:center!important;margin:0!important}
  #page.rafex-free-drawing-page #m2LayoutProductList .rafex-block-count-row{flex:0 0 240px!important;width:240px!important;min-width:240px!important;box-sizing:border-box!important}
  #page.rafex-free-drawing-page #m2LayoutProductList>.rafex-product-system-section{display:flex!important;flex-flow:row nowrap!important;align-items:stretch!important;gap:8px!important;overflow-x:auto!important;padding:8px!important}
  #page.rafex-free-drawing-page #m2LayoutProductList>.rafex-product-system-section>.rafex-product-system-title{flex:0 0 138px!important;display:flex!important;align-items:center!important;margin:0!important}
  #page.rafex-free-drawing-page #m2LayoutProductList>.rafex-product-system-section>.m2-layout-product{flex:0 0 240px!important;width:240px!important;min-width:240px!important;box-sizing:border-box!important}
  </style>`;
  const bodyClose=html.lastIndexOf('</body>');
  if(bodyClose<0)throw Error('B2B v109 body close missing');
  html=html.slice(0,bodyClose)+css+html.slice(bodyClose);
  for(const m of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g))if(m[1].includes('function b2bCollectionPlanV109('))new vm.Script(m[1]);
  return html;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  const file='dist/server/index.js',source=fs.readFileSync(file,'utf8'),m=source.match(/(const\s+HTML_BASE64\s*=\s*)(["'])([A-Za-z0-9+/=]+)\2/);
  if(!m)throw Error('HTML_BASE64 missing');
  const html=transform(Buffer.from(m[3],'base64').toString('utf8'));
  fs.writeFileSync(file,source.replace(m[0],m[1]+m[2]+Buffer.from(html).toString('base64')+m[2]));
}
