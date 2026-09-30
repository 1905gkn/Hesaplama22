import fs from 'node:fs';
export function transform(html){
 if(html.includes('data-pallet-palette="v207"'))return html;
 const changes=[['--rafex-pallet-color:#9a6028;--rafex-box-color:#c58b47','--rafex-pallet-color:#c38838;--rafex-box-color:#dfbd72'],['.m2-b2b-plan-pallet{fill:#c78330!important','.m2-b2b-plan-pallet{fill:#dfbd72!important'],['stroke:#ae7028!important;stroke-width:.3px','stroke:#c38838!important;stroke-width:.3px']];
 for(const [a,b] of changes){if(!html.includes(a))throw Error('Missing palette anchor '+a);html=html.replace(a,b);}
 return html.replace('</head>','<meta data-pallet-palette="v207">\n</head>');
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-pallet-palette-v207.mjs')){
 const file='dist/server/index.js',s=fs.readFileSync(file,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('Missing HTML');fs.writeFileSync(file,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));
}
