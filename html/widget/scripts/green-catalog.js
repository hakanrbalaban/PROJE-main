/**
 * Yeşil kategori — tamamen yerel, telifsiz widget listesi
 * featured + priority düşük = daha önde
 */
function w(id, title, type, cat, icon, theme, extra = {}) {
  return { id, title, type, cat, icon, theme, local: true, ...extra };
}

const featured = [
  w("g001", "Pomodoro Zamanlayıcı", "pomodoro", "zaman", "⏱", "coral", { featured: true, priority: 1 }),
  w("g002", "Geri Sayım", "countdown", "zaman", "⏳", "blue", { featured: true, priority: 2 }),
  w("g003", "Zikir Sayacı", "zikir-counter", "maneviyat", "📿", "violet", { featured: true, priority: 3 }),
  w("g004", "Yapılacaklar Listesi", "todo-list", "verimlilik", "☑", "lime", { featured: true, priority: 4 }),
  w("g005", "QR Kod Üretici", "qr-generator", "araclar", "▣", "aqua", { featured: true, priority: 5 }),
  w("g006", "Parola Üretici", "password-generator", "metin", "🔐", "pink", { featured: true, priority: 6 }),
  w("g007", "Dünya Saatleri", "world-clocks", "zaman", "🌍", "blue", { featured: true, priority: 7 }),
  w("g008", "Nefes Egzersizi", "breathing-guide", "yasam", "◯", "aqua", { featured: true, priority: 8 }),
  w("g009", "Su İçme Sayacı", "water-counter", "yasam", "💧", "aqua", { featured: true, priority: 9 }),
  w("g010", "Hicri Tarih", "hijri-date", "maneviyat", "☪", "violet", { featured: true, priority: 10 }),
  w("g011", "Ay Evresi", "moon-phase", "zaman", "🌙", "violet", { featured: true, priority: 11 }),
  w("g012", "KDV Hesaplayıcı", "vat-calc", "matematik", "%", "sun", { featured: true, priority: 12 }),
  w("g013", "Alışkanlık Streak", "habit-streak", "verimlilik", "🔥", "coral", { featured: true, priority: 13 }),
  w("g014", "Kronometre", "stopwatch", "zaman", "⏲", "blue", { featured: true, priority: 14 }),
  w("g015", "Gradient Üretici", "gradient-gen", "tasarim", "◐", "pink", { featured: true, priority: 15 }),
];

const zaman = [
  w("g016", "Güneş Doğuş / Batış", "sun-times", "zaman", "☀", "sun"),
  w("g017", "Hafta Numarası", "week-number", "zaman", "#", "blue"),
  w("g018", "Çeyrek Sayacı", "quarter-counter", "zaman", "¼", "coral"),
  w("g019", "Bugünkü Saniye", "seconds-today", "zaman", "Σ", "aqua"),
  w("g020", "Yaş Hesaplayıcı", "age-calc", "zaman", "🎂", "pink"),
  w("g021", "Tarih Farkı", "date-diff", "zaman", "↔", "lime"),
  w("g022", "Çalışma Günü Sayacı", "workdays-calc", "zaman", "💼", "blue"),
];

const matematik = [
  w("g023", "Yüzde Hesaplayıcı", "percent-calc", "matematik", "%", "coral"),
  w("g024", "İndirim Hesaplayıcı", "discount-calc", "matematik", "↓", "pink"),
  w("g025", "BMI Hesaplayıcı", "bmi-calc", "matematik", "⚖", "lime"),
  w("g026", "Birim Dönüştürücü", "unit-converter", "matematik", "⇄", "aqua"),
  w("g027", "Kesir / Yüzde", "fraction-converter", "matematik", "½", "violet"),
  w("g028", "Bahşiş Hesaplayıcı", "tip-calc", "matematik", "₺", "sun"),
  w("g029", "Yatırım Simülatörü", "investment-sim", "matematik", "📈", "blue"),
  w("g030", "Rastgele Sayı", "random-number", "matematik", "?", "coral"),
  w("g031", "Yazı Tura", "coin-flip", "matematik", "🪙", "sun"),
  w("g032", "Zar Seti", "multi-dice", "matematik", "⚄", "aqua"),
  w("g033", "Şans Çarkı", "wheel", "matematik", "◎", "pink"),
];

