/**
 * Günün Sözü — gömülebilir widget
 *
 * Kullanım:
 *   <div data-gunun-sozu data-theme="ocean"></div>
 *   <script src="…/gunun-sozu-widget.js" async></script>
 *
 * Renk seçenekleri:
 *   data-theme="moss|ocean|slate|ink|sand|rose|amber|teal|indigo|forest"
 *   data-color="#5f7354"   — paletten özel vurgu rengi (theme’i ezer)
 *   data-src="sozler.json"
 */
(function () {
  'use strict';

  const SCRIPT = document.currentScript;
  const BASE = SCRIPT?.src ? new URL('.', SCRIPT.src).href : './';
  const FONT_HREF =
    'https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,400&display=swap';

  /** 10 hazır renk teması — canlı / doygun */
  const THEMES = {
    moss:   { label: 'Yeşil',   accent: '#22c55e', accentHover: '#16a34a', accentSoft: '#4ade80', surface: '#f0fdf4', surfaceAlt: '#dcfce7', ink: '#14532d', muted: '#166534', line: '#bbf7d0', onAccent: '#ffffff', dark: false },
    ocean:  { label: 'Mavi',    accent: '#3b82f6', accentHover: '#2563eb', accentSoft: '#60a5fa', surface: '#eff6ff', surfaceAlt: '#dbeafe', ink: '#1e3a8a', muted: '#1d4ed8', line: '#bfdbfe', onAccent: '#ffffff', dark: false },
    slate:  { label: 'Fuşya',   accent: '#e11d48', accentHover: '#be123c', accentSoft: '#fb7185', surface: '#fff1f2', surfaceAlt: '#ffe4e6', ink: '#881337', muted: '#be123c', line: '#fecdd3', onAccent: '#ffffff', dark: false },
    ink:    { label: 'Gece',    accent: '#a78bfa', accentHover: '#8b5cf6', accentSoft: '#c4b5fd', surface: '#1e1b4b', surfaceAlt: '#312e81', ink: '#ede9fe', muted: '#c4b5fd', line: '#4338ca', onAccent: '#1e1b4b', dark: true },
    sand:   { label: 'Turuncu', accent: '#f97316', accentHover: '#ea580c', accentSoft: '#fb923c', surface: '#fff7ed', surfaceAlt: '#ffedd5', ink: '#9a3412', muted: '#c2410c', line: '#fed7aa', onAccent: '#ffffff', dark: false },
    rose:   { label: 'Pembe',   accent: '#ec4899', accentHover: '#db2777', accentSoft: '#f472b6', surface: '#fdf2f8', surfaceAlt: '#fce7f3', ink: '#9d174d', muted: '#be185d', line: '#fbcfe8', onAccent: '#ffffff', dark: false },
    amber:  { label: 'Sarı',    accent: '#eab308', accentHover: '#ca8a04', accentSoft: '#facc15', surface: '#fefce8', surfaceAlt: '#fef9c3', ink: '#713f12', muted: '#a16207', line: '#fde68a', onAccent: '#422006', dark: false },
    teal:   { label: 'Camgöbeği', accent: '#06b6d4', accentHover: '#0891b2', accentSoft: '#22d3ee', surface: '#ecfeff', surfaceAlt: '#cffafe', ink: '#164e63', muted: '#0e7490', line: '#a5f3fc', onAccent: '#ffffff', dark: false },
    indigo: { label: 'Mor',     accent: '#8b5cf6', accentHover: '#7c3aed', accentSoft: '#a78bfa', surface: '#f5f3ff', surfaceAlt: '#ede9fe', ink: '#4c1d95', muted: '#6d28d9', line: '#ddd6fe', onAccent: '#ffffff', dark: false },
    forest: { label: 'Limon',   accent: '#84cc16', accentHover: '#65a30d', accentSoft: '#a3e635', surface: '#14532d', surfaceAlt: '#166534', ink: '#ecfccb', muted: '#bef264', line: '#3f6212', onAccent: '#14532d', dark: true },
  };

  const THEME_NAMES = Object.keys(THEMES);
  const DEFAULT_THEME = 'moss';

  const DATE_FMT = new Intl.DateTimeFormat('tr-TR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const STYLES = /* css */ `
    :host {
      display: block;
      width: 100%;
      max-width: 100%;
      box-sizing: border-box;
      font-synthesis: none;
      -webkit-font-smoothing: antialiased;

      --gs-accent: #22c55e;
      --gs-accent-hover: #16a34a;
      --gs-accent-soft: #4ade80;
      --gs-surface: #f0fdf4;
      --gs-surface-alt: #dcfce7;
      --gs-ink: #14532d;
      --gs-muted: #166534;
      --gs-line: #bbf7d0;
      --gs-on-accent: #ffffff;
      --gs-shadow: 0 4px 6px -1px rgb(26 24 22 / 0.06), 0 20px 40px -12px rgb(26 24 22 / 0.14);
    }

    :host([data-dark="true"]) {
      --gs-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.2), 0 20px 40px -12px rgb(0 0 0 / 0.45);
    }

    *, *::before, *::after { box-sizing: border-box; }

    .wrap {
      container-type: inline-size;
      container-name: gununsozu;
      width: 100%;
    }

    .card {
      position: relative;
      overflow: hidden;
      width: 100%;
      margin: 0;
      padding: clamp(1rem, 4.5cqi, 2.5rem);
      border-radius: clamp(0.75rem, 2.5cqi, 1.25rem);
      background: var(--gs-surface);
      box-shadow: var(--gs-shadow);
      font-family: "DM Sans", system-ui, sans-serif;
      color: var(--gs-muted);
    }

    .accent {
      position: absolute;
      inset-inline: 0;
      top: 0;
      height: 3px;
      background: linear-gradient(
        90deg,
        var(--gs-accent-soft),
        var(--gs-accent),
        color-mix(in srgb, var(--gs-line) 70%, var(--gs-accent))
      );
    }

    .header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 0.75rem;
      margin-bottom: clamp(0.75rem, 3cqi, 1.5rem);
    }

    .label {
      margin: 0;
      font-size: clamp(0.65rem, 2.2cqi, 0.75rem);
      font-weight: 600;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: var(--gs-accent);
    }

    .date {
      margin: 0.35rem 0 0;
      font-size: clamp(0.72rem, 2.6cqi, 0.875rem);
      color: color-mix(in srgb, var(--gs-muted) 65%, transparent);
      line-height: 1.35;
    }

    .badge {
      flex-shrink: 0;
      padding: 0.25rem 0.55rem;
      border-radius: 0.5rem;
      background: var(--gs-surface-alt);
      font-size: clamp(0.65rem, 2.2cqi, 0.75rem);
      font-weight: 500;
      font-variant-numeric: tabular-nums;
      color: color-mix(in srgb, var(--gs-muted) 80%, transparent);
      white-space: nowrap;
    }

    .quote-wrap { position: relative; }

    .quote-mark {
      position: absolute;
      left: -0.15em;
      top: -0.35em;
      font-family: "Fraunces", Georgia, serif;
      font-size: clamp(2.5rem, 12cqi, 3.75rem);
      line-height: 0.8;
      color: color-mix(in srgb, var(--gs-accent-soft) 35%, transparent);
      pointer-events: none;
      user-select: none;
    }

    .quote {
      position: relative;
      margin: 0;
      padding-left: 0.15rem;
    }

    .quote p {
      margin: 0;
      font-family: "Fraunces", Georgia, serif;
      font-size: clamp(1.05rem, 4.2cqi, 1.5rem);
      font-weight: 500;
      line-height: 1.55;
      color: var(--gs-ink);
      animation: fadeUp 0.55s ease-out both;
    }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .footer {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.5rem;
      margin-top: clamp(1rem, 4cqi, 2rem);
      padding-top: clamp(0.75rem, 3cqi, 1.5rem);
      border-top: 1px solid var(--gs-line);
    }

    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.45rem;
      min-height: 2.5rem;
      padding: 0.55rem 0.95rem;
      border: 0;
      border-radius: 0.75rem;
      font-family: inherit;
      font-size: clamp(0.8rem, 2.8cqi, 0.875rem);
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.2s ease, color 0.2s ease, transform 0.15s ease;
      -webkit-tap-highlight-color: transparent;
    }

    .btn:hover { transform: translateY(-1px); }
    .btn:active { transform: translateY(0); }
    .btn:focus-visible {
      outline: 2px solid color-mix(in srgb, var(--gs-accent) 45%, transparent);
      outline-offset: 2px;
    }

    .btn svg {
      width: 1rem;
      height: 1rem;
      flex-shrink: 0;
      opacity: 0.8;
    }

    .btn-copy {
      background: var(--gs-surface-alt);
      color: var(--gs-ink);
    }
    .btn-copy:hover {
      background: color-mix(in srgb, var(--gs-surface-alt) 70%, var(--gs-accent) 30%);
    }

    .btn-share {
      background: var(--gs-accent);
      color: var(--gs-on-accent);
    }
    .btn-share:hover { background: var(--gs-accent-hover); }
    .btn-share svg { opacity: 0.95; }

    .toast {
      margin: 0;
      margin-inline-start: auto;
      font-size: clamp(0.72rem, 2.5cqi, 0.875rem);
      font-weight: 500;
      color: var(--gs-accent);
      animation: toastIn 0.25s ease-out both;
    }

    .toast[hidden] { display: none !important; }

    @keyframes toastIn {
      from { opacity: 0; transform: translateY(6px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    @container gununsozu (max-width: 320px) {
      .header { flex-direction: column; align-items: flex-start; }
      .badge { align-self: flex-start; }
      .footer { flex-direction: column; align-items: stretch; }
      .btn { width: 100%; }
      .toast {
        margin-inline-start: 0;
        width: 100%;
        text-align: center;
      }
      .quote-mark { display: none; }
    }

    @container gununsozu (min-width: 321px) and (max-width: 420px) {
      .toast {
        flex-basis: 100%;
        margin-inline-start: 0;
        margin-top: 0.15rem;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .quote p, .toast { animation: none; }
      .btn:hover { transform: none; }
    }
  `;

  const ICON_COPY = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;
  const ICON_SHARE = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.59 13.51 15.42 17.49M15.41 6.51 8.59 10.49"/></svg>`;

  function ensureFonts() {
    if (document.getElementById('gunun-sozu-fonts')) return;
    const link = document.createElement('link');
    link.id = 'gunun-sozu-fonts';
    link.rel = 'stylesheet';
    link.href = FONT_HREF;
    document.head.appendChild(link);
  }

  function clamp(n, min, max) {
    return Math.min(max, Math.max(min, n));
  }

  function hexToRgb(hex) {
    const h = hex.replace('#', '').trim();
    const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
    if (!/^[0-9a-fA-F]{6}$/.test(full)) return null;
    return {
      r: parseInt(full.slice(0, 2), 16),
      g: parseInt(full.slice(2, 4), 16),
      b: parseInt(full.slice(4, 6), 16),
    };
  }

  function rgbToHex(r, g, b) {
    return (
      '#' +
      [r, g, b]
        .map((v) => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0'))
        .join('')
    );
  }

  function mixRgb(a, b, t) {
    return {
      r: a.r + (b.r - a.r) * t,
      g: a.g + (b.g - a.g) * t,
      b: a.b + (b.b - a.b) * t,
    };
  }

  function luminance({ r, g, b }) {
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  }

  /** Paletten seçilen tek renkten tema türet */
  function themeFromAccent(hex, preferDark) {
    const rgb = hexToRgb(hex);
    if (!rgb) return null;

    const dark = preferDark != null ? preferDark : luminance(rgb) > 0.62;
    const white = { r: 255, g: 255, b: 255 };
    const black = { r: 20, g: 18, b: 16 };

    const hover = mixRgb(rgb, black, 0.16);
    const soft = mixRgb(rgb, white, 0.28);

    if (dark) {
      const surface = mixRgb(rgb, black, 0.82);
      const surfaceAlt = mixRgb(rgb, black, 0.7);
      const line = mixRgb(rgb, black, 0.58);
      return {
        accent: rgbToHex(rgb.r, rgb.g, rgb.b),
        accentHover: rgbToHex(hover.r, hover.g, hover.b),
        accentSoft: rgbToHex(soft.r, soft.g, soft.b),
        surface: rgbToHex(surface.r, surface.g, surface.b),
        surfaceAlt: rgbToHex(surfaceAlt.r, surfaceAlt.g, surfaceAlt.b),
        ink: '#f5f3ff',
        muted: rgbToHex(soft.r, soft.g, soft.b),
        line: rgbToHex(line.r, line.g, line.b),
        onAccent: luminance(rgb) > 0.55 ? '#1a1816' : '#ffffff',
        dark: true,
      };
    }

    const surface = mixRgb(rgb, white, 0.9);
    const surfaceAlt = mixRgb(rgb, white, 0.8);
    const line = mixRgb(rgb, white, 0.7);
    const ink = mixRgb(rgb, black, 0.72);
    const muted = mixRgb(rgb, black, 0.45);
    return {
      accent: rgbToHex(rgb.r, rgb.g, rgb.b),
      accentHover: rgbToHex(hover.r, hover.g, hover.b),
      accentSoft: rgbToHex(soft.r, soft.g, soft.b),
      surface: rgbToHex(surface.r, surface.g, surface.b),
      surfaceAlt: rgbToHex(surfaceAlt.r, surfaceAlt.g, surfaceAlt.b),
      ink: rgbToHex(ink.r, ink.g, ink.b),
      muted: rgbToHex(muted.r, muted.g, muted.b),
      line: rgbToHex(line.r, line.g, line.b),
      onAccent: luminance(rgb) > 0.62 ? '#1a1816' : '#ffffff',
      dark: false,
    };
  }

  function normalizeThemeName(name) {
    const key = String(name || '').toLowerCase().trim();
    if (key === 'light' || key === 'soft') return DEFAULT_THEME;
    return THEME_NAMES.includes(key) ? key : DEFAULT_THEME;
  }

  function resolveTheme(host) {
    const custom = host.getAttribute('data-color');
    if (custom) {
      const derived = themeFromAccent(custom, host.getAttribute('data-dark') === 'true');
      if (derived) return { name: 'custom', palette: derived };
    }

    const name = normalizeThemeName(host.getAttribute('data-theme'));
    return { name, palette: THEMES[name] };
  }

  function applyThemeVars(host, palette) {
    const map = {
      '--gs-accent': palette.accent,
      '--gs-accent-hover': palette.accentHover,
      '--gs-accent-soft': palette.accentSoft,
      '--gs-surface': palette.surface,
      '--gs-surface-alt': palette.surfaceAlt,
      '--gs-ink': palette.ink,
      '--gs-muted': palette.muted,
      '--gs-line': palette.line,
      '--gs-on-accent': palette.onAccent,
    };
    Object.entries(map).forEach(([k, v]) => host.style.setProperty(k, v));
    const darkVal = palette.dark ? 'true' : 'false';
    if (host.getAttribute('data-dark') !== darkVal) {
      host.setAttribute('data-dark', darkVal);
    }
  }

  function setTheme(host, themeName) {
    const name = normalizeThemeName(themeName);
    host.removeAttribute('data-color');
    host.setAttribute('data-theme', name);
    applyThemeVars(host, THEMES[name]);
    notifyParentHeight(host);
  }

  function setColor(host, hex, preferDark) {
    const derived = themeFromAccent(hex, preferDark);
    if (!derived) return false;
    host.setAttribute('data-color', hex.startsWith('#') ? hex : `#${hex}`);
    host.setAttribute('data-theme', 'custom');
    applyThemeVars(host, derived);
    notifyParentHeight(host);
    return true;
  }

  function getDayOfYear(date = new Date()) {
    const start = new Date(date.getFullYear(), 0, 0);
    return Math.floor((date - start) / 86400000);
  }

  function pickQuote(quotes, dayOfYear) {
    return quotes[(dayOfYear - 1) % quotes.length];
  }

  async function copyText(text) {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return;
    }
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;left:-9999px';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  }

  async function shareQuote(text, showToast) {
    const data = { title: 'Günün Sözü', text };
    if (navigator.share && (!navigator.canShare || navigator.canShare(data))) {
      try {
        await navigator.share(data);
        return;
      } catch (err) {
        if (err?.name === 'AbortError') return;
      }
    }
    await copyText(text);
    showToast('Paylaşım yok — panoya kopyalandı');
  }

  function resolveQuotesUrl(host) {
    const custom = host.getAttribute('data-src');
    if (custom) return new URL(custom, document.baseURI).href;
    return new URL('sozler.json', BASE).href;
  }

  function mount(host) {
    if (host.__gununSozuMounted) return;
    host.__gununSozuMounted = true;

    ensureFonts();

    const { name, palette } = resolveTheme(host);
    host.setAttribute('data-theme', name);
    applyThemeVars(host, palette);

    const shadow = host.shadowRoot || host.attachShadow({ mode: 'open' });
    shadow.innerHTML = `
      <style>${STYLES}</style>
      <div class="wrap">
        <article class="card" part="card" aria-live="polite" aria-busy="true">
          <div class="accent" aria-hidden="true"></div>
          <header class="header">
            <div>
              <p class="label">Günün Sözü</p>
              <p class="date" data-date>—</p>
            </div>
            <span class="badge" data-badge title="Yılın günü">—</span>
          </header>
          <div class="quote-wrap">
            <span class="quote-mark" aria-hidden="true">“</span>
            <blockquote class="quote">
              <p data-quote>Söz yükleniyor…</p>
            </blockquote>
          </div>
          <footer class="footer">
            <button type="button" class="btn btn-copy" data-copy aria-label="Sözü panoya kopyala">
              ${ICON_COPY}<span data-copy-label>Kopyala</span>
            </button>
            <button type="button" class="btn btn-share" data-share aria-label="Sözü paylaş">
              ${ICON_SHARE}Paylaş
            </button>
            <p class="toast" data-toast hidden role="status"></p>
          </footer>
        </article>
      </div>
    `;

    const $ = (sel) => shadow.querySelector(sel);
    const card = $('.card');
    const quoteEl = $('[data-quote]');
    const dateEl = $('[data-date]');
    const badgeEl = $('[data-badge]');
    const toastEl = $('[data-toast]');
    const copyBtn = $('[data-copy]');
    const shareBtn = $('[data-share]');
    const copyLabel = $('[data-copy-label]');

    let toastTimer;
    const showToast = (msg, ms = 2200) => {
      toastEl.textContent = msg;
      toastEl.hidden = false;
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => {
        toastEl.hidden = true;
      }, ms);
    };

    const today = new Date();
    const dayOfYear = getDayOfYear(today);

    // data-theme / data-color değişince canlı güncelle
    const mo = new MutationObserver((mutations) => {
      const relevant = mutations.some(
        (m) => m.attributeName === 'data-theme' || m.attributeName === 'data-color' || m.attributeName === 'data-dark'
      );
      if (!relevant) return;
      const resolved = resolveTheme(host);
      applyThemeVars(host, resolved.palette);
      notifyParentHeight(host);
    });
    mo.observe(host, { attributes: true, attributeFilter: ['data-theme', 'data-color', 'data-dark'] });

    fetch(resolveQuotesUrl(host), { cache: 'no-cache' })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((quotes) => {
        if (!Array.isArray(quotes) || !quotes.length) throw new Error('empty');
        const text = pickQuote(quotes, dayOfYear).text;

        quoteEl.style.animation = 'none';
        quoteEl.textContent = text;
        void quoteEl.offsetWidth;
        quoteEl.style.animation = '';

        dateEl.textContent = DATE_FMT.format(today);
        badgeEl.textContent = `Gün ${dayOfYear}`;
        card.setAttribute('aria-busy', 'false');

        copyBtn.addEventListener('click', async () => {
          try {
            await copyText(text);
            copyLabel.textContent = 'Kopyalandı';
            showToast('Panoya kopyalandı');
            setTimeout(() => {
              copyLabel.textContent = 'Kopyala';
            }, 2000);
          } catch {
            showToast('Kopyalama başarısız');
          }
        });

        shareBtn.addEventListener('click', async () => {
          try {
            await shareQuote(text, showToast);
          } catch {
            showToast('Paylaşım başarısız');
          }
        });

        notifyParentHeight(host);
      })
      .catch((err) => {
        console.error('[Günün Sözü]', err);
        quoteEl.textContent = 'Söz yüklenirken bir sorun oluştu.';
        dateEl.textContent = DATE_FMT.format(today);
        badgeEl.textContent = `Gün ${dayOfYear}`;
        card.setAttribute('aria-busy', 'false');
        notifyParentHeight(host);
      });
  }

  function notifyParentHeight(host) {
    if (window.parent === window) return;
    requestAnimationFrame(() => {
      const h = Math.ceil(host.getBoundingClientRect().height);
      window.parent.postMessage({ type: 'gunun-sozu-resize', height: h }, '*');
    });
  }

  function boot() {
    const nodes = document.querySelectorAll('[data-gunun-sozu], gunun-sozu-widget');
    nodes.forEach(mount);

    if (!nodes.length && SCRIPT?.hasAttribute('data-auto')) {
      const el = document.createElement('div');
      el.setAttribute('data-gunun-sozu', '');
      const theme = SCRIPT.getAttribute('data-theme');
      const color = SCRIPT.getAttribute('data-color');
      if (theme) el.setAttribute('data-theme', theme);
      if (color) el.setAttribute('data-color', color);
      SCRIPT.parentNode.insertBefore(el, SCRIPT);
      mount(el);
    }
  }

  if (!customElements.get('gunun-sozu-widget')) {
    class GununSozuWidget extends HTMLElement {
      static get observedAttributes() {
        return ['data-theme', 'data-color', 'data-dark'];
      }

      connectedCallback() {
        this.setAttribute('data-gunun-sozu', '');
        mount(this);
      }
    }
    customElements.define('gunun-sozu-widget', GununSozuWidget);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  window.GununSozu = {
    mount,
    boot,
    themes: THEMES,
    themeNames: THEME_NAMES,
    setTheme,
    setColor,
    themeFromAccent,
  };
})();
