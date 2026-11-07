import fs from 'node:fs';
export function transform(html){return html.replace(/\/layout-3d\.js\?v=\d+/g,'/layout-3d.js?v=535').replace(/\/customer-view\.js\?v=\d+/g,'/customer-view.js?v=535');}
if(/[\\/]scene-session-v535\.mjs$/.test(process.argv[1]||''))for(const file of ['dist/index.html','dist/server/index.js'])if(fs.existsSync(file)){
 let s=fs.readFileSync(file,'utf8');if(file.endsWith('.html'))s=transform(s);else{const m=s.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);if(!m)throw Error('Missing HTML');s=s.replace(m[0],m[0].replace(m[2],Buffer.from(transform(Buffer.from(m[2],'base64').toString())).toString('base64')));s=transform(s);}fs.writeFileSync(file,s);console.log('PASS prepared scene sessions v535: '+file);
}
