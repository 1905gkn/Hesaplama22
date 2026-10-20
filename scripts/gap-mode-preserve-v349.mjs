export function transform(html){
 if(html.includes('data-gap-mode-preserve="v349"'))return html;
 const replace=(a,b)=>{if(html.split(a).length!==2)throw Error('v349 anchor '+a.slice(0,90));html=html.replace(a,b);};
 replace('  window.rafexReplaceAreaDocumentV319=(next,expectedOwner)=>{',`  window.rafexSetGapBasisAreasV349=(next,expectedOwner)=>{
    ensure();
    if(output||restoring||owner!==expectedOwner||!next?.areas?.length)throw Error('Proje alanları değiştirilemiyor.');
    const target=next.areas.find(a=>a.id===documentState.activeAreaId);
    if(!target)throw Error('Aktif alan bulunamadı.');
    remember();
    for(const area of documentState.areas){const saved=next.areas.find(a=>a.id===area.id);if(saved)area.layout.rackGapBasis=saved.layout.rackGapBasis==='frame'?'frame':'pallet';}
    m2LayoutState.rackGapBasis=target.layout.rackGapBasis==='frame'?'frame':'pallet';
    invalidate();
  };
  window.rafexReplaceAreaDocumentV319=(next,expectedOwner)=>{`);
 replace('window.rafexReplaceAreaDocumentV319(areas,owner);window.__rafexFreeOutputDirty=true;', 'window.rafexSetGapBasisAreasV349(areas,owner);window.__rafexFreeOutputDirty=true;');
 replace("const horizontal=direction==='left'||direction==='right',anchor=m2RackBounds(rack),group=m2CombinedRackBounds(rack);", "const horizontal=direction==='left'||direction==='right',anchor=m2GapBoundsV346(rack),group=m2CombinedGapBoundsV346(rack);");
 const start=html.indexOf('function m2RackGapLineBlocked('),end=html.indexOf('\n      function ',start+20);if(start<0||end<0)throw Error('v349 gap obstruction');
 let block=html.slice(start,end);const old='const bounds=table.bounds.get(Number(id));';if(!block.includes(old))throw Error('v349 blocker bounds missing');
 block=block.replace(old,'const other=table.racks.find(r=>Number(r.id)===Number(id)),bounds=m2LayoutState.rackGapBasis===\'frame\'&&other?m2GapBoundsV346(other):table.bounds.get(Number(id));');html=html.slice(0,start)+block+html.slice(end);
 return html.replace('</body>','<meta data-gap-mode-preserve="v349"></body>');
}

