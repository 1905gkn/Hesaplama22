# PDF’den otomatik yerleşim

Ortak Çizim ekranında “Eski projeden raf tipi kopyala” yanında “Otomatik yerleşim” bulunur. Dosya seçildiğinde tarayıcı PDF.js ile metinleri ve vektörleri okur. Harici AI servisi veya API anahtarı gerekmez; PDF dosyası sunucuya gönderilmez.

Vektörel okuma kapsamı: tek sayfada plan, hizalı yan kesitler, ölçülü ön kesitler ve palet ölçü/yük tablosu bulunan B2B çizimleri. Farklı kesit düzenleri, özel açıklıklar veya belirsiz eşleştirmeler hata mesajıyla durdurulur. Dosya adına veya müşteriye özel koordinat/veri kullanılmaz. Ölçek, açıklık ölçüleri ve karşılık gelen çizgilerden hesaplanır. Sayfa konumu değişse de algılama çalışır.

Resim PDF desteği: çizgi verisi olmayan tek sayfalar tarayıcıda rasterleştirilir. Tekrarlayan kırmızı/turuncu yatay traversler ve koyu dikmelerden olası raf gözleri çıkarılır. Tesseract 7 OCR ve İngilizce sayı/metin modeli uygulamanın kendi statik dosyalarından yüklenir; PDF harici servise gönderilmez. Bu renkli yatay plan desteğidir; her fotoğraf, siyah-beyaz tarama veya eğik plan için genel çözüm değildir. OCR'nin güvenle eşleştirebildiği etiketli ölçüler/yükler önerilir; okunamayan kritik ölçüler zorunlu alanlarda kullanıcıya sorulur. Önizlemede gözlere tıklayarak istenmeyen gözler çıkarılabilir. Kullanıcı ölçüleri, ikili/üçlü gözleri, çapraz aktarım türünü ve tünelleri doğrulamadan hazırlama, ardından mevcut çizimi değiştirmeyi onaylamadan uygulama yapılamaz. Renkli iç çaprazlar mor, komşu raflarla sınırlandırılmış gri taralı tüneller mavi gösterilir. Onaylanan çaprazlar native tek göz/hafif çapraz olarak eklenir; ağır/iki göz çaprazı otomatik sınıflandırılmaz. Tünel net geçiş yüksekliği zorunlu doğrulanır, alt travers ve paletler native tünel görünürlüğüyle kaldırılır, ilk kalan kata tava eklenir. Çapraz ve tünel ayrıntıları raf üzerinde saklanır; aynı temel raf için yeni katalog tipi üretmez. Kalibrasyon standart travers açıklığından yapılır; belirsiz açıklıklar listelenip dışarıda tutulur. Kontrol edilen sonuç, aynı native raf hesabı, çift sıra ve birleşim akışını kullanır.

Önizleme algılanan tipleri, göz sayılarını ve kaynak çakışmalarını gösterir. Kullanıcı uyguladığında mevcut B2B hesap motoru ayak/travers seçer ve gerçek kayıtlı tipler ile gerçek yerleşim blokları oluşturulur. Kat kotları uygulamanın `manualLevelSpecs` veri modeliyle saklanır; bu, kullanıcıdan elle veri girişi istemez. Her tipin ölçüsü ve ayak kapasitesi doğrulanır. İşlem hatasında katalog ve çizim eski haline döner.

Kesit ölçüleri aşağıdan yukarı okunur: ilk ölçü zeminden ilk travers üstüne, devamındaki ölçüler alt travers üstünden üst travers altına net açıklıktır. Net açıklığa seçilen travers yüksekliği ayrıca eklenerek kat kotu hesaplanır; farklı kat açıklıkları ayrı saklanır. Palet yüksekliği her katta palet tablosundan alınır. Paletten kısa açıklıklar reddedilir. Kayıt, önizleme ve rapordaki ayak yüksekliği alanları ölçülen raf yüksekliğini korur. Önizleme tablosu palet yüksekliğini ve kat açıklıklarını da gösterir.

