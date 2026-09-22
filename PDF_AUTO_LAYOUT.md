# PDF’den otomatik yerleşim

Ortak Çizim ekranında “Eski projeden raf tipi kopyala” yanında “Otomatik yerleşim” bulunur. Dosya seçildiğinde tarayıcı PDF.js ile metinleri ve vektörleri okur. Harici AI servisi veya API anahtarı gerekmez; PDF dosyası sunucuya gönderilmez.

İlk sürümün kapsamı: tek sayfada plan, hizalı yan kesitler, ölçülü ön kesitler ve palet ölçü/yük tablosu bulunan vektörel B2B çizimleri. Taranmış PDF, farklı kesit düzenleri, özel açıklıklar veya belirsiz eşleştirmeler hata mesajıyla durdurulur. Dosya adına veya müşteriye özel koordinat/veri kullanılmaz. Ölçek, açıklık ölçüleri ve karşılık gelen çizgilerden hesaplanır. Sayfa konumu değişse de algılama çalışır.

Önizleme algılanan tipleri, göz sayılarını ve kaynak çakışmalarını gösterir. Kullanıcı uyguladığında mevcut B2B hesap motoru ayak/travers seçer ve gerçek kayıtlı tipler ile gerçek yerleşim blokları oluşturulur. Kat kotları uygulamanın `manualLevelSpecs` veri modeliyle saklanır; bu, kullanıcıdan elle veri girişi istemez. Her tipin ölçüsü ve ayak kapasitesi doğrulanır. İşlem hatasında katalog ve çizim eski haline döner.

Kesit ölçüleri aşağıdan yukarı okunur: ilk ölçü zeminden ilk travers üstüne, devamındaki ölçüler alt travers üstünden üst travers altına net açıklıktır. Net açıklığa seçilen travers yüksekliği ayrıca eklenerek kat kotu hesaplanır; farklı kat açıklıkları ayrı saklanır. Palet yüksekliği her katta palet tablosundan alınır. Paletten kısa açıklıklar reddedilir. Kayıt, önizleme ve rapordaki ayak yüksekliği alanları ölçülen raf yüksekliğini korur. Önizleme tablosu palet yüksekliğini ve kat açıklıklarını da gösterir.

PDF’de depo dış sınırı doğrulanamadığında duvar uydurulmaz; yalnız mevcut raf planı aktarılır. Kapı/kolon engelleri ve bina yüksekliği bu sürümde algılanmaz. Alan optimizasyonu yapılmaz. Kaynakta çakışan gözler açık onayla bekletilir; liste proje `layout.pdfImport` alanında saklanır. Aynı tip ve aynı boyuna konumdaki yakın sırt sırta gözler, PDF’den ölçülen ara mesafe ile gerçek çift sıra tipine dönüştürülür. Farklı yükseklik/tipler ve koridorla ayrılmış sıralar eşleştirilmez. Devam eden gözler uyumlu ayak profiliyle `joinGroup` / `sharedFootWith` bağlantıları alır; tekli uçlar çift sıraya tek ortak çerçeveyle bağlanabilir. Aynı yükseklik ve ayak hesap koşullarındaki tipler yeterli kapasiteye sahip ortak profil kullanır. Geçiş boşlukları ve bekletilen gözlerin boşluğu korunur. Birleşim bilgileri ve kaynak göz kimlikleri normal “Projeyi Kaydet” işlemiyle saklanır.

Doğrulama:

```
node scripts/verify-pdf-auto-layout-v188.mjs
```

`RAFEX_PDF_FIXTURE` ortam değişkeni özel test PDF’sinin yoluna ayarlanırsa gerçek vektör okuma, altı tip/262 göz/12 sıra, çakışma tespiti, sayfa koordinatı değişimi ve eksik yük tablosu testleri de çalışır. Müşteri PDF’si ve çıkarılan proje verisi depoya eklenmez.
