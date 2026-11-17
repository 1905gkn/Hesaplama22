import fs from 'node:fs';
import {pathToFileURL} from 'node:url';

export function normalLevels584(value,record){
 const state=record?.b2b||record;
 const collection=state?.collectionLevels;
 const hasCollection=!state?.mr&&((collection?.enabled&&collection.floors?.length>0)||state?.collectionFloors?.length>0);
 const number=value==null||value===''?1:Number(value);
 return Math.max(hasCollection?0:1,Math.min(25,Math.round(Number.isFinite(number)?number:1)));
}
export const helper=`function rafexB2BLevels584(value,record){if(record===undefined)record={collectionLevels:window.rafexB2BCollectionStateV549?.()};return (${normalLevels584.toString()})(value,record);}
function rafexCustomizeLevels584(value){const rack=typeof m2LayoutState!=='undefined'?m2LayoutState.racks.find(r=>r.id===m2CustomizeRackId):null;const draft=window.rafexCollectCustomizeCollectionV119?.(rack?.id);return rafexB2BLevels584(value,draft?{collectionLevels:draft}:rack);}`;

export function transform(html){
 if(html.includes('data-collection-only="v584"'))return html;
 html=html.replace(/\/b2b-viewer\.js\?v=[^"'\s<>]+/g,'/b2b-viewer.js?v=584');
 const replace=(a,b)=>{if(!html.includes(a))throw Error('v584 missing '+a.slice(0,100));html=html.replaceAll(a,b);};
 replace('.slice(0,12).map((f)=>', '.slice(0,20).map((f)=>');
 replace('collection.floors.length<12','collection.floors.length<20');
 replace('draft.floors.length<12','draft.floors.length<20');
 replace('firstSupportHeight:plan.floors.length?plan.totalHeight+(Number(window.b2bTraverseHeight?.())||140):0','firstSupportHeight:plan.floors.length?(rafexB2BLevels584(document.getElementById("b2bLevels")?.value)===0?plan.floors[0].bottom+plan.floors[0].zsHeight:plan.totalHeight+(Number(window.b2bTraverseHeight?.())||140)):0');
 replace('const inputLevels = Math.max(1, Math.min(25, Math.round(Number($("b2bLevels")?.value) || 1)));','const inputLevels = rafexB2BLevels584($("b2bLevels")?.value);');
 replace('levels:Number($("b2bLevels")?.value) || 1','levels:rafexB2BLevels584($("b2bLevels")?.value)');
 replace('String(Math.max(1,Math.min(25,Math.round(Number(input.value)))))','String(rafexB2BLevels584(input.value))');
 replace('m2LimitedNumber("m2Levels", 1, m2ActiveModule === "b2b" ? 25 : 15, "kat")','m2LimitedNumber("m2Levels", m2ActiveModule === "b2b"&&rafexB2BLevels584(0)===0?0:1, m2ActiveModule === "b2b" ? 25 : 15, "kat")');
 replace('d.levels=Number(b.levels)||d.levels;','d.levels=rafexB2BLevels584(b.levels??d.levels,b);');
 replace('sideUprightHeight = window.rafexMekikHeightV421.resolve(firstRailHeight + (levels - 1) * levelH + palletHeight / 2,m2ActiveModule,firstRailHeight + (levels - 1) * levelH),','sideUprightHeight = m2ActiveModule==="b2b"&&window.rafexB2BCollectionStateV549?.().enabled?b2bVerticalLayout().footHeight:window.rafexMekikHeightV421.resolve(firstRailHeight + (levels - 1) * levelH + palletHeight / 2,m2ActiveModule,firstRailHeight + (levels - 1) * levelH),');
 replace('firstRailHeight = m2Number("m2FirstLevelHeight", 0, 5000),','firstRailHeight = m2Number("m2FirstLevelHeight", 0, m2ActiveModule==="b2b"?200000:5000),');
 replace('levels:Math.max(1,Number(d.levels||b.levels||saved.levels)||1)','levels:rafexB2BLevels584(d.levels??b.levels??saved.levels,b)');
 replace('Math.max(1,Number(drawing.levels)||1)','rafexB2BLevels584(drawing.levels,drawing)');
 replace('var traverseQty=levelCount*2*rowCount;','if(rafexB2BLevels584(rack.levels,rack)===0)levelCount=0;var traverseQty=levelCount*2*rowCount;');
 replace('*Math.max(1,levels)*((drawing.b2b.rowType','*rafexB2BLevels584(levels,drawing)*((drawing.b2b.rowType');
 for(const [before,after] of [
  ['Math.max(1, Number(drawing?.levels || state.levels) || 1)','rafexB2BLevels584(drawing?.levels??state.levels,drawing||state)'],
  ['Math.max(1,Math.round(number(drawing?.levels??state.levels,1)))','rafexB2BLevels584(drawing?.levels??state.levels,drawing||state)'],
  ['Math.max(1,number(drawing?.levels??drawing?.b2b?.levels,1))','rafexB2BLevels584(drawing?.levels??drawing?.b2b?.levels,drawing)'],
  ['Math.max(1, Math.round(num(options.levels, 1)))','rafexB2BLevels584(options.levels,options)']
 ])html=html.replaceAll(before,after);
 replace('function m2LevelDetail(drawing) {','function m2LevelDetail(drawing) {\n if(rafexB2BLevels584(drawing?.levels,drawing)===0)return String(drawing.b2b.collectionLevels.floors.length)+" toplama katı · 0 normal kat";');
 html=html.replaceAll('Math.max(1,Number(rack.levels)||1)','rafexB2BLevels584(rack.levels,rack)');
 const custom='Math.max(1,Math.min(Number(document.getElementById("m2CustomizeLevels")?.max)||25,Math.round(Number($("m2CustomizeLevels")?.value)||1)))';
 replace(custom,'rafexCustomizeLevels584($("m2CustomizeLevels")?.value)');
 html=html.replaceAll('Math.max(1,Number($("m2CustomizeLevels")?.value)||1)','rafexCustomizeLevels584($("m2CustomizeLevels")?.value)').replaceAll('Number($("m2CustomizeLevels")?.value)||1','rafexCustomizeLevels584($("m2CustomizeLevels")?.value)');
 replace('out.levels=Math.max(1,Number(levels?.value)||out.levels);','out.levels=rafexCustomizeLevels584(levels?.value??out.levels);');
 replace('$("m2CustomizeLevels").value=String(rack.levels||1);','$("m2CustomizeLevels").value=String(rafexB2BLevels584(rack.levels,rack));');
 replace('function b2bHeightV109(options) {',`function b2bHeightV109(options) {
 if(rafexB2BLevels584(options.levels,options)===0){const floors=options.collectionFloors?.length?options.collectionFloors:b2bCollectionPlanV109(options).floors;const minimum=Math.max(500,...floors.map(f=>Number(f.bottom)+Number(f.zsHeight)));const top=Math.max(minimum,...floors.map(f=>Number(f.top)||minimum));return {minimum,automatic:Math.ceil(top/50)*50};}`);
 replace('const automaticFootHeight=physical?b2bHeightV109(physical).automatic:', 'const automaticFootHeight=out.levels===0?b2bHeightV109({...out,collectionLevels:normalizeCollection(appliedCollection),collectionFloors:plan.floors}).automatic:physical?b2bHeightV109(physical).automatic:');
 replace("let out={...options,firstPalletPosition:'traverse',firstFloorGap:plan.totalHeight,collectionLevels:state.collectionLevels,collectionFloors:plan.floors};", "let out={...options,levels:rafexB2BLevels584(state.levels??options.levels,state),firstPalletPosition:'traverse',firstFloorGap:plan.totalHeight,collectionLevels:state.collectionLevels,collectionFloors:plan.floors};");
 replace('function enrich(options,state){const p=plan(state);','function enrich(options,state){options.levels=rafexB2BLevels584(options.levels,{collectionLevels:state});const p=plan(state);');
 replace('function finalizeDetail(options, state = {}) {','function finalizeDetail(options, state = {}) {\n options={...options,levels:rafexB2BLevels584(options.levels??state.levels,{...options,...state})};');
 replace('o.footHeight = Math.max(500, Math.ceil((top + overlap) / 50) * 50);','o.footHeight = o.levels===0?b2bHeightV109(o).automatic:Math.max(500, Math.ceil((top + overlap) / 50) * 50);');
 const hook=`<script data-collection-only="v584">${helper}
(()=>{function sync(){const main=document.getElementById('b2bLevels');if(main){main.min=String(rafexB2BLevels584(0));if(main.min==='1'&&main.value==='0'){main.value='1';window.b2bApplyInputs?.();}}const custom=document.getElementById('m2CustomizeLevels');if(custom)custom.min=String(rafexCustomizeLevels584(0));}
 document.addEventListener('input',e=>{if(e.target?.id==='b2bLevels'||e.target?.id==='m2CustomizeLevels')sync();},true);
 document.addEventListener('focusout',e=>{if(e.target?.id==='b2bLevels')sync();},true);
 document.addEventListener('click',()=>{requestAnimationFrame(sync);},true);sync();})();</script>`;
 // Helpers are available before delayed accessory boot and any project restore.
 const at=html.indexOf('<script');html=html.slice(0,at)+hook+html.slice(at);
 const end=html.lastIndexOf('</body>');return html.slice(0,end)+`<script>(()=>{const read=b2bReadInputState;b2bReadInputState=window.b2bReadInputState=function(...args){const state=read.apply(this,args);return state&&rafexB2BLevels584(state.levels,state)===0?{...state,levels:0,manualLevelSpecs:[],customLevels:[]}:state;};})();</script>`+html.slice(end);
}

export function transformViewerSource(source){
 const from='levels: clamp(Math.round(Number(next.levels) || 4), 1, 25),';
 if(!source.includes(from))throw Error('v584 viewer level anchor');
 source=source.replace(from,"levels: Number(next.levels)===0&&(next.collectionFloors?.length||(next.collectionLevels?.enabled&&next.collectionLevels.floors?.length))?0:clamp(Math.round(Number(next.levels) || 4), 1, 25),");
 source=source.replaceAll('next.collectionFloors.slice(0,12)','next.collectionFloors.slice(0,20)');
 source=source.replace('const topPallet = this.loadBottom(this.options.levels - 1) + this.palletHeightAt(this.options.levels - 1);','const topPallet = this.options.levels>0?this.loadBottom(this.options.levels - 1) + this.palletHeightAt(this.options.levels - 1):0;');
 source=source.replace('this.addLevelMarker(markersLayer, markerX, frontY, topPallet,', 'if(this.options.levels>0)this.addLevelMarker(markersLayer, markerX, frontY, topPallet,');
 return source;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)for(const file of ['dist/index.html','dist/server/index.js'])if(fs.existsSync(file)){
 let s=fs.readFileSync(file,'utf8');if(file.endsWith('.html'))s=transform(s);else{const m=s.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);if(!m)throw Error('Missing HTML');s=s.replace(m[2],Buffer.from(transform(Buffer.from(m[2],'base64').toString())).toString('base64'));}fs.writeFileSync(file,s);
}
