const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const catalogPath = path.join(root, "data", "catalog.json");
const widgetsDir = path.join(root, "widgets");
const sitemapPath = path.join(root, "sitemap.xml");

const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
fs.mkdirSync(widgetsDir, { recursive: true });

function escHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function widgetPage(widget) {
  const title = `${widget.title} | BalabanWidgets`;
  const description = `${widget.title} widget detay sayfası, uzun kullanım rehberi ve canlı örnek. Kategori: ${widget.cat}.`;
  const canonical = `https://widgets.trportal.com.tr/widgets/${widget.id}.html`;

  return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escHtml(title)}</title>
  <meta name="description" content="${escHtml(description)}" />
  <link rel="canonical" href="${canonical}" />
  <link rel="stylesheet" href="../css/style.css" />
</head>
<body data-base-path=".." data-widget-id="${escHtml(widget.id)}">
  <header class="site-header">
    <div class="brand">
      <span class="brand-mark" aria-hidden="true">B</span>
      <div>
        <h1 class="brand-name">Balaban<span>Widgets</span></h1>
        <p class="brand-tag">Widget Detay ve Kullanım Rehberi</p>
      </div>
    </div>
    <p class="date-badge" id="detailDate"></p>
  </header>

  <div class="legal-back"><a href="../index.html">← Tüm widgetlara dön</a></div>

  <main class="legal-page">
    <h1 id="widgetTitle">${escHtml(widget.title)}</h1>
    <p id="widgetMeta">${escHtml(widget.cat)} · ${escHtml(widget.type)} · ${escHtml(widget.id)}</p>

    <section class="detail-layout">
      <article class="detail-card-wrap" id="detailCardWrap"></article>
      <article class="detail-guide" id="detailGuide">
        <h2>Kullanım Rehberi</h2>
        <p>Bu widget için rehber yükleniyor...</p>
      </article>
    </section>
    <section class="detail-guide" id="detailSimilar"></section>
  </main>

  <div class="toast" id="toast" role="status" aria-live="polite"></div>

  <script src="../js/widgets/engine.js"></script>
  <script src="../js/widget-page.js"></script>
</body>
</html>
`;
}

for (const widget of catalog.widgets) {
  fs.writeFileSync(path.join(widgetsDir, `${widget.id}.html`), widgetPage(widget), "utf8");
}

const fixedUrls = [
  { loc: "https://widgets.trportal.com.tr/", changefreq: "daily", priority: "1.0" },
  { loc: "https://widgets.trportal.com.tr/about.html", changefreq: "monthly", priority: "0.7" },
  { loc: "https://widgets.trportal.com.tr/privacy.html", changefreq: "monthly", priority: "0.6" },
  { loc: "https://widgets.trportal.com.tr/cookies.html", changefreq: "monthly", priority: "0.6" },
  { loc: "https://widgets.trportal.com.tr/terms.html", changefreq: "monthly", priority: "0.6" },
  { loc: "https://widgets.trportal.com.tr/dmca.html", changefreq: "monthly", priority: "0.6" },
  { loc: "https://widgets.trportal.com.tr/contact.html", changefreq: "monthly", priority: "0.6" },
  { loc: "https://widgets.trportal.com.tr/widget.html", changefreq: "weekly", priority: "0.8" },
];

const widgetUrls = catalog.widgets.map((w) => ({
  loc: `https://widgets.trportal.com.tr/widgets/${w.id}.html`,
  changefreq: "weekly",
  priority: "0.7",
}));

const allUrls = [...fixedUrls, ...widgetUrls];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>
`;

fs.writeFileSync(sitemapPath, xml, "utf8");
console.log(`OK: ${catalog.widgets.length} widget sayfası üretildi, sitemap güncellendi.`);
