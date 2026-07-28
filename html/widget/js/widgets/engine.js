/* BalabanWidgets — widget render & bind engine */
window.BWEngine = (() => {
  const intervals = new Map();
  let globalTimer = null;
  let intervalSeq = 0;
  const cardState = new WeakMap();

  function itemText(item) {
    if (!item) return "";
    return item.metin || item.ekstra || item.text || "";
  }

  function wid(card) {
    return (card && card.dataset && (card.dataset.widgetId || card.dataset.id)) || "bw";
  }

  function lsGet(id, key, fallback) {
    try {
      const raw = localStorage.getItem("bw:" + id + ":" + key);
      return raw == null ? fallback : JSON.parse(raw);
    } catch (e) { return fallback; }
  }

  function lsSet(id, key, val) {
    try { localStorage.setItem("bw:" + id + ":" + key, JSON.stringify(val)); } catch (e) {}
  }

  function fmtTime(sec) {
    const s = Math.max(0, Math.floor(sec));
    return String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");
  }

  function fmtHMS(sec) {
    const s = Math.max(0, Math.floor(sec));
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const r = s % 60;
    if (h) return h + ":" + String(m).padStart(2, "0") + ":" + String(r).padStart(2, "0");
    return String(m).padStart(2, "0") + ":" + String(r).padStart(2, "0");
  }

  function weekNumber(d) {
    d = d || new Date();
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dayNum = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    return Math.ceil(((date - yearStart) / 86400000 + 1) / 7);
  }

  function quarterInfo(d) {
    d = d || new Date();
    const q = Math.floor(d.getMonth() / 3) + 1;
    const qStart = new Date(d.getFullYear(), (q - 1) * 3, 1);
    const qEnd = new Date(d.getFullYear(), q * 3, 0);
    const total = Math.round((qEnd - qStart) / 86400000) + 1;
    const elapsed = Math.round((d - qStart) / 86400000) + 1;
    return { q: q, elapsed: elapsed, total: total, left: total - elapsed };
  }

  function moonPhase(date) {
    date = date || new Date();
    const synodic = 29.53058867;
    const ref = new Date("2000-01-06T18:14:00Z");
    const days = (date - ref) / 86400000;
    const phase = ((days % synodic) + synodic) % synodic;
    const idx = Math.floor((phase / synodic) * 8) % 8;
    const names = ["Yeni Ay", "Hilal", "\u0130lk D\u00f6rd\u00fcn", "\u015ei\u015fkin", "Dolunay", "\u015ei\u015fkin", "Son D\u00f6rd\u00fcn", "Hilal"];
    const icons = ["\u{1F311}", "\u{1F312}", "\u{1F313}", "\u{1F314}", "\u{1F315}", "\u{1F316}", "\u{1F317}", "\u{1F318}"];
    return { name: names[idx], icon: icons[idx], pct: Math.round((phase / synodic) * 100) };
  }

  function toRad(d) { return d * Math.PI / 180; }
  function toDeg(r) { return r * 180 / Math.PI; }

  function sunTimes(lat, lon, date) {
    date = date || new Date();
    const day = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const n = Math.floor(day / 86400000) - new Date(1970, 0, 1) / 86400000 + 2440587.5;
    const lngHour = lon / 15;
    const t = n - lngHour / 24;
    const M = (357.5291 + 0.98560028 * t) % 360;
    const C = 1.9148 * Math.sin(toRad(M)) + 0.02 * Math.sin(toRad(2 * M));
    const L = (M + C + 180 + 102.9372) % 360;
    const dec = toDeg(Math.asin(Math.sin(toRad(23.44)) * Math.sin(toRad(L))));
    const zenith = 90.833;
    const cosH = (Math.cos(toRad(zenith)) - Math.sin(toRad(lat)) * Math.sin(toRad(dec))) / (Math.cos(toRad(lat)) * Math.cos(toRad(dec)));
    if (cosH > 1 || cosH < -1) return { rise: "\u2014", set: "\u2014" };
    const H = toDeg(Math.acos(cosH));
    const fmt = function (j) {
      return new Date((j - 2440587.5) * 86400000).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
    };
    return { rise: fmt(n - H / 360 + lngHour / 24), set: fmt(n + H / 360 + lngHour / 24) };
  }

  function qiblaBearing(lat, lon) {
    lat = lat == null ? 41.01 : lat;
    lon = lon == null ? 28.98 : lon;
    const y = Math.sin(toRad(39.8262 - lon));
    const x = Math.cos(toRad(lat)) * Math.tan(toRad(21.4225)) - Math.sin(toRad(lat)) * Math.cos(toRad(39.8262 - lon));
    return (toDeg(Math.atan2(y, x)) + 360) % 360;
  }

  function hijriToday() {
    return new Intl.DateTimeFormat("tr-TR-u-ca-islamic", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date());
  }

  function hijriParts(date) {
    date = date || new Date();
    const parts = new Intl.DateTimeFormat("tr-TR-u-ca-islamic", { day: "numeric", month: "numeric", year: "numeric" }).formatToParts(date);
    const g = function (t) { var p = parts.find(function (x) { return x.type === t; }); return Number((p && p.value) || 0); };
    return { day: g("day"), month: g("month"), year: g("year") };
  }

  function daysToRamadan() {
    const now = new Date();
    for (let i = 0; i < 400; i++) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
      const p = hijriParts(d);
      if (p.month === 9 && p.day === 1) return i;
    }
    return null;
  }

  function mdBasic(src) {
    return String(src || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\*(.+?)\*/g, "<em>$1</em>").replace(/\n/g, "<br>");
  }

  function workdaysBetween(a, b) {
    const start = new Date(a), end = new Date(b);
    if (start > end) return workdaysBetween(b, a);
    let n = 0; const cur = new Date(start);
    while (cur <= end) { if (cur.getDay() !== 0 && cur.getDay() !== 6) n++; cur.setDate(cur.getDate() + 1); }
    return n;
  }

  function wrapTool(html) { return '<div class="w-tool">' + html + '</div>'; }
  function row(html) { return '<div class="w-row">' + html + '</div>'; }
  function field(label, input) { return '<label class="w-field"><span>' + label + '</span>' + input + '</label>'; }
  function btn(label, action, extra) { return '<button type="button" class="w-btn-sm" data-action="' + action + '"' + (extra || '') + '>' + label + '</button>'; }

  function bankCard(item, esc, extra) {
    const text = itemText(item);
    const source = (item && item.kaynak) || (item && item.source) || "BalabanWidgets";
    return '<p class="w-text w-big">' + esc(text) + '</p>' + (extra || '') + '<p class="w-source">' + esc(source) + '</p>';
  }

  function contrastRatio(fg, bg) {
    function lum(c) {
      const m = String(c).match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (!m) return 0.5;
      const ch = [m[1], m[2], m[3]].map(function (v) { v = Number(v) / 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
      return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
    }
    const el = document.createElement("div");
    el.style.cssText = "position:fixed;left:-9999px;color:" + fg + ";background:" + bg;
    document.body.appendChild(el);
    const cs = getComputedStyle(el);
    const L1 = lum(cs.color), L2 = lum(cs.backgroundColor);
    el.remove();
    const lighter = Math.max(L1, L2), darker = Math.min(L1, L2);
    return ((lighter + 0.05) / (darker + 0.05)).toFixed(2);
  }

  const renderers = {
    "quote-card": function (w, item, ctx) {
      const text = itemText(item), source = (item && item.kaynak) || "BalabanWidgets";
      return '<blockquote class="w-quote">' + ctx.esc(text) + '</blockquote><p class="w-source">' + ctx.esc(source) + '</p>';
    },
    note: function (w, item, ctx) {
      const text = itemText(item), source = (item && item.kaynak) || "BalabanWidgets";
      return '<div class="w-note">' + ctx.esc(text) + '</div><p class="w-source">' + ctx.esc(source) + '</p>';
    },
    badge: function (w, item, ctx) {
      const text = itemText(item), source = (item && item.kaynak) || "BalabanWidgets";
      return '<div class="w-badge">' + ctx.esc((item && item.ekstra) || text.slice(0, 42)) + '</div><p class="w-source">' + ctx.esc(source) + '</p>'.replace(/<div/g, '<div').replace(/<\/motion>/g, '</div>');
    },
    chip: function (w, item, ctx) {
      const text = itemText(item), source = (item && item.kaynak) || "BalabanWidgets";
      return '<div class="w-chip">' + ctx.esc((item && item.ekstra) || text.slice(0, 48)) + '</div><p class="w-source">' + ctx.esc(source) + '</p>';
    },
    palette: function (w, item, ctx) {
      const c1 = (item && item.renk1) || "#FF4D6D", c2 = (item && item.renk2) || "#FF8C42", text = itemText(item);
      return '<div class="w-palette"><span style="background:' + ctx.esc(c1) + '"></span><span style="background:' + ctx.esc(c2) + '"></span></div><div class="w-palette-codes"><span>' + ctx.esc(c1) + '</span><span>' + ctx.esc(c2) + '</span></div><p class="w-source">' + ctx.esc(text) + '</p>'.replace(/<div/g, '<div').replace(/<\/motion>/g, '</div>');
    },
    clock: function () {
      return '<div class="w-clock" data-live-clock>--:--:--</div><p class="w-source">Yerel saat · canlı</p>';
    },
    calendar: function (w, item, ctx) {
      const now = new Date();
      const month = now.toLocaleDateString("tr-TR", { month: "short" });
      const week = now.toLocaleDateString("tr-TR", { weekday: "long" });
      return '<div class="w-calendar"><div class="w-calendar__month">' + ctx.esc(month) + '</div><div class="w-calendar__day">' + now.getDate() + '</div><div class="w-calendar__week">' + ctx.esc(week) + '</div></div><p class="w-source">Yılın ' + ctx.day + '. günü</p>';
    },
    "year-progress": function (w, item, ctx) {
      const p = typeof ctx.yearProgress === "function" ? ctx.yearProgress() : ctx.yearProgress;
      return '<p class="w-progress-label">Yıl ilerlemesi: %' + p + '</p><div class="w-progress-track"><div class="w-progress-fill" style="width:' + p + '%"></div></div><p class="w-source">BalabanWidgets · Zaman</p>';
    },
    "countdown-weekend": function (w, item, ctx) {
      const left = typeof ctx.daysUntilWeekend === "function" ? ctx.daysUntilWeekend() : ctx.daysUntilWeekend;
      return '<div class="w-counter">' + left + '</div><p class="w-text">' + (left === 0 ? "Hafta sonu!" : "gün sonra hafta sonu") + '</p>';
    },
    counter: function (w, item, ctx) {
      const text = itemText(item), source = (item && item.kaynak) || "BalabanWidgets";
      return '<div class="w-counter">' + ctx.esc((item && item.ekstra) || String(ctx.day)) + '</div><p class="w-source">' + ctx.esc(text || "Gün numarası") + '</p>';
    },
    progress: function (w, item, ctx) {
      const text = itemText(item);
      const val = Number(item && item.ekstra) || ((ctx.day * 3) % 100);
      return '<p class="w-progress-label">' + ctx.esc(text || "İlerleme") + '</p><div class="w-progress-track"><div class="w-progress-fill" style="width:' + Math.min(100, val) + '%"></div></div>'.replace(/<\/motion>/, "</div>");
    },
    dice: function () {
      return '<div class="w-dice" data-dice data-action="dice-roll" title="Tıkla">⚄</div><p class="w-source">Tıkla · rastgele 1–6</p>';
    },
    mood: function (w, item, ctx) {
      const moods = ["Sakin", "Enerjik", "Odaklı", "Neşeli", "Cesur"];
      const active = (item && item.ekstra) || moods[ctx.day % moods.length];
      const text = itemText(item);
      return '<div class="w-mood">' + moods.map(function (m) {
        return '<button type="button" class="' + (m === active ? "active" : "") + '" data-action="mood-pick" data-mood="' + ctx.esc(m) + '">' + ctx.esc(m) + '</button>';
      }).join("") + '</div><p class="w-source">' + ctx.esc(text) + '</p>';
    },
    "button-set": function (w, item, ctx) {
      return '<div class="w-buttons"><button type="button" class="primary" data-action="noop">Birincil</button><button type="button" class="secondary" data-action="noop">İkincil</button><button type="button" class="ghost" data-action="noop">Ghost</button></div><p class="w-source">' + ctx.esc(itemText(item) || "Buton seti demo") + '</p>';
    },
    "mini-form": function (w, item, ctx) {
      return '<div class="w-form"><textarea rows="2" placeholder="' + ctx.esc(itemText(item) || "Notunu yaz...") + '" data-input="mini-form"></textarea></div><p class="w-source">Yerel demo · gönderilmez</p>';
    },
    "code-card": function (w, item, ctx) {
      const text = itemText(item);
      return '<pre class="w-code">// ' + ctx.esc(w.title) + '\nconst tip = "' + ctx.esc(text).replace(/"/g, '\\"') + '";\nconsole.log(tip);</pre>';
    },
    loader: function () { return '<div class="w-loader fx-spin" aria-label="Yükleniyor"></div><p class="w-source">Loader demo</p>'; },
    toggle: function (w, item, ctx) {
      return '<button type="button" class="w-toggle" data-toggle data-action="toggle" aria-pressed="false"><i></i></button><p class="w-source">' + ctx.esc(itemText(item) || "Aç / kapat") + '</p>';
    },
    "slider-demo": function (w, item) {
      const v = Math.min(100, Number(item && item.ekstra) || 50);
      return '<div class="w-slider"><input type="range" min="0" max="100" value="' + v + '" data-slider data-input="slider" /><p class="w-slider-val"><span data-slider-val>' + v + '</span>%</p></div>';
    },
    "toast-demo": function (w, item, ctx) {
      return '<div class="w-toast-box">' + ctx.esc(itemText(item) || "Bildirim örneği") + '</div><p class="w-source">Toast stili</p>';
    },
    effect: function (w, item, ctx) {
      const text = itemText(item), source = (item && item.kaynak) || "BalabanWidgets";
      return '<p class="w-text">' + ctx.esc(text || "Efektli kart") + '</p><p class="w-source">' + ctx.esc(source) + '</p>';
    },
    text: function (w, item, ctx) {
      const text = itemText(item), source = (item && item.kaynak) || "BalabanWidgets";
      return '<p class="w-text">' + ctx.esc(text) + '</p><p class="w-source">' + ctx.esc(source) + '</p>';
    },

    pomodoro: function () {
      return wrapTool('<div class="w-big" data-pomodoro-display>25:00</div><p class="w-out" data-pomodoro-mode>Çalışma</p>' + row(btn("Başlat", "pomodoro-start") + btn("Duraklat", "pomodoro-pause") + btn("Sıfırla", "pomodoro-reset")));
    },
    countdown: function () {
      return wrapTool(field("Hedef", '<input type="datetime-local" data-input="countdown-target" />') + '<div class="w-big w-out" data-countdown-display>—</div>' + row(btn("Ayarla", "countdown-set")));
    },
    stopwatch: function () {
      return wrapTool('<div class="w-big" data-stopwatch-display>00:00</div>' + row(btn("Başlat", "stopwatch-start") + btn("Duraklat", "stopwatch-pause") + btn("Sıfırla", "stopwatch-reset")));
    },
    "world-clocks": function () {
      return wrapTool(
        row('<span>İstanbul</span><strong data-live-clock data-tz="Europe/Istanbul">--:--</strong>') +
        row('<span>Londra</span><strong data-live-clock data-tz="Europe/London">--:--</strong>') +
        row('<span>New York</span><strong data-live-clock data-tz="America/New_York">--:--</strong>')
      );
    },
    "moon-phase": function () {
      const m = moonPhase();
      return wrapTool('<div class="w-moon w-big">' + m.icon + '</div><p class="w-out">' + m.name + ' · %' + m.pct + '</p>');
    },
    "sun-times": function () {
      const s = sunTimes(41.01, 28.98);
      return wrapTool(row('Doğuş <strong>' + s.rise + '</strong>') + row('Batış <strong>' + s.set + '</strong>') + '<p class="w-source">İstanbul (41.01, 28.98)</p>');
    },
    "week-number": function () {
      return wrapTool('<div class="w-big w-counter">' + weekNumber() + '</div><p class="w-out">ISO hafta numarası</p>'.replace(/<\/motion>/, '</div>').replace(/<\/motion>/, '</div>'));
    },
    "quarter-counter": function () {
      const q = quarterInfo();
      return wrapTool('<div class="w-big">Q' + q.q + '</div><p class="w-out">' + q.elapsed + '/' + q.total + ' gün · ' + q.left + ' kaldı</p>');
    },
    "seconds-today": function () {
      return wrapTool('<div class="w-big" data-seconds-today>0</div><p class="w-out">Bugün geçen saniye</p>');
    },
    "age-calc": function () {
      return wrapTool(field("Doğum", '<input type="date" data-input="age-birth" />') + '<div class="w-out" data-out="age">—</div>'.replace(/<\/motion>/, '</div>').replace(/<\/motion>/, '</div>') + row(btn("Hesapla", "age-calc")));
    },
    "date-diff": function () {
      return wrapTool(field("Başlangıç", '<input type="date" data-input="date-a" />') + field("Bitiş", '<input type="date" data-input="date-b" />') + '<div class="w-out" data-out="date-diff">—</div>' + row(btn("Hesapla", "date-diff")));
    },
    "workdays-calc": function () {
      return wrapTool(field("Başlangıç", '<input type="date" data-input="work-a" />') + field("Bitiş", '<input type="date" data-input="work-b" />') + '<div class="w-out" data-out="workdays">—</div>' + row(btn("Hesapla", "workdays-calc")));
    },

    "percent-calc": function () {
      return wrapTool(field("Değer", '<input type="number" data-input="pct-val" placeholder="100" />') + field("Yüzde", '<input type="number" data-input="pct-p" placeholder="20" />') + '<div class="w-out" data-out="pct">—</div>'.replace(/<div/g, '<div').replace(/<div class="w-out"/g, '<div class="w-out"').replace(/<\/motion>/g, '</div>') + row(btn("Hesapla", "percent-calc")));
    },
    "vat-calc": function () {
      return wrapTool(field("Tutar", '<input type="number" data-input="vat-amt" />') + row(btn("%1", "vat-1") + btn("%10", "vat-10") + btn("%20", "vat-20")) + '<div class="w-out" data-out="vat">—</div>');
    },
    "discount-calc": function () {
      return wrapTool(field("Fiyat", '<input type="number" data-input="disc-price" />') + field("İndirim %", '<input type="number" data-input="disc-pct" />') + '<div class="w-out" data-out="disc">—</div>' + row(btn("Hesapla", "discount-calc")));
    },
    "bmi-calc": function () {
      return wrapTool(field("Boy (cm)", '<input type="number" data-input="bmi-h" />') + field("Kilo (kg)", '<input type="number" data-input="bmi-w" />') + '<div class="w-out" data-out="bmi">—</div>' + row(btn("Hesapla", "bmi-calc")));
    },
    "unit-converter": function () {
      return wrapTool('<div class="w-row"><button type="button" class="w-btn-sm active" data-action="unit-tab" data-tab="len">cm/inch</button><button type="button" class="w-btn-sm" data-action="unit-tab" data-tab="mass">kg/lb</button><button type="button" class="w-btn-sm" data-action="unit-tab" data-tab="temp">C/F</button></div><div data-unit-panel="len">' + field("cm", '<input type="number" data-input="u-len" />') + '<div class="w-out" data-out="u-len">—</div></div><div data-unit-panel="mass" hidden>' + field("kg", '<input type="number" data-input="u-mass" />') + '<div class="w-out" data-out="u-mass">—</div>'.replace(/<div class="w-out"/g, '<div class="w-out"').replace(/<div class="w-out"/g, '<div class="w-out"').replace(/<\/motion>/g, '</div>').replace(/<\/motion>/g, '</div>') + '</div><div data-unit-panel="temp" hidden>' + field("°C", '<input type="number" data-input="u-temp" />') + '<div class="w-out" data-out="u-temp">—</div></div>'.replace(/<\/motion>/, '</div>').replace(/<\/motion>/, '</div>'));
    },
    "fraction-converter": function () {
      return wrapTool(field("Kesir (örn 1/4)", '<input data-input="frac-in" placeholder="1/4" />') + '<div class="w-out" data-out="frac">—</div>' + row(btn("Dönüştür", "fraction-convert")));
    },
    "tip-calc": function () {
      return wrapTool(field("Hesap", '<input type="number" data-input="tip-bill" />') + field("Bahşiş %", '<input type="number" data-input="tip-pct" value="10" />') + '<div class="w-out" data-out="tip">—</div>' + row(btn("Hesapla", "tip-calc")));
    },
    "investment-sim": function () {
      return wrapTool(field("Anapara", '<input type="number" data-input="inv-p" />') + field("Yıllık %", '<input type="number" data-input="inv-r" value="10" />') + field("Yıl", '<input type="number" data-input="inv-y" value="5" />') + '<div class="w-out" data-out="inv">—</div>' + row(btn("Simüle", "investment-sim")));
    },
    "random-number": function () {
      return wrapTool(field("Min", '<input type="number" data-input="rand-min" value="1" />') + field("Max", '<input type="number" data-input="rand-max" value="100" />') + '<div class="w-big w-out" data-out="rand">—</div>' + row(btn("Üret", "random-number")));
    },
    "coin-flip": function () {
      return wrapTool('<div class="w-big" data-out="coin">?</div>'.replace(/<\/motion>/, '</div>').replace(/<\/motion>/, '</div>') + row(btn("At", "coin-flip")));
    },
    "multi-dice": function () {
      return wrapTool('<div class="w-row w-big" data-dice-tray>⚄ ⚄ ⚄</div><p class="w-source">Tıkla</p>');
    },
    wheel: function (w) {
      const opts = (w.options && w.options.join(",")) || "A,B,C,D,E";
      return wrapTool('<div class="w-big" data-wheel-result>?</div><input type="hidden" data-input="wheel-list" value="' + opts + '" />' + row(btn("Çevir", "wheel-spin")));
    },

    "char-counter": function () {
      return wrapTool('<textarea rows="3" data-input="char-text" placeholder="Metin..."></textarea><p class="w-out"><span data-out="chars">0</span> karakter · <span data-out="words">0</span> kelime</p>');
    },
    "lorem-ipsum": function () {
      return wrapTool(row(btn("Paragraf", "lorem-p") + btn("Cümle", "lorem-s")) + '<p class="w-text" data-out="lorem">Lorem ipsum dolor sit amet.</p>');
    },
    "case-converter": function () {
      return wrapTool('<textarea rows="2" data-input="case-text"></textarea>' + row(btn("UPPER", "case-up") + btn("lower", "case-low") + btn("Title", "case-title")) + '<p class="w-out" data-out="case">—</p>');
    },
    "slug-generator": function () {
      return wrapTool('<input data-input="slug-src" placeholder="Başlık" />' + '<p class="w-out" data-out="slug">—</p>' + row(btn("Üret", "slug-gen")));
    },
    "markdown-preview": function () {
      return wrapTool('<textarea rows="2" data-input="md-src" placeholder="**kalın** *italik*"></textarea><div class="w-out" data-out="md-preview">—</div>');
    },
    "reading-time": function () {
      return wrapTool('<textarea rows="2" data-input="read-text"></textarea><p class="w-out" data-out="read-time">—</p>');
    },
    "password-generator": function () {
      return wrapTool(field("Uzunluk", '<input type="range" min="8" max="32" value="16" data-input="pw-len" /><span data-out="pw-len">16</span>') + '<p class="w-out" data-out="pw">—</p>' + row(btn("Üret", "password-gen") + btn("Kopyala", "password-copy")));
    },
    "uuid-generator": function () {
      return wrapTool('<p class="w-out" data-out="uuid">—</p>' + row(btn("Üret", "uuid-gen") + btn("Kopyala", "uuid-copy")));
    },
    "color-converter": function () {
      return wrapTool(field("Hex", '<input data-input="color-hex" value="#ff4d6d" />') + '<div class="w-out" data-out="color-rgb">—</div><div class="w-out" data-out="color-hsl">—</div>'.replace(/<div class="w-out"/g, '<div class="w-out"').replace(/<\/motion>/g, '</div>'));
    },
    "contrast-checker": function () {
      return wrapTool(field("Ön plan", '<input type="color" data-input="con-fg" value="#0f172a" />') + field("Arka plan", '<input type="color" data-input="con-bg" value="#ffffff" />') + '<p class="w-out">Oran: <strong data-out="contrast">—</strong></p>' + row(btn("Kontrol", "contrast-check")));
    },
    "text-diff": function () {
      return wrapTool('<textarea rows="2" data-input="diff-a" placeholder="Metin A"></textarea><textarea rows="2" data-input="diff-b" placeholder="Metin B"></textarea><pre class="w-out" data-out="diff">—</pre>' + row(btn("Karşılaştır", "text-diff")));
    },

    "typography-scale": function () {
      return wrapTool('<p style="font-size:0.75rem">xs</p><p style="font-size:0.875rem">sm</p><p style="font-size:1rem">base</p><p style="font-size:1.25rem">lg</p><p style="font-size:1.5rem">xl</p>');
    },
    "shadow-preview": function () {
      return wrapTool('<input type="range" min="0" max="40" value="12" data-input="shadow-val" /><div class="w-out" data-shadow-box style="padding:1rem;box-shadow:0 12px 30px rgba(0,0,0,.2)">Önizleme</div>');
    },
    "radius-preview": function () {
      return wrapTool('<input type="range" min="0" max="32" value="12" data-input="radius-val" /><div class="w-out" data-radius-box style="padding:1rem;background:#f1f5f9;border-radius:12px">Köşe</div>'.replace(/<\/motion>/, '</div>').replace(/<\/motion>/, '</div>').replace(/<\/motion>/, '</div>'));
    },
    "spacing-demo": function () {
      return wrapTool('<div class="w-row"><span style="padding:4px;background:#fee2e2">4</span><span style="padding:8px;background:#fef3c7">8</span><span style="padding:16px;background:#d1fae5">16</span><span style="padding:24px;background:#dbeafe">24</span></div>');
    },
    "icon-preview": function () {
      const em = ["★","◆","●","▲","✦","☀","☾","♪","⚡","❤","✓","?"];
      return wrapTool('<div class="w-row">' + em.map(function (e) { return '<span class="w-chip">' + e + '</span>'; }).join("") + '</div>');
    },
    "skeleton-demo": function () {
      return wrapTool('<div class="w-out" style="height:12px;background:#e2e8f0;border-radius:6px;margin-bottom:8px"></div><div class="w-out" style="height:12px;width:70%;background:#e2e8f0;border-radius:6px"></div>');
    },
    "progress-styles": function () {
      return wrapTool('<div class="w-progress-track"><div class="w-progress-fill" style="width:60%"></div></div><div class="w-progress-track" style="height:8px;border-radius:999px"><div class="w-progress-fill" style="width:40%;border-radius:999px"></div></div>'.replace(/<div class="w-progress-fill"/g, '<div class="w-progress-fill"').replace(/<\/motion>/g, '</div>') + '<div style="height:6px;background:#e2e8f0"><div style="width:80%;height:100%;background:linear-gradient(90deg,#ff4d6d,#a78bfa)"></div></div>'.replace(/<div/g, '<div').replace(/<\/motion>/g, '</div>'));
    },
    "tabs-demo": function () {
      return wrapTool('<div class="w-row"><button type="button" class="w-btn-sm active" data-action="tab-demo" data-tab="1">Tab 1</button><button type="button" class="w-btn-sm" data-action="tab-demo" data-tab="2">Tab 2</button></div><p class="w-out" data-tab-panel="1">İçerik 1</p><p class="w-out" data-tab-panel="2" hidden>İçerik 2</p>');
    },
    "accordion-demo": function () {
      return wrapTool('<button type="button" class="w-btn-sm" data-action="acc-toggle" data-acc="1">Bölüm 1</button><div class="w-out" data-acc-panel="1">Açıklama 1</div><button type="button" class="w-btn-sm" data-action="acc-toggle" data-acc="2">Bölüm 2</button><div class="w-out" data-acc-panel="2" hidden>Açıklama 2</div>');
    },
    "tooltip-demo": function () {
      return wrapTool('<span class="w-chip" title="Tooltip metni" data-action="tooltip-demo">Üzerine gel</span>');
    },
    "breadcrumb-demo": function () {
      return wrapTool('<nav class="w-out">Ana &rsaquo; Kategori &rsaquo; <strong>Sayfa</strong></nav>');
    },
    "pagination-demo": function () {
      return wrapTool('<div class="w-row">' + [1,2,3].map(function (n) { return '<button type="button" class="w-btn-sm' + (n===1?' active':'') + '" data-action="page-demo" data-page="' + n + '">' + n + '</button>'; }).join("") + '</div>'.replace(/<\/motion>/, '</div>').replace(/<\/motion>/, '</div>'));
    },
    "rating-stars": function () {
      return wrapTool('<div class="w-row w-big" data-rating>' + [1,2,3,4,5].map(function (n) { return '<button type="button" class="w-btn-sm" data-action="rate" data-star="' + n + '">★</button>'; }).join("") + '</div>');
    },
    "tag-pills": function () {
      return wrapTool('<div class="w-row"><span class="w-chip">Tasarım</span><span class="w-chip">Kod</span><span class="w-chip">UI</span></div>');
    },
    "avatar-gen": function () {
      return wrapTool(field("İsim", '<input data-input="avatar-name" placeholder="Ada" />') + '<div class="w-badge w-big" data-out="avatar">A</div>');
    },
    "gradient-gen": function () {
      return wrapTool(field("Renk 1", '<input type="color" data-input="grad-c1" value="#ff4d6d" />') + field("Renk 2", '<input type="color" data-input="grad-c2" value="#a78bfa" />') + '<pre class="w-out" data-out="grad-css">—</pre>' + row(btn("Üret", "gradient-gen")));
    },

    "daily-checklist": function () {
      return wrapTool('<ul class="w-out" data-checklist></ul><div class="w-row"><input data-input="check-item" placeholder="Madde" /><button type="button" class="w-btn-sm" data-action="check-add">+</button></div>');
    },
    "habit-streak": function () {
      return wrapTool('<p class="w-big" data-out="streak">0</p><p class="w-out">gün streak</p>' + row(btn("Bugün yaptım", "habit-done")));
    },
    "water-counter": function () {
      return wrapTool('<p class="w-big" data-out="water">0</p><p class="w-out">bardak</p>' + row(btn("−", "water-minus") + btn("+", "water-plus")));
    },
    "steps-goal": function () {
      return wrapTool(field("Hedef", '<input type="number" data-input="steps-goal" value="8000" />') + field("Bugün", '<input type="number" data-input="steps-today" value="0" />') + '<div class="w-progress-track"><div class="w-progress-fill" data-out="steps-bar" style="width:0%"></div></div>' + row(btn("Kaydet", "steps-save")));
    },
    "sleep-calc": function () {
      return wrapTool(field("Uyanma", '<input type="time" data-input="sleep-wake" value="07:00" />') + '<div class="w-out" data-out="sleep">—</div>' + row(btn("Hesapla", "sleep-calc")));
    },
    "stand-reminder": function () {
      return wrapTool(field("Dakika", '<input type="number" data-input="stand-min" value="45" />') + '<p class="w-out" data-out="stand">Kapalı</p>' + row(btn("Başlat", "stand-start") + btn("Durdur", "stand-stop")));
    },
    "breathing-guide": function () {
      return wrapTool(
        '<div data-breath-circle style="width:88px;height:88px;border-radius:50%;background:linear-gradient(135deg,#22d3ee,#a78bfa);margin:0 auto;transition:transform .9s ease;display:grid;place-items:center;color:#fff;font-weight:700;font-size:1.4rem">4</div>' +
        '<p class="w-out" data-out="breath">4-7-8 nefes · hazır</p>' +
        row(btn("Başlat", "breath-start") + btn("Durdur", "breath-stop"))
      );
    },
    eisenhower: function () {
      return wrapTool('<div class="w-row"><textarea rows="2" data-input="eis-1" placeholder="Önemli+Acil"></textarea><textarea rows="2" data-input="eis-2" placeholder="Önemli"></textarea></div><div class="w-row"><textarea rows="2" data-input="eis-3" placeholder="Acil"></textarea><textarea rows="2" data-input="eis-4" placeholder="Diğer"></textarea></div>' + row(btn("Kaydet", "eisenhower-save")));
    },
    "kanban-mini": function () {
      return wrapTool('<div class="w-row"><div data-kanban="todo"><strong>Yapılacak</strong><ul></ul><input data-input="kb-todo" /><button type="button" data-action="kb-add" data-col="todo">+</button></div><div data-kanban="doing"><strong>Yapılıyor</strong><ul></ul></div><div data-kanban="done"><strong>Bitti</strong><ul></ul></div></div>'.replace(/<div/g, '<div').replace(/<\/motion>/g, '</div>'));
    },
    "quick-notes": function () {
      return wrapTool('<textarea rows="4" data-input="quick-notes" placeholder="Not..."></textarea>' + row(btn("Kaydet", "quick-notes-save")));
    },
    "todo-list": function () {
      return wrapTool('<ul class="w-out" data-todo-list></ul><div class="w-row"><input data-input="todo-text" /><button type="button" class="w-btn-sm" data-action="todo-add">+</button></div>');
    },
    "weekly-goal": function () {
      return wrapTool('<textarea rows="2" data-input="weekly-goal" placeholder="Bu hafta..."></textarea>' + row(btn("Kaydet", "weekly-goal-save")));
    },
    "focus-music-link": function () {
      return wrapTool('<input data-input="music-q" value="lofi focus" />' + row(btn("YouTube Ara", "music-search")));
    },

    "number-guess": function () {
      return wrapTool('<p class="w-out" data-out="guess-msg">1–100 arası tahmin et</p><input type="number" data-input="guess-val" />' + row(btn("Tahmin", "guess-submit") + btn("Yeni", "guess-new")));
    },
    rps: function () {
      return wrapTool('<div class="w-row">' + ["Taş","Kağıt","Makas"].map(function (c) { return '<button type="button" class="w-btn-sm" data-action="rps" data-choice="' + c + '">' + c + '</button>'; }).join("") + '</div><p class="w-out" data-out="rps">—</p>');
    },
    "memory-cards": function () {
      return wrapTool('<div class="w-row" data-memory-board></div>'.replace(/<div class="w-row"/g, '<div class="w-row"').replace(/<div class="w-row"/g, '<div class="w-row"').replace(/<\/motion>/g, '</div>') + '<p class="w-out" data-out="memory">Eşleştir</p>');
    },
    "word-scramble": function () {
      return wrapTool('<p class="w-big" data-out="scramble-word">?</p><input data-input="scramble-ans" />' + row(btn("Kontrol", "scramble-check") + btn("Yeni", "scramble-new")));
    },
    "food-wheel": function (w, item) {
      const bank = itemText(item) || "Pizza,Makarna,Salata,Sushi,Burger";
      return wrapTool('<input type="hidden" data-input="wheel-list" value="' + bank + '" /><div class="w-big" data-wheel-result>?</div>' + row(btn("Çevir", "wheel-spin")));
    },
    "book-wheel": function (w, item) {
      const bank = itemText(item) || "Roman,Şiir,Bilim,Tarih,Felsefe";
      return wrapTool('<input type="hidden" data-input="wheel-list" value="' + bank + '" /><div class="w-big" data-wheel-result>?</div>' + row(btn("Çevir", "wheel-spin")));
    },
    "joke-card": function (w, item, ctx) { return bankCard(item, ctx.esc); },
    "emoji-picker": function () {
      const em = ["😀","😂","😍","🤔","👍","🎉","🔥","✨","💡","🙏"];
      return wrapTool('<div class="w-row">' + em.map(function (e) { return '<button type="button" class="w-btn-sm" data-action="emoji-pick" data-emoji="' + e + '">' + e + '</button>'; }).join("") + '</div><p class="w-out" data-out="emoji">—</p>');
    },
    "color-game": function () {
      return wrapTool('<div class="w-out" data-color-swatch style="height:48px;border-radius:8px;background:#ccc"></div><div class="w-row" data-color-options></div><p class="w-out" data-out="color-game">Renk seç</p>');
    },
    "mini-snake": function () {
      return wrapTool('<canvas class="w-canvas-snake" width="200" height="200" data-snake-canvas></canvas>' + row(btn("Başlat", "snake-start")));
    },

    "word-tr": function (w, item, ctx) { return bankCard(item, ctx.esc, '<p class="w-chip">' + ctx.esc((item && item.ekstra) || "TR") + '</p>'); },
    "word-en": function (w, item, ctx) { return bankCard(item, ctx.esc, '<p class="w-chip">EN</p>'); },
    "mini-quiz": function (w, item, ctx) {
      const q = itemText(item) || "Soru?";
      const opts = ((item && item.secenekler) || "A,B,C,D").split(",");
      return wrapTool('<p class="w-text">' + ctx.esc(q) + '</p><div class="w-row">' + opts.map(function (o, i) { return '<button type="button" class="w-btn-sm" data-action="quiz-pick" data-idx="' + i + '">' + ctx.esc(o.trim()) + '</button>'; }).join("") + '</div><p class="w-out" data-out="quiz">—</p>');
    },
    "history-today": function (w, item, ctx) { return bankCard(item, ctx.esc, '<p class="w-chip">Tarihte bugün</p>'); },
    "geo-tip": function (w, item, ctx) { return bankCard(item, ctx.esc); },
    "science-fact": function (w, item, ctx) { return bankCard(item, ctx.esc); },
    "dev-term": function (w, item, ctx) { return bankCard(item, ctx.esc, '<p class="w-chip">&lt;/&gt;</p>'); },
    "shortcut-tip": function (w, item, ctx) { return bankCard(item, ctx.esc, '<p class="w-chip">⌨</p>'); },
    "ux-rule": function (w, item, ctx) { return bankCard(item, ctx.esc); },
    "seo-tip": function (w, item, ctx) { return bankCard(item, ctx.esc); },
    "esma-card": function (w, item, ctx) { return bankCard(item, ctx.esc, '<p class="w-chip">✦</p>'); },
    "dua-card": function (w, item, ctx) { return bankCard(item, ctx.esc); },
    "friday-message": function (w, item, ctx) { return bankCard(item, ctx.esc, '<p class="w-chip">🕌</p>'); },

    "zikir-counter": function () {
      return wrapTool('<p class="w-big" data-out="zikir">0</p>' + row(btn("−", "zikir-minus") + btn("+", "zikir-plus") + btn("Sıfırla", "zikir-reset")));
    },
    "qibla-compass": function () {
      const b = Math.round(qiblaBearing());
      return wrapTool('<div class="w-compass" data-compass style="--bearing:' + b + 'deg"><span>🕋</span></div><p class="w-out" data-out="qibla">' + b + '° · İstanbul</p>');
    },
    "hijri-date": function () {
      return wrapTool('<p class="w-big w-text">' + hijriToday() + '</p>');
    },
    "ramadan-countdown": function () {
      const d = daysToRamadan();
      return wrapTool('<div class="w-big">' + (d == null ? "—" : d) + '</div><p class="w-out">' + (d === 0 ? "Ramazan başladı!" : "gün (tahmini)") + '</p>');
    },
    "gratitude-log": function () {
      return wrapTool('<ul class="w-out" data-gratitude></ul><div class="w-row"><input data-input="gratitude-text" placeholder="Şükür..." /><button type="button" class="w-btn-sm" data-action="gratitude-add">+</button></div>');
    },

    "follow-buttons": function () {
      return wrapTool('<div class="w-row"><button type="button" class="w-btn-sm" data-action="noop">Takip Et</button><button type="button" class="w-btn-sm" data-action="noop">Abone</button></div>'.replace(/<div class="w-row"/g, '<div class="w-row"').replace(/<\/motion>/g, '</div>').replace(/<\/motion>/g, '</div>').replace(/<\/motion>/g, '</div>').replace(/<\/motion>/g, '</div>'));
    },
    "share-links": function () {
      return wrapTool('<div class="w-row"><button type="button" class="w-btn-sm" data-action="share-wa">WhatsApp</button><button type="button" class="w-btn-sm" data-action="share-tg">Telegram</button><button type="button" class="w-btn-sm" data-action="share-x">X</button></div>');
    },
    "contact-card": function () {
      return wrapTool('<p class="w-text"><strong>Balaban</strong></p><p class="w-out">info@example.com</p><p class="w-out">+90 555 000 00 00</p>');
    },
    "comment-ui": function () {
      return wrapTool('<textarea rows="2" placeholder="Yorum yaz..."></textarea><button type="button" class="w-btn-sm" data-action="noop">Gönder</button><p class="w-out">Demo yorum kutusu</p>');
    },
    "profile-card": function () {
      return wrapTool('<div class="w-row"><span class="w-badge">B</span><div><strong>Balaban</strong><p class="w-source">@balaban</p></div></div>');
    },
    "social-icons": function () {
      return wrapTool('<div class="w-row w-big">◎ ↗ ✉ ⌁</div>');
    },
    "rss-button": function () {
      return wrapTool('<button type="button" class="w-btn-sm" data-action="rss-open">RSS Abone Ol</button>');
    },

    "font-size-toggle": function () {
      return wrapTool('<p class="w-out">Kart yazı boyutu</p>' + row(btn("A−", "font-smaller") + btn("A+", "font-larger")));
    },
    "high-contrast": function () {
      return wrapTool('<button type="button" class="w-btn-sm" data-action="high-contrast">Yüksek kontrast</button>');
    },
    "dark-mode": function () {
      return wrapTool('<button type="button" class="w-btn-sm" data-action="dark-mode">Karanlık mod</button>');
    },
    "skip-link-demo": function () {
      return wrapTool('<a href="#widgetGrid" class="w-btn-sm">İçeriğe atla</a>');
    },
    "colorblind-sim": function () {
      return wrapTool('<div class="w-row"><button type="button" class="w-btn-sm" data-action="cb-none">Normal</button><button type="button" class="w-btn-sm" data-action="cb-deut">Deut</button><button type="button" class="w-btn-sm" data-action="cb-prot">Prot</button></div><div class="w-palette"><span style="background:#e74c3c"></span><span style="background:#2ecc71"></span></div>');
    },
    "focus-ring-demo": function () {
      return wrapTool('<button type="button" class="w-btn-sm" style="outline:2px solid #6366f1;outline-offset:2px">Odak halkası</button>');
    },

    "white-noise": function () {
      return wrapTool('<p class="w-out" data-out="noise">Kapalı</p>' + row(btn("Başlat", "noise-start") + btn("Durdur", "noise-stop")));
    },
    metronome: function () {
      return wrapTool(field("BPM", '<input type="range" min="40" max="200" value="100" data-input="metro-bpm" /><span data-out="metro-bpm">100</span>') + '<p class="w-out" data-out="metro">Kapalı</p>' + row(btn("Başlat", "metro-start") + btn("Durdur", "metro-stop")));
    },
    "audio-visualizer": function () {
      return wrapTool('<canvas width="200" height="80" data-audio-canvas></canvas>' + row(btn("Mikrofon", "audio-start") + btn("Durdur", "audio-stop")));
    },
    "wave-animation": function () {
      return wrapTool('<div class="w-out" style="height:48px;background:linear-gradient(90deg,#6366f1,#a78bfa,#22d3ee);background-size:200% 100%;animation:shimmer 2s infinite"></div>');
    },
    "qr-generator": function () {
      return wrapTool(
        field("Metin / URL", '<input type="text" data-input="qr-text" placeholder="https://balabanwidgets.example" value="BalabanWidgets" />') +
        '<canvas width="120" height="120" data-qr-canvas style="display:block;margin:8px auto;border-radius:8px;border:1px solid #e2e8f0"></canvas>' +
        row(btn("Oluştur", "qr-gen") + btn("Metni Kopyala", "qr-copy"))
      );
    },
    "profit-loss-calc": function () {
      return wrapTool(field("Alış", '<input type="number" data-input="pl-buy" />') + field("Satış", '<input type="number" data-input="pl-sell" />') + '<p class="w-out" data-out="pl">—</p>' + row(btn("Hesapla", "profit-loss-calc")));
    },
    "break-even-calc": function () {
      return wrapTool(field("Sabit Gider", '<input type="number" data-input="be-fixed" />') + field("Birim Fiyat", '<input type="number" data-input="be-price" />') + field("Birim Maliyet", '<input type="number" data-input="be-cost" />') + '<p class="w-out" data-out="be">—</p>' + row(btn("Hesapla", "break-even-calc")));
    },
    "commission-calc": function () {
      return wrapTool(field("Tutar", '<input type="number" data-input="com-amt" />') + field("Komisyon %", '<input type="number" data-input="com-rate" value="10" />') + '<p class="w-out" data-out="com">—</p>' + row(btn("Hesapla", "commission-calc")));
    },
    "installment-split": function () {
      return wrapTool(field("Toplam", '<input type="number" data-input="inst-total" />') + field("Taksit", '<input type="number" data-input="inst-count" value="6" />') + '<p class="w-out" data-out="inst">—</p>' + row(btn("Böl", "installment-split")));
    },
    "budget-503020": function () {
      return wrapTool(field("Aylık Gelir", '<input type="number" data-input="budget-income" />') + '<p class="w-out" data-out="budget">—</p>' + row(btn("Hesapla", "budget-503020")));
    },
    "savings-goal": function () {
      return wrapTool(field("Hedef Tutar", '<input type="number" data-input="sg-goal" />') + field("Kaç Ay?", '<input type="number" data-input="sg-month" value="12" />') + '<p class="w-out" data-out="sg">—</p>' + row(btn("Hesapla", "savings-goal")));
    },
    "simple-interest": function () {
      return wrapTool(field("Anapara", '<input type="number" data-input="si-p" />') + field("Yıllık %", '<input type="number" data-input="si-r" />') + field("Yıl", '<input type="number" data-input="si-t" />') + '<p class="w-out" data-out="si">—</p>' + row(btn("Hesapla", "simple-interest")));
    },
    "compound-interest": function () {
      return wrapTool(field("Anapara", '<input type="number" data-input="ci-p" />') + field("Yıllık %", '<input type="number" data-input="ci-r" />') + field("Yıl", '<input type="number" data-input="ci-t" />') + '<p class="w-out" data-out="ci">—</p>' + row(btn("Hesapla", "compound-interest")));
    },
    "days-until-birth": function () {
      return wrapTool(field("Doğum Günü", '<input type="date" data-input="dubirth" />') + '<p class="w-out" data-out="dub">—</p>' + row(btn("Hesapla", "days-until-birth")));
    },
    "day-of-year": function () {
      return wrapTool('<div class="w-big">' + ((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000 | 0) + '</div><p class="w-out">Yılın günü</p>');
    },
    "pomodoro-cycles": function () {
      return wrapTool(field("Toplam Dakika", '<input type="number" data-input="pc-min" value="120" />') + '<p class="w-out" data-out="pc">—</p>' + row(btn("Hesapla", "pomodoro-cycles")));
    },
    "time-diff": function () {
      return wrapTool(field("Saat 1", '<input type="time" data-input="td-a" value="09:00" />') + field("Saat 2", '<input type="time" data-input="td-b" value="17:00" />') + '<p class="w-out" data-out="td">—</p>' + row(btn("Hesapla", "time-diff")));
    },
    "water-intake": function () {
      return wrapTool(field("Kilo (kg)", '<input type="number" data-input="wi-kg" value="70" />') + '<p class="w-out" data-out="wi">—</p>' + row(btn("Hesapla", "water-intake")));
    },
    "calorie-calc": function () {
      return wrapTool(field("Cinsiyet", '<select data-input="cal-sex"><option value="m">Erkek</option><option value="f">Kadın</option></select>') + field("Yaş", '<input type="number" data-input="cal-age" value="30" />') + field("Boy (cm)", '<input type="number" data-input="cal-h" value="170" />') + field("Kilo (kg)", '<input type="number" data-input="cal-w" value="70" />') + '<p class="w-out" data-out="cal">—</p>' + row(btn("Hesapla", "calorie-calc")));
    },
    "macro-calc": function () {
      return wrapTool(field("Günlük Kalori", '<input type="number" data-input="mac-cal" value="2200" />') + '<p class="w-out" data-out="mac">—</p>' + row(btn("Hesapla", "macro-calc")));
    },
    "ideal-weight": function () {
      return wrapTool(field("Boy (cm)", '<input type="number" data-input="iw-h" value="170" />') + '<p class="w-out" data-out="iw">—</p>' + row(btn("Hesapla", "ideal-weight")));
    },
    "heart-rate-zones": function () {
      return wrapTool(field("Yaş", '<input type="number" data-input="hr-age" value="30" />') + '<p class="w-out" data-out="hr">—</p>' + row(btn("Hesapla", "heart-rate-zones")));
    },
    "grade-average": function () {
      return wrapTool(field("Notlar (virgül)", '<input data-input="ga-list" placeholder="70,85,90" />') + '<p class="w-out" data-out="ga">—</p>' + row(btn("Hesapla", "grade-average")));
    },
    "weighted-average": function () {
      return wrapTool(field("Notlar", '<input data-input="wa-grades" placeholder="70,90" />') + field("Ağırlıklar", '<input data-input="wa-weights" placeholder="40,60" />') + '<p class="w-out" data-out="wa">—</p>' + row(btn("Hesapla", "weighted-average")));
    },
    "net-score": function () {
      return wrapTool(field("Doğru", '<input type="number" data-input="ns-d" />') + field("Yanlış", '<input type="number" data-input="ns-y" />') + '<p class="w-out" data-out="ns">—</p>' + row(btn("Hesapla", "net-score")));
    },
    "percentile-calc": function () {
      return wrapTool(field("Sıra", '<input type="number" data-input="pr-rank" />') + field("Toplam", '<input type="number" data-input="pr-total" />') + '<p class="w-out" data-out="pr">—</p>' + row(btn("Hesapla", "percentile-calc")));
    },
    "gcd-lcm": function () {
      return wrapTool(field("Sayı 1", '<input type="number" data-input="gl-a" />') + field("Sayı 2", '<input type="number" data-input="gl-b" />') + '<p class="w-out" data-out="gl">—</p>' + row(btn("Hesapla", "gcd-lcm")));
    },
    "power-root": function () {
      return wrapTool(field("Sayı", '<input type="number" data-input="prw-a" />') + field("Üs", '<input type="number" data-input="prw-p" value="2" />') + '<p class="w-out" data-out="prw">—</p>' + row(btn("Hesapla", "power-root")));
    },
    "linear-equation": function () {
      return wrapTool(field("a", '<input type="number" data-input="le-a" />') + field("b", '<input type="number" data-input="le-b" />') + '<p class="w-out" data-out="le">—</p>' + row(btn("Çöz", "linear-equation")));
    },
    "ratio-proportion": function () {
      return wrapTool(field("a", '<input type="number" data-input="rp-a" />') + field("b", '<input type="number" data-input="rp-b" />') + field("c", '<input type="number" data-input="rp-c" />') + '<p class="w-out" data-out="rp">—</p>' + row(btn("Hesapla x", "ratio-proportion")));
    },
    "fraction-decimal-percent": function () {
      return wrapTool(field("Kesir", '<input data-input="fdp" placeholder="3/8" />') + '<p class="w-out" data-out="fdp">—</p>' + row(btn("Dönüştür", "fraction-decimal-percent")));
    },
    "geometry-calc": function () {
      return wrapTool(field("Şekil", '<select data-input="geo-shape"><option value="square">Kare</option><option value="rect">Dikdörtgen</option><option value="circle">Daire</option><option value="tri">Üçgen</option></select>') + field("a", '<input type="number" data-input="geo-a" value="10" />') + field("b/r/h", '<input type="number" data-input="geo-b" value="5" />') + '<p class="w-out" data-out="geo">—</p>' + row(btn("Hesapla", "geometry-calc")));
    },
    "km-mile": function () {
      return wrapTool(field("km", '<input type="number" data-input="kmv" />') + '<p class="w-out" data-out="kmv">—</p>');
    },
    "liter-gallon": function () {
      return wrapTool(field("litre", '<input type="number" data-input="lgv" />') + '<p class="w-out" data-out="lgv">—</p>');
    },
    "area-converter": function () {
      return wrapTool(field("m²", '<input type="number" data-input="acv" />') + '<p class="w-out" data-out="acv">—</p>');
    },
    "byte-converter": function () {
      return wrapTool(field("byte", '<input type="number" data-input="bcv" />') + '<p class="w-out" data-out="bcv">—</p>');
    },
    "minute-hour": function () {
      return wrapTool(field("dakika", '<input type="number" data-input="mhv" />') + '<p class="w-out" data-out="mhv">—</p>');
    },
    "percent-point": function () {
      return wrapTool(field("Değer", '<input type="number" data-input="ppv" />') + field("%", '<input type="number" data-input="ppp" />') + '<p class="w-out" data-out="ppv">—</p>');
    },
    "date-format": function () {
      return wrapTool(field("Tarih", '<input type="date" data-input="dfv" />') + '<p class="w-out" data-out="dfv">—</p>');
    },
    "speaking-time": function () {
      return wrapTool(field("Kelime", '<input type="number" data-input="spw" />') + '<p class="w-out" data-out="spw">—</p>');
    },
    "text-density": function () {
      return wrapTool('<textarea rows="2" data-input="tdx" placeholder="Metin"></textarea><p class="w-out" data-out="tdx">—</p>');
    },
    "content-goal": function () {
      return wrapTool(field("Toplam kelime", '<input type="number" data-input="cg-total" />') + field("Kalan gün", '<input type="number" data-input="cg-days" />') + '<p class="w-out" data-out="cg">—</p>' + row(btn("Hesapla", "content-goal")));
    },
    "publish-calendar": function () {
      return wrapTool(field("Başlangıç", '<input type="date" data-input="pc-start" />') + field("Bitiş", '<input type="date" data-input="pc-end" />') + '<p class="w-out" data-out="pcal">—</p>' + row(btn("Hesapla", "publish-calendar")));
    }
  };

  function render(widget, item, ctx) {
    const fn = renderers[widget.type];
    if (fn) return fn(widget, item, ctx);
    return renderers.text(widget, item, ctx);
  }

  function getIn(card, sel) { return card.querySelector(sel); }
  function getVal(card, sel) { const el = getIn(card, sel); return el ? el.value : ""; }
  function setOut(card, name, html) { const el = card.querySelector('[data-out="' + name + '"]'); if (el) el.innerHTML = html; }
  function setText(card, sel, t) { const el = typeof sel === "string" ? getIn(card, sel) : sel; if (el) el.textContent = t; }

  function addInterval(fn, ms) {
    const id = ++intervalSeq;
    intervals.set(id, setInterval(fn, ms));
    return id;
  }

  function stopInterval(id) {
    if (intervals.has(id)) { clearInterval(intervals.get(id)); intervals.delete(id); }
  }

  function ensureState(card) {
    if (!cardState.has(card)) cardState.set(card, {});
    return cardState.get(card);
  }

  const SCRAMBLE_WORDS = ["widget", "zaman", "kod", "tasarim", "not", "hedef", "odak", "renk"];
  const COLOR_NAMES = ["kirmizi", "mavi", "yesil", "sari", "mor", "turuncu"];
  const COLOR_HEX = ["#ef4444", "#3b82f6", "#22c55e", "#eab308", "#a855f7", "#f97316"];

  function loadLists(card, widget) {
    const id = wid(card);
    const type = widget.type;
    if (type === "daily-checklist") {
      const ul = getIn(card, "[data-checklist]");
      const items = lsGet(id, "check", []);
      if (ul) ul.innerHTML = items.map(function (t, i) {
        return '<li><label><input type="checkbox" data-action="check-toggle" data-idx="' + i + '"' + (t.done ? " checked" : "") + ' /> ' + t.text + '</label></li>';
      }).join("");
    }
    if (type === "todo-list") {
      const ul = getIn(card, "[data-todo-list]");
      const items = lsGet(id, "todo", []);
      if (ul) ul.innerHTML = items.map(function (t, i) {
        return '<li>' + t + ' <button type="button" class="w-btn-sm" data-action="todo-del" data-idx="' + i + '">×</button></li>';
      }).join("");
    }
    if (type === "gratitude-log") {
      const ul = getIn(card, "[data-gratitude]");
      const items = lsGet(id, "gratitude", []);
      if (ul) ul.innerHTML = items.map(function (t) { return '<li>' + t + '</li>'; }).join("");
    }
    if (type === "quick-notes") { const t = lsGet(id, "notes", ""); const el = getIn(card, '[data-input="quick-notes"]'); if (el) el.value = t; }
    if (type === "weekly-goal") { const t = lsGet(id, "wgoal", ""); const el = getIn(card, '[data-input="weekly-goal"]'); if (el) el.value = t; }
    if (type === "water-counter") setText(card, '[data-out="water"]', String(lsGet(id, "water", 0)));
    if (type === "zikir-counter") setText(card, '[data-out="zikir"]', String(lsGet(id, "zikir", 0)));
    if (type === "habit-streak") setText(card, '[data-out="streak"]', String(lsGet(id, "streak", 0)));
    for (let i = 1; i <= 4; i++) {
      const el = getIn(card, '[data-input="eis-' + i + '"]');
      if (el) el.value = lsGet(id, "eis" + i, "");
    }
    if (type === "memory-cards") initMemory(card);
    if (type === "color-game") initColorGame(card);
    if (type === "number-guess") newGuess(card);
    if (type === "word-scramble") newScramble(card);
  }

  function initMemory(card) {
    const pairs = ["A","A","B","B","C","C","D","D"];
    for (let i = pairs.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = pairs[i]; pairs[i] = pairs[j]; pairs[j] = t; }
    const st = ensureState(card);
    st.memory = { cards: pairs, open: [], matched: 0 };
    const board = getIn(card, "[data-memory-board]");
    if (!board) return;
    board.innerHTML = pairs.map(function (_, i) {
      return '<button type="button" class="w-btn-sm" data-action="memory-flip" data-idx="' + i + '">?</button>';
    }).join("");
  }

  function initColorGame(card) {
    const idx = Math.floor(Math.random() * COLOR_HEX.length);
    const st = ensureState(card);
    st.colorAnswer = idx;
    setIn(card, "[data-color-swatch]", "style", "height:48px;border-radius:8px;background:" + COLOR_HEX[idx]);
    const opts = getIn(card, "[data-color-options]");
    if (!opts) return;
    const order = COLOR_NAMES.map(function (_, i) { return i; });
    for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = order[i]; order[i] = order[j]; order[j] = t; }
    opts.innerHTML = order.map(function (i) {
      return '<button type="button" class="w-btn-sm" data-action="color-guess" data-idx="' + i + '">' + COLOR_NAMES[i] + '</button>';
    }).join("");
  }

  function setIn(card, sel, attr, val) { const el = getIn(card, sel); if (el) el.setAttribute(attr, val); if (el && attr === "style") el.style.cssText = val; }

  function newGuess(card) {
    ensureState(card).guessTarget = 1 + Math.floor(Math.random() * 100);
    setText(card, '[data-out="guess-msg"]', "1–100 arası tahmin et");
  }

  function newScramble(card) {
    const w = SCRAMBLE_WORDS[Math.floor(Math.random() * SCRAMBLE_WORDS.length)];
    ensureState(card).scrambleWord = w;
    const shuffled = w.split("").sort(function () { return Math.random() - 0.5; }).join("");
    setText(card, '[data-out="scramble-word"]', shuffled);
  }

  function spinWheel(card) {
    const list = (getVal(card, '[data-input="wheel-list"]') || "A,B,C").split(",").map(function (s) { return s.trim(); }).filter(Boolean);
    const pick = list[Math.floor(Math.random() * list.length)] || "?";
    const el = getIn(card, "[data-wheel-result]");
    if (el) { el.textContent = "…"; setTimeout(function () { el.textContent = pick; }, 400); }
  }

  function bindSnake(card) {
    const canvas = getIn(card, "[data-snake-canvas]");
    if (!canvas) return;
    const ctx2 = canvas.getContext("2d");
    const st = ensureState(card);
    st.snake = null;
    function draw() {
      if (!st.snake) return;
      const s = st.snake;
      ctx2.fillStyle = "#0f172a"; ctx2.fillRect(0, 0, 200, 200);
      ctx2.fillStyle = "#22c55e";
      s.body.forEach(function (p) { ctx2.fillRect(p.x * 10, p.y * 10, 9, 9); });
      ctx2.fillStyle = "#ef4444";
      ctx2.fillRect(s.food.x * 10, s.food.y * 10, 9, 9);
    }
    st.snakeDraw = draw;
    st.snakeTick = function () {
      if (!st.snake || !st.snake.alive) return;
      const s = st.snake;
      const head = { x: s.body[0].x + s.dx, y: s.body[0].y + s.dy };
      if (head.x < 0 || head.y < 0 || head.x > 19 || head.y > 19) { s.alive = false; return; }
      s.body.unshift(head);
      if (head.x === s.food.x && head.y === s.food.y) {
        s.food = { x: Math.floor(Math.random() * 20), y: Math.floor(Math.random() * 20) };
      } else s.body.pop();
      draw();
    };
    card.addEventListener("keydown", function (e) {
      if (!st.snake) return;
      if (e.key === "ArrowUp") st.snake.dy = -1, st.snake.dx = 0;
      if (e.key === "ArrowDown") st.snake.dy = 1, st.snake.dx = 0;
      if (e.key === "ArrowLeft") st.snake.dx = -1, st.snake.dy = 0;
      if (e.key === "ArrowRight") st.snake.dx = 1, st.snake.dy = 0;
    });
  }

  const actions = {
    noop: function () {},
    "dice-roll": function (card) { const d = getIn(card, "[data-dice]"); if (d) d.textContent = String(1 + Math.floor(Math.random() * 6)); },
    "mood-pick": function (card, el) { card.querySelectorAll("[data-mood]").forEach(function (b) { b.classList.remove("active"); }); el.classList.add("active"); },
    toggle: function (card, el) { const on = el.classList.toggle("on"); el.setAttribute("aria-pressed", String(on)); },
    "pomodoro-start": function (card) {
      const st = ensureState(card);
      if (st.pomodoroId) return;
      st.pomodoroId = addInterval(function () {
        st.pomodoroSec = (st.pomodoroSec == null ? (st.pomodoroMode === "break" ? 5 * 60 : 25 * 60) : st.pomodoroSec) - 1;
        if (st.pomodoroSec < 0) {
          st.pomodoroMode = st.pomodoroMode === "break" ? "work" : "break";
          st.pomodoroSec = st.pomodoroMode === "break" ? 5 * 60 : 25 * 60;
        }
        setText(card, "[data-pomodoro-display]", fmtTime(st.pomodoroSec));
        setText(card, "[data-pomodoro-mode]", st.pomodoroMode === "break" ? "Mola" : "Çalışma");
      }, 1000);
    },
    "pomodoro-pause": function (card) { const st = ensureState(card); if (st.pomodoroId) { stopInterval(st.pomodoroId); st.pomodoroId = null; } },
    "pomodoro-reset": function (card) {
      const st = ensureState(card);
      if (st.pomodoroId) { stopInterval(st.pomodoroId); st.pomodoroId = null; }
      st.pomodoroMode = "work"; st.pomodoroSec = 25 * 60;
      setText(card, "[data-pomodoro-display]", "25:00"); setText(card, "[data-pomodoro-mode]", "Çalışma");
    },
    "countdown-set": function (card) {
      const t = getVal(card, '[data-input="countdown-target"]');
      ensureState(card).countdownTarget = t ? new Date(t).getTime() : null;
    },
    "stopwatch-start": function (card) {
      const st = ensureState(card);
      if (st.swId) return;
      st.swStart = Date.now() - (st.swElapsed || 0);
      st.swId = addInterval(function () {
        st.swElapsed = Date.now() - st.swStart;
        setText(card, "[data-stopwatch-display]", fmtHMS(st.swElapsed / 1000));
      }, 100);
    },
    "stopwatch-pause": function (card) { const st = ensureState(card); if (st.swId) { stopInterval(st.swId); st.swId = null; } },
    "stopwatch-reset": function (card) {
      const st = ensureState(card);
      if (st.swId) { stopInterval(st.swId); st.swId = null; }
      st.swElapsed = 0; setText(card, "[data-stopwatch-display]", "00:00");
    },
    "age-calc": function (card) {
      const b = getVal(card, '[data-input="age-birth"]');
      if (!b) return;
      const d = new Date(b), now = new Date();
      let y = now.getFullYear() - d.getFullYear();
      const m = now.getMonth() - d.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < d.getDate())) y--;
      setOut(card, "age", y + " yaş");
    },
    "date-diff": function (card) {
      const a = new Date(getVal(card, '[data-input="date-a"]'));
      const b = new Date(getVal(card, '[data-input="date-b"]'));
      const days = Math.round(Math.abs(b - a) / 86400000);
      setOut(card, "date-diff", days + " gün");
    },
    "workdays-calc": function (card) {
      setOut(card, "workdays", workdaysBetween(getVal(card, '[data-input="work-a"]'), getVal(card, '[data-input="work-b"]')) + " iş günü");
    },
    "percent-calc": function (card) {
      const v = Number(getVal(card, '[data-input="pct-val"]')), p = Number(getVal(card, '[data-input="pct-p"]'));
      setOut(card, "pct", (v * p / 100).toFixed(2));
    },
    "vat-1": function (card, el, h) { actions._vat(card, 1); },
    "vat-10": function (card) { actions._vat(card, 10); },
    "vat-20": function (card) { actions._vat(card, 20); },
    _vat: function (card, rate) {
      const amt = Number(getVal(card, '[data-input="vat-amt"]'));
      const vat = amt * rate / 100;
      setOut(card, "vat", "KDV: " + vat.toFixed(2) + " · Toplam: " + (amt + vat).toFixed(2));
    },
    "discount-calc": function (card) {
      const p = Number(getVal(card, '[data-input="disc-price"]')), d = Number(getVal(card, '[data-input="disc-pct"]'));
      setOut(card, "disc", (p * (1 - d / 100)).toFixed(2) + " TL");
    },
    "bmi-calc": function (card) {
      const h = Number(getVal(card, '[data-input="bmi-h"]')) / 100, w = Number(getVal(card, '[data-input="bmi-w"]'));
      const bmi = w / (h * h);
      setOut(card, "bmi", bmi ? bmi.toFixed(1) : "—");
    },
    "unit-tab": function (card, el) {
      card.querySelectorAll('[data-action="unit-tab"]').forEach(function (b) { b.classList.remove("active"); });
      el.classList.add("active");
      const tab = el.dataset.tab;
      card.querySelectorAll("[data-unit-panel]").forEach(function (p) { p.hidden = p.dataset.unitPanel !== tab; });
    },
    "fraction-convert": function (card) {
      const s = getVal(card, '[data-input="frac-in"]');
      const m = s.match(/^(\d+)\s*\/\s*(\d+)$/);
      if (!m) { setOut(card, "frac", "Geçersiz"); return; }
      setOut(card, "frac", ((Number(m[1]) / Number(m[2])) * 100).toFixed(2) + "%");
    },
    "tip-calc": function (card) {
      const bill = Number(getVal(card, '[data-input="tip-bill"]')), pct = Number(getVal(card, '[data-input="tip-pct"]'));
      const tip = bill * pct / 100;
      setOut(card, "tip", "Bahşiş: " + tip.toFixed(2) + " · Toplam: " + (bill + tip).toFixed(2));
    },
    "investment-sim": function (card) {
      const p = Number(getVal(card, '[data-input="inv-p"]')), r = Number(getVal(card, '[data-input="inv-r"]')) / 100, y = Number(getVal(card, '[data-input="inv-y"]'));
      setOut(card, "inv", (p * Math.pow(1 + r, y)).toFixed(2) + " TL");
    },
    "random-number": function (card) {
      const min = Number(getVal(card, '[data-input="rand-min"]')), max = Number(getVal(card, '[data-input="rand-max"]'));
      setOut(card, "rand", String(Math.floor(Math.random() * (max - min + 1)) + min));
    },
    "coin-flip": function (card) { setOut(card, "coin", Math.random() < 0.5 ? "Yazı" : "Tura"); },
    "wheel-spin": spinWheel,
    "lorem-p": function (card) { setOut(card, "lorem", "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore."); },
    "lorem-s": function (card) { setOut(card, "lorem", "Lorem ipsum dolor sit amet."); },
    "case-up": function (card) { const el = getIn(card, '[data-input="case-text"]'); if (el) setOut(card, "case", el.value.toUpperCase()); },
    "case-low": function (card) { const el = getIn(card, '[data-input="case-text"]'); if (el) setOut(card, "case", el.value.toLowerCase()); },
    "case-title": function (card) {
      const el = getIn(card, '[data-input="case-text"]');
      if (el) setOut(card, "case", el.value.replace(/\w\S*/g, function (t) { return t.charAt(0).toUpperCase() + t.substr(1).toLowerCase(); }));
    },
    "slug-gen": function (card) {
      const s = getVal(card, '[data-input="slug-src"]');
      setOut(card, "slug", s.toLowerCase().replace(/[^a-z0-9ğüşıöçĞÜŞİÖÇ\s-]/g, "").trim().replace(/\s+/g, "-"));
    },
    "password-gen": function (card, el, h) {
      const len = Number(getVal(card, '[data-input="pw-len"]')) || 16;
      const chars = "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%";
      let pw = ""; for (let i = 0; i < len; i++) pw += chars[Math.floor(Math.random() * chars.length)];
      setOut(card, "pw", pw);
    },
    "password-copy": function (card, el, h) { const t = getIn(card, '[data-out="pw"]'); if (t && h.copyText) h.copyText(t.textContent); },
    "uuid-gen": function (card) {
      setOut(card, "uuid", "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0; return (c === "x" ? r : (r & 3 | 8)).toString(16);
      }));
    },
    "uuid-copy": function (card, el, h) { const t = getIn(card, '[data-out="uuid"]'); if (t && h.copyText) h.copyText(t.textContent); },
    "contrast-check": function (card) {
      const fg = getVal(card, '[data-input="con-fg"]'), bg = getVal(card, '[data-input="con-bg"]');
      setText(card, '[data-out="contrast"]', contrastRatio(fg, bg));
    },
    "text-diff": function (card) {
      const a = getVal(card, '[data-input="diff-a"]').split("\n"), b = getVal(card, '[data-input="diff-b"]').split("\n");
      const max = Math.max(a.length, b.length);
      let out = "";
      for (let i = 0; i < max; i++) {
        const x = a[i] || "", y = b[i] || "";
        out += (x === y ? "  " : "≠ ") + (x || "—") + " | " + (y || "—") + "\n";
      }
      setOut(card, "diff", out);
    },
    "gradient-gen": function (card) {
      const c1 = getVal(card, '[data-input="grad-c1"]'), c2 = getVal(card, '[data-input="grad-c2"]');
      setOut(card, "grad-css", "background: linear-gradient(135deg, " + c1 + ", " + c2 + ");");
    },
    "check-add": function (card) {
      const id = wid(card), input = getIn(card, '[data-input="check-item"]');
      if (!input || !input.value.trim()) return;
      const items = lsGet(id, "check", []);
      items.push({ text: input.value.trim(), done: false });
      lsSet(id, "check", items); input.value = ""; loadLists(card, { type: "daily-checklist" });
    },
    "check-toggle": function (card, el) {
      const id = wid(card), idx = Number(el.dataset.idx);
      const items = lsGet(id, "check", []);
      if (items[idx]) items[idx].done = el.checked;
      lsSet(id, "check", items);
    },
    "habit-done": function (card) {
      const id = wid(card);
      const n = lsGet(id, "streak", 0) + 1;
      lsSet(id, "streak", n); setText(card, '[data-out="streak"]', String(n));
    },
    "water-plus": function (card) { const id = wid(card); const n = lsGet(id, "water", 0) + 1; lsSet(id, "water", n); setText(card, '[data-out="water"]', String(n)); },
    "water-minus": function (card) { const id = wid(card); const n = Math.max(0, lsGet(id, "water", 0) - 1); lsSet(id, "water", n); setText(card, '[data-out="water"]', String(n)); },
    "steps-save": function (card) {
      const goal = Number(getVal(card, '[data-input="steps-goal"]')) || 1;
      const today = Number(getVal(card, '[data-input="steps-today"]')) || 0;
      const bar = getIn(card, '[data-out="steps-bar"]');
      if (bar) bar.style.width = Math.min(100, Math.round(today / goal * 100)) + "%";
    },
    "sleep-calc": function (card) {
      const wake = getVal(card, '[data-input="sleep-wake"]');
      if (!wake) return;
      const parts = wake.split(":").map(Number);
      const cycles = [6, 7.5, 9].map(function (c) {
        const d = new Date(); d.setHours(parts[0], parts[1] - c * 60, 0, 0);
        return d.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
      });
      setOut(card, "sleep", "Yatış: " + cycles.join(", "));
    },
    "stand-start": function (card, el, h) {
      const st = ensureState(card);
      if (st.standId) return;
      const min = Number(getVal(card, '[data-input="stand-min"]')) || 45;
      st.standId = addInterval(function () {
        setOut(card, "stand", "Kalkma zamanı!");
        if (h.showToast) h.showToast("Ayağa kalk!");
      }, min * 60000);
      setOut(card, "stand", min + " dk sonra");
    },
    "stand-stop": function (card) {
      const st = ensureState(card);
      if (st.standId) { stopInterval(st.standId); st.standId = null; }
      setOut(card, "stand", "Kapalı");
    },
    "breath-start": function (card) {
      const st = ensureState(card);
      if (st.breathId) return;
      const phases = [
        { label: "Nefes al", sec: 4, scale: 1.15 },
        { label: "Tut", sec: 7, scale: 1.05 },
        { label: "Ver", sec: 8, scale: 0.85 },
      ];
      let pi = 0;
      let left = phases[0].sec;
      const circle = getIn(card, "[data-breath-circle]");
      function tick() {
        const p = phases[pi];
        setOut(card, "breath", p.label + " · " + left + " sn");
        if (circle) {
          circle.textContent = String(left);
          circle.style.transform = "scale(" + p.scale + ")";
        }
        left -= 1;
        if (left < 0) {
          pi = (pi + 1) % phases.length;
          left = phases[pi].sec;
        }
      }
      tick();
      st.breathId = addInterval(tick, 1000);
    },
    "breath-stop": function (card) {
      const st = ensureState(card);
      if (st.breathId) { stopInterval(st.breathId); st.breathId = null; }
      const circle = getIn(card, "[data-breath-circle]");
      if (circle) { circle.style.transform = "scale(1)"; circle.textContent = "4"; }
      setOut(card, "breath", "Durduruldu");
    },
    "eisenhower-save": function (card) {
      const id = wid(card);
      for (let i = 1; i <= 4; i++) lsSet(id, "eis" + i, getVal(card, '[data-input="eis-' + i + '"]'));
      if (arguments[2] && arguments[2].showToast) arguments[2].showToast("Kaydedildi");
    },
    "quick-notes-save": function (card, el, h) {
      lsSet(wid(card), "notes", getVal(card, '[data-input="quick-notes"]'));
      if (h.showToast) h.showToast("Kaydedildi");
    },
    "weekly-goal-save": function (card, el, h) {
      lsSet(wid(card), "wgoal", getVal(card, '[data-input="weekly-goal"]'));
      if (h.showToast) h.showToast("Kaydedildi");
    },
    "todo-add": function (card) {
      const id = wid(card), input = getIn(card, '[data-input="todo-text"]');
      if (!input || !input.value.trim()) return;
      const items = lsGet(id, "todo", []);
      items.push(input.value.trim()); lsSet(id, "todo", items); input.value = "";
      loadLists(card, { type: "todo-list" });
    },
    "todo-del": function (card, el) {
      const id = wid(card), idx = Number(el.dataset.idx);
      const items = lsGet(id, "todo", []);
      items.splice(idx, 1); lsSet(id, "todo", items);
      loadLists(card, { type: "todo-list" });
    },
    "music-search": function (card) {
      const q = encodeURIComponent(getVal(card, '[data-input="music-q"]') || "lofi");
      window.open("https://www.youtube.com/results?search_query=" + q, "_blank");
    },
    "guess-submit": function (card) {
      const st = ensureState(card);
      const v = Number(getVal(card, '[data-input="guess-val"]'));
      if (v === st.guessTarget) setOut(card, "guess-msg", "Doğru!");
      else setOut(card, "guess-msg", v < st.guessTarget ? "Daha büyük" : "Daha küçük");
    },
    "guess-new": function (card) { newGuess(card); },
    rps: function (card, el) {
      const opts = ["Taş", "Kağıt", "Makas"];
      const cpu = opts[Math.floor(Math.random() * 3)];
      const win = (el.dataset.choice === "Taş" && cpu === "Makas") || (el.dataset.choice === "Kağıt" && cpu === "Taş") || (el.dataset.choice === "Makas" && cpu === "Kağıt");
      const draw = el.dataset.choice === cpu;
      setOut(card, "rps", "Sen: " + el.dataset.choice + " · CPU: " + cpu + " · " + (draw ? "Berabere" : win ? "Kazandın" : "Kaybettin"));
    },
    "memory-flip": function (card, el) {
      const st = ensureState(card).memory;
      if (!st || st.open.length >= 2 || el.textContent !== "?") return;
      const idx = Number(el.dataset.idx);
      el.textContent = st.cards[idx];
      st.open.push({ idx: idx, el: el });
      if (st.open.length === 2) {
        const a = st.open[0], b = st.open[1];
        if (st.cards[a.idx] === st.cards[b.idx]) { st.matched += 2; st.open = []; if (st.matched >= 8) setOut(card, "memory", "Kazandın!"); }
        else setTimeout(function () { a.el.textContent = "?"; b.el.textContent = "?"; st.open = []; }, 700);
      }
    },
    "scramble-check": function (card) {
      const st = ensureState(card);
      const ans = getVal(card, '[data-input="scramble-ans"]');
      setOut(card, "scramble-word", ans === st.scrambleWord ? "Doğru!" : "Tekrar dene");
    },
    "scramble-new": function (card) { newScramble(card); },
    "emoji-pick": function (card, el) { setOut(card, "emoji", el.dataset.emoji); },
    "color-guess": function (card, el) {
      const st = ensureState(card);
      setOut(card, "color-game", Number(el.dataset.idx) === st.colorAnswer ? "Doğru!" : "Yanlış");
    },
    "snake-start": function (card) {
      const st = ensureState(card);
      st.snake = { body: [{ x: 10, y: 10 }], dx: 1, dy: 0, food: { x: 5, y: 5 }, alive: true };
      if (st.snakeLoop) stopInterval(st.snakeLoop);
      st.snakeLoop = addInterval(function () { if (st.snakeTick) st.snakeTick(); }, 150);
      if (st.snakeDraw) st.snakeDraw();
    },
    "quiz-pick": function (card, el) { setOut(card, "quiz", "Seçim: " + el.textContent); },
    "zikir-plus": function (card) { const id = wid(card); const n = lsGet(id, "zikir", 0) + 1; lsSet(id, "zikir", n); setText(card, '[data-out="zikir"]', String(n)); },
    "zikir-minus": function (card) { const id = wid(card); const n = Math.max(0, lsGet(id, "zikir", 0) - 1); lsSet(id, "zikir", n); setText(card, '[data-out="zikir"]', String(n)); },
    "zikir-reset": function (card) { lsSet(wid(card), "zikir", 0); setText(card, '[data-out="zikir"]', "0"); },
    "gratitude-add": function (card) {
      const id = wid(card), input = getIn(card, '[data-input="gratitude-text"]');
      if (!input || !input.value.trim()) return;
      const items = lsGet(id, "gratitude", []);
      items.push(input.value.trim()); lsSet(id, "gratitude", items); input.value = "";
      loadLists(card, { type: "gratitude-log" });
    },
    "share-wa": function () { window.open("https://wa.me/?text=" + encodeURIComponent("BalabanWidgets"), "_blank"); },
    "share-tg": function () { window.open("https://t.me/share/url?url=" + encodeURIComponent(location.href), "_blank"); },
    "share-x": function () { window.open("https://twitter.com/intent/tweet?text=" + encodeURIComponent("BalabanWidgets"), "_blank"); },
    "rss-open": function () { window.open("/feed.xml", "_blank"); },
    "font-larger": function (card) { card.style.fontSize = (parseFloat(getComputedStyle(card).fontSize) + 2) + "px"; },
    "font-smaller": function (card) { card.style.fontSize = Math.max(10, parseFloat(getComputedStyle(card).fontSize) - 2) + "px"; },
    "high-contrast": function (card) { card.classList.toggle("high-contrast"); },
    "dark-mode": function () { document.documentElement.classList.toggle("dark"); },
    "cb-none": function (card) { card.style.filter = ""; },
    "cb-deut": function (card) { card.style.filter = "url(#deuteranopia)"; },
    "cb-prot": function (card) { card.style.filter = "grayscale(0.4) contrast(1.2)"; },
    "tab-demo": function (card, el) {
      card.querySelectorAll('[data-action="tab-demo"]').forEach(function (b) { b.classList.remove("active"); });
      el.classList.add("active");
      card.querySelectorAll("[data-tab-panel]").forEach(function (p) { p.hidden = p.dataset.tabPanel !== el.dataset.tab; });
    },
    "acc-toggle": function (card, el) {
      const p = getIn(card, '[data-acc-panel="' + el.dataset.acc + '"]');
      if (p) p.hidden = !p.hidden;
    },
    "page-demo": function (card, el) {
      card.querySelectorAll('[data-action="page-demo"]').forEach(function (b) { b.classList.remove("active"); });
      el.classList.add("active");
    },
    rate: function (card, el) {
      const n = Number(el.dataset.star);
      card.querySelectorAll('[data-action="rate"]').forEach(function (b, i) { b.classList.toggle("active", i < n); });
    },
    "noise-start": function (card) {
      const st = ensureState(card);
      if (st.noiseCtx) return;
      const ac = new (window.AudioContext || window.webkitAudioContext)();
      const buf = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      const src = ac.createBufferSource();
      src.buffer = buf; src.loop = true;
      src.connect(ac.destination); src.start();
      st.noiseCtx = ac; st.noiseSrc = src;
      setOut(card, "noise", "Açık");
    },
    "noise-stop": function (card) {
      const st = ensureState(card);
      if (st.noiseSrc) { try { st.noiseSrc.stop(); } catch (e) {} st.noiseSrc = null; }
      if (st.noiseCtx) { st.noiseCtx.close(); st.noiseCtx = null; }
      setOut(card, "noise", "Kapalı");
    },
    "metro-start": function (card) {
      const st = ensureState(card);
      if (st.metroId) return;
      const bpm = Number(getVal(card, '[data-input="metro-bpm"]')) || 100;
      st.metroId = addInterval(function () {
        const ac = new (window.AudioContext || window.webkitAudioContext)();
        const o = ac.createOscillator(); o.frequency.value = 800;
        o.connect(ac.destination); o.start(); o.stop(ac.currentTime + 0.05);
      }, 60000 / bpm);
      setOut(card, "metro", "Açık · " + bpm + " BPM");
    },
    "metro-stop": function (card) {
      const st = ensureState(card);
      if (st.metroId) { stopInterval(st.metroId); st.metroId = null; }
      setOut(card, "metro", "Kapalı");
    },
    "audio-start": function (card) {
      const st = ensureState(card);
      const canvas = getIn(card, "[data-audio-canvas]");
      if (!canvas || !navigator.mediaDevices) return;
      navigator.mediaDevices.getUserMedia({ audio: true }).then(function (stream) {
        const ac = new (window.AudioContext || window.webkitAudioContext)();
        const src = ac.createMediaStreamSource(stream);
        const analyser = ac.createAnalyser();
        src.connect(analyser);
        st.audioStream = stream; st.audioAnalyser = analyser;
        const ctx2 = canvas.getContext("2d");
        const data = new Uint8Array(analyser.frequencyBinCount);
        st.audioId = addInterval(function () {
          analyser.getByteFrequencyData(data);
          ctx2.fillStyle = "#0f172a"; ctx2.fillRect(0, 0, 200, 80);
          for (let i = 0; i < data.length; i++) {
            ctx2.fillStyle = "#a78bfa";
            ctx2.fillRect(i * 2, 80 - data[i] / 3, 2, data[i] / 3);
          }
        }, 50);
      });
    },
    "audio-stop": function (card) {
      const st = ensureState(card);
      if (st.audioId) { stopInterval(st.audioId); st.audioId = null; }
      if (st.audioStream) st.audioStream.getTracks().forEach(function (t) { t.stop(); });
    },
    "profit-loss-calc": function (card) {
      const buy = Number(getVal(card, '[data-input="pl-buy"]'));
      const sell = Number(getVal(card, '[data-input="pl-sell"]'));
      const diff = sell - buy;
      const rate = buy ? (diff / buy) * 100 : 0;
      setOut(card, "pl", (diff >= 0 ? "Kar: " : "Zarar: ") + diff.toFixed(2) + " (" + rate.toFixed(2) + "%)");
    },
    "break-even-calc": function (card) {
      const fixed = Number(getVal(card, '[data-input="be-fixed"]'));
      const price = Number(getVal(card, '[data-input="be-price"]'));
      const cost = Number(getVal(card, '[data-input="be-cost"]'));
      const n = price > cost ? Math.ceil(fixed / (price - cost)) : 0;
      setOut(card, "be", n ? ("Başa baş: " + n + " adet") : "Birim fiyat maliyetten büyük olmalı");
    },
    "commission-calc": function (card) {
      const amt = Number(getVal(card, '[data-input="com-amt"]'));
      const rate = Number(getVal(card, '[data-input="com-rate"]'));
      const com = amt * rate / 100;
      setOut(card, "com", "Komisyon: " + com.toFixed(2) + " · Net: " + (amt - com).toFixed(2));
    },
    "installment-split": function (card) {
      const total = Number(getVal(card, '[data-input="inst-total"]'));
      const count = Math.max(1, Number(getVal(card, '[data-input="inst-count"]')));
      setOut(card, "inst", (total / count).toFixed(2) + " / taksit");
    },
    "budget-503020": function (card) {
      const inc = Number(getVal(card, '[data-input="budget-income"]'));
      setOut(card, "budget", "İhtiyaç: " + (inc * 0.5).toFixed(2) + " · İstek: " + (inc * 0.3).toFixed(2) + " · Birikim: " + (inc * 0.2).toFixed(2));
    },
    "savings-goal": function (card) {
      const goal = Number(getVal(card, '[data-input="sg-goal"]'));
      const month = Math.max(1, Number(getVal(card, '[data-input="sg-month"]')));
      setOut(card, "sg", "Aylık hedef: " + (goal / month).toFixed(2));
    },
    "simple-interest": function (card) {
      const p = Number(getVal(card, '[data-input="si-p"]'));
      const r = Number(getVal(card, '[data-input="si-r"]')) / 100;
      const t = Number(getVal(card, '[data-input="si-t"]'));
      setOut(card, "si", "Faiz: " + (p * r * t).toFixed(2) + " · Toplam: " + (p * (1 + r * t)).toFixed(2));
    },
    "compound-interest": function (card) {
      const p = Number(getVal(card, '[data-input="ci-p"]'));
      const r = Number(getVal(card, '[data-input="ci-r"]')) / 100;
      const t = Number(getVal(card, '[data-input="ci-t"]'));
      setOut(card, "ci", "Toplam: " + (p * Math.pow(1 + r, t)).toFixed(2));
    },
    "days-until-birth": function (card) {
      const raw = getVal(card, '[data-input="dubirth"]');
      if (!raw) return;
      const b = new Date(raw), now = new Date();
      const next = new Date(now.getFullYear(), b.getMonth(), b.getDate());
      if (next < now) next.setFullYear(next.getFullYear() + 1);
      setOut(card, "dub", Math.ceil((next - now) / 86400000) + " gün");
    },
    "pomodoro-cycles": function (card) {
      const min = Number(getVal(card, '[data-input="pc-min"]'));
      const cycles = Math.floor(min / 30);
      setOut(card, "pc", cycles + " tam tur (25+5)");
    },
    "time-diff": function (card) {
      const a = getVal(card, '[data-input="td-a"]');
      const b = getVal(card, '[data-input="td-b"]');
      if (!a || !b) return;
      const [ah, am] = a.split(":").map(Number);
      const [bh, bm] = b.split(":").map(Number);
      let diff = (bh * 60 + bm) - (ah * 60 + am);
      if (diff < 0) diff += 1440;
      setOut(card, "td", Math.floor(diff / 60) + "s " + (diff % 60) + "dk");
    },
    "water-intake": function (card) {
      const kg = Number(getVal(card, '[data-input="wi-kg"]'));
      setOut(card, "wi", "Yaklaşık " + ((kg * 0.033).toFixed(2)) + " L / gün");
    },
    "calorie-calc": function (card) {
      const sex = getVal(card, '[data-input="cal-sex"]');
      const age = Number(getVal(card, '[data-input="cal-age"]'));
      const h = Number(getVal(card, '[data-input="cal-h"]'));
      const w = Number(getVal(card, '[data-input="cal-w"]'));
      const bmr = sex === "f" ? (10 * w + 6.25 * h - 5 * age - 161) : (10 * w + 6.25 * h - 5 * age + 5);
      setOut(card, "cal", "BMR: " + bmr.toFixed(0) + " kcal · Orta aktif TDEE: " + (bmr * 1.55).toFixed(0));
    },
    "macro-calc": function (card) {
      const cal = Number(getVal(card, '[data-input="mac-cal"]'));
      const p = (cal * 0.3 / 4), c = (cal * 0.4 / 4), f = (cal * 0.3 / 9);
      setOut(card, "mac", "Protein: " + p.toFixed(0) + "g · Karb: " + c.toFixed(0) + "g · Yağ: " + f.toFixed(0) + "g");
    },
    "ideal-weight": function (card) {
      const h = Number(getVal(card, '[data-input="iw-h"]')) / 100;
      const min = 18.5 * h * h, max = 24.9 * h * h;
      setOut(card, "iw", "Aralık: " + min.toFixed(1) + " - " + max.toFixed(1) + " kg");
    },
    "heart-rate-zones": function (card) {
      const age = Number(getVal(card, '[data-input="hr-age"]'));
      const max = 220 - age;
      setOut(card, "hr", "Max: " + max + " · Yağ yakım: " + Math.round(max * 0.6) + "-" + Math.round(max * 0.7) + " bpm");
    },
    "grade-average": function (card) {
      const nums = getVal(card, '[data-input="ga-list"]').split(",").map((n) => Number(n.trim())).filter((n) => !Number.isNaN(n));
      const avg = nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
      setOut(card, "ga", "Ortalama: " + avg.toFixed(2));
    },
    "weighted-average": function (card) {
      const grades = getVal(card, '[data-input="wa-grades"]').split(",").map((n) => Number(n.trim()));
      const ws = getVal(card, '[data-input="wa-weights"]').split(",").map((n) => Number(n.trim()));
      const tw = ws.reduce((a, b) => a + b, 0) || 1;
      const sum = grades.reduce((a, g, i) => a + (g * (ws[i] || 0)), 0);
      setOut(card, "wa", "Ağırlıklı ortalama: " + (sum / tw).toFixed(2));
    },
    "net-score": function (card) {
      const d = Number(getVal(card, '[data-input="ns-d"]'));
      const y = Number(getVal(card, '[data-input="ns-y"]'));
      setOut(card, "ns", "Net: " + (d - y / 4).toFixed(2));
    },
    "percentile-calc": function (card) {
      const r = Number(getVal(card, '[data-input="pr-rank"]'));
      const t = Number(getVal(card, '[data-input="pr-total"]')) || 1;
      setOut(card, "pr", "% dilim: " + (((t - r) / t) * 100).toFixed(2));
    },
    "gcd-lcm": function (card) {
      let a = Math.abs(Number(getVal(card, '[data-input="gl-a"]'))), b = Math.abs(Number(getVal(card, '[data-input="gl-b"]')));
      const x = a, y = b;
      while (b) { const tmp = b; b = a % b; a = tmp; }
      const gcd = a || 0;
      const lcm = gcd ? Math.abs(x * y) / gcd : 0;
      setOut(card, "gl", "EBOB: " + gcd + " · EKOK: " + lcm);
    },
    "power-root": function (card) {
      const a = Number(getVal(card, '[data-input="prw-a"]'));
      const p = Number(getVal(card, '[data-input="prw-p"]'));
      setOut(card, "prw", "a^p: " + Math.pow(a, p).toFixed(4) + " · √a: " + (a >= 0 ? Math.sqrt(a).toFixed(4) : "tanımsız"));
    },
    "linear-equation": function (card) {
      const a = Number(getVal(card, '[data-input="le-a"]'));
      const b = Number(getVal(card, '[data-input="le-b"]'));
      setOut(card, "le", a === 0 ? "a=0 olamaz" : ("x = " + (-b / a).toFixed(4)));
    },
    "ratio-proportion": function (card) {
      const a = Number(getVal(card, '[data-input="rp-a"]'));
      const b = Number(getVal(card, '[data-input="rp-b"]'));
      const c = Number(getVal(card, '[data-input="rp-c"]'));
      setOut(card, "rp", "x = " + ((b * c) / (a || 1)).toFixed(4));
    },
    "fraction-decimal-percent": function (card) {
      const s = getVal(card, '[data-input="fdp"]');
      const m = s.match(/^(\d+)\s*\/\s*(\d+)$/);
      if (!m) { setOut(card, "fdp", "Geçersiz kesir"); return; }
      const dec = Number(m[1]) / Number(m[2]);
      setOut(card, "fdp", "Ondalık: " + dec.toFixed(4) + " · Yüzde: %" + (dec * 100).toFixed(2));
    },
    "geometry-calc": function (card) {
      const sh = getVal(card, '[data-input="geo-shape"]');
      const a = Number(getVal(card, '[data-input="geo-a"]'));
      const b = Number(getVal(card, '[data-input="geo-b"]'));
      let area = 0, peri = 0;
      if (sh === "square") { area = a * a; peri = 4 * a; }
      if (sh === "rect") { area = a * b; peri = 2 * (a + b); }
      if (sh === "circle") { area = Math.PI * a * a; peri = 2 * Math.PI * a; }
      if (sh === "tri") { area = (a * b) / 2; peri = a + b + Math.sqrt(a * a + b * b); }
      setOut(card, "geo", "Alan: " + area.toFixed(2) + " · Çevre: " + peri.toFixed(2));
    },
    "content-goal": function (card) {
      const total = Number(getVal(card, '[data-input="cg-total"]'));
      const days = Math.max(1, Number(getVal(card, '[data-input="cg-days"]')));
      setOut(card, "cg", "Günlük hedef: " + Math.ceil(total / days) + " kelime");
    },
    "publish-calendar": function (card) {
      const s = new Date(getVal(card, '[data-input="pc-start"]'));
      const e = new Date(getVal(card, '[data-input="pc-end"]'));
      const days = Math.max(0, Math.round((e - s) / 86400000));
      setOut(card, "pcal", days + " gün");
    },
    "qr-gen": function (card, el, helpers) {
      const text = getVal(card, '[data-input="qr-text"]') || "BalabanWidgets";
      const canvas = getIn(card, "[data-qr-canvas]");
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      const size = 21;
      const cell = Math.floor(canvas.width / size);
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      let h = 0;
      for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) >>> 0;
      function fill(x, y) {
        ctx.fillStyle = "#0f172a";
        ctx.fillRect(x * cell, y * cell, cell, cell);
      }
      function finder(ox, oy) {
        for (let y = 0; y < 7; y++) for (let x = 0; x < 7; x++) {
          if (x === 0 || x === 6 || y === 0 || y === 6 || (x > 1 && x < 5 && y > 1 && y < 5)) fill(ox + x, oy + y);
        }
      }
      finder(0, 0); finder(size - 7, 0); finder(0, size - 7);
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          if ((x < 8 && y < 8) || (x > size - 9 && y < 8) || (x < 8 && y > size - 9)) continue;
          if (((h + x * 17 + y * 31) % 5) < 2) fill(x, y);
        }
      }
      helpers.showToast && helpers.showToast("QR deseni oluşturuldu");
    },
    "qr-copy": function (card, el, helpers) {
      const text = getVal(card, '[data-input="qr-text"]') || "";
      if (helpers.copyText) helpers.copyText(text).then(function (ok) {
        helpers.showToast && helpers.showToast(ok ? "Metin kopyalandı" : "Kopyalanamadı");
      });
    }
  };

  function bind(card, widget, helpers) {
    helpers = helpers || {};
    card.dataset.widgetId = widget.id;
    loadLists(card, widget);
    if (widget.type === "mini-snake") bindSnake(card);
    if (widget.type === "multi-dice") {
      const tray = getIn(card, "[data-dice-tray]");
      if (tray) tray.addEventListener("click", function () {
        tray.textContent = [1,2,3].map(function () { return "⚀⚁⚂⚃⚄⚅"[Math.floor(Math.random()*6)]; }).join(" ");
      });
    }
    if (widget.type === "qibla-compass" && window.DeviceOrientationEvent) {
      window.addEventListener("deviceorientation", function (e) {
        const compass = getIn(card, "[data-compass]");
        if (compass && e.alpha != null) compass.style.transform = "rotate(" + (e.alpha - qiblaBearing()) + "deg)";
      });
    }

    card.addEventListener("click", function (e) {
      const el = e.target.closest("[data-action]");
      if (!el || !card.contains(el)) return;
      const fn = actions[el.dataset.action];
      if (fn) fn(card, el, helpers);
    });

    card.addEventListener("input", function (e) {
      const el = e.target;
      if (el.matches("[data-slider]")) {
        const val = getIn(card, "[data-slider-val]");
        if (val) val.textContent = el.value;
      }
      if (el.matches('[data-input="shadow-val"]')) {
        const box = getIn(card, "[data-shadow-box]");
        if (box) box.style.boxShadow = "0 " + el.value + "px 30px rgba(0,0,0,.2)";
      }
      if (el.matches('[data-input="radius-val"]')) {
        const box = getIn(card, "[data-radius-box]");
        if (box) box.style.borderRadius = el.value + "px";
      }
      if (el.matches('[data-input="pw-len"]')) setText(card, '[data-out="pw-len"]', el.value);
      if (el.matches('[data-input="metro-bpm"]')) setText(card, '[data-out="metro-bpm"]', el.value);
      if (el.matches('[data-input="md-src"]')) setOut(card, "md-preview", mdBasic(el.value));
      if (el.matches('[data-input="read-text"]')) {
        const w = el.value.trim().split(/\s+/).filter(Boolean).length;
        setOut(card, "read-time", Math.max(1, Math.ceil(w / 200)) + " dk okuma");
      }
      if (el.matches('[data-input="char-text"]')) {
        const t = el.value;
        setText(card, '[data-out="chars"]', String(t.length));
        setText(card, '[data-out="words"]', String(t.trim() ? t.trim().split(/\s+/).length : 0));
      }
      if (el.matches('[data-input="color-hex"]')) {
        const hex = el.value;
        const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if (m) {
          setOut(card, "color-rgb", "rgb(" + parseInt(m[1],16) + "," + parseInt(m[2],16) + "," + parseInt(m[3],16) + ")");
          setOut(card, "color-hsl", hex);
        }
      }
      if (el.matches('[data-input="avatar-name"]')) {
        const n = el.value.trim();
        setOut(card, "avatar", n ? n.charAt(0).toUpperCase() : "A");
      }
      if (el.matches('[data-input="u-len"]')) setOut(card, "u-len", (Number(el.value) / 2.54).toFixed(2) + " inch");
      if (el.matches('[data-input="u-mass"]')) setOut(card, "u-mass", (Number(el.value) * 2.20462).toFixed(2) + " lb");
      if (el.matches('[data-input="u-temp"]')) setOut(card, "u-temp", (Number(el.value) * 9/5 + 32).toFixed(1) + " °F");
      if (el.matches('[data-input="kmv"]')) setOut(card, "kmv", (Number(el.value) * 0.621371).toFixed(3) + " mil");
      if (el.matches('[data-input="lgv"]')) setOut(card, "lgv", (Number(el.value) * 0.264172).toFixed(3) + " galon");
      if (el.matches('[data-input="acv"]')) setOut(card, "acv", (Number(el.value) * 10.7639).toFixed(3) + " ft²");
      if (el.matches('[data-input="bcv"]')) {
        const b = Number(el.value);
        setOut(card, "bcv", (b / 1024).toFixed(2) + " KB · " + (b / (1024 ** 2)).toFixed(2) + " MB · " + (b / (1024 ** 3)).toFixed(4) + " GB");
      }
      if (el.matches('[data-input="mhv"]')) setOut(card, "mhv", (Number(el.value) / 60).toFixed(2) + " saat");
      if (el.matches('[data-input="ppv"], [data-input="ppp"]')) {
        const v = Number(getVal(card, '[data-input="ppv"]'));
        const p = Number(getVal(card, '[data-input="ppp"]'));
        setOut(card, "ppv", "Yüzde: " + (v * p / 100).toFixed(2) + " · Puan: " + (v + p).toFixed(2));
      }
      if (el.matches('[data-input="dfv"]')) {
        const d = new Date(el.value);
        if (!Number.isNaN(d.getTime())) setOut(card, "dfv", d.toLocaleDateString("tr-TR") + " | " + d.toISOString().slice(0, 10));
      }
      if (el.matches('[data-input="spw"]')) setOut(card, "spw", Math.max(1, Math.ceil(Number(el.value) / 130)) + " dk konuşma");
      if (el.matches('[data-input="tdx"]')) {
        const txt = el.value || "";
        const words = txt.trim() ? txt.trim().split(/\s+/).length : 0;
        const chars = txt.length || 1;
        setOut(card, "tdx", "Kelime: " + words + " · Yoğunluk: " + ((words / chars) * 100).toFixed(2) + "%");
      }
    });
  }

  function startGlobal() {
    if (globalTimer) clearInterval(globalTimer);
    const tick = function () {
      const now = new Date();
      document.querySelectorAll("[data-live-clock]").forEach(function (el) {
        const tz = el.dataset.tz;
        el.textContent = now.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit", second: tz ? undefined : "2-digit", timeZone: tz });
      });
      document.querySelectorAll("[data-seconds-today]").forEach(function (el) {
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        el.textContent = String(Math.floor((now - start) / 1000));
      });
      document.querySelectorAll("[data-countdown-display]").forEach(function (el) {
        const card = el.closest("[data-widget-id]");
        if (!card) return;
        const st = cardState.get(card);
        if (!st || !st.countdownTarget) return;
        const left = Math.max(0, st.countdownTarget - Date.now());
        el.textContent = left ? fmtHMS(left / 1000) : "Bitti!";
      });
    };
    tick();
    globalTimer = setInterval(tick, 1000);
  }

  return { render: render, bind: bind, startGlobal: startGlobal, stopInterval: stopInterval };
})();
