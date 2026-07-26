(function () {
  "use strict";

  function articleUrl(id) {
    return "article.html?id=" + encodeURIComponent(id);
  }

  function categoryUrl(slug) {
    return "kategori.html?cat=" + encodeURIComponent(slug);
  }

  /* ========== Manşet slider ========== */
  function initHeroSlider() {
    var root = document.getElementById("hero");
    if (!root) return;

    var slides = root.querySelectorAll(".hero-slide");
    var dotWrap = document.getElementById("heroDots");
    var prevBtn = root.querySelector('[data-hero="prev"]');
    var nextBtn = root.querySelector('[data-hero="next"]');
    var current = 0;
    var timer = null;
    var INTERVAL = 4000;

    if (!slides.length || !dotWrap) return;

    slides.forEach(function (slide, i) {
      var id = slide.getAttribute("data-article");
      if (id) {
        slide.style.cursor = "pointer";
        slide.addEventListener("click", function (e) {
          if (e.target.closest("button, #heroDots, [data-hero]")) return;
          window.location.href = articleUrl(id);
        });
      }

      var dot = document.createElement("button");
      dot.type = "button";
      dot.className = "hero-dot";
      dot.setAttribute("aria-label", i + 1 + ". manşet");
      dot.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        show(i);
        resetTimer();
      });
      dotWrap.appendChild(dot);
    });

    function show(i) {
      current = (i + slides.length) % slides.length;
      slides.forEach(function (slide, k) {
        slide.classList.toggle("is-active", k === current);
      });
      Array.prototype.forEach.call(dotWrap.children, function (dot, k) {
        dot.classList.toggle("is-active", k === current);
      });
    }

    function resetTimer() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(current + 1);
      }, INTERVAL);
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        show(current - 1);
        resetTimer();
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        show(current + 1);
        resetTimer();
      });
    }

    show(0);
    resetTimer();
  }

  /* ========== Genel carousel (bölüm okları) ========== */
  function initCarousels() {
    document.querySelectorAll(".js-carousel").forEach(function (root) {
      var pages = root.querySelectorAll(".js-carousel-page");
      if (pages.length < 2) return;

      var prev = root.querySelector("[data-carousel-prev]");
      var next = root.querySelector("[data-carousel-next]");
      var index = 0;

      function show(i) {
        index = (i + pages.length) % pages.length;
        pages.forEach(function (page, k) {
          page.classList.toggle("is-active", k === index);
          page.classList.toggle("hidden", k !== index);
        });
      }

      if (prev) {
        prev.addEventListener("click", function (e) {
          e.preventDefault();
          show(index - 1);
        });
      }
      if (next) {
        next.addEventListener("click", function (e) {
          e.preventDefault();
          show(index + 1);
        });
      }

      show(0);
    });
  }

  /* ========== Öne çıkanlar sidebar slider ========== */
  function initFeaturedSidebar() {
    var root = document.getElementById("featuredSide");
    if (!root) return;
    var slides = root.querySelectorAll(".featured-side-slide");
    if (slides.length < 2) return;
    var index = 0;
    var prev = root.querySelector("[data-featured-prev]");
    var next = root.querySelector("[data-featured-next]");
    var dots = root.querySelectorAll("[data-featured-dot]");

    function show(i) {
      index = (i + slides.length) % slides.length;
      slides.forEach(function (s, k) {
        s.classList.toggle("is-active", k === index);
        s.classList.toggle("hidden", k !== index);
      });
      dots.forEach(function (d, k) {
        d.classList.toggle("bg-brand", k === index);
        d.classList.toggle("bg-white/40", k !== index);
      });
    }

    if (prev) prev.addEventListener("click", function (e) { e.preventDefault(); e.stopPropagation(); show(index - 1); });
    if (next) next.addEventListener("click", function (e) { e.preventDefault(); e.stopPropagation(); show(index + 1); });
    show(0);
  }

  /* ========== Son dakika ticker ========== */
  function initTicker() {
    var ticker = document.getElementById("ticker");
    if (!ticker) return;

    var headlines = [
      "Merkez Bankası yıl sonu enflasyon tahminini yüzde 24,6 olarak revize etti.",
      "Meteoroloji, iç bölgelerde sıcaklıkların mevsim normallerinin 6 derece üzerine çıkacağını duyurdu.",
      "Havalimanı yolcu trafiği temmuz ayında geçen yılın aynı dönemine göre yüzde 9 arttı.",
      "Ulusal deprem izleme ağına 240 yeni istasyon eklendi."
    ];
    var tIndex = 0;
    var tAuto = setInterval(function () { tick(1); }, 5000);

    function tick(step) {
      tIndex = (tIndex + step + headlines.length) % headlines.length;
      ticker.style.opacity = "0";
      setTimeout(function () {
        ticker.textContent = headlines[tIndex];
        ticker.style.opacity = "1";
      }, 250);
    }

    var prev = document.querySelector('[data-tick="prev"]');
    var next = document.querySelector('[data-tick="next"]');
    if (prev) prev.addEventListener("click", function () { clearInterval(tAuto); tick(-1); });
    if (next) next.addEventListener("click", function () { clearInterval(tAuto); tick(1); });
  }

  /* ========== Sidebar sekmeleri ========== */
  function initTabs() {
    var tabs = document.querySelectorAll(".tab-btn");
    tabs.forEach(function (btn) {
      btn.addEventListener("click", function () {
        tabs.forEach(function (b) {
          b.className = "tab-btn py-3 bg-stone-100 text-stone-600 hover:text-brand transition";
        });
        btn.className = "tab-btn py-3 bg-brand text-white transition";
        document.querySelectorAll(".tab-panel").forEach(function (panel) {
          panel.classList.toggle("hidden", panel.dataset.panel !== btn.dataset.tab);
        });
      });
    });
  }

  /* ========== Ana kategori vitrini (6 kategori) ========== */
  function initHomeCategories() {
    var host = document.getElementById("homeCategories");
    if (!host || !window.MG_CATEGORIES || !window.MG_ARTICLES) return;

    var slugs = window.MG_HOME_CATEGORIES || [];
    var accentMap = {
      sky: "after:bg-sky-500",
      emerald: "after:bg-emerald-500",
      amber: "after:bg-amber-500",
      fuchsia: "after:bg-fuchsia-500",
      rose: "after:bg-rose-500",
      orange: "after:bg-orange-500",
      teal: "after:bg-teal-500",
      violet: "after:bg-violet-500"
    };

    slugs.forEach(function (slug) {
      var cat = window.MG_CATEGORIES[slug];
      if (!cat) return;
      var ids = (cat.ids || []).slice(0, 6);
      if (!ids.length) return;

      var section = document.createElement("div");
      section.className = "js-carousel";
      section.id = "kat-" + slug;

      var pages = [];
      for (var i = 0; i < ids.length; i += 3) {
        pages.push(ids.slice(i, i + 3));
      }

      var accent = accentMap[cat.accent] || "after:bg-brand";
      var header =
        '<div class="flex items-end justify-between border-b border-stone-200 pb-2 mb-5">' +
        '<h3 class="font-display text-lg font-bold uppercase tracking-[0.08em] text-stone-900 relative after:content-[\'\'] after:absolute after:-bottom-[9px] after:left-0 after:w-14 after:h-[3px] ' + accent + '">' +
        cat.name +
        "</h3>" +
        '<div class="flex items-center gap-2">' +
        '<a href="' + categoryUrl(slug) + '" class="text-[10px] font-bold uppercase tracking-widest text-stone-500 hover:text-brand transition">Tümü</a>' +
        (pages.length > 1
          ? '<button type="button" data-carousel-prev class="w-7 h-7 grid place-items-center border border-stone-300 text-stone-500 hover:bg-brand hover:border-brand hover:text-white transition" aria-label="Önceki"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg></button>' +
            '<button type="button" data-carousel-next class="w-7 h-7 grid place-items-center border border-stone-300 text-stone-500 hover:bg-brand hover:border-brand hover:text-white transition" aria-label="Sonraki"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg></button>'
          : "") +
        "</div></div>";

      var pagesHtml = pages
        .map(function (pageIds, pi) {
          var cards = pageIds
            .map(function (id) {
              var a = window.MG_ARTICLES[id];
              if (!a) return "";
              return (
                '<a href="' +
                articleUrl(a.id) +
                '" class="group flex gap-3 items-start border-b border-stone-100 pb-4">' +
                '<span class="w-20 h-16 shrink-0 overflow-hidden block"><img src="' +
                a.image +
                '" alt="" class="w-full h-full object-cover"></span>' +
                "<div><h4 class=\"text-[13px] font-semibold leading-snug text-stone-800 group-hover:text-brand transition clamp-2\">" +
                a.title +
                '</h4><p class="text-[10px] text-stone-500 mt-1.5">' +
                a.date +
                "</p></div></a>"
              );
            })
            .join("");
          return (
            '<div class="js-carousel-page space-y-4' +
            (pi === 0 ? " is-active" : " hidden") +
            '">' +
            cards +
            "</div>"
          );
        })
        .join("");

      section.innerHTML = header + pagesHtml;
      host.appendChild(section);
    });
  }

  /* ========== Yukarı çık ========== */
  function initToTop() {
    var toTop = document.getElementById("toTop");
    if (!toTop) return;
    window.addEventListener("scroll", function () {
      toTop.classList.toggle("is-visible", window.scrollY > 500);
    });
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initHeroSlider();
    initTicker();
    initTabs();
    initHomeCategories();
    initCarousels();
    initFeaturedSidebar();
    initToTop();
  });
})();
