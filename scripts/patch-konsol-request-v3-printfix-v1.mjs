import fs from 'node:fs';

const file='dist/server/index.js';
let source=fs.readFileSync(file,'utf8');
const match=source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);
if(!match)throw new Error('HTML_BASE64 not found for Konsol v3 print fix');
let html=Buffer.from(match[2],'base64').toString('utf8');

const marker='data-rafex-konsol-request="v3"';
const markerPos=html.indexOf(marker);
if(markerPos<0)throw new Error('Konsol request v3 marker bulunamadı.');
const start=html.indexOf(' function printPdf(){',markerPos);
const end=html.indexOf('\n function enhance(){',start);
if(start<0||end<0||end<=start)throw new Error('Konsol v3 printPdf fonksiyon sınırları bulunamadı.');

const safePrint=String.raw`
 function printPdf(){
   var canvas=e('konsolCanvas'),free=e('konsolFreeSvg'),w=window.open('','_blank');if(!w)return;
   var d=w.document,project=(e('konsolProjectName')&&e('konsolProjectName').value)||'Konsol Kollu Raf Projesi';
   d.open();d.write('<!doctype html><html><head><meta charset="utf-8"><title>Konsol Kollu</title></head><body></body></html>');d.close();
   var style=d.createElement('style');style.textContent='@page{size:A4 landscape;margin:10mm}*{box-sizing:border-box}body{font-family:Arial;color:#162019;margin:0}.head{border-bottom:3px solid #f2c500;padding:0 0 8px;margin-bottom:8px}.head h1{margin:0;font-size:22px}.brand{font-weight:800;color:#173c2d}.spec{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin:8px 0}.spec div{background:#f3f6f4;padding:7px;border-radius:5px;font-size:10px}.spec b{display:block;color:#173c2d;margin-bottom:2px}.views{display:grid;grid-template-columns:1fr 1fr;gap:8px}.view{border:1px solid #dce4df;border-radius:7px;padding:7px}.view h2{margin:0 0 6px;font-size:13px;color:#173c2d}.view img,.view svg{width:100%;height:145mm;object-fit:contain}';d.head.appendChild(style);
   var head=d.createElement('div');head.className='head';var h=d.createElement('h1');h.textContent=project;head.appendChild(h);var brand=d.createElement('div');brand.className='brand';brand.textContent='RAFEX · KONSOL KOLLU';head.appendChild(brand);d.body.appendChild(head);
   var mode=e('konsolHeightMode')&&e('konsolHeightMode').value==='manual'?'Manuel':'Otomatik';
   var armColor=e('konsolArmColor')&&e('konsolArmColor').value==='ral2004'?'RAL-2004':'RAL-1007';
   var side=e('konsolSide')&&e('konsolSide').value==='double'?'Çift taraflı':'Tek taraflı';
   var specs=[['Sistem',side],['Ayak arası',fmt(n('konsolSpacing',1500))+' mm'],['Ayak yüksekliği',fmt(n('konsolHeight',4500))+' mm · '+mode],['Kat derinliği',fmt(n('konsolArmLength',1200))+' mm'],['Taban Kat derinliği',fmt(n('konsolBaseDepth',1200))+' mm'],['Kattaki ağırlık',fmt(n('konsolLevelLoad',500))+' kg'],['Ayak rengi','RAL-5010'],['Kol rengi',armColor]];
   var specBox=d.createElement('div');specBox.className='spec';specs.forEach(function(row){var box=d.createElement('div'),b=d.createElement('b');b.textContent=row[0];box.appendChild(b);box.appendChild(d.createTextNode(row[1]));specBox.appendChild(box)});d.body.appendChild(specBox);
   var views=d.createElement('div');views.className='views';var left=d.createElement('div');left.className='view';var lt=d.createElement('h2');lt.textContent='3D / Ön Görünüş';left.appendChild(lt);if(canvas){try{var img=d.createElement('img');img.src=canvas.toDataURL('image/png');left.appendChild(img)}catch(_){}}views.appendChild(left);
   var right=d.createElement('div');right.className='view';var rt=d.createElement('h2');rt.textContent='Serbest Yerleşim';right.appendChild(rt);if(free){var holder=d.createElement('div');holder.innerHTML=free.outerHTML;right.appendChild(holder)}views.appendChild(right);d.body.appendChild(views);
   setTimeout(function(){try{w.print()}catch(_){}},400)
 }
`;
html=html.slice(0,start)+safePrint+html.slice(end);
if(html.includes('<script>setTimeout(function(){window.print()},400)'))throw new Error('Konsol v3 nested print script canlı HTML içinde kaldı.');
if(!html.includes("['Taban Kat derinliği',fmt(n('konsolBaseDepth',1200))+' mm']"))throw new Error('Konsol v3 güvenli A4 print alanları eklenemedi.');

const encoded=Buffer.from(html).toString('base64');
source=source.slice(0,match.index)+match[0].replace(match[2],encoded)+source.slice(match.index+match[0].length);
fs.writeFileSync(file,source);
console.log('Konsol v3 print fix: printPdf güvenli DOM tabanlı A4 çıktıya geçirildi.');