const metin = [
  w("g034", "Karakter / Kelime Sayacı", "char-counter", "metin", "Aa", "blue"),
  w("g035", "Lorem Ipsum", "lorem-ipsum", "metin", "¶", "violet"),
  w("g036", "Büyük/Küçük Harf", "case-converter", "metin", "Aa", "coral"),
  w("g037", "Slug Üretici", "slug-generator", "metin", "─", "aqua"),
  w("g038", "Markdown Önizleme", "markdown-preview", "metin", "M↓", "lime"),
  w("g039", "Okuma Süresi", "reading-time", "metin", "📖", "pink"),
  w("g040", "UUID Üretici", "uuid-generator", "metin", "#", "blue"),
  w("g041", "Renk Kodu Dönüştürücü", "color-converter", "metin", "◉", "sun"),
  w("g042", "Kontrast Kontrolü", "contrast-checker", "metin", "◑", "violet"),
  w("g043", "Metin Karşılaştırıcı", "text-diff", "metin", "≠", "coral"),
];

const tasarim = [
  w("g044", "Tipografi Ölçeği", "typography-scale", "tasarim", "T", "coral"),
  w("g045", "Gölge Önizleyici", "shadow-preview", "tasarim", "▢", "violet"),
  w("g046", "Border Radius", "radius-preview", "tasarim", "◻", "aqua"),
  w("g047", "Spacing Demo", "spacing-demo", "tasarim", "⊞", "lime"),
  w("g048", "İkon Önizleme", "icon-preview", "tasarim", "★", "sun"),
  w("g049", "Skeleton Loader", "skeleton-demo", "tasarim", "▭", "blue"),
  w("g050", "Progress Stilleri", "progress-styles", "tasarim", "▓", "pink"),
  w("g051", "Tab Demo", "tabs-demo", "tasarim", "⊟", "coral"),
  w("g052", "Accordion Demo", "accordion-demo", "tasarim", "≡", "violet"),
  w("g053", "Tooltip Demo", "tooltip-demo", "tasarim", "?", "aqua"),
  w("g054", "Breadcrumb Demo", "breadcrumb-demo", "tasarim", "›", "lime"),
  w("g055", "Pagination Demo", "pagination-demo", "tasarim", "«»", "blue"),
  w("g056", "Yıldız Puanlama", "rating-stars", "tasarim", "★", "sun"),
  w("g057", "Tag / Pill", "tag-pills", "tasarim", "●", "pink"),
  w("g058", "Avatar Üretici", "avatar-gen", "tasarim", "@", "coral"),
];

const verimlilik = [
  w("g059", "Günlük Checklist", "daily-checklist", "verimlilik", "✓", "lime"),
  w("g060", "Adım Hedefi", "steps-goal", "yasam", "👟", "aqua"),
  w("g061", "Uyku Döngüsü", "sleep-calc", "yasam", "☾", "violet"),
  w("g062", "Masa Kalk Hatırlatıcı", "stand-reminder", "yasam", "⏰", "coral"),
  w("g063", "Eisenhower Matrisi", "eisenhower", "verimlilik", "⊞", "blue"),
  w("g064", "Mini Kanban", "kanban-mini", "verimlilik", "▣", "pink"),
  w("g065", "Hızlı Not Defteri", "quick-notes", "verimlilik", "✎", "sun"),
  w("g066", "Haftalık Hedef", "weekly-goal", "verimlilik", "🎯", "lime"),
  w("g067", "Odak Müziği", "focus-music-link", "verimlilik", "♫", "violet"),
];

const eglence = [
  w("g068", "Sayı Tahmin Oyunu", "number-guess", "eglence", "?", "coral"),
  w("g069", "Taş Kağıt Makas", "rps", "eglence", "✊", "aqua"),
  w("g070", "Hafıza Kartı", "memory-cards", "eglence", "▣", "violet"),
  w("g071", "Kelime Karıştırıcı", "word-scramble", "eglence", "↯", "pink", { bank: "karisik_kelimeler" }),
  w("g072", "Ne Yesem?", "food-wheel", "eglence", "🍽", "sun", { bank: "yemekler" }),
  w("g073", "Kitap Çarkı", "book-wheel", "eglence", "📚", "lime", { bank: "kitaplar" }),
  w("g074", "Günün Şakası", "joke-card", "eglence", "☺", "coral", { bank: "sakalar" }),
  w("g075", "Emoji Seçici", "emoji-picker", "eglence", "😊", "pink"),
  w("g076", "Renk Oyunu", "color-game", "eglence", "🎨", "aqua"),
  w("g077", "Mini Snake", "mini-snake", "eglence", "◆", "blue"),
];

