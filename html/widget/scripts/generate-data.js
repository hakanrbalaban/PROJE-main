/**
 * BalabanWidgets — 100 karışık widget katalogu + 365 günlük telifsiz bankalar
 * Çalıştır: node scripts/generate-data.js
 */
const fs = require("fs");
const path = require("path");
const greenWidgets = require("./green-catalog");

const root = path.join(__dirname, "..");
const banksDir = path.join(root, "data", "banks");
fs.mkdirSync(banksDir, { recursive: true });

const DAYS = 365;

function pad(n) {
  return String(n).padStart(3, "0");
}

function make365(builder) {
  return Array.from({ length: DAYS }, (_, i) => builder(i + 1));
}

function pick(arr, i) {
  return arr[(i - 1) % arr.length];
}

function combine(parts, i) {
  return parts.map((p) => (Array.isArray(p) ? pick(p, i) : p)).join(" ");
}

/* ---------- İçerik parçaları (özgün / telifsiz) ---------- */
const subjects = [
  "odak", "sabır", "cesaret", "disiplin", "merak", "sadelik", "denge", "umut",
  "öğrenme", "nezaket", "azim", "netlik", "ritim", "güven", "şükran", "dikkat",
  "yaratıcılık", "sakinlik", "kararlılık", "paylaşım", "özgünlük", "esneklik",
];

const verbs = [
  "büyütür", "güçlendirir", "açığa çıkarır", "derinleştirir", "kolaylaştırır",
  "aydınlatır", "besler", "netleştirir", "hızlandırır", "yumuşatır",
];

const tipsA = [
  "Sabah", "Öğle", "Akşam", "Haftalık", "Günlük", "Kısa bir", "Sessiz bir", "Düzenli",
];
const tipsB = [
  "plan yaz", "mola ver", "su iç", "yürü", "not al", "öncelik seç", "dosya topla",
  "bildirimi kapat", "nefes egzersizi yap", "hedefini gözden geçir",
];
const tipsC = [
  "zihin netleşir.", "tempo korunur.", "enerji yükselir.", "dağınıklık azalır.",
  "odak artar.", "stres düşer.", "ilerleme görünür olur.", "alışkanlık tutunur.",
];

const facts = [
  "Bal arıları, çiçeklerin UV desenlerini görebilir.",
  "Bir yıl yaklaşık 365,24 gündür; takvim bunu artıklarıyla dengeler.",
  "İnsan burnu 1 trilyondan fazla kokuyu ayırt edebilir.",
  "Bambunun bazı türleri günde bir metreden fazla uzayabilir.",
  "Okyanuslar dünyanın oksijeninin büyük kısmını üretir.",
  "Uyku sırasında beyin toksin temizliği yapar.",
  "Müreler botanikte teknik olarak bir tür meyvedir.",
  "Güneş ışığı D vitamini üretimine yardımcı olur.",
  "Kuşlar manyetik alanı yön bulmak için kullanabilir.",
  "Bir damla su, yüzey gerilimi sayesinde küreye yakın durur.",
  "Kahve aslında bir meyvenin çekirdeğidir.",
  "Ahtapotların üç kalbi vardır.",
  "Işık bir saniyede Dünya çevresini yedi kez dolaşabilir.",
  "Kar taneleri benzersiz kristal yapılara sahiptir.",
  "Bitkiler birbirleriyle kimyasal sinyaller paylaşabilir.",
];

const moods = [
  "Sakin", "Enerjik", "Meraklı", "Odaklı", "Neşeli", "Düşünceli", "Cesur", "Şükreden",
  "Yaratıcı", "Dingin", "Umutlu", "Kararlı", "Oyuncu", "Şefkatli", "Net",
];

const colors = [
  ["#FF4D6D", "#FF8C42"], ["#22D3EE", "#3B82F6"], ["#A78BFA", "#F472B6"],
  ["#34D399", "#FBBF24"], ["#F43F5E", "#FB7185"], ["#06B6D4", "#67E8F9"],
  ["#8B5CF6", "#C4B5FD"], ["#10B981", "#6EE7B7"], ["#F59E0B", "#FDE68A"],
  ["#EC4899", "#F9A8D4"], ["#0EA5E9", "#7DD3FC"], ["#EF4444", "#FCA5A5"],
  ["#14B8A6", "#5EEAD4"], ["#6366F1", "#A5B4FC"], ["#84CC16", "#BEF264"],
];

const habits = [
  "2 dakika meditasyon", "10 squat", "1 bardak su", "masayı toplama", "teşekkür notu",
  "5 sayfa okuma", "derin nefes x5", "posta kutusu temizliği", "kısa yürüyüş",
  "hedef cümlesi yazma", "esneme", "ekran molası", "dosya yedekleme", "gülümseme pratiği",
];

const questions = [
  "Bugün neyi bitirmek istiyorsun?",
  "Kime teşekkür edebilirsin?",
  "Hangi alışkanlığı 1% iyileştirirsin?",
  "Neyi ertelemeyi bırakacaksın?",
  "Bugün seni ne motive ediyor?",
  "Hangi düşünceyi bırakmak iyi gelir?",
  "En küçük adımın ne?",
  "Kime yardım edebilirsin?",
  "Ne öğrendin bugün?",
  "Hangi sınırını koruyacaksın?",
];

