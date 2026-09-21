import fs from 'node:fs';
export function transform(html){
 if(html.includes('data-seismic-style="v172"'))return html;
 const start=html.indexOf('      function m2SeismicBraceSvg(brace){'),end=html.indexOf('      function m2NormalizeSeismicBraces()',start);
 if(start<0||end<0)throw Error('v172 seismic renderer missing');
 const old=html.slice(start,end),anchor='<g style="fill:none;stroke:${color}">';
 if(!old.includes(anchor))throw Error('v172 seismic stroke missing');
 const updated=old.replace(anchor,'<g data-seismic-style="v172" style="fill:none;stroke:${color};stroke-width:0.9;stroke-linecap:round;stroke-linejoin:round;stroke-opacity:.85">');
 return html.slice(0,start)+updated+html.slice(end);
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-seismic-style-v172.mjs')){
 const file='dist/server/index.js',s=fs.readFileSync(file,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('Missing HTML');
 fs.writeFileSync(file,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));
}
