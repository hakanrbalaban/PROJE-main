/* ============================================================
   NEON BRICK — Parçacık Sistemi
   Tuğla kırılma, güçlendirme, arka plan yıldızları
   ============================================================ */

'use strict';

class ParticleSystem {
  constructor() {
    this.particles = [];
    this.stars = [];
    this.shockwaves = [];
    this.floatTexts = [];
  }

  /** Arka plan yıldızlarını oluştur */
  initStars(width, height, count = 90) {
    this.stars = [];
    for (let i = 0; i < count; i++) {
      this.stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Utils.rand(0.5, 2.2),
        speed: Utils.rand(0.02, 0.12),
        alpha: Utils.rand(0.15, 0.7),
        twinkle: Utils.rand(0, Math.PI * 2)
      });
    }
  }

  /** Yıldızları güncelle ve çiz */
  updateStars(ctx, width, height, time) {
    for (const star of this.stars) {
      star.y += star.speed;
      if (star.y > height) {
        star.y = -2;
        star.x = Math.random() * width;
      }

      const twinkle = 0.5 + 0.5 * Math.sin(time * 0.002 + star.twinkle);
      const alpha = star.alpha * twinkle;

      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200, 230, 255, ${alpha})`;
      ctx.fill();
    }
  }

  /** Tuğla kırılma parçacıkları */
  spawnBrickBreak(x, y, color, count = 14) {
    for (let i = 0; i < count; i++) {
      const angle = Utils.rand(0, Math.PI * 2);
      const speed = Utils.rand(1.5, 6);
      const size = Utils.rand(2, 5);

      this.particles.push({
        type: 'brick',
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        size,
        color,
        life: 1,
        decay: Utils.rand(0.015, 0.035),
        gravity: 0.12,
        rotation: Utils.rand(0, Math.PI * 2),
        rotSpeed: Utils.rand(-0.2, 0.2)
      });
    }
  }

  /** Tuğla vuruş parçacıkları (küçük kıvılcım) */
  spawnSpark(x, y, color, count = 6) {
    for (let i = 0; i < count; i++) {
      const angle = Utils.rand(0, Math.PI * 2);
      const speed = Utils.rand(0.5, 3);

      this.particles.push({
        type: 'spark',
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Utils.rand(1, 2.5),
        color,
        life: 1,
        decay: Utils.rand(0.04, 0.08),
        gravity: 0.05
      });
    }
  }

  /** Güçlendirme toplama parçacıkları */
  spawnPowerUp(x, y, color, count = 20) {
    for (let i = 0; i < count; i++) {
      const angle = Utils.rand(0, Math.PI * 2);
      const speed = Utils.rand(1, 4.5);

      this.particles.push({
        type: 'glow',
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Utils.rand(2, 5),
        color,
        life: 1,
        decay: Utils.rand(0.02, 0.04),
        gravity: 0
      });
    }
  }

  /** Can kaybı patlaması */
  spawnLifeLost(x, y, color = '#ff3b5c', count = 30) {
    for (let i = 0; i < count; i++) {
      const angle = Utils.rand(0, Math.PI * 2);
      const speed = Utils.rand(2, 8);

      this.particles.push({
        type: 'glow',
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Utils.rand(2, 6),
        color,
        life: 1,
        decay: Utils.rand(0.015, 0.03),
        gravity: 0.1
      });
    }
  }

  /** Şok dalgası (seviye tamamlama / güçlü olaylar) */
  spawnShockwave(x, y, color, maxRadius = 120) {
    this.shockwaves.push({
      x, y,
      radius: 5,
      maxRadius,
      color,
      life: 1,
      decay: 0.04
    });
  }

  /** Yüzen skor metni */
  spawnFloatText(x, y, text, color = '#ffe600') {
    this.floatTexts.push({
      x, y,
      text,
      color,
      life: 1,
      decay: 0.02,
      vy: -1.2
    });
  }

  /** Tüm parçacıkları güncelle */
  update(dt) {
    // Parçacıklar
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt * 60;
      p.y += p.vy * dt * 60;
      p.vy += p.gravity * dt * 60;
      p.life -= p.decay * dt * 60;

      if (p.rotation !== undefined) {
        p.rotation += p.rotSpeed * dt * 60;
      }

      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Şok dalgaları
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const s = this.shockwaves[i];
      s.radius += (s.maxRadius - s.radius) * 0.1 * dt * 60;
      s.life -= s.decay * dt * 60;
      if (s.life <= 0) {
        this.shockwaves.splice(i, 1);
      }
    }

    // Yüzen metinler
    for (let i = this.floatTexts.length - 1; i >= 0; i--) {
      const t = this.floatTexts[i];
      t.y += t.vy * dt * 60;
      t.life -= t.decay * dt * 60;
      if (t.life <= 0) {
        this.floatTexts.splice(i, 1);
      }
    }
  }

  /** Tüm parçacıkları çiz */
  draw(ctx) {
    // Parçacıklar
    for (const p of this.particles) {
      const alpha = Math.max(0, p.life);

      if (p.type === 'brick') {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      } else if (p.type === 'spark') {
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.size;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.vx * 2, p.y - p.vy * 2);
        ctx.stroke();
      } else if (p.type === 'glow') {
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    // Şok dalgaları
    for (const s of this.shockwaves) {
      const alpha = Math.max(0, s.life);
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = s.color;
      ctx.lineWidth = 2;
      ctx.shadowColor = s.color;
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // Yüzen metinler
    for (const t of this.floatTexts) {
      const alpha = Math.max(0, t.life);
      ctx.globalAlpha = alpha;
      ctx.font = 'bold 16px Orbitron, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = t.color;
      ctx.shadowColor = t.color;
      ctx.shadowBlur = 10;
      ctx.fillText(t.text, t.x, t.y);
      ctx.shadowBlur = 0;
    }

    ctx.globalAlpha = 1;
  }

  /** Tüm parçacıkları temizle */
  clear() {
    this.particles = [];
    this.shockwaves = [];
    this.floatTexts = [];
  }
}

// Global erişim
window.ParticleSystem = ParticleSystem;