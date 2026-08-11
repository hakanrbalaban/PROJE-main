/* ============================================================
   NEON BRICK — Yardımcı İşlevler
   ============================================================ */

'use strict';

const Utils = {
  /** [min, max] aralığında rastgele sayı */
  rand(min, max) {
    return Math.random() * (max - min) + min;
  },

  /** [min, max] aralığında rastgele tam sayı */
  randInt(min, max) {
    return Math.floor(Utils.rand(min, max + 1));
  },

  /** Değeri [min, max] aralığına sıkıştır */
  clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  },

  /** İki değer arasında doğrusal interpolasyon */
  lerp(a, b, t) {
    return a + (b - a) * t;
  },

  /** Sayıyı 6 haneli sıfır dolgulu formatla (ör. 42 -> 000042) */
  formatScore(value) {
    return String(Math.max(0, Math.floor(value))).padStart(6, '0');
  },

  /** Sayıyı binlik ayraçlı formatla (ör. 12345 -> 12.345) */
  formatNumber(value) {
    return Math.floor(value).toLocaleString('tr-TR');
  },

  /** Hex renk -> rgba string */
  hexToRgba(hex, alpha = 1) {
    const h = hex.replace('#', '');
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  },

  /** Hex renk -> {r, g, b} */
  hexToRgb(hex) {
    const h = hex.replace('#', '');
    return {
      r: parseInt(h.substring(0, 2), 16),
      g: parseInt(h.substring(2, 4), 16),
      b: parseInt(h.substring(4, 6), 16)
    };
  },

  /** Renk karıştır (hex) */
  mixHex(hexA, hexB, t) {
    const a = Utils.hexToRgb(hexA);
    const b = Utils.hexToRgb(hexB);
    const r = Math.round(Utils.lerp(a.r, b.r, t));
    const g = Math.round(Utils.lerp(a.g, b.g, t));
    const bl = Math.round(Utils.lerp(a.b, b.b, t));
    return `rgb(${r}, ${g}, ${bl})`;
  },

  /** İki dikdörtgen çakışıyor mu? */
  rectsOverlap(a, b) {
    return (
      a.x < b.x + b.w &&
      a.x + a.w > b.x &&
      a.y < b.y + b.h &&
      a.y + a.h > b.y
    );
  },

  /** Nokta dikdörtgenin içinde mi? */
  pointInRect(px, py, rect) {
    return (
      px >= rect.x && px <= rect.x + rect.w &&
      py >= rect.y && py <= rect.y + rect.h
    );
  },

  /** İki nokta arası mesafe */
  dist(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  },

  /** Açıyı radyana çevir */
  degToRad(deg) {
    return (deg * Math.PI) / 180;
  },

  /** Radyanı açıya çevir */
  radToDeg(rad) {
    return (rad * 180) / Math.PI;
  },

  /** Vektörü normalize et */
  normalize(x, y) {
    const len = Math.sqrt(x * x + y * y);
    if (len === 0) return { x: 0, y: 0 };
    return { x: x / len, y: y / len };
  },

  /** localStorage'dan değer oku (JSON destekli) */
  storageGet(key, fallback = null) {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return fallback;
      return JSON.parse(raw);
    } catch (e) {
      return fallback;
    }
  },

  /** localStorage'a değer yaz (JSON destekli) */
  storageSet(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      // sessizce geç
    }
  },

  /** DOM öğesini kısa yoldan seç */
  $(selector) {
    return document.querySelector(selector);
  },

  /** DOM öğelerini seç */
  $$(selector) {
    return document.querySelectorAll(selector);
  },

  /** requestAnimationFrame tabanlı zamanlayıcı */
  raf(callback) {
    return requestAnimationFrame(callback);
  },

  /** requestAnimationFrame iptal */
  cancelRaf(id) {
    cancelAnimationFrame(id);
  }
};

// Global erişim
window.Utils = Utils;

/* ============================================================
   CanvasRenderingContext2D.roundRect polyfill
   (Eski tarayıcılar için)
   ============================================================ */
if (!CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, radii) {
    if (typeof radii === 'number') {
      radii = [radii, radii, radii, radii];
    }
    if (!Array.isArray(radii)) {
      radii = [0, 0, 0, 0];
    }
    const [tl, tr, br, bl] = radii;

    this.moveTo(x + tl, y);
    this.lineTo(x + w - tr, y);
    this.arcTo(x + w, y, x + w, y + tr, tr);
    this.lineTo(x + w, y + h - br);
    this.arcTo(x + w, y + h, x + w - br, y + h, br);
    this.lineTo(x + bl, y + h);
    this.arcTo(x, y + h, x, y + h - bl, bl);
    this.lineTo(x, y + tl);
    this.arcTo(x, y, x + tl, y, tl);
    this.closePath();
    return this;
  };
}
