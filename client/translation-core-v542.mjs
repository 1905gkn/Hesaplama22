// Only registered interface labels and structured captions are translated.
// Names, product codes and free-form user content must be marked translate="no".
export function createInterfaceTranslator(rows) {
 const normalize=s=>s.trim().replace(/\s+/g,' ').toLocaleLowerCase('tr');
 const maps={en:new Map(),fr:new Map()};
 for(const [tr,en,fr] of rows)for(const [language,value]of [['en',en],['fr',fr]])maps[language].set(normalize(tr),value);
 return function translate(source,language='tr'){
  if(typeof source!=='string'||!maps[language])return source;
  const input=source.trim(),map=maps[language],fr=language==='fr';
  if(/^[+−-]?[\d\s.,%°]+$/.test(input))return source;
  const exact=map.get(normalize(input));if(exact)return source.replace(input,exact);
  const replace=(pattern,render)=>{const m=input.match(pattern);return m?source.replace(input,render(m)):null};
  let result;
  const patterns=[
   [/^([⧉◯▣])\s*(.+)$/,m=>m[1]+' '+translate(m[2],language)],
   [/^(AÇI|Sağa\/Sola|Yukarı\/Aşağı)\s*°$/,m=>translate(m[1],language)+' °'],
   [/^Kaynak proje #(\d+)$/,m=>(fr?'Projet source n°':'Source project #')+m[1]],
   [/^“([\s\S]+)”$/,m=>'“'+translate(m[1],language)+'”'],
   [/^Raftan rafa:\s*(Açık|Kapalı)$/,m=>translate('Raftan rafa',language)+': '+(fr?(m[1]==='Açık'?'Activé':'Désactivé'):(m[1]==='Açık'?'On':'Off'))],
   [/^(.+) ara$/i,m=>(fr?'Rechercher : ':'Search: ')+translate(m[1],language)],
   [/^✓\s*Okundu$/,()=> '✓ '+translate('Okundu',language)],
   [/^Bildirimler, (\d+) okunmamış$/,m=>translate('Bildirimler',language)+', '+m[1]+' '+(fr?'non lues':'unread')],
   [/^([＋+↶])\s*(.+?)(\s+Ctrl\+[A-Z])?$/,m=>m[1]+' '+translate(m[2],language)+(m[3]||'')],
   [/^(\d+)\.\s*alan adı$/i,m=>(fr?'Nom de la zone ':'Area name ')+m[1]],
   [/^Maksimum (\d+) (kat|palet|göz)$/i,m=>(fr?'Maximum ':'Maximum ')+m[1]+' '+({kat:fr?'niveaux':'levels',palet:fr?'palettes':'pallets',göz:fr?'travées':'bays'}[m[2].toLocaleLowerCase('tr')])],
   [/^(Zemin)\s*\+\s*(\d+)\s+kat$/i,m=>(fr?'Sol':'Ground')+' + '+m[2]+' '+(fr?'niveaux':'levels')],
   [/^(\d+)\s+ayak\s*\/\s*(\d+)\s+düz arabağ$/i,m=>m[1]+' '+(fr?'échelles':'frames')+' / '+m[2]+' '+(fr?'entretoises droites':'straight spacers')],
   [/^(\d+)\s+ayak$/i,m=>m[1]+' '+(fr?'échelles':'frames')],
   [/^(Palet|Ayak|kapasite|tablo yüksekliği)\s+([\dA-Z][\s\S]*)$/,m=>translate(m[1],language)+' '+m[2]],
   [/^([\d.,]+)\s*kg\/ayak$/,m=>m[1]+' kg/'+(fr?'échelle':'frame')],
   [/^([\d.,–-]+)\s*kg palet ağırlığı aralığı$/,m=>m[1]+' kg '+translate('palet ağırlığı aralığı',language)],
   [/^(\d+)\. travers üst kotu$/,m=>fr?`Cote supérieure de la lisse ${m[1]}`:`Beam ${m[1]} top elevation`],
   [/^([\w-]+) kesitini değiştir$/,m=>fr?`Modifier la coupe ${m[1]}`:`Change section ${m[1]}`],
   [/^([\w-]+) kaydını sil$/,m=>fr?`Supprimer ${m[1]}`:`Delete ${m[1]}`],
   [/^(\d+)\. bölüme ayak profili merkezinden karşı ayak profili merkezine çapraz ekle$/,m=>fr?`Ajouter un contreventement entre les axes des montants de la travée ${m[1]}`:`Add bracing between upright centers in bay ${m[1]}`],
   [/^Travers ([\d.,]+) \+ sol ayak ([\d.,]+) \+ sağ ayak ([\d.,]+) = ([\d.,]+ mm)$/,m=>fr?`Lisse ${m[1]} + montant gauche ${m[2]} + montant droit ${m[3]} = ${m[4]}`:`Beam ${m[1]} + left upright ${m[2]} + right upright ${m[3]} = ${m[4]}`],
   [/^(.+?)\s*(\*|×|\+)$/,m=>translate(m[1],language)+' '+m[2]],
   [/^(.+)\s+—\s+([\d.,]+ mm)$/,m=>translate(m[1],language)+' — '+m[2]],
   [/^(Kayıtlı Drive In Raf Tipleri)\s*(\(\d+\))$/,m=>translate(m[1],language)+' '+m[2]],
   [/^([\w-]+) rafını (incele|kopyala)$/,m=>m[2]==='incele'?(fr?`Examiner le rayonnage ${m[1]}`:`Inspect rack ${m[1]}`):(fr?`Copier le rayonnage ${m[1]}`:`Copy rack ${m[1]}`)],
   [/^([\d.,]+) kg\/tava$/,m=>m[1]+' kg/'+(fr?'plateau':'panel')],
   [/^([\d.,]+ mm) bölüm için:(.*)$/,m=>fr?`Pour une travée de ${m[1]} :${m[2]}`:`For a ${m[1]} bay:${m[2]}`],
   [/^(Dinamik Rapor|Statik Rapor|Diğer Raporlar ve Talepler) Talebi$/,m=>translate(m[1],language)+(fr?' — demande':' Request')],
   [/^(Palet tipi|Revizyon|Yorumlar|Kat|Ayak)\s*(\d+|\(\d+\))$/i,m=>translate(m[1],language)+' '+m[2]],
   [/^(\d+)\.\s*ayak$/i,m=>(fr?'Échelle ':'Frame ')+m[1]],
   [/^(\d+)\.\s*kat$/i,m=>(fr?'Niveau ':'Level ')+m[1]],
   [/^(\d+)\s+(yanıt|raf|raf modülü|okunmamış)$/i,m=>m[1]+' '+({yanıt:fr?'réponses':'responses',raf:fr?'rayonnages':'racks','raf modülü':fr?'modules de rayonnage':'rack modules',okunmamış:fr?'non lues':'unread'}[m[2].toLocaleLowerCase('tr')])],
   [/^(K\d+)\s*·\s*palet derinliği$/i,m=>m[1]+' · '+(fr?'palettes en profondeur':'pallets deep')],
   [/^(.+?)\s*(↑|↓)$/,m=>translate(m[1],language)+' '+m[2]],
   [/^(.*)\s+mevcut çalışmaya kopyalandı\. Kaydetmek için Ürünleri Tamamla veya Yanıtı kaydet kullanın\.$/,m=>m[1]+(fr?' copié dans le travail actuel. Cliquez sur Finaliser les produits ou Enregistrer la réponse.':' copied to the current work. Select Finalize Products or Save response.')],
   [/^(.*)\s+taslak olarak saklandı\. Dosyaları detayından tamamlayın\.(.*)$/,m=>m[1]+(fr?' enregistré en brouillon. Complétez les fichiers dans les détails.':' saved as draft. Complete the files in the details.')+m[2]],
   [/^(PDF gösterilemedi|Yanıt veya dosya işlemi)\s*:\s*(.*)$/,m=>(m[1]==='PDF gösterilemedi'?(fr?'Impossible d’afficher le PDF':'Could not display PDF'):(fr?'Réponse ou transfert de fichier':'Response or file operation'))+': '+translate(m[2],language)],
   [/^Kod (.+) adresine gönderildi\. 10 dakika içinde girin\.$/,m=>fr?`Code envoyé à ${m[1]}. Saisissez-le dans les 10 minutes.`:`Code sent to ${m[1]}. Enter it within 10 minutes.`],
   [/^Onayınız için teşekkürler\. (.*)$/,m=>translate('Onayınız için teşekkürler.',language)+' '+m[1]],
   [/^(.*) bloğunu incele$/,m=>fr?`Examiner le bloc ${m[1]}`:`Inspect block ${m[1]}`],
   [/^(.*) bağımsız blok görünümü$/,m=>m[1]+' · '+(fr?'vue du bloc':'block view')],
   [/^(Forkliftler): (\d+)$/,m=>(fr?'Chariots élévateurs':'Forklifts')+': '+m[2]],
   [/^Forklift (\d+) seçildi\. Gideceği boş zemini tıklayın\.$/,m=>fr?`Chariot ${m[1]} sélectionné. Cliquez sur une zone de sol libre.`:`Forklift ${m[1]} selected. Click an empty floor location.`],
   [/^Forklift (\d+) için hedef belirlendi\. Varınca otomatik dolaşıma döner\.$/,m=>fr?`Destination définie pour le chariot ${m[1]}. Le déplacement automatique reprendra à son arrivée.`:`Destination set for forklift ${m[1]}. Automatic movement resumes on arrival.`]
  ];
  for(const [pattern,render]of patterns){result=replace(pattern,render);if(result!==null)return result;}
  const pieces=input.split(/(\s+[·|]\s+|:\s*)/);
  if(pieces.length>1)return source.replace(input,pieces.map((p,i)=>i%2?p:translate(p,language)).join(''));
  return source;
 };
}
