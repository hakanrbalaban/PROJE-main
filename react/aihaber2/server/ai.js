import { createHash } from 'crypto'
import { CATEGORY_IDS, CATEGORIES, imageUrl } from './categories.js'
import { listArticles, upsertArticle } from './store.js'

/**
 * Metin: Pollinations text API artık ücretli (402) → uzun yerel şablon kullanılır.
 * Görsel: ücretsiz Pollinations image URL (categories.imageUrl).
 */

const TOPICS = {
  teknoloji: [
    'açık kaynak araçlarla kişisel otomasyon',
    'şifre yöneticisi kullanmanın pratik faydaları',
    'karanlık modun göz yorgunluğuna etkisi',
    'USB-C evrenselliği ve kablo karmaşası',
    'akıllı saat bildirim disiplini',
    'ikinci el laptop alırken checklist',
  ],
  bilim: [
    'mikroplastiklerin doğadaki yolculuğu',
    'uyku ve bağışıklık ilişkisine genel bakış',
    'yenilenebilir enerjide depolama teknolojileri',
    'kuşların göç navigasyonu',
    'kahvenin kimyası ve aroma notları',
    'derin deniz ışık canlıları',
  ],
  yasam: [
    'sabah rutini tasarlamak',
    'dijital detoks hafta sonu planı',
    'evde ergonomik çalışma köşesi',
    'küçük hedeflerle momentum yaratmak',
    'pazar akşamı haftalık reset',
    'sosyal medya zaman sınırı koyma',
  ],
  kultur: [
    'kısa film izleme alışkanlığı',
    'plak dinlemenin ritüeli',
    'müze ziyaretini verimli kılmak',
    'yerel tiyatroya dönüş',
    'podcast ile kültür turu',
    'seramik atölyesine ilk adım',
  ],
  saglik: [
    'masa başında postür molaları',
    'su içme alışkanlığını kalıcı kılmak',
    'yürüyüşün ruh haline etkisi',
    'ekran molası için 20-20-20 kuralı',
    'akşam esneme rutini',
    'protein dolu pratik kahvaltılar',
  ],
  seyahat: [
    'trenle şehirlerarası yolculuk ipuçları',
    'hafif valiz paketleme',
    'yerel mutfağı güvenli keşfetmek',
    'fotoğraf odaklı yürüyüş rotası',
    'hostel ortak alan görgü kuralları',
    'şehirde ücretsiz manzara noktaları',
  ],
  yemek: [
    'ev yapımı yoğurt kültürü',
    'mevsim sebzeleriyle hızlı sofralar',
    'baharatları doğru saklamak',
    'öğle için batch cooking',
    'airfryer ile çıtır sebze',
    'kahvaltılık granola karışımı',
  ],
  astroloji: [
    'ay evrelerini farkındalık aracı görmek',
    'element gruplarını tanımak',
    'burç sohbetlerinde sağlıklı sınır',
    'gökyüzü gözlemi hobisi',
    'yükselen burç nedir kısaca',
    'gezegen retrogrades eğlencesi',
  ],
  din: [
    'şükür pratiğinin günlük hali',
    'sessizlikte tefekkür',
    'komşuluk ve iyilik üzerine',
    'ilim öğrenme niyeti',
    'sabah zikir ritüeli ilhamı',
    'paylaşmanın manevi boyutu',
  ],
  egitim: [
    'pomodoro ile dil çalışmak',
    'anlatarak öğrenme yöntemi',
    'not alma sistemleri karşılaştırması',
    'mentor bulmanın adımları',
    'flashcard ile kelime ezberi',
    'online kurs bitirme taktikleri',
  ],
  doga: [
    'şehir parkında kuş gözlemi',
    'kompostun ev hali',
    'yağmur suyu bilinci',
    'yerel ağaç türlerini tanımak',
    'gece gökyüzü ışık kirliliği',
    'balkon kelebek dostu bitkiler',
  ],
  tasarim: [
    'renk kontrastı ve erişilebilirlik',
    'grid sistemine giriş',
    'ikon setlerinde tutarlılık',
    'portföy sunumunda hikâye',
    'mobil önce tipografi',
    'mikro etkileşim seçimi',
  ],
  psikoloji: [
    'duygu adlandırma pratiği',
    'sınır koymanın nazik dili',
    'ertelemenin altında yatan korku',
    'minnet günlüğü deneyi',
    'sosyal karşılaştırma tuzağı',
    'içsesi nazikleştirmek',
  ],
}

