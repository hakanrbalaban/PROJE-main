# Telif Hakkı ve Lisans Analiz Raporu

**Proje:** Taş Kağıt Makas Oyunu (Vanilla HTML/CSS/JS)
**Analiz Tarihi:** 2026 (proje teslim tarihine göre güncellenmelidir)
**Kapsam:** `index.html`, `style.css`, `script.js`

---

## 1. Genel Sonuç

✅ **Proje, ticari veya kişisel projelerde serbestçe kullanılabilir.**
İncelenen üç dosyada da:
- Üçüncü taraflara ait telif korumalı **kod, görsel veya varlık (asset) kopyalanmamıştır.**
- Kullanılan tüm dış kaynaklar (Google Fonts, emoji karakterleri) **açık lisanslı** veya **serbest kullanım standardı** kapsamındadır.
- Kodun tamamı bu görev kapsamında sıfırdan (orijinal) yazılmıştır; bilinen bir açık kaynak kütüphaneden (jQuery, React, Bootstrap vb.) alınmış kod parçası **yoktur**.

---

## 2. Detaylı İnceleme

### 2.1. HTML (`index.html`)

| Öğe | Kaynak | Lisans Durumu | Not |
|---|---|---|---|
| Sayfa yapısı, metinler | Orijinal | — | Telif sorunu yok, projeye özgü. |
| Google Fonts bağlantısı (`fonts.googleapis.com`, Poppins) | Google Fonts | **SIL Open Font License (OFL) 1.1** | Ticari/kişisel kullanım, değiştirme ve dağıtım serbesttir. Sadece font adı ("Poppins") reserve isim olabilir; font dosyasının kendisi değiştirilip "Poppins" adıyla yeniden satılamaz — bizim kullanım şeklimiz (CDN üzerinden `<link>` ile çağırmak) bu kısıtlamayı hiç ilgilendirmez. |
| Emoji karakterleri (✊✋✌️🔊🔄) | Unicode Standard | **Unicode karakter kod noktaları telifsizdir** | Emoji *glifleri* (görsel tasarımları) platforma göre (Apple, Google, Microsoft) farklı çizilir ve bu görsel tasarımlar teorik olarak ilgili şirketlerin telifi altındadır. Ancak burada emoji, `<span>` içine **metin karakteri olarak** yazılmıştır; tarayıcı/işletim sistemi kendi emoji fontunu render eder. Uygulama hiçbir emoji görselini (png/svg) dosya olarak barındırmamaktadır. Bu kullanım biçimi (Unicode karakteri olarak yazmak) **tüm platformlarda serbest ve standarttır**, telif ihlali oluşturmaz. |

**Risk Seviyesi:** Yok (0/5)

---

### 2.2. CSS (`style.css`)

| Öğe | Kaynak | Lisans Durumu | Not |
|---|---|---|---|
| Tüm stil kuralları, animasyonlar (`@keyframes`), gradyanlar | Orijinal | — | Sıfırdan yazılmıştır. Renk kodları, animasyon eğrileri gibi teknik değerler telife konu olmaz (fikirler/sayılar korunmaz, sadece somut ifade/kod korunur; burada zaten orijinal kod). |
| `font-family: 'Poppins'` referansı | Google Fonts (OFL 1.1) | Aynı font, yukarıdaki HTML notu geçerli | Serbest kullanım. |
| Framework/kütüphane kullanımı | Yok | — | Bootstrap, Tailwind, Animate.css gibi bir kütüphaneden **kopya kod alınmamıştır**. |

**Risk Seviyesi:** Yok (0/5)

---

### 2.3. JavaScript (`script.js`)

