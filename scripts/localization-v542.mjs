import fs from 'node:fs';
export function transform(html){return html.replace(/\/(layout-3d|customer-view|customer-share-capture)\.js\?v=\d+/g,'/$1.js?v=543');}
if(/[\\/]localization-v542\.mjs$/.test(process.argv[1]||''))for(const file of ['dist/index.html','dist/server/index.js'])if(fs.existsSync(file)){
 let source=fs.readFileSync(file,'utf8');if(file.endsWith('.html'))source=transform(source);else{const m=source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);if(!m)throw Error('Missing HTML');source=source.replace(m[0],m[0].replace(m[2],Buffer.from(transform(Buffer.from(m[2],'base64').toString())).toString('base64')));source=transform(source);}fs.writeFileSync(file,source);
}
