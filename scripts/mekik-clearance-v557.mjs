import fs from 'node:fs';
export function spacing557(pallet,rail,clearance=150){return Number(pallet)+(Number(rail)===170?280:260)+Number(clearance);}
export function sync557(event,pallet,rail){
 const total=document.getElementById('m2LevelSpacing'),gap=document.getElementById('m2PalletClearance557');
 if(!total)return Number(pallet)+(Number(rail)===170?280:260)+150;
 const assembly=Number(rail)===170?280:260,id=event?.target?.id;
 if(id==='m2PalletClearance557'&&gap?.value!=='')total.value=String(Number(pallet)+assembly+Math.max(0,Number(gap.value)||0));
 else if(id==='m2LevelH'&&total.dataset.netClearance557!==undefined)total.value=String(Number(pallet)+assembly+Number(total.dataset.netClearance557));
 const value=Math.max(Number(pallet)+assembly,Number(total.value)||Number(pallet)+assembly+150),net=value-Number(pallet)-assembly;
 total.dataset.netClearance557=String(net);
 if(gap&&document.activeElement!==gap)gap.value=String(net);
 return value;
}
export function transform(html){
 if(html.includes('data-mekik-clearance="557"'))return html;
 const replace=(a,b)=>{if(!html.includes(a))throw Error('557 missing '+a.slice(0,100));html=html.replace(a,b);};
 replace('<b>İki palet arası mesafe</b>','<b>Kat arası mesafe</b>');
 html=html.replace('["İki palet arası mesafe","Distance between two pallets","Distance entre deux palettes"]','["Kat arası mesafe","Level spacing","Espacement entre niveaux"],["Palet arası boşluk","Pallet clearance","Jeu entre palettes"],["Boşluk (mm)","Clearance (mm)","Jeu (mm)"]');
 replace('m2ActiveModule === "drive" ? 1350 : 1580','m2ActiveModule === "drive" ? 1350 : 1610');
 replace('<section class="m2-spacing-section"><b>Kat arası mesafe</b>', '${m2ActiveModule === "mekik2" ? `<section class="m2-spacing-section"><b>Palet arası boşluk</b><small>En alt kat hariç palet üstü ile üst katın travers bölümü arasındaki net boşluk.</small><label>Boşluk (mm)<input id="m2PalletClearance557" type="number" min="0" max="3000" step="10" value="150" oninput="drawMekik2(event)" onchange="drawMekik2(event)"></label></section>` : ""}<section class="m2-spacing-section"><b>Kat arası mesafe</b>');
 replace('requestedLevelH = m2Number("m2LevelSpacing", 380, 5000),','requestedLevelH = m2ActiveModule === "mekik2" ? window.rafexSyncMekikSpacing557(event,palletHeight,railHeight) : m2Number("m2LevelSpacing", 380, 5000),');
 replace('clearance = Math.max(0, levelH - palletHeight - traverseHeight),','clearance = Math.max(0, levelH - palletHeight - (m2ActiveModule === "mekik2" ? (railHeight === 170 ? 280 : 260) : traverseHeight)),');
 replace('1200 mm palet için varsayılan: ilk kat 430 mm, kat araları 1580 mm.','Palet arası boşluk 150 mm. Kat aralığı = palet yüksekliği + travers/ray bölümü (260 / 280 mm) + boşluk. İlk kat 430 / 450 mm.');
 const code='<script data-mekik-clearance="557">window.rafexSyncMekikSpacing557='+sync557.toString()+';</script>';
 const at=html.lastIndexOf('</body>');return html.slice(0,at)+code+html.slice(at);
}
if(/[\\/]mekik-clearance-v557\.mjs$/.test(process.argv[1]||''))for(const file of ['dist/index.html','dist/server/index.js'])if(fs.existsSync(file)){
 let s=fs.readFileSync(file,'utf8');if(file.endsWith('.html'))s=transform(s);else{const m=s.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);if(!m)throw Error('HTML missing');s=s.replace(m[0],m[0].replace(m[2],Buffer.from(transform(Buffer.from(m[2],'base64').toString())).toString('base64')));}fs.writeFileSync(file,s);
}