| Öğe | Kaynak | Lisans Durumu | Not |
|---|---|---|---|
| Oyun mantığı (taş/kağıt/makas kuralları) | Orijinal kod | — | "Taş kağıt makas" oyununun **kuralları** (taş makası yener vb.) yüzyıllardır var olan, kamuya açık bir halk oyunudur; **hiçbir şirket veya kişi bu oyun kuralını telif altına alamaz.** Sadece belirli bir *ifade biçimi* (örn. belirli bir markanın logosu, belirli bir oyunun özel görsel/ses varlıkları) telif konusu olabilir; burada böyle bir şey kullanılmamıştır. |
| localStorage kullanımı | Web standardı (W3C) | — | Tarayıcı API'si, telif dışı. |
| Web Audio API (`AudioContext`, osilatör tabanlı bip sesleri) | Web standardı (W3C) | — | Sesler **hazır ses dosyası (mp3/wav) kullanılmadan**, matematiksel osilatörlerle kod içinde üretilmektedir. Bu nedenle üçüncü taraf ses telifi (örn. royalty-free ses kütüphaneleri, YouTube Audio Library vb. şartları) **hiç gündeme gelmez** — sesler tamamen orijinal ve kod-üretimlidir. |
| Kütüphane/paket kullanımı | Yok (`npm`, `require`, `import` yok) | — | Hiçbir üçüncü parti JS kütüphanesi (lodash, jQuery, GSAP vb.) dahil edilmemiştir. Bağımlılık yok. |

**Risk Seviyesi:** Yok (0/5)

---

## 3. Marka / Fikri Mülkiyet Kontrolü

- Proje adı ("Taş Kağıt Makas") jenerik bir oyun ismidir, herhangi bir markayla çakışmaz.
- Footer'daki "Taş Kağıt Makas Studio" ifadesi placeholder/örnek bir stüdyo adıdır; gerçek bir şirketle **isim benzerliği kontrolü kullanıcı tarafından yapılmalıdır** eğer bu proje yayınlanacaksa (örn. ticari bir marka ile aynı isim çakışması ihtimaline karşı).
- Logo/favicon kullanılmamıştır, bu nedenle üçüncü taraf logo telifi riski yoktur.

---

## 4. Öneriler

1. **Google Fonts CDN bağımlılığı:** Kullanıcı gizlilik politikası gerektiren bir bağlamda (KVKK/GDPR) yayınlayacaksa, Google Fonts'un CDN üzerinden çağrılması kullanıcı IP adresini Google'a iletir. Bunun yerine fontu **kendi sunucunuzda barındırmak** (self-host) gizlilik açısından daha güvenli olur. Bu bir telif sorunu değil, bir **gizlilik/uyumluluk** önerisidir.
2. **Emoji tutarlılığı:** Emoji görünümü kullanıcının işletim sistemine göre değişir (Windows'ta farklı, macOS'ta farklı görünebilir). İsterseniz açık lisanslı bir emoji font/SVG seti (ör. **Twemoji** - MIT/CC-BY 4.0 lisanslı, Twitter/X tarafından açık kaynak yapılmıştır) entegre edilerek görünüm tüm platformlarda birleştirilebilir. Bu tamamen opsiyoneldir ve telif açısından zaten güvenlidir.
3. Proje bir şirket/marka adına yayınlanacaksa, footer'daki "Taş Kağıt Makas Studio" gibi örnek isimlerin gerçek kullanım öncesi **kendi marka adınızla** değiştirilmesi önerilir.

---

## 5. Sonuç Özeti

| Kategori | Durum |
|---|---|
| Kaynak kod özgünlüğü | ✅ %100 orijinal |
| Üçüncü parti kütüphane kullanımı | ✅ Yok |
| Görsel/ses varlığı (asset) kullanımı | ✅ Yok (emoji = Unicode metin, ses = kod ile üretilmiş) |
| Font lisansı | ✅ Google Fonts (SIL OFL 1.1) — serbest |
| Oyun kuralı/konsept telifi | ✅ Kamuya açık, telifsiz halk oyunu |
| Marka çakışması riski | ⚠️ Düşük (placeholder isim, yayın öncesi kontrol önerilir) |
| **Genel Telif Riski** | **YOK / ÇOK DÜŞÜK** |

Bu proje, ticari kullanım dahil olmak üzere **herhangi bir kısıtlama olmaksızın kullanılabilir, dağıtılabilir ve üzerine geliştirme yapılabilir.**
