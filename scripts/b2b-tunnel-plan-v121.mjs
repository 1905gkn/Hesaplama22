import {physicalLevels} from './b2b-level-plan-v121.mjs';
export function tunnelPlan(options,bounds={}) {
  const o=JSON.parse(JSON.stringify(options));
  const visible=physicalLevels(o).filter(f=>!(o.tunnelHeight>0&&f.bottom<o.tunnelHeight));
  o.visibleAccessoryLevels=visible.map(f=>f.level);
  if(!(o.tunnelHeight>0))return o;
  o.invalidTunnel=!visible.length;o.footHeight=bounds.footHeight||o.footHeight;
  o.collectionLevels={enabled:false,groundGap:0,floors:[]};o.collectionFloors=[];
  o.accessories=(o.accessories||[]).map(a=>({...a,levels:(a.levels||[]).filter(n=>o.visibleAccessoryLevels.includes(n))})).filter(a=>a.levels.length);
  if(visible.length){let tray=o.accessories.find(a=>a.type==='tray');if(!tray){tray={type:'tray',width:300,levels:[]};o.accessories.push(tray)}if(!tray.levels.includes(visible[0].level))tray.levels.unshift(visible[0].level)}
  return o;
}
export const tunnelRuntime=String.raw`
 const physicalLevels=${physicalLevels.toString()};
 const tunnelPlanV120=${tunnelPlan.toString()};
 let boundsV120=null,lastPlanV120=null;
 window.rafexResetCustomizePlanV121=()=>{lastPlanV120=null};
 function boundsForV120(rack){const o=window.rafexB2BDetailOptionsV117(rack);return {footHeight:o.footHeight,firstFloorGap:o.firstFloorGap,firstPalletPosition:o.firstPalletPosition}}
 window.rafexAccessoryLevelsV121=()=>lastPlanV120?.visibleAccessoryLevels||null;
 window.rafexFirstTunnelLevelV121=()=>document.getElementById('m2CustomizeTunnel')?.checked?lastPlanV120?.visibleAccessoryLevels?.[0]??null:null;
 function applyTunnelV120(options,rack){
   options.dimensions={...options.dimensions,width:false};
   if(options.tunnelHeight>0){
     if(boundsV120&&!window.rafexManualCustomizeActiveV121?.()){options.firstFloorGap=boundsV120.firstFloorGap;options.firstPalletPosition=boundsV120.firstPalletPosition}
     if(draft.enabled||draft.floors.length){draft={enabled:false,groundGap:0,floors:[]};render()}
   }
   options=tunnelPlanV120(options,boundsV120||{});lastPlanV120=options;
   window.m2RenderCustomizeRackAccessories?.();
   const blocked=options.tunnelHeight>0;
   const host=document.getElementById('m2CustomizeCollectionV119');if(host)host.hidden=blocked;
   const picker=document.querySelector('[data-collection-picker-v119]');if(picker)picker.hidden=blocked;
   const h=options.footHeight;
   options.straightTieCount=options.rowType==='double'?(h<=2000?1:h<=5000?2:h<=7000?3:h<=10000?4:5):0;
   options.straightTiePositions=Array.from({length:options.straightTieCount},(_,i)=>Math.round(h*(i+1)/(options.straightTieCount+1)));
   return options;
 }
 window.rafexSaveTunnelV120=function(rack){
   const o=lastPlanV120;if(!o||rack.id!==rackId||!(o.tunnelHeight>0))return;
   rack.b2b={...rack.b2b,firstPalletPosition:o.firstPalletPosition,firstFloorGap:o.firstFloorGap,collectionLevels:clone(o.collectionLevels),accessories:clone(o.accessories)};
   rack.sideUprightHeight=o.footHeight;rack.totalRackHeight=o.footHeight;rack.b2b.footHeight=o.footHeight;
 };
`;
