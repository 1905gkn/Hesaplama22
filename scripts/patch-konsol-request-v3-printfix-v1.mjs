import fs from 'node:fs';

const file='dist/server/index.js';
let source=fs.readFileSync(file,'utf8');
const match=source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);
if(!match)throw new Error('HTML_BASE64 not found for Konsol v3 print fix');
let html=Buffer.from(match[2],'base64').toString('utf8');

const startNeedle='<script>setTimeout(function(){window.print()},400)';
const endMarker="</body></html>';w.document.open();w.document.write(body);w.document.close()}";
const start=html.indexOf(startNeedle);
if(start<0)throw new Error('Konsol v3 nested print script başlangıcı bulunamadı.');
const end=html.indexOf(endMarker,start);
if(end<0)throw new Error('Konsol v3 nested print script sonu bulunamadı.');
const replacement="</body></html>';w.document.open();w.document.write(body);w.document.close();setTimeout(function(){try{w.print()}catch(_){}},400)}";
html=html.slice(0,start)+replacement+html.slice(end+endMarker.length);
if(html.includes(startNeedle))throw new Error('Konsol v3 nested print script temizlenemedi.');
if(!html.includes('w.document.close();setTimeout(function(){try{w.print()}catch(_){}},400)'))throw new Error('Konsol v3 güvenli print çağrısı eklenemedi.');

const encoded=Buffer.from(html).toString('base64');
source=source.slice(0,match.index)+match[0].replace(match[2],encoded)+source.slice(match.index+match[0].length);
fs.writeFileSync(file,source);
console.log('Konsol v3 print fix: inline nested script kaldırıldı, güvenli pencere print çağrısına geçirildi.');
