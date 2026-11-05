import fs from 'node:fs';import vm from 'node:vm';
// Exact polygon/rectangle intersection in the rack's local coordinate system.
export function columnSlots(rack,polygon,scale,foot){
 const l=rack?.b2bLayout;if(!l||rack.b2b?.mr||!Array.isArray(polygon)||polygon.length<3||!(scale>0))return null;
 const angle=(Number(rack.angle)||0)*Math.PI/180,c=Math.cos(angle),s=Math.sin(angle),cx=rack.x+rack.w/2,cy=rack.y+rack.h/2;
 const poly=polygon.map(p=>({x:(p.x-cx)*c+(p.y-cy)*s+rack.w/2,y:-(p.x-cx)*s+(p.y-cy)*c+rack.h/2}));
 const eps=Math.max(1e-7,scale*.01),cross=(a,b,p)=>(b.x-a.x)*(p.y-a.y)-(b.y-a.y)*(p.x-a.x);
 const inside=(p,points)=>{let yes=false;for(let i=0,j=points.length-1;i<points.length;j=i++){const a=points[i],b=points[j];if((a.y>p.y)!==(b.y>p.y)&&p.x<(b.x-a.x)*(p.y-a.y)/(b.y-a.y)+a.x)yes=!yes;}return yes;};
 const intersects=(a,b,p,q)=>{const v=[cross(a,b,p),cross(a,b,q),cross(p,q,a),cross(p,q,b)];return v[0]*v[1]<-eps*eps&&v[2]*v[3]<-eps*eps;};
 const overlap=(left,top,right,bottom)=>{const box=[{x:left,y:top},{x:right,y:top},{x:right,y:bottom},{x:left,y:bottom}];return poly.some(p=>p.x>left+eps&&p.x<right-eps&&p.y>top+eps&&p.y<bottom-eps)||box.some(p=>inside(p,poly))||poly.some((p,i)=>box.some((q,j)=>intersects(p,poly[(i+1)%poly.length],q,box[(j+1)%4])));};
 const rows=Math.max(1,Number(l.rowCount)||1),count=Math.max(1,Number(l.palletCount)||1),depth=Number(rack.depthMm)||Number(rack.railLength)||rack.h/scale;
 const sx=rack.w/(Number(l.sectionWidth)+2*foot),sy=rack.h/depth,fw=foot*sx,pd=Number(l.palletDepth),over=Number(l.palletOverhang)||0,fd=Number(l.frameDepth),gap=(Number(l.sectionWidth)-count*Number(l.palletWidth))/(count+1),beam=Math.max(1,Number(rack.b2bViewerOptions?.traverseWidth)||50)*sy;
 if(![sx,sy,pd,fd,gap,fw].every(Number.isFinite)||gap<0||!(fd>0))return null;
 // A column must remain completely inside the bay width, away from both end frames.
 if(poly.some(p=>p.x<=fw+eps||p.x>=rack.w-fw-eps||p.y<-eps||p.y>rack.h+eps))return null;
 const slots=[];let enclosed=false;
 for(let row=0;row<rows;row++){
  const y=row*(pd+Math.max(0,(Number(l.rowGap)||0)-2*over))*sy,fy=y+over*sy,fh=fd*sy;
  if(poly.every(p=>p.y>fy+beam/2+eps&&p.y<fy+fh-beam/2-eps))enclosed=true;
  if(overlap(fw,fy-beam/2,rack.w-fw,fy+beam/2)||overlap(fw,fy+fh-beam/2,rack.w-fw,fy+fh+beam/2))return null;
  for(let pallet=0;pallet<count;pallet++){const x=fw+(gap+pallet*(Number(l.palletWidth)+gap))*sx;if(overlap(x,y,x+Number(l.palletWidth)*sx,y+pd*sy))slots.push({row,pallet});}
 }
 return enclosed?slots:null;
}
export const helpers=`
const m2ColumnSlotsV504=${columnSlots.toString()};
let m2ColumnExtensionContextV504=null,m2ColumnExtensionStopV504=null;
function m2ColumnPolygonV504(symbol){
 const points=window.rafexCadGeometryV362?.points(symbol);if(points?.length>=3)return points;
 const b=m2SymbolBounds(symbol);return [{x:b.left,y:b.top},{x:b.right,y:b.top},{x:b.right,y:b.bottom},{x:b.left,y:b.bottom}];
}
function m2ColumnOverlapPlanV504(rack,symbol,x=rack.x,y=rack.y,angle=rack.angle){
 return m2ColumnSlotsV504({...rack,x,y,angle},m2ColumnPolygonV504(symbol),m2LayoutState.scale,m2B2BFootWidth(rack));
}
function m2ColumnMayPassV504(rack,symbol,x,y,angle){
 if(symbol.type!=='column'||!rack.b2bLayout||rack.b2b?.mr)return false;
 const id=String(symbol.id),saved=(rack.columnPassageV504?.columnIds||[]).map(String),ctx=m2ColumnExtensionContextV504;
 const slots=m2ColumnOverlapPlanV504(rack,symbol,x,y,angle);
 if(ctx)ctx.hit.add(id);
 if(slots===null)return false;
 if(!saved.includes(id)&&!(ctx?.allowed.has(id)))return false;
 if(ctx){ctx.accepted.set(rack.id,{...(ctx.accepted.get(rack.id)||{}),[id]:slots});}
 return true;
}
function m2ColumnPersistV504(rack){
 const accepted=m2ColumnExtensionContextV504?.accepted.get(rack.id);if(!accepted)return;
 const slots=new Map();for(const list of Object.values(accepted))for(const p of list)slots.set(p.row+':'+p.pallet,p);
 rack.columnPassageV504={version:1,columnIds:Object.keys(accepted),slots:[...slots.values()]};
}
function m2RefreshColumnPassagesV504(){
 const pending=(m2LayoutState.racks||[]).filter(r=>r.columnPassageV504);if(!pending.length)return;
 const columns=new Map((m2LayoutSymbols||[]).filter(s=>s.type==='column').map(s=>[String(s.id),s]));
 for(const r of pending){const slots=new Map(),ids=[];const a=m2RackBounds(r);for(const id of r.columnPassageV504.columnIds||[]){const col=columns.get(String(id));if(!col)continue;const b=m2SymbolBounds(col);if(!(a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top))continue;const plan=m2ColumnOverlapPlanV504(r,col);if(plan===null)continue;ids.push(String(id));for(const p of plan)slots.set(p.row+':'+p.pallet,p);}if(ids.length)r.columnPassageV504={version:1,columnIds:ids,slots:[...slots.values()]};else delete r.columnPassageV504;}
}
function m2ColumnPalletBlockedV504(rack,row,pallet){return (rack.columnPassageV504?.slots||[]).some(p=>p.row===row&&p.pallet===pallet);}
function m2ColumnBeginExtensionV504(source,draft){
 const stop=m2ColumnExtensionStopV504,direction=draft.direction||1,scale=m2LayoutState.scale,near=stop&&Math.hypot(source.x+source.w/2-stop.x,source.y+source.h/2-stop.y)<=Math.max(source.w,source.h)*2+1000*scale;
 const sameRow=stop&&(stop.members.includes(Number(source.id))||source.joinGroup&&source.joinGroup===stop.group),sameAngle=stop&&Math.abs(((Number(source.angle)||0)-(stop.angle||0))%360)<.01;
 m2ColumnExtensionContextV504={allowed:new Set(near&&sameRow&&sameAngle&&direction===stop.direction?stop.columns:[]),hit:new Set(),accepted:new Map(),source,direction};
}
function m2ColumnEndExtensionV504(commit=true){
 const ctx=m2ColumnExtensionContextV504;if(!ctx)return;const source=ctx.source;
 if(!commit){m2ColumnExtensionContextV504=null;return;}
 const stopped=[...ctx.hit].filter(id=>!ctx.allowed.has(id));
 const members=m2JoinedRackMembers(source),rad=(Number(source.angle)||0)*Math.PI/180,u={x:Math.cos(rad)*ctx.direction,y:Math.sin(rad)*ctx.direction},end=members.reduce((best,r)=>(r.x+r.w/2)*u.x+(r.y+r.h/2)*u.y>(best.x+best.w/2)*u.x+(best.y+best.h/2)*u.y?r:best,source);
 m2ColumnExtensionStopV504=stopped.length?{columns:[...new Set([...ctx.allowed,...stopped])],direction:ctx.direction,angle:source.angle,x:end.x+end.w/2,y:end.y+end.h/2,group:source.joinGroup,members:members.map(r=>Number(r.id))}:null;
 const disabled=[...ctx.accepted.keys()].map(id=>m2LayoutState.racks.find(r=>r.id===id)).filter(Boolean).reduce((n,r)=>n+(r.columnPassageV504?.slots?.length||0),0);
 m2ColumnExtensionContextV504=null;
 const status=$('m2FloorStatus');if(status&&stopped.length)status.textContent+=' Kolona ulaşıldı. Yakınından aynı yönde tekrar uzatırsan, travers ve ayaklara temas etmeyen kolonun kapattığı palet yerleri boş bırakılır.';
 else if(status&&disabled)status.textContent+=' Kolonun kapattığı '+disabled+' palet konumu boş bırakıldı ve toplam kapasiteden düşüldü.';
}
`;
export function transform(html){
 if(html.includes('data-column-extension="v504"'))return html;
 const replace=(a,b)=>{if(!html.includes(a))throw Error('v504 missing '+a.slice(0,120));html=html.replace(a,b);};
 replace('function m2RackOverlapsBlockingSymbol(',helpers+'\nfunction m2RackOverlapsBlockingSymbol(');
 replace('return m2PerfBlockingSymbols().some((symbol)=>{if(m2BarrierFitsTunnelV165(symbol,rack,x,y,angle))return false;const b=m2LayoutRuntimeCache.accessories.bounds.get(String(symbol.id))||m2SymbolBounds(symbol);return a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top;});}',
  'const check=(symbol)=>{if(m2BarrierFitsTunnelV165(symbol,rack,x,y,angle))return false;const b=m2LayoutRuntimeCache.accessories.bounds.get(String(symbol.id))||m2SymbolBounds(symbol);return a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top&&!m2ColumnMayPassV504(rack,symbol,x,y,angle);};const symbols=m2PerfBlockingSymbols();return m2ColumnExtensionContextV504?symbols.reduce((blocked,symbol)=>check(symbol)||blocked,false):symbols.some(check);}');
 replace("m2RackOverlapsBlockingSymbol=function(r,x=r.x,y=r.y,angle=r.angle){const probe={...r,x,y,angle};return m2LayoutSymbols.some(s=>(s.type==='column'||s.blocking)&&rackBlocks(probe,s).some(b=>overlaps(b,m2SymbolBounds(s))));};",
  "m2RackOverlapsBlockingSymbol=function(r,x=r.x,y=r.y,angle=r.angle){const probe={...r,x,y,angle},check=s=>(s.type==='column'||s.blocking)&&rackBlocks(probe,s).some(b=>overlaps(b,m2SymbolBounds(s)))&&!m2ColumnMayPassV504(r,s,x,y,angle);return m2ColumnExtensionContextV504?m2LayoutSymbols.reduce((blocked,s)=>check(s)||blocked,false):m2LayoutSymbols.some(check);};");
 replace('const projected=point?m2ProjectAutoFillPoint(point):draft.hover, radians=source.angle',
  'm2ColumnBeginExtensionV504(source,draft);try{\n        const projected=point?m2ProjectAutoFillPoint(point):draft.hover, radians=source.angle');
 const i=html.indexOf('function m2CommitAutoFillGuide('),j=html.indexOf('function ',i+20),body=html.slice(i,j);
 if(!body.includes('m2ColumnBeginExtensionV504'))throw Error('v504 commit boundary');
 const end=body.lastIndexOf('}');html=html.slice(0,i)+body.slice(0,end)+'}finally{m2ColumnEndExtensionV504();}\n      '+body.slice(end)+html.slice(j);
 replace('m2LayoutState.racks.push(probe);anchor=probe;','m2ColumnPersistV504(probe);m2LayoutState.racks.push(probe);anchor=probe;');
 replace('m2B2BResizeRack(copy, palletCount);','delete copy.columnPassageV504;\n        m2B2BResizeRack(copy, palletCount);');
 // The block-count toolbar is a separate transaction from measured extension.
 replace('const first=anchor,planned=[],accessories=[],attached=symbols().filter(s=>s.rackId===source.id);',
  'm2ColumnBeginExtensionV504(anchor,{direction:dir});try{\n  const first=anchor,planned=[],accessories=[],attached=symbols().filter(s=>s.rackId===source.id);');
 replace('delete copy.rafexRegionV179;','delete copy.rafexRegionV179;delete copy.columnPassageV504;');
 replace('planned.push(copy);anchor=copy;','m2ColumnPersistV504(copy);planned.push(copy);anchor=copy;');
 replace("status(count+' yeni blok yan yana eklendi.');return true;\n }", "status(count+' yeni blok yan yana eklendi.');return true;\n  }finally{m2ColumnEndExtensionV504(!options.dryRun);}\n }");
 replace('function m2RenderLayout() {','function m2RenderLayout() { m2RefreshColumnPassagesV504();');
 replace('for (let pallet = 0; pallet < layout.palletCount; pallet++) {','for (let pallet = 0; pallet < layout.palletCount; pallet++) {\n                if(m2ColumnPalletBlockedV504(rack,row,pallet))continue;');
 replace('const remapRack = rack => {','const remapRack = rack => {\n    if(rack.columnPassageV504?.columnIds)rack.columnPassageV504.columnIds=rack.columnPassageV504.columnIds.map(id=>mapped(symbolIds,id));');
 replace('/layout-3d.js?v=484','/layout-3d.js?v=504');
 // All existing totals (screen, PDF, share, history) use this shared capacity function.
 replace('function rafexPalletCapacity(drawing){',`function rafexPalletCapacity(drawing){const capacity=rafexPalletCapacityBaseV504(drawing),l=drawing?.b2bLayout,slots=drawing?.columnPassageV504?.slots||[];if(!l||!slots.length)return capacity;const count=Number(l.palletCount)||1,rows=Number(l.rowCount)||1,unique=new Set(slots.filter(p=>p.row>=0&&p.row<rows&&p.pallet>=0&&p.pallet<count).map(p=>p.row+':'+p.pallet));return Math.max(0,Math.round(capacity*(count*rows-unique.size)/(count*rows)));}\nfunction rafexPalletCapacityBaseV504(drawing){`);
 const marker=html.lastIndexOf('</body>');html=html.slice(0,marker)+`<script data-column-extension="v504">
window.rafexColumnExtensionVersion='v504';
</script>`+html.slice(marker);
 for(const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g))if(!/src=|application\/json/.test(m[1]))new vm.Script(m[2]);return html;
}
if(/[\\/]column-extension-v504\.mjs$/.test(process.argv[1]||''))for(const file of ['dist/index.html','dist/server/index.js'])if(fs.existsSync(file)){
 let source=fs.readFileSync(file,'utf8');if(file.endsWith('.html'))source=transform(source);else{const m=source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);if(!m)throw Error('v504 HTML missing');source=source.replace(m[0],m[0].replace(m[2],Buffer.from(transform(Buffer.from(m[2],'base64').toString())).toString('base64')));}fs.writeFileSync(file,source);console.log('PASS v504: '+file);
}