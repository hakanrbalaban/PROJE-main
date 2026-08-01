# CREDITS & Haklar

Bu dosya, [telif/lisans risk raporundaki](README.md) önerilere göre siteyi
şeffaf ve atıflı hâle getirir.

## 1. Site kodu (HTML / CSS / JS)

| Öğe | Lisans | Not |
| --- | --- | --- |
| `index.html`, `css/style.css`, `js/main.js` | MIT | Ayrıntı: `LICENSE` |

Üçüncü taraf JS/CSS kütüphanesi kullanılmamıştır (jQuery, Bootstrap, npm yok).

## 2. Tipografi (Google Fonts · SIL OFL 1.1)

| Font | Tasarım | Lisans | Kaynak |
| --- | --- | --- | --- |
| Cormorant Garamond | Christian Thalmann / Catharsis Fonts | SIL OFL 1.1 | https://fonts.google.com/specimen/Cormorant+Garamond |
| Outfit | Rodrigo Fuenzalida / Outfitio | SIL OFL 1.1 | https://fonts.google.com/specimen/Outfit |

Fontlar CDN (`fonts.googleapis.com` / `fonts.gstatic.com`) üzerinden yüklenir;
yerel font dosyası gömülü değildir. OFL, web sitesinde kullanımı serbest bırakır.

Yedek sistem fontları: Georgia, system-ui, Segoe UI (işletim sistemi fontları).

## 3. Fotoğraflar (`images/*.webp`)

| Dosya | Hak sahibi | Yayın rızası |
| --- | --- | --- |
| Tüm `.webp` dosyaları | Balaban ailesi / ilgili fotoğrafçı | Aile üyeleri adına bu sitede yayımlanmak üzere beyan edilmiştir |

- Stok site (Unsplash, Shutterstock vb.) görseli **yoktur**.
- Üçüncü taraf sprite / oyun karakteri / ticari ikon paketi **yoktur**.
- Eski indirme adları (Imageye / Instagram biçimi) yalnızca teknik kökeni gösterir;
  içerik aile albümüne aittir. Dosyalar yeniden adlandırılmıştır (`sahil-*.webp` vb.).
- EXIF/XMP içinde üretici alanı bulunmamaktadır (dönüştürme sırasında temizlenmiş
  veya hiç yazılmamış olabilir). Hak beyanı bu dosya ve site `#yasal` bölümüdür.

Fotoğraflar **MIT kapsamında değildir**. Ticari kullanım, kazıma (scraping) veya
izinsiz yeniden yayın yasaktır.

## 4. İkonlar ve süslemeler

- Navigasyon / lightbox SVG path’leri: site için yazılmış özgün çizimler.
- Favicon: özgün SVG “B” işaretı (data URI) — üçüncü taraf emoji/görsel gömülü değildir.
- CSS `feTurbulence` grain dokusu: jenerik SVG filtre tekniği; ayrı ticari asset değildir.

## 5. Barındırma, önbellek (cache) ve DMCA

- Site GitHub Pages üzerinde yayınlanabilir; içerik CDN üzerinden önbelleğe alınabilir.
- Ziyaretçi, sitedeki onay bandı ile önbellek / yasal bilgilendirmeyi kabul eder.
- Telif ihlali iddiası (DMCA) için: GitHub deposu Issues üzerinden veya
  `https://github.com/hakanrbalaban/balaban-ailesi` iletişimi kullanın.
  GitHub’un kendi DMCA süreci: https://docs.github.com/en/site-policy/content-removal-policies/dmca-takedown-policy

## 6. Yerel depolama (tarayıcı)

Onay sonrası tarayıcıda saklanabilir:

- `aile-yasal-onay` — DMCA / önbellek / gizlilik onayı
- `aile-theme` — açık/koyu tema tercihi
- `aile-defter` — ziyaretçi defteri notları (sunucuya gitmez)

## 7. Güncelleme

Son güncelleme: 2026-08-01