const microGoals = [
  "Tek bir görevi tamamla", "5 dakika odaklan", "Bir mesajı yanıtla",
  "Masayı sadeleştir", "Kısa bir yürüyüş yap", "Bir dosyayı arşivle",
  "Su şişeni doldur", "Bir cümle yaz", "Birini tebrik et", "Eski sekmeleri kapat",
];

const techTips = [
  "Dosya adında tarih kullan: 2026-07-28-rapor",
  "Aynı şifreyi iki yerde kullanma.",
  "Önemli işi bulut + yerel yedekle.",
  "Gereksiz eklentileri kapat, hız artar.",
  "Commit mesajını net ve kısa yaz.",
  "Dark mode gece göz yorgunluğunu azaltabilir.",
  "Bildirimleri sessize alıp odak bloğu aç.",
  "Sekme grupları ile projeleri ayır.",
];

const healthTips = [
  "Her saat 1 dakika ayağa kalk.",
  "Ekrana bakarken 20-20-20 kuralını uygula.",
  "Tuz yerine baharat dene.",
  "Uyku için sabit saat seç.",
  "Kahvaltıya protein ekle.",
  "Merdiven kullanmayı tercih et.",
  "Şekerli içecek yerine su veya bitki çayı.",
  "Omuzlarını bilinçli olarak indir.",
];

const designTips = [
  "Bir kartta en fazla iki font kullan.",
  "Boşluk, süslemeden daha güçlüdür.",
  "Kontrastı erişilebilir tut (metin/arka plan).",
  "CTA tek ve belirgin olsun.",
  "Gölgeyi abartma; hafif derinlik yeter.",
  "Renkleri 60-30-10 oranında dağıt.",
  "İkonları aynı çizgi kalınlığında tut.",
  "Mobilde dokunma alanını 44px üstü yap.",
];

const funLines = [
  "Bugünün şanslı rengi: canlı mercan.",
  "Küçük bir zafer bile kutlanmayı hak eder.",
  "Kahve molası bilimsel olarak meşrudur (neredeyse).",
  "Bugün 'yeterince iyi' mükemmelden iyidir.",
  "Hata yaptın mı? Tebrikler, öğreniyorsun.",
  "Pixel'ler seninle gurur duyuyor.",
  "Bugünün gizli görevi: gülümse.",
  "Kedi videosu kotan: 1 adet (tavsiye).",
];

const productivity = [
  "Önce en zor işi bitir (eat the frog).",
  "2 dakikadan kısa işleri hemen yap.",
  "Aynı tür işleri grupla (batching).",
  "Günde 3 öncelik kuralı uygula.",
  "Odak bloğu: 25 odak + 5 mola.",
  "İş bitince sekmeleri kapat.",
  "Toplantıya gündemle gir.",
  "İleri tarihli hatırlatıcı kur.",
];

/* Manevi — yalnızca özgün / telifsiz ilham (meal veya hadis çevirisi yok) */
const spiritual = make365((d) => ({
  metin: combine(
    [
      ["Kalbi", "Zihni", "Günü", "Niyeti", "Adımı"],
      ["sakin tut", "temiz tut", "hayırlı başlat", "doğru yönlendir", "küçük ama sürekli at"],
      ["—", "ve", ";"],
      ["sabır", "şükür", "merhamet", "doğruluk", "tevekkül"],
      ["yeter.", "yol gösterir.", "huzur getirir.", "gücü artırır.", "bereket açar."],
    ],
    d
  ),
  kaynak: "BalabanWidgets · Manevi Not",
}));

/* Özgün manevi ilham — ayet/hadis meal kopyası değil */
const ilhamPool = [
  { metin: "Zorluk geçicidir; sabırla bir adım daha at.", kaynak: "BalabanWidgets · Özgün" },
  { metin: "Sakin bir niyet, günün yükünü hafifletir.", kaynak: "BalabanWidgets · Özgün" },
  { metin: "Şükür, küçük bir anda bile huzur açar.", kaynak: "BalabanWidgets · Özgün" },
  { metin: "Kolaylaştır; işini ve sözünü yumuşak tut.", kaynak: "BalabanWidgets · Özgün" },
  { metin: "Gülümsemek, paylaştığın bir iyiliktir.", kaynak: "BalabanWidgets · Özgün" },
  { metin: "Temizlik, düzen ve netlik içe huzur verir.", kaynak: "BalabanWidgets · Özgün" },
  { metin: "Niyetini düzelt; işin yönü onunla değişir.", kaynak: "BalabanWidgets · Özgün" },
  { metin: "Güzel ahlak, en görünür hayırdır.", kaynak: "BalabanWidgets · Özgün" },
  { metin: "Merhamet gösteren, merhamet bulur.", kaynak: "BalabanWidgets · Özgün" },
  { metin: "Dürüst iş, uzun soluklu güven kurar.", kaynak: "BalabanWidgets · Özgün" },
  { metin: "Kısa bir dua, uzun bir güne yön verir.", kaynak: "BalabanWidgets · Özgün" },
  { metin: "İyilik üzere yardımlaşmak, gönlü büyütür.", kaynak: "BalabanWidgets · Özgün" },
];

