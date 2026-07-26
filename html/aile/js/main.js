/* =====================================================
   BALABAN AİLESİ — Etkileşimler
   ===================================================== */
(function () {
  "use strict";

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Açılış ekranı ---------- */
  (function loader() {
    const box = $("#loader");
    const bar = $("#loaderBar");
    if (!box) return;

    let pct = 0;
    const tick = setInterval(() => {
      pct = Math.min(pct + Math.random() * 18, 100);
      if (bar) bar.style.width = pct + "%";
      if (pct === 100) clearInterval(tick);
    }, 130);

    const finish = () => {
      pct = 100;
      if (bar) bar.style.width = "100%";
      clearInterval(tick);
      setTimeout(() => {
        box.classList.add("is-done");
        document.body.classList.add("is-ready");
        setTimeout(() => box.remove(), 900);
      }, 420);
    };

    window.addEventListener("load", finish);
    setTimeout(finish, 4000);
  })();

  /* ---------- Tema ---------- */
  (function theme() {
    const root = document.documentElement;
    const btn = $("#themeBtn");
    const saved = localStorage.getItem("aile-theme");
    if (saved) root.setAttribute("data-theme", saved);

    btn?.addEventListener("click", () => {
      const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      localStorage.setItem("aile-theme", next);
    });
  })();

  /* ---------- Navigasyon ---------- */
  (function nav() {
    const bar = $("#nav");
    const links = $("#navLinks");
    const burger = $("#burger");

    const close = () => {
      links?.classList.remove("is-open");
      burger?.classList.remove("is-open");
      burger?.setAttribute("aria-expanded", "false");
      document.body.classList.remove("is-locked");
    };

    burger?.addEventListener("click", () => {
      const open = links.classList.toggle("is-open");
      burger.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", String(open));
      document.body.classList.toggle("is-locked", open);
    });

    $$("#navLinks a").forEach((a) => a.addEventListener("click", close));
    window.addEventListener("keydown", (e) => e.key === "Escape" && close());

    const onScroll = () => bar?.classList.toggle("is-stuck", window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    // Aktif bölüm işaretleme
    const anchors = $$("#navLinks a[href^='#']");
    const sections = anchors
      .map((a) => document.getElementById(a.getAttribute("href").slice(1)))
      .filter(Boolean);

    if (sections.length && "IntersectionObserver" in window) {
      const spy = new IntersectionObserver(
        (entries) => {
          entries.forEach((en) => {
            if (!en.isIntersecting) return;
            anchors.forEach((a) =>
              a.classList.toggle("is-current", a.getAttribute("href") === "#" + en.target.id)
            );
          });
        },
        { rootMargin: "-45% 0px -50% 0px" }
      );
      sections.forEach((s) => spy.observe(s));
    }
  })();

  /* ---------- Scroll göstergesi + yukarı çık ---------- */
  (function scrollUI() {
    const bar = $("#scrollBar");
    const top = $("#toTop");

    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
      if (bar) bar.style.width = pct + "%";
      top?.classList.toggle("is-visible", window.scrollY > window.innerHeight * 0.7);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    top?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" }));
  })();

  /* ---------- Reveal animasyonları ---------- */
  (function reveal() {
    const items = $$(".reveal, .tl__item");
    if (!items.length) return;

    if (!("IntersectionObserver" in window) || reduced) {
      items.forEach((el) => el.classList.add("is-in"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en, i) => {
          if (!en.isIntersecting) return;
          setTimeout(() => en.target.classList.add("is-in"), i * 90);
          io.unobserve(en.target);
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -8% 0px" }
    );
    items.forEach((el) => io.observe(el));
  })();

  /* ---------- Hero slayt gösterisi ---------- */
  (function heroSlider() {
    const slides = $$("#heroSlides .hero__slide");
    const dots = $("#heroDots");
    if (slides.length < 2) return;

    let index = 0;
    let timer = null;
    const DELAY = 6200;

    slides.forEach((_, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.setAttribute("aria-label", `${i + 1}. fotoğraf`);
      b.className = i === 0 ? "is-active" : "";
      b.addEventListener("click", () => go(i));
      dots?.appendChild(b);
    });

    function go(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach((s, i) => s.classList.toggle("is-active", i === index));
      $$("button", dots).forEach((d, i) => d.classList.toggle("is-active", i === index));
      restart();
    }

    function restart() {
      clearInterval(timer);
      if (!reduced) timer = setInterval(() => go(index + 1), DELAY);
    }

    restart();
    document.addEventListener("visibilitychange", () =>
      document.hidden ? clearInterval(timer) : restart()
    );
  })();

  /* ---------- Hero parallax + imleç ışığı ---------- */
  (function pointerFx() {
    if (reduced || !window.matchMedia("(pointer:fine)").matches) return;

    const spot = $("#spotlight");
    const layers = $$("[data-parallax]");
    let x = 0, y = 0, sx = 0, sy = 0, raf = null;

    document.body.classList.add("has-pointer");

    window.addEventListener("pointermove", (e) => {
      x = e.clientX;
      y = e.clientY;
      if (!raf) raf = requestAnimationFrame(loop);
    });

    function loop() {
      sx += (x - sx) * 0.12;
      sy += (y - sy) * 0.12;
      if (spot) spot.style.transform = `translate3d(${sx}px, ${sy + window.scrollY * 0}px, 0)`;

      const cx = (sx / window.innerWidth - 0.5) * 2;
      const cy = (sy / window.innerHeight - 0.5) * 2;
      layers.forEach((el) => {
        const k = parseFloat(el.dataset.parallax) || 0.1;
        el.style.transform = `translate3d(${-cx * k * 26}px, ${-cy * k * 18}px, 0)`;
      });

      raf = Math.abs(x - sx) > 0.4 || Math.abs(y - sy) > 0.4 ? requestAnimationFrame(loop) : null;
    }
  })();

  /* ---------- Sayaçlar ---------- */
  (function counters() {
    const nums = $$(".count");
    if (!nums.length) return;

    const run = (el) => {
      const target = parseInt(el.dataset.target, 10) || 0;
      if (reduced) {
        el.textContent = target.toLocaleString("tr-TR");
        return;
      }
      const dur = 1600;
      const start = performance.now();
      const step = (now) => {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased).toLocaleString("tr-TR");
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    if (!("IntersectionObserver" in window)) {
      nums.forEach(run);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          run(en.target);
          io.unobserve(en.target);
        });
      },
      { threshold: 0.5 }
    );
    nums.forEach((n) => io.observe(n));
  })();

  /* ---------- "Birlikte geçen gün" sayacı ---------- */
  (function daysTogether() {
    const el = $("#daysTogether");
    if (!el) return;
    // Başlangıç tarihini kendinize göre değiştirin.
    const start = new Date(2016, 5, 12);
    const days = Math.max(0, Math.floor((Date.now() - start) / 86400000));
    let shown = 0;
    const step = () => {
      shown = Math.min(shown + Math.ceil(days / 45), days);
      el.textContent = shown.toLocaleString("tr-TR");
      if (shown < days) requestAnimationFrame(step);
    };
    reduced ? (el.textContent = days.toLocaleString("tr-TR")) : requestAnimationFrame(step);
  })();

  /* ---------- Zaman tüneli çizgi dolgusu ---------- */
  (function timelineFill() {
    const line = $("#tlFill");
    const wrap = $(".tl");
    if (!line || !wrap) return;

    const onScroll = () => {
      const r = wrap.getBoundingClientRect();
      const vh = window.innerHeight;
      const pct = ((vh * 0.65 - r.top) / r.height) * 100;
      line.style.height = Math.max(0, Math.min(100, pct)) + "%";
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
  })();

  /* ---------- Albüm filtresi ---------- */
  (function filters() {
    const bar = $("#filters");
    const cards = $$("#grid .card");
    if (!bar || !cards.length) return;

    bar.addEventListener("click", (e) => {
      const btn = e.target.closest(".chip");
      if (!btn) return;

      $$(".chip", bar).forEach((c) => c.classList.toggle("is-active", c === btn));
      const f = btn.dataset.filter;

      cards.forEach((card) => {
        const match = f === "all" || (card.dataset.cat || "").split(" ").includes(f);
        card.classList.toggle("is-hidden", !match);
      });
    });
  })();

  /* ---------- Lightbox ---------- */
  (function lightbox() {
    const box = $("#lightbox");
    const img = $("#lbImg");
    const title = $("#lbTitle");
    const caption = $("#lbCaption");
    const counter = $("#lbCounter");
    const cards = $$("#grid .card");
    if (!box || !cards.length) return;

    let i = 0;
    const visible = () => cards.filter((c) => !c.classList.contains("is-hidden"));

    function show(list, idx) {
      const list2 = list.length ? list : cards;
      i = (idx + list2.length) % list2.length;
      const card = list2[i];
      img.src = card.dataset.src;
      img.alt = card.dataset.title || "";
      title.textContent = card.dataset.title || "";
      caption.textContent = card.dataset.caption || "";
      counter.textContent = `${i + 1} / ${list2.length}`;
    }

    function open(card) {
      const list = visible();
      show(list, list.indexOf(card));
      box.classList.add("is-open");
      document.body.classList.add("is-locked");
      $("#lbClose")?.focus();
    }

    function close() {
      box.classList.remove("is-open");
      document.body.classList.remove("is-locked");
    }

    const move = (dir) => show(visible(), i + dir);

    cards.forEach((card) => {
      card.setAttribute("tabindex", "0");
      card.setAttribute("role", "button");
      card.addEventListener("click", () => open(card));
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          open(card);
        }
      });
    });

    $("#lbClose")?.addEventListener("click", close);
    $("#lbPrev")?.addEventListener("click", () => move(-1));
    $("#lbNext")?.addEventListener("click", () => move(1));
    box.addEventListener("click", (e) => {
      if (e.target === box) close();
    });

    window.addEventListener("keydown", (e) => {
      if (!box.classList.contains("is-open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") move(-1);
      if (e.key === "ArrowRight") move(1);
    });

    // Dokunmatik kaydırma
    let x0 = null;
    box.addEventListener("touchstart", (e) => (x0 = e.touches[0].clientX), { passive: true });
    box.addEventListener("touchend", (e) => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 55) move(dx > 0 ? -1 : 1);
      x0 = null;
    });
  })();

  /* ---------- Söz döngüsü ---------- */
  (function quotes() {
    const items = $$("#quoteTrack .quote");
    const dots = $("#quoteDots");
    if (items.length < 2) return;

    let i = 0;
    let timer = null;

    items.forEach((_, n) => {
      const b = document.createElement("button");
      b.type = "button";
      b.setAttribute("aria-label", `${n + 1}. söz`);
      b.className = n === 0 ? "is-active" : "";
      b.addEventListener("click", () => go(n));
      dots?.appendChild(b);
    });

    function go(n) {
      i = (n + items.length) % items.length;
      items.forEach((q, k) => q.classList.toggle("is-active", k === i));
      $$("button", dots).forEach((d, k) => d.classList.toggle("is-active", k === i));
      restart();
    }

    function restart() {
      clearInterval(timer);
      if (!reduced) timer = setInterval(() => go(i + 1), 7000);
    }

    $("#qPrev")?.addEventListener("click", () => go(i - 1));
    $("#qNext")?.addEventListener("click", () => go(i + 1));
    restart();
  })();

  /* ---------- Ziyaretçi defteri ---------- */
  (function guestbook() {
    const form = $("#guestForm");
    const list = $("#notes");
    const hint = $("#formHint");
    const msg = $("#gMsg");
    const count = $("#msgCount");
    if (!form || !list) return;

    const KEY = "aile-defter";
    const seed = [
      { name: "Bir Akraba", text: "Aziz amca, Özcan yenge ve üç kardeşe; Rüştü dededen Turcan neneye — nice güzel yıllara!", date: Date.now() - 86400000 * 6 },
      { name: "Kuzen", text: "Sofra kalabalık olsun diye… Karahan’dan Gürbüz’e, hepinize selam.", date: Date.now() - 86400000 * 2 }
    ];

    const load = () => {
      try {
        const raw = JSON.parse(localStorage.getItem(KEY));
        return Array.isArray(raw) ? raw : seed;
      } catch {
        return seed;
      }
    };

    let notes = load();

    const fmt = (ts) =>
      new Date(ts).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });

    function render() {
      if (!notes.length) {
        list.innerHTML = '<p class="notes__empty">Henüz not yok. İlk cümleyi sen yaz.</p>';
        return;
      }
      list.innerHTML = notes
        .slice()
        .sort((a, b) => b.date - a.date)
        .map(
          (n) => `
        <article class="note">
          <div class="note__top">
            <span class="note__name"></span>
            <span class="note__date">${fmt(n.date)}</span>
          </div>
          <p></p>
        </article>`
        )
        .join("");

      // Kullanıcı metnini HTML olarak değil, düz metin olarak yerleştir.
      const sorted = notes.slice().sort((a, b) => b.date - a.date);
      $$(".note", list).forEach((el, k) => {
        $(".note__name", el).textContent = sorted[k].name;
        $("p", el).textContent = sorted[k].text;
      });
    }

    msg?.addEventListener("input", () => {
      if (count) count.textContent = msg.value.length;
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = $("#gName").value.trim();
      const text = msg.value.trim();

      if (name.length < 2 || text.length < 5) {
        hint.textContent = "Adını ve en az birkaç kelimelik bir not yazar mısın?";
        hint.classList.add("is-error");
        return;
      }

      notes.push({ name, text, date: Date.now() });
      try {
        localStorage.setItem(KEY, JSON.stringify(notes));
      } catch {
        /* depolama kapalıysa not yalnızca bu oturumda görünür */
      }

      render();
      form.reset();
      if (count) count.textContent = "0";
      hint.classList.remove("is-error");
      hint.textContent = "Teşekkürler, notun deftere eklendi.";
      setTimeout(() => (hint.textContent = ""), 4000);
    });

    render();
  })();

  /* ---------- Yıl ---------- */
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
