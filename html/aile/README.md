# Balaban Ailesi — Aile Tanıtım Sitesi

Tek sayfalık aile tanıtım sitesi. Saf HTML, CSS ve JavaScript; derleme gerekmez.

**Canlı site:** https://hakanrbalaban.github.io/balaban-ailesi/

## Çalıştırma

`index.html` dosyasına çift tıklayın veya:

```bash
python -m http.server 5500
```

## Dosya yapısı

```
aile/
├─ index.html
├─ LICENSE              Kod: MIT · Fotoğraflar: aile hakları saklı
├─ CREDITS.md           Font, görsel ve DMCA atıfları
├─ README.md
├─ css/style.css
├─ js/main.js
└─ images/              Aile fotoğrafları (.webp)
```

## Aile (özet)

- **Anne & baba:** Özcan · Aziz Balaban  
- **Çocuklar:** Hakan Rüştü · Merve · Gökhan  
- **Baba tarafı:** Rüştü & Emet Balaban  
- **Anne tarafı:** Cemil & Turcan  

Ayrıntılı soyağacı sitede **Aile / Kökler / Akrabalar** bölümlerindedir.

## Telif ve yasal

| Öğe | Durum |
| --- | --- |
| HTML/CSS/JS | MIT (`LICENSE`) |
| Fontlar (Cormorant Garamond, Outfit) | SIL OFL 1.1 via Google Fonts |
| Fotoğraflar | Aile mülkiyeti — MIT dışı (`CREDITS.md`) |
| Üçüncü taraf sprite/ikon paketi | Yok |

Ziyaretçiler ilk girişte **DMCA / önbellek / gizlilik onay bandını** kabul eder.
Ayrıntılar: sitede `#yasal` ve `CREDITS.md`.

## Notlar

- Ziyaretçi defteri yalnızca tarayıcı `localStorage` kullanır.
- Tema tercihi ve yasal onay da yerelde saklanır.
- `prefers-reduced-motion` açıksa animasyonlar kapanır.
