import fs from 'node:fs';
const path='dist/index.html';let html=fs.readFileSync(path,'utf8');
const tag='<script data-rafex-web-push="v440" src="/web-push.js"></script>';
html=html.replaceAll(tag,'');const end=html.lastIndexOf('</body>');if(end<0)throw Error('Document body closing tag missing.');
html=html.slice(0,end)+tag+html.slice(end);
fs.writeFileSync(path,html);
for(const name of ['web-push.js','push-service-worker.js'])fs.copyFileSync('client/'+name,'dist/'+name);
console.log('Web Push device settings and service worker emitted.');
