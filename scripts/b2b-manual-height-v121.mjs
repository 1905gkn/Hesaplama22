import {physicalLevels,automaticOptions,manualOptions} from './b2b-level-plan-v121.mjs';
export function netLevelRows(rows){return rows.map((r,i)=>({...r,distance:r.distance-(i?Number(String(rows[i-1].traverseType).match(/\d+/)?.[0])||140:0)}))}
export function storedLevelRows(rows){return rows.map((r,i)=>({...r,distance:r.distance+(i?Number(String(rows[i-1].traverseType).match(/\d+/)?.[0])||140:0)}))}
export const manualRuntime=String.raw`
<style>
#m2CustomizeModal label:has(>#m2CustomizeManualLevels),#m2CustomizeLevelRows{display:none!important}
#rafexManualHeightV121{width:min(850px,94vw);max-height:85vh;border:0;border-radius:12px;padding:22px;color:#173c2d;z-index:20000}
#rafexManualHeightV121::backdrop{background:#10271d88}
#rafexManualHeightV121 .level-row{display:grid;grid-template-columns:1.4fr 1fr 1fr 1fr;gap:10px;border-bottom:1px solid #ddd;padding:12px 0}
#rafexManualHeightV121 label{display:grid;gap:6px;font-size:12px}#rafexManualHeightV121 input,#rafexManualHeightV121 select{width:100%;box-sizing:border-box;padding:8px}
#rafexManualHeightV121 footer{display:flex;justify-content:flex-end;gap:10px;margin-top:16px}
@media(max-width:650px){#rafexManualHeightV121 .level-row{grid-template-columns:1fr 1fr}}
</style><script data-rafex-manual-height="v121">
(function(){
const physicalLevels=${physicalLevels.toString()},automaticOptions=${automaticOptions.toString()},manualOptions=${manualOptions.toString()},copy=x=>JSON.parse(JSON.stringify(x));
const netLevelRows=${netLevelRows.toString()},storedLevelRows=${storedLevelRows.toString()};
let mainRows=[],customRows=[],customId=null,customCleared=false,editing='main';
const value=(id,fallback)=>Number(document.getElementById(id)?.value)||fallback;
function height(o){const p=physicalLevels(o),last=p.at(-1);return last?last.bottom+last.beam:500}
function positionOf(o){return o?.firstPalletPosition==='traverse'?'traverse':'ground'}
function rowsToCustom(rows,position){return rows.map((r,i)=>{const beam=Number(String(r.traverseType).match(/\d+/)?.[0])||140;return {interval:position==='ground'?(i?Number(r.distance)||r.palletHeight+200+beam:(Number(r.distance)||r.palletHeight+200)+beam):(Number(rows[i+1]?.distance)||r.palletHeight+200+beam),palletHeight:r.palletHeight,weight:r.weight,traverseType:r.traverseType}})}
window.rafexManualOptionsV121=(o,rows)=>manualOptions(o,rows);
window.rafexPhysicalLevelsV121=physicalLevels;
window.rafexLoadManualCustomizeV121=rack=>{customId=rack.id;customRows=copy(rack.b2b?.manualLevelSpecs||[]);customCleared=false};
window.rafexManualCustomizeActiveV121=()=>customRows.length>0;
window.rafexCustomizeManualOptionsV121=(o,rack)=>rack.id===customId?(customRows.length?manualOptions(o,customRows):customCleared?automaticOptions(o):o):o;
window.rafexSaveManualV121=rack=>{if(rack.id!==customId)return;rack.b2b.manualLevelSpecs=copy(customRows);if(customRows.length){const position=positionOf(rack.b2b);rack.b2b.firstPalletPosition=position;rack.b2b.firstFloorGap=customRows[0].distance;rack.b2b.customLevels=rowsToCustom(customRows,position);}else if(customCleared){rack.b2b.customLevels=[];if(positionOf(rack.b2b)==='traverse')rack.b2b.firstFloorGap=200;}};
function open(kind){
 editing=kind;const custom=kind==='custom',rack=custom?m2LayoutState.racks.find(r=>r.id===customId):null;
 const o=custom?window.rafexB2BCustomizeOptionsV120(rack):b2b3DOptions(),saved=netLevelRows(custom?customRows:mainRows),physical=physicalLevels({...o,tunnelHeight:0});
 const ground=positionOf(o)==='ground';
 const count=custom?value('m2CustomizeLevels',o.levels):value('b2bLevels',o.levels),pallet=custom?value('m2CustomizePalletHeight',1200):value('b2bPalletHeight',1200),weight=custom?(rack?.palletWeight||rack?.b2b?.palletWeight||1000)*o.palletCount:value('b2bPalletWeight',1000)*o.palletCount;
 let dialog=document.getElementById('rafexManualHeightV121');if(!dialog){dialog=document.createElement('dialog');dialog.id='rafexManualHeightV121';document.body.appendChild(dialog)}
 dialog.innerHTML='<h3>Manuel yükseklik</h3><p>Her satırdaki palet yüksekliği, satırın başındaki kata aittir. Kat arası mesafe, alt traversin üstünden üst traversin altına kadar olan net boşluktur; travers yüksekliği dahil değildir. Zemin mesafesi ilk traversin altına kadardır. Kat ağırlığı bir sıradaki katın toplam yüküdür.</p><div class="rows">'+Array.from({length:count},(_,i)=>{const r=saved[i]||{},hasDistance=!ground||i<count-1,distance=r.distance??(i===0?physical[0]?.bottom??200:(physical[i]?.bottom-physical[i-1]?.bottom-physical[i-1]?.beam)||pallet+200),levelName=ground?(i===0?'Zemin':i+'. kat'):(i+1)+'. kat',distanceName=i===0?'Zemin – 1. kat':i+'. kat – '+(i+1)+'. kat',traverseName=ground?(hasDistance?(i+1)+'. kat travers tipi':'Taşıyıcı travers yok'):levelName+' travers tipi';return '<div class="level-row"><label>'+(hasDistance?distanceName+' mesafesi (mm)':'Üst kat mesafesi')+(hasDistance?'<input data-distance type="number" min="0" max="30000" value="'+distance+'">':'<input data-distance type="number" value="0" disabled>')+'</label><label>'+levelName+' ağırlığı (kg)<input data-weight type="number" min="0" max="100000" value="'+(r.weight??weight)+'"></label><label>'+levelName+' palet yüksekliği (mm)<input data-pallet type="number" min="300" max="3000" value="'+(r.palletHeight||pallet)+'"></label><label>'+traverseName+'<select data-traverse'+(hasDistance?'':' disabled')+'>'+['CC100','CC120','CC140','CC160','CC180'].map(t=>'<option'+(t===(r.traverseType||rack?.b2b?.traverseType||'CC140')?' selected':'')+'>'+t+'</option>').join('')+'</select></label></div>'}).join('')+'</div><p role="alert" class="error"></p><footer><button data-clear>Otomatik düzene dön</button><button data-cancel>Vazgeç</button><button data-save>Uygula</button></footer>';
 dialog.querySelector('[data-cancel]').onclick=()=>dialog.close();
 const commit=rows=>{if(custom){customRows=rows;customCleared=!rows.length;const legacy=document.getElementById('m2CustomizeManualLevels');if(legacy)legacy.checked=rows.length>0}else mainRows=rows;dialog.close();if(custom)window.rafexUpdateB2BCustomizeViewerV119?.();else b2bApplyInputs();};
 dialog.querySelector('[data-clear]').onclick=()=>commit([]);
 dialog.querySelector('[data-save]').onclick=()=>{
 const rows=[...dialog.querySelectorAll('.level-row')].map(row=>({distance:Number(row.querySelector('[data-distance]').value),weight:Number(row.querySelector('[data-weight]').value),palletHeight:Number(row.querySelector('[data-pallet]').value),traverseType:row.querySelector('[data-traverse]').value}));
 let error='';rows.forEach((r,i)=>{const needsDistance=!ground||i<rows.length-1,containedPallet=ground?r.palletHeight:rows[i-1]?.palletHeight;if((needsDistance&&(!Number.isFinite(r.distance)||r.distance<0||r.distance>30000))||!Number.isFinite(r.weight)||r.weight<0||r.weight>100000||r.palletHeight<300||r.palletHeight>3000)error='Geçerli mesafe, ağırlık ve palet yüksekliği girin.';if(needsDistance&&(ground||i>0)&&r.distance<containedPallet)error=(i===0?'Zemin – 1. kat':i+'. kat – '+(i+1)+'. kat')+' mesafesi bu aralıktaki palet yüksekliğinden kısa olamaz.'});
 const stored=storedLevelRows(rows),planned=manualOptions({...o,tunnelHeight:0},stored);if(rack?.b2b?.footHeightMode==='manual'&&height(planned)>o.footHeight)error='Kat düzeni manuel ayak boyunu aşıyor.';
 if(error){dialog.querySelector('.error').textContent=error;return}commit(stored);
 };dialog.showModal();
}
window.rafexOpenManualHeightV121=open;
const read=b2bReadInputState;b2bReadInputState=window.b2bReadInputState=function(){const s=read.apply(this,arguments);if(!s)return s;const rows=copy(mainRows.slice(0,s.levels)),position=positionOf(s);return {...s,manualLevelSpecs:rows,...(rows.length?{firstPalletPosition:position,firstFloorGap:rows[0].distance,customLevels:rowsToCustom(rows,position)}:{})}};
const restore=b2bApplySavedInputState;b2bApplySavedInputState=window.b2bApplySavedInputState=function(s){mainRows=copy(s?.manualLevelSpecs||[]);return restore.apply(this,arguments)};
const options=b2b3DOptions;b2b3DOptions=window.b2b3DOptions=function(){return manualOptions(options.apply(this,arguments),mainRows)};
const vertical=b2bVerticalLayout;b2bVerticalLayout=window.b2bVerticalLayout=function(){const v=vertical.apply(this,arguments);if(!mainRows.length)return v;const position=document.getElementById('b2bFirstPalletPosition')?.value==='traverse'?'traverse':'ground',o=manualOptions({levels:v.levels,palletHeight:v.palletHeight,traverseHeight:v.traverseHeight,firstPalletPosition:position},mainRows),minimum=height(o),automatic=Math.max(500,Math.ceil((minimum+Number(b2bLastPalletOverlap||600))/50)*50);return {...v,groundPallet:position==='ground',traverseLevels:o.traverseBottoms.length,firstLoadBottom:position==='ground'?0:o.firstFloorGap+o.traverseHeights[0],automaticFootHeight:automatic,footHeight:document.getElementById('b2bFootHeightMode')?.value==='manual'?v.footHeight:automatic}};
const foot=b2bFootCalculationInputs;b2bFootCalculationInputs=window.b2bFootCalculationInputs=function(){const old=foot.apply(this,arguments);if(!mainRows.length)return old;const rows=mainRows.slice(0,value('b2bLevels',1)),position=document.getElementById('b2bFirstPalletPosition')?.value==='traverse'?'traverse':'ground',loaded=position==='ground'?rows.slice(1):rows,total=loaded.reduce((n,r)=>n+r.weight,0);return {...old,position,loadedLevels:loaded.length,loadedPallets:loaded.length*value('b2bPalletCount',3),totalPalletLoad:total,footLoad:total,footCalculationHeight:rows[0].distance+Number(rows[0].traverseType.slice(2))}};
})();</script>`;
