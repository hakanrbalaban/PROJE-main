import { createHash } from 'crypto'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { CATEGORIES, imageUrl } from './categories.js'
import { attachEngagement, relatedScore } from './engagement.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = path.join(__dirname, 'data')
const DATA_FILE = path.join(DATA_DIR, 'articles.json')

export function slugify(text) {
  const map = {
    ç: 'c',
    ğ: 'g',
    ı: 'i',
    ö: 'o',
    ş: 's',
    ü: 'u',
    Ç: 'c',
    Ğ: 'g',
    İ: 'i',
    Ö: 'o',
    Ş: 's',
    Ü: 'u',
  }
  return String(text || '')
    .split('')
    .map((c) => map[c] || c)
    .join('')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

function idFrom(title) {
  return createHash('sha1').update(String(title) + Date.now()).digest('hex').slice(0, 12)
}

function uniqueSlug(base, excludeId) {
  let slug = slugify(base) || `yazi-${Date.now().toString(36)}`
  let n = 2
  while (articles.some((a) => a.slug === slug && a.id !== excludeId)) {
    slug = `${slugify(base)}-${n}`
    n += 1
  }
  return slug
}

function article(partial) {
  const id = partial.id || idFrom(partial.title)
  const seed = parseInt(id.slice(0, 8), 16) % 99999
  const words = String(partial.body || '')
    .split(/\s+/)
    .filter(Boolean).length
  const aiGenerated = partial.aiGenerated ?? true
  return {
    id,
    slug: partial.slug || slugify(partial.title) || id,
    title: partial.title,
    excerpt: partial.excerpt,
    body: partial.body,
    category: partial.category,
    categoryLabel: CATEGORIES[partial.category]?.label || partial.category,
    tags: partial.tags || [],
    author: partial.author || (aiGenerated ? 'AİORA Editör AI' : 'AİORA Editör'),
    authorNote: partial.authorNote || '',
    metaDescription: partial.metaDescription || String(partial.excerpt || '').slice(0, 160),
    status: partial.status === 'draft' ? 'draft' : 'published',
    publishedAt: partial.publishedAt,
    updatedAt: partial.updatedAt || partial.publishedAt || new Date().toISOString(),
    readMinutes:
      partial.readMinutes || Math.max(4, Math.round(words / 180)),
    coverPrompt: partial.coverPrompt || `editorial magazine ${partial.title} teal soft light no text`,
    coverUrl: partial.coverUrl || imageUrl(partial.coverPrompt || partial.title, seed),
    aiGenerated,
    copyrightSafe: true,
    sourceNote:
      partial.sourceNote ||
      (aiGenerated
        ? 'Özgün AI / editöryel içerik — haber ajansı veya üçüncü taraf haber metni içermez.'
        : 'Editöryel özgün içerik — haber ajansı metni içermez.'),
  }
}

const now = Date.now()
const day = 86400000

/** Telifsiz seed makaleler — site anında dolu açılsın diye. */
export const SEED_ARTICLES = [
  article({
    id: 'guzel-gunlere-yolculuk',
    slug: 'guzel-gunlere-yolculuk',
    title: 'Güzel Günlere Yolculuk: “Bir Gün” Değil, “Bugün” Başlayan Bir Hikâye',
    excerpt:
      'Güzel günler bir anda gelmez. Küçük adımlar, nazik bir iç ses ve sistemle başlayan bir yolculuğun haritası.',
    metaDescription:
      'Güzel günlere yolculuk: tanım, sistem, sınırlar, 7 günlük mini plan ve kendine naziklik üzerine editöryel bir yazı.',
    category: 'psikoloji',
    tags: ['güzel günler', 'kişisel gelişim', 'umut', 'alışkanlık'],
    author: 'Hakan Rüştü Balaban',
    authorNote:
      'Bu yazıyı yazarken tek bir dileğim vardı: Okuyan kişinin, kendi yükünü biraz daha hafif taşıyabilmesi. Güzel günlere yolculuk bence büyük laflarla değil, küçük ama gerçek adımlarla başlıyor. Eğer buradan aklında kalan tek şey “Bugün kendime küçük bir iyilik yapabilirim” cümlesiyse, bu yazı amacına ulaşmıştır. Yolun açık olsun.',
    aiGenerated: false,
    publishedAt: new Date(now - 0.5 * day).toISOString(),
    coverPrompt:
      'hopeful sunrise road soft golden light walking path editorial magazine photography calm hopeful mood no text no watermark',
    sourceNote: 'Editöryel özgün içerik — insan yazar tarafından kaleme alınmıştır.',
    body: `Bazı sabahlar var; alarm değil, içimizdeki yorgunluk uyandırır bizi. O günlerde insan, “Güzel günler gelecek mi?” diye sormaz yalnızca—sanki güzel günlerin varlığına dair bir kanıt ister. Bir işaret. Bir mesaj. Bir tesadüf. Bir omuz. Bir cümle.

Oysa çoğu zaman güzel günler bir anda gelmez. Bir kapıyı çalıp “Ben geldim” demez. Güzel günler, biz hayatın dağınık masasında küçük bir alan açtığımızda kendine yer bulur. Bir bardak su kadar basit bir başlangıçla. Bir “Bugün sadece şunu yapacağım” kararıyla. Bir “Ben de deneyeceğim” cümlesiyle.

Bu yazı, bir vaatte bulunmak için değil; güzel günlere giden yolun haritasını birlikte çizmek için. Çünkü herkesin yolu farklıdır ama yolculuğun bazı ortak durakları vardır.

## 1) Güzel Günler Nedir? Herkesin Tanımı Başkadır

“Güzel günler” kimi için huzurlu bir evdir. Kimi için borçlardan arınmış bir nefes. Kimi için sağlıklı bir beden. Kimi için sevildiğini hissetmek. Kimi için yalnız kalabilmek. Kimi için kalabalıkta kaybolmamak.

İlk adım şudur: Güzel günlerin tanımını başkasından ödünç alma. Sosyal medyada “ideal hayat” gibi görünen şey, senin “ideal günün” olmayabilir. Üstelik çoğu zaman o görüntüler hayatın vitrini; arka depo dağınık, herkes gibi.

Kendine şu soruyu sor: “Benim güzel gün dediğim şey hangi duyguyla başlıyor?” Güven mi? Hafiflik mi? Merak mı? Huzur mu? Aidiyet mi? Çünkü hedef duyguyu bilmeyen insan, hedefe giden yolu da karıştırır.

## 2) Yolculuk Bir Aydınlanma Değil, Bir Düzen Kurma Meselesi

Bize genelde şöyle anlatıldı: “Bir gün karar vereceksin ve hayatın değişecek.” Evet, bazı hayatlar bir karar anıyla değişir. Ama çoğu hayat, karar değil düzen ister.

Güzel günlerin sırrı çoğu zaman motivasyon değil, sistemdir.

Mini bir gerçek: Motivasyon dalgalanır. Sistem kalır.

Sistem derken dev planlar değil; küçük ama istikrarlı adımlar:

- Uyanınca 5 dakika telefona bakmamak
- Günde 10 dakika yürümek
- 1 bardak fazla su içmek
- 15 dakika kitap veya öğrenme zamanı
- Haftada 1 kez “kendimle randevu” (kahve, yürüyüş, sessizlik)

Küçük adımlar “küçük” değildir. Çünkü küçük adımlar, kimliğini değiştirir: “Ben yapabilen biriyim.” “Ben toparlayabilen biriyim.” “Ben yeniden başlayabilen biriyim.” Ve güzel günler, çoğu zaman bu kimliğin yan etkisidir.

## 3) Güzel Günler İçin Önce “Kötü Günlere” Yer Açmak Gerekir

Kulağa ters gelebilir ama şudur: Güzel günlere gitmek için önce kötü günleri inkâr etmeyi bırakmak gerekir.

Birçok insanın en büyük yükü yaşadığı şey değil; yaşadığı şeyi yaşamaması gerektiğine inanmasıdır. “Böyle hissetmemeliyim.” “Güçlü olmalıyım.” “Şikâyet etmeye hakkım yok.” “Herkesin derdi var.” Evet, herkesin derdi var. Bu, senin derdini küçültmez.

Kötü günleri kabul etmek, kötüye teslim olmak değildir. Tam tersine, gerçek zemini bulmaktır. Gerçek zeminde yürüyebilirsin.

Kendine şu cümleyi dene: “Bugün zor bir gün. Ama ben yine de kendime küçük bir iyilik yapacağım.” Bazen güzel günlerin tek habercisi budur: Kendine sadakat.

## 4) “Bir Şeyler Eksik” Hissinin Haritası: İhtiyaç mı, Alışkanlık mı?

İçimizdeki boşluğu her zaman doğru okumayız. Bazen ihtiyaç sanırız, alışkanlıktır. Bazen açlık sanırız, yorgunluktur. Bazen yalnızlık sanırız, anlaşılmamaktır.

Bu yüzden güzel günlere yolculuk biraz da tercüme işidir: Kendini doğru çevirmek.

Şu üçlü kontrolü yap:

- Beden: Uykum, suyum, hareketim nasıl?
- Zihin: Gün içinde kendime nasıl konuşuyorum?
- Çevre: Kimler beni büyütüyor, kimler küçültüyor?

Güzel günlerin bazen en hızlı yolu, büyük kararlar değil; temel ihtiyaçları yerine koymaktır.

## 5) İnsanlarla Mesafe: Güzel Günlerin Kapı Kilidi

Güzel günlere giderken en çok şurada takılırız: Yanlış insanlara doğru yerden tutunmaya çalışırız. Bazı ilişkiler şarj etmez, tüketir. Bazı sohbetler iyileştirmez, yarayı büyütür.

Güzel günlere yolculuk, bazen şu iki cümleyi öğrenmektir: “Hayır.” “Ben böyle hissediyorum.” Bir de şu gerçeği: Herkesi ikna etmek zorunda değilsin. Çünkü güzel günler, en çok sınırları olan insanlara gelir. Sınır, duvar değildir; yön tabelasıdır.

## 6) Kendini “Yetiştirmek” Değil, “Duyup Onarmak”

Kişisel gelişim bazen insanı yorar. Sürekli daha iyi olmaya çalışmak, insana “Şu an yetmiyorsun” mesajı verir. Halbuki güzel günler, kendini kamçılamakla değil; kendini duymakla başlar.

Soru şu: “Ben bugün neye ihtiyaç duyuyorum?” Belki dinlenmeye, düzenlemeye, sadeleşmeye, konuşmaya, susmaya, yardım istemeye.

Evet, yardım istemeye. Çünkü güçlü olmak, yalnız başına taşımak değildir. Güçlü olmak, doğru yerden destek alabilmektir.

Not: Eğer uzun süreli çökkünlük, kaygı, uykusuzluk, umutsuzluk gibi durumlar yaşıyorsanız bir uzmandan (psikolog/psikiyatrist) destek almak çok kıymetli olabilir. Bu yazı terapi yerine geçmez.

## 7) Güzel Günler “Şans” mı? Biraz Evet, Daha Çok Hazırlık

Şans diye bir şey var mı? Var. Ama çoğu şans, hazırlıkla karşılaşınca görünür olur.

Yeni bir iş fırsatı, yeni bir tanışıklık, yeni bir proje… Bunlar bazen tesadüf gibi gelir. Ama tesadüfün kapısını açan şey genelde şudur: “Ben kendime bir alan açtım.”

Alan açmak ne demek? Ajandada boşluk. Kafada sessizlik. Hayatta sadeleşme. Enerjini tüketen şeylere “dur” deme. Güzel günler, çoğu zaman daha az şeye evet dediğinde daha hızlı gelir.

## 8) Yolculuğun En Gerçek Ölçütü: Bugün Ne Kadar Naziktim?

Kendine nazik olmak “şımarıklık” değildir. Nazik olmak, hayatta kalma becerisidir. Çünkü insan, kendini sürekli hırpalayarak uzun süre yürüyemez.

Bugün kendine şu soruyu sor: “Bugün kendime hangi cümleyi kurdum?” Ve şunu dene: Aynı cümleyi en sevdiğin insana söyler miydin? Söylemezdin. O zaman kendine de söyleme.

Güzel günler, kendinle kurduğun dilin içinden geçer.

## 9) 7 Günlük “Güzel Günlere Başlangıç” Mini Planı

Uzun planlar göz korkutuyorsa, 7 gün yeter.

1. Gün: 15 dakika yürüyüş + 1 sayfa yazı (nasılım?)
2. Gün: Telefonu sabah ilk 20 dakika açmama
3. Gün: Evde/odada 10 dakikalık toparlama
4. Gün: Bir kişiye içten mesaj: “Nasılsın, konuşalım mı?”
5. Gün: 30 dakika öğrenme (video/kitap/not)
6. Gün: Kendine küçük ödül (kahve, film, müzik, sessizlik)
7. Gün: Haftalık değerlendirme: “Neyi devam ettirebilirim?”

Bu planın amacı “mükemmel olmak” değil; başlayabilmek.

## Son Söz: Güzel Günler Bir Varış Noktası Değil, Bir Yön

Güzel günler, sadece gülerken değil; bazen ağlayıp yine de kendine sarıldığında başlar. Bazen hiçbir şey yolunda değilken yatağını topladığında… Bazen bir mesaj atıp “İyi değilim” diyebildiğinde… Bazen “Bugünlük bu kadar” deyip kendini suçlamadığında…

Güzel günlere yolculuk, “Bir gün her şey düzelecek” masalı değil. Güzel günlere yolculuk, “Ben bugün küçük bir adım atacağım” gerçeğidir.

Ve evet: O küçük adımlar birikir. Bir bakarsın, eskiden “uzak” sandığın yerdesin.`,
  }),
  article({
    title: 'Odak sürenizi kurtaran 7 mikro alışkanlık',
    excerpt: 'Bildirimler çağında dikkati korumak bir lüks değil, bilinçli bir tasarım. Küçük ritüeller büyük fark yaratır.',
    category: 'yasam',
    tags: ['odak', 'üretkenlik', 'alışkanlık'],
    publishedAt: new Date(now - 1 * day).toISOString(),
    coverPrompt: 'editorial magazine photo calm desk morning light notebook coffee teal accents soft bokeh no text no watermark',
    body: `Dijital gürültü, beynimizi sürekli “acil” modunda tutuyor. Oysa odak, bir kas gibi çalışır: doğru ısıtma, kısa setler ve dinlenme ile güçlenir.

## Sabahın ilk 20 dakikası
Telefonu başka odada bırakın. Su için, pencereye bakın, üç satır günlük yazın. Bu ritüel, günün “tüketici” değil “üretici” tonunu belirler.

## Tek sekme kuralı
Bir işi bitirene kadar yalnızca o işe ait sekme açık kalsın. Beyin bağlam değiştirmede enerji kaybeder; tek sekme bu kaybı görünür kılar.

## 25 + 5 pomodoro, ama esnek
Klasik pomodoro herkese uymaz. 40 + 10 veya 15 + 3 deneyin. Önemli olan süre değil, “kesintisiz blok” sözleşmesidir.

## Bildirim mimarisi
Mesaj uygulamalarını sessize alın; yalnızca aramalar gelsin. E-postayı günde iki pencereye sıkıştırın. Acil olanlar sizi bulur.

## Hareket köprüleri
Her saat başı 90 saniye yürüyün veya omuz çevirin. Kan akışı, zihinsel bulanıklığı dağıtır.

## Akşam kapanışı
Yarınki üç önceliği yazıp ekranı kapatın. Beyin “açık döngü”leri gece taşır; liste bu döngüleri kapatır.

## Merhametli yeniden başlama
Bir gün dağıldıysa ertesi sabah sıfırdan başlayın. Alışkanlık mükemmellik değil, tekrar eden niyettir.

Küçük değişiklikler birikir. Bir hafta sonra fark edeceğiniz şey “daha çok iş” değil; daha sakin bir zihin olacaktır.`,
  }),
  article({
    title: 'Yerel modeller: bilgisayarınızda çalışan yapay zekâ',
    excerpt: 'Bulut şart değil. Açık kaynak modeller, gizlilik ve hız isteyenler için masaüstüne indi.',
    category: 'teknoloji',
    tags: ['AI', 'yerel', 'gizlilik'],
    publishedAt: new Date(now - 2 * day).toISOString(),
    coverPrompt: 'futuristic home workstation glowing soft teal light abstract neural network hologram cinematic magazine cover no text',
    body: `Bulut AI güçlüdür; ama her şey buluta gitmek zorunda değildir. Yerel modeller; çevrimdışı çalışma, veri gizliliği ve sabit maliyet arayanlar için ciddi bir alternatif.

## Neden yerel?
Şirket notları, kişisel günlükler veya müşteri metinleri buluta çıkmadan işlenebilir. Ayrıca ağ gecikmesi ortadan kalkar; yanıtlar milisaniyeler mertebesinde gelebilir.

## Başlarken
Önce bilgisayarınızın belleğini kontrol edin. 16 GB ile küçük modeller, 32 GB ile orta boy modeller daha rahat çalışır. SSD şart gibi düşünün.

## İyi istem yazmak
Kısa bağlam, net format ve örnek çıktı isteyin. Sonuçları her zaman insan gözüyle doğrulayın.

Yerel AI, herkese göre değil; ama gizlilik ve kontrol isteyenler için güçlü bir seçenektir.`,
  }),
  article({
    title: 'Uyku kalitesini yükselten sakin ritüeller',
    excerpt: 'Daha uzun uyumak yetmez. Derin ve düzenli uyku, bağışıklıktan ruh haline kadar her şeyi etkiler.',
    category: 'saglik',
    tags: ['uyku', 'ritüel', 'sağlık'],
    publishedAt: new Date(now - 3 * day).toISOString(),
    coverPrompt: 'peaceful bedroom moonlight soft blue teal tones calm sleep magazine photography no face no text',
    body: `Uyku, beynin gece vardiyasıdır: anıları sıkıştırır, toksinleri temizler, duyguları dengeler. “Sekiz saat” hedefi popüler olsa da asıl mesele süre + düzen + kalitedir.

## Işık ve ekran
Yatmadan bir saat önce parlak ekranı azaltın. Mavi ışık, melatonin salınımını geciktirebilir.

## Kafein penceresi
Kafeinin yarı ömrü uzundur. Öğleden sonra kesmek, birçok kişide uykuya dalmayı kolaylaştırır.

## Sabit saat
Hafta sonu dahil benzer yatış ve kalkış saatleri, vücut saatini güçlendirir.

Bu yazı genel bilgilendirmedir; süregelen uyku sorunlarında hekime danışın.`,
  }),
  article({
    title: 'Boşlukla tasarlamak: arayüzlerde nefes alanı',
    excerpt: 'İyi tasarım her şeyi doldurmaz. Boşluk, hiyerarşiyi ve okunabilirliği taşır.',
    category: 'tasarim',
    tags: ['UI', 'boşluk', 'tipografi'],
    publishedAt: new Date(now - 4 * day).toISOString(),
    coverPrompt: 'minimal UI layout mockup soft teal accents whitespace design magazine flatlay no readable text',
    body: `Kalabalık arayüzler her şeyi göstermek ister; iyi arayüzler doğru şeyi öne çıkarır. Boşluk (whitespace) bu hiyerarşinin görünmez iskeletidir.

## Ölçek
Başlık ile gövde arasında net ölçek farkı; satır uzunluğu 60–75 karakter bandında. Okunabilirlik, süslemelerden önce gelir.

## Tek odak
Her ekranda bir ana eylem. İkincil eylemler görsel olarak geri planda kalsın.

Tasarım, süs değil; kararların görünür hale gelmesidir.`,
  }),
  article({
    title: 'Balkon ekolojisi: küçük alanda yaşam',
    excerpt: 'Beton ormanında bile nefes noktası açılabilir. Bitki, böcek ve sizin için küçük bir ekosistem.',
    category: 'doga',
    tags: ['balkon', 'bitki', 'ekoloji'],
    publishedAt: new Date(now - 5 * day).toISOString(),
    coverPrompt: 'urban balcony garden pots greenery soft morning light teal accents lifestyle magazine no text',
    body: `Beton ormanında bile yaşam alanı açılabilir. Balkon ekolojisi; bitki, böcek ve sizin için küçük bir nefes noktasıdır.

## Güneş haritası
Sabah mı, öğle mi, akşam mı? Bitki seçimini ışık belirler.

## Su disiplini
Az ve düzenli sulama çoğu kez “bol ve düzensiz”den iyidir.

## Kelebek dostu
Lavanta, nane, fesleğen gibi kokulu bitkiler hem mutfak hem ekoloji için işe yarar.

Küçük bahçe, büyük sakinlik getirebilir.`,
  }),
  article({
    title: 'Türk kahvesinin sabırlı sanatı',
    excerpt: 'İnce öğütü, köpük ve yavaş ateş: aceleye gelmeyen bir ritüel.',
    category: 'yemek',
    tags: ['kahve', 'ritüel', 'mutfak'],
    publishedAt: new Date(now - 6 * day).toISOString(),
    coverPrompt: 'turkish coffee cezve foam steam soft warm light editorial food photography teal accents no text',
    body: `Türk kahvesi, ince öğütülmüş çekirdeğin suyla buluştuğu yavaş bir sanattır. Aceleye gelmez; köpük sabır ister.

## Oran
Bir fincan için bir tatlı kaşığı kahve, isteğe göre şeker. Soğuk suyla başlayın.

## Ateş
Kısık ateşte yükselmesini bekleyin. Kaynamadan köpüğü alın.

Kahve, içecekten önce bir duraktır.`,
  }),
  article({
    title: 'Solo seyahatte güvenlik ve ritüel',
    excerpt: 'Kendi ritminizi keşfederken dikkati elden bırakmamak.',
    category: 'seyahat',
    tags: ['solo', 'seyahat', 'güvenlik'],
    publishedAt: new Date(now - 7 * day).toISOString(),
    coverPrompt: 'solo traveler silhouette mountain road sunrise teal mist adventure magazine photography no face no text',
    body: `Solo seyahat, kendi ritminizi keşfetmektir. Ama özgürlük, dikkatsizlik demek değildir.

## Paylaşım
Güvendiğiniz birine konaklama ve gün planını bırakın.

## Yerel bilgi
Resmi turizm kaynakları, ulaşım saatleri ve acil numaraları not edin.

## Hafif çanta
Az eşya = hızlı hareket. Değerli eşyaları bölüştürün.

En güzel hatıra, eve sağlıklı dönmektir.`,
  }),
  article({
    title: 'Burçlar ve bilinç: metafor olarak gökyüzü',
    excerpt: 'Astrolojiyi kesin bilim sanmadan, kişisel yansıma aracı olarak okumak mümkün.',
    category: 'astroloji',
    tags: ['burç', 'yansıma', 'sembol'],
    publishedAt: new Date(now - 8 * day).toISOString(),
    coverPrompt: 'celestial night sky constellation soft gold teal glow artistic magazine illustration mystical calm no text',
    body: `Astroloji, birçok kültürde hikâye ve sembol dilidir. Bu yazı eğlence ve öz-düşünüm içindir; kader dayatması değildir.

## Arketipler
Ateş, toprak, hava, su grupları; kişilikte enerji, istikrar, fikir ve duygu temalarını hatırlatır.

## Eleştirel denge
Kanıta dayalı sağlık, hukuk ve finans kararlarında uzman kaynaklara güvenin. Burçlar sohbet ve ilham katmanıdır.

Gökyüzü geniştir; yorum uysal kalsın.`,
  }),
  article({
    title: 'Sabır üzerine kısa bir tefekkür',
    excerpt: 'Sabır, pasif beklemek değil; içsel dengeyi koruyarak doğru ana hazırlanmaktır.',
    category: 'din',
    tags: ['sabır', 'maneviyat', 'tefekkür'],
    publishedAt: new Date(now - 9 * day).toISOString(),
    coverPrompt: 'serene mosque silhouette dawn soft golden light calm spiritual atmosphere editorial photography no text',
    body: `Birçok inanç geleneğinde sabır, olgunluğun işaretidir. Zorluk anında panik yerine nefes almak; hem ruhu hem ilişkileri korur.

## Günlük pratik
- Bir işte acele ettiğinizi fark edin
- Üç nefes alın
- “Şimdi ne iyidir?” diye sorun

## Bilgi ve edep
Dini metinler ve hadisler bağlamıyla okunur. Bu köşe yazısı genel ilham niteliğindedir; fetva veya kesin hüküm değildir.

Sabır, kalbin sessiz gücüdür.`,
  }),
  article({
    title: 'Öğrenmeyi öğrenmek: aralıklı tekrar',
    excerpt: 'Ezber değil, hatırlama pratiği. Aralıklı tekrar, uzun vadeli belleğin dostudur.',
    category: 'egitim',
    tags: ['öğrenme', 'bellek', 'çalışma'],
    publishedAt: new Date(now - 10 * day).toISOString(),
    coverPrompt: 'student desk flashcards notebook soft daylight focused study scene teal accents magazine no readable text',
    body: `Beyin, zorlanarak hatırladığında bağlantıları güçlendirir. Aralıklı tekrar (spaced repetition) bu ilkeyi sistemleştirir.

## Nasıl uygulanır?
1. Günün konusunu kısa kartlara bölün
2. Ertesi gün, 3 gün sonra, 1 hafta sonra tekrar sorun
3. Kolaylaşanı seyrekleştirin

Zeki hissetmek değil, kalıcı bilmek hedeftir.`,
  }),
  article({
    title: 'Kaygı ile dans: beden önce gelir',
    excerpt: 'Zihin döngüye girdiğinde bedensel sinyaller kapıyı aralayabilir.',
    category: 'psikoloji',
    tags: ['kaygı', 'nefes', 'farkındalık'],
    publishedAt: new Date(now - 11 * day).toISOString(),
    coverPrompt: 'calm person silhouette breathing by window soft morning light psychological wellness magazine teal mood no face detail no text',
    body: `Kaygı çoğu zaman geleceğe yazılmış bir alarmdır. Alarmı susturmak için önce bedeni sakinleştirmek gerekir.

## 4-7-8 nefesi
4 sayarak alın, 7 tutun, 8 verin. Birkaç döngü sinir sistemine “güvendesin” mesajı verebilir.

## Adlandırma
“Bu kaygı” demek, duyguyu biraz dışarı alır. Yargılamadan gözlemleyin.

## Profesyonel destek
Sürekli ve işlevselliği bozan kaygıda uzman yardımı değerlidir. Bu yazı terapi yerine geçmez.

Küçük düzenlemeler, büyük fırtınaları yumuşatabilir.`,
  }),
]

/** @type {ReturnType<typeof article>[]} */
let articles = []

function ensureSlugs(list) {
  const seen = new Set()
  return list.map((a) => {
    let slug = a.slug || slugify(a.title) || a.id
    let n = 2
    while (seen.has(slug)) {
      slug = `${slugify(a.title) || a.id}-${n}`
      n += 1
    }
    seen.add(slug)
    return { ...a, slug }
  })
}

function saveArticles() {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true })
    fs.writeFileSync(DATA_FILE, JSON.stringify(articles, null, 2), 'utf8')
  } catch (err) {
    console.warn('[store] save failed', err.message)
  }
}