/** Hedef: ~6–8 dk okuma (~1000+ kelime) */
const MIN_BODY_WORDS = 1000

const ANGLE_HOOKS = [
  'küçük adımlarla büyük fark',
  'sürtünmeyi azaltan sistemler',
  'ritüel haline getirmek',
  'ortamı iradeden önce düzenlemek',
  'ölçülebilir mini denemeler',
  'yumuşak disiplin ve merhamet',
]

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function wordCount(text) {
  return String(text || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length
}

function titleCaseTopic(topic) {
  return topic.charAt(0).toUpperCase() + topic.slice(1)
}

/** Her üretimde benzersiz, uzun form magazin yazısı */
function buildLongArticle(category, topic) {
  const label = CATEGORIES[category]?.label || category
  const angle = pick(ANGLE_HOOKS)
  const title = `${titleCaseTopic(topic)}: ${angle}`
  const excerpt = `${label} kategorisinde derinlemesine rehber — ${topic}. Bağlam, adımlar, hatalar, senaryolar ve bir haftalık plan.`

  const body = `## Giriş: neden bu konu şimdi önemli?

${topic} üzerine yazmak, moda bir liste paylaşmak değil; günlük hayatta ölçülebilir bir iyileşme aramaktır. AİORA’da ${label.toLowerCase()} yazıları özgün üretilir: ajans metni, güncel olay özeti veya kopyalanmış kaynak yoktur. Bu metin, “${angle}” çerçevesinde ${topic} başlığını katman katman açmak için yazıldı — yüzeysel ipuçlarının ötesine geçmek isteyen okur için.

İyi bir magazin yazısı üç şey sunar: bağlam, uygulanabilir adımlar ve dürüst sınırlar. Aşağıda önce “neden”, sonra “nasıl”, ardından “sürdürülebilirlik”, sık yapılan hatalar ve gerçekçi senaryolar geliyor. Sonunda da bir haftalık mini plan bulacaksınız.

## Bağlam: sorunun gerçek hali

Çoğu insan ${topic} konusunda ya aşırı iyimser ya da aşırı karamsardır. Gerçekte mesele çoğu zaman bilgi eksikliği değil; dikkat dağınıklığı, tutarsız ritim ve “hemen sonuç” beklentisidir. Küçük ama düzenli denemeler, büyük ama tek seferlik hamlelerden daha kalıcıdır.

${label} alanında işe yarayan yaklaşımların ortak paydası şudur: görünür bir sistem, kısa geri bildirim döngüsü ve merhametli yeniden başlama. Mükemmellik değil, tekrar eden niyet kazanır. “${angle}” fikri tam da buradan doğar: bir kerelik kahramanlık değil, sürtünmesi düşük bir ritim.

Gündelik hayatta ${topic} çoğu zaman “yarın başlarım” rafına kalkar. Yarın ise aynı rafı yeniden doldurur. Bu yazının amacı, o rafı boşaltmak değil; rafın yanına küçük, görünür bir başlangıç kutusu koymaktır.

## Temel ilkeler

1. Ölçülebilir küçük birim: “Daha iyi olmak” yerine “bugün 12 dakika” gibi net bir birim seçin.
2. Tek değişken kuralı: Bir hafta boyunca yalnızca bir alışkanlığı değiştirin; yoksa neyin işe yaradığını bilemezsiniz.
3. Ortam iradeden önce gelir: İradeye güvenmek yerine ortamı sadeleştirin (görünür araçlar, sessiz bildirimler, hazır malzeme).
4. Kayıt tutmak: İki satırlık not bile yeter: ne yaptınız, nasıl hissettiniz.
5. Sosyal hesap verebilirlik (isteğe bağlı): Güvendiğiniz birine “bu hafta deniyorum” demek, sürtünmeyi azaltır.
6. Yeniden başlama protokolü: Bir gün kaçınca cezalandırmak yerine “bir sonraki en küçük adım”ı yazın.

## Adım adım uygulama

### 1) Keşif günü (30–40 dakika)
Konuyu abartmadan haritalayın. Şu anki rutininizi yazın: ne zaman, nerede, hangi engeller. ${topic} için engeller çoğu zaman teknik değil; zaman, enerji ve dikkat yönetimidir. Keşif gününün çıktısı bir karar listesi değil, dürüst bir fotoğraftır.

### 2) Minimum uygulanabilir versiyon
İlk sürüm utanç verici derecede küçük olsun. Büyük planlar ertelemeyi besler. Küçük planlar “başladım” duygusunu üretir; bu duygu, devam etmenin yakıtıdır. ${topic} için “mükemmel kurulum” beklemeyin — önce hareket, sonra cilalama.

### 3) Haftalık ritim
- Pazartesi: kurulumu yapın, malzemeyi hazırlayın
- Salı–Perşembe: kısa ama tutarlı tekrarlar
- Cuma: neyin zorlandığını not edin
- Cumartesi: tek iyileştirme seçin (süre, ortam veya sıra)
- Pazar: haftayı kapatın; gelecek haftanın tek odağını yazın

### 4) Kalite kontrolü
Her denemeden sonra üç soru sorun:
- Bu, gerçekten benim hayatımda yer buluyor mu?
- Daha az sürtünmeli bir versiyon var mı?
- Bedenim ve zihnim nasıl tepki verdi?

### 5) Görünürlük
Alışkanlık görünmezse unutulur. Takvim bloğu, masa üstü notu veya telefon kilidi mesajı gibi tek bir hatırlatıcı seçin. Çok hatırlatıcı = gürültü.

## Derinleştirme: sık yapılan hatalar

- Hata 1, aşırı yükleme: Beş yeni alışkanlığı aynı anda başlatmak, hiçbirini tutturmamaktır.
- Hata 2, sonuç takıntısı: Süreç metriklerini (tekrar sayısı, tutarlılık) ihmal edip yalnızca “mükemmel çıktı” beklemek.
- Hata 3, ortamı değiştirmeden iradeye yüklenmek: Aynı dağınık masada “odaklanacağım” demek çoğu zaman işe yaramaz.
- Hata 4, sert iç ses: Bir gün kaçınca “ben yapamam” narratifi; oysa alışkanlıklar kırılır ve yeniden örülür.
- Hata 5, bağlamı kopyalamak: Başkasının sabah rutini sizin akşam enerjinize uymayabilir. İlkeleri alın, biçimi kişiselleştirin.
- Hata 6, ölçmeden yargılamak: İki hafta denemeden “işe yaramadı” demek, erken pes etmektir.

## Pratik araç kutusu

- Zaman kutusu: Takvime 15–25 dakikalık blok koyun; “boş zaman”a bırakmayın.
- Hazırlık iskelesi: Bir gece önce malzemeyi, dosyayı veya kıyafeti hazırlayın.
- Tek sekme, tek görev: Paralel iş yanılsamasını bilinçli olarak kesin.
- Hareket köprüsü: Uzun oturumlarda 90 saniyelik yürüyüş veya esneme.
- Kapanış ritüeli: “Yarınki ilk adım”ı yazıp günü zihnen kapatın.
- İki satırlık günce: Ne yaptım? Ne zorladı? Yarın neyi küçültmeliyim?

## Gerçekçi senaryolar

### Senaryo A — Yoğun bir iş günü
Sabah acele, öğlen toplantı, akşam yorgunluk. ${topic} için “ideal 45 dakika” yoksa 8 dakikalık mini versiyonu seçin. Amaç mükemmellik değil, zinciri kırmamaktır. İş çıkışı çantaya koyduğunuz tek bir hazırlık (matara, not defteri, kulaklık) sürtünmeyi düşürür.

### Senaryo B — Evde dağınık bir akşam
Ekranlar açık, dikkat parçalı. Önce 2 dakikalık reset: bildirimleri kapatın, bir bardak su alın, tek bir yüzey temizleyin. Ardından ${topic} için önceden tanımladığınız minimum adımı uygulayın. Bitince “yaptım” diye işaretleyin — beyin tamamlanma ister.

## Örnek bir haftalık mini plan

Hafta teması: ${topic} · Açı: ${angle}

- Pazartesi · Kurulum ve ilk deneme · 25 dk · Ölçüt: başladım
- Salı · Tekrar · 15 dk · Ölçüt: yaptım
- Çarşamba · Tekrar ve bir iyileştirme · 20 dk · Ölçüt: not aldım
- Perşembe · Tekrar · 15 dk · Ölçüt: yaptım
- Cuma · Gözden geçirme · 20 dk · Ölçüt: üç cümle özet
- Cumartesi · Hafif versiyon · 10 dk · Ölçüt: sürtünme azaldı
- Pazar · Haftalık kapanış · 15 dk · Ölçüt: gelecek odak seçildi

Bu liste bir dayatma değil; iskelettir. Enerjiniz düşükse süreleri yarıya indirin — ama tamamen silmeyin.

## Kaliteyi yükselten sorular

1. Bu konuda en çok neyi abartıyorum?
2. En çok neyi ertelediğim küçük adım hangisi?
3. Ortamımda tek bir fiziksel değişiklik yapsam ne olurdu?
4. İki hafta sonra “işe yaradı” dememi sağlayacak kanıt ne olurdu?
5. Bu alışkanlığı “${angle}” dilinde yeniden tarif etsem nasıl olurdu?

${label} içerikleri AİORA’da bilinçli olarak magazin + pratik çizgisinde tutulur: haber özeti, finans tavsiyesi veya hukuk yönlendirmesi yoktur.

## Sınırlar ve dürüstlük notu

Bu içerik genel bilgilendirme ve ilham amaçlıdır; tıbbi tanı veya tedavi tavsiyesi değildir. Sağlıkla ilgili şikâyetlerinizde kişisel durumunuz için uygun uzmana danışın.

## Kapanış

${topic} bir sprint değil, zanaattır. Bugün tek bir küçük adım atın; yarın aynı adımı %10 daha pürüzsüz hale getirin. “${angle}” yaklaşımı, iradeyi yormadan sistemi kurmanıza yardım eder. AİORA’da her yazı uzun form, telif bilincine uygun üretilir — iki satırlık özet değil, okunacak bir rehber.`

  return {
    title,
    excerpt,
    body,
    category,
    tags: [...topic.split(/\s+/).slice(0, 3), angle.split(/\s+/)[0]].filter(Boolean).slice(0, 5),
    coverPrompt: `editorial magazine photography about ${topic}, soft teal accents, cinematic light, high quality, no text, no watermark, no logos`,
  }
}

export async function generateArticle(forcedCategory, { persist = true, status = 'published' } = {}) {
  const category = forcedCategory || pick(CATEGORY_IDS)
  const topic = pick(TOPICS[category] || TOPICS.yasam)
  const existing = listArticles()
    .map((a) => a.title?.toLowerCase())
    .filter(Boolean)

  let draft = buildLongArticle(category, topic)
  let guard = 0
  while (existing.includes(String(draft.title).toLowerCase()) && guard < 6) {
    draft = buildLongArticle(category, topic)
    guard += 1
  }

  if (wordCount(draft.body) < MIN_BODY_WORDS) {
    draft = buildLongArticle(category, topic)
  }

  const id = createHash('sha1')
    .update(`${draft.title}|${Date.now()}|${Math.random()}`)
    .digest('hex')
    .slice(0, 12)
  const seed = parseInt(id.slice(0, 8), 16) % 99999
  const coverPrompt = String(
    draft.coverPrompt || `editorial magazine ${topic} teal accents no text`,
  )

  const payload = {
    id,
    title: String(draft.title).slice(0, 140),
    excerpt: String(draft.excerpt || '').slice(0, 320),
    body: String(draft.body),
    category,
    tags: Array.isArray(draft.tags) ? draft.tags.map(String).slice(0, 6) : [],
    coverPrompt,
    coverUrl: imageUrl(coverPrompt, seed),
    author: 'AİORA Yazım AI',
    aiGenerated: true,
    status: status === 'draft' ? 'draft' : 'published',
    sourceNote: 'AI taslak — yayın öncesi editör kontrolü önerilir.',
    publishedAt: new Date().toISOString(),
  }

  if (!persist) return payload
  return upsertArticle(payload)
}

let generating = false

export async function autoPublishOnce() {
  if (generating) return null
  generating = true
  try {
    return await generateArticle()
  } finally {
    generating = false
  }
}

export function getAiProviderInfo() {
  return {
    provider: 'local-longform',
    cost: 'free',
    apiKeyRequired: false,
    text: 'local-template (~1100+ words)',
    image: 'https://image.pollinations.ai',
    note: 'Uzun form magazin şablonu — Pollinations metin API ücretli olduğu için yerel uzun üretim',
  }
}
