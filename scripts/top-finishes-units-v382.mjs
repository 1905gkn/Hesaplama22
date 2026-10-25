export function transform(html){
 if(html.includes('data-top-finishes-units="v382"'))return html;
 const replace=(a,b)=>{if(html.split(a).length!==2)throw Error('v382 anchor '+a.slice(0,100));html=html.replace(a,b)};
 const runtime=String.raw`(()=>{
 window.rafexProductUnitLabelV382=name=>window.rafexProductUnitV377(name)==='takım'?'TK':'AD';
 window.rafexPlanFinishV382=d=>{
  const value=String(d?.mekikFootColor||d?.footColor||d?.uprightFinish||'').toLowerCase();
  if(value==='ral5010')return '#004f7c';
  if(value==='pgv')return '#a8b0b3';
  if(/^#[0-9a-f]{6}$/.test(value))return value;
  return d?.rafexSystem==='drive'||d?.systemType==='drive'?'#68757f':'#004f7c';
 };
 document.addEventListener('change',event=>{
  if(!event.target.matches?.('.rafex-mekik-foot-color'))return;
  const color=window.rafexPlanFinishV382({mekikFootColor:event.target.value});
  document.querySelectorAll('#m2Top .rafex-plan-foot-v143 rect').forEach(rect=>rect.setAttribute('fill',color));
 });
})();`;
 replace('return {version:1,width,length,bays,depth,foot,pitch,palW,palD,positions,sequence,','return {version:1,footFinish:window.rafexPlanFinishV382(d),width,length,bays,depth,foot,pitch,palW,palD,positions,sequence,');
 const start=html.indexOf('  const foot=(cx,cy,h)=>'),end=html.indexOf('\n',start);
 if(start<0)throw Error('v382 foot');
 html=html.slice(0,start)+html.slice(start,end).replaceAll('fill="#d7d9d9"','fill="${p.footFinish||\'#a8b0b3\'}"').replaceAll('fill="#c8cbcc"','fill="${p.footFinish||\'#a8b0b3\'}"')+html.slice(end);
 replace("const savedPlanV143=window.rafexReadRackDetailV135?.(rack,'top')||window.rafexPlanDetailV143(rack),", "const savedPlanV143={...(window.rafexReadRackDetailV135?.(rack,'top')||window.rafexPlanDetailV143(rack)),footFinish:window.rafexPlanFinishV382(rack)},");
 replace('m2LastDrawing = { bays, levels, depth,',`m2LastDrawing = { mekikFootColor:(m2ActiveModule==='mekik2'?document.querySelector('.rafex-mekik-foot-color')?.value:null)||m2LastDrawing?.mekikFootColor||(m2ActiveModule==='drive'?'pgv':'ral5010'), bays, levels, depth,`);
 replace('${fmt(row.qty)} ${esc(row.unit||"adet")}','${fmt(row.qty)} ${window.rafexProductUnitLabelV382(row.name)}');
 replace("textNumber(row.qty)+' '+esc(row.unit)","textNumber(row.qty)+' '+window.rafexProductUnitLabelV382(row.name)");
 replace('<span>${fmt(row.qty)}</span><span>${esc(row.unit)}</span>','<span>${fmt(row.qty)}</span><span>${window.rafexProductUnitLabelV382(row.item)}</span>');
 replace('${fmt(counts[length])} adet','${fmt(counts[length])} ${window.rafexProductUnitLabelV382(label)}');
 const first=html.indexOf('<script');
 return html.slice(0,first)+'<script data-top-finishes-units="v382">'+runtime+'</script>'+html.slice(first);
}

