import fs from 'node:fs';
export function transform(html){return html.replace(/\/layout-3d\.js\?v=\d+/g,'/layout-3d.js?v=537').replace(/\/customer-view\.js\?v=\d+/g,'/customer-view.js?v=537').replace(/\/(drive-in|mr)-viewer\.js(?:\?[^"'\s<>]*)?/g,'/$1-viewer.js?v=537');}
if(/[\\/]drive-gpu-v537\.mjs$/.test(process.argv[1]||''))for(const file of ['dist/index.html','dist/server/index.js'])if(fs.existsSync(file)){
 let source=fs.readFileSync(file,'utf8');if(file.endsWith('.html'))source=transform(source);else{const m=source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);if(!m)throw Error('Missing HTML');source=source.replace(m[0],m[0].replace(m[2],Buffer.from(transform(Buffer.from(m[2],'base64').toString())).toString('base64')));source=transform(source);}fs.writeFileSync(file,source);
}
