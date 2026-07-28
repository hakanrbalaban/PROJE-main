(() => {
  const grid = document.getElementById("widgetGrid");
  const dateBadge = document.getElementById("dateBadge");
  const catFilters = document.getElementById("catFilters");
  const searchInput = document.getElementById("searchInput");
  const resultCount = document.getElementById("resultCount");
  const modal = document.getElementById("embedModal");
  const embedCode = document.getElementById("embedCode");
  const copyEmbedBtn = document.getElementById("copyEmbedBtn");
  const toast = document.getElementById("toast");

  const bankCache = {};
  let catalog = null;
  let activeCat = "all";
  let toastTimer;

  const day = dayOfYear(new Date());

  function dayOfYear(date) {
    const start = new Date(date.getFullYear(), 0, 0);
    return Math.floor((date - start) / 86400000);
  }

  function formatDateTR(date = new Date()) {
    return date.toLocaleDateString("tr-TR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

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
      const area = document.createElement("textarea");
      area.value = text;
      area.style.position = "fixed";
      area.style.left = "-9999px";
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand("copy");
      area.remove();
      return ok;
    }
  }

  function escapeHtml(str) {
    return String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function pickBankItem(list) {
    if (!Array.isArray(list) || !list.length) return { metin: "İçerik yok", kaynak: "" };
    return list[(day - 1) % list.length];
  }

  async function loadBank(name) {
    if (!name) return null;
    if (bankCache[name]) return bankCache[name];
    const res = await fetch(`data/banks/${name}.json`);
    if (!res.ok) throw new Error(name);
    bankCache[name] = await res.json();
    return bankCache[name];
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
    if (!item) return "";
    return item.metin || item.ekstra || "";
  }

  const ctx = () => ({
    day,
    esc: escapeHtml,
    yearProgress: yearProgress(),
    daysUntilWeekend: daysUntilWeekend(),
  });

  function usageGuide(widget) {
    const type = widget.type || "";
    const map = {
      "profit-loss-calc": "Alış ve satış fiyatını girip kar/zararı anında görün.",
      "break-even-calc": "Sabit gider, birim fiyat ve maliyet girerek başa baş adedini hesaplayın.",
      "commission-calc": "Tutar ve komisyon oranı girin; komisyon ve net tutar hesaplanır.",
      "installment-split": "Toplam tutarı taksit sayısına bölerek aylık ödeme görün.",
      "budget-503020": "Aylık geliri girin; ihtiyaç/istek/birikim dağılımını alın.",
      "simple-interest": "Anapara, oran, yıl girerek basit faiz sonucunu öğrenin.",
      "compound-interest": "Anapara, oran ve yıl ile bileşik getiriyi hesaplayın.",
      "pomodoro": "Başlat ile 25/5 döngüsünü çalıştırın; mola ve çalışma otomatik değişir.",
      "countdown": "Hedef tarih/saat seçin; kalan süre canlı olarak güncellenir.",
      "stopwatch": "Başlat, duraklat ve sıfırla ile süre takibi yapın.",
      "world-clocks": "Farklı şehir saatleri otomatik güncellenir.",
      "age-calc": "Doğum tarihi girerek yaşınızı hesaplayın.",
      "date-diff": "İki tarih arasındaki toplam gün farkını görün.",
      "workdays-calc": "Tarih aralığındaki hafta içi gün sayısını hesaplayın.",
      "bmi-calc": "Boy ve kilo girerek BMI değerini öğrenin.",
      "water-intake": "Kilonuza göre yaklaşık günlük su ihtiyacını görün.",
      "calorie-calc": "Yaş, boy, kilo ve cinsiyet ile BMR/TDEE tahmini alın.",
      "grade-average": "Notları virgülle girerek ortalamayı hesaplayın.",
      "weighted-average": "Notlar ve ağırlıkları girerek ağırlıklı ortalamayı bulun.",
      "gcd-lcm": "İki sayı girin; EBOB ve EKOK birlikte hesaplanır.",
      "linear-equation": "ax+b=0 denklemi için a ve b değerlerini girin.",
      "geometry-calc": "Şekil seçip alan/çevre değerlerini hesaplayın.",
      "char-counter": "Yazdıkça karakter ve kelime sayısı anlık güncellenir.",
      "slug-generator": "Başlık girin; SEO uyumlu slug otomatik üretilir.",
      "password-generator": "Uzunluk seçin ve güvenli parola üretin.",
      "uuid-generator": "Tek tıkla benzersiz UUID üretip kopyalayın.",
      "contrast-checker": "Ön/arka plan rengi seçip kontrast oranını kontrol edin.",
      "text-diff": "İki metni satır satır karşılaştırın.",
      "cm-inch": "cm değeri girin; inch karşılığını anında görün.",
      "kg-lb": "kg girin; lb dönüşümü otomatik hesaplanır.",
      "c-f": "Santigrat/Fahrenheit dönüşümünü canlı yapın.",
      "km-mile": "km girerek mil karşılığını hesaplayın.",
      "byte-converter": "Byte değerini KB/MB/GB olarak görün.",
      "time-diff": "İki saat seçip aradaki süreyi hh:mm formatında alın.",
      "zikir-counter": "+ ve - ile sayaç yönetin, sıfırla ile temizleyin.",
      "qibla-compass": "Cihaz yön izni varsa kıble yönü dinamik döner.",
      "todo-list": "Öğe ekleyin, tamamladıklarınızı kaldırın; veriler tarayıcıda saklanır.",
      "daily-checklist": "Günlük maddeler ekleyip işaretleyin; yerelde kalır.",
      "quick-notes": "Notlarınızı kaydedin; aynı tarayıcıda korunur.",
      "mini-quiz": "Seçeneklerden birini seçerek hızlı test yapın.",
      "qr-generator": "Metin/URL girin, QR üretin ve metni hızlı kopyalayın.",
    };

    if (map[type]) return map[type];
    if (type.includes("calc") || type.includes("converter")) return "Gerekli alanları doldurup hesapla; sonuç kart içinde anında görünür.";
    if (type.includes("counter") || type.includes("timer")) return "Başlat/durdur kontrolleri ile sayacı yönetin; sonuç canlı güncellenir.";
    return "Kart içindeki alanları doldurun veya butonları kullanın; sonuç anında güncellenir.";
  }

  function buildEmbed(widget, item) {
    const text = itemText(item) || widget.title;
    const c1 = item?.renk1 || "#FF4D6D";
    const c2 = item?.renk2 || "#FF8C42";
    return `<!-- BalabanWidgets: ${widget.title} -->
<div style="max-width:340px;font-family:system-ui,sans-serif;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;background:#fff;box-shadow:0 12px 30px rgba(15,23,42,.1)">
  <div style="height:6px;background:linear-gradient(90deg,${c1},${c2})"></div>
  <div style="padding:16px">
    <div style="font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.04em;margin-bottom:6px">${escapeHtml(widget.title)}</div>
    <div style="font-size:16px;line-height:1.45;color:#0f172a">${escapeHtml(text)}</div>
    <div style="margin-top:10px;font-size:11px;color:#94a3b8">BalabanWidgets · yerel widget</div>
  </div>
</div>`;
  }

  function createCard(widget, item) {
    const card = document.createElement("article");
    const fx = widget.effect ? ` fx-${widget.effect}` : "";
    const featured = widget.featured ? " widget-card--featured" : "";
    card.className = `widget-card theme-${widget.theme || "coral"}${fx}${featured}`;
    card.dataset.id = widget.id;
    card.dataset.widgetId = widget.id;
    card.dataset.cat = widget.cat;
    card.dataset.title = widget.title.toLowerCase();

    const catName = catalog.categories.find((c) => c.id === widget.cat)?.name || widget.cat;
    const stageHtml = window.BWEngine.render(widget, item, ctx());

    card.innerHTML = `
      <div class="widget-card__accent"></div>
      <div class="widget-card__body">
        <div class="widget-card__meta">
          <div class="widget-card__icon">${escapeHtml(widget.icon || "◆")}</div>
          <div>
            <h3 class="widget-card__title">${escapeHtml(widget.title)}${widget.featured ? ' <span class="featured-badge">Öne çıkan</span>' : ""}</h3>
            <p class="widget-card__cat">${escapeHtml(catName)} · ${widget.local ? "yerel" : escapeHtml(widget.type)}</p>
          </div>
        </div>
        <div class="widget-stage">${stageHtml}</div>
        <details class="widget-guide">
          <summary>Kullanım Rehberi</summary>
          <p>${escapeHtml(usageGuide(widget))}</p>
        </details>
      </div>
      <div class="widget-card__actions">
        <button type="button" class="btn btn-copy" data-action="copy">Kopyala</button>
        <button type="button" class="btn btn-secondary" data-action="embed">HTML Kodunu Al</button>
        <a class="btn btn-link" href="widgets/${encodeURIComponent(widget.id)}.html">Detaylı Rehber</a>
      </div>`;

    card.querySelector('[data-action="copy"]').addEventListener("click", async () => {
      const payload = `${widget.title}\n${itemText(item) || widget.title}\n— BalabanWidgets`;
      showToast((await copyText(payload)) ? "Panoya kopyalandı" : "Kopyalanamadı");
    });

    card.querySelector('[data-action="embed"]').addEventListener("click", () => {
      embedCode.value = buildEmbed(widget, item);
      modal.hidden = false;
      document.body.style.overflow = "hidden";
    });

    window.BWEngine.bind(card, widget, { showToast, copyText });
    return card;
  }

  function applyFilter() {
    const q = searchInput.value.trim().toLowerCase();
    let visible = 0;
    grid.querySelectorAll(".widget-card").forEach((card) => {
      const catOk = activeCat === "all" || card.dataset.cat === activeCat;
      const qOk = !q || card.dataset.title.includes(q) || card.dataset.cat.includes(q);
      const show = catOk && qOk;
      card.classList.toggle("hidden", !show);
      if (show) visible += 1;
    });
    resultCount.textContent = `${visible} / ${catalog.widgets.length} widget`;
  }

  function renderFilters() {
    const allBtn = document.createElement("button");
    allBtn.type = "button";
    allBtn.className = "cat-btn active";
    allBtn.textContent = "Tümü";
    allBtn.addEventListener("click", () => {
      activeCat = "all";
      [...catFilters.children].forEach((b) => b.classList.remove("active"));
      allBtn.classList.add("active");
      applyFilter();
    });
    catFilters.appendChild(allBtn);

    catalog.categories.forEach((cat) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "cat-btn";
      btn.textContent = cat.name;
      btn.addEventListener("click", () => {
        activeCat = cat.id;
        [...catFilters.children].forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        applyFilter();
      });
      catFilters.appendChild(btn);
    });
  }

  async function init() {
    if (!window.BWEngine) throw new Error("BWEngine yüklenemedi");

    dateBadge.textContent = `${formatDateTR()} · gün ${day}`;

    const res = await fetch("data/catalog.json");
    catalog = await res.json();
    renderFilters();

    const uniqueBanks = [...new Set(catalog.widgets.map((w) => w.bank).filter(Boolean))];
    await Promise.all(uniqueBanks.map((b) => loadBank(b).catch(() => null)));

    grid.innerHTML = "";
    const frag = document.createDocumentFragment();

    for (const widget of catalog.widgets) {
      let item = { metin: widget.title, kaynak: "BalabanWidgets" };
      if (widget.bank && bankCache[widget.bank]) {
        item = pickBankItem(bankCache[widget.bank]);
      }
      frag.appendChild(createCard(widget, item));
    }

    grid.appendChild(frag);
    applyFilter();
    window.BWEngine.startGlobal();
  }

  searchInput.addEventListener("input", applyFilter);

  modal.querySelectorAll("[data-close]").forEach((el) => {
    el.addEventListener("click", () => {
      modal.hidden = true;
      document.body.style.overflow = "";
    });
  });

  copyEmbedBtn.addEventListener("click", async () => {
    showToast((await copyText(embedCode.value)) ? "HTML kodu kopyalandı" : "Kopyalanamadı");
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.hidden) {
      modal.hidden = true;
      document.body.style.overflow = "";
    }
  });

  init().catch((err) => {
    grid.innerHTML = `<p style="color:#be123c">Yükleme hatası: yerel sunucu ile açın. (${escapeHtml(err.message)})</p>`;
    console.error(err);
  });
})();
