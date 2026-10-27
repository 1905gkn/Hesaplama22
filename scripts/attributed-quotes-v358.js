(()=>{
 const quotes=[
  {
    "text": "Tek başımıza çok az şey yapabiliriz; birlikte çok şey başarabiliriz.",
    "author": "Helen Keller",
    "source": "American Foundation for the Blind · Sahne metni",
    "url": "https://afb.org/about-afb/history/helen-keller/quotes/helen-keller-quotes-progress",
    "translated": true
  },
  {
    "text": "İyimserlik, başarıya götüren inançtır; umut olmadan hiçbir şey yapılamaz.",
    "author": "Helen Keller",
    "source": "American Foundation for the Blind · Optimism (1903)",
    "url": "https://www.afb.org/about-afb/history/helen-keller/quotes",
    "translated": true
  },
  {
    "text": "Deha, yüzde bir ilham ve yüzde doksan dokuz terdir.",
    "author": "Thomas A. Edison",
    "source": "Thomas Edison National Historical Park · Edison and His Era",
    "url": "https://home.nps.gov/edis/learn/kidsyouth/edison-and-his-era.htm",
    "translated": true
  },
  {
    "text": "Eğitim, dünyayı değiştirmek için kullanabileceğiniz en güçlü silahtır.",
    "author": "Nelson Mandela",
    "source": "Nelson Mandela Foundation · Education Initiatives",
    "url": "https://www.nelsonmandela.org/nm100-education",
    "translated": true
  },
  {
    "text": "Milletimiz her güçlük ve zorluk karşısında durmadan, ilerlemekte ve yükselmektedir.",
    "author": "Mustafa Kemal Atatürk",
    "source": "Atatürk Araştırma Merkezi · Söylev ve Demeçleri, Cilt III",
    "url": "https://atam.gov.tr/wp-content/uploads/2024/03/Ataturkun-Soylev-ve-Demecleri-C3.pdf"
  },
  {
    "text": "Anlamak, ilerlemek için gereklidir.",
    "author": "Helen Keller",
    "source": "American Foundation for the Blind · Harvard konuşma taslağı (1955)",
    "url": "https://afb.org/about-afb/history/helen-keller/quotes/helen-keller-quotes-progress",
    "translated": true
  },
  {
    "text": "Başkalarının hayatını aydınlatmaya çalışmadan gerçekten mutlu olamayız.",
    "author": "Helen Keller",
    "source": "American Foundation for the Blind · My New Speech",
    "url": "https://www.afb.org/about-afb/history/helen-keller/quotes",
    "translated": true
  },
  {
    "text": "Çalışkanlığımızın çevremizce görülmesi bize itibar ve güven kazandırmaya başladı.",
    "author": "Benjamin Franklin",
    "source": "Otobiyografi · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/148/pg148-images.html#:~:text=and%20this%20industry%2C%20visible%20to%20our%20neighbors%2C%20began%20to%20give%20us%20character%20and%20credit",
    "translated": true,
    "original": "and this industry, visible to our neighbors, began to give us character and credit",
    "sourceId": 148
  },
  {
    "text": "Sağlam bir davranış düzeni için kötü alışkanlıkları bırakıp iyilerini yerleştirmek gerekir.",
    "author": "Benjamin Franklin",
    "source": "Otobiyografi · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/148/pg148-images.html#:~:text=and%20that%20the%20contrary%20habits%20must%20be%20broken%2C%20and%20good%20ones%20acquired%20and%20established%2C%20before",
    "translated": true,
    "original": "and that the contrary habits must be broken, and good ones acquired and established, before we can have any dependence on a steady, uniform rectitude of conduct.",
    "sourceId": 148
  },
  {
    "text": "Yalnızca başkalarına veya kendine yararlı olacak şeyleri söyle.",
    "author": "Benjamin Franklin",
    "source": "Otobiyografi · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/148/pg148-images.html#:~:text=Speak%20not%20but%20what%20may%20benefit%20others%20or%20yourself",
    "translated": true,
    "original": "Speak not but what may benefit others or yourself",
    "sourceId": 148
  },
  {
    "text": "Yalnızca başkalarına veya kendine iyilik sağlayacak harcamalar yap.",
    "author": "Benjamin Franklin",
    "source": "Otobiyografi · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/148/pg148-images.html#:~:text=Make%20no%20expense%20but%20to%20do%20good%20to%20others%20or%20yourself",
    "translated": true,
    "original": "Make no expense but to do good to others or yourself",
    "sourceId": 148
  },
  {
    "text": "Ne zarar vererek ne de görevin olan iyilikleri esirgeyerek kimseye haksızlık et.",
    "author": "Benjamin Franklin",
    "source": "Otobiyografi · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/148/pg148-images.html#:~:text=Wrong%20none%20by%20doing%20injuries%2C%20or%20omitting%20the%20benefits%20that%20are%20your%20duty.",
    "translated": true,
    "original": "Wrong none by doing injuries, or omitting the benefits that are your duty.",
    "sourceId": 148
  },
  {
    "text": "Kararlılık alışkanlığa dönüştüğünde, diğer erdemleri kazanma çabamda beni sağlam tutacaktı.",
    "author": "Benjamin Franklin",
    "source": "Otobiyografi · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/148/pg148-images.html#:~:text=Resolution%2C%20once%20become%20habitual%2C%20would%20keep%20me%20firm%20in%20my%20endeavors%20to%20obtain%20all%20the",
    "translated": true,
    "original": "Resolution, once become habitual, would keep me firm in my endeavors to obtain all the subsequent virtues",
    "sourceId": 148
  },
  {
    "text": "Her erdeme sırayla bir hafta boyunca dikkatle odaklanmaya karar verdim.",
    "author": "Benjamin Franklin",
    "source": "Otobiyografi · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/148/pg148-images.html#:~:text=I%20determined%20to%20give%20a%20week's%20strict%20attention%20to%20each%20of%20the%20virtues%20successively.",
    "translated": true,
    "original": "I determined to give a week's strict attention to each of the virtues successively.",
    "sourceId": 148
  },
  {
    "text": "Başkalarının buluşlarından yararlanıyorsak, kendi buluşlarımızla başkalarına hizmet etme fırsatına da sevinmeliyiz.",
    "author": "Benjamin Franklin",
    "source": "Otobiyografi · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/148/pg148-images.html#:~:text=That%2C%20as%20we%20enjoy%20great%20advantages%20from%20the%20inventions%20of%20others%2C%20we%20should%20be%20glad",
    "translated": true,
    "original": "That, as we enjoy great advantages from the inventions of others, we should be glad of an opportunity to serve others by any invention of ours",
    "sourceId": 148
  },
  {
    "text": "Mutluluk, nadiren gelen büyük talihlerden çok, her gün karşılaşılan küçük yararlardan doğar.",
    "author": "Benjamin Franklin",
    "source": "Otobiyografi · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/148/pg148-images.html#:~:text=Human%20felicity%20is%20produc'd%20not%20so%20much%20by%20great%20pieces%20of%20good%20fortune%20that%20seldom",
    "translated": true,
    "original": "Human felicity is produc'd not so much by great pieces of good fortune that seldom happen, as by little advantages that occur every day.",
    "sourceId": 148
  },
  {
    "text": "Çalıştıkları günlerde neşeli ve iyi huyluydular; iyi bir iş gününün bilinciyle akşamı sevinçle geçirirlerdi.",
    "author": "Benjamin Franklin",
    "source": "Otobiyografi · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/148/pg148-images.html#:~:text=for%20on%20the%20days%20they%20worked%20they%20were%20good-natur'd%20and%20cheerful%2C%20and%2C%20with%20the%20consciousness",
    "translated": true,
    "original": "for on the days they worked they were good-natur'd and cheerful, and, with the consciousness of having done a good day's work, they spent the evening jollily",
    "sourceId": 148
  },
  {
    "text": "Becerisi henüz gelişmemiş kişi de becerikli kişinin yardımcısıdır.",
    "author": "Lao Tzu",
    "source": "Tao Te Ching · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/216/pg216-images.html#:~:text=and%20he%20who%20has%20not%20the%20skill%20is%20the%20helper%20of%20(the%20reputation%20of)%20him",
    "translated": true,
    "original": "and he who has not the skill is the helper of (the reputation of) him who has the skill.",
    "sourceId": 216
  },
  {
    "text": "Her şeyin doğal gelişimine yardım eder; kendi gizli amacı için davranmaz.",
    "author": "Lao Tzu",
    "source": "Tao Te Ching · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/216/pg216-images.html#:~:text=Thus%20he%20helps%20the%20natural%20development%20of%20all%20things%2C%20and%20does%20not%20dare%20to%20act",
    "translated": true,
    "original": "Thus he helps the natural development of all things, and does not dare to act (with an ulterior purpose of his own).",
    "sourceId": 216
  },
  {
    "text": "Suyun üstünlüğü, her şeye yarar sağlamasında ve çekişmemesinde görünür.",
    "author": "Lao Tzu",
    "source": "Tao Te Ching · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/216/pg216-images.html#:~:text=The%20excellence%20of%20water%20appears%20in%20its%20benefiting%20all%20things%2C%20and%20in%20its%20occupying%2C%20without",
    "translated": true,
    "original": "The excellence of water appears in its benefiting all things, and in its occupying, without striving (to the contrary), the low place which all men dislike.",
    "sourceId": 216
  },
  {
    "text": "Anlayış hoşgörüyü, hoşgörü de başkalarıyla ortak bir duyguyu geliştirir.",
    "author": "Lao Tzu",
    "source": "Tao Te Ching · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/216/pg216-images.html#:~:text=The%20knowledge%20of%20that%20unchanging%20rule%20produces%20a%20(grand)%20capacity%20and%20forbearance%2C%20and%20that%20capacity",
    "translated": true,
    "original": "The knowledge of that unchanging rule produces a (grand) capacity and forbearance, and that capacity and forbearance lead to a community (of feeling with all things).",
    "sourceId": 216
  },
  {
    "text": "Yeterince güven göstermeyen kişi, başkalarının güvenini de bulamaz.",
    "author": "Lao Tzu",
    "source": "Tao Te Ching · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/216/pg216-images.html#:~:text=But)%20when%20there%20is%20not%20faith%20sufficient%20(on%20his%20part)%2C%20a%20want%20of%20faith%20(in",
    "translated": true,
    "original": "But) when there is not faith sufficient (on his part), a want of faith (in him) ensues (on the part of the others).",
    "sourceId": 216
  },
  {
    "text": "Becerikli kişi, becerisi henüz gelişmemiş olana öğretmendir.",
    "author": "Lao Tzu",
    "source": "Tao Te Ching · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/216/pg216-images.html#:~:text=Therefore%20the%20man%20of%20skill%20is%20a%20master%20(to%20be%20looked%20up%20to)%20by%20him",
    "translated": true,
    "original": "Therefore the man of skill is a master (to be looked up to) by him who has not the skill",
    "sourceId": 216
  },
  {
    "text": "Öğretene saygı ve yardım edene değer verilmezse, anlayışlı kişi bile yanılabilir.",
    "author": "Lao Tzu",
    "source": "Tao Te Ching · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/216/pg216-images.html#:~:text=If%20the%20one%20did%20not%20honour%20his%20master%2C%20and%20the%20other%20did%20not%20rejoice%20in",
    "translated": true,
    "original": "If the one did not honour his master, and the other did not rejoice in his helper, an (observer), though intelligent, might greatly err about them.",
    "sourceId": 216
  },
  {
    "text": "Öğrenmeye kendini veren, bilgisini her gün artırmaya çalışır.",
    "author": "Lao Tzu",
    "source": "Tao Te Ching · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/216/pg216-images.html#:~:text=He%20who%20devotes%20himself%20to%20learning%20(seeks)%20from%20day%20to%20day%20to%20increase%20(his%20knowledge)",
    "translated": true,
    "original": "He who devotes himself to learning (seeks) from day to day to increase (his knowledge)",
    "sourceId": 216
  },
  {
    "text": "Bana iyi davrananlara ben de iyi davranırım.",
    "author": "Lao Tzu",
    "source": "Tao Te Ching · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/216/pg216-images.html#:~:text=To%20those%20who%20are%20good%20(to%20me)%2C%20I%20am%20good",
    "translated": true,
    "original": "To those who are good (to me), I am good",
    "sourceId": 216
  },
  {
    "text": "Bana iyi davranmayanlara da iyi davranırım.",
    "author": "Lao Tzu",
    "source": "Tao Te Ching · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/216/pg216-images.html#:~:text=and%20to%20those%20who%20are%20not%20good%20(to%20me)%2C%20I%20am%20also%20good",
    "translated": true,
    "original": "and to those who are not good (to me), I am also good",
    "sourceId": 216
  },
  {
    "text": "Dikkat dağılmadan, ortak bir yön doğrultusunda istikrarlı biçimde ilerlerler.",
    "author": "Francis Bacon",
    "source": "Denemeler · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/575/pg575-images.html#:~:text=for%2C%20besides%20the%20secrecy%2C%20they%20commonly%20go%20on%20constantly%2C%20in%20one%20spirit%20of%20direction%2C%20without",
    "translated": true,
    "original": "for, besides the secrecy, they commonly go on constantly, in one spirit of direction, without distraction.",
    "sourceId": 575
  },
  {
    "text": "Büyük işlerin başlangıcında yüz gözle görmek, sonunda yüz elle çalışmak iyidir.",
    "author": "Francis Bacon",
    "source": "Denemeler · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/575/pg575-images.html#:~:text=and%20generally%20it%20is%20good%2C%20to%20commit%20the%20beginnings%20of%20all%20great%20actions%20to%20Argus%2C",
    "translated": true,
    "original": "and generally it is good, to commit the beginnings of all great actions to Argus, with his hundred eyes, and the ends to Briareus, with his hundred hands",
    "sourceId": 575
  },
  {
    "text": "Yenilik yaparken zamanın kendisini örnek almak iyidir.",
    "author": "Francis Bacon",
    "source": "Denemeler · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/575/pg575-images.html#:~:text=It%20were%20good%2C%20therefore%2C%20that%20men%20in%20their%20innovations%20would%20follow%20the%20example%20of%20time",
    "translated": true,
    "original": "It were good, therefore, that men in their innovations would follow the example of time itself",
    "sourceId": 575
  },
  {
    "text": "Dostluğun başlıca meyvelerinden biri, yürekte biriken yükleri hafifletmesidir.",
    "author": "Francis Bacon",
    "source": "Denemeler · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/575/pg575-images.html#:~:text=A%20principal%20fruit%20of%20friendship%2C%20is%20the%20ease%20and%20discharge%20of%20the%20fulness%20and%20swellings",
    "translated": true,
    "original": "A principal fruit of friendship, is the ease and discharge of the fulness and swellings of the heart, which passions of all kinds do cause and induce.",
    "sourceId": 575
  },
  {
    "text": "Birlik, doğal bir eylemi güçlendirir ve besler.",
    "author": "Francis Bacon",
    "source": "Denemeler · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/575/pg575-images.html#:~:text=For%20in%20bodies%2C%20union%20strengtheneth%20and%20cherisheth%20any%20natural%20action",
    "translated": true,
    "original": "For in bodies, union strengtheneth and cherisheth any natural action",
    "sourceId": 575
  },
  {
    "text": "Dostluğun ikinci meyvesi, anlayış için sağlıklı ve güçlü bir destektir.",
    "author": "Francis Bacon",
    "source": "Denemeler · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/575/pg575-images.html#:~:text=The%20second%20fruit%20of%20friendship%2C%20is%20healthful%20and%20sovereign%20for%20the%20understanding%2C%20as%20the%20first",
    "translated": true,
    "original": "The second fruit of friendship, is healthful and sovereign for the understanding, as the first is for the affections.",
    "sourceId": 575
  },
  {
    "text": "En iyi çarelerden biri, bir dostun içten uyarısıdır.",
    "author": "Francis Bacon",
    "source": "Denemeler · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/575/pg575-images.html#:~:text=But%20the%20best%20receipt%20(best%2C%20I%20say%2C%20to%20work%2C%20and%20best%20to%20take)%20is%20the",
    "translated": true,
    "original": "But the best receipt (best, I say, to work, and best to take) is the admonition of a friend.",
    "sourceId": 575
  },
  {
    "text": "İşleri yoluna koyan şey, iyi öğüdün yardımıdır.",
    "author": "Francis Bacon",
    "source": "Denemeler · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/575/pg575-images.html#:~:text=But%20when%20all%20is%20done%2C%20the%20help%20of%20good%20counsel%2C%20is%20that%20which%20setteth%20business",
    "translated": true,
    "original": "But when all is done, the help of good counsel, is that which setteth business straight.",
    "sourceId": 575
  },
  {
    "text": "Gerçek bir dostu olan kişi, önem verdiği şeylere gösterilen özenin süreceğine güvenebilir.",
    "author": "Francis Bacon",
    "source": "Denemeler · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/575/pg575-images.html#:~:text=If%20a%20man%20have%20a%20true%20friend%2C%20he%20may%20rest%20almost%20secure%20that%20the%20care",
    "translated": true,
    "original": "If a man have a true friend, he may rest almost secure that the care of those things will continue after him.",
    "sourceId": 575
  },
  {
    "text": "Birlik ile tek biçimlilik ayrı şeylerdir.",
    "author": "Francis Bacon",
    "source": "Denemeler · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/575/pg575-images.html#:~:text=they%20be%20two%20things%2C%20unity%20and%20uniformity.",
    "translated": true,
    "original": "they be two things, unity and uniformity.",
    "sourceId": 575
  },
  {
    "text": "Başarı ancak çalışkanlık, uygulama ve öğrenmeyle kazanılabilir.",
    "author": "Samuel Smiles",
    "source": "Self-Help · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/935/pg935-images.html#:~:text=Success%20in%20these%20lines%20of%20action%2C%20as%20in%20all%20others%2C%20can%20only%20be%20achieved%20through",
    "translated": true,
    "original": "Success in these lines of action, as in all others, can only be achieved through industry, practice, and study",
    "sourceId": 935
  },
  {
    "text": "İyi insanın yaşamı ve karakteri, başkalarının yaşamına işler ve iyi örneği geleceğe taşır.",
    "author": "Samuel Smiles",
    "source": "Self-Help · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/935/pg935-images.html#:~:text=for%20his%20life%20and%20character%20pass%20unconsciously%20into%20the%20lives%20of%20others%2C%20and%20propagate%20good",
    "translated": true,
    "original": "for his life and character pass unconsciously into the lives of others, and propagate good example for all time to come.",
    "sourceId": 935
  },
  {
    "text": "İyi insanların yaşam öyküleri, başkaları için öğretici birer yardımcı ve yol göstericidir.",
    "author": "Samuel Smiles",
    "source": "Self-Help · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/935/pg935-images.html#:~:text=Biographies%20of%20great%2C%20but%20especially%20of%20good%20men%2C%20are%20nevertheless%20most%20instructive%20and%20useful%2C%20as",
    "translated": true,
    "original": "Biographies of great, but especially of good men, are nevertheless most instructive and useful, as helps, guides, and incentives to others.",
    "sourceId": 935
  },
  {
    "text": "Gündelik yaşamın işleri ve sorumlulukları, değerli deneyimler kazanmak için geniş fırsatlar sunar.",
    "author": "Samuel Smiles",
    "source": "Self-Help · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/935/pg935-images.html#:~:text=The%20common%20life%20of%20every%20day%2C%20with%20its%20cares%2C%20necessities%2C%20and%20duties%2C%20affords%20ample%20opportunity",
    "translated": true,
    "original": "The common life of every day, with its cares, necessities, and duties, affords ample opportunity for acquiring experience of the best kind",
    "sourceId": 935
  },
  {
    "text": "Sağduyu, dikkat, gayret ve sebat, en yüksek araştırmalarda bile en yararlı niteliklerdendir.",
    "author": "Samuel Smiles",
    "source": "Self-Help · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/935/pg935-images.html#:~:text=In%20the%20pursuit%20of%20even%20the%20highest%20branches%20of%20human%20inquiry%2C%20the%20commoner%20qualities%20are",
    "translated": true,
    "original": "In the pursuit of even the highest branches of human inquiry, the commoner qualities are found the most useful—such as common sense, attention, application, and perseverance.",
    "sourceId": 935
  },
  {
    "text": "İş hayatında başarının büyük sırrı, akıllıca ve özenle geliştirilen uygulamadır.",
    "author": "Samuel Smiles",
    "source": "Self-Help · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/935/pg935-images.html#:~:text=In%20business%2C%20practice%2C%20wisely%20and%20diligently%20improved%2C%20is%20the%20great%20secret%20of%20success.",
    "translated": true,
    "original": "In business, practice, wisely and diligently improved, is the great secret of success.",
    "sourceId": 935
  },
  {
    "text": "Değerli olan, insanın olgunlaştığı, yararlı işler yaptığı ve sorumluluğunu yerine getirdiği yaşamdır.",
    "author": "Samuel Smiles",
    "source": "Self-Help · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/935/pg935-images.html#:~:text=but%20that%20in%20which%20a%20man%20gets%20the%20most%20manhood%2C%20and%20performs%20the%20greatest%20amount",
    "translated": true,
    "original": "but that in which a man gets the most manhood, and performs the greatest amount of useful work and of human duty.",
    "sourceId": 935
  },
  {
    "text": "Çabalarımızı çok geniş bir alana yayarak gücümüzü zayıflatır ve ilerlememizi engelleriz.",
    "author": "Samuel Smiles",
    "source": "Self-Help · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/935/pg935-images.html#:~:text=By%20spreading%20our%20efforts%20over%20too%20large%20a%20surface%20we%20inevitably%20weaken%20our%20force%2C%20hinder",
    "translated": true,
    "original": "By spreading our efforts over too large a surface we inevitably weaken our force, hinder our progress, and acquire a habit of fitfulness and ineffective working.",
    "sourceId": 935
  },
  {
    "text": "Bilginin amacı, anlayışı ve karakteri geliştirerek bizi daha iyi, daha mutlu ve daha yararlı kılmaktır.",
    "author": "Samuel Smiles",
    "source": "Self-Help · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/935/pg935-images.html#:~:text=The%20object%20of%20knowledge%20should%20be%20to%20mature%20wisdom%20and%20improve%20character%2C%20to%20render%20us",
    "translated": true,
    "original": "The object of knowledge should be to mature wisdom and improve character, to render us better, happier, and more useful",
    "sourceId": 935
  },
  {
    "text": "En sıradan atölye bile çalışkanlığın, bilimin ve iyi ahlakın okulu olabilir.",
    "author": "Samuel Smiles",
    "source": "Self-Help · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/935/pg935-images.html#:~:text=The%20commonest%20workshop%20may%20thus%20be%20a%20school%20of%20industry%2C%20science%2C%20and%20good%20morals%2C%20on",
    "translated": true,
    "original": "The commonest workshop may thus be a school of industry, science, and good morals, on the one hand",
    "sourceId": 935
  },
  {
    "text": "Uygarlığın emekçileri, sanayide, bilimde ve sanatta karmaşadan düzen doğmasına yardımcı olmuştur.",
    "author": "Samuel Smiles",
    "source": "Self-Help · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/935/pg935-images.html#:~:text=This%20constant%20succession%20of%20noble%20workers%E2%80%94the%20artisans%20of%20civilisation%E2%80%94has%20served%20to%20create%20order%20out%20of",
    "translated": true,
    "original": "This constant succession of noble workers—the artisans of civilisation—has served to create order out of chaos in industry, science, and art",
    "sourceId": 935
  },
  {
    "text": "Sürekli gayret ve yorulmaz çalışkanlıkla, olağan yeteneklere sahip biri de çok şey başarabilir.",
    "author": "Samuel Smiles",
    "source": "Self-Help · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/935/pg935-images.html#:~:text=His%20career%2C%20indeed%2C%20presented%20a%20remarkable%20example%20of%20how%20much%20a%20man%20of%20comparatively%20moderate",
    "translated": true,
    "original": "His career, indeed, presented a remarkable example of how much a man of comparatively moderate powers can accomplish by means of assiduous application and indefatigable industry.",
    "sourceId": 935
  },
  {
    "text": "Zihnin yüksek çalışma niteliklerinin dayandığı etkin dikkat alışkanlığını özenle geliştirdi.",
    "author": "Samuel Smiles",
    "source": "Self-Help · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/935/pg935-images.html#:~:text=He%20cultivated%20carefully%20that%20habit%20of%20active%20attention%20on%20which%20all%20the%20higher%20working%20qualities",
    "translated": true,
    "original": "He cultivated carefully that habit of active attention on which all the higher working qualities of the mind mainly depend.",
    "sourceId": 935
  },
  {
    "text": "Doğruluk, dürüstlük ve güvenilirlik, insan karakterinin gerçek onurudur.",
    "author": "Samuel Smiles",
    "source": "Self-Help · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/935/pg935-images.html#:~:text=With%20these%20he%20combined%20uprightness%2C%20honesty%2C%20and%20integrity%E2%80%94qualities%20which%20are%20the%20true%20glory%20of%20human",
    "translated": true,
    "original": "With these he combined uprightness, honesty, and integrity—qualities which are the true glory of human character.",
    "sourceId": 935
  },
  {
    "text": "Umut doluydu; öğrenmeye hevesli, sebatı sınırsız ve sabrı tükenmezdi.",
    "author": "Samuel Smiles",
    "source": "Self-Help · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/935/pg935-images.html#:~:text=But%20he%20was%20full%20of%20hope%2C%20eager%20to%20learn%2C%20of%20unbounded%20perseverance%20and%20inexhaustible%20patience.",
    "translated": true,
    "original": "But he was full of hope, eager to learn, of unbounded perseverance and inexhaustible patience.",
    "sourceId": 935
  },
  {
    "text": "İçtenlikle çalıştığı için, aynı içtenlikle çalışanların yardım ve desteğini kolayca kazandı.",
    "author": "Samuel Smiles",
    "source": "Self-Help · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/935/pg935-images.html#:~:text=for%2C%20working%20in%20the%20truest%20spirit%2C%20he%20readily%20commanded%20the%20help%20and%20encouragement%20of%20other",
    "translated": true,
    "original": "for, working in the truest spirit, he readily commanded the help and encouragement of other true workers.",
    "sourceId": 935
  },
  {
    "text": "En çok yürünmüş yollar bile çalışana gayret ve gelişme için geniş bir alan sunar.",
    "author": "Samuel Smiles",
    "source": "Self-Help · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/935/pg935-images.html#:~:text=and%20its%20most%20beaten%20paths%20provide%20the%20true%20worker%20with%20abundant%20scope%20for%20effort%20and",
    "translated": true,
    "original": "and its most beaten paths provide the true worker with abundant scope for effort and room for self-improvement.",
    "sourceId": 935
  },
  {
    "text": "Ortak yarar için çalışanlar, uzun süre sabırla emek vermek zorundadır.",
    "author": "Samuel Smiles",
    "source": "Self-Help · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/935/pg935-images.html#:~:text=Labourers%20for%20the%20public%20good%20especially%2C%20have%20to%20work%20long%20and%20patiently%2C%20often%20uncheered%20by",
    "translated": true,
    "original": "Labourers for the public good especially, have to work long and patiently, often uncheered by the prospect of immediate recompense or result.",
    "sourceId": 935
  },
  {
    "text": "Yazar olarak büyük başarısı, başlıca titiz emeğinin ve özenli çalışmasının sonucuydu.",
    "author": "Samuel Smiles",
    "source": "Self-Help · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/935/pg935-images.html#:~:text=His%20great%20success%20as%20a%20writer%20was%20the%20result%20mainly%20of%20his%20painstaking%20labour%20and",
    "translated": true,
    "original": "His great success as a writer was the result mainly of his painstaking labour and diligent application.",
    "sourceId": 935
  },
  {
    "text": "Ustayı usta yapan araçları değil, eğitilmiş becerisi ve sebatıdır.",
    "author": "Samuel Smiles",
    "source": "Self-Help · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/935/pg935-images.html#:~:text=But%20it%20is%20not%20tools%20that%20make%20the%20workman%2C%20but%20the%20trained%20skill%20and%20perseverance",
    "translated": true,
    "original": "But it is not tools that make the workman, but the trained skill and perseverance of the man himself.",
    "sourceId": 935
  },
  {
    "text": "Gayret, sebat ve fırsatları özenle değerlendirmek gerisini tamamlar.",
    "author": "Samuel Smiles",
    "source": "Self-Help · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/935/pg935-images.html#:~:text=Application%20and%20perseverance%2C%20and%20the%20diligent%20improvement%20of%20opportunities%2C%20will%20do%20the%20rest.",
    "translated": true,
    "original": "Application and perseverance, and the diligent improvement of opportunities, will do the rest.",
    "sourceId": 935
  },
  {
    "text": "İnsana yol aldıran, tesadüften çok amaç ve sürekli çalışkanlıktır.",
    "author": "Samuel Smiles",
    "source": "Self-Help · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/935/pg935-images.html#:~:text=It%20is%20not%20accident%2C%20then%2C%20that%20helps%20a%20man%20in%20the%20world%20so%20much%20as",
    "translated": true,
    "original": "It is not accident, then, that helps a man in the world so much as purpose and persistent industry.",
    "sourceId": 935
  },
  {
    "text": "Önümüze çıkan çalışma ve gayret fırsatlarını zamanında değerlendirerek şaşırtıcı ölçüde çok şey başarabiliriz.",
    "author": "Samuel Smiles",
    "source": "Self-Help · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/935/pg935-images.html#:~:text=But%20it%20is%20astonishing%20how%20much%20can%20be%20accomplished%20if%20we%20are%20prompt%20to%20seize",
    "translated": true,
    "original": "But it is astonishing how much can be accomplished if we are prompt to seize and improve the opportunities for action and effort which are constantly presenting themselves.",
    "sourceId": 935
  },
  {
    "text": "Her şeye rağmen neşeli bir cesaret ve yorulmaz sabırla çalışmayı sürdürdü.",
    "author": "Samuel Smiles",
    "source": "Self-Help · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/935/pg935-images.html#:~:text=and%20amidst%20all%2C%20he%20went%20on%20working%20with%20cheerful%20courage%20and%20untiring%20patience.",
    "translated": true,
    "original": "and amidst all, he went on working with cheerful courage and untiring patience.",
    "sourceId": 935
  },
  {
    "text": "Zorluklarla uğraşmayı ve onları aşmayı öğrenen kişi, başkalarına öğretmeye de daha hazırdır.",
    "author": "Samuel Smiles",
    "source": "Self-Help · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/935/pg935-images.html#:~:text=for%20none%20is%20so%20able%20to%20instruct%20others%20as%20he%20who%2C%20for%20himself%20and%20by",
    "translated": true,
    "original": "for none is so able to instruct others as he who, for himself and by his own efforts, has learnt to grapple with and overcome difficulties.",
    "sourceId": 935
  },
  {
    "text": "Sabır, çalışkanlık ve kararlı sebat, başarısına ulaşmasını sağlayan araçlardı.",
    "author": "Samuel Smiles",
    "source": "Self-Help · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/935/pg935-images.html#:~:text=His%20patience%2C%20industry%2C%20and%20steady%20perseverance%20were%20the%20means%20by%20which%20he%20achieved%20his%20greatness.",
    "translated": true,
    "original": "His patience, industry, and steady perseverance were the means by which he achieved his greatness.",
    "sourceId": 935
  },
  {
    "text": "Yararlı bir amaca hizmet edecek her gönüllü işe, çırakken bile hazırdı.",
    "author": "Samuel Smiles",
    "source": "Self-Help · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/935/pg935-images.html#:~:text=He%20was%20always%2C%20even%20when%20an%20apprentice%2C%20ready%20to%20undertake%20any%20amount%20of%20volunteer%20labour",
    "translated": true,
    "original": "He was always, even when an apprentice, ready to undertake any amount of volunteer labour where a useful purpose was to be served.",
    "sourceId": 935
  },
  {
    "text": "Bütün yararlı işlerde yılmadan çalışmayı sürdürdü.",
    "author": "Samuel Smiles",
    "source": "Self-Help · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/935/pg935-images.html#:~:text=He%20continued%20to%20labour%20indefatigably%20in%20all%20good%20works.",
    "translated": true,
    "original": "He continued to labour indefatigably in all good works.",
    "sourceId": 935
  },
  {
    "text": "En büyük insanlar bile, daha yüksek amaçlara yönelirken dürüst ve yararlı emeği küçümsememiştir.",
    "author": "Samuel Smiles",
    "source": "Self-Help · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/935/pg935-images.html#:~:text=The%20greatest%20have%20not%20disdained%20to%20labour%20honestly%20and%20usefully%20for%20a%20living%2C%20though%20at",
    "translated": true,
    "original": "The greatest have not disdained to labour honestly and usefully for a living, though at the same time aiming after higher things.",
    "sourceId": 935
  },
  {
    "text": "Dürüstlüğün en iyi yol olduğu sözü, gündelik yaşamın deneyimiyle doğrulanır.",
    "author": "Samuel Smiles",
    "source": "Self-Help · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/935/pg935-images.html#:~:text=The%20truth%20of%20the%20good%20old%20maxim%2C%20that%20%E2%80%9CHonesty%20is%20the%20best%20policy%2C%E2%80%9D%20is%20upheld",
    "translated": true,
    "original": "The truth of the good old maxim, that “Honesty is the best policy,” is upheld by the daily experience of life",
    "sourceId": 935
  },
  {
    "text": "Olanakları geniş olsa da topluma iyi örnek olma sorumluluğunun sürdüğünü düşünüyordu.",
    "author": "Samuel Smiles",
    "source": "Self-Help · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/935/pg935-images.html#:~:text=With%20ample%20means%2C%20he%20felt%20that%20he%20still%20owed%20to%20society%20the%20duty%20of%20a",
    "translated": true,
    "original": "With ample means, he felt that he still owed to society the duty of a good example.",
    "sourceId": 935
  },
  {
    "text": "Çalışanın yaşamının yararlı, onurlu, saygın ve mutlu olmaması için bir neden yoktur.",
    "author": "Samuel Smiles",
    "source": "Self-Help · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/935/pg935-images.html#:~:text=There%20is%20no%20reason%20why%20the%20condition%20of%20the%20average%20workman%20should%20not%20be%20a",
    "translated": true,
    "original": "There is no reason why the condition of the average workman should not be a useful, honourable, respectable, and happy one.",
    "sourceId": 935
  },
  {
    "text": "Gerekli emeği ve çalışmayı vermeye istekli herkese öğrenmenin yolu açıktır.",
    "author": "Samuel Smiles",
    "source": "Self-Help · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/935/pg935-images.html#:~:text=The%20road%20into%20learning%20is%20alike%20free%20to%20all%20who%20will%20give%20the%20labour%20and",
    "translated": true,
    "original": "The road into learning is alike free to all who will give the labour and the study requisite to gather it",
    "sourceId": 935
  },
  {
    "text": "Az ama sağlam bilgi, uygulamada çok miktarda yüzeysel bilgiden daha değerlidir.",
    "author": "Samuel Smiles",
    "source": "Self-Help · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/935/pg935-images.html#:~:text=Hence%20a%20little%20knowledge%2C%20of%20an%20exact%20and%20perfect%20character%2C%20is%20always%20found%20more%20valuable",
    "translated": true,
    "original": "Hence a little knowledge, of an exact and perfect character, is always found more valuable for practical purposes than any extent of superficial learning.",
    "sourceId": 935
  },
  {
    "text": "Bir amaç için çalışmayı ve sonuçlarını sabırla beklemeyi öğrenmeliyiz.",
    "author": "Samuel Smiles",
    "source": "Self-Help · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/935/pg935-images.html#:~:text=We%20must%20be%20satisfied%20to%20work%20with%20a%20purpose%2C%20and%20wait%20the%20results%20with%20patience.",
    "translated": true,
    "original": "We must be satisfied to work with a purpose, and wait the results with patience.",
    "sourceId": 935
  },
  {
    "text": "Bilgi, iyilik ve anlayışla birleşip sağlam bir karaktere dönüşmelidir.",
    "author": "Samuel Smiles",
    "source": "Self-Help · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/935/pg935-images.html#:~:text=but%20the%20knowledge%20must%20be%20allied%20to%20goodness%20and%20wisdom%2C%20and%20embodied%20in%20upright%20character%2C",
    "translated": true,
    "original": "but the knowledge must be allied to goodness and wisdom, and embodied in upright character, else it is naught.",
    "sourceId": 935
  },
  {
    "text": "Başarısızlıktan, başarıya kıyasla çok daha fazla şey öğreniriz.",
    "author": "Samuel Smiles",
    "source": "Self-Help · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/935/pg935-images.html#:~:text=We%20learn%20wisdom%20from%20failure%20much%20more%20than%20from%20success.",
    "translated": true,
    "original": "We learn wisdom from failure much more than from success.",
    "sourceId": 935
  },
  {
    "text": "İyi değerlendirilen sınamalar karakteri eğitir.",
    "author": "Samuel Smiles",
    "source": "Self-Help · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/935/pg935-images.html#:~:text=For%20trials%2C%20wisely%20improved%2C%20train%20the%20character%2C%20and%20teach%20self-help",
    "translated": true,
    "original": "For trials, wisely improved, train the character, and teach self-help",
    "sourceId": 935
  },
  {
    "text": "Düşüncelerin ve alışılmış değerlendirmelerin nasılsa, zihnin de zamanla öyle olur.",
    "author": "Marcus Aurelius",
    "source": "Kendime Düşünceler · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/2680/pg2680-images.html#:~:text=Such%20as%20thy%20thoughts%20and%20ordinary%20cogitations%20are%2C%20such%20will%20thy%20mind%20be%20in%20time.",
    "translated": true,
    "original": "Such as thy thoughts and ordinary cogitations are, such will thy mind be in time.",
    "sourceId": 2680
  },
  {
    "text": "İnsanlığın gerçek okulu, sözlerden daha güçlü olan eylemle öğretir.",
    "author": "Samuel Smiles",
    "source": "Self-Help · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/935/pg935-images.html#:~:text=It%20is%20the%20practical%20school%20of%20mankind%2C%20working%20by%20action%2C%20which%20is%20always%20more%20forcible",
    "translated": true,
    "original": "It is the practical school of mankind, working by action, which is always more forcible than words.",
    "sourceId": 935
  },
  {
    "text": "İnsanların iyiliğine ve yararına hizmet eden aklın önerdiği işleri yap.",
    "author": "Marcus Aurelius",
    "source": "Kendime Düşünceler · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/2680/pg2680-images.html#:~:text=First%2C%20do%20nothing%20at%20all%2C%20but%20what%20reason%20proceeding%20from%20that%20regal%20and%20supreme%20part%2C",
    "translated": true,
    "original": "First, do nothing at all, but what reason proceeding from that regal and supreme part, shall for the good and benefit of men, suggest unto thee.",
    "sourceId": 2680
  },
  {
    "text": "Bütün davranışlarında adil olmaya odaklan.",
    "author": "Marcus Aurelius",
    "source": "Kendime Düşünceler · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/2680/pg2680-images.html#:~:text=or%20so%20affected%20as%20one%2C%20whose%20only%20study%20and%20only%20wisdom%20is%2C%20to%20be%20just",
    "translated": true,
    "original": "or so affected as one, whose only study and only wisdom is, to be just in all his actions.",
    "sourceId": 2680
  },
  {
    "text": "Şu anki davranışımın akla uygun olması kadar neye önem verebilirim?",
    "author": "Marcus Aurelius",
    "source": "Kendime Düşünceler · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/2680/pg2680-images.html#:~:text=What%20then%20do%20I%20care%20for%20more%20than%20this%2C%20that%20my%20present%20action%20whatsoever%20it",
    "translated": true,
    "original": "What then do I care for more than this, that my present action whatsoever it be, may be the proper action of one that is reasonable",
    "sourceId": 2680
  },
  {
    "text": "Ortak akıl doğasını paylaşanlar, doğal olarak birbirine yönelir.",
    "author": "Marcus Aurelius",
    "source": "Kendime Düşünceler · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/2680/pg2680-images.html#:~:text=Whatsoever%20therefore%20is%20partaker%20of%20that%20reasonable%20common%20nature%2C%20naturally%20doth%20as%20much%20and%20more",
    "translated": true,
    "original": "Whatsoever therefore is partaker of that reasonable common nature, naturally doth as much and more long after his own kind.",
    "sourceId": 2680
  },
  {
    "text": "Akıl, başkalarının yararlanabileceği ortak meyveler verir.",
    "author": "Marcus Aurelius",
    "source": "Kendime Düşünceler · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/2680/pg2680-images.html#:~:text=As%20for%20reason%2C%20that%20beareth%20both%20common%20fruit%20for%20the%20use%20of%20others",
    "translated": true,
    "original": "As for reason, that beareth both common fruit for the use of others",
    "sourceId": 2680
  },
  {
    "text": "İyi ve yardımsever insanın değeri, duygusunda değil, yaptığı iş ve davranışındadır.",
    "author": "Marcus Aurelius",
    "source": "Kendime Düşünceler · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/2680/pg2680-images.html#:~:text=so%20neither%20doth%20the%20true%20good%20or%20evil%20of%20a%20reasonable%20charitable%20man%20consist%20in",
    "translated": true,
    "original": "so neither doth the true good or evil of a reasonable charitable man consist in passion, but in operation and action.",
    "sourceId": 2680
  },
  {
    "text": "Ortak yararla doğrudan veya dolaylı ilişkisi olmayan davranış, amacından sapmış olur.",
    "author": "Marcus Aurelius",
    "source": "Kendime Düşünceler · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/2680/pg2680-images.html#:~:text=What%20action%20soever%20of%20thine%20therefore%20that%20either%20immediately%20or%20afar%20off%2C%20hath%20not%20reference",
    "translated": true,
    "original": "What action soever of thine therefore that either immediately or afar off, hath not reference to the common good, that is an exorbitant and disorderly action",
    "sourceId": 2680
  },
  {
    "text": "Yararlı bir şey öğrenmek için zaman ayır; amaçsızca oradan oraya savrulmayı bırak.",
    "author": "Marcus Aurelius",
    "source": "Kendime Düşünceler · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/2680/pg2680-images.html#:~:text=Give%20thyself%20leisure%20to%20learn%20some%20good%20thing%2C%20and%20cease%20roving%20and%20wandering%20to%20and",
    "translated": true,
    "original": "Give thyself leisure to learn some good thing, and cease roving and wandering to and fro.",
    "sourceId": 2680
  },
  {
    "text": "Her davranışında bunu dikkatle gözet.",
    "author": "Marcus Aurelius",
    "source": "Kendime Düşünceler · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/2680/pg2680-images.html#:~:text=This%20observe%20carefully%20in%20every%20action.",
    "translated": true,
    "original": "This observe carefully in every action.",
    "sourceId": 2680
  },
  {
    "text": "Gerçekten iyi olan bir şeyin, adalet ve doğruluktan daha çok neye ihtiyacı olabilir?",
    "author": "Marcus Aurelius",
    "source": "Kendime Düşünceler · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/2680/pg2680-images.html#:~:text=As%20for%20that%20which%20is%20truly%20good%2C%20what%20can%20it%20stand%20in%20need%20of%20more",
    "translated": true,
    "original": "As for that which is truly good, what can it stand in need of more than either justice or truth",
    "sourceId": 2680
  },
  {
    "text": "İyi öğretimin ve yol göstermenin besinine ihtiyacım var.",
    "author": "Marcus Aurelius",
    "source": "Kendime Düşünceler · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/2680/pg2680-images.html#:~:text=I%20want%20the%20food%20of%20good%20teaching%2C%20and%20instructions%2C%20and%20yet%20I%20depart%20not%20from",
    "translated": true,
    "original": "I want the food of good teaching, and instructions, and yet I depart not from reason.",
    "sourceId": 2680
  },
  {
    "text": "Söylenmesi veya yapılması doğru ve dürüstçe olan bir şeyden, kendini küçümseyerek vazgeçme.",
    "author": "Marcus Aurelius",
    "source": "Kendime Düşünceler · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/2680/pg2680-images.html#:~:text=If%20it%20be%20right%20and%20honest%20to%20be%20spoken%20or%20done%2C%20undervalue%20not%20thyself%20so",
    "translated": true,
    "original": "If it be right and honest to be spoken or done, undervalue not thyself so much, as to be discouraged from it.",
    "sourceId": 2680
  },
  {
    "text": "Söyleneni gerçekten anlamaya çalışmak, başkalarına yararlı davranmaktan vazgeçmeni gerektirmez.",
    "author": "Marcus Aurelius",
    "source": "Kendime Düşünceler · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/2680/pg2680-images.html#:~:text=But%20if%20thou%20dost%20desire%20to%20understand%20truly%20what%20it%20is%20that%20is%20said%2C%20fear",
    "translated": true,
    "original": "But if thou dost desire to understand truly what it is that is said, fear not that thou shalt therefore give over any sociable action.",
    "sourceId": 2680
  },
  {
    "text": "Kendi aklınla, karşındakinin aklına seslen.",
    "author": "Marcus Aurelius",
    "source": "Kendime Düşünceler · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/2680/pg2680-images.html#:~:text=Let%20thy%20reasonable%20faculty%2C%20work%20upon%20his%20reasonable%20faculty",
    "translated": true,
    "original": "Let thy reasonable faculty, work upon his reasonable faculty",
    "sourceId": 2680
  },
  {
    "text": "Anlaşılması güç insanlara kaç kez nezaket ve anlayışla davrandığını düşün.",
    "author": "Marcus Aurelius",
    "source": "Kendime Düşünceler · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/2680/pg2680-images.html#:~:text=towards%20how%20many%20perverse%20unreasonable%20men%20hast%20thou%20carried%20thyself%20kindly%2C%20and%20discreetly%3F",
    "translated": true,
    "original": "towards how many perverse unreasonable men hast thou carried thyself kindly, and discreetly?",
    "sourceId": 2680
  },
  {
    "text": "İnsanlarla aynı aklı paylaştığımız için, onlara toplumsal bir yakınlıkla davranmaya özen gösteririm.",
    "author": "Marcus Aurelius",
    "source": "Kendime Düşünceler · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/2680/pg2680-images.html#:~:text=And%20as%20for%20men%2C%20towards%20them%20as%20naturally%20partakers%20of%20the%20same%20reason%2C%20my%20care",
    "translated": true,
    "original": "And as for men, towards them as naturally partakers of the same reason, my care is to carry myself sociably.",
    "sourceId": 2680
  },
  {
    "text": "Hepimiz ortak bir sonuca katkıda bulunuruz; kimimiz ne yaptığının bilinciyle, kimimiz farkında olmadan.",
    "author": "Marcus Aurelius",
    "source": "Kendime Düşünceler · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/2680/pg2680-images.html#:~:text=We%20all%20work%20to%20one%20effect%2C%20some%20willingly%2C%20and%20with%20a%20rational%20apprehension%20of%20what",
    "translated": true,
    "original": "We all work to one effect, some willingly, and with a rational apprehension of what we do: others without any such knowledge.",
    "sourceId": 2680
  },
  {
    "text": "Amaçlarımızın ve eylemlerimizin ne işe yaradığını ve birbirleriyle ilişkisini görmeliyiz.",
    "author": "Marcus Aurelius",
    "source": "Kendime Düşünceler · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/2680/pg2680-images.html#:~:text=And%20as%20in%20matter%20of%20purposes%20and%20actions%2C%20we%20must%20presently%20see%20what%20is%20the",
    "translated": true,
    "original": "And as in matter of purposes and actions, we must presently see what is the proper use and relation of every one",
    "sourceId": 2680
  },
  {
    "text": "Bu iş için aklım ve anlayışım yeterli mi?",
    "author": "Marcus Aurelius",
    "source": "Kendime Düşünceler · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/2680/pg2680-images.html#:~:text=Is%20my%20reason%2C%20and%20understanding%20sufficient%20for%20this%2C%20or%20no%3F",
    "translated": true,
    "original": "Is my reason, and understanding sufficient for this, or no?",
    "sourceId": 2680
  },
  {
    "text": "Başkalarının yardımına ihtiyaç duyduğunda utanma.",
    "author": "Marcus Aurelius",
    "source": "Kendime Düşünceler · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/2680/pg2680-images.html#:~:text=Be%20not%20therefore%20ashamed%2C%20whensoever%20thou%20must%20use%20the%20help%20of%20others.",
    "translated": true,
    "original": "Be not therefore ashamed, whensoever thou must use the help of others.",
    "sourceId": 2680
  },
  {
    "text": "Akıllı bir varlık için doğaya uygun davranış, akla da uygundur.",
    "author": "Marcus Aurelius",
    "source": "Kendime Düşünceler · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/2680/pg2680-images.html#:~:text=To%20a%20reasonable%20creature%2C%20the%20same%20action%20is%20both%20according%20to%20nature%2C%20and%20according%20to",
    "translated": true,
    "original": "To a reasonable creature, the same action is both according to nature, and according to reason.",
    "sourceId": 2680
  },
  {
    "text": "Bir bedenin organları gibi, insanlar da ortak bir iş için hazırlanmıştır.",
    "author": "Marcus Aurelius",
    "source": "Kendime Düşünceler · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/2680/pg2680-images.html#:~:text=As%20several%20members%20in%20one%20body%20united%2C%20so%20are%20reasonable%20creatures%20in%20a%20body%20divided",
    "translated": true,
    "original": "As several members in one body united, so are reasonable creatures in a body divided and dispersed, all made and prepared for one common operation.",
    "sourceId": 2680
  },
  {
    "text": "Başkalarına iyilik yaptığında, kendine de iyilik yaparsın.",
    "author": "Marcus Aurelius",
    "source": "Kendime Düşünceler · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/2680/pg2680-images.html#:~:text=not%2C%20as%20doing%20good%20to%20thyself%2C%20when%20thou%20dost%20good%20unto%20others.",
    "translated": true,
    "original": "not, as doing good to thyself, when thou dost good unto others.",
    "sourceId": 2680
  },
  {
    "text": "İnsan yapısının başlıca amacı, ortak iyiliği gözetmektir.",
    "author": "Marcus Aurelius",
    "source": "Kendime Düşünceler · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/2680/pg2680-images.html#:~:text=That%20therefore%20which%20is%20chief%20in%20every%20man's%20constitution%2C%20is%2C%20that%20he%20intend%20the%20common",
    "translated": true,
    "original": "That therefore which is chief in every man's constitution, is, that he intend the common good.",
    "sourceId": 2680
  },
  {
    "text": "Karşılaştığın durumlardan doğru biçimde yararlanmayı kendine iş edin.",
    "author": "Marcus Aurelius",
    "source": "Kendime Düşünceler · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/2680/pg2680-images.html#:~:text=ever%20changing%20and%20soon%20changed%20themselves)%20let%20it%20be%20thine%20only%20care%20and%20study%2C%20how",
    "translated": true,
    "original": "ever changing and soon changed themselves) let it be thine only care and study, how to make a right use of all such accidents.",
    "sourceId": 2680
  },
  {
    "text": "Amaç, ortak yarardır.",
    "author": "Marcus Aurelius",
    "source": "Kendime Düşünceler · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/2680/pg2680-images.html#:~:text=whose%20end%20is%2C%20the%20common%20good",
    "translated": true,
    "original": "whose end is, the common good",
    "sourceId": 2680
  },
  {
    "text": "İyi olan aynı zamanda yararlıdır; dürüst insan da onun değerini bilmelidir.",
    "author": "Marcus Aurelius",
    "source": "Kendime Düşünceler · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/2680/pg2680-images.html#:~:text=Now%20whatsoever%20is%20good%2C%20is%20also%20profitable%2C%20and%20it%20is%20the%20part%20of%20an%20honest",
    "translated": true,
    "original": "Now whatsoever is good, is also profitable, and it is the part of an honest virtuous man to set by it, and to make reckoning of it accordingly.",
    "sourceId": 2680
  },
  {
    "text": "Davranışımın amacı insanlara iyilik yapmak olsun.",
    "author": "Marcus Aurelius",
    "source": "Kendime Düşünceler · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/2680/pg2680-images.html#:~:text=so%20the%20end%20of%20my%20action%20be%20to%20do%20good%20unto%20men.",
    "translated": true,
    "original": "so the end of my action be to do good unto men.",
    "sourceId": 2680
  },
  {
    "text": "İnsanlar, birbirlerine iyilik etmek üzere birbirleri için yaratılmıştır.",
    "author": "Marcus Aurelius",
    "source": "Kendime Düşünceler · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/2680/pg2680-images.html#:~:text=For%20the%20nature%20of%20the%20universe%2C%20having%20made%20all%20reasonable%20creatures%20one%20for%20another%2C%20to",
    "translated": true,
    "original": "For the nature of the universe, having made all reasonable creatures one for another, to the end that they should do one another good",
    "sourceId": 2680
  },
  {
    "text": "Ortak bir bütünden pay alan her şey, parçası olduğu bütüne doğal olarak yönelir.",
    "author": "Marcus Aurelius",
    "source": "Kendime Düşünceler · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/2680/pg2680-images.html#:~:text=Now%20whatsoever%20partakes%20of%20some%20common%20thing%2C%20naturally%20affects%20and%20inclines%20unto%20that%20whereof%20it",
    "translated": true,
    "original": "Now whatsoever partakes of some common thing, naturally affects and inclines unto that whereof it is part, being of one kind and nature with it.",
    "sourceId": 2680
  },
  {
    "text": "Akıl, kendinde olanı başkalarında da geliştirerek çoğaltır.",
    "author": "Marcus Aurelius",
    "source": "Kendime Düşünceler · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/2680/pg2680-images.html#:~:text=Reason%20is%20of%20a%20diffusive%20nature%2C%20what%20itself%20is%20in%20itself%2C%20it%20begets%20in%20others%2C",
    "translated": true,
    "original": "Reason is of a diffusive nature, what itself is in itself, it begets in others, and so doth multiply.",
    "sourceId": 2680
  },
  {
    "text": "Erdem, duyguda değil, davranışta kendini gösterir.",
    "author": "Marcus Aurelius",
    "source": "Kendime Düşünceler · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/2680/pg2680-images.html#:~:text=As%20virtue%20and%20wickedness%20consist%20not%20in%20passion%2C%20but%20in%20action",
    "translated": true,
    "original": "As virtue and wickedness consist not in passion, but in action",
    "sourceId": 2680
  },
  {
    "text": "Her mesleğin ortak özelliği, o anda yapılan işe ve kullanılan araca dikkat etmektir.",
    "author": "Marcus Aurelius",
    "source": "Kendime Düşünceler · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/2680/pg2680-images.html#:~:text=It%20is%20common%20to%20all%20trades%20and%20professions%20to%20mind%20and%20intend%20that%20only%2C%20which",
    "translated": true,
    "original": "It is common to all trades and professions to mind and intend that only, which now they are about, and the instrument whereby they work.",
    "sourceId": 2680
  },
  {
    "text": "Yaptığın iyiliğin karşılığını, o davranışın kendisinde bul.",
    "author": "Marcus Aurelius",
    "source": "Kendime Düşünceler · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/2680/pg2680-images.html#:~:text=nor%20didst%20not%20think%20that%20from%20the%20action%20itself%20thou%20hadst%20received%20a%20full%20reward",
    "translated": true,
    "original": "nor didst not think that from the action itself thou hadst received a full reward of the good that thou hadst done.",
    "sourceId": 2680
  },
  {
    "text": "Sakin ve ölçülü davran; başkaları da örneğinden etkilenebilsin.",
    "author": "Marcus Aurelius",
    "source": "Kendime Düşünceler · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/2680/pg2680-images.html#:~:text=with%20discretion%20and%20gravity%2C%20so%20that%20others%20may%20be%20persuaded%20also%20and%20drawn%20to%20the",
    "translated": true,
    "original": "with discretion and gravity, so that others may be persuaded also and drawn to the like example, but without any noise and passionate exclamations.",
    "sourceId": 2680
  },
  {
    "text": "İyi ilişkiler ve yakınlık içinde, aynı ağacın dalları gibi birlikte büyüyün.",
    "author": "Marcus Aurelius",
    "source": "Kendime Düşünceler · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/2680/pg2680-images.html#:~:text=To%20grow%20together%20like%20fellow%20branches%20in%20matter%20of%20good%20correspondence%20and%20affection",
    "translated": true,
    "original": "To grow together like fellow branches in matter of good correspondence and affection",
    "sourceId": 2680
  },
  {
    "text": "Gerçek iyilik, sadelik ve nezaket gözlerden ve yüz ifadesinden kendini belli eder.",
    "author": "Marcus Aurelius",
    "source": "Kendime Düşünceler · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/2680/pg2680-images.html#:~:text=However%20true%20goodness%2C%20simplicity%2C%20and%20kindness%20cannot%20so%20be%20hidden%2C%20but%20that%20as%20we%20have",
    "translated": true,
    "original": "However true goodness, simplicity, and kindness cannot so be hidden, but that as we have already said in the very eyes and countenance they will show themselves.",
    "sourceId": 2680
  },
  {
    "text": "İyi insan, öğrenme yoluyla dostlarıyla buluşur; dostlukları da erdemini geliştirir.",
    "author": "Zengzi",
    "source": "Konuşmalar · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/3330/pg3330-images.html#:~:text=The%20philosopher%20Tsang%20said%2C%20'The%20superior%20man%20on%20grounds%20of%20culture%20meets%20with%20his%20friends%2C",
    "translated": true,
    "original": "The philosopher Tsang said, 'The superior man on grounds of culture meets with his friends, and by their friendship helps his virtue.",
    "sourceId": 3330
  },
  {
    "text": "Sözlerin içten ve doğru, davranışların saygın ve özenli olsun.",
    "author": "Konfüçyüs",
    "source": "Konuşmalar · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/3330/pg3330-images.html#:~:text=Let%20his%20words%20be%20sincere%20and%20truthful%2C%20and%20his%20actions%20honourable%20and%20careful",
    "translated": true,
    "original": "Let his words be sincere and truthful, and his actions honourable and careful",
    "sourceId": 3330
  },
  {
    "text": "Öğrenmek ve öğrendiğini sürekli uygulamak sevindirici değil midir?",
    "author": "Konfüçyüs",
    "source": "Konuşmalar · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/3330/pg3330-images.html#:~:text=Is%20it%20not%20pleasant%20to%20learn%20with%20a%20constant%20perseverance%20and%20application%3F",
    "translated": true,
    "original": "Is it not pleasant to learn with a constant perseverance and application?",
    "sourceId": 3330
  },
  {
    "text": "Herkese sevgiyle yaklaş ve iyi insanlarla dostluğunu geliştir.",
    "author": "Konfüçyüs",
    "source": "Konuşmalar · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/3330/pg3330-images.html#:~:text=He%20should%20overflow%20in%20love%20to%20all%2C%20and%20cultivate%20the%20friendship%20of%20the%20good.",
    "translated": true,
    "original": "He should overflow in love to all, and cultivate the friendship of the good.",
    "sourceId": 3330
  },
  {
    "text": "Dostlarıyla ilişkilerinde içten olan birine, öğrenmemiş deseler bile ben öğrenmiş derim.",
    "author": "Zixia",
    "source": "Konuşmalar · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/3330/pg3330-images.html#:~:text=if%2C%20in%20his%20intercourse%20with%20his%20friends%2C%20his%20words%20are%20sincere%3A--%20although%20men%20say%20that",
    "translated": true,
    "original": "if, in his intercourse with his friends, his words are sincere:-- although men say that he has not learned, I will certainly say that he has.",
    "sourceId": 3330
  },
  {
    "text": "Düşünmeden öğrenmek, boşa harcanmış emektir.",
    "author": "Konfüçyüs",
    "source": "Konuşmalar · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/3330/pg3330-images.html#:~:text=Learning%20without%20thought%20is%20labour%20lost",
    "translated": true,
    "original": "Learning without thought is labour lost",
    "sourceId": 3330
  },
  {
    "text": "İrade iyiliğe yönelirse, kötülüğe yer kalmaz.",
    "author": "Konfüçyüs",
    "source": "Konuşmalar · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/3330/pg3330-images.html#:~:text=If%20the%20will%20be%20set%20on%20virtue%2C%20there%20will%20be%20no%20practice%20of%20wickedness.",
    "translated": true,
    "original": "If the will be set on virtue, there will be no practice of wickedness.",
    "sourceId": 3330
  },
  {
    "text": "Erdemli insan, önce zorluğu aşmayı iş edinir; başarıyı bunun ardından düşünür.",
    "author": "Konfüçyüs",
    "source": "Konuşmalar · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/3330/pg3330-images.html#:~:text=The%20man%20of%20virtue%20makes%20the%20difficulty%20to%20be%20overcome%20his%20first%20business%2C%20and%20success",
    "translated": true,
    "original": "The man of virtue makes the difficulty to be overcome his first business, and success only a subsequent consideration",
    "sourceId": 3330
  },
  {
    "text": "Kendi gelişmesini isteyen iyi insan, başkalarının gelişmesine de yardım eder.",
    "author": "Konfüçyüs",
    "source": "Konuşmalar · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/3330/pg3330-images.html#:~:text=Now%20the%20man%20of%20perfect%20virtue%2C%20wishing%20to%20be%20established%20himself%2C%20seeks%20also%20to%20establish",
    "translated": true,
    "original": "Now the man of perfect virtue, wishing to be established himself, seeks also to establish others",
    "sourceId": 3330
  },
  {
    "text": "Üç yıl öğrenim görüp de daha iyi biri olmayanı bulmak kolay değildir.",
    "author": "Konfüçyüs",
    "source": "Konuşmalar · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/3330/pg3330-images.html#:~:text=It%20is%20not%20easy%20to%20find%20a%20man%20who%20has%20learned%20for%20three%20years%20without",
    "translated": true,
    "original": "It is not easy to find a man who has learned for three years without coming to be good.",
    "sourceId": 3330
  },
  {
    "text": "Dostunu içtenlikle uyar ve onu beceriyle doğru yöne yönlendir.",
    "author": "Konfüçyüs",
    "source": "Konuşmalar · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/3330/pg3330-images.html#:~:text=Faithfully%20admonish%20your%20friend%2C%20and%20skillfully%20lead%20him%20on.",
    "translated": true,
    "original": "Faithfully admonish your friend, and skillfully lead him on.",
    "sourceId": 3330
  },
  {
    "text": "Sözler gerçeğe uygun değilse, işler başarıyla yürütülemez.",
    "author": "Konfüçyüs",
    "source": "Konuşmalar · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/3330/pg3330-images.html#:~:text=If%20language%20be%20not%20in%20accordance%20with%20the%20truth%20of%20things%2C%20affairs%20cannot%20be%20carried",
    "translated": true,
    "original": "If language be not in accordance with the truth of things, affairs cannot be carried on to success.",
    "sourceId": 3330
  },
  {
    "text": "Eskiden insanlar, kendilerini geliştirmek amacıyla öğrenirdi.",
    "author": "Konfüçyüs",
    "source": "Konuşmalar · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/3330/pg3330-images.html#:~:text=In%20ancient%20times%2C%20men%20learned%20with%20a%20view%20to%20their%20own%20improvement.",
    "translated": true,
    "original": "In ancient times, men learned with a view to their own improvement.",
    "sourceId": 3330
  },
  {
    "text": "Başkalarının iyi yönlerini anlatmaktan sevinç duy.",
    "author": "Konfüçyüs",
    "source": "Konuşmalar · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/3330/pg3330-images.html#:~:text=speaking%20of%20the%20goodness%20of%20others",
    "translated": true,
    "original": "speaking of the goodness of others",
    "sourceId": 3330
  },
  {
    "text": "Nezaket ve uygun davranış kurallarını öğrenmeden karakterin sağlamlaşamaz.",
    "author": "Konfüçyüs",
    "source": "Konuşmalar · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/3330/pg3330-images.html#:~:text=On%20my%20replying%20'Not%20yet%2C'%20he%20added%2C%20'If%20you%20do%20not%20learn%20the%20rules%20of",
    "translated": true,
    "original": "On my replying 'Not yet,' he added, 'If you do not learn the rules of Propriety, your character cannot be established.",
    "sourceId": 3330
  },
  {
    "text": "Uzaklardan gelen dostların olması sevindirici değil midir?",
    "author": "Konfüçyüs",
    "source": "Konuşmalar · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/3330/pg3330-images.html#:~:text=Is%20it%20not%20delightful%20to%20have%20friends%20coming%20from%20distant%20quarters%3F",
    "translated": true,
    "original": "Is it not delightful to have friends coming from distant quarters?",
    "sourceId": 3330
  },
  {
    "text": "Başkaları onu fark etmese de huzurunu koruyan kişi olgun değil midir?",
    "author": "Konfüçyüs",
    "source": "Konuşmalar · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/3330/pg3330-images.html#:~:text=Is%20he%20not%20a%20man%20of%20complete%20virtue%2C%20who%20feels%20no%20discomposure%20though%20men%20may",
    "translated": true,
    "original": "Is he not a man of complete virtue, who feels no discomposure though men may take no note of him?",
    "sourceId": 3330
  },
  {
    "text": "Süslü sözler ve hoş görünme çabası, gerçek erdemle pek az birlikte bulunur.",
    "author": "Konfüçyüs",
    "source": "Konuşmalar · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/3330/pg3330-images.html#:~:text=Fine%20words%20and%20an%20insinuating%20appearance%20are%20seldom%20associated%20with%20true%20virtue.",
    "translated": true,
    "original": "Fine words and an insinuating appearance are seldom associated with true virtue.",
    "sourceId": 3330
  },
  {
    "text": "Her gün kendimi sorgularım: Başkaları için iş yaparken yeterince güvenilir davrandım mı?",
    "author": "Zengzi",
    "source": "Konuşmalar · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/3330/pg3330-images.html#:~:text=The%20philosopher%20Tsang%20said%2C%20'I%20daily%20examine%20myself%20on%20three%20points%3A--%20whether%2C%20in%20transacting%20business",
    "translated": true,
    "original": "The philosopher Tsang said, 'I daily examine myself on three points:-- whether, in transacting business for others, I may have been not faithful",
    "sourceId": 3330
  },
  {
    "text": "Dostlarımla ilişkilerimde yeterince içten oldum mu?",
    "author": "Zengzi",
    "source": "Konuşmalar · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/3330/pg3330-images.html#:~:text=whether%2C%20in%20intercourse%20with%20friends%2C%20I%20may%20have%20been%20not%20sincere",
    "translated": true,
    "original": "whether, in intercourse with friends, I may have been not sincere",
    "sourceId": 3330
  },
  {
    "text": "Ciddi ve doğru sözlü ol.",
    "author": "Konfüçyüs",
    "source": "Konuşmalar · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/3330/pg3330-images.html#:~:text=He%20should%20be%20earnest%20and%20truthful.",
    "translated": true,
    "original": "He should be earnest and truthful.",
    "sourceId": 3330
  },
  {
    "text": "Sorumluluklarını yerine getirdikten sonra kalan zaman ve fırsatları öğrenmeye ayır.",
    "author": "Konfüçyüs",
    "source": "Konuşmalar · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/3330/pg3330-images.html#:~:text=When%20he%20has%20time%20and%20opportunity%2C%20after%20the%20performance%20of%20these%20things%2C%20he%20should%20employ",
    "translated": true,
    "original": "When he has time and opportunity, after the performance of these things, he should employ them in polite studies.",
    "sourceId": 3330
  },
  {
    "text": "Doğru ilkelere göre yapılan anlaşmaların sözleri yerine getirilebilir.",
    "author": "Youzi",
    "source": "Konuşmalar · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/3330/pg3330-images.html#:~:text=The%20philosopher%20Yu%20said%2C%20'When%20agreements%20are%20made%20according%20to%20what%20is%20right%2C%20what%20is",
    "translated": true,
    "original": "The philosopher Yu said, 'When agreements are made according to what is right, what is spoken can be made good.",
    "sourceId": 3330
  },
  {
    "text": "Yaptığı işe gayretle, söylediklerine özenle yaklaşır.",
    "author": "Konfüçyüs",
    "source": "Konuşmalar · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/3330/pg3330-images.html#:~:text=he%20is%20earnest%20in%20what%20he%20is%20doing%2C%20and%20careful%20in%20his%20speech",
    "translated": true,
    "original": "he is earnest in what he is doing, and careful in his speech",
    "sourceId": 3330
  },
  {
    "text": "Kendisini geliştirmek için ilkeli insanlarla birlikte olanın öğrenmeyi sevdiği söylenebilir.",
    "author": "Konfüçyüs",
    "source": "Konuşmalar · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/3330/pg3330-images.html#:~:text=he%20frequents%20the%20company%20of%20men%20of%20principle%20that%20he%20may%20be%20rectified%3A--%20such%20a",
    "translated": true,
    "original": "he frequents the company of men of principle that he may be rectified:-- such a person may be said indeed to love to learn.",
    "sourceId": 3330
  },
  {
    "text": "On beş yaşımda zihnimi öğrenmeye yönelttim.",
    "author": "Konfüçyüs",
    "source": "Konuşmalar · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/3330/pg3330-images.html#:~:text=At%20fifteen%2C%20I%20had%20my%20mind%20bent%20on%20learning.",
    "translated": true,
    "original": "At fifteen, I had my mind bent on learning.",
    "sourceId": 3330
  },
  {
    "text": "Altmış yaşımda kulağım gerçeği dinlemeye hazırdı.",
    "author": "Konfüçyüs",
    "source": "Konuşmalar · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/3330/pg3330-images.html#:~:text=At%20sixty%2C%20my%20ear%20was%20an%20obedient%20organ%20for%20the%20reception%20of%20truth.",
    "translated": true,
    "original": "At sixty, my ear was an obedient organ for the reception of truth.",
    "sourceId": 3330
  },
  {
    "text": "Eski bilgisini canlı tutup sürekli yenisini öğrenen kişi, başkalarına öğretmen olabilir.",
    "author": "Konfüçyüs",
    "source": "Konuşmalar · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/3330/pg3330-images.html#:~:text=If%20a%20man%20keeps%20cherishing%20his%20old%20knowledge%2C%20so%20as%20continually%20to%20be%20acquiring%20new%2C",
    "translated": true,
    "original": "If a man keeps cherishing his old knowledge, so as continually to be acquiring new, he may be a teacher of others.",
    "sourceId": 3330
  },
  {
    "text": "Önce yapar; sonra yaptıklarına uygun konuşur.",
    "author": "Konfüçyüs",
    "source": "Konuşmalar · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/3330/pg3330-images.html#:~:text=He%20acts%20before%20he%20speaks%2C%20and%20afterwards%20speaks%20according%20to%20his%20actions.",
    "translated": true,
    "original": "He acts before he speaks, and afterwards speaks according to his actions.",
    "sourceId": 3330
  },
  {
    "text": "Öğrenmeden düşünmek tehlikelidir.",
    "author": "Konfüçyüs",
    "source": "Konuşmalar · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/3330/pg3330-images.html#:~:text=thought%20without%20learning%20is%20perilous.",
    "translated": true,
    "original": "thought without learning is perilous.",
    "sourceId": 3330
  },
  {
    "text": "Herkese karşı özenli ve iyi yürekli olsun.",
    "author": "Konfüçyüs",
    "source": "Konuşmalar · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/3330/pg3330-images.html#:~:text=Let%20him%20be%20filial%20and%20kind%20to%20all",
    "translated": true,
    "original": "Let him be filial and kind to all",
    "sourceId": 3330
  },
  {
    "text": "İyi olanları desteklesin, henüz yapamayanlara öğretsin.",
    "author": "Konfüçyüs",
    "source": "Konuşmalar · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/3330/pg3330-images.html#:~:text=Let%20him%20advance%20the%20good%20and%20teach%20the%20incompetent",
    "translated": true,
    "original": "Let him advance the good and teach the incompetent",
    "sourceId": 3330
  },
  {
    "text": "Doğru sözlü olmayan bir insanın yolunu nasıl sürdüreceğini bilemiyorum.",
    "author": "Konfüçyüs",
    "source": "Konuşmalar · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/3330/pg3330-images.html#:~:text=I%20do%20not%20know%20how%20a%20man%20without%20truthfulness%20is%20to%20get%20on.",
    "translated": true,
    "original": "I do not know how a man without truthfulness is to get on.",
    "sourceId": 3330
  },
  {
    "text": "Dostuna, yüreğinin doğruluğuna ve temellerinin sağlamlığına cesaretle güvenerek yaklaş.",
    "author": "Ralph Waldo Emerson",
    "source": "Denemeler · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/16643/pg16643-images.html#:~:text=let%20us%20approach%20our%20friend%20with%20an%20audacious%20trust%20in%20the%20truth%20of%20his%20heart%2C",
    "translated": true,
    "original": "let us approach our friend with an audacious trust in the truth of his heart, in the breadth, impossible to be overturned, of his foundations.",
    "sourceId": 16643
  },
  {
    "text": "Gündelik ihtiyaç ve görevlerimizi cesaret, anlayış ve birlikle yüceltmeliyiz.",
    "author": "Ralph Waldo Emerson",
    "source": "Denemeler · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/16643/pg16643-images.html#:~:text=We%20are%20to%20dignify%20to%20each%20other%20the%20daily%20needs%20and%20offices%20of%20man's%20life%2C",
    "translated": true,
    "original": "We are to dignify to each other the daily needs and offices of man's life, and embellish it by courage, wisdom and unity.",
    "sourceId": 16643
  },
  {
    "text": "Dostuma duyduğum iyi niyetle karşılaştırınca, ona sağlayabileceğim yarar küçük görünür.",
    "author": "Ralph Waldo Emerson",
    "source": "Denemeler · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/16643/pg16643-images.html#:~:text=Compared%20with%20that%20good-will%20I%20bear%20my%20friend%2C%20the%20benefit%20it%20is%20in%20my%20power",
    "translated": true,
    "original": "Compared with that good-will I bear my friend, the benefit it is in my power to render him seems small.",
    "sourceId": 16643
  },
  {
    "text": "Doğruluk, içtenlik, cesaret, sevgi ve alçakgönüllülük, sağduyunun yanında yer alır.",
    "author": "Ralph Waldo Emerson",
    "source": "Denemeler · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/16643/pg16643-images.html#:~:text=Thus%20truth%2C%20frankness%2C%20courage%2C%20love%2C%20humility%2C%20and%20all%20the%20virtues%20range%20themselves%20on%20the%20side",
    "translated": true,
    "original": "Thus truth, frankness, courage, love, humility, and all the virtues range themselves on the side of prudence, or the art of securing a present well-being.",
    "sourceId": 16643
  },
  {
    "text": "Gerçek öğrenen kişi, kaçırdığı her eylem fırsatını bir güç kaybı sayar.",
    "author": "Ralph Waldo Emerson",
    "source": "Denemeler · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/16643/pg16643-images.html#:~:text=The%20true%20scholar%20grudges%20every%20opportunity%20of%20action%20passed%20by%2C%20as%20a%20loss%20of%20power.",
    "translated": true,
    "original": "The true scholar grudges every opportunity of action passed by, as a loss of power.",
    "sourceId": 16643
  },
  {
    "text": "Gücünü uygun işlerde bütünüyle kullanan, anlayış bakımından da en zengin karşılığı alır.",
    "author": "Ralph Waldo Emerson",
    "source": "Denemeler · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/16643/pg16643-images.html#:~:text=Of%20course%2C%20he%20who%20has%20put%20forth%20his%20total%20strength%20in%20fit%20actions%20has%20the",
    "translated": true,
    "original": "Of course, he who has put forth his total strength in fit actions has the richest return of wisdom.",
    "sourceId": 16643
  },
  {
    "text": "Bir süpürgede, bir arabada veya bir bıçakta satın aldığımız şey, ortak bir ihtiyaca uygulanmış sağduyudur.",
    "author": "Ralph Waldo Emerson",
    "source": "Denemeler · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/16643/pg16643-images.html#:~:text=What%20we%20buy%20in%20a%20broom%2C%20a%20mat%2C%20a%20wagon%2C%20a%20knife%2C%20is%20some%20application",
    "translated": true,
    "original": "What we buy in a broom, a mat, a wagon, a knife, is some application of good sense to a common want.",
    "sourceId": 16643
  },
  {
    "text": "İyi bir bahçıvanın becerisine veya bahçeciliğe uygulanmış sağduyuya değer vermek en iyisidir.",
    "author": "Ralph Waldo Emerson",
    "source": "Denemeler · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/16643/pg16643-images.html#:~:text=It%20is%20best%20to%20pay%20in%20your%20land%20a%20skillful%20gardener%2C%20or%20to%20buy%20good",
    "translated": true,
    "original": "It is best to pay in your land a skillful gardener, or to buy good sense applied to gardening",
    "sourceId": 16643
  },
  {
    "text": "Erdemimizi yalnızca açık davranışlarla gösterdiğimizi sanırız; oysa her an çevremize yansır.",
    "author": "Ralph Waldo Emerson",
    "source": "Denemeler · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/16643/pg16643-images.html#:~:text=Men%20imagine%20that%20they%20communicate%20their%20virtue%20or%20vice%20only%20by%20overt%20actions%2C%20and%20do",
    "translated": true,
    "original": "Men imagine that they communicate their virtue or vice only by overt actions, and do not see that virtue or vice emit a breath every moment.",
    "sourceId": 16643
  },
  {
    "text": "Davranışlar farklı olsa da her biri kendi anında dürüst ve doğalsa, aralarında uyum bulunur.",
    "author": "Ralph Waldo Emerson",
    "source": "Denemeler · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/16643/pg16643-images.html#:~:text=There%20will%20be%20an%20agreement%20in%20whatever%20variety%20of%20actions%2C%20so%20they%20be%20each%20honest",
    "translated": true,
    "original": "There will be an agreement in whatever variety of actions, so they be each honest and natural in their hour.",
    "sourceId": 16643
  },
  {
    "text": "İnsanlıktan yana dururum; onun iyi yürekli olmasını isterken, doğru olmasını da isterim.",
    "author": "Ralph Waldo Emerson",
    "source": "Denemeler · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/16643/pg16643-images.html#:~:text=I%20will%20stand%20here%20for%20humanity%2C%20and%20though%20I%20would%20make%20it%20kind%2C%20I%20would",
    "translated": true,
    "original": "I will stand here for humanity, and though I would make it kind, I would make it true.",
    "sourceId": 16643
  },
  {
    "text": "Dostumun başarılarıyla, kendi başarılarım gibi gurur duymalıyım.",
    "author": "Ralph Waldo Emerson",
    "source": "Denemeler · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/16643/pg16643-images.html#:~:text=I%20must%20feel%20pride%20in%20my%20friend's%20accomplishments%20as%20if%20they%20were%20mine%2C%20and%20a",
    "translated": true,
    "original": "I must feel pride in my friend's accomplishments as if they were mine, and a property in his virtues.",
    "sourceId": 16643
  },
  {
    "text": "Dostluğun özü, içten bir bütünlük, cömertlik ve güvendir.",
    "author": "Ralph Waldo Emerson",
    "source": "Denemeler · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/16643/pg16643-images.html#:~:text=The%20essence%20of%20friendship%20is%20entireness%2C%20a%20total%20magnanimity%20and%20trust.",
    "translated": true,
    "original": "The essence of friendship is entireness, a total magnanimity and trust.",
    "sourceId": 16643
  },
  {
    "text": "Büyük insanlar gösterişin ortasında değil, işin başındadır; zaferlerini sergilemez, çalışırlar.",
    "author": "Ralph Waldo Emerson",
    "source": "Denemeler · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/16643/pg16643-images.html#:~:text=Great%20men%20are%20not%20commonly%20in%20its%20halls%3A%20they%20are%20absent%20in%20the%20field%3A%20they",
    "translated": true,
    "original": "Great men are not commonly in its halls: they are absent in the field: they are working, not triumphing.",
    "sourceId": 16643
  },
  {
    "text": "Davranışların değerini belirleyen, birlikteliği güçlendirmeleri veya zayıflatmalarıdır.",
    "author": "Ralph Waldo Emerson",
    "source": "Denemeler · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/16643/pg16643-images.html#:~:text=That%20makes%20the%20good%20and%20bad%20of%20manners%2C%20namely%2C%20what%20helps%20or%20hinders%20fellowship.",
    "translated": true,
    "original": "That makes the good and bad of manners, namely, what helps or hinders fellowship.",
    "sourceId": 16643
  },
  {
    "text": "Kalkıp amaçlı biçimde işe koyulalım; çalışkanlıkla daha az karışıklık içinde daha çok iş yaparız.",
    "author": "Benjamin Franklin",
    "source": "The Way to Wealth · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/43855/pg43855-images.html#:~:text=Let%20us%20then%20up%20and%20be%20doing%2C%20and%20doing%20to%20the%20purpose%3A%20so%20by%20diligence",
    "translated": true,
    "original": "Let us then up and be doing, and doing to the purpose: so by diligence shall we do more with less perplexity.",
    "sourceId": 43855
  },
  {
    "text": "Çalışkanlık ve sabır sayesinde fare bile kalın bir halatı ikiye ayırır.",
    "author": "Benjamin Franklin",
    "source": "The Way to Wealth · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/43855/pg43855-images.html#:~:text=and%20by%20diligence%20and%20patience%20the%20mouse%20ate%20in%20two%20the%20cable",
    "translated": true,
    "original": "and by diligence and patience the mouse ate in two the cable",
    "sourceId": 43855
  },
  {
    "text": "Çalışkanlığımızı daha başarılı kılmak istiyorsak, ona tutumluluğu da eklemeliyiz.",
    "author": "Benjamin Franklin",
    "source": "The Way to Wealth · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/43855/pg43855-images.html#:~:text=but%20to%20these%20we%20must%20add%20frugality%2C%20if%20we%20would%20make%20our%20industry%20more%20certainly",
    "translated": true,
    "original": "but to these we must add frugality, if we would make our industry more certainly successful.",
    "sourceId": 43855
  },
  {
    "text": "Tembellik her şeyi zorlaştırır; çalışkanlık kolaylaştırır.",
    "author": "Benjamin Franklin",
    "source": "The Way to Wealth · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/43855/pg43855-images.html#:~:text=Sloth%20makes%20all%20things%20difficult%2C%20but%20industry%20all%20easy",
    "translated": true,
    "original": "Sloth makes all things difficult, but industry all easy",
    "sourceId": 43855
  },
  {
    "text": "Bugün çalış; yarın seni nelerin alıkoyacağını bilemezsin.",
    "author": "Benjamin Franklin",
    "source": "The Way to Wealth · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/43855/pg43855-images.html#:~:text=Work%20while%20it%20is%20called%20to-day%2C%20for%20you%20know%20not%20how%20much%20you%20may%20be",
    "translated": true,
    "original": "Work while it is called to-day, for you know not how much you may be hindered to-morrow.",
    "sourceId": 43855
  },
  {
    "text": "Boş zaman, yararlı bir şey yapmak için zamandır.",
    "author": "Benjamin Franklin",
    "source": "The Way to Wealth · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/43855/pg43855-images.html#:~:text=Leisure%20is%20time%20for%20doing%20something%20useful",
    "translated": true,
    "original": "Leisure is time for doing something useful",
    "sourceId": 43855
  },
  {
    "text": "Çalışkanlık huzur, bolluk ve saygınlık getirir.",
    "author": "Benjamin Franklin",
    "source": "The Way to Wealth · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/43855/pg43855-images.html#:~:text=whereas%20industry%20gives%20comfort%2C%20and%20plenty%2C%20and%20respect.",
    "translated": true,
    "original": "whereas industry gives comfort, and plenty, and respect.",
    "sourceId": 43855
  },
  {
    "text": "Desteğe ihtiyaç duyanlara anlayışsız davranma; onları teselli et ve yardımcı ol.",
    "author": "Benjamin Franklin",
    "source": "The Way to Wealth · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/43855/pg43855-images.html#:~:text=and%20therefore%2C%20ask%20that%20blessing%20humbly%2C%20and%20be%20not%20uncharitable%20to%20those%20that%20at%20present",
    "translated": true,
    "original": "and therefore, ask that blessing humbly, and be not uncharitable to those that at present seem to want it, but comfort and help them.",
    "sourceId": 43855
  },
  {
    "text": "Öğüt dinlemeyi kabul etmeyene yardım etmek güçtür.",
    "author": "Benjamin Franklin",
    "source": "The Way to Wealth · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/43855/pg43855-images.html#:~:text=However%2C%20remember%20this%2C%20%22They%20that%20will%20not%20be%20counselled%20cannot%20be%20helped",
    "translated": true,
    "original": "However, remember this, \"They that will not be counselled cannot be helped",
    "sourceId": 43855
  },
  {
    "text": "Kendinden daha iyi olmayı istemeyi ve akla uygun davranmayı daha ne kadar erteleyeceksin?",
    "author": "Epiktetos",
    "source": "El Kitabı · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/45109/pg45109-images.html#:~:text=How%20long%2C%20then%2C%20will%20you%20delay%20to%20demand%20of%20yourself%20the%20noblest%20improvements%2C%20and%20in",
    "translated": true,
    "original": "How long, then, will you delay to demand of yourself the noblest improvements, and in no instance to transgress the judgments of reason?",
    "sourceId": 45109
  },
  {
    "text": "Bir işe başlarken, o işin nasıl bir iş olduğunu kendine hatırlat.",
    "author": "Epiktetos",
    "source": "El Kitabı · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/45109/pg45109-images.html#:~:text=When%20you%20set%20about%20any%20action%2C%20remind%20yourself%20of%20what%20nature%20the%20action%20is.",
    "translated": true,
    "original": "When you set about any action, remind yourself of what nature the action is.",
    "sourceId": 45109
  },
  {
    "text": "İyi yetişmiş kişi, ne başkalarını ne de kendini suçlamaya yönelir.",
    "author": "Epiktetos",
    "source": "El Kitabı · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/45109/pg45109-images.html#:~:text=and%20one%20perfectly%20instructed%2C%20to%20reproach%20neither%20others%20nor%20himself.",
    "translated": true,
    "original": "and one perfectly instructed, to reproach neither others nor himself.",
    "sourceId": 45109
  },
  {
    "text": "Bu karakteri kazanmam için bana yardım et.",
    "author": "Epiktetos",
    "source": "El Kitabı · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/45109/pg45109-images.html#:~:text=Rather%20assist%20me%2C%20then%2C%20to%20gain%20this%20character%20than%20require%20me%20to%20do%20those%20things",
    "translated": true,
    "original": "Rather assist me, then, to gain this character than require me to do those things by which I may lose it.",
    "sourceId": 45109
  },
  {
    "text": "İyi şeyler ona nasip olduysa, onun adına sevinmelisin.",
    "author": "Epiktetos",
    "source": "El Kitabı · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/45109/pg45109-images.html#:~:text=If%20these%20things%20are%20good%2C%20you%20ought%20to%20rejoice%20that%20he%20has%20them",
    "translated": true,
    "original": "If these things are good, you ought to rejoice that he has them",
    "sourceId": 45109
  },
  {
    "text": "Doğanın işleyişini, hepimizin üzerinde uzlaştığı şeylerden öğrenebiliriz.",
    "author": "Epiktetos",
    "source": "El Kitabı · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/45109/pg45109-images.html#:~:text=The%20will%20of%20nature%20may%20be%20learned%20from%20things%20upon%20which%20we%20are%20all%20agreed.",
    "translated": true,
    "original": "The will of nature may be learned from things upon which we are all agreed.",
    "sourceId": 45109
  },
  {
    "text": "Akıl, tehlikeler karşısında bile dostumuzun ve ülkemizin yanında durmamızı söyler.",
    "author": "Epiktetos",
    "source": "El Kitabı · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/45109/pg45109-images.html#:~:text=and%20it%20directs%20us%2C%20even%20with%20these%20hazards%2C%20to%20stand%20by%20our%20friend%20and%20our",
    "translated": true,
    "original": "and it directs us, even with these hazards, to stand by our friend and our country.",
    "sourceId": 45109
  },
  {
    "text": "Yalnızken de başkalarıyla birlikteyken de koruyacağın bir karakter ve davranış belirle.",
    "author": "Epiktetos",
    "source": "El Kitabı · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/45109/pg45109-images.html#:~:text=Begin%20by%20prescribing%20to%20yourself%20some%20character%20and%20demeanor%2C%20such%20as%20you%20may%20preserve%20both",
    "translated": true,
    "original": "Begin by prescribing to yourself some character and demeanor, such as you may preserve both alone and in company.",
    "sourceId": 45109
  },
  {
    "text": "Bir toplulukta, kendi yaptıklarından ve atlattığın tehlikelerden aşırı söz etmekten kaçın.",
    "author": "Epiktetos",
    "source": "El Kitabı · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/45109/pg45109-images.html#:~:text=In%20company%2C%20avoid%20a%20frequent%20and%20excessive%20mention%20of%20your%20own%20actions%20and%20dangers.",
    "translated": true,
    "original": "In company, avoid a frequent and excessive mention of your own actions and dangers.",
    "sourceId": 45109
  },
  {
    "text": "Doğru davranmıyorsan, kaçınman gereken şey davranışın kendisidir.",
    "author": "Epiktetos",
    "source": "El Kitabı · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/45109/pg45109-images.html#:~:text=for%20if%20you%20are%20not%20acting%20rightly%2C%20shun%20the%20action%20itself",
    "translated": true,
    "original": "for if you are not acting rightly, shun the action itself",
    "sourceId": 45109
  },
  {
    "text": "Gücünü aşan bir rol üstlenirsen, yapabileceğin bir rolü de bırakmış olursun.",
    "author": "Epiktetos",
    "source": "El Kitabı · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/45109/pg45109-images.html#:~:text=If%20you%20have%20assumed%20any%20character%20beyond%20your%20strength%2C%20you%20have%20both%20demeaned%20yourself%20ill",
    "translated": true,
    "original": "If you have assumed any character beyond your strength, you have both demeaned yourself ill in that and quitted one which you might have supported.",
    "sourceId": 45109
  },
  {
    "text": "Her davranışta özenli olursak, işe daha güvenli biçimde girişiriz.",
    "author": "Epiktetos",
    "source": "El Kitabı · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/45109/pg45109-images.html#:~:text=And%20if%20we%20were%20to%20guard%20against%20this%20in%20every%20action%2C%20we%20should%20enter%20upon",
    "translated": true,
    "original": "And if we were to guard against this in every action, we should enter upon action more safely.",
    "sourceId": 45109
  },
  {
    "text": "Birinin niyetini tam anlamadan, yanlış davrandığını nasıl bilebilirsin?",
    "author": "Epiktetos",
    "source": "El Kitabı · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/45109/pg45109-images.html#:~:text=For%20unless%20you%20perfectly%20understand%20his%20motives%2C%20how%20should%20you%20know%20if%20he%20acts%20ill%3F",
    "translated": true,
    "original": "For unless you perfectly understand his motives, how should you know if he acts ill?",
    "sourceId": 45109
  },
  {
    "text": "Yardımımız dostlarımıza yarar sağlamalı ve hiç kimseye zarar vermemelidir.",
    "author": "Cicero",
    "source": "Görevler Üzerine · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/47001/pg47001-images.html#:~:text=We%20must%2C%20therefore%2C%20take%20care%20to%20indulge%20only%20in%20such%20liberality%20as%20will%20help%20our",
    "translated": true,
    "original": "We must, therefore, take care to indulge only in such liberality as will help our friends and hurt no one.",
    "sourceId": 47001
  },
  {
    "text": "Uyumlu karakterdeki iyi insanları yakın dostlukla birleştiren bağdan daha güçlü bir bağ yoktur.",
    "author": "Cicero",
    "source": "Görevler Üzerine · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/47001/pg47001-images.html#:~:text=But%20of%20all%20the%20bonds%20of%20fellowship%2C%20there%20is%20none%20more%20noble%2C%20none%20more%20powerful",
    "translated": true,
    "original": "But of all the bonds of fellowship, there is none more noble, none more powerful than when good men of congenial character are joined in intimate friendship",
    "sourceId": 47001
  },
  {
    "text": "Cesur insanların aynı zamanda dürüst, açık sözlü ve doğruluğu seven kişiler olmasını isteriz.",
    "author": "Cicero",
    "source": "Görevler Üzerine · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/47001/pg47001-images.html#:~:text=And%20so%20we%20demand%20that%20men%20who%20are%20courageous%20and%20high-souled%20shall%20at%20the%20same",
    "translated": true,
    "original": "And so we demand that men who are courageous and high-souled shall at the same time be good and straightforward, lovers of truth, and foes to deception",
    "sourceId": 47001
  },
  {
    "text": "Aklı ve sözü yerinde kullanmak, her işi özenle düşünmek ve gerçeği korumak uygun olandır.",
    "author": "Cicero",
    "source": "Görevler Üzerine · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/47001/pg47001-images.html#:~:text=For%20to%20employ%20reason%20and%20speech%20rationally%2C%20to%20do%20with%20careful%20consideration%20whatever%20one%20does%2C",
    "translated": true,
    "original": "For to employ reason and speech rationally, to do with careful consideration whatever one does, and in everything to discern the truth and to uphold it--that is proper.",
    "sourceId": 47001
  },
  {
    "text": "Ölçülü bir davranış, öğrenmeyi ve uygulama bilgeliğini gerektirir.",
    "author": "Cicero",
    "source": "Görevler Üzerine · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/47001/pg47001-images.html#:~:text=for%20discreet%20action%20will%20presuppose%20learning%20and%20practical%20wisdom",
    "translated": true,
    "original": "for discreet action will presuppose learning and practical wisdom",
    "sourceId": 47001
  },
  {
    "text": "Ortak yarara ayrılması gereken şeyler kişisel çıkara çevrilirse, insanlar arasındaki dayanışma bozulur.",
    "author": "Cicero",
    "source": "Görevler Üzerine · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/47001/pg47001-images.html#:~:text=For%20if%20the%20individual%20appropriates%20to%20selfish%20ends%20what%20should%20be%20devoted%20to%20the%20common",
    "translated": true,
    "original": "For if the individual appropriates to selfish ends what should be devoted to the common good, all human fellowship will be destroyed.",
    "sourceId": 47001
  },
  {
    "text": "Doğa, akıl aracılığıyla insanları ortak konuşma ve yaşam bağlarında birleştirir.",
    "author": "Cicero",
    "source": "Görevler Üzerine · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/47001/pg47001-images.html#:~:text=12*%20Nature%20likewise%20by%20the%20power%20of%20reason%20associates%20man%20with%20man%20in%20the%20common",
    "translated": true,
    "original": "12* Nature likewise by the power of reason associates man with man in the common bonds of speech and life",
    "sourceId": 47001
  },
  {
    "text": "Doğru ve çözülmeye değer sorunlara harcanan emek, bu yanlışlardan kaçınıldığında karşılığını bulur.",
    "author": "Cicero",
    "source": "Görevler Üzerine · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/47001/pg47001-images.html#:~:text=If%20these%20errors%20are%20successfully%20avoided%2C%20all%20the%20labour%20and%20pains%20expended%20upon%20problems%20that",
    "translated": true,
    "original": "If these errors are successfully avoided, all the labour and pains expended upon problems that are morally right and worth the solving will be fully rewarded.",
    "sourceId": 47001
  },
  {
    "text": "Adaletin temeli iyi niyettir; yani doğruluk ve verilen sözlerle anlaşmalara bağlılıktır.",
    "author": "Cicero",
    "source": "Görevler Üzerine · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/47001/pg47001-images.html#:~:text=23*%20The%20foundation%20of%20justice%2C%20moreover%2C%20is%20good%20faith--that%20is%2C%20truth%20and%20fidelity%20to%20promises",
    "translated": true,
    "original": "23* The foundation of justice, moreover, is good faith--that is, truth and fidelity to promises and agreements.",
    "sourceId": 47001
  },
  {
    "text": "İyi insanlarda karakter uyumu kadar yakınlık ve sevgi sağlayan pek az şey vardır.",
    "author": "Cicero",
    "source": "Görevler Üzerine · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/47001/pg47001-images.html#:~:text=Nothing%2C%20moreover%2C%20is%20more%20conducive%20to%20love%20and%20intimacy%20than%20compatibility%20of%20character%20in%20good",
    "translated": true,
    "original": "Nothing, moreover, is more conducive to love and intimacy than compatibility of character in good men",
    "sourceId": 47001
  },
  {
    "text": "Birlikte yaşama, danışma, konuşma, cesaretlendirme ve teselli en iyi dostlukta gelişir.",
    "author": "Cicero",
    "source": "Görevler Üzerine · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/47001/pg47001-images.html#:~:text=but%20intimate%20relationship%20of%20life%20and%20living%2C%20counsel%2C%20conversation%2C%20encouragement%2C%20comfort%2C%20and%20sometimes%20even%20reproof",
    "translated": true,
    "original": "but intimate relationship of life and living, counsel, conversation, encouragement, comfort, and sometimes even reproof flourish best in friendships.",
    "sourceId": 47001
  },
  {
    "text": "En tatlı dostluk, karakter uyumuyla sağlamlaşandır.",
    "author": "Cicero",
    "source": "Görevler Üzerine · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/47001/pg47001-images.html#:~:text=And%20that%20friendship%20is%20sweetest%20which%20is%20cemented%20by%20congeniality%20of%20character.",
    "translated": true,
    "original": "And that friendship is sweetest which is cemented by congeniality of character.",
    "sourceId": 47001
  },
  {
    "text": "Cesaretini kolayca kaybetme; hırs yüzünden kendine aşırı da güvenme.",
    "author": "Cicero",
    "source": "Görevler Üzerine · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/47001/pg47001-images.html#:~:text=At%20the%20same%20time%2C%20let%20him%20take%20care%20not%20to%20lose%20heart%20too%20readily%20through",
    "translated": true,
    "original": "At the same time, let him take care not to lose heart too readily through discouragement nor yet to be over-confident through ambition.",
    "sourceId": 47001
  },
  {
    "text": "Her davranış, gereksiz aceleden ve dikkatsizlikten uzak olmalıdır.",
    "author": "Cicero",
    "source": "Görevler Üzerine · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/47001/pg47001-images.html#:~:text=Again%2C%20every%20action%20ought%20to%20be%20free%20from%20undue%20haste%20or%20carelessness",
    "translated": true,
    "original": "Again, every action ought to be free from undue haste or carelessness",
    "sourceId": 47001
  },
  {
    "text": "Düşüncelerimizi değerli konulara yöneltmeli, dürtülerimizi aklın denetiminde tutmalıyız.",
    "author": "Cicero",
    "source": "Görevler Üzerine · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/47001/pg47001-images.html#:~:text=We%20must%20be%20careful%2C%20therefore%2C%20to%20employ%20our%20thoughts%20on%20themes%20as%20elevating%20as%20possible",
    "translated": true,
    "original": "We must be careful, therefore, to employ our thoughts on themes as elevating as possible and to keep our impulses under the control of reason.",
    "sourceId": 47001
  },
  {
    "text": "Anlatımın açıklığı, uygulamayla geliştirilebilir.",
    "author": "Cicero",
    "source": "Görevler Üzerine · Kaynak metinden Türkçe çeviri",
    "url": "https://www.gutenberg.org/cache/epub/47001/pg47001-images.html#:~:text=But%20distinctness%20may%20be%20improved%20by%20practice",
    "translated": true,
    "original": "But distinctness may be improved by practice",
    "sourceId": 47001
  }
];
 function day(date=new Date()){
  const p=Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Istanbul',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(date).filter(p=>p.type!=='literal').map(p=>[p.type,p.value]));
  return Math.floor(Date.UTC(Number(p.year),Number(p.month)-1,Number(p.day))/86400000);
 }
 // One fixed deck, five consecutive cards per Istanbul day. All 200 cards
 // appear before the next forty-day cycle, including at the cycle boundary.
 const deck=[...quotes];let seed=0x4335f00d;
 for(let i=deck.length-1;i>0;i--){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const j=Math.floor(seed/4294967296*(i+1));[deck[i],deck[j]]=[deck[j],deck[i]];}
 function forDay(serial){
  const start=((serial*5%deck.length)+deck.length)%deck.length;
  return Array.from({length:5},(_,i)=>({...deck[(start+i)%deck.length]}));
 }
 function refresh(){
  const root=document.querySelector('.rafex-daily-motivation-v355');if(!root)return;
  const serial=day();if(root.dataset.day===String(serial)&&root.dataset.quotesVersion==='433')return;
  const list=root.querySelector('ol');if(!list)return;
  list.replaceChildren(...forDay(serial).map(quote=>{
   const item=document.createElement('li'),text=document.createElement('span'),author=document.createElement('cite'),link=document.createElement('a');
   text.className='rafex-quote-text-v358';text.textContent='“'+quote.text+'”';
   author.className='rafex-quote-author-v358';link.textContent='— '+quote.author;link.href=quote.url;link.target='_blank';link.rel='noopener noreferrer';link.title=quote.source+(quote.translated?' · Türkçe çeviri':'');link.setAttribute('aria-label',quote.author+' · Kaynağı aç');author.appendChild(link);item.append(text,author);return item;
  }));root.dataset.day=String(serial);root.dataset.quotesVersion='433';window.rafexMotivationCarouselV356?.sync(root);
  const date=root.closest('.welcome-hero')?.querySelector('.welcome-date');if(date)date.textContent=new Intl.DateTimeFormat(typeof localeForLanguage==='function'?localeForLanguage():'tr-TR',{timeZone:'Europe/Istanbul',weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(new Date());
 }
 window.rafexDailyMotivationV355={day,forDay,refresh,version:433,poolSize:quotes.length};refresh();
 window.addEventListener('focus',refresh);window.addEventListener('pageshow',refresh);setInterval(refresh,60000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});
})();