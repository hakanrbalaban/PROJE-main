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
  $("#searchForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const q = $("#searchInput")?.value.trim();
    if (!q) return;
    alert(`“${q}” için arama demosu. Gerçek sitede sonuç sayfasına yönlendirilir.`);
    closeSearch();
  });

  /* Marquee clones */
  const breakingList = $("#breakingList");
  if (breakingList) breakingList.innerHTML += breakingList.innerHTML;
  const flashTrack = $("#flashTrack");
  if (flashTrack) flashTrack.innerHTML += flashTrack.innerHTML;

  /* Hero slider */
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

  /* Newsletter */
  $("#newsletterForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = $("#emailInput")?.value.trim();
    if (!email) return;
    alert(`${email} adresi bülten listesine eklendi (demo).`);
    e.target.reset();
  });

  /* Reveal on scroll */
  const revealEls = $$(".section, .hero, .markets, .newsletter");
  if ("IntersectionObserver" in window) {
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
  }
})();
