import type { ReactNode } from 'react'
import type { AppView } from '../SiteFooter'

type PageProps = {
  onBack: () => void
  onNavigate: (view: AppView) => void
}

function PageShell({
  title,
  children,
  onBack,
}: {
  title: string
  children: ReactNode
  onBack: () => void
}) {
  return (
    <article className="mx-auto max-w-2xl animate-rise px-4 py-2 md:px-8">
      <button
        type="button"
        onClick={onBack}
        className="mb-6 text-sm text-[rgba(216,239,232,0.55)] transition hover:text-[var(--volt)]"
      >
        ← Ana sayfa
      </button>
      <h1
        className="text-[clamp(2rem,5vw,2.75rem)] leading-tight tracking-[-0.03em] text-[var(--mist)]"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {title}
      </h1>
      <div className="mt-3 h-1 w-20 rounded-full bg-[var(--volt)]" />
      <div className="mt-8 space-y-4 text-[1rem] leading-relaxed text-[rgba(216,239,232,0.78)]">
        {children}
      </div>
    </article>
  )
}

export function AboutPage({ onBack, onNavigate }: PageProps) {
  return (
    <PageShell title="Hakkımızda" onBack={onBack}>
      <p>
        <strong className="text-[var(--mist)]">NABIZ</strong>, dünya haberlerinin nabzını canlı RSS
        akışlarından toplayan bir başlık panosudur. Amacımız hızlı, okunaklı ve telife saygılı bir
        özet deneyimi sunmaktır.
      </p>
      <p>
        Yalnızca yayıncıların kamuya açık RSS başlıkları ve kısa özetleri gösterilir; tam metin
        çoğaltılmaz. Yayıncı fotoğrafları kullanılmaz — her kayıt için özgün kategori kapağı
        üretilir. Okumak istediğinizde sizi orijinal kaynağa yönlendiririz.
      </p>
      <p>
        İçerik kaldırma veya telif talepleri için{' '}
        <button
          type="button"
          onClick={() => onNavigate('dmca')}
          className="text-[var(--volt)] underline-offset-2 hover:underline"
        >
          DMCA / Telif
        </button>{' '}
        sayfasını; genel sorularınız için{' '}
        <button
          type="button"
          onClick={() => onNavigate('iletisim')}
          className="text-[var(--volt)] underline-offset-2 hover:underline"
        >
          İletişim
        </button>{' '}
        sayfasını kullanın.
      </p>
    </PageShell>
  )
}

export function ContactPage({ onBack }: PageProps) {
  return (
    <PageShell title="İletişim" onBack={onBack}>
      <p>
        Sorularınız, geri bildirimleriniz veya işbirliği talepleriniz için bize yazabilirsiniz.
        Telif ve kaldırma talepleri için lütfen DMCA sayfasındaki süreci izleyin.
      </p>
      <ul className="space-y-3 rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-5 text-[0.95rem]">
        <li>
          <span className="block text-[0.72rem] uppercase tracking-[0.14em] text-[rgba(216,239,232,0.45)]">
            Genel
          </span>
          <a href="mailto:merhaba@nabiz.app" className="text-[var(--volt)] hover:underline">
            merhaba@nabiz.app
          </a>
        </li>
        <li>
          <span className="block text-[0.72rem] uppercase tracking-[0.14em] text-[rgba(216,239,232,0.45)]">
            Telif / DMCA
          </span>
          <a href="mailto:telif@nabiz.app" className="text-[var(--volt)] hover:underline">
            telif@nabiz.app
          </a>
        </li>
      </ul>
      <p className="text-sm text-[rgba(216,239,232,0.5)]">
        Haber kartlarındaki <em>Telif</em> butonu da ilgili kaydı otomatik doldurarak e-posta
        taslağı oluşturur.
      </p>
    </PageShell>
  )
}

export function DmcaPage({ onBack, onNavigate }: PageProps) {
  return (
    <PageShell title="DMCA / Telif bildirimi" onBack={onBack}>
      <p>
        NABIZ, üçüncü taraf yayıncıların kamuya açık RSS başlık ve kısa özetlerini gösterir; tam
        makale metni veya yayıncı fotoğrafları barındırılmaz. Yine de bir içeriğin yanlışlıkla
        listelendiğini veya haklarınızı ihlal ettiğini düşünüyorsanız bildirim gönderebilirsiniz.
      </p>
      <h2 className="pt-2 text-lg font-semibold text-[var(--mist)]" style={{ fontFamily: 'var(--font-display)' }}>
        Bildirimde bulunması gerekenler
      </h2>
      <ol className="list-decimal space-y-2 pl-5">
        <li>Hak sahibi veya yetkili temsilci olduğunuzu belirten imzalı beyan</li>
        <li>İhlal edildiğini iddia ettiğiniz eserin tanımı</li>
        <li>NABIZ üzerindeki ilgili kaydın başlığı ve kaynak URL’si</li>
        <li>İletişim bilgileriniz (ad, e-posta, adres)</li>
        <li>
          Bildirimin iyi niyetle yapıldığına ve yanlış beyanın yaptırımlara tabi olduğuna dair
          beyan
        </li>
      </ol>
      <p>
        Bildirimleri şu adrese gönderin:{' '}
        <a href="mailto:telif@nabiz.app" className="text-[var(--volt)] hover:underline">
          telif@nabiz.app
        </a>
        . Alternatif olarak ilgili haber kartındaki <em>Telif</em> butonunu kullanın.
      </p>
      <p>
        Geçerli bir bildirim alındığında ilgili kayıt makul sürede incelenir ve gerekirse
        listeden kaldırılır. Genel sorular için{' '}
        <button
          type="button"
          onClick={() => onNavigate('iletisim')}
          className="text-[var(--volt)] underline-offset-2 hover:underline"
        >
          İletişim
        </button>{' '}
        sayfasına bakın.
      </p>
    </PageShell>
  )
}
