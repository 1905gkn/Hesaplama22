# RAFEX kayıtlı proje ürünleri API’si

Üretim adresi: `https://rafex-configurator.vercel.app`

## Kullanım

`GET /api/projects/by-number/{projectNo}/products`

`projectNo`, **Proje Geçmişi’ndeki kayıt numarasıdır** (`serial_no`). Raf tipi kataloğunun numarası veya veritabanı satır kimliği değildir. Her yeni proje kaydı kendi numarasıyla ayrı bir ürün dökümüdür. Aynı proje tekrar kaydedilirse yeni kayıt numarasını kullanın.

Örnek: `GET https://rafex-configurator.vercel.app/api/projects/by-number/315/products`

Bu işlem salt okunurdur. API başka bir sisteme otomatik gönderim yapmaz.

## Oturum ve erişim

Önce mevcut portal hesabıyla `POST /api/login` çağrılır:

```http
POST /api/login
Content-Type: application/json

{"username":"PORTAL_KULLANICISI","password":"PORTAL_PAROLASI"}
```

Başarılı yanıtın `Set-Cookie` başlığındaki `rafex_session` çerezini istemcinin çerez deposunda saklayın ve GET isteğinde gönderin. Parolayı uygulamanızın gizli yapılandırmasından alın. Oturum sona erdiğinde 401 yanıtından sonra yeniden giriş yapın. Oturum süresi mevcut portal ile aynıdır; GET için ek bir API anahtarı yoktur.

```http
GET /api/projects/by-number/315/products
Cookie: rafex_session=OTURUM_DEGERI
Accept: application/json
```

Standart kullanıcı yalnızca kendi proje kayıtlarını, süper kullanıcı tüm proje kayıtlarını okuyabilir. Bir sunucu uygulamasından çağırın; farklı bir web sitesine çerezli CORS erişimi açılmamıştır.

## Yanıt

CRM bağlantılı kayıt:

```json
{
  "projectNo": 315,
  "crmNo": 208,
  "products": [
    {
      "code": "EPHR",
      "name": "Emniyet pimi",
      "description": "",
      "quantity": 48,
      "unit": "adet"
    }
  ],
  "complete": true
}
```

CRM yoksa `crmNo` yerine `projectName` gelir:

```json
{
  "projectNo": 316,
  "projectName": "Depo yerleşimi",
  "products": [],
  "complete": true
}
```

Örnek numaralar ve adetler temsilidir. `products: []` yalnızca ürün içermeyen yeni bir kayıt için geçerlidir.

- Kodlar metindir; baştaki sıfırları koruyun.
- Adetler JSON sayısıdır. Birim `unit` alanındadır.
- Tüm alanlar dahil edilir. Aynı kod ve birime ait adetler toplanır.
- Hesap, ekrandaki/Excel’deki ürün hesabının aynısından **kaydedildiği anda** alınır. API güncel katalogla eski kaydı yeniden hesaplamaz ve açık tarayıcıya ihtiyaç duymaz.
- Kod tanımlanmamış ürünler kaybolmaz: `code: null`, ürün adı, açıklaması ve adediyle döner. Bu durumda `complete: false` ve `warning` bulunur. `complete`, kodların tamlığını belirtir; bu satırları kod gerektiren ERP işlemine aktarmadan önce kod eşlemesini tamamlayın. Kod tahmin edilmez.
- Yanıt yalnızca ürün dökümünü ve proje/CRM tanımını içerir; çizim, notlar, firma/kişi detayları ve kullanıcı bilgileri içermez. Yanıtlar önbelleğe alınmaz.

## Hatalar

| HTTP | code | Anlamı |
| --- | --- | --- |
| 400 | INVALID_PROJECT_NUMBER | Pozitif tam sayı gerekir. |
| 401 | — | Portal oturumu yok/geçersiz. |
| 404 | PROJECT_NOT_FOUND | Kayıt yok veya kullanıcı erişemiyor. |
| 405 | METHOD_NOT_ALLOWED | Bu uç nokta yalnızca GET destekler. |
| 409 | PRODUCT_SNAPSHOT_REQUIRED | Eski kayıtta ürün dökümü yok. Projeyi açıp **yeniden kaydedin**; dönen yeni kayıt numarasını kullanın. |
| 409 | INVALID_PRODUCT_SNAPSHOT | Saklanan ürün dökümü geçersiz. Yeniden kayıt gerekir. |

Eski kayıtlar otomatik değiştirilmez. Yeni sürüm yüklendikten sonra kaydedilen serbest yerleşim projeleri ürün dökümünü taşır. Eski açık sekmede yeni sürüm yüklenmemişse önce çalışmanızı koruyup sayfayı yenileyin.
