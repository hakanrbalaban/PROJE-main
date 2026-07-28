/**
 * Main JavaScript File for My Professional Theme
 * Pure Vanilla JavaScript for Headline Slider, Filter Drawer, Reactions & Sharing.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Theme toggle (light default, dark optional) — switch UI
  const root = document.documentElement;
  const themeBtn = document.getElementById('bv-theme-toggle');

  function applyTheme(theme) {
    const next = theme === 'dark' ? 'dark' : 'light';
    root.setAttribute('data-theme', next);
    try {
      localStorage.setItem('bv-theme', next);
    } catch (e) {}
    if (themeBtn) {
      themeBtn.setAttribute('data-active', next);
      themeBtn.classList.toggle('is-dark', next === 'dark');
    }
  }

  applyTheme(root.getAttribute('data-theme') || 'light');

  // Broken cover images → local placeholder
  const coverFallback = (window.MyThemeAjax && MyThemeAjax.placeholder) || '';
  if (coverFallback) {
    document.addEventListener(
      'error',
      (ev) => {
        const el = ev.target;
        if (!(el instanceof HTMLImageElement)) return;
        if (el.dataset.bvFallbackApplied === '1') return;
        if (!el.src || el.src === coverFallback) return;
        el.dataset.bvFallbackApplied = '1';
        el.src = coverFallback;
      },
      true
    );
  }

  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const cur = root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      applyTheme(cur === 'dark' ? 'light' : 'dark');
    });
  }

  // Sticky offsets under news ticker
  function syncStickyOffsets() {
    const ticker = document.querySelector('.bv-ticker');
    const masthead = document.getElementById('masthead');
    const th = ticker ? Math.ceil(ticker.getBoundingClientRect().height) : 0;
    const mh = masthead ? Math.ceil(masthead.getBoundingClientRect().height) : 68;
    root.style.setProperty('--bv-ticker-h', `${th}px`);
    root.style.setProperty('--bv-masthead-h', `${mh}px`);
  }
  syncStickyOffsets();
  window.addEventListener('resize', syncStickyOffsets);

  // Filter Drawer Toggle
  const filterBtn = document.getElementById('filter-drawer-btn');
  const filterPanel = document.getElementById('filter-drawer-panel');

  if (filterBtn && filterPanel) {
    filterBtn.addEventListener('click', () => {
      filterPanel.classList.toggle('hidden');
    });
  }

  // Main manşet slider (fade)
  const mainWrap = document.querySelector('[data-manset-main]');
  if (mainWrap) {
    const slides = Array.from(mainWrap.querySelectorAll('[data-manset-slide]'));
    const dots = Array.from(mainWrap.querySelectorAll('[data-manset-goto]'));
    const prev = mainWrap.querySelector('[data-manset-prev]');
    const next = mainWrap.querySelector('[data-manset-next]');
    let current = 0;
    let timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach((el, i) => el.classList.toggle('is-active', i === current));
      dots.forEach((el, i) => el.classList.toggle('is-active', i === current));
    }

    function start() {
      stop();
      if (slides.length < 2) return;
      timer = setInterval(() => show(current + 1), 5600);
    }

    function stop() {
      if (timer) clearInterval(timer);
      timer = null;
    }

    if (prev) prev.addEventListener('click', () => { show(current - 1); start(); });
    if (next) next.addEventListener('click', () => { show(current + 1); start(); });
    dots.forEach((dot) => {
      dot.addEventListener('click', () => {
        show(Number(dot.getAttribute('data-manset-goto') || 0));
        start();
      });
    });

    mainWrap.addEventListener('mouseenter', stop);
    mainWrap.addEventListener('mouseleave', start);
    start();
  }

  // Side manşet vertical list slider (independent timing from main)
  const sideWrap = document.querySelector('[data-manset-side]');
  if (sideWrap) {
    const track = sideWrap.querySelector('[data-side-track]');
    const cards = Array.from(sideWrap.querySelectorAll('[data-side-index]'));
    const prev = sideWrap.querySelector('[data-side-prev]');
    const next = sideWrap.querySelector('[data-side-next]');
    const visible = 3;
    let current = 0;
    let timer = null;

    function show(index) {
      if (!cards.length) return;
      const max = Math.max(0, cards.length - visible);
      current = ((index % (max + 1)) + (max + 1)) % (max + 1);
      cards.forEach((el, i) => el.classList.toggle('is-active', i === current));
      if (track) {
        const step = cards[0] ? cards[0].offsetHeight + 8 : 92;
        track.style.transform = `translateY(${-current * step}px)`;
      }
    }

    function start() {
      stop();
      if (cards.length <= visible) return;
      timer = setInterval(() => show(current + 1), 3400);
    }

    function stop() {
      if (timer) clearInterval(timer);
      timer = null;
    }

    if (prev) prev.addEventListener('click', () => { show(current - 1); start(); });
    if (next) next.addEventListener('click', () => { show(current + 1); start(); });
    sideWrap.addEventListener('mouseenter', stop);
    sideWrap.addEventListener('mouseleave', start);
    window.addEventListener('resize', () => show(current));
    show(0);
    start();
  }

  // Legacy headline slider (fallback if old markup remains)
  const slides = document.querySelectorAll('.headline-slide-img');
  const slideContents = document.querySelectorAll('.headline-slide-content');
  const dotBtns = document.querySelectorAll('.slide-dot-btn');
  const prevBtn = document.getElementById('prev-slide-btn');
  const nextBtn = document.getElementById('next-slide-btn');

  if (slides.length > 1) {
    let current = 0;
    let timer = null;

    function showSlide(index) {
      slides.forEach((img, i) => {
        img.classList.toggle('opacity-100', i === index);
        img.classList.toggle('opacity-0', i !== index);
      });

      slideContents.forEach((content, i) => {
        content.classList.toggle('block', i === index);
        content.classList.toggle('hidden', i !== index);
      });

      dotBtns.forEach((dot, i) => {
        if (i === index) {
          dot.classList.add('w-8', 'bg-[var(--hot)]');
          dot.classList.remove('w-2', 'bg-white/35');
        } else {
          dot.classList.remove('w-8', 'bg-[var(--hot)]');
          dot.classList.add('w-2', 'bg-white/35');
        }
      });

      current = index;
    }

    function startTimer() {
      timer = setInterval(() => {
        showSlide((current + 1) % slides.length);
      }, 5500);
    }

    function stopTimer() {
      if (timer) clearInterval(timer);
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        stopTimer();
        showSlide((current - 1 + slides.length) % slides.length);
        startTimer();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        stopTimer();
        showSlide((current + 1) % slides.length);
        startTimer();
      });
    }

    dotBtns.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        stopTimer();
        showSlide(i);
        startTimer();
      });
    });

    const sliderContainer = document.querySelector('.headline-slider-container');
    if (sliderContainer) {
      sliderContainer.addEventListener('mouseenter', stopTimer);
      sliderContainer.addEventListener('mouseleave', startTimer);
    }

    startTimer();
  }

  // AJAX Reactions Handler
  const reactionBtns = document.querySelectorAll('.ajax-reaction-btn');
  reactionBtns.forEach((btn) => {
    btn.addEventListener('click', function () {
      if (this.getAttribute('data-voted') === 'true') return;

      const postId = this.getAttribute('data-post-id');
      const reaction = this.getAttribute('data-reaction');
      const countEl = this.querySelector('.count');
      const self = this;

      if (!postId || !reaction || typeof MyThemeAjax === 'undefined') return;

      const formData = new FormData();
      formData.append('action', 'my_theme_reaction');
      formData.append('post_id', postId);
      formData.append('reaction', reaction);
      formData.append('nonce', MyThemeAjax.nonce);

      fetch(MyThemeAjax.ajax_url, {
        method: 'POST',
        body: formData,
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data) {
            if (countEl) countEl.textContent = data.data.count;
            self.setAttribute('data-voted', 'true');
            self.classList.add('bg-[var(--hot)]', 'text-white', 'border-[var(--hot)]');

            // Increment total likes count display if present
            const likeCounter = document.getElementById('like-counter-num');
            if (likeCounter && (reaction === 'like' || reaction === 'heart')) {
              let cur = parseInt(likeCounter.textContent, 10) || 0;
              likeCounter.textContent = cur + 1;
            }
          }
        })
        .catch(() => {});
    });
  });

  // Copy Link Handler
  const copyBtns = document.querySelectorAll('.btn-copy-link');
  copyBtns.forEach((btn) => {
    btn.addEventListener('click', function () {
      const url = this.getAttribute('data-url') || window.location.href;
      navigator.clipboard.writeText(url).then(() => {
        const origText = this.innerHTML;
        this.innerHTML = '✓ Kopyalandı!';
        setTimeout(() => {
          this.innerHTML = origText;
        }, 2500);
      });
    });
  });

  // Horizontal rail scroll buttons
  document.querySelectorAll('[data-rail-scroll]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-rail-target');
      const dir = Number(btn.getAttribute('data-rail-scroll')) || 1;
      const section = targetId ? document.getElementById(targetId) : null;
      const track = section ? section.querySelector('.rail-track') : null;
      if (!track) return;
      track.scrollBy({ left: dir * Math.min(360, track.clientWidth * 0.75), behavior: 'smooth' });
    });
  });

  // Lightbox (photo + video)
  function ensureLightbox() {
    let box = document.getElementById('bv-lightbox');
    if (box) return box;
    box = document.createElement('div');
    box.id = 'bv-lightbox';
    box.className = 'bv-lightbox';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.innerHTML =
      '<div class="bv-lightbox__dialog">' +
      '<div class="bv-lightbox__media" data-media></div>' +
      '<div class="bv-lightbox__bar">' +
      '<h3 class="bv-lightbox__title" data-title></h3>' +
      '<div class="bv-lightbox__actions">' +
      '<a class="bv-lightbox__open-page" data-page href="#">Sayfada aç</a>' +
      '<button type="button" class="bv-lightbox__close" data-close>Kapat</button>' +
      '</div></div></div>';
    document.body.appendChild(box);

    const close = () => {
      box.classList.remove('is-open');
      const media = box.querySelector('[data-media]');
      if (media) media.innerHTML = '';
      document.body.style.overflow = '';
    };

    box.addEventListener('click', (e) => {
      if (e.target === box || e.target.closest('[data-close]')) close();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && box.classList.contains('is-open')) close();
    });
    return box;
  }

  function withAutoplay(embed) {
    if (!embed) return embed;
    try {
      const u = new URL(embed, window.location.origin);
      if (!u.searchParams.has('autoplay')) u.searchParams.set('autoplay', '1');
      if (!u.searchParams.has('rel')) u.searchParams.set('rel', '0');
      return u.toString();
    } catch (_) {
      return embed.indexOf('autoplay=') >= 0
        ? embed
        : embed + (embed.indexOf('?') >= 0 ? '&' : '?') + 'autoplay=1';
    }
  }

  function openLightbox({ src, embed, title, page }) {
    const box = ensureLightbox();
    const media = box.querySelector('[data-media]');
    const titleEl = box.querySelector('[data-title]');
    const pageEl = box.querySelector('[data-page]');
    if (!media || !titleEl || !pageEl) return;

    titleEl.textContent = title || '';
    pageEl.href = page || '#';
    pageEl.style.display = page ? '' : 'none';

    if (embed) {
      media.innerHTML =
        '<iframe src="' +
        withAutoplay(embed) +
        '" title="' +
        (title || 'Video') +
        '" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="eager"></iframe>';
    } else if (src) {
      media.innerHTML = '<img src="' + src + '" alt="' + (title || '') + '" />';
    }

    box.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  document.querySelectorAll('.bv-lightbox-trigger').forEach((el) => {
    el.addEventListener('click', (e) => {
      // Allow middle-click / ctrl+click to open page normally
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
      e.preventDefault();
      openLightbox({
        src: el.getAttribute('data-lightbox-src'),
        title: el.getAttribute('data-lightbox-title'),
        page: el.getAttribute('data-lightbox-page'),
      });
    });
  });

  document.querySelectorAll('.bv-video-lightbox').forEach((el) => {
    el.addEventListener('click', () => {
      openLightbox({
        embed: el.getAttribute('data-lightbox-embed'),
        title: el.getAttribute('data-lightbox-title'),
        page: el.getAttribute('data-lightbox-page'),
      });
    });
  });

  // Photo / video archive slideshow (Önceki / Sonraki)
  document.querySelectorAll('[data-media-slideshow]').forEach((wrap) => {
    const slides = Array.from(wrap.querySelectorAll('[data-slide-index]'));
    const dots = Array.from(wrap.querySelectorAll('[data-slide-goto]'));
    const prev = wrap.querySelector('[data-slide-prev]');
    const next = wrap.querySelector('[data-slide-next]');
    if (!slides.length) return;

    const startAt = slides.findIndex((el) => el.classList.contains('is-active'));
    let current = startAt >= 0 ? startAt : 0;
    let timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach((el, i) => el.classList.toggle('is-active', i === current));
      dots.forEach((el, i) => el.classList.toggle('is-active', i === current));
    }

    function start() {
      stop();
      if (slides.length < 2) return;
      timer = setInterval(() => show(current + 1), 5200);
    }

    function stop() {
      if (timer) clearInterval(timer);
      timer = null;
    }

    if (prev) prev.addEventListener('click', () => { show(current - 1); start(); });
    if (next) next.addEventListener('click', () => { show(current + 1); start(); });
    dots.forEach((dot) => {
      dot.addEventListener('click', () => {
        show(Number(dot.getAttribute('data-slide-goto') || 0));
        start();
      });
    });

    wrap.querySelectorAll('[data-open-slide]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const i = Number(btn.getAttribute('data-open-slide') || 0);
        show(i);
      });
    });

    // Also wire grid cards outside slideshow that share page
    const pageRoot = wrap.closest('.site-main') || document;
    pageRoot.querySelectorAll('[data-open-slide]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const i = Number(btn.getAttribute('data-open-slide') || 0);
        show(i);
        wrap.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });

    wrap.addEventListener('mouseenter', stop);
    wrap.addEventListener('mouseleave', start);
    document.addEventListener('keydown', (e) => {
      if (!wrap.matches(':hover') && !wrap.contains(document.activeElement)) return;
      if (e.key === 'ArrowLeft') { show(current - 1); start(); }
      if (e.key === 'ArrowRight') { show(current + 1); start(); }
    });

    show(current);
    start();
  });
});
