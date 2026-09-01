import fs from 'node:fs';

const file='dist/server/index.js';
let source=fs.readFileSync(file,'utf8');
const match=source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);
if(!match) throw new Error('Legacy Mekik cleanup: HTML_BASE64 bulunamadi.');
let html=Buffer.from(match[2],'base64').toString('utf8');

// Eski v25 runtime'inin Mekik ön görünüşünü yeniden kuran bölümü, son GLB v2
// renderer ile aynı anda çalışıp drawMekik2() çağırıyordu. Bu çağrı üst/yan/ön
// görünüşleri birlikte yeniden çizdiği için Ortak Çizim üst görünüşünde titreme
// oluşturabiliyordu. v25'in ürün listesi, BOM ve mesafe düzeltmeleri korunur;
// yalnız eski ön-görünüş onarım motoru devre dışı bırakılır.
const pattern=/const repairMekikFront=\(page\)=>\{[\s\S]*?\n  \};\n\n  \/\* Mekik: normal tasiyici/;
if(pattern.test(html)){
  html=html.replace(pattern,"const repairMekikFront=()=>{};\n\n  /* Mekik: normal tasiyici");
}else if(!html.includes('const repairMekikFront=()=>{};')){
  throw new Error('Legacy Mekik cleanup: eski repairMekikFront blogu bulunamadi.');
}

// Eski referans ön görünüş DOM'u build çıktısında kalmışsa temizle. Son GLB v2
// kendi canvas'ını yönetir; iki renderer aynı host için yarışmamalıdır.
html=html.replace(/<svg[^>]*data-rafex-reference-front="v26"[\s\S]*?<\/svg>/g,'');

if(!html.includes('const repairMekikFront=()=>{};')) throw new Error('Legacy Mekik cleanup dogrulanamadi.');
const encoded=Buffer.from(html,'utf8').toString('base64');
source=source.slice(0,match.index)+match[0].replace(match[2],encoded)+source.slice(match.index+match[0].length);
fs.writeFileSync(file,source);
console.log('Legacy Mekik front repair kaldirildi; son GLB v2 tek on-gorunus otoritesi.');