const hatirlatmaPool = [
  { metin: "Bugün birine kolaylık göster.", kaynak: "BalabanWidgets · Özgün" },
  { metin: "Sözünü yumuşak, işini sağlam tut.", kaynak: "BalabanWidgets · Özgün" },
  { metin: "Küçük bir iyilik, büyük bir iz bırakabilir.", kaynak: "BalabanWidgets · Özgün" },
  { metin: "Öfkeyi bir nefes ertele; sonra konuş.", kaynak: "BalabanWidgets · Özgün" },
  { metin: "Paylaştığın bilgi, gizli tuttuğundan daha bereketli olabilir.", kaynak: "BalabanWidgets · Özgün" },
  { metin: "Doğruluk, en kısa yoldur.", kaynak: "BalabanWidgets · Özgün" },
  { metin: "Başkasının aynası ol; nazikçe yansıt.", kaynak: "BalabanWidgets · Özgün" },
  { metin: "Hayâ, kalbi koruyan bir perdedir.", kaynak: "BalabanWidgets · Özgün" },
  { metin: "Dua et, sonra elinden geleni yap.", kaynak: "BalabanWidgets · Özgün" },
  { metin: "Teşekkür etmeyi erteleme.", kaynak: "BalabanWidgets · Özgün" },
];

/* Bankalar */
const banks = {
  sozler: make365((d) => ({
    metin: `${pick(subjects, d)[0].toUpperCase()}${pick(subjects, d).slice(1)} ${pick(verbs, d + 3)}; yeter ki bugün bir adım at.`,
    kaynak: "BalabanWidgets",
  })),
  ipuclari: make365((d) => ({
    metin: `${pick(tipsA, d)} ${pick(tipsB, d + 2)} — ${pick(tipsC, d + 5)}`,
    kaynak: "BalabanWidgets İpucu",
  })),
  bilgiler: make365((d) => ({
    metin: pick(facts, d) + (d % 3 === 0 ? " Bu bilgi eğitim amaçlıdır." : ""),
    kaynak: "BalabanWidgets Bilgi",
  })),
  ruh_halleri: make365((d) => ({
    metin: `Bugünün ruh hâli: ${pick(moods, d)}`,
    kaynak: "BalabanWidgets Mood",
    ekstra: pick(moods, d),
  })),
  renkler: make365((d) => {
    const c = pick(colors, d);
    return {
      metin: `Günün paleti: ${c[0]} → ${c[1]}`,
      kaynak: "BalabanWidgets Renk",
      renk1: c[0],
      renk2: c[1],
    };
  }),
  aliskanliklar: make365((d) => ({
    metin: `Mini alışkanlık: ${pick(habits, d)}`,
    kaynak: "BalabanWidgets Alışkanlık",
  })),
  sorular: make365((d) => ({
    metin: pick(questions, d),
    kaynak: "BalabanWidgets Soru",
  })),
  mikro_hedefler: make365((d) => ({
    metin: pick(microGoals, d),
    kaynak: "BalabanWidgets Hedef",
  })),
  tech: make365((d) => ({
    metin: pick(techTips, d),
    kaynak: "BalabanWidgets Tech",
  })),
  saglik: make365((d) => ({
    metin: pick(healthTips, d),
    kaynak: "BalabanWidgets Sağlık",
  })),
  tasarim: make365((d) => ({
    metin: pick(designTips, d),
    kaynak: "BalabanWidgets Tasarım",
  })),
  eglence: make365((d) => ({
    metin: pick(funLines, d),
    kaynak: "BalabanWidgets Eğlence",
  })),
  verimlilik: make365((d) => ({
    metin: pick(productivity, d),
    kaynak: "BalabanWidgets Verimlilik",
  })),
  manevi_not: spiritual,
  ayetler: make365((d) => pick(ilhamPool, d)),
  hadisler: make365((d) => pick(hatirlatmaPool, d)),
  affirmations: make365((d) => ({
    metin: `Ben ${pick(["odaklı", "yeterli", "cesur", "sabırlı", "yaratıcı", "sakin", "güçlü", "net"], d)} bir şekilde ilerliyorum.`,
    kaynak: "BalabanWidgets Affirmation",
  })),
  kelimeler: make365((d) => {
    const word = pick(
      ["İnşa", "Ritim", "Neşe", "Cesaret", "Sadelik", "Uyanış", "Denge", "Parıltı", "Yol", "Kök", "Ufuk", "Nefes"],
      d
    );
    return {
      metin: `Günün kelimesi: ${word}`,
      kaynak: "BalabanWidgets Kelime",
      ekstra: word,
    };
  }),
  sayilar: make365((d) => ({
    metin: `Günün sayısı: ${((d * 7) % 99) + 1}`,
    kaynak: "BalabanWidgets Sayı",
    ekstra: String(((d * 7) % 99) + 1),
  })),
  gradient_isim: make365((d) => ({
    metin: pick(
      ["Gün Batımı", "Mercan Dalga", "Limon Şerbeti", "Mor Sis", "Turkuaz Rüya", "Neon Bahar", "Amber Gece", "Pembe Şafak"],
      d
    ),
    kaynak: "BalabanWidgets Gradient",
    renk1: pick(colors, d)[0],
    renk2: pick(colors, d + 1)[1],
  })),
  sakalar: make365((d) => ({
    metin: pick([
      "Kahve neden yorgun kalmaz? Çünkü her zaman filtrelenmiştir.",
      "Programcı neden denize girmez? Null pointer korkusu.",
      "Bugün hedefim: yapılacaklar listesini yeniden yazmak.",
      "Motivasyonum pil gibi: %3 ve uyarı veriyor.",
      "Zaman uçuyor; ben hâlâ sekme açıyorum.",
      "Spor yapacağım dedim, telefonu şarja koydum.",
      "Erteleme sanatında doktora yapıyorum.",
      "Kahvaltıyı atladım, öğle yemeğini erkene aldım.",
    ], d),
    kaynak: "BalabanWidgets",
  })),
  kelime_tr: make365((d) => ({
    metin: pick(["İnşa", "Neşe", "Sabır", "Ufuk", "Denge", "Parıltı", "Kök", "Ritim", "Uyanış", "Merhamet"], d),
    kaynak: "BalabanWidgets Kelime",
    ekstra: pick(["İnşa", "Neşe", "Sabır", "Ufuk", "Denge", "Parıltı", "Kök", "Ritim", "Uyanış", "Merhamet"], d),
  })),
  kelime_en: make365((d) => ({
    metin: pick(["Focus", "Clarity", "Courage", "Balance", "Spark", "Calm", "Growth", "Kindness", "Flow", "Light"], d),
    kaynak: "BalabanWidgets Word",
    ekstra: pick(["Focus", "Clarity", "Courage", "Balance", "Spark", "Calm", "Growth", "Kindness", "Flow", "Light"], d),
  })),
  quiz: make365((d) => ({
    metin: pick([
      "Su kaç derecede kaynar? (deniz seviyesi) → 100°C",
      "Türkiye'nin başkenti? → Ankara",
      "HTML ne anlama gelir? → HyperText Markup Language",
      "Bir günde kaç saat var? → 24",
      "RGB'de K hangi renk? → Siyah (Key)",
    ], d),
    kaynak: "BalabanWidgets Quiz",
  })),
  tarihte_bugun: make365((d) => ({
    metin: pick([
      "İstanbul'un fethi 1453'te gerçekleşti.",
      "Cumhuriyet 1923'te ilan edildi.",
      "İlk Türk alfabesi reformu 1928'de yapıldı.",
      "UNESCO Dünya Mirası listesinde Türkiye'den çok sayıda eser vardır.",
      "Türk bayrağındaki ay ve yıldız özgün sembollerdir.",
    ], d),
    kaynak: "BalabanWidgets Tarih",
  })),
  cografya: make365((d) => ({
    metin: pick([
      "Türkiye üç tarafı denizlerle çevrilidir.",
      "Anadolu medeniyetler beşiğidir.",
      "Kapadokya peribacaları volkanik oluşumlardır.",
      "Van Gölü Türkiye'nin en büyük gölüdür.",
      "Ağrı Dağı 5137 m yüksekliğindedir.",
    ], d),
    kaynak: "BalabanWidgets Coğrafya",
  })),
  bilim: make365((d) => ({
    metin: pick(facts, d),
    kaynak: "BalabanWidgets Bilim",
  })),
  dev_terms: make365((d) => ({
    metin: pick([
      "API: Uygulamaların konuştuğu arayüz.",
      "DOM: HTML'in canlı ağaç temsili.",
      "Git: Dağıtık sürüm kontrol sistemi.",
      "Cache: Sık veriyi hızlı erişim için saklama.",
      "Responsive: Farklı ekranlara uyum.",
    ], d),
    kaynak: "BalabanWidgets Dev",
  })),
  shortcuts: make365((d) => ({
    metin: pick([
      "Ctrl+C / Ctrl+V — kopyala / yapıştır",
      "Ctrl+Z — geri al",
      "Ctrl+Shift+T — kapanan sekmeyi aç",
      "Alt+Tab — pencere değiştir",
      "Win+V — pano geçmişi (birçok masaüstü sistemde)",
    ], d),
    kaynak: "BalabanWidgets Kısayol",
  })),
  ux_rules: make365((d) => ({
    metin: pick([
      "Her ekranda tek bir birincil eylem olsun.",
      "Hata mesajları çözüm önersin.",
      "Form alanlarını mümkün olduğunca azalt.",
      "Dokunma hedefleri en az 44px olsun.",
      "Yükleme durumunu her zaman göster.",
    ], d),
    kaynak: "BalabanWidgets UX",
  })),
  seo_tips: make365((d) => ({
    metin: pick([
      "Title etiketi benzersiz ve açıklayıcı olsun.",
      "Meta description 150–160 karakter civarı.",
      "Görsellere anlamlı alt metin ekle.",
      "Mobil uyumluluk sıralamayı etkiler.",
      "Hızlı sayfa = daha iyi deneyim.",
    ], d),
    kaynak: "BalabanWidgets SEO",
  })),
  esma: make365((d) => ({
    metin: pick([
      "Er-Rahman — Sonsuz merhamet sahibi",
      "Er-Rahim — Çok merhametli",
      "El-Melik — Mutlak hükümdar",
      "Es-Selam — Esenlik veren",
      "El-Hakim — Hikmet sahibi",
      "El-Vedud — Seven ve sevilen",
      "El-Gaffar — Çok bağışlayan",
      "Es-Sabur — Sabırlı",
    ], d),
    kaynak: "BalabanWidgets Esma",
  })),
  dualar: make365((d) => ({
    metin: pick([
      "Rabbim, bugünü hayırlı kıl.",
      "Kalbime sükûnet ver, işlerimi kolaylaştır.",
      "Bana sabır ve şükür nasip et.",
      "Yaptığım işleri bereketli eyle.",
      "Sevdiklerimi koru, bana güzel ahlak ver.",
    ], d),
    kaynak: "BalabanWidgets Dua",
  })),
  cuma: make365((d) => ({
    metin: pick([
      "Hayırlı cumalar — hayırlı işler, hayırlı gönüller.",
      "Cuma günü bereketli olsun.",
      "Selam ve dua ile dolu bir cuma dilerim.",
      "Bugün kalplere huzur, dillere şükür.",
      "Cumanız mübarek olsun.",
    ], d),
    kaynak: "BalabanWidgets Cuma",
  })),
  yemekler: make365((d) => ({
    metin: pick(["Makarna", "Mercimek çorbası", "Salata", "Pilav", "Köfte", "Mantı", "Lahmacun", "Balık", "Omlet", "Sandviç"], d),
    kaynak: "BalabanWidgets",
  })),
  kitaplar: make365((d) => ({
    metin: pick(["Roman", "Şiir", "Bilim", "Tarih", "Felsefe", "Biyografi", "Deneme", "Masal", "Gezi", "Klasik"], d),
    kaynak: "BalabanWidgets",
  })),
  karisik_kelimeler: make365((d) => ({
    metin: pick(["widget", "portal", "odak", "ritim", "balaban", "kod", "tasarım", "not", "hedef", "plan"], d),
    kaynak: "BalabanWidgets",
  })),
};

