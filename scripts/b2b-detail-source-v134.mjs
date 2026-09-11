import {physicalLevels} from './b2b-level-plan-v121.mjs';

export function finalizeDetail(options, state = {}) {
  const o = {...options};
  o.dimensionLabelScale = Math.max(.7, Math.min(1.5, Number(state.dimensionTextScale ?? options.dimensionLabelScale) || 1));
  const last = physicalLevels(o).at(-1);
  const top = last ? last.bottom + last.beam : 0;
  const overlap = Math.max(0, Number(o.lastPalletOverlap ?? o.palletHeight / 2) || 0);
  if (state.footHeightMode === 'manual' && Number(state.footHeight) > 0) o.footHeight = Number(state.footHeight);
  else if (state.footHeightMode === 'auto' || !(o.footHeight > 0)) o.footHeight = Math.max(500, Math.ceil((top + overlap) / 50) * 50);
  const h = o.footHeight;
  o.straightTieCount = o.rowType === 'double' ? (h <= 2000 ? 1 : h <= 5000 ? 2 : h <= 7000 ? 3 : h <= 10000 ? 4 : 5) : 0;
  o.straightTiePositions = Array.from({length:o.straightTieCount}, (_, i) => Math.round(h * (i + 1) / (o.straightTieCount + 1)));
  return o;
}

export function unifyDetailSource(html) {
  const replace = (from, to) => {
    if (!html.includes(from)) throw Error('B2B detail v134 anchor missing: ' + from.slice(0, 100));
    html = html.replace(from, to);
  };
  replace(' function b2bBaseOptions(d){', ` const physicalLevels=${physicalLevels.toString()};\n const finalizeDetail=${finalizeDetail.toString()};\n function b2bBaseOptions(d){`);
  replace('Number(b.traverseHeightOverride||d.traverseHeight||saved.traverseHeight)||85', 'Number(b.traverseHeightOverride)||Number(String(b.traverseType||" ").match(/\\d+/)?.[0])||Number(d.traverseHeight||saved.traverseHeight)||140');
  replace('palletHeights:palletHeights,levelClearances:levelClearances,', 'traverseHeight:traverseHeight,lastPalletOverlap:Number(b.lastPalletOverlap??saved.lastPalletOverlap??palletHeight/2),palletHeights:custom.length?palletHeights:(saved.palletHeights||[]),levelClearances:custom.length?levelClearances:(saved.levelClearances||[]),');
  replace('o.traverseHeight=Number(d.b2b?.traverseHeightOverride||d.traverseHeight||d.b2bViewerOptions?.traverseHeight)||140;', '');
  replace('return window.rafexManualOptionsV121?window.rafexManualOptionsV121(o,d.b2b?.manualLevelSpecs):o}', 'o=window.rafexManualOptionsV121?window.rafexManualOptionsV121(o,d.b2b?.manualLevelSpecs):o;return finalizeDetail(o,d.b2b||{})}');
  replace(' window.rafexB2BDetailOptionsV117=b2bOptions;', ` window.rafexB2BDetailOptionsV117=b2bOptions;
 const previousMainOptionsV134=window.b2b3DOptions;
 if(typeof previousMainOptionsV134==='function'){
   window.b2b3DOptions=function(){
     const live=previousMainOptionsV134.apply(this,arguments),state=window.b2bReadInputState();
     const detail=b2bOptions({b2b:state,levels:live.levels,palletHeight:live.palletHeight,b2bViewerOptions:live,b2bLayout:{sectionWidth:live.sectionWidth,palletCount:live.palletCount,palletWidth:live.palletWidth,palletDepth:live.palletDepth,rowCount:live.rowType==='double'?2:1,rowGap:live.rowGap}});
     return {...live,...detail,moduleCount:live.moduleCount,moduleOptions:live.moduleOptions,dimensions:live.dimensions};
   };
   try{b2b3DOptions=window.b2b3DOptions}catch(_){}
 }`);
  // Opening Customize must retain the exact stored plan, including per-level gaps.
  replace('out.palletHeights=custom.map(function(item){return item.palletHeight});out.levelClearances=custom.map(function(item){return Math.max(0,item.interval-item.palletHeight-out.traverseHeight)})', 'if(custom.length){out.palletHeights=custom.map(function(item){return item.palletHeight});out.levelClearances=custom.map(function(item){return Math.max(0,item.interval-item.palletHeight-out.traverseHeight)})}');
  // The legacy entry points are used by the copied-block preview and reports.
  for (const signature of ['function m2Rack3DOptions(rack) {', 'function m2B2BInfoOptionsV108(drawing){']) {
    const arg = signature.includes('(rack)') ? 'rack' : 'drawing';
    replace(signature, signature + `if(${arg}?.b2b&&!${arg}.b2b.mr&&window.rafexB2BDetailOptionsV117)return window.rafexB2BDetailOptionsV117(${arg});`);
  }
  replace("hook('m2Rack3DOptions', (previous) => function (rack, ...args) {", "hook('m2Rack3DOptions', (previous) => function (rack, ...args) {\n      if(rack?.b2b&&!rack.b2b.mr&&window.rafexB2BDetailOptionsV117)return window.rafexB2BDetailOptionsV117(rack);");
  replace('function m2B2BCalculatedFootHeight(rack) {', 'function m2B2BCalculatedFootHeight(rack) {if(rack?.b2b&&!rack.b2b.mr&&window.rafexB2BDetailOptionsV117)return window.rafexB2BDetailOptionsV117(rack).footHeight;');
  // Persist the edited preview before a new saved type captures the rack.
  replace('window.rafexSaveTunnelV120?.(rack);m2B2BResizeRack(rack,count);', 'window.rafexSaveTunnelV120?.(rack);const detailV134=window.rafexB2BCustomizeOptionsV120(rack);rack.b2bViewerOptions=JSON.parse(JSON.stringify(detailV134));rack.sideUprightHeight=detailV134.footHeight;rack.totalRackHeight=detailV134.footHeight;rack.b2b.footHeight=detailV134.footHeight;m2B2BResizeRack(rack,count);');
  return html;
}
