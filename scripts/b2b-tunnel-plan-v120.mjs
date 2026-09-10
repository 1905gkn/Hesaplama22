// One physical level plan for the Customize preview and the persisted rack.
export function tunnelPlan(options, bounds) {
  const o=JSON.parse(JSON.stringify(options)), beam=Number(o.traverseHeight)||140;
  if(!(o.tunnelHeight>0))return o;
  const pallet=Number(o.palletHeight)||1200, clearance=Number(o.palletTraverseGap??200);
  const ceiling=Math.min(bounds.topPallet-pallet-beam,bounds.footHeight-beam);
  const capacity=ceiling<o.tunnelHeight?0:1+Math.floor((ceiling-o.tunnelHeight)/(pallet+clearance+beam));
  o.invalidTunnel=capacity===0;
  o.levels=Math.max(1,Math.min(Number(o.levels)||1,capacity));
  o.firstPalletPosition='traverse';o.firstFloorGap=o.tunnelHeight;
  o.footHeight=bounds.footHeight;
  const step=o.levels>1?(ceiling-o.tunnelHeight)/(o.levels-1):pallet+clearance+beam;
  o.palletHeights=Array(o.levels).fill(pallet);
  o.levelClearances=Array(o.levels).fill(Math.max(0,step-pallet-beam));
  o.collectionLevels={enabled:false,groundGap:0,floors:[]};o.collectionFloors=[];
  o.accessories=(o.accessories||[]).map(a=>({...a,levels:(a.levels||[]).filter(n=>n>=1&&n<=o.levels)})).filter(a=>a.levels.length);
  let tray=o.accessories.find(a=>a.type==='tray');
  if(!tray){tray={type:'tray',width:300,levels:[]};o.accessories.push(tray)}
  if(!tray.levels.includes(1))tray.levels.unshift(1);
  return o;
}
export const tunnelRuntime=String.raw`
 const tunnelPlanV120=${tunnelPlan.toString()};
 let boundsV120=null,lastPlanV120=null;
 function boundsForV120(rack){
   const o=window.rafexB2BDetailOptionsV117(rack),beam=o.traverseHeight;
   let top=o.firstPalletPosition==='traverse'?o.firstFloorGap+beam:0;
   for(let i=0;i<o.levels-1;i++)top+=(o.palletHeights[i]||o.palletHeight)+(o.levelClearances[i]??o.palletTraverseGap)+beam;
   return {footHeight:o.footHeight,topPallet:top+(o.palletHeights[o.levels-1]||o.palletHeight)};
 }
 function applyTunnelV120(options,rack){
   options.dimensions={...options.dimensions,width:false};
   if(options.tunnelHeight>0){
     if(draft.enabled||draft.floors.length){draft={enabled:false,groundGap:0,floors:[]};render()}
     options=tunnelPlanV120(options,boundsV120||boundsForV120(rack));
     const input=document.getElementById('m2CustomizeLevels');if(input)input.value=String(options.levels);
     window.m2RenderCustomizeRackAccessories?.();
   }
   const blocked=options.tunnelHeight>0;
   const manual=document.getElementById('m2CustomizeManualLevels');if(manual){manual.disabled=blocked;if(blocked)manual.checked=false}
   const rows=document.getElementById('m2CustomizeLevelRows');if(rows&&blocked)rows.hidden=true;
   const host=document.getElementById('m2CustomizeCollectionV119');if(host)host.hidden=blocked;
   const picker=document.querySelector('[data-collection-picker-v119]');if(picker)picker.hidden=blocked;
   const h=options.footHeight;
   options.straightTieCount=options.rowType==='double'?(h<=2000?1:h<=5000?2:h<=7000?3:h<=10000?4:5):0;
   options.straightTiePositions=Array.from({length:options.straightTieCount},(_,i)=>Math.round(h*(i+1)/(options.straightTieCount+1)));
   lastPlanV120=options;return options;
 }
 window.rafexSaveTunnelV120=function(rack){
   const o=lastPlanV120;if(!o||rack.id!==rackId||!(o.tunnelHeight>0))return;
   rack.levels=o.levels;rack.b2b={...rack.b2b,levels:o.levels,firstPalletPosition:'traverse',firstFloorGap:o.firstFloorGap,
     collectionLevels:clone(o.collectionLevels),accessories:clone(o.accessories),
     customLevels:o.palletHeights.map((p,i)=>({palletHeight:p,interval:p+o.traverseHeight+o.levelClearances[i]}))};
   rack.sideUprightHeight=o.footHeight;rack.totalRackHeight=o.footHeight;rack.b2b.footHeight=o.footHeight;
 };
`;