for (const [name, data] of Object.entries(banks)) {
  fs.writeFileSync(path.join(banksDir, `${name}.json`), JSON.stringify(data));
}

/* ---------- 100 Widget katalogu (karışık türler) ---------- */
const categories = [
  { id: "maneviyat", name: "Maneviyat", color: "#ff4d6d" },
  { id: "ilham", name: "İlham", color: "#a78bfa" },
  { id: "verimlilik", name: "Verimlilik", color: "#3b82f6" },
  { id: "yasam", name: "Yaşam", color: "#10b981" },
  { id: "bilgi", name: "Bilgi", color: "#06b6d4" },
  { id: "tasarim", name: "Tasarım", color: "#f59e0b" },
  { id: "zaman", name: "Zaman", color: "#6366f1" },
  { id: "araclar", name: "Araçlar", color: "#64748b" },
  { id: "eglence", name: "Eğlence", color: "#ec4899" },
  { id: "sosyal", name: "Sosyal", color: "#14b8a6" },
  { id: "matematik", name: "Matematik", color: "#8b5cf6" },
  { id: "metin", name: "Metin Araçları", color: "#0ea5e9" },
  { id: "erisilebilirlik", name: "Erişilebilirlik", color: "#64748b" },
  { id: "ses", name: "Ses & Medya", color: "#f43f5e" },
  { id: "finans", name: "Finans", color: "#16a34a" },
  { id: "saglik", name: "Sağlık", color: "#0d9488" },
  { id: "egitim", name: "Eğitim", color: "#7c3aed" },
  { id: "donusturucu", name: "Dönüştürücü", color: "#0284c7" },
  { id: "icerik", name: "İçerik", color: "#db2777" },
];

