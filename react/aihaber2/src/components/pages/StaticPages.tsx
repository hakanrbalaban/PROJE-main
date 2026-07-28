import type { ReactNode } from 'react'
import type { AppView } from '../../types'

const CONTACT = 'merhaba@ornek-domain.com'
const TELIF = 'telif@ornek-domain.com'

function PageShell({
  title,
  children,
  onBack,
  onNavigate,
}: {
  title: string
  children: ReactNode
  onBack: () => void
  onNavigate: (v: AppView) => void
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-6">
      <button
        type="button"
        onClick={onBack}
        className="mb-6 text-sm text-[var(--muted)] hover:text-[var(--teal)]"
      >
        ← Ana sayfa
      </button>
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-extrabold text-white sm:text-4xl">
        {title}
      </h1>
      <div className="prose-aiora mt-6">{children}</div>
      <div className="mt-10 flex flex-wrap gap-3 text-sm">
        {(
          [
            ['hakkimizda', 'Hakkımızda'],
            ['gizlilik', 'Gizlilik'],
            ['kvkk', 'KVKK'],
            ['cerez', 'Çerez'],
            ['yayin', 'Yayın standartları'],
            ['telif', 'Telif'],
            ['dmca', 'DMCA'],
            ['iletisim', 'İletişim'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            className="text-[var(--teal)]"
            onClick={() => onNavigate(id)}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}

export function AboutPage({
  onBack,
  onNavigate,
}: {
  onBack: () => void
  onNavigate: (v: AppView) => void
}) {
  return (
    <PageShell title="Hakkımızda" onBack={onBack} onNavigate={onNavigate}>
      <p>
        <strong>AİORA</strong>, editöryel öncelikli bir magazin blogudur. Teknoloji, yaşam, bilim,
        kültür, sağlık, seyahat, yemek, astroloji, din, eğitim, doğa, tasarım ve psikoloji
        alanlarında zamansız, özgün içerikler yayınlarız.
      </p>
      <h2>Editöryel model</h2>
      <p>
        Asıl hedefimiz kaliteli, insan gözünden geçmiş yazılardır. AI yalnızca taslak veya kapak
        desteği için kullanılabilir; yayın kararı editöre aittir. Otomatik yığın üretim
        AdSense/kalite politikamıza uygun değildir.
      </p>
      <h2>Neden haber, finans ve hukuk yok?</h2>
      <p>
        Güncel haber / ajans metinleri telif riski taşır. Finans ve hukuk konuları yanlış
        yönlendirme riski nedeniyle bilerek dışarıda bırakılır.
      </p>
    </PageShell>
  )
}

export function ContactPage({
  onBack,
  onNavigate,
}: {
  onBack: () => void
  onNavigate: (v: AppView) => void
}) {
  return (
    <PageShell title="İletişim" onBack={onBack} onNavigate={onNavigate}>
      <p>Öneri, iş birliği veya telif bildirimi için bize yazın.</p>
      <p>
        Genel: <strong>{CONTACT}</strong>
        <br />
        Telif: <strong>{TELIF}</strong>
      </p>
      <p className="text-sm opacity-80">
        Domain açtığınızda bu adresleri gerçek e-postanızla değiştirin (
        <code>CONTACT_EMAIL</code> / <code>COPYRIGHT_EMAIL</code>).
      </p>
      <p>
        Her yazının altındaki <em>Telif bildir</em> düğmesiyle de hızlı bildirim gönderebilirsiniz.
      </p>
      <h2>Yanıt süresi</h2>
      <p>Telif taleplerinde 48 saat içinde ilk dönüş hedeflenir.</p>
    </PageShell>
  )
}

export function CopyrightPage({
  onBack,
  onNavigate,
}: {
  onBack: () => void
  onNavigate: (v: AppView) => void
}) {
  return (
    <PageShell title="Telif & İçerik Politikası" onBack={onBack} onNavigate={onNavigate}>
      <p>AİORA içerikleri özgün editöryel / AI-destekli üretimdir.</p>
      <ul>
        <li>Haber ajansı RSS veya tam metin haber kopyalanmaz.</li>
        <li>Finans, ekonomi, borsa, yatırım veya hukuk içeriği üretilmez.</li>
        <li>Yayıncı fotoğrafları kullanılmaz; kapaklar AI veya lisanslı kaynaklardan gelir.</li>
        <li>Dini metinler kısa meal / genel anlam düzeyindedir; fetva niteliği taşımaz.</li>
      </ul>
      <h2>İhlal bildirimi</h2>
      <p>
        Telif hakkı sahibi olduğunuzu düşünüyorsanız DMCA sayfasındaki süreci izleyin veya yazı
        kartındaki bildirim düğmesini kullanın.
      </p>
    </PageShell>
  )
}

export function DmcaPage({
  onBack,
  onNavigate,
}: {
  onBack: () => void
  onNavigate: (v: AppView) => void
}) {
  return (
    <PageShell title="DMCA / Kaldırma Talebi" onBack={onBack} onNavigate={onNavigate}>
      <p>
        Telif ihlali iddiasında bulunuyorsanız aşağıdaki bilgileri <strong>{TELIF}</strong> adresine
        gönderin:
      </p>
      <ul>
        <li>Telif konusu eserin tanımı</li>
        <li>Sitedeki URL veya yazı başlığı</li>
        <li>İletişim bilgileriniz</li>
        <li>İyi niyet beyanı ve imza / ad-soyad</li>
      </ul>
      <p>
        Geçerli taleplerde ilgili içerik geçici olarak kaldırılır. AİORA, haber içeriği
        yayınlamayarak riski önceden azaltmayı tercih eder.
      </p>
    </PageShell>
  )
}

export function PrivacyPage({
  onBack,
  onNavigate,
}: {
  onBack: () => void
  onNavigate: (v: AppView) => void
}) {
  return (
    <PageShell title="Gizlilik Politikası" onBack={onBack} onNavigate={onNavigate}>
      <p>
        AİORA olarak gizliliğinize saygı duyarız. Bu sayfa, sitede hangi verilerin işlenebileceğini
        özetler. Domain ve reklam (ör. Google AdSense) eklediğinizde bu metni güncelleyin.
      </p>
      <h2>Toplanabilecek veriler</h2>
      <ul>
        <li>Teknik günlükler (IP, tarayıcı tipi — sunucu güvenliği)</li>
        <li>Çerez / yerel depolama (tercihler, ziyaretçi kimliği, çerez onayı)</li>
        <li>İletişim veya telif formu ile gönderdiğiniz bilgiler</li>
        <li>Reklam / ölçüm çerezleri (AdSense aktifse Google politikalarına tabi)</li>
      </ul>
      <h2>Amaç</h2>
      <p>Siteyi işletmek, güvenliği sağlamak, içerik deneyimini iyileştirmek, yasal yükümlülükleri yerine getirmek.</p>
      <h2>Haklarınız</h2>
      <p>
        KVKK kapsamında erişim, düzeltme, silme ve itiraz haklarınız için{' '}
        <strong>{CONTACT}</strong> adresine yazabilirsiniz. Detay: KVKK sayfası.
      </p>
      <h2>Üçüncü taraflar</h2>
      <p>
        Kapak görselleri veya analitik/reklam sağlayıcıları kendi gizlilik politikalarına tabidir.
        AdSense kullanırsanız Google’ın reklam çerezleri devreye girebilir.
      </p>
    </PageShell>
  )
}

export function KvkkPage({
  onBack,
  onNavigate,
}: {
  onBack: () => void
  onNavigate: (v: AppView) => void
}) {
  return (
    <PageShell title="KVKK Aydınlatma Metni" onBack={onBack} onNavigate={onNavigate}>
      <p>
        6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında, AİORA ziyaretçilerine yönelik
        aydınlatma özetidir. Veri sorumlusu: site işletmecisi (domain sahibi).
      </p>
      <h2>İşlenen veriler</h2>
      <p>
        İletişim/telif formunda paylaştığınız ad, e-posta, mesaj; teknik erişim kayıtları; çerez
        tercihleri.
      </p>
      <h2>Hukuki sebepler</h2>
      <p>
        Meşru menfaat, sözleşmenin ifası (iletişim talebi), açık rıza (isteğe bağlı çerezler) ve
        kanuni yükümlülük.
      </p>
      <h2>Başvuru</h2>
      <p>
        Taleplerinizi <strong>{CONTACT}</strong> adresine iletebilirsiniz. Yanıt süresi yasal
        süreler çerçevesindedir.
      </p>
    </PageShell>
  )
}

export function CookiePage({
  onBack,
  onNavigate,
}: {
  onBack: () => void
  onNavigate: (v: AppView) => void
}) {
  return (
    <PageShell title="Çerez Politikası" onBack={onBack} onNavigate={onNavigate}>
      <p>
        Çerezler, sitenin temel işlevleri ve (onayınızla) deneyim iyileştirmesi için kullanılabilir.
      </p>
      <h2>Zorunlu / işlevsel</h2>
      <ul>
        <li>Çerez onay tercihi</li>
        <li>Ziyaretçi etkileşim kimliği (beğeni/tepki için yerel)</li>
        <li>Editör oturum anahtarı (yalnızca editör cihazında)</li>
      </ul>
      <h2>Reklam / analitik (ileride)</h2>
      <p>
        Google AdSense veya benzeri araçlar eklendiğinde reklam ve ölçüm çerezleri Google
        politikalarına göre yönetilir. Kullanıcılar tarayıcı ayarlarından çerezleri silebilir.
      </p>
      <p>
        Daha fazla bilgi: <button type="button" className="text-[var(--teal)]" onClick={() => onNavigate('gizlilik')}>Gizlilik</button>
      </p>
    </PageShell>
  )
}

export function PublishingStandardsPage({
  onBack,
  onNavigate,
}: {
  onBack: () => void
  onNavigate: (v: AppView) => void
}) {
  return (
    <PageShell title="Yayın Standartları" onBack={onBack} onNavigate={onNavigate}>
      <p>
        AİORA, kaliteli ve güvenilir magazin içeriği hedefler. Bu standartlar AdSense ve okur
        güveni için rehberdir.
      </p>
      <h2>İçerik</h2>
      <ul>
        <li>Özgün, okunabilir, mümkünse insan editli yazılar</li>
        <li>Şablon / tekrarlayan otomatik yığın içerikten kaçınma</li>
        <li>Sağlık konularında “genel bilgilendirme” notu</li>
        <li>Haber, finans, hukuk kategorisi yok</li>
      </ul>
      <h2>Şeffaflık</h2>
      <ul>
        <li>Yazar adı görünür</li>
        <li>AI kullanımı belirtilir</li>
        <li>Telif ve kaldırma süreci açıktır</li>
      </ul>
      <h2>Yayın ritmi</h2>
      <p>
        Az ama kaliteli yayın tercih edilir. Editör paneli ile elle ekleme birincil yoldur.
      </p>
    </PageShell>
  )
}
