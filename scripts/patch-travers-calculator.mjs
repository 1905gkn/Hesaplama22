import fs from 'node:fs';
const workerPath='dist/server/index.js';
let worker=fs.readFileSync(workerPath,'utf8');
const match=worker.match(/(const\s+HTML_BASE64\s*=\s*)(["'])([A-Za-z0-9+/=]+)\2/);
if(!match)throw Error('HTML_BASE64 bulunamadı');
let html=Buffer.from(match[3],'base64').toString('utf8');
html=html.replace(/<style data-rafex-travers-table>[\s\S]*?<\/style>\s*/g,'').replace(/<script data-rafex-travers-table>[\s\S]*?<\/script>\s*/g,'');
const data=JSON.parse(fs.readFileSync('client/travers-table.json','utf8'));
if(data.records.length!==880)throw Error('Travers tablo kayıt sayısı uyuşmuyor');
const js=fs.readFileSync('client/travers-calculator.js','utf8').replace('__RAFEX_MINI_TABLE__',fs.readFileSync('client/mini-rack-table.json','utf8')).replace('__RAFEX_TRAVERS_TABLE__',JSON.stringify(data).replaceAll('<','\\u003c'));
const css=fs.readFileSync('client/travers-calculator.css','utf8');
const closingBody=html.lastIndexOf('</body>');
if(closingBody<0)throw Error('HTML body kapanışı bulunamadı');
// The portal includes printable HTML strings with their own </body> tags.
// Inject only before the document's final closing tag, never into those strings.
html=html.slice(0,closingBody)+`<style data-rafex-travers-table>${css}</style><script data-rafex-travers-table>${js}</script>`+html.slice(closingBody);
worker=worker.replace(match[0],match[1]+match[2]+Buffer.from(html).toString('base64')+match[2]);
fs.writeFileSync(workerPath,worker);
console.log('Travers: iki giriş ve dört tip/kalite önerisi eklendi.');
