# Balaban Ailesi — Aile Tanıtım Sitesi

Projedeki fotoğraflar kullanılarak hazırlanmış, tek sayfalık modern bir aile tanıtım
sitesi. Saf HTML, CSS ve JavaScript ile yazıldı; herhangi bir kurulum veya derleme
adımı gerektirmez.

## Çalıştırma

`index.html` dosyasına çift tıklamanız yeterli. Dilerseniz basit bir sunucu da
kullanabilirsiniz:

```bash
python -m http.server 5500
```

Ardından tarayıcıdan `http://localhost:5500` adresini açın.

## Dosya Yapısı

```
aile/
├─ index.html          Tüm bölümler ve metinler
├─ css/style.css       Tasarım, animasyonlar, açık/koyu tema, responsive
├─ js/main.js          Slider, galeri, lightbox, sayaçlar, ziyaretçi defteri
└─ images/             10 adet fotoğraf (.webp)
```

## Bölümler

| Bölüm | İçerik |
| --- | --- |
| Hero | Ken Burns efektli tam ekran slayt, animasyonlu başlık, canlı gün sayacı |
| Hikâyemiz | Çerçeveli fotoğraf kompozisyonu, aile ilkeleri, imza animasyonu |
| Sayaçlar | Görünür olunca sayan istatistikler |
| Biz Kimiz | Aile üyesi kartları |
| Zaman Tüneli | Kaydırmayla dolan çizgi, dönüşümlü kartlar |
| Albüm | Filtrelenebilir galeri + tam ekran lightbox |
| Sözlerimiz | Otomatik geçişli alıntı döngüsü |
| Küçük Şeyler | Sevilen alışkanlıklar kartları |
| Ziyaretçi Defteri | Tarayıcıda saklanan notlar (localStorage) |

## Kişiselleştirme

Site şu aile üyeleriyle güncellendi:

**Kardeşler (Balaban):** Hakan Rüştü, Gökhan, Merve, Özcan, Aziz  
**Baba tarafı:** Rüştü Balaban, Emet Balaban  
**Anne tarafı:** Cemil Gökçen, Turcan Gökçen

Fotoğraf–kişi eşleşmesini değiştirmek için `index.html` içindeki `#biz` bölümündeki
`img src` yollarını güncellemeniz yeterli.

## Notlar

- Ziyaretçi defterine yazılanlar yalnızca o tarayıcıda saklanır, sunucuya gitmez.
- Tema tercihi (açık/koyu) hatırlanır.
- Klavye ile gezinti desteklenir; lightbox'ta ok tuşları ve `Esc` çalışır.
- `prefers-reduced-motion` açıksa animasyonlar devre dışı kalır.