/**
 * type:
 *  - text: bankadan metin
 *  - palette: renk gösterimi
 *  - clock / calendar / year-progress / countdown-weekend
 *  - counter / dice / mood / badge / note / quote-card / chip / progress
 *  - mini-form / button-set / toast-demo / loader / toggle / slider-demo
 *  - effect: sadece birkaç tanesinde
 */
const widgets = [
  // Maneviyat (10)
  { id: "w01", title: "Manevi İlham", cat: "maneviyat", type: "text", bank: "ayetler", icon: "✦", theme: "coral" },
  { id: "w02", title: "Hayırlı Hatırlatma", cat: "maneviyat", type: "text", bank: "hadisler", icon: "◉", theme: "aqua" },
  { id: "w03", title: "Manevi Not", cat: "maneviyat", type: "note", bank: "manevi_not", icon: "☪", theme: "violet" },
  { id: "w04", title: "Şükür Kartı", cat: "maneviyat", type: "text", bank: "affirmations", icon: "♡", theme: "pink" },
  { id: "w05", title: "Sabır Hatırlatıcı", cat: "maneviyat", type: "badge", bank: "manevi_not", icon: "◎", theme: "lime" },
  { id: "w06", title: "Dua Niyeti", cat: "maneviyat", type: "quote-card", bank: "sorular", icon: "✧", theme: "coral" },
  { id: "w07", title: "Hayırlı Gün", cat: "maneviyat", type: "chip", bank: "ruh_halleri", icon: "✿", theme: "sun" },
  { id: "w08", title: "Gönül Dengesi", cat: "maneviyat", type: "progress", bank: "sayilar", icon: "◐", theme: "aqua" },
  { id: "w09", title: "Merhamet Sözü", cat: "maneviyat", type: "text", bank: "sozler", icon: "❀", theme: "pink" },
  { id: "w10", title: "Sessizlik Kartı", cat: "maneviyat", type: "note", bank: "kelimeler", icon: "○", theme: "violet", effect: "soft-glow" },

  // İlham (10)
  { id: "w11", title: "Günün Sözü", cat: "ilham", type: "quote-card", bank: "sozler", icon: "❝", theme: "violet" },
  { id: "w12", title: "Affirmation", cat: "ilham", type: "text", bank: "affirmations", icon: "★", theme: "pink" },
  { id: "w13", title: "Günün Kelimesi", cat: "ilham", type: "badge", bank: "kelimeler", icon: "Aa", theme: "coral" },
  { id: "w14", title: "İlham Sorusu", cat: "ilham", type: "text", bank: "sorular", icon: "?", theme: "aqua" },
  { id: "w15", title: "Mikro Hedef", cat: "ilham", type: "chip", bank: "mikro_hedefler", icon: "→", theme: "lime" },
  { id: "w16", title: "Motivasyon Notu", cat: "ilham", type: "note", bank: "sozler", icon: "✎", theme: "sun" },
  { id: "w17", title: "Cesaret Rozeti", cat: "ilham", type: "badge", bank: "ruh_halleri", icon: "▲", theme: "coral" },
  { id: "w18", title: "Yaratıcılık Kartı", cat: "ilham", type: "palette", bank: "renkler", icon: "◈", theme: "violet" },
  { id: "w19", title: "Günün Sayısı", cat: "ilham", type: "counter", bank: "sayilar", icon: "#", theme: "aqua" },
  { id: "w20", title: "Parıltı Sözü", cat: "ilham", type: "text", bank: "eglence", icon: "✧", theme: "pink", effect: "shimmer" },

  // Verimlilik (10)
  { id: "w21", title: "Günün İpucu", cat: "verimlilik", type: "text", bank: "ipuclari", icon: "◎", theme: "blue" },
  { id: "w22", title: "Verimlilik Hack", cat: "verimlilik", type: "text", bank: "verimlilik", icon: "⚡", theme: "sun" },
  { id: "w23", title: "Odak Bloğu Hatırlatıcı", cat: "verimlilik", type: "progress", bank: "sayilar", icon: "⏱", theme: "coral" },
  { id: "w24", title: "Öncelik Chip", cat: "verimlilik", type: "chip", bank: "mikro_hedefler", icon: "1", theme: "lime" },
  { id: "w25", title: "Alışkanlık Takibi", cat: "verimlilik", type: "text", bank: "aliskanliklar", icon: "✓", theme: "aqua" },
  { id: "w26", title: "Odak Blok", cat: "verimlilik", type: "note", bank: "verimlilik", icon: "▣", theme: "violet" },
  { id: "w27", title: "Görev Rozeti", cat: "verimlilik", type: "badge", bank: "mikro_hedefler", icon: "☑", theme: "blue" },
  { id: "w28", title: "Checklist Mini", cat: "verimlilik", type: "mini-form", bank: "mikro_hedefler", icon: "≡", theme: "lime" },
  { id: "w29", title: "İlerleme Çubuğu", cat: "verimlilik", type: "year-progress", icon: "▓", theme: "blue" },
  { id: "w30", title: "Hızlı Toggle", cat: "verimlilik", type: "toggle", bank: "ruh_halleri", icon: "⏻", theme: "aqua" },

  // Yaşam (10)
  { id: "w31", title: "Sağlık İpucu", cat: "yasam", type: "text", bank: "saglik", icon: "+", theme: "lime" },
  { id: "w32", title: "Su Hatırlatıcı", cat: "yasam", type: "badge", bank: "aliskanliklar", icon: "💧", theme: "aqua" },
  { id: "w33", title: "Ruh Hâli", cat: "yasam", type: "mood", bank: "ruh_halleri", icon: "☺", theme: "pink" },
  { id: "w34", title: "Nefes Kartı", cat: "yasam", type: "progress", bank: "sayilar", icon: "◯", theme: "violet", effect: "pulse" },
  { id: "w35", title: "Uyku Notu", cat: "yasam", type: "note", bank: "saglik", icon: "☾", theme: "violet" },
  { id: "w36", title: "Yürüyüş Çağrısı", cat: "yasam", type: "chip", bank: "aliskanliklar", icon: "→", theme: "lime" },
  { id: "w37", title: "Beslenme Mini", cat: "yasam", type: "text", bank: "saglik", icon: "☀", theme: "sun" },
  { id: "w38", title: "Denge Ölçer", cat: "yasam", type: "slider-demo", bank: "sayilar", icon: "⇔", theme: "aqua" },
  { id: "w39", title: "Şükür Listesi", cat: "yasam", type: "mini-form", bank: "affirmations", icon: "☰", theme: "coral" },
  { id: "w40", title: "Günün Ritmi", cat: "yasam", type: "text", bank: "ipuclari", icon: "♫", theme: "pink" },

  // Bilgi (10)
  { id: "w41", title: "Günün Bilgisi", cat: "bilgi", type: "text", bank: "bilgiler", icon: "ⓘ", theme: "aqua" },
  { id: "w42", title: "Tech İpucu", cat: "bilgi", type: "text", bank: "tech", icon: "</>", theme: "blue" },
  { id: "w43", title: "Kelime Kartı", cat: "bilgi", type: "badge", bank: "kelimeler", icon: "W", theme: "violet" },
  { id: "w44", title: "Soru-Cevap", cat: "bilgi", type: "quote-card", bank: "sorular", icon: "Q", theme: "coral" },
  { id: "w45", title: "Öğrenme Notu", cat: "bilgi", type: "note", bank: "tech", icon: "✎", theme: "lime" },
  { id: "w46", title: "Trivia Chip", cat: "bilgi", type: "chip", bank: "bilgiler", icon: "★", theme: "sun" },
  { id: "w47", title: "Kod Snippet Kart", cat: "bilgi", type: "code-card", bank: "tech", icon: "{ }", theme: "blue" },
  { id: "w48", title: "Sayısal Bilgi", cat: "bilgi", type: "counter", bank: "sayilar", icon: "Σ", theme: "aqua" },
  { id: "w49", title: "Flashcard", cat: "bilgi", type: "quote-card", bank: "kelimeler", icon: "▣", theme: "pink" },
  { id: "w50", title: "İpucu Banner", cat: "bilgi", type: "toast-demo", bank: "ipuclari", icon: "!", theme: "coral" },

  // Tasarım (10)
  { id: "w51", title: "Günün Paleti", cat: "tasarim", type: "palette", bank: "renkler", icon: "▣", theme: "sun" },
  { id: "w52", title: "Gradient Adı", cat: "tasarim", type: "palette", bank: "gradient_isim", icon: "◐", theme: "violet" },
  { id: "w53", title: "Tasarım İpucu", cat: "tasarim", type: "text", bank: "tasarim", icon: "✦", theme: "coral" },
  { id: "w54", title: "Buton Seti", cat: "tasarim", type: "button-set", bank: "mikro_hedefler", icon: "▢", theme: "blue" },
  { id: "w55", title: "Chip Paketi", cat: "tasarim", type: "chip", bank: "kelimeler", icon: "●", theme: "pink" },
  { id: "w56", title: "Gölgeli Kart", cat: "tasarim", type: "note", bank: "tasarim", icon: "▭", theme: "aqua" },
  { id: "w57", title: "Loader Demo", cat: "tasarim", type: "loader", icon: "⟳", theme: "lime", effect: "spin" },
  { id: "w58", title: "Kontrast Rozeti", cat: "tasarim", type: "badge", bank: "renkler", icon: "◑", theme: "violet" },
  { id: "w59", title: "Tipografi Kartı", cat: "tasarim", type: "quote-card", bank: "sozler", icon: "T", theme: "coral" },
  { id: "w60", title: "Hover Glow", cat: "tasarim", type: "effect", bank: "renkler", icon: "✧", theme: "pink", effect: "glow" },

  // Zaman (10)
  { id: "w61", title: "Canlı Saat", cat: "zaman", type: "clock", icon: "⌚", theme: "blue" },
  { id: "w62", title: "Takvim Günü", cat: "zaman", type: "calendar", icon: "📅", theme: "coral" },
  { id: "w63", title: "Yıl İlerlemesi", cat: "zaman", type: "year-progress", icon: "%", theme: "lime" },
  { id: "w64", title: "Hafta Sonu Sayacı", cat: "zaman", type: "countdown-weekend", icon: "↘", theme: "violet" },
  { id: "w65", title: "Gün No", cat: "zaman", type: "counter", bank: "sayilar", icon: "#", theme: "aqua" },
  { id: "w66", title: "Zaman Notu", cat: "zaman", type: "note", bank: "ipuclari", icon: "⌛", theme: "sun" },
  { id: "w67", title: "Rutin Chip", cat: "zaman", type: "chip", bank: "aliskanliklar", icon: "↻", theme: "pink" },
  { id: "w68", title: "Dakika Odak", cat: "zaman", type: "progress", bank: "sayilar", icon: "●", theme: "blue" },
  { id: "w69", title: "Tarih Rozeti", cat: "zaman", type: "badge", bank: "kelimeler", icon: "▣", theme: "coral" },
  { id: "w70", title: "Nabız Efekt", cat: "zaman", type: "effect", bank: "ruh_halleri", icon: "♥", theme: "pink", effect: "pulse" },

  // Araçlar (10)
  { id: "w71", title: "Zar At", cat: "araclar", type: "dice", icon: "⚄", theme: "blue" },
  { id: "w72", title: "Rastgele Sayı", cat: "araclar", type: "counter", bank: "sayilar", icon: "?", theme: "aqua" },
  { id: "w73", title: "Renk Kopyala", cat: "araclar", type: "palette", bank: "renkler", icon: "▤", theme: "violet" },
  { id: "w74", title: "Hızlı Not", cat: "araclar", type: "mini-form", bank: "sorular", icon: "✎", theme: "sun" },
  { id: "w75", title: "On/Off Anahtar", cat: "araclar", type: "toggle", bank: "ruh_halleri", icon: "⏻", theme: "lime" },
  { id: "w76", title: "Seviye Kaydırıcı", cat: "araclar", type: "slider-demo", bank: "sayilar", icon: "═", theme: "coral" },
  { id: "w77", title: "Toast Bildirim", cat: "araclar", type: "toast-demo", bank: "ipuclari", icon: "⇪", theme: "pink" },
  { id: "w78", title: "Buton Demo", cat: "araclar", type: "button-set", bank: "mikro_hedefler", icon: "▣", theme: "blue" },
  { id: "w79", title: "Kod Bloğu", cat: "araclar", type: "code-card", bank: "tech", icon: "</>", theme: "aqua" },
  { id: "w80", title: "Yükleniyor", cat: "araclar", type: "loader", icon: "⟳", theme: "violet", effect: "spin" },

  // Eğlence (10)
  { id: "w81", title: "Eğlence Sözü", cat: "eglence", type: "text", bank: "eglence", icon: "☺", theme: "pink" },
  { id: "w82", title: "Şanslı Zar", cat: "eglence", type: "dice", icon: "🎲", theme: "coral" },
  { id: "w83", title: "Mood Seçici", cat: "eglence", type: "mood", bank: "ruh_halleri", icon: "☻", theme: "sun" },
  { id: "w84", title: "Şans Sayısı", cat: "eglence", type: "counter", bank: "sayilar", icon: "7", theme: "violet" },
  { id: "w85", title: "Komik Chip", cat: "eglence", type: "chip", bank: "eglence", icon: "★", theme: "lime" },
  { id: "w86", title: "Parti Badge", cat: "eglence", type: "badge", bank: "ruh_halleri", icon: "✦", theme: "pink", effect: "bounce" },
  { id: "w87", title: "Confetti Kart", cat: "eglence", type: "effect", bank: "eglence", icon: "✶", theme: "coral", effect: "confetti" },
  { id: "w88", title: "Oyun Notu", cat: "eglence", type: "note", bank: "eglence", icon: "▶", theme: "aqua" },
  { id: "w89", title: "Flip Söz", cat: "eglence", type: "quote-card", bank: "sozler", icon: "⇄", theme: "violet" },
  { id: "w90", title: "Şans Paleti", cat: "eglence", type: "palette", bank: "renkler", icon: "◈", theme: "sun" },

  // Sosyal (10)
  { id: "w91", title: "Paylaşım Sözü", cat: "sosyal", type: "quote-card", bank: "sozler", icon: "↗", theme: "aqua" },
  { id: "w92", title: "Teşekkür Kartı", cat: "sosyal", type: "note", bank: "affirmations", icon: "♥", theme: "pink" },
  { id: "w93", title: "Soru Paylaş", cat: "sosyal", type: "text", bank: "sorular", icon: "?", theme: "coral" },
  { id: "w94", title: "Profil Rozeti", cat: "sosyal", type: "badge", bank: "kelimeler", icon: "@", theme: "blue" },
  { id: "w95", title: "Durum Chip", cat: "sosyal", type: "chip", bank: "ruh_halleri", icon: "●", theme: "lime" },
  { id: "w96", title: "Davet Butonu", cat: "sosyal", type: "button-set", bank: "mikro_hedefler", icon: "+", theme: "violet" },
  { id: "w97", title: "Yorum Kutusu", cat: "sosyal", type: "mini-form", bank: "sorular", icon: "💬", theme: "aqua" },
  { id: "w98", title: "Bildirim Demo", cat: "sosyal", type: "toast-demo", bank: "ipuclari", icon: "🔔", theme: "sun" },
  { id: "w99", title: "Topluluk Notu", cat: "sosyal", type: "text", bank: "sozler", icon: "☰", theme: "coral" },
  { id: "w100", title: "Soft Glow Kart", cat: "sosyal", type: "effect", bank: "renkler", icon: "✦", theme: "pink", effect: "soft-glow" },
];

