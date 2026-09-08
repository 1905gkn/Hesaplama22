import fs from 'node:fs';

const file='portal.html';
let html=fs.readFileSync(file,'utf8');
const oldBlock=`        if (!drawing) {
          const selectedType = m2SavedRackTypes[m2SelectedSavedType];
          if (selectedType) { drawing = selectedType.drawing; typeName = selectedType.name; }
          else drawing = m2LastDrawing;
        }`;
const newBlock=`        if (!drawing) {
          // "+ Raf Ekle" her zaman üst düzenleyicideki güncel tasarımı kullanır.
          // Kayıtlı bir tipin eklenmesi ayrı "Seçileni Ekle" eyleminin işidir.
          drawing = m2LastDrawing;
          if (!drawing) {
            const selectedType = m2SavedRackTypes[m2SelectedSavedType];
            if (selectedType) { drawing = selectedType.drawing; typeName = selectedType.name; }
          }
        }`;

if(html.includes(oldBlock))html=html.replace(oldBlock,newBlock);
else if(!html.includes(newBlock))throw new Error('v113: m2AddRack kaynak bloğu bulunamadı');

fs.writeFileSync(file,html);
console.log('v113: + Raf Ekle üst düzenleyicideki güncel çizimi kullanıyor; kayıtlı tip yalnız Seçileni Ekle ile ekleniyor.');
