(()=>{
 const quotes=[
  {text:'Tek başımıza çok az şey yapabiliriz; birlikte çok şey başarabiliriz.',author:'Helen Keller',source:'American Foundation for the Blind · Sahne metni',url:'https://afb.org/about-afb/history/helen-keller/quotes/helen-keller-quotes-progress',translated:true},
  {text:'İyimserlik, başarıya götüren inançtır; umut olmadan hiçbir şey yapılamaz.',author:'Helen Keller',source:'American Foundation for the Blind · Optimism (1903)',url:'https://www.afb.org/about-afb/history/helen-keller/quotes',translated:true},
  {text:'Yapman gerekeni yapmaya karar ver; kararını mutlaka yerine getir.',author:'Benjamin Franklin',source:'Otobiyografi · II. Bölüm, Kararlılık',url:'https://www.gutenberg.org/files/148/148-h/148-h.htm',translated:true},
  {text:'Zamanı boşa harcama; daima yararlı bir işle uğraş.',author:'Benjamin Franklin',source:'Otobiyografi · II. Bölüm, Çalışkanlık',url:'https://www.gutenberg.org/files/148/148-h/148-h.htm',translated:true},
  {text:'Bin li’lik bir yolculuk tek adımla başlar.',author:'Lao Tzu',source:'Tao Te Ching · 64. Bölüm (li: eski Çin uzunluk birimi)',url:'https://www.gutenberg.org/files/216/216-h/216-h.htm',translated:true},
  {text:'Başkalarını yenen güçlüdür; kendini yenen kudretlidir.',author:'Lao Tzu',source:'Tao Te Ching · 33. Bölüm',url:'https://www.gutenberg.org/files/216/216-h/216-h.htm',translated:true},
  {text:'İyi insanın nasıl olması gerektiğini tartışmayı bırak; öyle biri ol.',author:'Marcus Aurelius',source:'Kendime Düşünceler · X.18',url:'https://www.gutenberg.org/files/2680/2680-h/2680-h.htm',translated:true},
  {text:'Kovana yararlı olmayan, arıya da yararlı değildir.',author:'Marcus Aurelius',source:'Kendime Düşünceler · VI.49',url:'https://www.gutenberg.org/files/2680/2680-h/2680-h.htm',translated:true},
  {text:'Deha, yüzde bir ilham ve yüzde doksan dokuz terdir.',author:'Thomas A. Edison',source:'Thomas Edison National Historical Park · Edison and His Era',url:'https://home.nps.gov/edis/learn/kidsyouth/edison-and-his-era.htm',translated:true},
  {text:'Eğitim, dünyayı değiştirmek için kullanabileceğiniz en güçlü silahtır.',author:'Nelson Mandela',source:'Nelson Mandela Foundation · Education Initiatives',url:'https://www.nelsonmandela.org/nm100-education',translated:true},
  {text:'Milletimiz her güçlük ve zorluk karşısında durmadan, ilerlemekte ve yükselmektedir.',author:'Mustafa Kemal Atatürk',source:'Atatürk Araştırma Merkezi · Söylev ve Demeçleri, Cilt III',url:'https://atam.gov.tr/wp-content/uploads/2024/03/Ataturkun-Soylev-ve-Demecleri-C3.pdf'},
  {text:'Yurtta barış, dünyada barış.',author:'Mustafa Kemal Atatürk',source:'Atatürk Araştırma Merkezi · Atatürk’ün Üstün Kişiliği',url:'https://atam.gov.tr/ataturkun-ustun-kisiligi/'},
  {text:'Anlamak, ilerlemek için gereklidir.',author:'Helen Keller',source:'American Foundation for the Blind · Harvard konuşma taslağı (1955)',url:'https://afb.org/about-afb/history/helen-keller/quotes/helen-keller-quotes-progress',translated:true},
  {text:'Başkalarının hayatını aydınlatmaya çalışmadan gerçekten mutlu olamayız.',author:'Helen Keller',source:'American Foundation for the Blind · My New Speech',url:'https://www.afb.org/about-afb/history/helen-keller/quotes',translated:true},
  {"text":"Yalnızca başkalarına veya kendine yararlı olabilecek şeyleri söyle; boş konuşmalardan kaçın.","author":"Benjamin Franklin","url":"https://www.gutenberg.org/files/148/148-h/148-h.htm","source":"Otobiyografi · II. Bölüm · Sessizlik","translated":true},
  {"text":"Her şeyin bir yeri, her işin bir zamanı olsun.","author":"Benjamin Franklin","url":"https://www.gutenberg.org/files/148/148-h/148-h.htm","source":"Otobiyografi · II. Bölüm · Düzen","translated":true},
  {"text":"Yalnızca başkalarına veya kendine iyilik sağlayacak harcamalar yap; hiçbir şeyi israf etme.","author":"Benjamin Franklin","url":"https://www.gutenberg.org/files/148/148-h/148-h.htm","source":"Otobiyografi · II. Bölüm · Tutumluluk","translated":true},
  {"text":"İncitici bir aldatmaya başvurma; dürüst ve adil düşün.","author":"Benjamin Franklin","url":"https://www.gutenberg.org/files/148/148-h/148-h.htm","source":"Otobiyografi · II. Bölüm · İçtenlik","translated":true},
  {"text":"Ne zarar vererek ne de görevin olan iyilikleri esirgeyerek kimseye haksızlık et.","author":"Benjamin Franklin","url":"https://www.gutenberg.org/files/148/148-h/148-h.htm","source":"Otobiyografi · II. Bölüm · Adalet","translated":true},
  {"text":"Aşırılıklardan kaçın.","author":"Benjamin Franklin","url":"https://www.gutenberg.org/files/148/148-h/148-h.htm","source":"Otobiyografi · II. Bölüm · Ölçülülük","translated":true},
  {"text":"Önemsiz şeylerden, olağan veya kaçınılmaz kazalardan dolayı huzurunu kaybetme.","author":"Benjamin Franklin","url":"https://www.gutenberg.org/files/148/148-h/148-h.htm","source":"Otobiyografi · II. Bölüm · Sükûnet","translated":true},
  {"text":"Hepsini aynı anda denemek yerine, her seferinde birine odaklanmanın daha iyi olacağını düşündüm.","author":"Benjamin Franklin","url":"https://www.gutenberg.org/files/148/148-h/148-h.htm","source":"Otobiyografi · II. Bölüm · Erdem alışkanlığı","translated":true},
  {"text":"Kollarını dolduran ağaç, küçücük bir filizden büyümüştür.","author":"Lao Tzu","url":"https://www.gutenberg.org/files/216/216-h/216-h.htm","source":"Tao Te Ching · 64. Bölüm","translated":true},
  {"text":"Dokuz katlı kule, küçük bir toprak yığınından yükselmiştir.","author":"Lao Tzu","url":"https://www.gutenberg.org/files/216/216-h/216-h.htm","source":"Tao Te Ching · 64. Bölüm","translated":true},
  {"text":"İnsanlar sonunda da başlangıçtaki kadar dikkatli olsaydı işlerini böyle mahvetmezlerdi.","author":"Lao Tzu","url":"https://www.gutenberg.org/files/216/216-h/216-h.htm","source":"Tao Te Ching · 64. Bölüm","translated":true},
  {"text":"Büyük olacak işleri henüz küçükken yap.","author":"Lao Tzu","url":"https://www.gutenberg.org/files/216/216-h/216-h.htm","source":"Tao Te Ching · 63. Bölüm","translated":true},
  {"text":"Zor işleri henüz kolayken ele al.","author":"Lao Tzu","url":"https://www.gutenberg.org/files/216/216-h/216-h.htm","source":"Tao Te Ching · 63. Bölüm","translated":true},
  {"text":"Kolayca söz veren, güveni az korur.","author":"Lao Tzu","url":"https://www.gutenberg.org/files/216/216-h/216-h.htm","source":"Tao Te Ching · 63. Bölüm","translated":true},
  {"text":"İnsanı yönetmek için ölçülülükten iyisi yoktur.","author":"Lao Tzu","url":"https://www.gutenberg.org/files/216/216-h/216-h.htm","source":"Tao Te Ching · 59. Bölüm","translated":true},
  {"text":"Yumuşaklık sayesinde cesur olabilirim.","author":"Lao Tzu","url":"https://www.gutenberg.org/files/216/216-h/216-h.htm","source":"Tao Te Ching · 67. Bölüm","translated":true},
  {"text":"Bazı şeyler gücümüz dahilindedir, bazıları değildir.","author":"Epiktetos","url":"https://www.gutenberg.org/files/45109/45109-h/45109-h.htm","source":"El Kitabı · I","translated":true},
  {"text":"İnsanları tedirgin eden şeyler değil, şeyler hakkındaki düşünceleridir.","author":"Epiktetos","url":"https://www.gutenberg.org/files/45109/45109-h/45109-h.htm","source":"El Kitabı · V","translated":true},
  {"text":"Küçük şeylerden başlayın.","author":"Epiktetos","url":"https://www.gutenberg.org/files/45109/45109-h/45109-h.htm","source":"El Kitabı · XII","translated":true},
  {"text":"Her olay karşısında, ondan yararlanmak için hangi yeteneğe sahip olduğunu kendine sor.","author":"Epiktetos","url":"https://www.gutenberg.org/files/45109/45109-h/45109-h.htm","source":"El Kitabı · X","translated":true},
  {"text":"Her işte önce öncesini ve sonrasını düşün, sonra işe giriş.","author":"Epiktetos","url":"https://www.gutenberg.org/files/45109/45109-h/45109-h.htm","source":"El Kitabı · XXIX","translated":true},
  {"text":"Herkesin kendi işini tam olarak yapması yeterlidir.","author":"Epiktetos","url":"https://www.gutenberg.org/files/45109/45109-h/45109-h.htm","source":"El Kitabı · XXIV","translated":true},
  {"text":"Yalnızken de başkalarıyla birlikteyken de koruyacağın bir karakter belirle.","author":"Epiktetos","url":"https://www.gutenberg.org/files/45109/45109-h/45109-h.htm","source":"El Kitabı · XXXIII","translated":true},
  {"text":"Doğru olduğuna karar verdiğin bir işi yaparken görülmekten çekinme.","author":"Epiktetos","url":"https://www.gutenberg.org/files/45109/45109-h/45109-h.htm","source":"El Kitabı · XXXV","translated":true},
  {"text":"Onun ne yaptığını değil, senin ne yapman gerektiğini düşün.","author":"Epiktetos","url":"https://www.gutenberg.org/files/45109/45109-h/45109-h.htm","source":"El Kitabı · XXX","translated":true},
  {"text":"Yürürken bir çiviye basmamaya dikkat ettiğin gibi, düşünme yeteneğine zarar vermemeye de dikkat et.","author":"Epiktetos","url":"https://www.gutenberg.org/files/45109/45109-h/45109-h.htm","source":"El Kitabı · XXXVIII","translated":true}
 ];
 function day(date=new Date()){
  const p=Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Istanbul',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(date).filter(p=>p.type!=='literal').map(p=>[p.type,p.value]));
  return Math.floor(Date.UTC(Number(p.year),Number(p.month)-1,Number(p.day))/86400000);
 }
 // One fixed deck, five consecutive cards per Istanbul day. All 40 cards
 // appear before the next eight-day cycle, including at the cycle boundary.
 const deck=[...quotes];let seed=0x3755f00d;
 for(let i=deck.length-1;i>0;i--){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const j=Math.floor(seed/4294967296*(i+1));[deck[i],deck[j]]=[deck[j],deck[i]];}
 function forDay(serial){
  const start=((serial*5%deck.length)+deck.length)%deck.length;
  return Array.from({length:5},(_,i)=>({...deck[(start+i)%deck.length]}));
 }
 function refresh(){
  const root=document.querySelector('.rafex-daily-motivation-v355');if(!root)return;
  const serial=day();if(root.dataset.day===String(serial)&&root.dataset.quotesVersion==='375')return;
  const list=root.querySelector('ol');if(!list)return;
  list.replaceChildren(...forDay(serial).map(quote=>{
   const item=document.createElement('li'),text=document.createElement('span'),author=document.createElement('cite'),link=document.createElement('a');
   text.className='rafex-quote-text-v358';text.textContent='“'+quote.text+'”';
   author.className='rafex-quote-author-v358';link.textContent='— '+quote.author;link.href=quote.url;link.target='_blank';link.rel='noopener noreferrer';link.title=quote.source+(quote.translated?' · Türkçe çeviri':'');link.setAttribute('aria-label',quote.author+' · Kaynağı aç');author.appendChild(link);item.append(text,author);return item;
  }));root.dataset.day=String(serial);root.dataset.quotesVersion='375';window.rafexMotivationCarouselV356?.sync(root);
  const date=root.closest('.welcome-hero')?.querySelector('.welcome-date');if(date)date.textContent=new Intl.DateTimeFormat(typeof localeForLanguage==='function'?localeForLanguage():'tr-TR',{timeZone:'Europe/Istanbul',weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(new Date());
 }
 window.rafexDailyMotivationV355={day,forDay,refresh,version:375,poolSize:quotes.length};refresh();
 window.addEventListener('focus',refresh);window.addEventListener('pageshow',refresh);setInterval(refresh,60000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});
})();
