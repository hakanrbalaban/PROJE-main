(() => {
  "use strict";

  /* ---------- Header / nav ---------- */
  const header = document.querySelector(".site-header");
  const navToggle = document.querySelector(".nav-toggle");
  const siteNav = document.getElementById("site-nav");

  const onScroll = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 40);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  navToggle?.addEventListener("click", () => {
    const open = siteNav.classList.toggle("is-open");
    header.classList.toggle("nav-open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Menüyü kapat" : "Menüyü aç");
  });

  siteNav?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      siteNav.classList.remove("is-open");
      header.classList.remove("nav-open");
      navToggle?.setAttribute("aria-expanded", "false");
    });
  });

  /* ---------- Reveal why list ---------- */
  const whyItems = document.querySelectorAll(".why-list li");
  if (whyItems.length && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );
    whyItems.forEach((el, i) => {
      el.style.transitionDelay = `${i * 100}ms`;
      io.observe(el);
    });
  } else {
    whyItems.forEach((el) => el.classList.add("is-visible"));
  }

  /* ---------- Technique filters ---------- */
  const filterBtns = document.querySelectorAll(".filter-btn");
  const techItems = document.querySelectorAll(".tech-item");

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const filter = btn.dataset.filter;
      filterBtns.forEach((b) => {
        b.classList.toggle("is-active", b === btn);
        b.setAttribute("aria-selected", String(b === btn));
      });
      techItems.forEach((item) => {
        const show = filter === "all" || item.dataset.category === filter;
        item.classList.toggle("is-hidden", !show);
      });
    });
  });

  /* ---------- Breath guide ---------- */
  const PATTERNS = {
    box: {
      phases: [
        { name: "Al", seconds: 4, scale: 1.15 },
        { name: "Tut", seconds: 4, scale: 1.15 },
        { name: "Ver", seconds: 4, scale: 0.78 },
        { name: "Tut", seconds: 4, scale: 0.78 },
      ],
    },
    calm: {
      phases: [
        { name: "Al", seconds: 4, scale: 1.12 },
        { name: "Ver", seconds: 6, scale: 0.78 },
      ],
    },
    "478": {
      phases: [
        { name: "Al", seconds: 4, scale: 1.15 },
        { name: "Tut", seconds: 7, scale: 1.15 },
        { name: "Ver", seconds: 8, scale: 0.75 },
      ],
    },
    coherent: {
      phases: [
        { name: "Al", seconds: 5, scale: 1.12 },
        { name: "Ver", seconds: 5, scale: 0.78 },
      ],
    },
  };

  const breathToggle = document.getElementById("breath-toggle");
  const breathReset = document.getElementById("breath-reset");
  const breathPattern = document.getElementById("breath-pattern");
  const breathOrb = document.getElementById("breath-orb");
  const breathLabel = document.getElementById("breath-label");
  const breathCount = document.getElementById("breath-count");
  const breathCyclesEl = document.getElementById("breath-cycles");

  let breathRunning = false;
  let breathRaf = null;
  let breathTimeout = null;
  let phaseIndex = 0;
  let cycles = 0;
  let phaseStarted = 0;
  let currentPhases = PATTERNS.box.phases;

  const setOrbScale = (scale) => {
    breathOrb.style.transform = `scale(${scale})`;
  };

  const stopBreathLoop = () => {
    if (breathRaf) cancelAnimationFrame(breathRaf);
    if (breathTimeout) clearTimeout(breathTimeout);
    breathRaf = null;
    breathTimeout = null;
  };

  const resetBreathUI = () => {
    stopBreathLoop();
    breathRunning = false;
    phaseIndex = 0;
    cycles = 0;
    breathToggle.textContent = "Başlat";
    breathReset.disabled = true;
    breathPattern.disabled = false;
    breathLabel.textContent = "Hazır";
    breathCount.textContent = "";
    breathCyclesEl.textContent = "0";
    breathOrb.dataset.phase = "idle";
    setOrbScale(0.85);
  };

  const runPhase = () => {
    if (!breathRunning) return;
    const phase = currentPhases[phaseIndex];
    breathOrb.dataset.phase = phase.name.toLowerCase();
    breathLabel.textContent = phase.name;
    setOrbScale(phase.scale);
    phaseStarted = performance.now();

    const tick = (now) => {
      if (!breathRunning) return;
      const elapsed = (now - phaseStarted) / 1000;
      const left = Math.max(0, Math.ceil(phase.seconds - elapsed));
      breathCount.textContent = `${left} sn`;
      if (elapsed < phase.seconds) {
        breathRaf = requestAnimationFrame(tick);
      }
    };
    breathRaf = requestAnimationFrame(tick);

    breathTimeout = setTimeout(() => {
      if (!breathRunning) return;
      phaseIndex += 1;
      if (phaseIndex >= currentPhases.length) {
        phaseIndex = 0;
        cycles += 1;
        breathCyclesEl.textContent = String(cycles);
      }
      runPhase();
    }, phase.seconds * 1000);
  };

  breathToggle?.addEventListener("click", () => {
    if (breathRunning) {
      breathRunning = false;
      stopBreathLoop();
      breathToggle.textContent = "Devam";
      breathLabel.textContent = "Duraklatıldı";
      breathCount.textContent = "";
      return;
    }
    currentPhases = PATTERNS[breathPattern.value]?.phases || PATTERNS.box.phases;
    breathRunning = true;
    breathToggle.textContent = "Duraklat";
    breathReset.disabled = false;
    breathPattern.disabled = true;
    if (breathOrb.dataset.phase === "idle") {
      phaseIndex = 0;
    }
    runPhase();
  });

  breathReset?.addEventListener("click", resetBreathUI);

  breathPattern?.addEventListener("change", () => {
    if (!breathRunning) {
      currentPhases = PATTERNS[breathPattern.value]?.phases || PATTERNS.box.phases;
    }
  });

  /* ---------- Meditation timer ---------- */
  const timerDisplay = document.getElementById("timer-display");
  const timerToggle = document.getElementById("timer-toggle");
  const timerReset = document.getElementById("timer-reset");
  const presets = document.querySelectorAll(".preset");
  const streakCount = document.getElementById("streak-count");

  let totalSeconds = 5 * 60;
  let remaining = totalSeconds;
  let timerId = null;
  let timerRunning = false;

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const updateTimerDisplay = () => {
    timerDisplay.textContent = formatTime(remaining);
  };

  const playBell = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(528, now);
      osc.frequency.exponentialRampToValueAtTime(264, now + 2.2);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.25, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 2.6);
      setTimeout(() => ctx.close(), 3000);
    } catch {
      /* audio unavailable */
    }
  };

  const STREAK_KEY = "sukun-streak";
  const LAST_KEY = "sukun-last-practice";

  const loadStreak = () => {
    const streak = Number(localStorage.getItem(STREAK_KEY) || 0);
    streakCount.textContent = String(streak);
  };

  const recordPractice = () => {
    const today = new Date().toDateString();
    const last = localStorage.getItem(LAST_KEY);
    let streak = Number(localStorage.getItem(STREAK_KEY) || 0);

    if (last === today) {
      loadStreak();
      return;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (last === yesterday.toDateString()) {
      streak += 1;
    } else {
      streak = 1;
    }
    localStorage.setItem(STREAK_KEY, String(streak));
    localStorage.setItem(LAST_KEY, today);
    loadStreak();
  };

  const stopTimer = () => {
    if (timerId) clearInterval(timerId);
    timerId = null;
    timerRunning = false;
    timerToggle.textContent = "Başlat";
  };

  const completeTimer = () => {
    stopTimer();
    remaining = 0;
    updateTimerDisplay();
    playBell();
    recordPractice();
    timerLabelDone();
  };

  const timerLabelDone = () => {
    timerDisplay.setAttribute("aria-label", "Süre doldu");
  };

  timerToggle?.addEventListener("click", () => {
    if (timerRunning) {
      stopTimer();
      return;
    }
    if (remaining <= 0) remaining = totalSeconds;
    timerRunning = true;
    timerToggle.textContent = "Duraklat";
    playBell();
    timerId = setInterval(() => {
      remaining -= 1;
      updateTimerDisplay();
      if (remaining <= 0) completeTimer();
    }, 1000);
  });

  timerReset?.addEventListener("click", () => {
    stopTimer();
    remaining = totalSeconds;
    updateTimerDisplay();
  });

  presets.forEach((btn) => {
    btn.addEventListener("click", () => {
      presets.forEach((p) => p.classList.toggle("is-active", p === btn));
      totalSeconds = Number(btn.dataset.minutes) * 60;
      stopTimer();
      remaining = totalSeconds;
      updateTimerDisplay();
    });
  });

  loadStreak();
  updateTimerDisplay();

  /* ---------- Daily tip ---------- */
  const TIPS = [
    "Üç derin nefes al. Her verişte omuzlarını bir milim daha bırak.",
    "Bir bardak suyu yudum yudum iç; her yudumda sadece tadı fark et.",
    "Pencereden bir noktaya bak. 60 saniye boyunca sadece bak — düşünme.",
    "Sağ elini göğsüne koy. Kalp atışını hisset, yargılamadan.",
    "Yürürken ayak tabanlarının yere değdiği anı say: on adım yeter.",
    "Bir düşünceyi bulut gibi izle: geldi, geçti. Peşinden koşma.",
    "Çeneni gevşet, dilini damağından ayır. Çoğu gerilim orada saklanır.",
    "Bugün birine (veya kendine) sessizce iyi dilek gönder: güvende olsun.",
    "Telefonu ters çevir, beş dakika hiçbir ekrana bakma.",
    "Nefesini burnundan al, ağızdan uzun ver. Dört tur yeter.",
  ];

  const tipEl = document.getElementById("daily-tip");
  const tipRefresh = document.getElementById("tip-refresh");

  const showTip = () => {
    const dayIndex = Math.floor(Date.now() / 86400000) % TIPS.length;
    const randomBoost = tipRefresh?.dataset.random;
    const index = randomBoost
      ? Number(randomBoost) % TIPS.length
      : dayIndex;
    tipEl.textContent = TIPS[index];
  };

  tipRefresh?.addEventListener("click", () => {
    let next = Math.floor(Math.random() * TIPS.length);
    const current = tipEl.textContent;
    let guard = 0;
    while (TIPS[next] === current && guard < 8) {
      next = Math.floor(Math.random() * TIPS.length);
      guard += 1;
    }
    tipRefresh.dataset.random = String(next);
    tipEl.textContent = TIPS[next];
  });

  showTip();
})();
