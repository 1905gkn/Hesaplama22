import fs from 'node:fs';
const transform=html=>html.replace(/\/(layout-3d|customer-view)\.js\?v=\d+/g,'/$1.js?v=567');
for(const file of ['dist/index.html','dist/server/index.js'])if(fs.existsSync(file)){let s=fs.readFileSync(file,'utf8');if(file.endsWith('.html'))s=transform(s);else {const m=s.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);if(m)s=s.replace(m[2],Buffer.from(transform(Buffer.from(m[2],'base64').toString())).toString('base64'));s=transform(s);}fs.writeFileSync(file,s);}
