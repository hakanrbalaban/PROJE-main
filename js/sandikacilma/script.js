/* ============================================================
   HAZİNE SANDIĞI - Sesli & Görsel Açılma Efekti
   ============================================================ */

// ---------- DOM ----------
const chest      = document.getElementById("chest");
const chestLid   = document.getElementById("chestLid");
const chestGlow  = document.getElementById("chestGlow");
const lock       = document.getElementById("lock");
const lightBeam  = document.getElementById("lightBeam");
const rewardCard = document.getElementById("rewardCard");
const rewardIcon = document.getElementById("rewardIcon");
const rewardName = document.getElementById("rewardName");
const rewardDesc = document.getElementById("rewardDesc");
const openBtn    = document.getElementById("openBtn");
const resetBtn   = document.getElementById("resetBtn");
const hint       = document.getElementById("hint");
const coinCount  = document.getElementById("coinCount");
const soundToggle= document.getElementById("soundToggle");
const canvas     = document.getElementById("fx");
const ctx        = canvas.getContext("2d");

let isOpen = false;
let coins = 0;
let soundOn = true;

// ---------- Ödül tablosu (nadirlik) ----------
const RARITIES = [
  { name: "SIRADAN",  color: "#c9d1d9", glow: "#8b949e", ray: "rgba(180,190,200,0.4)", weight: 50,
    rewards: [ {icon:"🪙", desc:"Altın +25", value:25}, {icon:"🥉", desc:"Bronz Kupa", value:15}, {icon:"🍎", desc:"Elma x3", value:10} ] },
  { name: "NADİR",    color: "#4fc3f7", glow: "#2196f3", ray: "rgba(80,180,255,0.5)", weight: 28,
    rewards: [ {icon:"💰", desc:"Altın Kese +80", value:80}, {icon:"🥈", desc:"Gümüş Kupa", value:60}, {icon:"🗝️", desc:"Sihirli Anahtar", value:50} ] },
  { name: "EPİK",     color: "#ba68c8", glow: "#9c27b0", ray: "rgba(200,120,255,0.5)", weight: 15,
    rewards: [ {icon:"🏆", desc:"Altın Kupa +200", value:200}, {icon:"⚔️", desc:"Efsanevi Kılıç", value:180}, {icon:"🛡️", desc:"Ejder Kalkanı", value:160} ] },
  { name: "EFSANEVİ", color: "#ffd54a", glow: "#ffb300", ray: "rgba(255,215,90,0.6)", weight: 6,
    rewards: [ {icon:"💎", desc:"Elmas +500", value:500}, {icon:"👑", desc:"Kral Tacı", value:600}, {icon:"🐉", desc:"Ejder Yumurtası", value:800} ] },
  { name: "KUTSAL",   color: "#ff5252", glow: "#ff1744", ray: "rgba(255,90,90,0.6)", weight: 1,
    rewards: [ {icon:"🌟", desc:"Yıldız Tozu +2000", value:2000}, {icon:"🔥", desc:"Anka Tüyü", value:2500} ] },
];

function pickRarity() {
  const total = RARITIES.reduce((s, r) => s + r.weight, 0);
  let roll = Math.random() * total;
  for (const r of RARITIES) {
    if (roll < r.weight) return r;
    roll -= r.weight;
  }
  return RARITIES[0];
}

/* ============================================================
   SES (Web Audio API ile sentezlenmiş - dosya gerekmez)
   ============================================================ */
