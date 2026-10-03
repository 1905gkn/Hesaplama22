import fs from 'node:fs';
export function transform(html){
 if(html.includes('/* selected-anchor-v268 */'))return html;
 const replace=(a,b)=>{if(html.split(a).length!==2)throw Error('Missing unique anchor '+a.slice(0,85));html=html.replace(a,b);};
 // Measurement geometry belongs to the block being manipulated, not the moving selection envelope.
 for(const name of ['m2PerfLiveNearestRackGap','m2NearestRackGap','m2NearestColumnGap','m2WallMeasurements']){
  const start=html.indexOf('      function '+name+'('),end=html.indexOf('\n      function ',start+10);if(start<0||end<0)throw Error(name);
  html=html.slice(0,start)+html.slice(start,end).replaceAll('m2CombinedRackBounds(rack)','m2RackBounds(rack)')+html.slice(end);
 }
 replace('rackGapSearchV148(owner,m2CombinedRackBounds(owner),','rackGapSearchV148(owner,m2RackBounds(owner),');
 replace('var A=m2CombinedRackBounds(a),B=m2RackBounds(b),candidates=[];','var A=m2RackBounds(a),B=m2RackBounds(b),candidates=[];');
 replace('const a=m2CombinedRackBounds(owner),b=m2CombinedRackBounds(other),candidates=[]','const a=m2RackBounds(owner),b=m2RackBounds(other),candidates=[]');
 replace('const bounds={left:Math.min(...boxes.map(b=>b.left)),right:Math.max(...boxes.map(b=>b.right)),top:Math.min(...boxes.map(b=>b.top)),bottom:Math.max(...boxes.map(b=>b.bottom))};','/* selected-anchor-v268 */\n    const bounds=m2RackBounds(rack,drag.originX,drag.originY,rack.angle);');
 const start=html.indexOf('        const horizontal = direction === "left" || direction === "right", middle = (laneStart + laneEnd) / 2, span = laneEnd - laneStart;');
 const end=html.indexOf('        for (const lane of lanes) {',start);if(start<0||end<0)throw Error('Gap lane anchor');
 html=html.slice(0,start)+`        const horizontal=direction==='left'||direction==='right',anchor=m2RackBounds(rack),group=m2CombinedRackBounds(rack);
        const nearStart=horizontal?(anchor.top+anchor.bottom<=group.top+group.bottom):(anchor.left+anchor.right<=group.left+group.right);
        const lanes=nearStart?[laneStart,laneEnd]:[laneEnd,laneStart];
`+html.slice(end);
 return html;
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-anchor-measure-v268.mjs')){const f='dist/server/index.js',s=fs.readFileSync(f,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('Missing HTML');fs.writeFileSync(f,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));}
