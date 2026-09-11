# Kayıtlı raf detayı sözleşmesi

Kullanıcı talebi: “Rafı Kaydet” anında raf nasıl görünüyorsa daha sonra her yerde aynı detay kullanılmalıdır. Bu kural B2B/HR, MR, Konsol, Drive-In ve Mekik sistemlerinin tamamı için geçerlidir.

- Kalıcı raf kaydındaki `drawing.rackDetail`, kayıt anındaki çözülmüş görünüm seçeneklerini saklar. Mevcut ortak raf kayıt tablosuyla birlikte kalıcılaşır.
- Kopyala, İncele ve Özelleştir'in ilk görünümü aynı kaydı okumalıdır. Aktif başka sistemin formu, varsayılan travers ölçüsü veya yeniden yapılan otomatik ayak hesabı bu kaydı değiştiremez.
- Kat kotları, travers ölçüleri, ayak boyu, paletler, aksesuarlar, renkler, ölçü görünürlüğü ve ölçü yazısı büyüklüğü görünüm detayının parçasıdır.
- Teknik ayar değişikliği yeni bir taslak oluşturur. Kaydetmeden kaynak kayıt değişmez. Taşıma, döndürme ve blok adı değiştirme teknik detayı değiştirmez.
- Eski kayıtta görünüm detayı yoksa yalnızca o kaydın kendi teknik verileri kullanılır. Eksik geçmiş bilgiler başka açık formdan alınmaz.
- Yeni görünüm eklenirken bu sözleşme ve `verify-rack-detail-snapshot-v135.mjs` korunmalıdır.
