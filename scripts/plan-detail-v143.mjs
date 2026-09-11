// All coordinates are millimetres. Neither warehouse size nor viewport zoom
// participates in the saved model.
export function planDetail(d) {
  const bays=Math.max(1,Number(d.bays)||1),depth=Math.max(1,Number(d.depth)||1),foot=Number(d.footType)||90;
  const width=Number(d.totalWidth||d.widthMm)||bays*((Number(d.palW)||800)+150)+(bays+1)*foot;
  const length=Number(d.railLength||d.depthMm)||1200;
  const pitch=(width-foot)/bays,palW=Number(d.palW)||800,palD=Number(d.palD)||1200;
  const sequence=[];let cursor=0;
  for(let i=0;i<Math.max(d.plan?.feet?.length||0,d.plan?.braces?.length||0);i++)for(const kind of ['feet','braces']){
    const size=Number(d.plan?.[kind]?.[i]);if(size>0){sequence.push({kind,y:cursor,length:size});cursor+=size;}
  }
  const positions=[];let y=Number(d.firstPalletGap??200);
  for(let row=0;row<depth;row++){
    const saved=Number(d.palletPositions?.[row]);positions.push(Number.isFinite(saved)?saved:y);
    y=positions[row]+palD+Number(d.palletGaps?.[row]??d.palletGap??50);
  }
  return {version:1,width,length,bays,depth,foot,pitch,palW,palD,positions,sequence,hasExtra:!!d.hasExtra,system:d.systemType||'fifo',braces:[...(d.topVBraceBays||[])],showPallets:d.showPallets!==false,showFlow:d.showFlowArrows!==false};
}

export function renderPlan(p,{x=0,y=0,scale=1,braces=true}={}) {
  // Use the same normalized symbol in the editor, layout and exported layout.
  // Its pabuç, edge and centre line scale together with the selected profile.
  const foot=(cx,cy,h)=>`<g class="rafex-plan-foot-v143" transform="translate(${cx-p.foot/2} ${cy})"><rect x="${p.foot*.22}" width="${p.foot*.56}" height="${h}" fill="#d7d9d9" stroke="#59636b" stroke-width="${p.foot*.035}"/><path d="M${p.foot/2} ${p.foot*.18}V${h-p.foot*.18}" stroke="#8b949a" stroke-width="${p.foot*.028}"/><rect width="${p.foot}" height="${p.foot*.18}" fill="#c8cbcc" stroke="#59636b" stroke-width="${p.foot*.035}"/><rect y="${h-p.foot*.18}" width="${p.foot}" height="${p.foot*.18}" fill="#c8cbcc" stroke="#59636b" stroke-width="${p.foot*.035}"/></g>`;
  let out=`<g class="rafex-plan-detail-v143" transform="translate(${x} ${y}) scale(${scale})" data-plan-width-mm="${p.width}" data-plan-depth-mm="${p.length}">`;
  for(const part of p.sequence)for(let col=0;col<=p.bays;col++){
    const cx=p.foot/2+col*p.pitch;
    if(part.kind==='feet')out+=foot(cx,part.y,part.length);
    else out+=`<path class="rafex-plan-tie-v143" d="M${cx-p.foot*.14} ${part.y}v${part.length}M${cx+p.foot*.14} ${part.y}v${part.length}" fill="none" stroke="#64748b" stroke-width="${p.foot*.05}"/>`;
  }
  if(p.hasExtra)for(let col=0;col<=p.bays;col++)out+=foot(p.foot/2+col*p.pitch,p.length-p.foot/2,p.foot);
  if(p.showPallets)for(let row=0;row<p.depth;row++)for(let bay=0;bay<p.bays;bay++){
    const px=p.foot+bay*p.pitch+(p.pitch-p.foot-p.palW)/2;
    out+=`<rect class="rafex-plan-pallet-v143" data-pallet-row="${row+1}" x="${px}" y="${p.positions[row]}" width="${p.palW}" height="${p.palD}" fill="#c58b47" stroke="#744719" stroke-width="${p.palW/80}"/>`;
  }
  if(braces){const ys=p.sequence.filter(s=>s.kind==='feet').flatMap(s=>[s.y,s.y+s.length]);for(const bay of p.braces)if(bay>=0&&bay<p.bays&&ys.length>1){const a=p.foot/2+bay*p.pitch;out+=`<path class="rafex-plan-brace-v143" d="M${ys.map((v,i)=>`${a+(i%2?p.pitch:0)} ${v}`).join('L')}" fill="none" stroke="#b57d00" stroke-width="${p.foot*.2}"/>`;}}
  return out+'</g>';
}
