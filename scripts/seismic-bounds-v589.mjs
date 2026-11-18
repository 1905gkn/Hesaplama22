import fs from 'node:fs';
export function transform(html){
 if(html.includes('/* seismic-bounds-v589 */'))return html;
 const start=html.indexOf('function m2SeismicBraceSvg(brace){'),end=html.indexOf('function m2NormalizeSeismicBraces()',start);
 if(start<0||end<0)throw Error('Missing seismic renderer');
 let code=html.slice(start,end);
 const old='racks.forEach((rack)=>[[-rack.w/2,-rack.h/2],[rack.w/2,-rack.h/2],[-rack.w/2,rack.h/2],[rack.w/2,rack.h/2]].forEach(([lx,ly])=>corners.push(m2RackLocalPoint(rack,lx,ly))));';
 if(!code.includes(old))throw Error('Missing seismic corners');
 code=code.replace(old,`/* seismic-bounds-v589 */
        racks.forEach((rack)=>{const feet=m2RackFootPoints(rack);if(feet.length)corners.push(...feet);else [[-rack.w/2,-rack.h/2],[rack.w/2,-rack.h/2],[-rack.w/2,rack.h/2],[rack.w/2,rack.h/2]].forEach(([lx,ly])=>corners.push(m2RackLocalPoint(rack,lx,ly)));});`);
 // Keep the complete 0.9-wide stroke, including round caps, inside its marks.
 for(const [key,axis,sign,opposite] of [['minU','u','+','max'],['maxU','u','-','min'],['minV','v','+','max'],['maxV','v','-','min']]){
  const fn=key.startsWith('min')?'min':'max',expr=`Math.${fn}(...projected.map((point)=>point.${axis}))`;
  const low=`Math.min(...projected.map((point)=>point.${axis}))`,high=`Math.max(...projected.map((point)=>point.${axis}))`;
  code=code.replace(key+'='+expr,key+'='+expr+sign+`Math.min(.45,Math.max(0,(${high}-${low})/2))`);
 }
 return html.slice(0,start)+code+html.slice(end);
}
if(/[\\/]seismic-bounds-v589\.mjs$/.test(process.argv[1]||''))for(const file of ['dist/index.html','dist/server/index.js'])if(fs.existsSync(file)){
 let s=fs.readFileSync(file,'utf8');if(file.endsWith('.html'))s=transform(s);else{const m=s.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);if(!m)throw Error('Missing HTML');s=s.replace(m[2],Buffer.from(transform(Buffer.from(m[2],'base64').toString())).toString('base64'));}fs.writeFileSync(file,s);
}