if (widgets.length !== 100) {
  console.error("Eski widget sayısı 100 olmalı, şu an:", widgets.length);
  process.exit(1);
}

const merged = [
  ...greenWidgets.sort((a, b) => (a.priority || 999) - (b.priority || 999)),
  ...widgets,
];

const catalog = {
  brand: "BalabanWidgets",
  generatedAt: new Date().toISOString(),
  dayCount: DAYS,
  categories,
  widgets: merged,
};

fs.writeFileSync(path.join(root, "data", "catalog.json"), JSON.stringify(catalog, null, 2));

// Eski tekil dosyaları da 365'lik bankalara bağla (geriye uyum)
fs.writeFileSync(path.join(root, "data", "ayetler.json"), JSON.stringify(banks.ayetler, null, 2));
fs.writeFileSync(path.join(root, "data", "hadisler.json"), JSON.stringify(banks.hadisler, null, 2));
fs.writeFileSync(path.join(root, "data", "sozler.json"), JSON.stringify(banks.sozler, null, 2));
fs.writeFileSync(path.join(root, "data", "ipuclari.json"), JSON.stringify(banks.ipuclari, null, 2));

console.log(`OK: ${merged.length} widget (${greenWidgets.length} yeşil + ${widgets.length} klasik), ${Object.keys(banks).length} banka x ${DAYS} gün`);
