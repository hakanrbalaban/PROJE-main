const ZODIAC = [
  { id: 'koc', label: 'Koç', range: '21 Mar – 19 Nis' },
  { id: 'boga', label: 'Boğa', range: '20 Nis – 20 May' },
  { id: 'ikizler', label: 'İkizler', range: '21 May – 20 Haz' },
  { id: 'yengec', label: 'Yengeç', range: '21 Haz – 22 Tem' },
  { id: 'aslan', label: 'Aslan', range: '23 Tem – 22 Ağu' },
  { id: 'basak', label: 'Başak', range: '23 Ağu – 22 Eyl' },
  { id: 'terazi', label: 'Terazi', range: '23 Eyl – 22 Eki' },
  { id: 'akrep', label: 'Akrep', range: '23 Eki – 21 Kas' },
  { id: 'yay', label: 'Yay', range: '22 Kas – 21 Ara' },
  { id: 'oglak', label: 'Oğlak', range: '22 Ara – 19 Oca' },
  { id: 'kova', label: 'Kova', range: '20 Oca – 18 Şub' },
  { id: 'balik', label: 'Balık', range: '19 Şub – 20 Mar' },
]

const HOROSCOPE_LINES = [
  'Küçük bir düzenleme günü: masanı toparla, zihin de netleşsin.',
  'İletişimde netlik kazandırır. Kısa ve nazik mesajlar yeğlenir.',
  'Enerjin dalgalı olabilir; kısa yürüyüş denge getirir.',
  'Öğrenme isteğin yüksek. 20 dakikalık odak bloğu yeterli.',
  'İlişkilerde dinlemek, konuşmaktan daha değerli.',
  'Planlarını sadeleştir; acele karar yerine kısa bir mola ver.',
  'Yaratıcı bir kıvılcım var — taslak tut, mükemmeli bekleme.',
  'Dinlenme de üretkenliktir. Erken kapanış düşün.',
  'Eski bir planı gözden geçir; sadeleştirmek güç katabilir.',
  'Teşekkür etmek kapıları yumuşatır. Birine yaz.',
]

const QUOTES = [
  { text: 'Bilgi, paylaşıldıkça çoğalır.', author: 'Anonim' },
  { text: 'Yavaşlamak bazen en hızlı yoldur.', author: 'AİORA' },
  { text: 'Küçük alışkanlıklar, büyük karakterler örer.', author: 'AİORA' },
  { text: 'Merak, öğrenmenin yakıtıdır.', author: 'Anonim' },
  { text: 'Sadeleşmek, cesaret ister.', author: 'AİORA' },
  { text: 'Bugünün işini yarına bırakma; ama bugünü de tüketme.', author: 'Anonim' },
  { text: 'Dinlemek, saygının en sessiz biçimidir.', author: 'AİORA' },
  { text: 'Doğa acele etmez, yine de her şey tamamlanır.', author: 'Lao Tzu (özet)' },
]

const HADITHS = [
  {
    text: 'Kolaylaştırınız, zorlaştırmayınız; müjdeleyiniz, nefret ettirmeyiniz.',
    source: 'Buhârî & Müslim — genel anlam',
  },
  {
    text: 'Mümin, insanların kendisinden emin olduğu kimsedir.',
    source: 'Tirmizî — genel anlam',
  },
  {
    text: 'Temizlik imandandır.',
    source: 'Müslim — genel anlam',
  },
  {
    text: 'İnsanların en hayırlısı, insanlara en faydalı olandır.',
    source: 'Taberânî — genel anlam',
  },
]

const VERSES = [
  {
    text: 'Şüphesiz zorlukla beraber bir kolaylık vardır.',
    ref: 'İnşirâh 94/6 — meal özeti',
  },
  {
    text: 'Rabbinizin nimetini anlat.',
    ref: 'Duhâ 93/11 — meal özeti',
  },
  {
    text: 'Sabredenleri müjdele.',
    ref: 'Bakara 2/155 — meal özeti',
  },
  {
    text: 'Allah, sabredenlerle beraberdir.',
    ref: 'Bakara 2/153 — meal özeti',
  },
]

const FUN_FACTS = [
  'Balinaların şarkıları okyanusta yüzlerce kilometre yol alabilir.',
  'Bir ağaç, ömrü boyunca tonlarca karbon dioksiti bünyesinde tutabilir.',
  'Octopus’ların üç kalbi vardır.',
  'Balın “son kullanma tarihi” pratikte yoktur; uygun saklanırsa çok uzun süre kalır.',
  'Gökkuşağı aslında tam bir dairedir; yerden yarım görünür.',
]

const WORDS = [
  { word: 'Meraki', meaning: 'Bir işi gönülden, özenle yapmak (Japonca kökenli kullanım).' },
  { word: 'Hygge', meaning: 'Sıcak, rahat, güvenli bir atmosfer yaratma hali.' },
  { word: 'Ikigai', meaning: 'Yaşam nedeni; tutku, meslek, misyon ve meslek kesişimi.' },
  { word: 'Sabr', meaning: 'Zorluk karşısında dengeyi koruma erdemi.' },
  { word: 'Tezekkür', meaning: 'Düşünerek hatırlamak, bilinçle fark etmek.' },
]

function dayIndex(len) {
  const d = new Date()
  const key = d.getFullYear() * 1000 + d.getMonth() * 50 + d.getDate()
  return key % len
}

