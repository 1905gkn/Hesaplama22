import fs from 'node:fs';
import vm from 'node:vm';
export const helpers = `
let m2WallAccessoryIndexV503=null;
function m2WallAccessoryIdsV503(){
 if(m2WallAccessoryIndexV503)return m2WallAccessoryIndexV503;
 const ids=new Set();
 for(const r of m2LayoutState.racks||[]){
  const accessories=r.b2b?.accessories||[];
  if(accessories.some(a=>a?.type==='palletStop'&&Array.isArray(a.levels)&&a.levels.length)||
   (r.backMeshSides||[]).some(s=>['front','back','middle'].includes(s)))ids.add(Number(r.id));
  for(const brace of r.seismicBraces||[])if(['light','heavy'].includes(brace?.type))for(const id of brace.rackIds||[])ids.add(Number(id));
 }
 return m2WallAccessoryIndexV503=ids;
}
function m2AccessoryWallMinimumV503(rack,group=false){
 const ids=m2WallAccessoryIdsV503();if(!ids.size)return 0;const members=group?m2MovementMembersV267(rack):[rack];
 return members.some(r=>ids.has(Number(r?.id)))?125:0;
}
function m2AccessoryWallClearanceValidV503(rack,x,y,angle){
 const minimum=m2AccessoryWallMinimumV503(rack,true)*m2LayoutState.scale;
 if(!(minimum>0))return true;
 const box=m2GapBoundsV346({...rack,x,y,angle}),pad=minimum+m2WallMeasurementInset;
 const edges=m2PerfWallGeometryTable().segments||[];
 const corners=[{x:box.left,y:box.top},{x:box.right,y:box.top},{x:box.right,y:box.bottom},{x:box.left,y:box.bottom}];
 const distance=(p,a,b)=>{const dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy||1)));return Math.hypot(p.x-a.x-t*dx,p.y-a.y-t*dy);};
 const pointBox=p=>Math.hypot(Math.max(box.left-p.x,0,p.x-box.right),Math.max(box.top-p.y,0,p.y-box.bottom));
 for(const {a,b} of edges){
  if(Math.max(a.x,b.x)<box.left-pad||Math.min(a.x,b.x)>box.right+pad||Math.max(a.y,b.y)<box.top-pad||Math.min(a.y,b.y)>box.bottom+pad)continue;
  if(m2WallCrossesRack(a,b,corners))return false;
  const gap=Math.min(pointBox(a),pointBox(b),...corners.map(p=>distance(p,a,b)));
  if(gap+1e-6<pad)return false;
 }
 return true;
}
`;
export function transform(html){
 if(html.includes('data-accessory-wall-clearance="v503"'))return html;
 const replace=(a,b)=>{if(!html.includes(a))throw Error('v503 missing '+a.slice(0,100));html=html.replace(a,b);};
 replace('function m2SetWallDistance(direction, rawValue) {',helpers+'\nfunction m2SetWallDistance(direction, rawValue) {');
 replace('const desiredPx = Math.max(0, Number(rawValue) || 0) * m2LayoutState.scale, current = m2WallMeasurements(rack)[direction];',
  'const minimumV503=m2AccessoryWallMinimumV503(rack,true); const desiredPx = Math.max(minimumV503, Number(rawValue) || 0) * m2LayoutState.scale, current = m2WallMeasurements(rack)[direction];');
 replace('function m2RackInsideArea(rack, x = rack.x, y = rack.y, angle = rack.angle) {',
  'function m2RackInsideArea(rack, x = rack.x, y = rack.y, angle = rack.angle) {\n        if(!m2AccessoryWallClearanceValidV503(rack,x,y,angle))return false;');
 replace('function m2RenderLayout() {','function m2RenderLayout() { m2WallAccessoryIndexV503=null;');
 const end=html.lastIndexOf('</body>');html=html.slice(0,end)+'<script data-accessory-wall-clearance="v503">window.rafexAccessoryWallClearanceVersion="v503";</script>'+html.slice(end);
 for(const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g))if(!/src=|application\/json/.test(m[1]))new vm.Script(m[2]);
 return html;
}
if(process.argv[1]?.endsWith('accessory-wall-clearance-v503.mjs')){
 for(const file of ['dist/index.html','dist/server/index.js'])if(fs.existsSync(file)){
  let source=fs.readFileSync(file,'utf8');if(file.endsWith('.html'))source=transform(source);else{const m=source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);if(!m)throw Error('v503 HTML missing');source=source.replace(m[0],m[0].replace(m[2],Buffer.from(transform(Buffer.from(m[2],'base64').toString())).toString('base64')));}fs.writeFileSync(file,source);
 }
 console.log('PASS v503: accessory minimum wall clearance 125 mm.');
}