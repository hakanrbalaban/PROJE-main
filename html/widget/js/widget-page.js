(() => {
  const cardWrap = document.getElementById("detailCardWrap");
  const guideEl = document.getElementById("detailGuide");
  const titleEl = document.getElementById("widgetTitle");
  const metaEl = document.getElementById("widgetMeta");
  const toast = document.getElementById("toast");
  const dateEl = document.getElementById("detailDate");
  const similarEl = document.getElementById("detailSimilar");

  const params = new URLSearchParams(window.location.search);
  const body = document.body;
  const basePath = (body?.dataset?.basePath || ".").replace(/\/+$/, "");
  const explicitId = body?.dataset?.widgetId;
  const pathId = location.pathname.split("/").pop()?.replace(/\.html$/i, "");
  const widgetId = explicitId || params.get("id") || (pathId && pathId !== "widget" ? pathId : null);

  const bankCache = {};
  let toastTimer;

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }

  function esc(str) {
    return String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function dayOfYear(date = new Date()) {
    const start = new Date(date.getFullYear(), 0, 0);
    return Math.floor((date - start) / 86400000);
  }

  function yearProgress() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const end = new Date(now.getFullYear() + 1, 0, 0);
    return Math.min(100, Math.round(((now - start) / (end - start)) * 1000) / 10);
  }

  function daysUntilWeekend() {
    const d = new Date().getDay();
    if (d === 0 || d === 6) return 0;
    return 6 - d;
  }

  function itemText(item) {
    return item?.metin || item?.ekstra || "";
  }

  async function loadBank(name) {
    if (!name) return [];
    if (bankCache[name]) return bankCache[name];
    const res = await fetch(`${basePath}/data/banks/${name}.json`);
    if (!res.ok) return [];
    bankCache[name] = await res.json();
    return bankCache[name];
  }

  function pickBankItem(list, day) {
    if (!Array.isArray(list) || !list.length) return null;
    return list[(day - 1) % list.length];
  }

  function longGuide(widget) {
    const type = widget.type || "";
    const title = widget.title || "Widget";
    const category = widget.cat || "genel";

    const specific = {
      "profit-loss-calc": [
        "Alış ve satış tutarını sayı olarak girin.",
        "Hesapla butonuna basın; kar/zarar tutarı ve oranı görünür.",
        "Sonuç negatifse zarar, pozitifse kardır."
      ],
      "break-even-calc": [
        "Sabit gider, birim satış fiyatı ve birim maliyeti girin.",
        "Sistem başa baş satış adedini hesaplar.",
        "Birim fiyat birim maliyetten küçük/eşitse başa baş oluşmaz."
      ],
      "compound-interest": [
        "Anapara, yıllık faiz oranı ve süreyi girin.",
        "Bileşik faiz formülü ile toplam değer hesaplanır.",
        "Uzun vadeli planlarda farklı senaryoları kıyaslayın."
      ],
      "calorie-calc": [
        "Cinsiyet, yaş, boy ve kilo bilgisini girin.",
        "BMR ve yaklaşık TDEE değeri üretilir.",
        "Bu değerler tahminidir; kişisel sağlık danışmanlığı yerine geçmez."
      ],
      "geometry-calc": [
        "Şekli seçin, ilgili boyutları doldurun.",
        "Alan ve çevre birlikte hesaplanır.",
        "Dairede `a` yarıçap olarak kullanılır."
      ],
      "time-diff": [
        "İki saat değeri girin.",
        "Sistem saat farkını saat/dakika formatında hesaplar.",
        "Geceyi aşan farklar otomatik desteklenir."
      ],
      "todo-list": [
        "Yeni görev yazıp `+` ile ekleyin.",
        "Tamamlanan görevi sil butonu ile kaldırın.",
        "Liste tarayıcıda yerel olarak saklanır."
      ],
      "qibla-compass": [
        "Cihaz yön sensörü destekliyorsa pusula dinamik döner.",
        "Destek yoksa sabit açı bilgisi gösterilir.",
        "Mobil cihazlarda yön iznine ihtiyaç olabilir."
      ],
      "qr-generator": [
        "Metin veya URL girin ve `Oluştur` butonuna basın.",
        "QR desen görseli kart içinde üretilir.",
        "Hızlı paylaşım için metni kopyalayabilirsiniz."
      ]
    };

    const steps = specific[type] || [
      "Widget içindeki gerekli alanları doldurun.",
      "Hesapla / Üret / Başlat gibi butonları kullanın.",
      "Sonucu aynı kart içinde anlık olarak takip edin."
    ];

    const tips = [
      "Girdi alanlarında sadece sayısal değer gerekiyorsa sayı kullanın.",
      "Widget sonuçları hızlı karar desteği içindir; kritik kararlar için doğrulama yapın.",
      "Aynı widgetı farklı değerlerle tekrar kullanarak karşılaştırma yapabilirsiniz."
    ];

    return `
      <h2>${esc(title)} Rehberi</h2>
      <p><strong>Kategori:</strong> ${esc(category)} · <strong>Tür:</strong> ${esc(type)}</p>

      <h3>Nasıl Kullanılır?</h3>
      <ul>${steps.map((s) => `<li>${esc(s)}</li>`).join("")}</ul>

      <h3>İpuçları</h3>
      <ul>${tips.map((s) => `<li>${esc(s)}</li>`).join("")}</ul>

      <h3>Kısa Not</h3>
      <p>Bu widget tamamen yerel çalışır; harici font CDN’i veya zorunlu dış API yoktur. İçerik özgün metin bankalarından gelir (MIT).</p>
    `;
  }

  function faqForWidget(widget) {
    const title = widget.title || "Widget";
    return [
      {
        q: `${title} nasıl kullanılır?`,
        a: "Widget içindeki alanları doldurup ilgili butona basın. Sonuç anında kart içinde görüntülenir.",
      },
      {
        q: "Bu widget özgün mü? Nasıl lisanslanır?",
        a: "Evet — özgün yerel kod ve metin. Embed/kopyalama MIT Lisansı ile serbesttir; kaynak bildirimi korunmalıdır. Harici font CDN’i veya zorunlu dış API yoktur.",
      },
      {
        q: "Mobilde çalışır mı?",
        a: "Evet. BalabanWidgets responsive tasarımla mobil, tablet ve masaüstünde çalışacak şekilde geliştirilmiştir.",
      },
    ];
  }

  function injectSeoSchema(widget) {
    const canonical = `https://widgets.trportal.com.tr/widgets/${widget.id}.html`;
    const faqItems = faqForWidget(widget);

    const breadcrumb = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Ana Sayfa", item: "https://widgets.trportal.com.tr/" },
        { "@type": "ListItem", position: 2, name: "Widget Galerisi", item: "https://widgets.trportal.com.tr/index.html" },
        { "@type": "ListItem", position: 3, name: widget.title, item: canonical },
      ],
    };

    const faq = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqItems.map((it) => ({
        "@type": "Question",
        name: it.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: it.a,
        },
      })),
    };

    const widgetSchema = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: widget.title,
      applicationCategory: "WebApplication",
      operatingSystem: "Web Browser",
      url: canonical,
      description: `${widget.title} için canlı örnek ve kullanım rehberi.`,
      creator: {
        "@type": "Organization",
        name: "BalabanWidgets",
      },
    };

    [breadcrumb, faq, widgetSchema].forEach((obj) => {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.textContent = JSON.stringify(obj);
      document.head.appendChild(script);
    });
  }

  function renderSimilarWidgets(catalog, currentWidget) {
    if (!similarEl) return;
    const sameCategory = catalog.widgets.filter((w) => w.cat === currentWidget.cat && w.id !== currentWidget.id);
    const fallback = catalog.widgets.filter((w) => w.id !== currentWidget.id);
    const pool = (sameCategory.length ? sameCategory : fallback).slice(0, 8);

    if (!pool.length) {
      similarEl.innerHTML = "";
      return;
    }

    similarEl.innerHTML = `
      <h3>Benzer Widgetlar</h3>
      <div class="similar-links">
        ${pool
          .map(
            (w) =>
              `<a href="${basePath}/widgets/${encodeURIComponent(w.id)}.html">${esc(w.title)}</a>`
          )
          .join("")}
      </div>
    `;
  }

  function buildCard(widget, item) {
    const card = document.createElement("article");
    card.className = `widget-card theme-${widget.theme || "coral"}`;
    card.dataset.widgetId = widget.id;
    card.innerHTML = `
      <div class="widget-card__accent"></div>
      <div class="widget-card__body">
        <div class="widget-card__meta">
          <div class="widget-card__icon">${esc(widget.icon || "◆")}</div>
          <div>
            <h3 class="widget-card__title">${esc(widget.title)}</h3>
            <p class="widget-card__cat">${esc(widget.cat || "genel")} · ${esc(widget.type || "text")}</p>
          </div>
        </div>
        <div class="widget-stage">${window.BWEngine.render(widget, item, {
          day: dayOfYear(),
          esc,
          yearProgress: yearProgress(),
          daysUntilWeekend: daysUntilWeekend(),
        })}</div>
      </div>
      <div class="widget-card__actions">
        <button type="button" class="btn btn-copy" data-action="copy-widget">Sonucu Kopyala</button>
        <a class="btn btn-link" href="${basePath}/index.html">Galeriye Dön</a>
      </div>
    `;

    card.querySelector('[data-action="copy-widget"]').addEventListener("click", async () => {
      const ok = await copyText(`${widget.title}\n${itemText(item)}`);
      showToast(ok ? "Kopyalandı" : "Kopyalanamadı");
    });

    window.BWEngine.bind(card, widget, { showToast, copyText });
    return card;
  }

  async function init() {
    dateEl.textContent = new Date().toLocaleDateString("tr-TR", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    });

    if (!widgetId) {
      titleEl.textContent = "Widget bulunamadı";
      metaEl.textContent = "URL parametresi eksik.";
      guideEl.innerHTML = "<h2>Hata</h2><p>Lütfen galeriye dönüp bir widget seçin.</p>";
      return;
    }

    const res = await fetch(`${basePath}/data/catalog.json`);
    const catalog = await res.json();
    const widget = catalog.widgets.find((w) => w.id === widgetId);

    if (!widget) {
      titleEl.textContent = "Widget bulunamadı";
      metaEl.textContent = `ID: ${widgetId}`;
      guideEl.innerHTML = "<h2>Hata</h2><p>Bu kimliğe ait widget bulunamadı.</p>";
      return;
    }

    let item = { metin: widget.title, kaynak: "BalabanWidgets" };
    if (widget.bank) {
      const bank = await loadBank(widget.bank);
      item = pickBankItem(bank, dayOfYear()) || item;
    }

    titleEl.textContent = widget.title;
    metaEl.textContent = `${widget.cat} · ${widget.type} · ${widget.id}`;
    document.title = `${widget.title} | BalabanWidgets`;
    const desc = `BalabanWidgets ${widget.title} widget detay sayfası, kullanım rehberi ve canlı örnek.`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", desc);
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute("href", `https://widgets.trportal.com.tr/widgets/${widget.id}.html`);
    guideEl.innerHTML = longGuide(widget);
    renderSimilarWidgets(catalog, widget);
    cardWrap.appendChild(buildCard(widget, item));
    injectSeoSchema(widget);
    window.BWEngine.startGlobal();
  }

  init().catch((err) => {
    titleEl.textContent = "Yükleme hatası";
    metaEl.textContent = String(err.message || err);
  });
})();