let audioCtx = null;
function ac() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function tone(freq, start, dur, type = "sine", vol = 0.25) {
  if (!soundOn) return;
  const a = ac();
  const t0 = a.currentTime + start;
  const osc = a.createOscillator();
  const gain = a.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain).connect(a.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

// Kilit kırılma / gıcırtı sesi (gürültü tabanlı)
function creakSound() {
  if (!soundOn) return;
  const a = ac();
  const dur = 0.5;
  const buffer = a.createBuffer(1, a.sampleRate * dur, a.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  }
  const src = a.createBufferSource();
  src.buffer = buffer;
  const filter = a.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(400, a.currentTime);
  filter.frequency.linearRampToValueAtTime(1400, a.currentTime + dur);
  const gain = a.createGain();
  gain.gain.setValueAtTime(0.12, a.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + dur);
  src.connect(filter).connect(gain).connect(a.destination);
  src.start();
}

function clickSound() { tone(180, 0, 0.08, "square", 0.15); tone(90, 0.04, 0.1, "square", 0.12); }

// Zafer melodisi (nadirliğe göre uzunluk)
function fanfare(level) {
  const base = [523.25, 659.25, 783.99, 1046.5]; // C E G C
  base.forEach((f, i) => tone(f, i * 0.12, 0.5, "triangle", 0.28));
  if (level >= 2) { tone(1318.5, 0.5, 0.6, "triangle", 0.28); tone(1567.98, 0.62, 0.7, "sine", 0.25); }
  if (level >= 3) {
    [1046.5, 1318.5, 1567.98, 2093].forEach((f, i) => tone(f, 0.8 + i * 0.09, 0.5, "sine", 0.22));
  }
  if (level >= 4) {
    for (let i = 0; i < 6; i++) tone(2093 + i * 120, 1.3 + i * 0.06, 0.4, "sine", 0.18);
  }
}

// Parıltı sesleri
function sparkleSounds(count) {
  for (let i = 0; i < count; i++) {
    tone(1200 + Math.random() * 1600, 0.3 + Math.random() * 1.2, 0.15, "sine", 0.08);
  }
}

/* ============================================================
   CANVAS PARÇACIK SİSTEMİ
   ============================================================ */
let particles = [];
let W, H;
function resize() {
  W = canvas.width = canvas.offsetWidth;
  H = canvas.height = canvas.offsetHeight;
}
window.addEventListener("resize", resize);

function chestCenter() {
  const r = chest.getBoundingClientRect();
  const s = canvas.getBoundingClientRect();
  return { x: r.left - s.left + r.width / 2, y: r.top - s.top + r.height * 0.35 };
}

const COIN_COLORS = ["#ffd54a", "#ffb300", "#ffe27a", "#f6c33c"];

function burstCoins(n, rarity) {
  const c = chestCenter();
  for (let i = 0; i < n; i++) {
    const ang = -Math.PI / 2 + (Math.random() - 0.5) * 1.9;
    const spd = 6 + Math.random() * 9;
    particles.push({
      type: "coin",
      x: c.x + (Math.random() - 0.5) * 40,
      y: c.y,
      vx: Math.cos(ang) * spd,
      vy: Math.sin(ang) * spd - 4,
      r: 7 + Math.random() * 8,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.4,
      color: COIN_COLORS[(Math.random() * COIN_COLORS.length) | 0],
      life: 1,
      spin: 0.5 + Math.random(),
    });
  }
}

function burstSparkles(n, color) {
  const c = chestCenter();
  for (let i = 0; i < n; i++) {
    const ang = Math.random() * Math.PI * 2;
    const spd = 2 + Math.random() * 7;
    particles.push({
      type: "spark",
      x: c.x,
      y: c.y,
      vx: Math.cos(ang) * spd,
      vy: Math.sin(ang) * spd,
      r: 1.5 + Math.random() * 3,
      color: color || "#fff6c4",
      life: 1,
      decay: 0.012 + Math.random() * 0.02,
    });
  }
}

function confetti(n) {
  const colors = ["#ff5252", "#ffd54a", "#4fc3f7", "#66bb6a", "#ba68c8", "#ff9800"];
  for (let i = 0; i < n; i++) {
    particles.push({
      type: "confetti",
      x: Math.random() * W,
      y: -20 - Math.random() * 100,
      vx: (Math.random() - 0.5) * 3,
      vy: 2 + Math.random() * 3,
      w: 6 + Math.random() * 6,
      h: 10 + Math.random() * 8,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
      color: colors[(Math.random() * colors.length) | 0],
      life: 1,
      decay: 0.004,
      sway: Math.random() * Math.PI * 2,
    });
  }
}

function updateParticles() {
  ctx.clearRect(0, 0, W, H);
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];

    if (p.type === "coin") {
      p.vy += 0.45;           // yerçekimi
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      if (p.y > H - 30 && p.vy > 0) { p.vy *= -0.45; p.vx *= 0.7; p.life -= 0.15; }
      if (p.y > H + 40) p.life = 0;
      drawCoin(p);
    } else if (p.type === "spark") {
      p.x += p.vx; p.y += p.vy;
      p.vx *= 0.96; p.vy *= 0.96;
      p.vy += 0.04;
      p.life -= p.decay;
      ctx.globalAlpha = Math.max(p.life, 0);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      // ışık yıldızı
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(p.x - p.r * 3, p.y); ctx.lineTo(p.x + p.r * 3, p.y);
      ctx.moveTo(p.x, p.y - p.r * 3); ctx.lineTo(p.x, p.y + p.r * 3);
      ctx.stroke();
      ctx.globalAlpha = 1;
    } else if (p.type === "confetti") {
      p.sway += 0.1;
      p.x += p.vx + Math.sin(p.sway) * 1.5;
      p.y += p.vy;
      p.rot += p.vr;
      p.life -= p.decay;
      if (p.y > H + 20) p.life = 0;
      ctx.save();
      ctx.globalAlpha = Math.max(p.life, 0);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }

    if (p.life <= 0) particles.splice(i, 1);
  }
  requestAnimationFrame(updateParticles);
}

