/* ============================================================
   NEON BRICK — Ana Oyun Motoru
   Vanilla JS | Canvas 2D
   ============================================================ */

'use strict';

class Game {
  constructor() {
    // Canvas
    this.canvas = Utils.$('#game-canvas');
    this.ctx = this.canvas.getContext('2d');

    // Boyutlar
    this.width = 0;
    this.height = 0;
    this.dpr = 1;

    // Oyun durumu
    this.state = 'menu'; // menu | playing | paused | levelcomplete | gameover
    this.level = 1;
    this.score = 0;
    this.highScore = Utils.storageGet('neonbrick_highscore', 0);
    this.lives = 3;
    this.maxLives = 5;

    // Zaman
    this.lastTime = 0;
    this.time = 0;
    this.dt = 0;

    // Raket
    this.paddle = {
      x: 0, y: 0,
      w: 120, h: 16,
      baseW: 120,
      speed: 0,
      targetX: 0,
      color: '#00f0ff'
    };

    // Toplar
    this.balls = [];
    this.ballSpeed = 420;
    this.baseBallSpeed = 420;
    this.ballRadius = 7;
    this.ballStuck = true; // top raket üzerinde bekliyor

    // Tuğlalar
    this.bricks = [];
    this.brickCols = 10;
    this.brickRows = 6;
    this.brickGap = 6;
    this.brickTopOffset = 90;
    this.brickSideOffset = 30;

    // Güçlendirmeler
    this.powerups = [];
    this.activeEffects = {
      wide: 0,
      slow: 0,
      multi: 0,
      laser: 0
    };

    // Kombo
    this.combo = 0;
    this.comboTimer = 0;
    this.comboMax = 0;

    // Sistemler
    this.audio = new AudioManager();
    this.particles = new ParticleSystem();

    // Girdi
    this.keys = {};
    this.mouseX = 0;
    this.mouseActive = false;
    this.touchX = 0;

    // DOM referansları
    this.el = {
      hudScore: Utils.$('#hud-score'),
      hudHigh: Utils.$('#hud-high'),
      hudLevel: Utils.$('#hud-level'),
      hudLives: Utils.$('#hud-lives'),
      hudEffects: Utils.$('#hud-effects'),
      comboBadge: Utils.$('#combo-badge'),
      screenMenu: Utils.$('#screen-menu'),
      screenPause: Utils.$('#screen-pause'),
      screenLevelComplete: Utils.$('#screen-levelcomplete'),
      screenGameOver: Utils.$('#screen-gameover'),
      menuHigh: Utils.$('#menu-high'),
      levelDoneNum: Utils.$('#level-done-num'),
      lvBonus: Utils.$('#lv-bonus'),
      lvScore: Utils.$('#lv-score'),
      finalLevel: Utils.$('#final-level'),
      finalScore: Utils.$('#final-score'),
      finalHigh: Utils.$('#final-high'),
      btnMute: Utils.$('#btn-mute')
    };

    // Tuğla renk paleti (seviyeye göre)
    this.brickPalette = [
      '#ff2d95', // pembe
      '#ff6b35', // turuncu
      '#ffe600', // sarı
      '#39ff88', // yeşil
      '#00f0ff', // camgöbeği
      '#9d4dff'  // mor
    ];

    this._bindEvents();
    this._resize();
    this._updateHUD();
    this._updateMuteBtn();
  }

  /* ==========================================================
     Girdi Olayları
     ========================================================== */

  _bindEvents() {
    // Pencere boyutu
    window.addEventListener('resize', () => this._resize());

    // Klavye
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;

      if (e.code === 'Space') {
        e.preventDefault();
        if (this.state === 'playing' && this.ballStuck) {
          this._launchBall();
        }
      }

      if (e.code === 'KeyP' || e.code === 'Escape') {
        if (this.state === 'playing') this._pause();
        else if (this.state === 'paused') this._resume();
      }

      if (e.code === 'KeyM') {
        this._toggleMute();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });

