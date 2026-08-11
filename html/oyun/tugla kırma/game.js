(() => {
  "use strict";

  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  const scoreEl = document.getElementById("score");
  const levelEl = document.getElementById("level");
  const livesEl = document.getElementById("lives");
  const overlay = document.getElementById("overlay");
  const titleEl = document.getElementById("title");
  const messageEl = document.getElementById("message");
  const actionBtn = document.getElementById("actionBtn");
  const powerBar = document.getElementById("powerBar");
  const eyebrowEl = document.getElementById("eyebrow");

  let W = 480;
  let H = 640;
  let paddleBottom = 56;

  // Toplam ~%14 düşme şansı (önceden ~%62 idi)
  const POWER = {
    life:  { id: "life",  label: "Can +1",     color: "#ff4d8d", chance: 0.015, timed: false },
    multi: { id: "multi", label: "Çoklu Top",  color: "#3de7ff", chance: 0.03,  timed: false },
    break: { id: "break", label: "Kırıcı",     color: "#ff8a3d", chance: 0.025, timed: true, duration: 8 },
    wide:  { id: "wide",  label: "Geniş Raket", color: "#7dffb3", chance: 0.03,  timed: true, duration: 10 },
    slow:  { id: "slow",  label: "Yavaş Top",  color: "#9b7bff", chance: 0.02,  timed: true, duration: 8 },
    fire:  { id: "fire",  label: "Ateş Topu",  color: "#ffd166", chance: 0.02,  timed: true, duration: 7 },
  };
  const POWER_LIST = Object.values(POWER);

  const NEON = [
    ["#ff2d6f", "#ff7aa8"],
    ["#ff7a18", "#ffb06a"],
    ["#ffe14a", "#fff0a0"],
    ["#39ff9a", "#9affc9"],
    ["#2ef0ff", "#8af7ff"],
    ["#b14dff", "#d4a0ff"],
    ["#ff3dce", "#ff9ae4"],
  ];

  const state = {
    mode: "menu",
    score: 0,
    lives: 3,
    level: 1,
    bricks: [],
    balls: [],
    drops: [],
    particles: [],
    floats: [],
    effects: {},
    keys: { left: false, right: false },
    pointerX: null,
    lastTime: 0,
    basePaddleW: 100,
    pulse: 0,
  };

  const paddle = { w: 100, h: 16, x: 190, y: 560, speed: 520, targetW: 100 };
  let powerBarKey = "";
  let lastCssW = 0;
  let lastCssH = 0;

  function resize(force = false) {
    const stage = canvas.parentElement;
    const rect = stage.getBoundingClientRect();
    const cssW = Math.max(180, Math.floor(rect.width));
    const cssH = Math.max(220, Math.floor(rect.height));

    // Item bitince layout titremesin — anlamsız yeniden boyutlandırmayı atla
    if (!force && Math.abs(cssW - lastCssW) < 2 && Math.abs(cssH - lastCssH) < 2) {
      return;
    }
    lastCssW = cssW;
    lastCssH = cssH;

    const dpr = Math.min(2.5, window.devicePixelRatio || 1);
    canvas.width = Math.floor(cssW * dpr);
    canvas.height = Math.floor(cssH * dpr);
    canvas.style.width = cssW + "px";
    canvas.style.height = cssH + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    W = cssW;
    H = cssH;
    paddleBottom = Math.max(44, Math.min(72, H * 0.09));
    paddle.h = Math.max(12, Math.min(18, H * 0.024));
    paddle.y = H - paddleBottom;
    paddle.x = Math.max(8, Math.min(W - paddle.w - 8, paddle.x));

    if (state.bricks.length) layoutBricks(state.bricks);
  }

  function colsForWidth() {
    if (W >= 1100) return 14;
    if (W >= 900) return 12;
    if (W >= 700) return 10;
    if (W >= 500) return 8;
    return 7;
  }

  function brickLayoutMetrics(cols, rows) {
    const side = Math.max(10, W * 0.028);
    const top = Math.max(28, H * 0.055);
    const gap = Math.max(3, Math.min(8, W * 0.01));
    const maxArea = H * 0.44;
    const bw = (W - side * 2 - gap * (cols - 1)) / cols;
    let bh = Math.min(24, Math.max(12, bw * 0.36));
    if (rows * (bh + gap) > maxArea) bh = Math.max(10, maxArea / rows - gap);
    return { side, top, gap, bw, bh };
  }

  function layoutBricks(list) {
    if (!list.length) return;
    const cols = Math.max(...list.map((b) => b.col)) + 1;
    const rows = Math.max(...list.map((b) => b.row)) + 1;
    const m = brickLayoutMetrics(cols, rows);
    for (const b of list) {
      b.x = m.side + b.col * (m.bw + m.gap);
      b.y = m.top + b.row * (m.bh + m.gap);
      b.w = m.bw;
      b.h = m.bh;
    }
  }

  function buildBricks(level) {
    const cols = colsForWidth();
    // Sınırsız seviye: satır sayısı 5–11 arası salınır, zorluk HP ile artar
    const rows = 5 + ((level - 1) % 7);
    const list = [];
    const patterns = level % 4;
    const hpBase = 1 + Math.min(4, Math.floor((level - 1) / 4));

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (patterns === 1 && (row + col) % 2 === 0 && level > 1) continue;
        if (patterns === 2 && col > 1 && col < cols - 2 && row === Math.floor(rows / 2)) continue;
        if (patterns === 3 && row % 2 === 1 && (col === 0 || col === cols - 1)) continue;

        let hp = hpBase;
        if (row < 2 && level > 2) hp += 1;
        if (level >= 6 && row === 0 && col % 4 === 0) hp += 1;
        hp = Math.min(6, hp);

        const colors = NEON[(row + level) % NEON.length];
        list.push({
          col, row, x: 0, y: 0, w: 40, h: 18,
          hp, maxHp: hp,
          color: colors[0],
          colorSoft: colors[1],
          alive: true,
        });
      }
    }
    layoutBricks(list);
    return list;
  }

  function ballSpeed() {
    // Sınırsız ama tavanlı hız
    let spd = 250 + Math.min(220, (state.level - 1) * 12);
    if (state.effects.slow) spd *= 0.65;
    return spd;
  }

  function makeBall(x, y, angle, stuck) {
    const spd = ballSpeed();
    return {
      x, y,
      r: Math.max(6.5, Math.min(10, Math.min(W, H) * 0.014)),
      vx: Math.cos(angle) * spd,
      vy: Math.sin(angle) * spd,
      stuck: !!stuck,
    };
  }

  function resetBalls(attach = true) {
    const angle = -Math.PI / 2 + (Math.random() * 0.35 - 0.175);
    state.balls = [makeBall(paddle.x + paddle.w / 2, paddle.y - 12, angle, attach)];
  }

  function launchBalls() {
    if (state.mode !== "playing") return;
    for (const b of state.balls) {
      if (!b.stuck) continue;
      b.stuck = false;
      const angle = -Math.PI / 2 + (Math.random() * 0.45 - 0.225);
      const spd = ballSpeed();
      b.vx = Math.cos(angle) * spd;
      b.vy = Math.sin(angle) * spd;
    }
  }

  function spawnBurst(x, y, color, n = 14) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = 60 + Math.random() * 160;
      state.particles.push({
        x, y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s,
        life: 0.35 + Math.random() * 0.4,
        max: 0.75,
        size: 2 + Math.random() * 3.5,
        color,
      });
    }
  }

  function floatText(x, y, text, color) {
    state.floats.push({ x, y, text, color, life: 0.9, max: 0.9 });
  }

  function maybeDrop(brick) {
    const roll = Math.random();
    let acc = 0;
    for (const p of POWER_LIST) {
      acc += p.chance;
      if (roll <= acc) {
        state.drops.push({
          x: brick.x + brick.w / 2,
          y: brick.y + brick.h / 2,
          r: Math.max(10, Math.min(14, W * 0.025)),
          vy: 100 + Math.random() * 25,
          type: p.id,
          color: p.color,
          label: p.label,
          wobble: Math.random() * Math.PI * 2,
        });
        return;
      }
    }
  }

  function clearEffects() {
    state.effects = {};
    paddle.targetW = state.basePaddleW;
    paddle.w = state.basePaddleW;
    renderPowerBar(true);
  }

  function applyPower(type) {
    const def = POWER[type];
    if (!def) return;
    floatText(paddle.x + paddle.w / 2, paddle.y - 28, def.label, def.color);
    spawnBurst(paddle.x + paddle.w / 2, paddle.y, def.color, 16);

    if (type === "life") {
      state.lives = Math.min(6, state.lives + 1);
      syncHud();
    } else if (type === "multi") {
      const extras = [];
      for (const b of state.balls) {
        if (b.stuck) continue;
        extras.push(makeBall(b.x, b.y, -Math.PI / 2 - 0.45, false));
        extras.push(makeBall(b.x, b.y, -Math.PI / 2 + 0.45, false));
      }
      if (!extras.length) {
        const cx = paddle.x + paddle.w / 2;
        extras.push(makeBall(cx, paddle.y - 14, -Math.PI / 2 - 0.4, false));
        extras.push(makeBall(cx, paddle.y - 14, -Math.PI / 2 + 0.4, false));
        for (const b of state.balls) b.stuck = false;
      }
      state.balls.push(...extras);
    } else if (def.timed) {
      state.effects[type] = def.duration;
      if (type === "wide") {
        paddle.targetW = Math.min(W * 0.4, state.basePaddleW * 1.7);
      }
      if (type === "slow") {
        for (const b of state.balls) {
          const a = Math.atan2(b.vy, b.vx);
          const ns = ballSpeed();
          b.vx = Math.cos(a) * ns;
          b.vy = Math.sin(a) * ns;
        }
      }
      renderPowerBar(true);
    }
  }

  function renderPowerBar(force = false) {
    const parts = [];
    const keys = [];
    for (const [id, left] of Object.entries(state.effects)) {
      if (left <= 0) continue;
      const def = POWER[id];
      if (!def) continue;
      const sec = Math.ceil(left);
      keys.push(id + ":" + sec);
      parts.push(
        `<span class="power-pill" style="background:${def.color}22;border-color:${def.color}99;color:${def.color};box-shadow:0 0 12px ${def.color}55">${def.label} ${sec}s</span>`
      );
    }
    const next = keys.join("|");
    if (!force && next === powerBarKey) return;
    powerBarKey = next;
    powerBar.innerHTML = parts.join("");
  }

  function showOverlay(title, message, buttonText, eyebrow = "Neon Arcade") {
    eyebrowEl.textContent = eyebrow;
    titleEl.textContent = title;
    messageEl.textContent = message;
    actionBtn.textContent = buttonText;
    overlay.classList.remove("hidden");
  }

  function hideOverlay() {
    overlay.classList.add("hidden");
  }

  function syncHud() {
    scoreEl.textContent = String(state.score);
    levelEl.textContent = String(state.level);
    livesEl.textContent = "❤".repeat(Math.max(0, state.lives)) || "—";
  }

  function beginLevel(fresh) {
    if (fresh) {
      state.score = 0;
      state.lives = 3;
      state.level = 1;
    }
    // Raket genişliği seviyeyle biraz daralır ama tabanı korur
    const shrink = Math.min(28, (state.level - 1) * 1.5);
    state.basePaddleW = Math.max(64, Math.min(W * 0.2, 130) - shrink);
    paddle.targetW = state.basePaddleW;
    paddle.w = state.basePaddleW;
    paddle.x = W / 2 - paddle.w / 2;
    paddle.y = H - paddleBottom;
    clearEffects();
    state.bricks = buildBricks(state.level);
    state.drops = [];
    state.particles = [];
    state.floats = [];
    resetBalls(true);
    state.mode = "playing";
    syncHud();
    hideOverlay();
  }

  function nextLevel() {
    state.level += 1; // sınırsız
    beginLevel(false);
  }

  function loseLife() {
    state.lives -= 1;
    syncHud();
    state.drops = [];
    clearEffects();
    if (state.lives <= 0) {
      state.mode = "lost";
      showOverlay("Oyun Bitti", `Skor: ${state.score} · Seviye ${state.level}`, "Tekrar Oyna", "Son");
      return;
    }
    paddle.targetW = state.basePaddleW;
    paddle.w = state.basePaddleW;
    paddle.x = Math.max(8, Math.min(W - paddle.w - 8, paddle.x));
    resetBalls(true);
  }

  function rectCircleHit(rect, bx, by, br) {
    const nx = Math.max(rect.x, Math.min(bx, rect.x + rect.w));
    const ny = Math.max(rect.y, Math.min(by, rect.y + rect.h));
    const dx = bx - nx;
    const dy = by - ny;
    return dx * dx + dy * dy <= br * br;
  }

  function bounceBallFromBrick(ball, brick) {
    const overlapL = ball.x + ball.r - brick.x;
    const overlapR = brick.x + brick.w - (ball.x - ball.r);
    const overlapT = ball.y + ball.r - brick.y;
    const overlapB = brick.y + brick.h - (ball.y - ball.r);
    const minX = Math.min(overlapL, overlapR);
    const minY = Math.min(overlapT, overlapB);
    if (minX < minY) {
      ball.vx *= -1;
      ball.x += overlapL < overlapR ? -overlapL : overlapR;
    } else {
      ball.vy *= -1;
      ball.y += overlapT < overlapB ? -overlapT : overlapB;
    }
  }

  function hitBrick(ball, brick) {
    const piercing = state.effects.break || state.effects.fire;
    if (!piercing) bounceBallFromBrick(ball, brick);
    brick.hp -= state.effects.fire ? 2 : 1;
    if (brick.hp <= 0) {
      brick.alive = false;
      state.score += 10 * state.level;
      spawnBurst(brick.x + brick.w / 2, brick.y + brick.h / 2, brick.color);
      maybeDrop(brick);
    } else {
      state.score += 2;
      spawnBurst(ball.x, ball.y, brick.colorSoft, 6);
    }
    syncHud();
  }

  function update(dt) {
    if (state.mode !== "playing") {
      state.pulse += dt;
      return;
    }
    state.pulse += dt;

    for (const id of Object.keys(state.effects)) {
      state.effects[id] -= dt;
      if (state.effects[id] <= 0) {
        delete state.effects[id];
        if (id === "wide") {
          paddle.targetW = state.basePaddleW;
        }
        if (id === "slow") {
          for (const b of state.balls) {
            const a = Math.atan2(b.vy, b.vx);
            const spd = ballSpeed();
            b.vx = Math.cos(a) * spd;
            b.vy = Math.sin(a) * spd;
          }
        }
      }
    }
    renderPowerBar();

    // Genişlik değişimi yumuşak — ekran kararmasın / yeniden çizilmesin
    if (Math.abs(paddle.w - paddle.targetW) > 0.3) {
      const cx = paddle.x + paddle.w / 2;
      paddle.w += (paddle.targetW - paddle.w) * Math.min(1, 8 * dt);
      paddle.x = cx - paddle.w / 2;
    } else {
      paddle.w = paddle.targetW;
    }

    let move = 0;
    if (state.keys.left) move -= 1;
    if (state.keys.right) move += 1;
    if (move !== 0) {
      paddle.x += move * paddle.speed * dt;
      state.pointerX = null;
    } else if (state.pointerX !== null) {
      paddle.x += (state.pointerX - paddle.w / 2 - paddle.x) * Math.min(1, 18 * dt);
    }
    paddle.x = Math.max(8, Math.min(W - paddle.w - 8, paddle.x));
    paddle.y = H - paddleBottom;

    for (const ball of state.balls) {
      if (ball.stuck) {
        ball.x = paddle.x + paddle.w / 2;
        ball.y = paddle.y - ball.r - 3;
        continue;
      }

      ball.x += ball.vx * dt;
      ball.y += ball.vy * dt;

      if (ball.x - ball.r < 0) { ball.x = ball.r; ball.vx = Math.abs(ball.vx); }
      else if (ball.x + ball.r > W) { ball.x = W - ball.r; ball.vx = -Math.abs(ball.vx); }
      if (ball.y - ball.r < 0) { ball.y = ball.r; ball.vy = Math.abs(ball.vy); }

      if (
        ball.vy > 0 &&
        ball.y + ball.r >= paddle.y &&
        ball.y - ball.r <= paddle.y + paddle.h &&
        ball.x >= paddle.x - ball.r &&
        ball.x <= paddle.x + paddle.w + ball.r
      ) {
        const hit = (ball.x - (paddle.x + paddle.w / 2)) / (paddle.w / 2);
        const clamped = Math.max(-1, Math.min(1, hit));
        const angle = -Math.PI / 2 + clamped * (Math.PI / 3);
        const spd = Math.max(ballSpeed() * 0.9, Math.hypot(ball.vx, ball.vy));
        ball.vx = Math.cos(angle) * spd;
        ball.vy = Math.sin(angle) * spd;
        ball.y = paddle.y - ball.r - 1;
      }

      for (const brick of state.bricks) {
        if (!brick.alive) continue;
        if (!rectCircleHit(brick, ball.x, ball.y, ball.r)) continue;
        hitBrick(ball, brick);
        if (!state.effects.break && !state.effects.fire) break;
      }
    }

    state.balls = state.balls.filter((b) => b.stuck || b.y - b.r <= H + 24);
    if (!state.balls.length) {
      loseLife();
      return;
    }

    for (let i = state.drops.length - 1; i >= 0; i--) {
      const d = state.drops[i];
      d.wobble += dt * 4;
      d.y += d.vy * dt;
      d.x += Math.sin(d.wobble) * 16 * dt;
      if (
        d.y + d.r >= paddle.y &&
        d.y - d.r <= paddle.y + paddle.h &&
        d.x >= paddle.x - d.r &&
        d.x <= paddle.x + paddle.w + d.r
      ) {
        applyPower(d.type);
        state.drops.splice(i, 1);
        continue;
      }
      if (d.y - d.r > H) state.drops.splice(i, 1);
    }

    for (let i = state.particles.length - 1; i >= 0; i--) {
      const p = state.particles[i];
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 200 * dt;
      if (p.life <= 0) state.particles.splice(i, 1);
    }
    for (let i = state.floats.length - 1; i >= 0; i--) {
      const f = state.floats[i];
      f.life -= dt;
      f.y -= 28 * dt;
      if (f.life <= 0) state.floats.splice(i, 1);
    }

    if (state.bricks.every((b) => !b.alive)) {
      state.mode = "won";
      state.drops = [];
      showOverlay(
        `Seviye ${state.level} Tamam!`,
        `Skor: ${state.score} — sonraki seviye hazır.`,
        "Sonraki Seviye",
        "Sınırsız"
      );
    }
  }

  function roundRect(x, y, w, h, r) {
    const rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
  }

  function drawBackground() {
    const g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, "#0a0614");
    g.addColorStop(0.45, "#070b14");
    g.addColorStop(1, "#06101a");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    const blobs = [
      [W * 0.2, H * 0.15, W * 0.4, "rgba(255,45,111,0.12)"],
      [W * 0.85, H * 0.2, W * 0.35, "rgba(46,240,255,0.1)"],
      [W * 0.5, H * 0.85, W * 0.45, "rgba(177,77,255,0.1)"],
    ];
    for (const [x, y, r, c] of blobs) {
      const rg = ctx.createRadialGradient(x, y, 0, x, y, r);
      rg.addColorStop(0, c);
      rg.addColorStop(1, "transparent");
      ctx.fillStyle = rg;
      ctx.fillRect(0, 0, W, H);
    }

    // İnce neon ızgara
    ctx.strokeStyle = "rgba(46,240,255,0.04)";
    ctx.lineWidth = 1;
    const step = Math.max(28, Math.floor(W / 18));
    for (let x = 0; x < W; x += step) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y < H; y += step) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }
  }

  function drawBricks() {
    const glow = 0.9 + Math.sin(state.pulse * 2.5) * 0.1;
    for (const brick of state.bricks) {
      if (!brick.alive) continue;
      const damaged = brick.hp < brick.maxHp;
      const col = damaged ? brick.colorSoft : brick.color;

      ctx.save();
      ctx.shadowColor = col;
      ctx.shadowBlur = 16 * glow;
      ctx.fillStyle = col;
      roundRect(brick.x, brick.y, brick.w, brick.h, Math.min(5, brick.h * 0.3));
      ctx.fill();
      ctx.restore();

      ctx.strokeStyle = "rgba(255,255,255,0.35)";
      ctx.lineWidth = 1;
      roundRect(brick.x + 0.5, brick.y + 0.5, brick.w - 1, brick.h - 1, Math.min(4, brick.h * 0.28));
      ctx.stroke();

      if (brick.maxHp > 1) {
        ctx.fillStyle = "rgba(0,0,0,0.55)";
        ctx.font = `800 ${Math.max(10, brick.h * 0.55)}px Syne, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(String(brick.hp), brick.x + brick.w / 2, brick.y + brick.h / 2 + 0.5);
      }
    }
  }

  function drawPaddle() {
    const { x, y, w, h } = paddle;
    ctx.save();
    ctx.shadowColor = state.effects.wide ? "#39ff9a" : "#2ef0ff";
    ctx.shadowBlur = 22;
    const g = ctx.createLinearGradient(x, y, x + w, y);
    if (state.effects.wide) {
      g.addColorStop(0, "#39ff9a");
      g.addColorStop(0.5, "#2ef0ff");
      g.addColorStop(1, "#39ff9a");
    } else {
      g.addColorStop(0, "#ff2d6f");
      g.addColorStop(0.5, "#ffe14a");
      g.addColorStop(1, "#2ef0ff");
    }
    ctx.fillStyle = g;
    roundRect(x, y, w, h, h / 2);
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = "rgba(255,255,255,0.5)";
    roundRect(x + 8, y + 2, w - 16, Math.max(3, h * 0.3), 2);
    ctx.fill();

    ctx.strokeStyle = "rgba(255,255,255,0.7)";
    ctx.lineWidth = 2;
    roundRect(x, y, w, h, h / 2);
    ctx.stroke();
  }

  function drawBalls() {
    for (const ball of state.balls) {
      ctx.save();
      const fire = state.effects.fire;
      const brk = state.effects.break;
      ctx.shadowColor = fire ? "#ffe14a" : brk ? "#ff7a18" : "#2ef0ff";
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
      const g = ctx.createRadialGradient(ball.x - 2, ball.y - 2, 1, ball.x, ball.y, ball.r);
      if (fire) {
        g.addColorStop(0, "#fff8d6");
        g.addColorStop(1, "#ff7a18");
      } else if (brk) {
        g.addColorStop(0, "#ffe0d0");
        g.addColorStop(1, "#ff2d6f");
      } else {
        g.addColorStop(0, "#ffffff");
        g.addColorStop(1, "#2ef0ff");
      }
      ctx.fillStyle = g;
      ctx.fill();
      ctx.restore();
    }
  }

  function drawDrops() {
    for (const d of state.drops) {
      const hw = d.r + 4;
      const hh = d.r;
      ctx.save();
      ctx.shadowColor = d.color;
      ctx.shadowBlur = 16;
      ctx.fillStyle = d.color;
      roundRect(d.x - hw, d.y - hh, hw * 2, hh * 2, 6);
      ctx.fill();
      ctx.restore();

      ctx.fillStyle = "#0a0a12";
      ctx.font = `800 ${Math.max(8, d.r * 0.75)}px Syne, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const short = { life: "CAN", multi: "×3", break: "KIR", wide: "GEN", slow: "YAV", fire: "ATEŞ" }[d.type] || "!";
      ctx.fillText(short, d.x, d.y + 0.5);
    }
  }

  function drawParticles() {
    for (const p of state.particles) {
      ctx.globalAlpha = Math.max(0, p.life / p.max);
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
  }

  function drawFloats() {
    for (const f of state.floats) {
      ctx.globalAlpha = Math.max(0, f.life / f.max);
      ctx.fillStyle = f.color;
      ctx.shadowColor = f.color;
      ctx.shadowBlur = 10;
      ctx.font = `800 ${Math.max(12, W * 0.028)}px Syne, sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText(f.text, f.x, f.y);
    }
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
  }

  function drawHint() {
    if (state.mode === "playing" && state.balls.some((b) => b.stuck)) {
      ctx.fillStyle = "rgba(244,247,255,0.75)";
      ctx.font = `600 ${Math.max(11, W * 0.025)}px DM Sans, sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText("Boşluk veya tıkla → fırlat", W / 2, paddle.y - 26);
    }
  }

  function draw() {
    drawBackground();
    drawBricks();
    drawDrops();
    drawPaddle();
    drawBalls();
    drawParticles();
    drawFloats();
    drawHint();
  }

  function loop(ts) {
    if (!state.lastTime) state.lastTime = ts;
    let dt = (ts - state.lastTime) / 1000;
    state.lastTime = ts;
    dt = Math.min(dt, 0.033);
    update(dt);
    draw();
    requestAnimationFrame(loop);
  }

  function canvasX(clientX) {
    const rect = canvas.getBoundingClientRect();
    return ((clientX - rect.left) / Math.max(1, rect.width)) * W;
  }

  window.addEventListener("keydown", (e) => {
    if (e.code === "ArrowLeft" || e.code === "KeyA") state.keys.left = true;
    if (e.code === "ArrowRight" || e.code === "KeyD") state.keys.right = true;
    if (e.code === "Space") {
      e.preventDefault();
      if (state.mode === "playing") launchBalls();
      else if (state.mode === "menu" || state.mode === "lost") beginLevel(true);
      else if (state.mode === "won") nextLevel();
      else if (state.mode === "paused") { state.mode = "playing"; hideOverlay(); }
    }
    if (e.code === "KeyP" && state.mode === "playing") {
      state.mode = "paused";
      showOverlay("Duraklatıldı", "Devam etmek için bas.", "Devam", "Pause");
    }
  });

  window.addEventListener("keyup", (e) => {
    if (e.code === "ArrowLeft" || e.code === "KeyA") state.keys.left = false;
    if (e.code === "ArrowRight" || e.code === "KeyD") state.keys.right = false;
  });

  canvas.addEventListener("pointerdown", (e) => {
    canvas.setPointerCapture(e.pointerId);
    state.pointerX = canvasX(e.clientX);
    if (state.mode === "playing") launchBalls();
  });
  canvas.addEventListener("pointermove", (e) => {
    state.pointerX = canvasX(e.clientX);
  });

  actionBtn.addEventListener("click", () => {
    if (state.mode === "menu" || state.mode === "lost") beginLevel(true);
    else if (state.mode === "won") nextLevel();
    else if (state.mode === "paused") { state.mode = "playing"; hideOverlay(); }
  });

  const ro = new ResizeObserver(() => {
    const cx = paddle.x + paddle.w / 2;
    const prevW = W;
    const prevH = H;
    resize();
    if (W === prevW && H === prevH) return;
    paddle.x = Math.max(8, Math.min(W - paddle.w - 8, cx - paddle.w / 2));
    for (const b of state.balls) {
      if (b.stuck) {
        b.x = paddle.x + paddle.w / 2;
        b.y = paddle.y - b.r - 3;
      }
    }
  });
  ro.observe(canvas.parentElement);
  window.addEventListener("orientationchange", () => setTimeout(() => resize(true), 120));

  resize(true);
  state.bricks = buildBricks(1);
  paddle.x = W / 2 - paddle.w / 2;
  paddle.y = H - paddleBottom;
  resetBalls(true);
  syncHud();
  showOverlay(
    "Tuğla Kırma",
    "Sınırsız seviye · neon tuğlalar · güçlendirmeleri yakala.",
    "Başla"
  );
  requestAnimationFrame(loop);
})();