PDF’de depo dış sınırı doğrulanamadığında duvar uydurulmaz; yalnız mevcut raf planı aktarılır. Kapı/kolon engelleri ve bina yüksekliği bu sürümde algılanmaz. Alan optimizasyonu yapılmaz. Kaynakta çakışan gözler açık onayla bekletilir; liste proje `layout.pdfImport` alanında saklanır. Aynı tip ve aynı boyuna konumdaki yakın sırt sırta gözler, PDF’den ölçülen ara mesafe ile gerçek çift sıra tipine dönüştürülür. Farklı yükseklik/tipler ve koridorla ayrılmış sıralar eşleştirilmez. Devam eden gözler uyumlu ayak profiliyle `joinGroup` / `sharedFootWith` bağlantıları alır; tekli uçlar çift sıraya tek ortak çerçeveyle bağlanabilir. Aynı yükseklik ve ayak hesap koşullarındaki tipler yeterli kapasiteye sahip ortak profil kullanır. Geçiş boşlukları ve bekletilen gözlerin boşluğu korunur. Birleşim bilgileri ve kaynak göz kimlikleri normal “Projeyi Kaydet” işlemiyle saklanır.

Doğrulama:

```
node scripts/verify-pdf-auto-layout-v188.mjs
node scripts/verify-pdf-raster-v190.mjs
```

`RAFEX_PDF_FIXTURE` ortam değişkeni özel test PDF’sinin yoluna ayarlanırsa gerçek vektör okuma, altı tip/262 göz/12 sıra, çakışma tespiti, sayfa koordinatı değişimi ve eksik yük tablosu testleri de çalışır. Müşteri PDF’si ve çıkarılan proje verisi depoya eklenmez.

Resim PDF çift sıralarında çerçeveler arası mesafe ölçü kontrolünde alınır. Pikselden tahmin edilen küçük mesafe farkları yeni raf tipi üretmez; aynı kesit ve onaylı mesafeye sahip çift sıralar tek tipte toplanır.

Çoklu PDF: aynı seçimde veya art arda en fazla 10 dosya eklenir (dosya başına 20 MB, toplam 100 MB). Her dosya ayrı okunur ve resim ölçüleri ayrı onaylanır. Hatalı dosya açıkça kaldırılmadan veya başarıyla yeniden okunmadan toplu uygulama açılmaz. Aynı yapısal özellikteki tipler birleştirilir; farklı dosyaların kaynak kimlikleri ve ortak ayak zincirleri ayrılır. Planlar kendi yönlerini koruyarak yan yana yerleşir; dosyalar arası 3000 mm gösterim aralığı bir depo koridor ölçüsü değildir. Dosya listesi proje kaydında saklanır. Her PDF hâlâ tek sayfalık plan/kesit olmalıdır; ayrı dosyalardaki kesit ve planı otomatik eşleştirme yapılmaz.

Resim ölçü kontrolünde travers yüksekliği de alınır. Yük tablosundaki uygun seçeneklerden bu yüksekliğe uyan profil seçilir; uygun profil yoksa sessizce farklı yükseklik uygulanmaz. Referans kesit testi: ilk net açıklık 2030, travers 100, devam eden net açıklık 2050; travers üstleri 2130/4280/6430/8580, paletli toplam yükseklik 10480 mm. H işaretli zemin boşlukları plan konumu eşleştirilmedikçe uygulanmaz; toplam referans kapasitesinin doğrulandığı iddia edilmez.

Ek testler: `node scripts/verify-pdf-batch-v191.mjs` ve `node scripts/verify-pdf-reference-v191.mjs`. İkinci test `RAFEX_PLAN_IMAGE` verilirse özel referans planındaki 508 göz / 26 ikili / 32 tünelli göz ayrımını da doğrular. Özel görseller depoya eklenmez.

PNG: dosya seçici PDF ve PNG’yi aynı listede kabul eder. PNG başlığı ve açılmış görüntü boyutu doğrulanır (32 milyon piksel / kenar başına 16000 piksel); görüntü tarayıcıda çözülür, şeffaf alanlar beyaz zemine alınır ve en uzun kenar 3200 piksele sınırlandırılır. PDF raster okuyucusuyla aynı geometri/OCR ve ölçü kontrolü kullanılır. Bitmap, canvas ve OCR işçisi başarı/hata/iptalde serbest bırakılır. PNG plan desteğidir; tek başına kesit görseli bir yerleşim planı oluşturmaz ve ayrı kesit görselini plan dosyasına otomatik bağlamaz.

`node scripts/verify-png-import-v192.mjs` PNG biçim ve boyut kontrollerini doğrular. Gerçek tarayıcı testinde referans PNG (508 göz) ve vektör PDF beraber okunup yerleştirilmiş ve dosya adlarıyla kaydedilmiştir.
