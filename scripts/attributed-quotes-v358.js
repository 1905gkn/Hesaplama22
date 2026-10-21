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
  {text:'Başkalarının hayatını aydınlatmaya çalışmadan gerçekten mutlu olamayız.',author:'Helen Keller',source:'American Foundation for the Blind · My New Speech',url:'https://www.afb.org/about-afb/history/helen-keller/quotes',translated:true}
 ];
 function day(date=new Date()){
  const p=Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Istanbul',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(date).filter(p=>p.type!=='literal').map(p=>[p.type,p.value]));
  return Math.floor(Date.UTC(Number(p.year),Number(p.month)-1,Number(p.day))/86400000);
 }
 function forDay(serial){
  // Disjoint alternating pools prevent yesterday's quotations repeating today.
  const pool=quotes.filter((_,i)=>i%2===((serial%2)+2)%2);let seed=(serial^0x5f3759df)>>>0;
  const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  for(let i=pool.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}
  const authors=new Set(),selected=[];
  for(const quote of pool){if(authors.has(quote.author))continue;authors.add(quote.author);selected.push({...quote});if(selected.length===5)break;}
  return selected;
 }
 function refresh(){
  const root=document.querySelector('.rafex-daily-motivation-v355');if(!root)return;
  const serial=day();if(root.dataset.day===String(serial)&&root.dataset.quotesVersion==='358')return;
  const list=root.querySelector('ol');if(!list)return;
  list.replaceChildren(...forDay(serial).map(quote=>{
   const item=document.createElement('li'),text=document.createElement('span'),author=document.createElement('cite'),link=document.createElement('a');
   text.className='rafex-quote-text-v358';text.textContent='“'+quote.text+'”';
   author.className='rafex-quote-author-v358';link.textContent='— '+quote.author;link.href=quote.url;link.target='_blank';link.rel='noopener noreferrer';link.title=quote.source+(quote.translated?' · Türkçe çeviri':'');link.setAttribute('aria-label',quote.author+' · Kaynağı aç');author.appendChild(link);item.append(text,author);return item;
  }));root.dataset.day=String(serial);root.dataset.quotesVersion='358';window.rafexMotivationCarouselV356?.sync(root);
  const date=root.closest('.welcome-hero')?.querySelector('.welcome-date');if(date)date.textContent=new Intl.DateTimeFormat(typeof localeForLanguage==='function'?localeForLanguage():'tr-TR',{timeZone:'Europe/Istanbul',weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(new Date());
 }
 window.rafexDailyMotivationV355={day,forDay,refresh};refresh();
 setInterval(refresh,60000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});
})();
