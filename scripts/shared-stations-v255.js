/* shared-stations-v255 */
(function(){
 function rank(a,b){return Number(b.thickness)-Number(a.thickness)||Number(b.width)-Number(a.width);}
 function combine(a,b){const p={...([a,b].sort(rank)[0])};p.height=Math.max(a.height,b.height);p.code=p.family+String(p.height).padStart(5,'0')+p.depth+String(Math.round(p.thickness*100));return p;}
 function stations(racks){const byId=new Map(racks.map(r=>[Number(r.id),r])),out=new Map();
  for(const r of racks){if(!r.b2bLayout||r.b2b?.mr)continue;const p=m2B2BFootProductData(r),n=Number(r.b2bLayout.rowCount)||1;out.set(Number(r.id),Array.from({length:n},(_,row)=>['left','right'].map(side=>({row,side,product:{...p},shared:false}))).flat());}
  for(const r of racks){const parent=byId.get(Number(r.sharedFootWith));if(!parent||!r.sharedFootSide||!out.has(Number(r.id))||!out.has(Number(parent.id)))continue;
   const own=out.get(Number(r.id)),other=out.get(Number(parent.id)),opposite=r.sharedFootSide==='left'?'right':'left';
   for(const slot of own){if(slot.side!==r.sharedFootSide)continue;const match=other.find(s=>s.side===opposite&&Math.abs(rowAxis(parent,s.row)-rowAxis(r,slot.row))<.01);if(!match)continue;match.product=combine(match.product,slot.product);match.shared=true;slot.omit=true;slot.shared=true;slot.owner=match;}
  }return out;
 }
 let active=null;
 window.rafexSharedFramesV255={combine,stations,forRack(r,racks){return (active||stations(racks)).get(Number(r.id))||[];},paint(r,row,side,x,width){const slot=(active||new Map()).get(Number(r.id))?.find(s=>s.row===row&&s.side===side),p=slot?.owner?.product||slot?.product;if(!p||!slot.shared)return{x,width};const w=width*p.width/m2B2BFootWidth(r);return{x:x+(width-w)/2,width:w};}};
 const render=m2RenderLayout;m2RenderLayout=window.m2RenderLayout=function(){active=stations(m2LayoutState.racks);try{return render.apply(this,arguments);}finally{active=null;}};
 const open=window.m2OpenCustomizeModal;let session=null;
 const values=()=>Array.from(document.querySelectorAll('#m2CustomizeModal input,#m2CustomizeModal select,#m2CustomizeModal textarea')).filter(e=>e.id&&!/Tunnel|m2CustomizeName/.test(e.id)).map(e=>[e.id,e.type==='checkbox'?e.checked:e.value]);
 window.m2OpenCustomizeModal=m2OpenCustomizeModal=function(){const result=open.apply(this,arguments);session={values:JSON.stringify(values()),rackId:m2CustomizeRackId,saved:structuredClone(m2SavedRackTypes)};return result;};
 const commit=window.rafexCommitCustomTypeV184;
 window.rafexCommitCustomTypeV184=function(r,entry,previous){
  if(session?.rackId===r.id&&JSON.stringify(values())===session.values&&Number(r.b2b?.tunnelHeight||0)!==Number(previous?.b2b?.tunnelHeight||0)){
   for(const key of ['typeName','typeColor','rafexGlobalTypeLetter','rafexOriginalTypeName','rafexSectionLetter','rafexCatalogKey','rafexCustomNameV203']){if(previous[key]===undefined)delete r[key];else r[key]=previous[key];}
   m2SavedRackTypes=session.saved;window.rafexSelectedCatalogKey=previous.rafexCatalogKey;return;
  }return commit.apply(this,arguments);
 };
})();
