(() => {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  const CITIES = [
    "Adana", "Adıyaman", "Afyon", "Ağrı", "Aksaray", "Amasya", "Ankara", "Antalya",
    "Ardahan", "Artvin", "Aydın", "Balıkesir", "Bartın", "Batman", "Bayburt", "Bilecik",
    "Bingöl", "Bitlis", "Bolu", "Burdur", "Bursa", "Çanakkale", "Çankırı", "Çorum",
    "Denizli", "Diyarbakır", "Düzce", "Edirne", "Elazığ", "Erzincan", "Erzurum", "Eskişehir",
    "Gaziantep", "Giresun", "Gümüşhane", "Hakkari", "Hatay", "Mersin", "Iğdır", "Isparta",
    "İstanbul", "İzmir", "Kahramanmaraş", "Karabük", "Karaman", "Kars", "Kastamonu", "Kayseri",
    "Kırıkkale", "Kırklareli", "Kırşehir", "Kilis", "Kocaeli", "Konya", "Kütahya", "Malatya",
    "Manisa", "Mardin", "Muğla", "Muş", "Nevşehir", "Niğde", "Ordu", "Osmaniye", "Rize",
    "Sakarya", "Samsun", "Siirt", "Sinop", "Sivas", "Şanlıurfa", "Şırnak", "Tekirdağ",
    "Tokat", "Trabzon", "Tunceli", "Uşak", "Van", "Yalova", "Yozgat", "Zonguldak",
  ];

  /* Date */
  const dateEl = $("#todayDate");
  if (dateEl) {
    dateEl.textContent = new Intl.DateTimeFormat("tr-TR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date());
  }

  /* Scroll progress + back top */
  const progress = $("#scrollProgress");
  const backTop = $("#backTop");
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
    if (progress) progress.style.width = `${pct}%`;
    if (backTop) backTop.classList.toggle("is-visible", window.scrollY > 600);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  backTop?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  /* Theme */
  const root = document.documentElement;
  const savedTheme = localStorage.getItem("akis-theme");
  if (savedTheme) root.setAttribute("data-theme", savedTheme);
  $("#themeToggle")?.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    if (next === "light") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", "dark");
    localStorage.setItem("akis-theme", next === "light" ? "" : "dark");
  });

  /* Font size */
  let fontScale = Number(localStorage.getItem("akis-fs") || "1");
  const applyFont = () => {
    document.body.style.setProperty("--fs", `${fontScale}rem`);
    localStorage.setItem("akis-fs", String(fontScale));
  };
  applyFont();
  $("#fontInc")?.addEventListener("click", () => {
    fontScale = Math.min(1.2, +(fontScale + 0.05).toFixed(2));
    applyFont();
  });
  $("#fontDec")?.addEventListener("click", () => {
    fontScale = Math.max(0.9, +(fontScale - 0.05).toFixed(2));
    applyFont();
  });

  /* Mobile nav */
  const nav = $("#mainNav");
  const navToggle = $("#navToggle");
  navToggle?.addEventListener("click", () => {
    const open = nav?.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(!!open));
  });

  /* Search */
  const modal = $("#searchModal");
  const openSearch = () => {
    if (!modal) return;
    modal.hidden = false;
    $("#searchInput")?.focus();
  };
  const closeSearch = () => {
    if (modal) modal.hidden = true;
  };
  $("#searchOpen")?.addEventListener("click", openSearch);
  $("#dockSearch")?.addEventListener("click", openSearch);
  $("#searchClose")?.addEventListener("click", closeSearch);
  modal?.addEventListener("click", (e) => {
    if (e.target === modal) closeSearch();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeSearch();
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      openSearch();
    }
  });
  $("#searchForm")?.addEventListener("submit", () => {
    // WordPress search form — allow native GET submit.
  });

  /* Marquee clones */
  const breakingList = $("#breakingList");
  if (breakingList) breakingList.innerHTML += breakingList.innerHTML;
  const flashTrack = $("#flashTrack");
  if (flashTrack) flashTrack.innerHTML += flashTrack.innerHTML;

  /* Hero slider (legacy markup) */
  const slides = $$(".hero-slide");
  const dotsWrap = $("#heroDots");
  let heroIndex = 0;
  let heroTimer;

  const showHero = (i) => {
    if (!slides.length) return;
    heroIndex = (i + slides.length) % slides.length;
    slides.forEach((s, idx) => s.classList.toggle("is-active", idx === heroIndex));
    $$("#heroDots button").forEach((b, idx) => b.classList.toggle("is-active", idx === heroIndex));
  };

  const startHero = () => {
    clearInterval(heroTimer);
    heroTimer = setInterval(() => showHero(heroIndex + 1), 5500);
  };

  if (slides.length) {
    if (dotsWrap) {
      dotsWrap.innerHTML = slides
        .map((_, i) => `<button type="button" aria-label="Slayt ${i + 1}" data-i="${i}"></button>`)
        .join("");
    }
    showHero(0);
    startHero();
    $(".hero__prev")?.addEventListener("click", () => {
      showHero(heroIndex - 1);
      startHero();
    });
    $(".hero__next")?.addEventListener("click", () => {
      showHero(heroIndex + 1);
      startHero();
    });
    dotsWrap?.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-i]");
      if (!btn) return;
      showHero(Number(btn.dataset.i));
      startHero();
    });
  }

  /* Manşet slider */
  $$("[data-slider]").forEach((slider) => {
    const items = $$(".mslide", slider);
    if (!items.length) return;

    const dots = $$("[data-slider-dot]", slider);
    const jumps = $$("[data-slider-jump]", slider.closest(".manset__layout") || slider);
    const progress = $("[data-slider-progress]", slider);
    const delay = Number(slider.dataset.autoplay || 6000);
    let index = 0;
    let timer = null;
    let startX = null;

    const render = () => {
      items.forEach((item, i) => {
        const active = i === index;
        item.classList.toggle("is-active", active);
        item.toggleAttribute("aria-hidden", !active);
        $$("a", item).forEach((link) => link.setAttribute("tabindex", active ? "0" : "-1"));
      });
      dots.forEach((dot, i) => {
        dot.classList.toggle("is-active", i === index);
        dot.setAttribute("aria-selected", String(i === index));
      });
      jumps.forEach((jump, i) => jump.classList.toggle("is-active", i === index));
      if (progress) {
        progress.style.transition = "none";
        progress.style.width = "0%";
        requestAnimationFrame(() => {
          progress.style.transition = `width ${delay}ms linear`;
          progress.style.width = "100%";
        });
      }
    };

    const go = (next) => {
      index = (next + items.length) % items.length;
      render();
    };

    const play = () => {
      clearInterval(timer);
      timer = setInterval(() => go(index + 1), delay);
    };

    const restart = (next) => {
      go(next);
      play();
    };

    $("[data-slider-prev]", slider)?.addEventListener("click", () => restart(index - 1));
    $("[data-slider-next]", slider)?.addEventListener("click", () => restart(index + 1));
    dots.forEach((dot) => dot.addEventListener("click", () => restart(Number(dot.dataset.sliderDot))));
    jumps.forEach((jump) => {
      jump.addEventListener("click", () => restart(Number(jump.dataset.sliderJump)));
      jump.addEventListener("mouseenter", () => restart(Number(jump.dataset.sliderJump)));
    });

    slider.addEventListener("mouseenter", () => clearInterval(timer));
    slider.addEventListener("mouseleave", play);
    slider.addEventListener("touchstart", (e) => {
      startX = e.touches[0].clientX;
      clearInterval(timer);
    }, { passive: true });
    slider.addEventListener("touchend", (e) => {
      if (startX === null) return;
      const diff = e.changedTouches[0].clientX - startX;
      if (Math.abs(diff) > 45) restart(diff < 0 ? index + 1 : index - 1);
      else play();
      startX = null;
    });

    render();
    play();
  });

  /* Yatay haber rayları */
  const railStep = (rail) => Math.max(240, Math.round(rail.clientWidth * 0.8));

  $$("[data-rail-nav]").forEach((nav) => {
    const rail = document.getElementById(nav.dataset.railNav);
    if (!rail) return;

    const sync = () => {
      const max = rail.scrollWidth - rail.clientWidth - 4;
      $$("button", nav).forEach((btn) => {
        const forward = Number(btn.dataset.dir) > 0;
        btn.disabled = forward ? rail.scrollLeft >= max : rail.scrollLeft <= 4;
      });
    };

    $$("button", nav).forEach((btn) => {
      btn.addEventListener("click", () => {
        rail.scrollBy({ left: Number(btn.dataset.dir) * railStep(rail), behavior: "smooth" });
      });
    });

    rail.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    sync();
  });

  /* Sekmeli widget'lar */
  $$("[data-tabs]").forEach((wrap) => {
    wrap.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-tab-target]");
      if (!btn) return;
      const target = btn.dataset.tabTarget;
      $$("[data-tab-target]", wrap).forEach((b) => {
        const active = b === btn;
        b.classList.toggle("is-active", active);
        b.setAttribute("aria-selected", String(active));
      });
      $$("[data-tab-panel]", wrap).forEach((panel) => {
        panel.classList.toggle("is-active", panel.dataset.tabPanel === target);
      });
    });
  });

  /* Burç widget'ı */
  $$("[data-zodiac]").forEach((wrap) => {
    wrap.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-zodiac-sign]");
      if (!btn) return;
      $$("[data-zodiac-sign]", wrap).forEach((b) => {
        const active = b === btn;
        b.classList.toggle("is-active", active);
        b.setAttribute("aria-selected", String(active));
      });
      const title = $("[data-zodiac-title]", wrap);
      const range = $("[data-zodiac-range]", wrap);
      const text = $("[data-zodiac-text]", wrap);
      if (title) title.childNodes[0].nodeValue = `${btn.dataset.zodiacName} Burcu `;
      if (range) range.textContent = btn.dataset.zodiacRange;
      if (text) text.textContent = btn.dataset.zodiacText;
    });
  });

  /* Sidebar hava durumu */
  const weatherStates = ["Güneşli", "Parçalı Bulutlu", "Yağmurlu", "Rüzgârlı"];
  const cityHash = (city) => {
    let hash = 0;
    for (let i = 0; i < city.length; i++) hash += city.charCodeAt(i) * (i + 3);
    return hash;
  };

  $$("[data-weather]").forEach((wrap) => {
    const select = $("[data-weather-city]", wrap);
    select?.addEventListener("change", () => {
      const hash = cityHash(select.value);
      const temp = 12 + (hash % 20);
      const tempEl = $("[data-weather-temp]", wrap);
      const stateEl = $("[data-weather-state]", wrap);
      const humidityEl = $("[data-weather-humidity]", wrap);
      const windEl = $("[data-weather-wind]", wrap);
      if (tempEl) tempEl.textContent = `${temp}°`;
      if (stateEl) stateEl.textContent = weatherStates[hash % weatherStates.length];
      if (humidityEl) humidityEl.textContent = `${40 + (hash % 45)}%`;
      if (windEl) windEl.textContent = `${5 + (hash % 25)} km/s`;
      $$("[data-weather-days] li", wrap).forEach((day, i) => {
        const high = day.querySelector("b");
        const low = day.querySelector("i");
        if (high) high.textContent = `${temp + ((hash + i * 5) % 5) - 1}°`;
        if (low) low.textContent = `${temp - 6 + ((hash + i * 3) % 4)}°`;
      });
    });
  });

  /* Foto galeri lightbox */
  const lightbox = $("#akisLightbox");
  if (lightbox) {
    const imageEl = $("[data-lightbox-image]", lightbox);
    const captionEl = $("[data-lightbox-caption]", lightbox);
    const titleEl = $("[data-lightbox-title]", lightbox);
    const counterEl = $("[data-lightbox-counter]", lightbox);
    const thumbsEl = $("[data-lightbox-thumbs]", lightbox);
    const linkEl = $("[data-lightbox-link]", lightbox);
    let photos = [];
    let current = 0;

    const paint = () => {
      const photo = photos[current];
      if (!photo) return;
      imageEl.src = photo.src;
      imageEl.alt = photo.caption || "";
      captionEl.textContent = photo.caption || "";
      counterEl.textContent = `${current + 1} / ${photos.length}`;
      $$("button", thumbsEl).forEach((btn, i) => btn.classList.toggle("is-active", i === current));
    };

    const openBox = (items, title, link) => {
      photos = items;
      current = 0;
      titleEl.textContent = title || "";
      if (link) {
        linkEl.href = link;
        linkEl.hidden = false;
      } else {
        linkEl.hidden = true;
      }
      thumbsEl.innerHTML = photos
        .map((photo, i) => `<button type="button" data-thumb="${i}"><img src="${photo.thumb || photo.src}" alt="" loading="lazy" /></button>`)
        .join("");
      lightbox.hidden = false;
      document.body.classList.add("is-lightbox-open");
      paint();
    };

    const closeBox = () => {
      lightbox.hidden = true;
      document.body.classList.remove("is-lightbox-open");
    };

    const step = (dir) => {
      if (!photos.length) return;
      current = (current + dir + photos.length) % photos.length;
      paint();
    };

    document.addEventListener("click", (e) => {
      const trigger = e.target.closest("[data-gallery]");
      if (trigger) {
        e.preventDefault();
        try {
          openBox(JSON.parse(trigger.dataset.gallery), trigger.dataset.title, trigger.dataset.link);
        } catch (err) {
          /* Bozuk veri; galeri açılmaz. */
        }
        return;
      }

      const single = e.target.closest("[data-lightbox]");
      if (single) {
        e.preventDefault();
        openBox(
          [{ src: single.getAttribute("href"), thumb: single.querySelector("img")?.src, caption: single.dataset.caption }],
          single.dataset.caption,
          single.dataset.link
        );
      }
    });

    thumbsEl?.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-thumb]");
      if (!btn) return;
      current = Number(btn.dataset.thumb);
      paint();
    });

    $("[data-lightbox-prev]", lightbox)?.addEventListener("click", () => step(-1));
    $("[data-lightbox-next]", lightbox)?.addEventListener("click", () => step(1));
    $("[data-lightbox-close]", lightbox)?.addEventListener("click", closeBox);
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) closeBox();
    });
    document.addEventListener("keydown", (e) => {
      if (lightbox.hidden) return;
      if (e.key === "Escape") closeBox();
      if (e.key === "ArrowLeft") step(-1);
      if (e.key === "ArrowRight") step(1);
    });
  }

  /* Health slider */
  const healthSlides = $$(".health-slide");
  const healthDots = $("#healthDots");
  let healthIndex = 0;
  let healthTimer;

  if (healthSlides.length && healthDots) {
    healthDots.innerHTML = healthSlides
      .map((_, i) => `<button type="button" aria-label="Sağlık slayt ${i + 1}" data-i="${i}"></button>`)
      .join("");

    const showHealth = (i) => {
      healthIndex = (i + healthSlides.length) % healthSlides.length;
      healthSlides.forEach((s, idx) => s.classList.toggle("is-active", idx === healthIndex));
      $$("#healthDots button").forEach((b, idx) => b.classList.toggle("is-active", idx === healthIndex));
    };

    const startHealth = () => {
      clearInterval(healthTimer);
      healthTimer = setInterval(() => showHealth(healthIndex + 1), 4200);
    };

    showHealth(0);
    startHealth();
    healthDots.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-i]");
      if (!btn) return;
      showHealth(Number(btn.dataset.i));
      startHealth();
    });
  }

  /* Weather + prayer city selects */
  const fillSelect = (el, selected = "Bursa") => {
    if (!el) return;
    el.innerHTML = CITIES.map(
      (c) => `<option value="${c}" ${c === selected ? "selected" : ""}>${c}</option>`
    ).join("");
  };
  fillSelect($("#citySelect"), "Bursa");
  fillSelect($("#prayerCity"), "Bursa");

  const weatherBtn = $("#weatherBtn");
  const weatherPanel = $("#weatherPanel");
  weatherBtn?.addEventListener("click", () => {
    const open = weatherPanel && !weatherPanel.hasAttribute("hidden");
    if (open) {
      weatherPanel.setAttribute("hidden", "");
      weatherBtn.setAttribute("aria-expanded", "false");
    } else {
      weatherPanel?.removeAttribute("hidden");
      weatherBtn.setAttribute("aria-expanded", "true");
    }
  });

  document.addEventListener("click", (e) => {
    if (!weatherPanel || weatherPanel.hasAttribute("hidden")) return;
    if (weatherBtn?.contains(e.target) || weatherPanel.contains(e.target)) return;
    weatherPanel.setAttribute("hidden", "");
    weatherBtn?.setAttribute("aria-expanded", "false");
  });

  const fakeTemp = (city) => {
    let hash = 0;
    for (let i = 0; i < city.length; i++) hash = (hash + city.charCodeAt(i) * (i + 3)) % 17;
    return 14 + hash;
  };

  $("#citySelect")?.addEventListener("change", (e) => {
    const city = e.target.value;
    $("#weatherCity").textContent = city;
    $("#weatherTemp").textContent = `${fakeTemp(city)}°`;
    weatherPanel?.setAttribute("hidden", "");
    weatherBtn?.setAttribute("aria-expanded", "false");
  });

  const prayerLabels = ["İmsak", "Güneş", "Öğle", "İkindi", "Akşam", "Yatsı"];
  const baseTimes = ["04:12", "05:48", "13:12", "16:58", "20:24", "21:52"];

  const shiftTime = (hhmm, minutes) => {
    const [h, m] = hhmm.split(":").map(Number);
    let total = h * 60 + m + minutes;
    total = ((total % 1440) + 1440) % 1440;
    return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
  };

  const renderPrayer = (city) => {
    const list = $("#prayerTimes");
    if (!list) return;
    const delta = (city.charCodeAt(0) % 5) - 2;
    list.innerHTML = prayerLabels
      .map((label, i) => `<li><span>${label}</span><strong>${shiftTime(baseTimes[i], delta)}</strong></li>`)
      .join("");
  };

  const prayerDate = $("#prayerDate");
  if (prayerDate) {
    prayerDate.textContent = new Intl.DateTimeFormat("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      weekday: "long",
    }).format(new Date());
  }
  $("#prayerCity")?.addEventListener("change", (e) => renderPrayer(e.target.value));
  renderPrayer("Bursa");

  /* Standings */
  const standingsData = {
    "TFF Süper Lig": [
      ["Galatasaray", 34, "+48", 95],
      ["Fenerbahçe", 34, "+52", 93],
      ["Beşiktaş", 34, "+28", 72],
      ["Trabzonspor", 34, "+18", 61],
      ["Başakşehir", 34, "+12", 55],
      ["Eyüpspor", 34, "+6", 50],
      ["Göztepe", 34, "+4", 48],
      ["Kasımpaşa", 34, "+2", 46],
      ["Samsunspor", 34, "0", 44],
      ["Alanyaspor", 34, "−2", 42],
    ],
    "TFF 1. Lig": [
      ["Kocaelispor", 34, "+30", 72],
      ["Erzurumspor FK", 34, "+18", 64],
      ["Çorum FK", 34, "+14", 60],
      ["Amed Sportif F.", 34, "+10", 56],
      ["Bandırmaspor", 34, "+8", 52],
      ["Boluspor", 34, "+4", 48],
      ["Ümraniyespor", 34, "0", 44],
      ["Esenler Erokspor", 34, "−2", 41],
      ["Pendikspor", 34, "−4", 39],
      ["İstanbulspor", 34, "−6", 37],
    ],
    "Basketbol Süper Lig": [
      ["Fenerbahçe", 28, "+210", 52],
      ["Anadolu Efes", 28, "+180", 50],
      ["Beşiktaş", 28, "+90", 42],
      ["Türk Telekom", 28, "+60", 38],
      ["Galatasaray", 28, "+40", 36],
      ["Bahçeşehir", 28, "+20", 34],
      ["Pınar Karşıyaka", 28, "0", 32],
      ["Manisa BBSK", 28, "−20", 30],
      ["Bursaspor", 28, "−40", 28],
      ["Darüşşafaka", 28, "−60", 26],
    ],
    "Kadınlar Basketbol Süper Lig": [
      ["Fenerbahçe", 26, "+240", 50],
      ["ÇBK Mersin", 26, "+180", 46],
      ["Galatasaray", 26, "+120", 42],
      ["Beşiktaş", 26, "+80", 38],
      ["OGM Ormanspor", 26, "+40", 34],
      ["Botas", 26, "+10", 30],
      ["Nesibe Aydın", 26, "−10", 28],
      ["Melikgazi Kayseri", 26, "−30", 26],
      ["Çukurova Basketbol", 26, "−50", 24],
      ["Kırçiçeği Bodrum", 26, "−70", 22],
    ],
  };

  const renderStandings = (league) => {
    const body = $("#standingsBody");
    if (!body) return;
    const rows = standingsData[league] || standingsData["TFF Süper Lig"];
    body.innerHTML = rows
      .map(([team, o, av, p], i) => `<tr><td>${i + 1}</td><td>${team}</td><td>${o}</td><td>${av}</td><td>${p}</td></tr>`)
      .join("");
  };
  $("#leagueSelect")?.addEventListener("change", (e) => renderStandings(e.target.value));

  /* Markets jitter */
  setInterval(() => {
    $$(".market-item strong").forEach((el) => {
      const raw = el.textContent.replace(/\./g, "").replace(",", ".");
      const num = parseFloat(raw);
      if (Number.isNaN(num)) return;
      const next = num * (1 + (Math.random() - 0.5) * 0.002);
      el.textContent = next.toLocaleString("tr-TR", {
        minimumFractionDigits: num >= 1000 ? 0 : 2,
        maximumFractionDigits: num >= 1000 ? 0 : 2,
      });
    });
  }, 8000);

  /* Zodiac */
  const zodiac = {
    koc: {
      title: "Koç Burcu Yorumu",
      text: "Bugün cesaretin ve kararlılığın ön plana çıktığı bir gün. İçsel motivasyonun yüksek; yeni projelere adım atmak için uygun bir zaman. Liderlik vasıfların çevrene ilham verebilir.",
    },
    boga: {
      title: "Boğa Burcu Yorumu",
      text: "Çevrenle kurduğun bağlantılarda derin etkileşim yaşayabilirsin. İş hayatında prestij kazandıracak fırsatlar çıkabilir; bunları değerlendirirken dengeni koru.",
    },
    ikizler: {
      title: "İkizler Burcu Yorumu",
      text: "İletişim becerilerin ön plana çıkıyor. Fikirlerinle dikkat çekmek ve sosyal çevrende etkili olmak için harika bir zaman. Esnekliğin sana yeni kapılar açabilir.",
    },
    yengec: {
      title: "Yengeç Burcu Yorumu",
      text: "Duygusal derinliğine inmeye yönelik güçlü bir eğilim hissediyorsun. Ailevi ilişkilerde sıcak bir atmosfer hâkim; sevdiklerinle paylaşım ruhunu güçlendirecek.",
    },
    aslan: {
      title: "Aslan Burcu Yorumu",
      text: "İçindeki yaratıcılığı ortaya çıkarmak için mükemmel bir zaman. Öne çıkma arzun yeni fırsatların kapısını aralayabilir; başkalarının görüşlerine de alan aç.",
    },
    basak: {
      title: "Başak Burcu Yorumu",
      text: "Detaylara odaklanmak başarı getirebilir. Sosyal ilişkilerde mantıklı yaklaşımların takdir toplayacak. Küçük düzenlemeler büyük fark yaratır.",
    },
    terazi: {
      title: "Terazi Burcu Yorumu",
      text: "Denge arayışı içinde olacağın bir gün. Dostluk bağların ve ortak projelerdeki yaratıcı fikirlerin dikkat çekecek. İç huzurun dış dünyadaki dengeni güçlendirir.",
    },
    akrep: {
      title: "Akrep Burcu Yorumu",
      text: "İçsel duygular ve gizli tutkular ön planda. İlişkilerde derinlik arayışın artabilir; duygusal zekânı kullanarak bu süreci yönetmek seni güçlendirecek.",
    },
    yay: {
      title: "Yay Burcu Yorumu",
      text: "Keşif ve yenilik dolu bir gün seni bekliyor. Yeni deneyimlere açık ol; sosyal çevrende yeni dostluklar kurma şansın yüksek.",
    },
    oglak: {
      title: "Oğlak Burcu Yorumu",
      text: "Kararlılık ve disiplin ön planda. Hedeflerine giden adımlar somut sonuçlar getirebilir. Sabırlı iletişim ilişkilerini güçlendirecek.",
    },
    kova: {
      title: "Kova Burcu Yorumu",
      text: "Yenilikçi fikirler ve yaratıcı çözümler öne çıkıyor. Topluluk etkileşimlerin seni sıra dışı düşüncelere yönlendirebilir; bireyselliğini koru.",
    },
    balik: {
      title: "Balık Burcu Yorumu",
      text: "Duygusal derinlikler ve sezgiler yoğun. Meditasyon veya doğayla vakit geçirmek faydalı olabilir. Empati ilişkilerini güçlendirecek.",
    },
  };

  $("#zodiacTabs")?.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-z]");
    if (!btn) return;
    const item = zodiac[btn.dataset.z];
    if (!item) return;
    $("#zodiacTitle").textContent = item.title;
    $("#zodiacText").textContent = item.text;
    $$("#zodiacTabs button").forEach((b) => {
      b.setAttribute("aria-selected", String(b.dataset.z === btn.dataset.z));
    });
  });

  /* Newsletter — demo toast only; keep form from navigating away */
  $("#newsletterForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = $("#emailInput")?.value.trim();
    if (!email) return;
    alert((window.akisHaber && window.akisHaber.i18n && window.akisHaber.i18n.newsletterSaved) || `${email} kaydedildi (demo).`);
    e.target.reset();
  });

  /* Copy link on single */
  document.getElementById("copyLinkBtn")?.addEventListener("click", async (e) => {
    const url = e.currentTarget.getAttribute("data-url") || window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      e.currentTarget.textContent = "Kopyalandı";
    } catch (err) {
      window.prompt("Bağlantıyı kopyalayın:", url);
    }
  });

  /* Reveal on scroll */
  const revealEls = $$(".section, .hero, .markets, .newsletter");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const showAll = () =>
    revealEls.forEach((el) => {
      el.style.opacity = "1";
      el.style.transform = "none";
    });

  if (!reduceMotion && "IntersectionObserver" in window) {
    revealEls.forEach((el) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(16px)";
      el.style.transition = "opacity 0.5s ease, transform 0.5s ease";
    });
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.style.opacity = "1";
          entry.target.style.transform = "none";
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.08 }
    );
    revealEls.forEach((el) => io.observe(el));

    // Failsafe: never leave content hidden if the observer does not fire.
    window.setTimeout(showAll, 2500);
  }
})();
