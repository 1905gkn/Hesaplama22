import fs from 'node:fs';

const file='portal.html';
let html=fs.readFileSync(file,'utf8');
const oldBlock=`        if (!drawing) {
          const selectedType = m2SavedRackTypes[m2SelectedSavedType];
          if (selectedType) { drawing = selectedType.drawing; typeName = selectedType.name; }
          else drawing = m2LastDrawing;
        }`;
const previousBlock=`        if (!drawing) {
          // "+ Raf Ekle" her zaman üst düzenleyicideki güncel tasarımı kullanır.
          // Kayıtlı bir tipin eklenmesi ayrı "Seçileni Ekle" eyleminin işidir.
          drawing = m2LastDrawing;
          if (!drawing) {
            const selectedType = m2SavedRackTypes[m2SelectedSavedType];
            if (selectedType) { drawing = selectedType.drawing; typeName = selectedType.name; }
          }
        }`;
const newBlock=`        if (!drawing) {
          // "+ Raf Ekle" her zaman üst düzenleyicideki güncel tasarımı kullanır.
          // Kayıtlı bir tipin eklenmesi ayrı "Seçileni Ekle" eyleminin işidir.
          drawing = m2LastDrawing;
          // Toplama katı alanları kendi canlı durumunda tutulur. Son çizimden sonra
          // aksesuar değiştiyse güncel B2B girdisini rafa eklenirken tekrar birleştir.
          if (drawing && m2ActiveModule === "b2b" && typeof b2bReadInputState === "function") {
            const liveB2B = b2bReadInputState();
            if (liveB2B) drawing = { ...drawing, b2b:liveB2B };
          }
          if (!drawing) {
            const selectedType = m2SavedRackTypes[m2SelectedSavedType];
            if (selectedType) { drawing = selectedType.drawing; typeName = selectedType.name; }
          }
        }`;

if(html.includes(oldBlock))html=html.replace(oldBlock,newBlock);
else if(html.includes(previousBlock))html=html.replace(previousBlock,newBlock);
else if(!html.includes(newBlock))throw new Error('v113: m2AddRack kaynak bloğu bulunamadı');

fs.writeFileSync(file,html);
console.log('v113: + Raf Ekle üst düzenleyicideki güncel çizimi kullanıyor; kayıtlı tip yalnız Seçileni Ekle ile ekleniyor.');
