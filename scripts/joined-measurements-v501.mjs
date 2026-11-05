import fs from 'node:fs';import vm from 'node:vm';
export function transform(html){
 if(html.includes('data-joined-measurements="v501"'))return html;
 const replace=(a,b)=>{if(!html.includes(a))throw Error('v501 missing '+a.slice(0,90));html=html.replace(a,b);};
 replace('distanceBox=m2GapBoundsV346(rack),distanceKey=','distanceBox=m2CombinedGapBoundsV346(rack),distanceKey=');
 replace('const box=m2GapBoundsV346(rack),actual=m2ActualWallsV228(box)','const box=m2CombinedGapBoundsV346(rack),actual=m2ActualWallsV228(box)');
 replace('const table=m2PerfDistancePrepare(),a=m2GapBoundsV346(rack),selectedIds=','const table=m2PerfDistancePrepare(),a=m2CombinedGapBoundsV346(rack),selectedIds=');
 replace('const a=m2GapBoundsV346(rack),drag=m2LayoutState.drag;','const a=m2CombinedGapBoundsV346(rack),drag=m2LayoutState.drag;');
 replace('rackGapSearchV148(owner,m2GapBoundsV346(owner),table.racks','rackGapSearchV148(owner,m2CombinedGapBoundsV346(owner),table.racks');
 replace('const a=m2GapBoundsV346(rack);\n  return m2LayoutState.racks.some','const a=m2CombinedGapBoundsV346(rack);\n  return m2LayoutState.racks.some');
 // A nearby rack in each direction replaces that direction's wall measurement.
 replace('.slice(0,perDirection?2:1).map(x=>x.value)','.slice(0,perDirection?4:1).map(x=>x.value)');
 const end=html.lastIndexOf('</body>');html=html.slice(0,end)+'<script data-joined-measurements="v501">window.rafexJoinedMeasurementsVersion="v501";</script>'+html.slice(end);
 for(const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g))if(!/src=|application\/json/.test(m[1]))new vm.Script(m[2]);return html;
}
if(process.argv[1]?.endsWith('joined-measurements-v501.mjs')){
 for(const file of ['dist/index.html','dist/server/index.js'])if(fs.existsSync(file)){
  let source=fs.readFileSync(file,'utf8');if(file.endsWith('.html'))source=transform(source);else{const m=source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);if(!m)throw Error('v501 HTML missing');source=source.replace(m[0],m[0].replace(m[2],Buffer.from(transform(Buffer.from(m[2],'base64').toString())).toString('base64')));}fs.writeFileSync(file,source);
 }
 console.log('PASS v501: complete joined-row wall/rack extents in static and dragging measurements.');
}