function seededShuffle(seed, arr) {
  const copy = [...arr]
  let s = seed
  for (let i = copy.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff
    const j = s % (i + 1)
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

async function fetchJson(url, timeout = 10000) {
  const controller = new AbortController()
  const t = setTimeout(() => controller.abort(), timeout)
  try {
    const res = await fetch(url, { signal: controller.signal })
    if (!res.ok) throw new Error(String(res.status))
    return await res.json()
  } finally {
    clearTimeout(t)
  }
}

export async function getWeather() {
  try {
    const data = await fetchJson(
      'https://api.open-meteo.com/v1/forecast?latitude=41.0082&longitude=28.9784&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=Europe%2FIstanbul',
    )
    const c = data.current
    return {
      city: 'İstanbul',
      temperature: c.temperature_2m,
      humidity: c.relative_humidity_2m,
      wind: c.wind_speed_10m,
      code: c.weather_code,
      unit: data.current_units?.temperature_2m || '°C',
      source: 'Open-Meteo',
    }
  } catch {
    return {
      city: 'İstanbul',
      temperature: 18,
      humidity: 65,
      wind: 12,
      code: 2,
      unit: '°C',
      source: 'önbellek',
      offline: true,
    }
  }
}

export async function getCurrency() {
  try {
    const data = await fetchJson('https://open.er-api.com/v6/latest/USD')
    const rates = data.rates || {}
    return {
      base: 'USD',
      updated: data.time_last_update_utc || null,
      pairs: [
        { code: 'TRY', value: rates.TRY, label: 'Dolar / TL' },
        { code: 'EUR', value: rates.EUR ? rates.TRY / rates.EUR : null, label: 'Euro / TL' },
        { code: 'GBP', value: rates.GBP ? rates.TRY / rates.GBP : null, label: 'Sterlin / TL' },
      ].map((p) => ({
        ...p,
        value: p.value ? Number(p.value.toFixed(2)) : null,
      })),
      source: 'ExchangeRate-API',
    }
  } catch {
    return {
      base: 'USD',
      pairs: [
        { code: 'TRY', value: 34.5, label: 'Dolar / TL' },
        { code: 'EUR', value: 37.2, label: 'Euro / TL' },
        { code: 'GBP', value: 43.8, label: 'Sterlin / TL' },
      ],
      source: 'önbellek',
      offline: true,
    }
  }
}

export async function getMarkets() {
  // Ücretsiz, anahtar gerektirmeyen gösterge — eğitici örnek değerler + canlı kur ile harman
  const currency = await getCurrency()
  const tryRate = currency.pairs.find((p) => p.code === 'TRY')?.value || 34
  const wave = Math.sin(Date.now() / 3.6e6) * 0.4
  return {
    note: 'Gösterge niteliğindedir; yatırım tavsiyesi değildir.',
    items: [
      { symbol: 'USD/TRY', name: 'Dolar', value: tryRate, change: Number((wave * 0.3).toFixed(2)) },
      { symbol: 'XAU', name: 'Altın (gösterge)', value: Number((tryRate * 78 + wave * 20).toFixed(0)), change: Number((wave * 0.5).toFixed(2)) },
      { symbol: 'BIST', name: 'BIST 100 (sim)', value: Number((9200 + wave * 40).toFixed(0)), change: Number((wave * 0.8).toFixed(2)) },
      { symbol: 'BTC', name: 'Bitcoin (gösterge)', value: Number((65000 + wave * 400).toFixed(0)), change: Number((wave * 1.2).toFixed(2)) },
    ],
    source: 'AİORA gösterge',
  }
}

function approxPrayerTimes(date = new Date()) {
  // İstanbul için kabaca mevsimsel ofset — eğitimsel widget
  const month = date.getMonth()
  const summer = month >= 4 && month <= 8
  const base = summer
    ? { imsak: '04:05', gunes: '05:45', ogle: '13:15', ikindi: '17:10', aksam: '20:25', yatsi: '21:55' }
    : { imsak: '06:20', gunes: '07:50', ogle: '13:10', ikindi: '15:40', aksam: '17:55', yatsi: '19:20' }
  return {
    city: 'İstanbul',
    date: date.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' }),
    times: base,
    note: 'Yaklaşık saatlerdir; kesin vakit için Diyanet kaynaklarını kullanın.',
  }
}

export async function getWidgets() {
  const d = dayIndex(1000)
  const [weather, currency, markets] = await Promise.all([getWeather(), getCurrency(), getMarkets()])

  const horoscopes = seededShuffle(d + 7, ZODIAC).map((z, i) => ({
    ...z,
    text: HOROSCOPE_LINES[(d + i) % HOROSCOPE_LINES.length],
  }))

  return {
    updatedAt: new Date().toISOString(),
    quote: QUOTES[dayIndex(QUOTES.length)],
    hadith: HADITHS[dayIndex(HADITHS.length)],
    verse: VERSES[dayIndex(VERSES.length)],
    funFact: FUN_FACTS[dayIndex(FUN_FACTS.length)],
    word: WORDS[dayIndex(WORDS.length)],
    horoscopes,
    weather,
    currency,
    markets,
    prayer: approxPrayerTimes(),
    religiousTip: {
      title: 'Günün manevi notu',
      text: [
        'Bir iyilik niyeti, günü yumuşatır.',
        'Şükür listesine üç madde ekleyin.',
        'Sessizlikte iki dakika tefekkür deneyin.',
        'Komşunuza selam vermek küçük bir sünnet-i seniyyedir (genel hatırlatma).',
      ][dayIndex(4)],
    },
  }
}
