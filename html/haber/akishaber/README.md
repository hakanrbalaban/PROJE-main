# Akış Haber 2.1

Satışa ve child-theme geliştirmeye uygun, modüler WordPress haber teması.

## Kurulum

1. `akishaber.zip` dosyasını **Görünüm → Temalar → Yeni Ekle → Tema Yükle** alanından yükleyin.
2. Temayı etkinleştirin.
3. **Görünüm → Akış Haber Demo** sayfasında demo içerik yükleyicisini çalıştırın.
4. **Görünüm → Menüler** ve **Görünüm → Bileşenler** alanlarını kontrol edin.
5. Kalıcı bağlantıları yenilemek için **Ayarlar → Kalıcı Bağlantılar → Kaydet** seçeneğini kullanın.

## Yapı

```text
akishaber/
├── assets/
│   ├── css/ (main, WordPress, manşet ve profesyonel stiller)
│   ├── js/ (tema etkileşimleri)
│   ├── images/ (yerel telifsiz demo görselleri)
│   └── fonts/
├── inc/
│   ├── class-theme-setup.php
│   ├── customizer.php
│   ├── daily-content.php   (günün sözü/ayeti, burç, hava, namaz verileri)
│   ├── enqueue.php
│   ├── helpers.php
│   ├── hooks.php
│   ├── icons.php           (SVG ikon kitaplığı ve ikonlu bölüm başlığı)
│   ├── template-tags.php
│   ├── widgets.php         (11 tema widget'ı)
│   └── custom-post-types.php
├── template-parts/
│   ├── header/
│   ├── footer/
│   ├── post/
│   ├── page/
│   ├── sidebar/            (widget gövdeleri: hava, burç, söz, ayet, liste…)
│   └── home/
├── languages/akishaber.pot
└── WordPress şablon dosyaları
```

## Özellikler

- Otomatik oynatmalı manşet slider: ok tuşları, nokta göstergeleri, ilerleme çubuğu,
  dokunmatik kaydırma ve yandaki tıklanabilir manşet listesi
- İkonlu bölüm başlıkları ve yatay kaydırmalı haber rayları (Son Dakika Akışı, Dünya Gündemi)
- Lightbox destekli gerçek foto galeri (küçük resim şeridi, sayaç, klavye kısayolları)
- Ana sayfa, yazı, sayfa, arşiv ve arama ekranlarında sidebar
- Kategori, dönem ve sıralama filtreleri
- Zengin haber detayı: büyük görsel, görsel kredisi, sabit paylaşım çubuğu, yazar kutusu
- Altı kartlı benzer haberler ve önceki/sonraki navigasyonu
- Foto galeri ve yayın özel içerik tipleri
- WordPress Customizer, menü ve widget alanları
- Sürükle-bırak eklenebilen 11 tema widget'ı: Hava Durumu, Günlük Burç, Günün Sözü,
  Günün Ayeti, Namaz Vakitleri, Piyasalar, Sekmeli Haberler, Haber Listesi,
  Foto Galeri, Sosyal Medya ve Reklam Alanı
- Widget'sız sidebar'larda aynı bileşenlerin hazır varsayılan dizilimi
- **Görünüm → Akış Haber Demo → Haber Görsellerini Yenile** ile toplu görsel ataması
- `theme.json`, editör stili ve çeviri şablonu
- Öne çıkan görsel yoksa kategoriye uygun yerel görsel

## Görsel lisansları

Paket içindeki `unsplash-*.jpg` demo fotoğrafları Unsplash üzerinden yerelleştirilmiştir. Kaynak fotoğraf kimlikleri dosya adlarıyla birlikte geliştirici paketinde korunmalı ve dağıtım öncesi güncel Unsplash lisansı doğrulanmalıdır. `ph-*.svg` dosyaları bu tema için özgün hazırlanmış çevrimdışı yedek illüstrasyonlardır. Kullanıcıların yüklediği medyanın lisans sorumluluğu site sahibine aittir.

## Geliştirici notları

- Text domain: `akishaber`
- PHP: 7.4+
- WordPress: 6.0+
- Yeni PHP modüllerini `functions.php` loader dosyasına ekleyin.
- CPT'lerin kalıcı olması gereken üretim kurulumlarında `inc/custom-post-types.php` içeriğini companion eklentiye taşımanız önerilir.
