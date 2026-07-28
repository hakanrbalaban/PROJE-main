# NABIZ

Flipboard tarzı canlı haber nabzı. Yayıncıların **kamuya açık RSS** akışlarından yalnızca başlık ve kısa özet çeker; telifli fotoğrafları kullanmaz — her haber için özgün kategori kapağı üretir. Tam metin için orijinal kaynağa yönlendirir.

## Çalıştırma

```bash
npm install
npm run dev
```

- Arayüz: http://localhost:5173  
- API: http://localhost:5174  

## Telif politikası

- Metin: RSS başlığı + kısa snippet (aggregator modeli)
- Görsel: yayıncı görselleri yok; deterministik SVG/CSS kapaklar
- Link: her kart orijinal habere gider