function loadArticles() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'))
      if (Array.isArray(raw) && raw.length) {
        articles = ensureSlugs(raw.map((a) => article(a))).sort(
          (a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt),
        )
        // Editöryel örnek yazı yoksa ekle
        if (!articles.some((a) => a.id === 'guzel-gunlere-yolculuk' || a.slug === 'guzel-gunlere-yolculuk')) {
          const flagship = SEED_ARTICLES.find((a) => a.id === 'guzel-gunlere-yolculuk')
          if (flagship) {
            articles.unshift(flagship)
            saveArticles()
          }
        }
        return
      }
    }
  } catch (err) {
    console.warn('[store] load failed', err.message)
  }
  articles = ensureSlugs([...SEED_ARTICLES]).sort(
    (a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt),
  )
  saveArticles()
}

loadArticles()

function publishedOnly(list = articles) {
  return list.filter((a) => a.status !== 'draft')
}

export function listArticles({ includeDrafts = false } = {}) {
  const list = includeDrafts ? articles : publishedOnly()
  return list.map(attachEngagement)
}

export function getArticle(idOrSlug, { includeDrafts = false } = {}) {
  const list = includeDrafts ? articles : publishedOnly()
  const item =
    list.find((a) => a.id === idOrSlug || a.slug === idOrSlug) || null
  return item ? attachEngagement(item) : null
}

