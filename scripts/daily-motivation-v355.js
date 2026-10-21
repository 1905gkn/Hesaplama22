(()=>{
 const sentences=[
 'Birlikte attığımız her adım, ortak hedefimizi biraz daha yaklaştırır.',
 'Bugünün özenli emeği, yarının sağlam işinin temelidir.',
 'Bilgimizi paylaştıkça ekibimizin gücü büyür.',
 'Küçük bir ilerleme de ilerlemedir; bugün bir adım daha atalım.',
 'İyi bir ekip, herkesin katkısına yer açarak güçlenir.',
 'Emek verdiğimiz her ayrıntı, yaptığımız işe değer katar.',
 'Birbirimizi dinlediğimizde daha iyi çözümler buluruz.',
 'Sabırla sürdürülen çalışma, zor işleri tamamlanabilir kılar.',
 'Ortak başarı, birbirine destek olan insanların eseridir.',
 'Bugün gösterdiğimiz dikkat, yarın duyacağımız güveni artırır.',
 'Bir arkadaşımıza verdiğimiz destek, bütün ekibe güç katar.',
 'İşimizi adım adım geliştirmek, kalıcı başarının yolunu açar.',
 'Aynı hedefe emek veren farklı bakışlar, iyi sonuçlar üretir.',
 'Her gün öğrendiğimiz bir şey, işimizi daha iyi yapmamızı sağlar.',
 'Güçlü işler, birbirine güvenen ekiplerin ellerinde yükselir.',
 'Düzenli ve özenli çalışma, büyük hedefleri küçük adımlara böler.',
 'Birlikte düşünmek, tek başına görülmeyen yolları açar.',
 'Bugün tamamladığımız her iş, yarının yükünü hafifletir.',
 'Emeği fark etmek ve takdir etmek, birlikte çalışma isteğini büyütür.',
 'Bir işi iyi yapmak, ona ayırdığımız özenle başlar.',
 'Birbirimizin başarısını desteklediğimizde hepimiz ileri gideriz.',
 'Zor bir işte ilk adım, işi küçük ve açık parçalara ayırmaktır.',
 'Dayanışma, yoğun günlerde yükü paylaşmamızı sağlar.',
 'Dünden öğrendiklerimizi bugünün işine katmak bizi geliştirir.',
 'Herkesin fikrine kulak vermek, ortak aklı güçlendirir.',
 'İstikrarlı emek, zaman içinde gözle görülür fark yaratır.',
 'Birlikte çalışırken paylaştığımız sorumluluk, ortak güvene dönüşür.',
 'Bugün yaptığımız küçük bir iyileştirme, yarın birçok işi kolaylaştırır.',
 'Başarıyı paylaşmak, yeni hedeflere birlikte yürüme isteği verir.',
 'Özenle yapılan hazırlık, işin devamını daha sağlam kılar.',
 'Ekip olmak, gerektiğinde birbirimizin yanında durabilmektir.',
 'Bir işi tamamlamanın yolu, ona düzenli olarak emek vermektir.',
 'Açık iletişim, birlikte üretmenin en sağlam dayanaklarından biridir.',
 'Her doğru kontrol, emeğimizi koruyan bir adımdır.',
 'Birlikte kurduğumuz güven, işimizin kalitesine yansır.',
 'Bugünün sorusunu sormak, yarının hatasını önleyebilir.',
 'Paylaşılan deneyim, bütün ekibin işini kolaylaştırır.',
 'Kaliteli bir sonuç, sabırla bir araya gelen küçük doğrularla oluşur.',
 'Aynı hedefe birlikte yönelmek, çabamızı daha etkili kılar.',
 'Kendimizi geliştirmek için bugün de bir fırsatımız var.',
 'Bir teşekkür, verilen emeğin görüldüğünü hissettirir.',
 'Dikkatle atılan küçük adımlar, sağlam bir yol oluşturur.',
 'Birlikte çözüm aradığımızda güçlükleri daha kolay aşarız.',
 'İyi çalışmak, gerektiğinde durup işi yeniden değerlendirmeyi de içerir.',
 'Ekibin gücü, her kişinin emeğinin değer bulmasıyla artar.',
 'Bugün gösterdiğimiz gayret, gelecekteki işlerimize deneyim kazandırır.',
 'Birbirimize öğrettiğimiz her şey, ortak birikimimize eklenir.',
 'İşi sahiplenmek, daha iyi bir yol aramakla başlar.',
 'Bir hedefi paylaşmak, ona ulaşma sorumluluğunu da paylaşmaktır.',
 'Emek ve dikkat bir araya geldiğinde yaptığımız iş güçlenir.',
 'İyi bir ekipte yardım istemek de yardım etmek kadar değerlidir.',
 'Her tamamlanan adım, bir sonraki adım için cesaret verir.',
 'Farklı yeteneklerimizi birleştirdiğimizde daha güçlü sonuçlar alırız.',
 'Bugün öğrendiğimiz bir yöntem, yarın zamanımızı daha iyi kullanmamızı sağlar.',
 'Birlikte ürettiğimiz işin değeri, herkesin katkısıyla büyür.',
 'Planlı bir başlangıç, günün emeğini daha verimli kılar.',
 'Birbirimize duyduğumuz saygı, ortak çalışmamızın temelidir.',
 'Gelişmek, her gün aynı işe biraz daha bilinçli yaklaşmaktır.',
 'Bir işi birlikte başarmak, ortak güvenimizi tazeler.',
 'Bugünün emeğine değer verelim; iyi işler böyle büyür.'
 ];
 function day(date=new Date()){
  const p=Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Istanbul',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(date).filter(p=>p.type!=='literal').map(p=>[p.type,p.value]));
  return Math.floor(Date.UTC(Number(p.year),Number(p.month)-1,Number(p.day))/86400000);
 }
 function forDay(serial){
  // Alternate two pools so consecutive days share no sentences.
  const pool=sentences.map((text,i)=>({text,theme:i%2,group:Math.floor(i/2)%2})).filter(s=>s.group===((serial%2)+2)%2);let seed=(serial^0x5f3759df)>>>0;
  const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  for(let i=pool.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}
  const selected=[...pool.filter(s=>s.theme===0).slice(0,2),...pool.filter(s=>s.theme===1).slice(0,2)];selected.push(pool.find(s=>!selected.includes(s)));
  for(let i=selected.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[selected[i],selected[j]]=[selected[j],selected[i]];}
  return selected.map(s=>s.text);
 }
 function refresh(){
  const root=document.querySelector('.rafex-daily-motivation-v355');if(!root)return;
  const serial=day();if(root.dataset.day===String(serial))return;
  const list=root.querySelector('ol');if(!list)return;
  list.replaceChildren(...forDay(serial).map(text=>{const item=document.createElement('li');item.textContent=text;return item;}));root.dataset.day=String(serial);
  const date=root.closest('.welcome-hero')?.querySelector('.welcome-date');if(date)date.textContent=new Intl.DateTimeFormat(typeof localeForLanguage==='function'?localeForLanguage():'tr-TR',{timeZone:'Europe/Istanbul',weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(new Date());
 }
 window.rafexDailyMotivationV355={day,forDay,refresh};refresh();
 setInterval(refresh,60000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});
})();

