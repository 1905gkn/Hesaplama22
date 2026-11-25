import fs from 'node:fs';
import {pathToFileURL} from 'node:url';

export function optimizeLargeLayout(html) {
  const replace=(before,after)=>{
    if(!html.includes(before))throw Error('Large layout anchor missing: '+before);
    html=html.replace(before,after);
  };
  replace('const rackCacheV212=window.rafexCommonPerfV212.racks;',
    'for(const [id,peers] of peerGroupsV248)peerGroupsV248.set(id,JSON.stringify(peers));\n        const rackCacheV212=window.rafexCommonPerfV212.racks;');
  replace('hasSeismicLabel=m2LayoutState.racks.some((owner)=>(owner.seismicBraces||[]).some((brace)=>(brace.rackIds||[]).some((id)=>Number(id)===Number(rack.id))))',
    'hasSeismicLabel=seismicIdsV212.has(Number(rack.id))');
  replace('const state=()=>m2LayoutState,svg=()=>document.getElementById("m2LayoutSvg"),rackById=id=>(state().racks||[]).find(r=>Number(r.id)===Number(id));',
    'const state=()=>m2LayoutState,svg=()=>document.getElementById("m2LayoutSvg");');
  replace('function decorateRack(group,screenScaleV133)', 'function decorateRack(group,screenScaleV133,rack)');
  replace(',rack=rackById(group.getAttribute("data-rack"))', '');
  replace('node.querySelectorAll("[data-rack]").forEach(function(group){decorateRack(group,scale)})',
    'const racksById=new Map((state().racks||[]).map(rack=>[Number(rack.id),rack]));node.querySelectorAll("[data-rack]").forEach(function(group){decorateRack(group,scale,racksById.get(Number(group.getAttribute("data-rack"))))})');
  return html;
}

if(process.argv[1]&&pathToFileURL(process.argv[1]).href===import.meta.url){
  const source=process.argv[2]||'dist/index.html';
  const target=process.argv[3]||source;
  fs.writeFileSync(target,optimizeLargeLayout(fs.readFileSync(source,'utf8')));
}