export function getRelatedArticles(id, limit = 6) {
  const current = articles.find((a) => a.id === id || a.slug === id)
  if (!current) return []
  return publishedOnly()
    .filter((a) => a.id !== current.id)
    .map((a) => ({ article: a, score: relatedScore(current, a) }))
    .sort(
      (a, b) =>
        b.score - a.score ||
        Date.parse(b.article.publishedAt) - Date.parse(a.article.publishedAt),
    )
    .slice(0, limit)
    .map(({ article: a }) => attachEngagement(a))
}

export function getTrending(limit = 10) {
  return publishedOnly()
    .map(attachEngagement)
    .sort((a, b) => b.views + b.likes * 3 - (a.views + a.likes * 3))
    .slice(0, limit)
}

export function upsertArticle(raw) {
  const existing = raw.id ? articles.find((a) => a.id === raw.id) : null
  const slug = uniqueSlug(raw.slug || raw.title, existing?.id)
  const item = article({
    ...existing,
    ...raw,
    id: existing?.id || raw.id,
    slug,
    publishedAt: raw.publishedAt || existing?.publishedAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    aiGenerated: raw.aiGenerated ?? existing?.aiGenerated ?? true,
  })
  const idx = articles.findIndex((a) => a.id === item.id)
  if (idx >= 0) articles[idx] = item
  else articles.unshift(item)
  articles.sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
  saveArticles()
  return attachEngagement(item)
}

export function deleteArticle(idOrSlug) {
  const idx = articles.findIndex((a) => a.id === idOrSlug || a.slug === idOrSlug)
  if (idx < 0) return false
  articles.splice(idx, 1)
  saveArticles()
  return true
}

export function filterArticles({ category = 'tumu', q = '', includeDrafts = false } = {}) {
  const query = q.trim().toLowerCase()
  return (includeDrafts ? articles : publishedOnly())
    .filter((a) => {
      if (category && category !== 'tumu' && a.category !== category) return false
      if (!query) return true
      const hay = `${a.title} ${a.excerpt} ${a.tags.join(' ')} ${a.categoryLabel} ${a.author}`.toLowerCase()
      return hay.includes(query)
    })
    .map(attachEngagement)
}
