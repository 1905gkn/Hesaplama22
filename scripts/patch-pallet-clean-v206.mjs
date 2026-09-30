import fs from 'node:fs';
export function transform(html){
 if(html.includes('data-pallet-clean="v206"'))return html;
 const rules=[
 ['stroke:#4b2809!important;stroke-width:1.5px!important;opacity:1!important;vector-effect:non-scaling-stroke;shape-rendering:crispEdges;rx:0!important;ry:0!important','stroke:none!important;stroke-width:0!important;opacity:1!important;vector-effect:none;shape-rendering:geometricPrecision;rx:0!important;ry:0!important'],
 ['stroke:#704018!important;stroke-width:.95px!important;opacity:1!important;vector-effect:non-scaling-stroke;shape-rendering:geometricPrecision','stroke:#ae7028!important;stroke-width:.3px!important;opacity:1!important;vector-effect:none;shape-rendering:geometricPrecision']
 ];
 for(const [a,b] of rules){if(!html.includes(a))throw Error('Missing pallet style anchor');html=html.replace(a,b);}
 return html.replace('</head>','<meta data-pallet-clean="v206">\n</head>');
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-pallet-clean-v206.mjs')){
 const file='dist/server/index.js',s=fs.readFileSync(file,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('Missing HTML');fs.writeFileSync(file,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));
}