const bilgi = [
  w("g078", "Günün Kelimesi (TR)", "word-tr", "bilgi", "W", "coral", { bank: "kelime_tr" }),
  w("g079", "Word of the Day", "word-en", "bilgi", "A", "blue", { bank: "kelime_en" }),
  w("g080", "Mini Quiz", "mini-quiz", "bilgi", "?", "violet", { bank: "quiz" }),
  w("g081", "Tarihte Bugün", "history-today", "bilgi", "📅", "sun", { bank: "tarihte_bugun" }),
  w("g082", "Coğrafya İpucu", "geo-tip", "bilgi", "🗺", "aqua", { bank: "cografya" }),
  w("g083", "Bilim Notu", "science-fact", "bilgi", "⚗", "lime", { bank: "bilim" }),
  w("g084", "Programlama Terimi", "dev-term", "bilgi", "</>", "blue", { bank: "dev_terms" }),
  w("g085", "Klavye Kısayolu", "shortcut-tip", "bilgi", "⌨", "pink", { bank: "shortcuts" }),
  w("g086", "UX Kuralı", "ux-rule", "bilgi", "UX", "violet", { bank: "ux_rules" }),
  w("g087", "SEO İpucu", "seo-tip", "bilgi", "↗", "coral", { bank: "seo_tips" }),
];

const maneviyat = [
  w("g088", "Esma-ül Hüsna", "esma-card", "maneviyat", "✦", "violet", { bank: "esma" }),
  w("g089", "Dua Kartı", "dua-card", "maneviyat", "🤲", "coral", { bank: "dualar" }),
  w("g090", "Kıble Pusulası", "qibla-compass", "maneviyat", "🧭", "aqua"),
  w("g091", "İftar Sayacı", "ramadan-countdown", "maneviyat", "🌙", "violet"),
  w("g092", "Cuma Mesajı", "friday-message", "maneviyat", "🕌", "lime", { bank: "cuma" }),
  w("g093", "Şükür Günlüğü", "gratitude-log", "maneviyat", "♡", "pink"),
];

const sosyal = [
  w("g094", "Takip Et Butonları", "follow-buttons", "sosyal", "↗", "aqua"),
  w("g095", "Paylaş Linkleri", "share-links", "sosyal", "⎘", "blue"),
  w("g096", "İletişim Kartı", "contact-card", "sosyal", "✉", "coral"),
  w("g097", "Yorum Kutusu UI", "comment-ui", "sosyal", "💬", "violet"),
  w("g098", "Profil Kartı", "profile-card", "sosyal", "@", "pink"),
  w("g099", "Sosyal İkon Barı", "social-icons", "sosyal", "◎", "lime"),
  w("g100", "RSS Butonu", "rss-button", "sosyal", "⌁", "sun"),
];

const erisilebilirlik = [
  w("g101", "Yazı Boyutu", "font-size-toggle", "erisilebilirlik", "A+", "blue"),
  w("g102", "Yüksek Kontrast", "high-contrast", "erisilebilirlik", "◐", "coral"),
  w("g103", "Karanlık Mod", "dark-mode", "erisilebilirlik", "☾", "violet"),
  w("g104", "Atla Linki Demo", "skip-link-demo", "erisilebilirlik", "⤵", "aqua"),
  w("g105", "Renk Körlüğü Sim", "colorblind-sim", "erisilebilirlik", "👁", "pink"),
  w("g106", "Odak Halkası", "focus-ring-demo", "erisilebilirlik", "◎", "lime"),
];

const ses = [
  w("g107", "Beyaz Gürültü", "white-noise", "ses", "♪", "blue"),
  w("g108", "Metronom", "metronome", "ses", "♩", "coral"),
  w("g109", "Ses Görselleştirici", "audio-visualizer", "ses", "〰", "violet"),
  w("g110", "Dalga Animasyonu", "wave-animation", "ses", "≈", "aqua"),
];

const finansHesap = [
  w("g111", "Kar-Zarar Hesaplayıcı", "profit-loss-calc", "finans", "₺", "coral", { featured: true, priority: 16 }),
  w("g112", "Başa Baş (Break-even)", "break-even-calc", "finans", "⚖", "blue", { featured: true, priority: 17 }),
  w("g113", "Komisyon Hesaplayıcı", "commission-calc", "finans", "%", "aqua", { featured: true, priority: 18 }),
  w("g114", "Taksit Bölücü", "installment-split", "finans", "≡", "violet", { featured: true, priority: 19 }),
  w("g115", "Bütçe 50/30/20", "budget-503020", "finans", "◔", "lime", { featured: true, priority: 20 }),
  w("g116", "Birikim Hedefi", "savings-goal", "finans", "🎯", "sun", { featured: true, priority: 21 }),
  w("g117", "Basit Faiz", "simple-interest", "finans", "∑", "pink"),
  w("g118", "Bileşik Faiz", "compound-interest", "finans", "📈", "blue"),
];

