import fs from 'node:fs';
export function transform(html){
 if(html.includes('data-top-palette="v208"'))return html;
 const old='height="${p.palD}" fill="#c58b47" stroke="#744719"';
 if(!html.includes(old))throw Error('Missing shared top renderer');
 return html.replace(old,'height="${p.palD}" fill="#dfbd72" stroke="#c38838"').replace('</head>','<meta data-top-palette="v208">\n</head>');
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-top-palette-v208.mjs')){
 const file='dist/server/index.js',s=fs.readFileSync(file,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('Missing HTML');fs.writeFileSync(file,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));
}