    // Fare
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouseX = (e.clientX - rect.left) * (this.width / rect.width);
      this.mouseActive = true;
    });

    this.canvas.addEventListener('mousedown', (e) => {
      if (this.state === 'playing' && this.ballStuck) {
        this._launchBall();
      }
    });

    // Dokunmatik
    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const rect = this.canvas.getBoundingClientRect();
      const touch = e.touches[0];
      this.touchX = (touch.clientX - rect.left) * (this.width / rect.width);
      this.mouseActive = true;
    }, { passive: false });

    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const rect = this.canvas.getBoundingClientRect();
      const touch = e.touches[0];
      this.touchX = (touch.clientX - rect.left) * (this.width / rect.width);
      this.mouseActive = true;

      if (this.state === 'playing' && this.ballStuck) {
        this._launchBall();
      }
    }, { passive: false });

    // Butonlar
    Utils.$('#btn-start').addEventListener('click', () => this._startGame());
    Utils.$('#btn-resume').addEventListener('click', () => this._resume());
    Utils.$('#btn-restart').addEventListener('click', () => this._startGame());
    Utils.$('#btn-quit').addEventListener('click', () => this._showMenu());
    Utils.$('#btn-next').addEventListener('click', () => this._nextLevel());
    Utils.$('#btn-again').addEventListener('click', () => this._startGame());
    Utils.$('#btn-menu').addEventListener('click', () => this._showMenu());
    this.el.btnMute.addEventListener('click', () => this._toggleMute());
  }

  /* ==========================================================
     Boyutlandırma
     ========================================================== */

  _resize() {
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.canvas.style.width = this.width + 'px';
    this.canvas.style.height = this.height + 'px';

    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    // Raket konumunu güncelle
    this.paddle.y = this.height - 50;
    this.paddle.x = this.width / 2 - this.paddle.w / 2;
    this.paddle.targetX = this.paddle.x;

    // Yıldızları yeniden oluştur
    this.particles.initStars(this.width, this.height);

    // Topları yeniden konumlandır
    if (this.ballStuck && this.balls.length > 0) {
      this.balls[0].x = this.paddle.x + this.paddle.w / 2;
      this.balls[0].y = this.paddle.y - this.ballRadius - 1;
    }
  }

  /* ==========================================================
     Oyun Akışı
     ========================================================== */

  _startGame() {
    this.audio.init();
    this.audio.startMusic();

    this.level = 1;
    this.score = 0;
    this.lives = 3;
    this.combo = 0;
    this.comboMax = 0;
    this.activeEffects = { wide: 0, slow: 0, multi: 0, laser: 0 };
    this.powerups = [];
    this.particles.clear();

    this._hideAllScreens();
    this.state = 'playing';
    this._buildLevel();
    this._resetBall();
    this._updateHUD();
  }

  _pause() {
    if (this.state !== 'playing') return;
    this.state = 'paused';
    this.el.screenPause.classList.remove('hidden');
  }

  _resume() {
    if (this.state !== 'paused') return;
    this.state = 'playing';
    this.el.screenPause.classList.add('hidden');
    this.lastTime = performance.now();
  }

  _nextLevel() {
    this.level++;
    this.combo = 0;
    this.comboMax = 0;
    this.powerups = [];
    this.activeEffects = { wide: 0, slow: 0, multi: 0, laser: 0 };
    this.paddle.w = this.paddle.baseW;

    // Top hızı sabit kalır
    this.baseBallSpeed = 420;
    this.ballSpeed = this.baseBallSpeed;

    this._hideAllScreens();
    this.state = 'playing';
    this._buildLevel();
    this._resetBall();
    this._updateHUD();
  }

  _showMenu() {
    this.audio.stopMusic();
    this.state = 'menu';
    this._hideAllScreens();
    this.el.screenMenu.classList.remove('hidden');
    this.el.menuHigh.textContent = Utils.formatScore(this.highScore);
  }

  _gameOver() {
    this.state = 'gameover';
    this.audio.stopMusic();
    this.audio.gameOver();

    // Rekor kontrolü
    if (this.score > this.highScore) {
      this.highScore = this.score;
      Utils.storageSet('neonbrick_highscore', this.highScore);
    }

    this.el.finalLevel.textContent = this.level;
    this.el.finalScore.textContent = Utils.formatNumber(this.score);
    this.el.finalHigh.textContent = Utils.formatNumber(this.highScore);
    this.el.screenGameOver.classList.remove('hidden');
    this._updateHUD();
  }

  _levelComplete() {
    this.state = 'levelcomplete';
    this.audio.levelComplete();

    const bonus = this.level * 100 + this.comboMax * 25;
    this.score += bonus;

    this.el.levelDoneNum.textContent = this.level;
    this.el.lvBonus.textContent = '+' + Utils.formatNumber(bonus);
    this.el.lvScore.textContent = Utils.formatNumber(this.score);
    this.el.screenLevelComplete.classList.remove('hidden');
    this._updateHUD();
  }

  _hideAllScreens() {
    this.el.screenMenu.classList.add('hidden');
    this.el.screenPause.classList.add('hidden');
    this.el.screenLevelComplete.classList.add('hidden');
    this.el.screenGameOver.classList.add('hidden');
  }

  /* ==========================================================
     Seviye Oluşturma
     ========================================================== */

  _buildLevel() {
    this.bricks = [];

    // Seviyeye göre satır/sütun ayarla
    this.brickCols = Math.min(8 + Math.floor(this.level / 2), 14);
    this.brickRows = Math.min(4 + Math.floor(this.level / 2), 8);

    const availW = this.width - this.brickSideOffset * 2;
    const brickW = (availW - (this.brickCols - 1) * this.brickGap) / this.brickCols;
    const brickH = 24;

    // Seviye deseni
    const pattern = this._getLevelPattern();

    for (let row = 0; row < this.brickRows; row++) {
      for (let col = 0; col < this.brickCols; col++) {
        const type = pattern[row][col];
        if (type === 0) continue;

        const x = this.brickSideOffset + col * (brickW + this.brickGap);
        const y = this.brickTopOffset + row * (brickH + this.brickGap);

        const colorIndex = Math.min(row, this.brickPalette.length - 1);
        const color = this.brickPalette[colorIndex];

        this.bricks.push({
          x, y, w: brickW, h: brickH,
          hp: type,
          maxHp: type,
          color,
          alive: true,
          flash: 0
        });
      }
    }
  }

  /** Seviye deseni üret (procedural) */
  _getLevelPattern() {
    const rows = this.brickRows;
    const cols = this.brickCols;
    const pattern = [];

    for (let r = 0; r < rows; r++) {
      const row = [];
      for (let c = 0; c < cols; c++) {
        let type = 1; // varsayılan normal tuğla

        // Seviye arttıkça güçlü tuğlalar
        const strongChance = Math.min(0.1 + this.level * 0.02, 0.4);
        const steelChance = Math.min(0.02 + this.level * 0.01, 0.15);

        if (Math.random() < steelChance) {
          type = 3; // çelik
        } else if (Math.random() < strongChance) {
          type = 2; // güçlü
        }

        // Desen varyasyonları
        if (r === 0 && c % 3 === 0) type = Math.max(type, 2);
        if (r === rows - 1 && c % 4 === 0) type = 0; // boşluk

        // Üçgen desen (üst satırlar)
        if (r < 2 && (c < r || c >= cols - r)) type = 0;

        row.push(type);
      }
      pattern.push(row);
    }

    return pattern;
  }

  /* ==========================================================
     Top Yönetimi
     ========================================================== */

  _resetBall() {
    this.balls = [{
      x: this.paddle.x + this.paddle.w / 2,
      y: this.paddle.y - this.ballRadius - 1,
      vx: 0,
      vy: 0,
      speed: this.baseBallSpeed,
      stuck: true
    }];
    this.ballStuck = true;
    this.ballSpeed = this.baseBallSpeed;
  }

  _launchBall() {
    const ball = this.balls[0];
    if (!ball || !ball.stuck) return;

    ball.stuck = false;
    this.ballStuck = false;

    // Rastgele ama kontrollü açı
    const angle = Utils.degToRad(Utils.rand(-35, 35) - 90);
    ball.vx = Math.cos(angle) * ball.speed;
    ball.vy = Math.sin(angle) * ball.speed;

    this.audio.launch();
  }

  _addBall(x, y) {
    const angle = Utils.degToRad(Utils.rand(-30, 30) - 90);
    const speed = this.ballSpeed;

    this.balls.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      speed,
      stuck: false
    });
  }

  /* ==========================================================
     Güçlendirmeler
     ========================================================== */

  _spawnPowerUp(x, y) {
    const types = ['wide', 'slow', 'multi', 'life', 'laser'];
    const weights = [0.3, 0.2, 0.2, 0.1, 0.2];
    const roll = Math.random();

    let type = 'wide';
    let acc = 0;
    for (let i = 0; i < types.length; i++) {
      acc += weights[i];
      if (roll < acc) {
        type = types[i];
        break;
      }
    }

    const colors = {
      wide: '#00f0ff',
      slow: '#9d4dff',
      multi: '#ff2d95',
      life: '#39ff88',
      laser: '#ffe600'
    };

    this.powerups.push({
      x, y,
      vy: 2.5,
      w: 26, h: 18,
      type,
      color: colors[type],
      alive: true
    });
  }

  _applyPowerUp(type) {
    this.audio.powerUp();

    switch (type) {
      case 'wide':
        this.activeEffects.wide = 15;
        this.paddle.w = this.paddle.baseW * 1.6;
        this.particles.spawnPowerUp(this.paddle.x + this.paddle.w / 2, this.paddle.y, '#00f0ff');
        break;

      case 'slow':
        this.activeEffects.slow = 10;
        this.ballSpeed = this.baseBallSpeed * 0.7;
        for (const ball of this.balls) {
          const len = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
          if (len > 0) {
            ball.vx = (ball.vx / len) * this.ballSpeed;
            ball.vy = (ball.vy / len) * this.ballSpeed;
          }
        }
        this.particles.spawnPowerUp(this.paddle.x + this.paddle.w / 2, this.paddle.y, '#9d4dff');
        break;

      case 'multi':
        this.activeEffects.multi = 1;
        if (this.balls.length < 5) {
          const src = this.balls[0];
          for (let i = 0; i < 2; i++) {
            this._addBall(src.x, src.y);
          }
        }
        this.particles.spawnPowerUp(this.paddle.x + this.paddle.w / 2, this.paddle.y, '#ff2d95');
        break;

      case 'life':
        if (this.lives < this.maxLives) {
          this.lives++;
          this._updateHUD();
        }
        this.particles.spawnPowerUp(this.paddle.x + this.paddle.w / 2, this.paddle.y, '#39ff88');
        break;

      case 'laser':
        this.activeEffects.laser = 8;
        this.particles.spawnPowerUp(this.paddle.x + this.paddle.w / 2, this.paddle.y, '#ffe600');
        break;
    }

    this._updateEffectsHUD();
  }

  _updateEffectsHUD() {
    const chips = [];
    if (this.activeEffects.wide > 0) chips.push({ label: 'GENİŞ', warn: this.activeEffects.wide < 3 });
    if (this.activeEffects.slow > 0) chips.push({ label: 'YAVAŞ', warn: this.activeEffects.slow < 3 });
    if (this.activeEffects.multi > 0) chips.push({ label: 'ÇOKLU', warn: false });
    if (this.activeEffects.laser > 0) chips.push({ label: 'LAZER', warn: this.activeEffects.laser < 3 });

    this.el.hudEffects.innerHTML = chips
      .map(c => `<span class="effect-chip${c.warn ? ' warn' : ''}">${c.label}</span>`)
      .join('');
  }

  /* ==========================================================
     Güncelleme
     ========================================================== */

  _update(dt) {
    // Zamanlayıcılar
    this.time += dt * 1000;

    // Kombo zamanlayıcı
    if (this.comboTimer > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) {
        this.combo = 0;
        this.el.comboBadge.classList.add('hidden');
      }
    }

    // Aktif efekt süreleri
    let effectsChanged = false;
    for (const key of ['wide', 'slow', 'laser']) {
      if (this.activeEffects[key] > 0) {
        this.activeEffects[key] -= dt;
        if (this.activeEffects[key] <= 0) {
          this.activeEffects[key] = 0;
          effectsChanged = true;
        }
      }
    }

    if (effectsChanged) {
      if (this.activeEffects.wide <= 0) this.paddle.w = this.paddle.baseW;
      if (this.activeEffects.slow <= 0) {
        this.ballSpeed = this.baseBallSpeed;
        for (const ball of this.balls) {
          const len = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
          if (len > 0) {
            ball.vx = (ball.vx / len) * this.ballSpeed;
            ball.vy = (ball.vy / len) * this.ballSpeed;
          }
        }
      }
      this._updateEffectsHUD();
    }

    // Raket hareketi
    this._updatePaddle(dt);

    // Toplar
    this._updateBalls(dt);

    // Güçlendirmeler
    this._updatePowerUps(dt);

    // Parçacıklar
    this.particles.update(dt);

    // Tuğla flash süreleri
    for (const brick of this.bricks) {
      if (brick.flash > 0) brick.flash -= dt;
    }
  }

  _updatePaddle(dt) {
    const speed = 900;

    // Klavye
    if (this.keys['ArrowLeft'] || this.keys['KeyA']) {
      this.paddle.x -= speed * dt;
      this.mouseActive = false;
    }
    if (this.keys['ArrowRight'] || this.keys['KeyD']) {
      this.paddle.x += speed * dt;
      this.mouseActive = false;
    }

    // Fare / dokunmatik
    if (this.mouseActive) {
      const pointerX = this.touchX > 0 ? this.touchX : this.mouseX;
      this.paddle.targetX = pointerX - this.paddle.w / 2;
      this.paddle.x = Utils.lerp(this.paddle.x, this.paddle.targetX, 0.35);
    }

    // Sınırlar
    this.paddle.x = Utils.clamp(this.paddle.x, 8, this.width - this.paddle.w - 8);

    // Top raket üzerindeyse takip et
    if (this.ballStuck && this.balls.length > 0) {
      const ball = this.balls[0];
      ball.x = this.paddle.x + this.paddle.w / 2;
      ball.y = this.paddle.y - this.ballRadius - 1;
    }
  }

  _updateBalls(dt) {
    for (let i = this.balls.length - 1; i >= 0; i--) {
      const ball = this.balls[i];
      if (ball.stuck) continue;

      ball.x += ball.vx * dt;
      ball.y += ball.vy * dt;

      // Sol / sağ duvar
      if (ball.x - this.ballRadius < 0) {
        ball.x = this.ballRadius;
        ball.vx = Math.abs(ball.vx);
        this.audio.wallHit();
      } else if (ball.x + this.ballRadius > this.width) {
        ball.x = this.width - this.ballRadius;
        ball.vx = -Math.abs(ball.vx);
        this.audio.wallHit();
      }

      // Üst duvar
      if (ball.y - this.ballRadius < 0) {
        ball.y = this.ballRadius;
        ball.vy = Math.abs(ball.vy);
        this.audio.wallHit();
      }

      // Alt (can kaybı)
      if (ball.y - this.ballRadius > this.height) {
        this.balls.splice(i, 1);
        this.particles.spawnLifeLost(ball.x, this.height - 20);
        continue;
      }

      // Raket çarpışması
      this._checkPaddleCollision(ball);

      // Tuğla çarpışması
      this._checkBrickCollision(ball);
    }

    // Toplar bittiyse can kaybı
    if (this.balls.length === 0) {
      this._loseLife();
    }
  }

  _checkPaddleCollision(ball) {
    const p = this.paddle;
    const bx = ball.x;
    const by = ball.y + this.ballRadius;

    if (
      by >= p.y &&
      by <= p.y + p.h + 8 &&
      bx >= p.x - this.ballRadius &&
      bx <= p.x + p.w + this.ballRadius &&
      ball.vy > 0
    ) {
      // Raketin merkezine göre vuruş noktası
      const hitPos = (bx - p.x) / p.w; // 0..1
      const angle = Utils.degToRad(Utils.lerp(-60, 60, hitPos) - 90);

      ball.vy = Math.sin(angle) * ball.speed;
      ball.vx = Math.cos(angle) * ball.speed;

      // Topu raketin üstüne al
      ball.y = p.y - this.ballRadius - 1;

      this.audio.paddleHit();
      this.particles.spawnSpark(bx, p.y, '#00f0ff', 4);

      // Lazer efekti
      if (this.activeEffects.laser > 0) {
        this._fireLaser();
      }
    }
  }

  _fireLaser() {
    // Raketin iki ucundan lazer ışını
    const p = this.paddle;
    const laserY = p.y - 4;

    // Üstteki tuğlaları vur
    for (const brick of this.bricks) {
      if (!brick.alive) continue;
      if (brick.y + brick.h >= laserY && brick.y <= laserY + 4) {
        this._hitBrick(brick, 2);
      }
    }

    this.particles.spawnSpark(p.x + 5, laserY, '#ffe600', 3);
    this.particles.spawnSpark(p.x + p.w - 5, laserY, '#ffe600', 3);
  }

  _checkBrickCollision(ball) {
    for (const brick of this.bricks) {
      if (!brick.alive) continue;

      // Topun sınır kutusu
      const ballRect = {
        x: ball.x - this.ballRadius,
        y: ball.y - this.ballRadius,
        w: this.ballRadius * 2,
        h: this.ballRadius * 2
      };

      const brickRect = { x: brick.x, y: brick.y, w: brick.w, h: brick.h };

      if (!Utils.rectsOverlap(ballRect, brickRect)) continue;

      // Çarpışma yönünü belirle
      const overlapLeft = ball.x + this.ballRadius - brick.x;
      const overlapRight = brick.x + brick.w - (ball.x - this.ballRadius);
      const overlapTop = ball.y + this.ballRadius - brick.y;
      const overlapBottom = brick.y + brick.h - (ball.y - this.ballRadius);

      const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

      if (minOverlap === overlapLeft || minOverlap === overlapRight) {
        ball.vx = -ball.vx;
        if (minOverlap === overlapLeft) ball.x = brick.x - this.ballRadius;
        else ball.x = brick.x + brick.w + this.ballRadius;
      } else {
        ball.vy = -ball.vy;
        if (minOverlap === overlapTop) ball.y = brick.y - this.ballRadius;
        else ball.y = brick.y + brick.h + this.ballRadius;
      }

      this._hitBrick(brick, 1);
      break;
    }
  }

  _hitBrick(brick, damage) {
    brick.hp -= damage;
    brick.flash = 0.1;

    if (brick.hp <= 0) {
      brick.alive = false;

      // Skor
      const baseScore = 10 * (brick.maxHp);
      const comboMult = 1 + this.combo * 0.5;
      const points = Math.round(baseScore * comboMult);
      this.score += points;

      // Kombo
      this.combo++;
      this.comboMax = Math.max(this.comboMax, this.combo);
      this.comboTimer = 2.5;

      // Kombo rozeti
      if (this.combo >= 2) {
        this.el.comboBadge.textContent = `KOMBO x${this.combo}`;
        this.el.comboBadge.classList.remove('hidden');
        this.el.comboBadge.style.animation = 'none';
        void this.el.comboBadge.offsetWidth;
        this.el.comboBadge.style.animation = '';
        this.audio.combo(this.combo);
      }

      // Parçacıklar
      this.particles.spawnBrickBreak(brick.x + brick.w / 2, brick.y + brick.h / 2, brick.color);
      this.particles.spawnFloatText(
        brick.x + brick.w / 2,
        brick.y,
        '+' + points,
        this.combo >= 2 ? '#ffe600' : '#e8f6ff'
      );

      this.audio.brickBreak(brick.maxHp);

      // Güçlendirme düşürme şansı
      if (Math.random() < 0.12) {
        this._spawnPowerUp(brick.x + brick.w / 2, brick.y + brick.h / 2);
      }

      // Seviye tamamlandı mı?
      const remaining = this.bricks.filter(b => b.alive).length;
      if (remaining === 0) {
        this._levelComplete();
      }
    } else {
      // Vuruldu ama kırılmadı
      this.particles.spawnSpark(brick.x + brick.w / 2, brick.y + brick.h / 2, brick.color);
      this.audio.brickHit(brick.hp);
    }

    this._updateHUD();
  }

  _updatePowerUps(dt) {
    for (let i = this.powerups.length - 1; i >= 0; i--) {
      const pu = this.powerups[i];
      pu.y += pu.vy * dt;

      // Ekran dışı
      if (pu.y > this.height + 30) {
        this.powerups.splice(i, 1);
        continue;
      }

      // Raketle çarpışma
      const p = this.paddle;
      if (
        pu.y + pu.h >= p.y &&
        pu.y <= p.y + p.h &&
        pu.x + pu.w >= p.x &&
        pu.x <= p.x + p.w
      ) {
        this._applyPowerUp(pu.type);
        this.powerups.splice(i, 1);
      }
    }
  }

  _loseLife() {
    this.lives--;
    this.combo = 0;
    this.comboMax = 0;
    this.el.comboBadge.classList.add('hidden');
    this.audio.lifeLost();

    this._updateHUD();

    if (this.lives <= 0) {
      this._gameOver();
    } else {
      this._resetBall();
    }
  }

  /* ==========================================================
     HUD Güncelleme
     ========================================================== */

  _updateHUD() {
    this.el.hudScore.textContent = Utils.formatScore(this.score);
    this.el.hudHigh.textContent = Utils.formatScore(Math.max(this.highScore, this.score));
    this.el.hudLevel.textContent = this.level;

    // Canlar
    let livesHtml = '';
    for (let i = 0; i < this.maxLives; i++) {
      livesHtml += `<span class="life${i < this.lives ? '' : ' lost'}">❤</span>`;
    }
    this.el.hudLives.innerHTML = livesHtml;
  }

  _toggleMute() {
    this.audio.init();
    const muted = this.audio.toggleMute();
    this._updateMuteBtn();
  }

  _updateMuteBtn() {
    this.el.btnMute.textContent = this.audio.isMuted() ? '🔇' : '🔊';
  }

  /* ==========================================================
     Çizim
     ========================================================== */

  _draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    // Arka plan degrade
    const grad = ctx.createRadialGradient(
      this.width / 2, this.height * 0.3, 0,
      this.width / 2, this.height * 0.3, this.height * 0.8
    );
    grad.addColorStop(0, '#0a0f24');
    grad.addColorStop(1, '#050814');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.width, this.height);

    // Yıldızlar
    this.particles.updateStars(ctx, this.width, this.height, this.time);

    // Tuğlalar
    this._drawBricks(ctx);

    // Güçlendirmeler
    this._drawPowerUps(ctx);

    // Raket
    this._drawPaddle(ctx);

    // Toplar
    this._drawBalls(ctx);

    // Parçacıklar
    this.particles.draw(ctx);

    // Alt sınır çizgisi
    ctx.strokeStyle = 'rgba(255, 59, 92, 0.3)';
    ctx.lineWidth = 1;
    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    ctx.moveTo(0, this.height - 20);
    ctx.lineTo(this.width, this.height - 20);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  _drawBricks(ctx) {
    for (const brick of this.bricks) {
      if (!brick.alive) continue;

      const alpha = brick.hp === 3 ? 0.85 : 1;
      const color = brick.flash > 0 ? '#ffffff' : brick.color;

      // Gölge / parlama
      ctx.shadowColor = brick.color;
      ctx.shadowBlur = 8;

      // Gövde
      ctx.fillStyle = Utils.hexToRgba(brick.color, alpha * 0.25);
      ctx.fillRect(brick.x, brick.y, brick.w, brick.h);

      // Kenarlık
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(brick.x + 0.75, brick.y + 0.75, brick.w - 1.5, brick.h - 1.5);

      ctx.shadowBlur = 0;

      // İç parlaklık
      ctx.fillStyle = Utils.hexToRgba(brick.color, alpha * 0.15);
      ctx.fillRect(brick.x + 3, brick.y + 3, brick.w - 6, brick.h - 6);

      // Dayanıklılık göstergesi
      if (brick.maxHp > 1) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = 'bold 11px Orbitron, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(brick.hp, brick.x + brick.w / 2, brick.y + brick.h / 2 + 1);
      }
    }
  }

  _drawPaddle(ctx) {
    const p = this.paddle;

    // Parlama
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 18;

    // Gövde
    const grad = ctx.createLinearGradient(p.x, p.y, p.x, p.y + p.h);
    grad.addColorStop(0, '#00f0ff');
    grad.addColorStop(1, '#0088cc');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(p.x, p.y, p.w, p.h, 8);
    ctx.fill();

    ctx.shadowBlur = 0;

    // Üst parlak çizgi
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.beginPath();
    ctx.roundRect(p.x + 3, p.y + 2, p.w - 6, 3, 2);
    ctx.fill();

    // Lazer göstergesi
    if (this.activeEffects.laser > 0) {
      ctx.fillStyle = 'rgba(255, 230, 0, 0.8)';
      ctx.shadowColor = '#ffe600';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.roundRect(p.x + 4, p.y - 3, 4, 6, 2);
      ctx.fill();
      ctx.beginPath();
      ctx.roundRect(p.x + p.w - 8, p.y - 3, 4, 6, 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  _drawBalls(ctx) {
    for (const ball of this.balls) {
      // Parlama
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 15;

      // Gövde
      const grad = ctx.createRadialGradient(
        ball.x - 2, ball.y - 2, 1,
        ball.x, ball.y, this.ballRadius
      );
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.4, '#00f0ff');
      grad.addColorStop(1, '#0066aa');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, this.ballRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.shadowBlur = 0;

      // İz efekti
      if (!ball.stuck) {
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.2)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(ball.x, ball.y);
        ctx.lineTo(ball.x - ball.vx * 3, ball.y - ball.vy * 3);
        ctx.stroke();
      }
    }
  }

  _drawPowerUps(ctx) {
    for (const pu of this.powerups) {
      ctx.shadowColor = pu.color;
      ctx.shadowBlur = 12;

      // Gövde
      ctx.fillStyle = Utils.hexToRgba(pu.color, 0.2);
      ctx.beginPath();
      ctx.roundRect(pu.x, pu.y, pu.w, pu.h, 5);
      ctx.fill();

      ctx.strokeStyle = pu.color;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(pu.x + 0.75, pu.y + 0.75, pu.w - 1.5, pu.h - 1.5);

      ctx.shadowBlur = 0;

      // Sembol
      ctx.fillStyle = pu.color;
      ctx.font = 'bold 12px Orbitron, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const symbols = {
        wide: '⇔',
        slow: '◷',
        multi: '✚',
        life: '♥',
        laser: '⚡'
      };
      ctx.fillText(symbols[pu.type] || '?', pu.x + pu.w / 2, pu.y + pu.h / 2 + 1);
    }
  }

  /* ==========================================================
     Ana Döngü
     ========================================================== */

  _loop(timestamp) {
    const dt = Math.min((timestamp - this.lastTime) / 1000, 0.05);
    this.lastTime = timestamp;

    if (this.state === 'playing') {
      this._update(dt);
    }

    this._draw();

    requestAnimationFrame((t) => this._loop(t));
  }

  start() {
    this.lastTime = performance.now();
    requestAnimationFrame((t) => this._loop(t));
  }
}

// Oyunu başlat
window.addEventListener('DOMContentLoaded', () => {
  const game = new Game();
  game.start();
  window.game = game;
});