function drawCoin(p) {
  ctx.save();
  ctx.globalAlpha = Math.max(p.life, 0);
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rot);
  const wobble = Math.abs(Math.cos(p.rot * p.spin));
  ctx.scale(wobble * 0.8 + 0.2, 1); // dönme yanılsaması
  const g = ctx.createRadialGradient(-p.r * 0.3, -p.r * 0.3, 1, 0, 0, p.r);
  g.addColorStop(0, "#fff2b0");
  g.addColorStop(0.6, p.color);
  g.addColorStop(1, "#a9760f");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 0, p.r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(120,80,0,0.6)";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = "rgba(150,100,0,0.5)";
  ctx.font = `bold ${p.r}px serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("$", 0, 0);
  ctx.restore();
}

/* ============================================================
   AKIŞ
   ============================================================ */
function openChest() {
  if (isOpen) return;
  isOpen = true;
  openBtn.disabled = true;
  hint.textContent = "Sandık açılıyor...";

  // Ses bağlamını kullanıcı etkileşiminde başlat
  ac().resume && ac().resume();

  // 1) Titreme + gıcırtı
  chest.classList.add("shake");
  clickSound();
  creakSound();
  tone(140, 0.15, 0.2, "sawtooth", 0.12);

  // 2) Kilit kırılır
  setTimeout(() => {
    lock.classList.add("broken");
    tone(90, 0, 0.15, "square", 0.2);
    tone(60, 0.05, 0.2, "sawtooth", 0.15);
  }, 400);

  // 3) Kapak açılır + ışık
  setTimeout(() => {
    chest.classList.remove("shake");
    chestLid.classList.add("open");
    chestGlow.classList.add("on");
    lightBeam.classList.add("on");
    creakSound();
    tone(300, 0, 0.6, "sine", 0.1);
    burstSparkles(30, "#fff6c4");
    sparkleSounds(10);
  }, 650);

  // 4) Ödül patlaması
  setTimeout(() => {
    revealReward();
  }, 1150);
}

function revealReward() {
  const rarity = pickRarity();
  const level = RARITIES.indexOf(rarity);
  const reward = rarity.rewards[(Math.random() * rarity.rewards.length) | 0];

  // Kart ayarları
  rewardIcon.textContent = reward.icon;
  rewardName.textContent = rarity.name;
  rewardDesc.textContent = reward.desc;
  rewardCard.style.setProperty("--rar-color", rarity.color);
  rewardCard.style.setProperty("--rar-glow", rarity.glow);
  document.getElementById("rewardRays").style.setProperty("--ray", rarity.ray);
  rewardCard.classList.add("show");

  // Parçacıklar (nadirliğe göre yoğunluk)
  const coinN = 20 + level * 22;
  burstCoins(coinN, rarity);
  burstSparkles(40 + level * 30, rarity.glow);
  sparkleSounds(15 + level * 10);
  if (level >= 3) confetti(120);
  if (level >= 4) { confetti(80); setTimeout(() => confetti(100), 400); }

  // Ses
  fanfare(level);

  // Altın say
  animateCoins(coins, coins + reward.value);
  coins += reward.value;

  hint.textContent = `${rarity.name} ödül kazandın!`;
  setTimeout(() => { resetBtn.classList.remove("hidden"); }, 700);
}

function animateCoins(from, to) {
  const dur = 900;
  const t0 = performance.now();
  function step(t) {
    const k = Math.min((t - t0) / dur, 1);
    const ease = 1 - Math.pow(1 - k, 3);
    coinCount.textContent = Math.round(from + (to - from) * ease);
    if (k < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function resetChest() {
  isOpen = false;
  chestLid.classList.remove("open");
  chestGlow.classList.remove("on");
  lightBeam.classList.remove("on");
  lock.classList.remove("broken");
  rewardCard.classList.remove("show");
  resetBtn.classList.add("hidden");
  openBtn.disabled = false;
  hint.textContent = "Sandığa dokun ve aç! ✨";
  clickSound();
}

/* ============================================================
   OLAYLAR & BAŞLANGIÇ
   ============================================================ */
openBtn.addEventListener("click", openChest);
chest.addEventListener("click", openChest);
resetBtn.addEventListener("click", resetChest);

soundToggle.addEventListener("click", () => {
  soundOn = !soundOn;
  soundToggle.textContent = soundOn ? "🔊" : "🔇";
  if (soundOn) clickSound();
});

// Yıldızları oluştur
(function makeStars() {
  const wrap = document.getElementById("stars");
  for (let i = 0; i < 80; i++) {
    const s = document.createElement("i");
    s.style.left = Math.random() * 100 + "%";
    s.style.top = Math.random() * 100 + "%";
    s.style.animationDelay = Math.random() * 3 + "s";
    s.style.transform = `scale(${0.5 + Math.random()})`;
    wrap.appendChild(s);
  }
})();

resize();
updateParticles();