const zamanHesap = [
  w("g119", "Doğuma Kalan Gün", "days-until-birth", "zaman", "🎂", "pink", { featured: true, priority: 22 }),
  w("g120", "Yılın Kaçıncı Günü", "day-of-year", "zaman", "#", "aqua", { featured: true, priority: 23 }),
  w("g121", "Pomodoro Tur Hesabı", "pomodoro-cycles", "zaman", "⏱", "coral"),
  w("g122", "Saat Farkı (hh:mm)", "time-diff", "zaman", "⌚", "blue"),
];

const saglikHesap = [
  w("g123", "Günlük Su İhtiyacı", "water-intake", "saglik", "💧", "aqua", { featured: true, priority: 24 }),
  w("g124", "Kalori İhtiyacı (BMR)", "calorie-calc", "saglik", "🔥", "coral", { featured: true, priority: 25 }),
  w("g125", "Makro Dağılımı", "macro-calc", "saglik", "🥗", "lime"),
  w("g126", "İdeal Kilo Aralığı", "ideal-weight", "saglik", "⚖", "violet"),
  w("g127", "Nabız Bölgeleri", "heart-rate-zones", "saglik", "❤", "pink"),
];

const egitimHesap = [
  w("g128", "Ortalama Not", "grade-average", "egitim", "A", "blue", { featured: true, priority: 26 }),
  w("g129", "Ağırlıklı Ortalama", "weighted-average", "egitim", "Σ", "violet"),
  w("g130", "Net Hesaplayıcı", "net-score", "egitim", "✓", "coral"),
  w("g131", "Yüzdelik Dilim", "percentile-calc", "egitim", "%", "aqua"),
  w("g132", "EBOB / EKOK", "gcd-lcm", "egitim", "∞", "lime"),
  w("g133", "Üs / Kök", "power-root", "egitim", "x²", "sun"),
  w("g134", "Denklem Çözücü (ax+b=0)", "linear-equation", "egitim", "ax", "pink"),
  w("g135", "Oran-Orantı", "ratio-proportion", "egitim", "∷", "blue"),
  w("g136", "Kesir-Ondalık-Yüzde", "fraction-decimal-percent", "egitim", "½", "violet"),
  w("g137", "Geometri Alan/Çevre", "geometry-calc", "egitim", "△", "coral"),
];

const donusturuculer = [
  w("g138", "cm ↔ inch", "cm-inch", "donusturucu", "⇄", "aqua"),
  w("g139", "kg ↔ lb", "kg-lb", "donusturucu", "⇄", "lime"),
  w("g140", "°C ↔ °F", "c-f", "donusturucu", "⇄", "sun"),
  w("g141", "km ↔ mil", "km-mile", "donusturucu", "⇄", "blue"),
  w("g142", "litre ↔ galon", "liter-gallon", "donusturucu", "⇄", "pink"),
  w("g143", "m² ↔ ft²", "area-converter", "donusturucu", "⇄", "violet"),
  w("g144", "byte ↔ KB/MB/GB", "byte-converter", "donusturucu", "⇄", "coral"),
  w("g145", "dakika ↔ saat", "minute-hour", "donusturucu", "⇄", "aqua"),
  w("g146", "yüzde ↔ puan", "percent-point", "donusturucu", "⇄", "lime"),
  w("g147", "tarih formatı", "date-format", "donusturucu", "⇄", "sun"),
];

const icerikHesap = [
  w("g148", "Konuşma Süresi", "speaking-time", "icerik", "🎙", "blue"),
  w("g149", "Metin Yoğunluğu", "text-density", "icerik", "≋", "violet"),
  w("g150", "İçerik Hedefi", "content-goal", "icerik", "✍", "coral"),
  w("g151", "Yayın Takvimi Gün Sayısı", "publish-calendar", "icerik", "🗓", "aqua"),
];

const greenWidgets = [
  ...featured,
  ...finansHesap,
  ...zamanHesap,
  ...saglikHesap,
  ...egitimHesap,
  ...donusturuculer,
  ...icerikHesap,
  ...zaman,
  ...matematik,
  ...metin,
  ...tasarim,
  ...verimlilik,
  ...eglence,
  ...bilgi,
  ...maneviyat,
  ...sosyal,
  ...erisilebilirlik,
  ...ses,
];

module.exports = greenWidgets;
