import fs from 'node:fs';
export function transform(html){
 if(html.includes('data-layout-accessories="v165"'))return html;
 const replace=(a,b)=>{if(!html.includes(a))throw Error('v165 anchor missing: '+a.slice(0,80));html=html.replace(a,b)};
 replace('name:customName,drawing,source:"custom"','name:customName,drawing,source:"custom",system:drawing.rafexSystem,__rafexSystem:drawing.rafexSystem,__rafexSystemLabel:drawing.rafexSystem===\'mr\'?\'MR\':\'B2B\'');
 replace('      function m2DrawingFromCustomizedRack(rack) {','      function m2DrawingFromCustomizedRack(rack) {\n        rack.rafexSystem=rack.b2b?.mr||rack.plan?.mr||rack.systemType===\'mr\'?\'mr\':\'b2b\';');
 replace('return m2PerfBlockingSymbols().some((symbol)=>{const b=', 'return m2PerfBlockingSymbols().some((symbol)=>{if(m2BarrierFitsTunnelV165(symbol,rack,x,y,angle))return false;const b=');
 const runtime=`<style data-layout-accessories="v165">#m2LayoutSvg .m2-b2b-seismic-brace .m2-b2b-plan-label{display:none!important}</style>
<script data-layout-accessories="v165">
function m2BarrierFitsTunnelV165(symbol,rack,x=rack.x,y=rack.y,angle=rack.angle){
 if(symbol?.type!=='barrier'||!(Number(rack.b2b?.tunnelHeight)>0))return false;
 const candidate={...rack,x,y,angle},cx=symbol.x+symbol.w/2,cy=symbol.y+symbol.h/2,a=(Number(symbol.angle)||0)*Math.PI/180,c=Math.cos(a),s=Math.sin(a);
 return [[-1,-1],[-1,1],[1,-1],[1,1]].every(([dx,dy])=>m2RackContainsCanvasPoint(candidate,{x:cx+dx*symbol.w/2*c-dy*symbol.h/2*s,y:cy+dx*symbol.w/2*s+dy*symbol.h/2*c}));
}
(function(){
 const duplicate=m2DuplicateRack;
 m2DuplicateRack=window.m2DuplicateRack=function(){
  const ids=new Set(m2MultiSelect.symbolIds||[]);if(m2SelectedSymbolId!=null)ids.add(m2SelectedSymbolId);
  const symbols=m2LayoutSymbols.filter(s=>ids.has(s.id));
  if(!symbols.length||m2LayoutState.selected!=null||m2MultiSelect.rackIds.size)return duplicate.apply(this,arguments);
  const stamp=Math.max(Date.now(),1+Math.max(0,...m2LayoutSymbols.map(s=>Number(s.id)||0))),copies=symbols.map((s,i)=>({...structuredClone(s),id:stamp+i,x:s.x+18,y:s.y+18}));
  copies.forEach(s=>{delete s.tunnelRackId;if(s.type==='barrier')delete s.rackId;});
  m2PushUndo('Sembol çoğaltma');m2LayoutSymbols.push(...copies);m2MultiSelect.symbolIds=new Set(copies.map(s=>s.id));m2SelectedSymbolId=copies.length===1?copies[0].id:null;
  m2RenderLayout();$('m2FloorStatus').textContent=copies.length+' sembol kopyalandı.';
 };
})();</script>`;
 const end=html.lastIndexOf('</body>');if(end<0)throw Error('Missing body');return html.slice(0,end)+runtime+html.slice(end);
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-layout-accessories-v165.mjs')){
 const file='dist/server/index.js',s=fs.readFileSync(file,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('Missing HTML');
 fs.writeFileSync(file,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));
}
