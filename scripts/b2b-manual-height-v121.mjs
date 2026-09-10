import {physicalLevels,manualOptions} from './b2b-level-plan-v121.mjs';
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
const physicalLevels=${physicalLevels.toString()},manualOptions=${manualOptions.toString()},copy=x=>JSON.parse(JSON.stringify(x));
let mainRows=[],customRows=[],customId=null,editing='main';
const value=(id,fallback)=>Number(document.getElementById(id)?.value)||fallback;
function height(o){const p=physicalLevels(o),last=p.at(-1);return last?last.bottom+last.beam:500}
window.rafexManualOptionsV121=(o,rows)=>manualOptions(o,rows);
window.rafexPhysicalLevelsV121=physicalLevels;
window.rafexLoadManualCustomizeV121=rack=>{customId=rack.id;customRows=copy(rack.b2b?.manualLevelSpecs||[])};
window.rafexManualCustomizeActiveV121=()=>customRows.length>0;
window.rafexCustomizeManualOptionsV121=(o,rack)=>rack.id===customId?manualOptions(o,customRows):o;
window.rafexSaveManualV121=rack=>{if(rack.id!==customId)return;rack.b2b.manualLevelSpecs=copy(customRows);if(customRows.length){rack.b2b.firstPalletPosition='traverse';rack.b2b.firstFloorGap=customRows[0].distance;rack.b2b.customLevels=customRows.map((r,i)=>({interval:customRows[i+1]?.distance||r.palletHeight+200+140,palletHeight:r.palletHeight,weight:r.weight,traverseType:r.traverseType}));}};
function open(kind){
 editing=kind;const custom=kind==='custom',rack=custom?m2LayoutState.racks.find(r=>r.id===customId):null;
 const o=custom?window.rafexB2BCustomizeOptionsV120(rack):b2b3DOptions(),saved=custom?customRows:mainRows,physical=physicalLevels({...o,tunnelHeight:0});
 const count=custom?value('m2CustomizeLevels',o.levels):value('b2bLevels',o.levels),pallet=custom?value('m2CustomizePalletHeight',1200):value('b2bPalletHeight',1200),weight=custom?(rack?.palletWeight||rack?.b2b?.palletWeight||1000)*o.palletCount:value('b2bPalletWeight',1000)*o.palletCount;
 let dialog=document.getElementById('rafexManualHeightV121');if(!dialog){dialog=document.createElement('dialog');dialog.id='rafexManualHeightV121';document.body.appendChild(dialog)}
 dialog.innerHTML='<h3>Manuel yükseklik</h3><p>Mesafeler travers alt kotları arasındadır. Kat ağırlığı bir sıradaki katın toplam yüküdür.</p><div class="rows">'+Array.from({length:count},(_,i)=>{const r=saved[i]||{},distance=r.distance??(i===0?physical[0]?.bottom??200:(physical[i]?.bottom-physical[i-1]?.bottom)||pallet+340);return '<div class="level-row"><label>'+(i===0?'Zemin – 1. kat':i+'. kat – '+(i+1)+'. kat')+' mesafesi (mm)<input data-distance type="number" min="0" max="30000" value="'+distance+'"></label><label>Kat ağırlığı (kg)<input data-weight type="number" min="0" max="100000" value="'+(r.weight??weight)+'"></label><label>Palet yüksekliği (mm)<input data-pallet type="number" min="300" max="3000" value="'+(r.palletHeight||pallet)+'"></label><label>Travers tipi<select data-traverse>'+['CC100','CC120','CC140','CC160','CC180'].map(t=>'<option'+(t===(r.traverseType||rack?.b2b?.traverseType||'CC140')?' selected':'')+'>'+t+'</option>').join('')+'</select></label></div>'}).join('')+'</div><p role="alert" class="error"></p><footer><button data-clear>Otomatik düzene dön</button><button data-cancel>Vazgeç</button><button data-save>Uygula</button></footer>';
 dialog.querySelector('[data-cancel]').onclick=()=>dialog.close();
 const commit=rows=>{if(custom)customRows=rows;else mainRows=rows;dialog.close();if(custom)window.rafexUpdateB2BCustomizeViewerV119?.();else b2bApplyInputs();};
 dialog.querySelector('[data-clear]').onclick=()=>commit([]);
 dialog.querySelector('[data-save]').onclick=()=>{
 const rows=[...dialog.querySelectorAll('.level-row')].map(row=>({distance:Number(row.querySelector('[data-distance]').value),weight:Number(row.querySelector('[data-weight]').value),palletHeight:Number(row.querySelector('[data-pallet]').value),traverseType:row.querySelector('[data-traverse]').value}));
 let error='';rows.forEach((r,i)=>{if(!Number.isFinite(r.distance)||r.distance<0||r.distance>30000||!Number.isFinite(r.weight)||r.weight<0||r.weight>100000||r.palletHeight<300||r.palletHeight>3000)error='Geçerli mesafe, ağırlık ve palet yüksekliği girin.';if(i&&r.distance<rows[i-1].palletHeight+Number(rows[i-1].traverseType.slice(2)))error=(i+1)+'. kat mesafesi alt kattaki palet ve travers yüksekliğinden kısa olamaz.'});
 const planned=manualOptions({...o,tunnelHeight:0},rows);if(rack?.b2b?.footHeightMode==='manual'&&height(planned)>o.footHeight)error='Kat düzeni manuel ayak boyunu aşıyor.';
 if(error){dialog.querySelector('.error').textContent=error;return}commit(rows);
 };dialog.showModal();
}
window.rafexOpenManualHeightV121=open;
const read=b2bReadInputState;b2bReadInputState=window.b2bReadInputState=function(){const s=read.apply(this,arguments);if(!s)return s;const rows=copy(mainRows.slice(0,s.levels));return {...s,manualLevelSpecs:rows,...(rows.length?{firstPalletPosition:'traverse',firstFloorGap:rows[0].distance,customLevels:rows.map((r,i)=>({interval:rows[i+1]?.distance||r.palletHeight+340,palletHeight:r.palletHeight,weight:r.weight,traverseType:r.traverseType}))}:{})}};
const restore=b2bApplySavedInputState;b2bApplySavedInputState=window.b2bApplySavedInputState=function(s){mainRows=copy(s?.manualLevelSpecs||[]);return restore.apply(this,arguments)};
const options=b2b3DOptions;b2b3DOptions=window.b2b3DOptions=function(){return manualOptions(options.apply(this,arguments),mainRows)};
const vertical=b2bVerticalLayout;b2bVerticalLayout=window.b2bVerticalLayout=function(){const v=vertical.apply(this,arguments);if(!mainRows.length)return v;const o=manualOptions({levels:v.levels,palletHeight:v.palletHeight,traverseHeight:v.traverseHeight},mainRows),minimum=height(o),automatic=Math.ceil((minimum+Number(b2bLastPalletOverlap||600))/50)*50;return {...v,groundPallet:false,traverseLevels:v.levels,firstLoadBottom:o.firstFloorGap+o.traverseHeights[0],automaticFootHeight:automatic,footHeight:document.getElementById('b2bFootHeightMode')?.value==='manual'?v.footHeight:automatic}};
const foot=b2bFootCalculationInputs;b2bFootCalculationInputs=window.b2bFootCalculationInputs=function(){const old=foot.apply(this,arguments);if(!mainRows.length)return old;const rows=mainRows.slice(0,value('b2bLevels',1)),total=rows.reduce((n,r)=>n+r.weight,0);return {...old,position:'traverse',loadedLevels:rows.length,totalPalletLoad:total,footLoad:total,footCalculationHeight:rows[0].distance+Number(rows[0].traverseType.slice(2))}};
})();</script>`;
