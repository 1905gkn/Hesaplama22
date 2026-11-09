import fs from 'node:fs';
import vm from 'node:vm';

// Axis clearance to the closest surface over the ENTIRE moving row footprint.
// A centre ray misses the high end of a skew wall and narrower column faces.
export function directionalWalls552(box,edges){
 const result={left:-Infinity,right:Infinity,top:-Infinity,bottom:Infinity};
 const consider=(direction,value,at)=>{
  const low=direction==='left'||direction==='top',boundary=box[direction];
  if(low?value>boundary+1e-8:value<boundary-1e-8)return;
  if(low?value>result[direction]:value<result[direction]){result[direction]=value;result[direction+'At']=at;}
 };
 for(const {a,b} of edges){
  if(![a?.x,a?.y,b?.x,b?.y].every(Number.isFinite))continue;
  for(const vertical of [false,true]){
   const transverse=vertical?'x':'y',axis=vertical?'y':'x',delta=b[transverse]-a[transverse];
   if(Math.abs(delta)<1e-10)continue;
   const lo=vertical?box.left:box.top,hi=vertical?box.right:box.bottom;
   const t0=Math.max(0,Math.min((lo-a[transverse])/delta,(hi-a[transverse])/delta));
   const t1=Math.min(1,Math.max((lo-a[transverse])/delta,(hi-a[transverse])/delta));
   if(t0>t1+1e-10)continue;
   for(const t of [t0,t1]){
    const value=a[axis]+t*(b[axis]-a[axis]),at=a[transverse]+t*delta;
    consider(vertical?'top':'left',value,at);consider(vertical?'bottom':'right',value,at);
   }
  }
 }
 return result;
}

export function transform(html){
 if(html.includes('data-wall-distance="v552"'))return html;
 const replace=(a,b)=>{if(!html.includes(a))throw Error('v552 missing '+a.slice(0,100));html=html.replace(a,b);};
 const start=html.indexOf('      function m2ActualWallsV228(box)'),end=html.indexOf('      /* wall-gap-basis-v353 */',start);
 if(start<0||end<start)throw Error('v552 wall geometry missing');
 const original=html.slice(start,end),cut=original.indexOf(' const xs=[],ys=[];');
 if(cut<0)throw Error('v552 centre ray missing');
 const prefix=original.slice(0,cut);
 html=html.slice(0,start)+directionalWalls552.toString()+'\n'+prefix+' return directionalWalls552(box,edges);\n})(box,m2LayoutState,m2LayoutSymbols);}\n'+html.slice(end);
 const helper=`function m2WallMovementBoundsV552(rack){
 const boxes=m2MovementMembersV267(rack).map(m2GapBoundsV346);
 if(!boxes.length)return m2GapBoundsV346(rack);
 const left=Math.min(...boxes.map(b=>b.left)),right=Math.max(...boxes.map(b=>b.right)),top=Math.min(...boxes.map(b=>b.top)),bottom=Math.max(...boxes.map(b=>b.bottom));
 return{left,right,top,bottom,cx:(left+right)/2,cy:(top+bottom)/2};
}
`;
 replace('      function m2WallMeasurements(rack) {',helper+'      function m2WallMeasurements(rack) {');
 replace('distanceBox=m2CombinedGapBoundsV346(rack),distanceKey=','distanceBox=m2WallMovementBoundsV552(rack),distanceKey=');
 replace('const box=m2CombinedGapBoundsV346(rack),actual=m2ActualWallsV228(box)','const box=m2WallMovementBoundsV552(rack),actual=m2ActualWallsV228(box)');
 replace('        for(const direction of Object.keys(result))if(!Number.isFinite(actual[direction]))delete result[direction];',`        for(const direction of Object.keys(result)){
 if(!Number.isFinite(actual[direction])){delete result[direction];continue;}
 const at=actual[direction+'At'];if(Number.isFinite(at)){
  if(direction==='left'||direction==='right')result[direction].y1=result[direction].y2=at;
  else result[direction].x1=result[direction].x2=at;
 }
}`);
 replace('(value) => m2SetWallDistance(direction, value),visible=>','(value) => m2SetWallDistance(direction, value, rackId),visible=>');
 replace("function m2SetWallDistance(direction, rawValue) {\n        const rack = m2MeasurementRack(); if (!rack) return;",`function m2SetWallDistance(direction, rawValue, rackId=null) {
        const rack = rackId==null?m2MeasurementRack():m2LayoutState.racks.find(r=>String(r.id)===String(rackId)); if (!rack) return;
        const number=Number(rawValue);if(!['left','right','top','bottom'].includes(direction)||!Number.isFinite(number)||number<0)return;`);
 const wallSetter=html.indexOf('function m2SetWallDistance(direction');
 const movement=html.indexOf('        if (!m2MoveRackOrJoinedGroup(rack,nextX,nextY))',wallSetter);
 if(movement<wallSetter)throw Error('v552 wall movement missing');
 const movementSource='        if (!m2MoveRackOrJoinedGroup(rack,nextX,nextY))';
 const movementTarget=`        const originsV552=m2MovementMembersV267(rack).map(r=>({id:r.id,x:r.x,y:r.y}));
        const validV552=m2GroupTranslationValid(originsV552,nextX-rack.x,nextY-rack.y);
        if(validV552)m2PushUndo('Duvar mesafesi');
        if (!validV552||!m2MoveRackOrJoinedGroup(rack,nextX,nextY))`;
 html=html.slice(0,movement)+movementTarget+html.slice(movement+movementSource.length);
 replace('Girilen duvar mesafesi birleşik raf grubunu alan dışına çıkarıyor veya başka bir rafla çakıştırıyor.','Bu mesafe uygulanamadı: birleşik sıranın bir bölümü duvar, kolon veya başka bir rafla çakışıyor. Mevcut konum korundu.');
 const endBody=html.lastIndexOf('</body>');html=html.slice(0,endBody)+'<script data-wall-distance="v552">window.rafexWallDistanceVersion="v552";</script>'+html.slice(endBody);
 for(const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g))if(!/src=|application\/json/.test(m[1]))new vm.Script(m[2]);return html;
}

if(process.argv[1]?.endsWith('wall-distance-v552.mjs'))for(const file of ['dist/index.html','dist/server/index.js'])if(fs.existsSync(file)){
 let source=fs.readFileSync(file,'utf8');if(file.endsWith('.html'))source=transform(source);else{const m=source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);if(!m)throw Error('v552 HTML missing');source=source.replace(m[2],Buffer.from(transform(Buffer.from(m[2],'base64').toString())).toString('base64'));}fs.writeFileSync(file,source);console.log('PASS v552 wall clearance: '+file);
}
