(() => {
  "use strict";

  const TILE = 16;
  const SCALE = 2;
  const VIEW_W = 960;
  const VIEW_H = 640;
  const MW = 60;
  const MH = 40;
  const WORLD_W = MW * TILE;
  const WORLD_H = MH * TILE;
  const CHAR_FW = 96; // unused legacy; frame width is derived per sheet


  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;

  const $ = (id) => document.getElementById(id);
  const hud = {
    level: $("hud-level"),
    money: $("hud-money"),
    score: $("hud-score"),
    hearts: $("hud-hearts"),
    goal: $("hud-goal"),
    levelName: $("level-name"),
    hint: $("hint-text"),
    seedName: $("seed-name"),
    seedCount: $("seed-count"),
    inv: $("inv-text"),
    fx: $("fx-slot"),
  };
  const overlay = $("overlay");
  const overlayEyebrow = $("overlay-eyebrow");
  const overlayTitle = $("overlay-title");
  const overlayText = $("overlay-text");
  const btnStart = $("btn-start");
  const toastEl = $("toast");
  const transitionEl = $("transition");

  const CROP_TYPES = [
    // grow = saniye (en fazla 15dk=900). seedCost az → çok
    { id: "lettuce", name: "Marul", sprite: "sunflower", grow: 45, sell: 10, feed: 6, seedCost: 3, pack: 5 },
    { id: "wheat", name: "Buğday", sprite: "wheat", grow: 60, sell: 12, feed: 8, seedCost: 4, pack: 4 },
    { id: "oats", name: "Yulaf", sprite: "wheat", grow: 75, sell: 13, feed: 9, seedCost: 4, pack: 4 },
    { id: "radish", name: "Turp", sprite: "carrot", grow: 90, sell: 14, feed: 9, seedCost: 5, pack: 4 },
    { id: "barley", name: "Arpa", sprite: "wheat", grow: 100, sell: 15, feed: 10, seedCost: 5, pack: 4 },
    { id: "onion", name: "Soğan", sprite: "beetroot", grow: 120, sell: 16, feed: 10, seedCost: 5, pack: 4 },
    { id: "carrot", name: "Havuç", sprite: "carrot", grow: 140, sell: 18, feed: 11, seedCost: 6, pack: 3 },
    { id: "beans", name: "Fasulye", sprite: "wheat", grow: 160, sell: 17, feed: 12, seedCost: 6, pack: 4 },
    { id: "peas", name: "Bezelye", sprite: "sunflower", grow: 170, sell: 17, feed: 11, seedCost: 6, pack: 4 },
    { id: "potato", name: "Patates", sprite: "beetroot", grow: 200, sell: 19, feed: 13, seedCost: 7, pack: 3 },
    { id: "garlic", name: "Sarımsak", sprite: "beetroot", grow: 210, sell: 20, feed: 12, seedCost: 7, pack: 3 },
    { id: "tomato", name: "Domates", sprite: "carrot", grow: 240, sell: 21, feed: 12, seedCost: 7, pack: 3 },
    { id: "cabbage", name: "Lahana", sprite: "cauliflower", grow: 260, sell: 22, feed: 13, seedCost: 8, pack: 3 },
    { id: "beetroot", name: "Pancar", sprite: "beetroot", grow: 280, sell: 23, feed: 14, seedCost: 8, pack: 3 },
    { id: "corn", name: "Mısır", sprite: "wheat", grow: 320, sell: 24, feed: 15, seedCost: 8, pack: 3 },
    { id: "sunflower", name: "Ayçiçeği", sprite: "sunflower", grow: 360, sell: 26, feed: 14, seedCost: 9, pack: 3 },
    { id: "pepper", name: "Biber", sprite: "carrot", grow: 400, sell: 27, feed: 12, seedCost: 9, pack: 3 },
    { id: "squash", name: "Kabak", sprite: "pumpkin", grow: 450, sell: 28, feed: 16, seedCost: 10, pack: 2 },
    { id: "eggplant", name: "Patlıcan", sprite: "beetroot", grow: 480, sell: 29, feed: 14, seedCost: 10, pack: 2 },
    { id: "broccoli", name: "Brokoli", sprite: "cauliflower", grow: 520, sell: 30, feed: 15, seedCost: 11, pack: 2 },
    { id: "cauliflower", name: "Karnabahar", sprite: "cauliflower", grow: 560, sell: 32, feed: 16, seedCost: 11, pack: 2 },
    { id: "chili", name: "Acı Biber", sprite: "carrot", grow: 620, sell: 34, feed: 10, seedCost: 12, pack: 2 },
    { id: "melon", name: "Kavun", sprite: "pumpkin", grow: 720, sell: 38, feed: 17, seedCost: 14, pack: 2 },
    { id: "pumpkin", name: "Balkabak", sprite: "pumpkin", grow: 900, sell: 45, feed: 20, seedCost: 16, pack: 2 },
  ];

  // hold = tok kalma süresi (sn), cost az → çok
  const FEED_TYPES = [
    { id: "starter", name: "Başlangıç", icon: "sunflower", iconStage: 2, cost: 4, pack: 5, hold: 45, score: 8 },
    { id: "hay", name: "Saman", icon: "wheat", iconStage: 2, cost: 5, pack: 4, hold: 60, score: 10 },
    { id: "grain", name: "Tahıl Yemi", icon: "wheat", iconStage: 3, cost: 7, pack: 3, hold: 90, score: 14 },
    { id: "leafy", name: "Yaprak Yemi", icon: "cauliflower", iconStage: 3, cost: 8, pack: 3, hold: 110, score: 13 },
    { id: "clover", name: "Yonca", icon: "sunflower", iconStage: 4, cost: 9, pack: 3, hold: 130, score: 15 },
    { id: "mash", name: "Lapa", icon: "pumpkin", iconStage: 3, cost: 10, pack: 3, hold: 160, score: 16 },
    { id: "pellets", name: "Pellet", icon: "beetroot", iconStage: 4, cost: 12, pack: 3, hold: 200, score: 18 },
    { id: "cornfeed", name: "Mısır Yemi", icon: "wheat", iconStage: 4, cost: 13, pack: 3, hold: 240, score: 20 },
    { id: "mix", name: "Karışık Yem", icon: "carrot", iconStage: 5, cost: 15, pack: 2, hold: 300, score: 22 },
    { id: "veggie", name: "Sebze Yemi", icon: "carrot", iconStage: 4, cost: 16, pack: 2, hold: 360, score: 21 },
    { id: "silage", name: "Silaj", icon: "wheat", iconStage: 5, cost: 18, pack: 2, hold: 420, score: 24 },
    { id: "berry", name: "Meyve Yemi", icon: "pumpkin", iconStage: 4, cost: 20, pack: 2, hold: 480, score: 28 },
    { id: "energy", name: "Enerji Yemi", icon: "sunflower", iconStage: 5, cost: 22, pack: 2, hold: 540, score: 30 },
    { id: "treat", name: "Özel İkram", icon: "pumpkin", iconStage: 5, cost: 25, pack: 1, hold: 660, score: 35 },
    { id: "premium", name: "Premium Yem", icon: "cauliflower", iconStage: 5, cost: 30, pack: 1, hold: 900, score: 42 },
  ];

  // Marketten alınan toprak paketleri (ucuz → pahalı)
  const SOIL_PACKS = [
    { id: "soil1", name: "1 Toprak", cost: 3, pack: 1 },
    { id: "soil3", name: "3 Toprak", cost: 7, pack: 3 },
    { id: "soil6", name: "6 Toprak", cost: 12, pack: 6 },
    { id: "soil12", name: "12 Toprak", cost: 20, pack: 12 },
    { id: "soil25", name: "25 Toprak", cost: 38, pack: 25 },
  ];

  function fmtDur(sec) {
    const s = Math.max(0, Math.round(sec));
    if (s < 60) return `${s}sn`;
    const m = Math.floor(s / 60);
    const r = s % 60;
    return r ? `${m}dk ${r}sn` : `${m}dk`;
  }

  /** Hayvan ürünü + kesim fiyatı */
  const ANIMAL_INFO = {
    chicken: { label: "Tavuk", product: "egg", productName: "Yumurta", meat: "chickenMeat", meatName: "Tavuk Eti", meatQty: 2, sell: 35 },
    duck: { label: "Ördek", product: "egg", productName: "Yumurta", meat: "duckMeat", meatName: "Ördek Eti", meatQty: 2, sell: 42 },
    cow: { label: "İnek", product: "milk", productName: "Süt", meat: "beef", meatName: "Dana Eti", meatQty: 3, sell: 120 },
    sheep: { label: "Koyun", product: "wool", productName: "Yün", meat: "mutton", meatName: "Koyun Eti", meatQty: 2, sell: 95 },
    pig: { label: "Domuz", product: "pork", productName: "Et", meat: "pork", meatName: "Domuz Eti", meatQty: 3, sell: 85 },
  };

  const GOODS = {
    egg: { name: "Yumurta", sell: 16, draw: "egg", color: "#ffe7a0" },
    milk: { name: "Süt", sell: 22, draw: "milk", color: "#fff6e8" },
    wool: { name: "Yün", sell: 20, draw: null, color: "#f4e2b0" },
    pork: { name: "Domuz Eti", sell: 28, draw: null, color: "#e85d4c" },
    chickenMeat: { name: "Tavuk Eti", sell: 24, draw: null, color: "#d4784a" },
    duckMeat: { name: "Ördek Eti", sell: 26, draw: null, color: "#c45d3a" },
    beef: { name: "Dana Eti", sell: 40, draw: null, color: "#a33a2a" },
    mutton: { name: "Koyun Eti", sell: 32, draw: null, color: "#b85a4a" },
  };

  function defaultGoods() {
    const o = {};
    for (const id of Object.keys(GOODS)) o[id] = 0;
    return o;
  }

  function addGood(id, n = 1) {
    if (!state.goods) state.goods = defaultGoods();
    state.goods[id] = (state.goods[id] || 0) + n;
  }

  function animalFedLeft(a) {
    if (!a || a.hunger <= 0) return 0;
    return a.hunger / Math.max(0.0001, a.hungerDrain || 0.02);
  }

  function plotGrowLeft(plot) {
    if (!plot || !plot.crop || plot.ready) return 0;
    const crop = CROP_TYPES.find((c) => c.id === plot.crop);
    if (!crop || !plot.watered) return crop ? crop.grow : 0;
    return Math.max(0, crop.grow - plot.grow);
  }

  function defaultSeeds() {
    const o = {};
    const starter = { lettuce: 8, wheat: 8, radish: 4, carrot: 6, potato: 3, tomato: 2 };
    for (const c of CROP_TYPES) o[c.id] = starter[c.id] || 0;
    return o;
  }

  function defaultFeed() {
    const o = {};
    const starter = { starter: 4, hay: 3, grain: 4, mix: 1 };
    for (const f of FEED_TYPES) o[f.id] = starter[f.id] || 0;
    return o;
  }

  function feedIconImg(feed) {
    const st = feed.iconStage != null ? feed.iconStage : 5;
    return images[`crop_${feed.icon}_${st}`] || images[`crop_${feed.icon}_5`] || images.seeds;
  }

  const ASSETS = {
    // sunnyside props (extracted from official tileset / pack)
    house: "sunnyside/deco/house.png",
    fence: "sunnyside/deco/fence.png",
    chest: "sunnyside/deco/chest.png",
    // sunnyside char
    idle: "sunnyside/char/idle.png",
    walk: "sunnyside/char/walk.png",
    run: "sunnyside/char/run.png",
    jump: "sunnyside/char/jump.png",
    dig: "sunnyside/char/dig.png",
    waterAnim: "sunnyside/char/water.png",
    hurt: "sunnyside/char/hurt.png",
    doing: "sunnyside/char/doing.png",
    // animals ss
    ssChicken: "sunnyside/animals/chicken.png",
    ssCow: "sunnyside/animals/cow.png",
    ssPig: "sunnyside/animals/pig.png",
    ssSheep: "sunnyside/animals/sheep.png",
    ssDuck: "sunnyside/animals/duck.png",
    ssBird: "sunnyside/animals/bird.png",
    // deco / vfx
    coin: "sunnyside/deco/coin.png",
    coins: "sunnyside/deco/coins.png",
    flower1: "sunnyside/deco/flower1.png",
    flower2: "sunnyside/deco/flower2.png",
    gold: "sunnyside/deco/gold.png",
    campfire: "sunnyside/deco/campfire.png",
    acorn: "sunnyside/deco/acorn.png",
    mushroom: "sunnyside/deco/mushroom.png",
    treeSS: "sunnyside/deco/tree.png",
    windmill: "sunnyside/deco/windmill.png",
    fire: "sunnyside/vfx/fire.png",
    glint: "sunnyside/vfx/glint.png",
    smoke: "sunnyside/vfx/smoke.png",
    dust: "sunnyside/vfx/dust.png",
    dustRun: "sunnyside/vfx/dust_run.png",
    dustLand: "sunnyside/vfx/dust_land.png",
    seeds: "sunnyside/crops/seeds.png",
    egg: "sunnyside/crops/egg.png",
    milk: "sunnyside/crops/milk.png",
    rock: "sunnyside/crops/rock.png",
    uiPlant: "sunnyside/ui/plant.png",
    uiWater: "sunnyside/ui/water.png",
    uiLove: "sunnyside/ui/love.png",
    uiAlert: "sunnyside/ui/alert.png",
    world16: "sunnyside/tiles/world16.png",
  };

  // crop stage images (sprite = asset klasöründeki gerçek dosya adı)
  for (const c of CROP_TYPES) {
    const base = c.sprite || c.id;
    for (let i = 0; i <= 5; i++) {
      ASSETS[`crop_${c.id}_${i}`] = `sunnyside/crops/${base}_${i}.png`;
    }
  }

  const images = {};
  let ready = false;
  const keys = Object.create(null);
  let toastTimer = 0;

  const state = {
    mode: "title",
    levelIndex: 0,
    money: 40,
    score: 0,
    hearts: 3,
    maxHearts: 3,
    time: 0,
    camX: 0,
    camY: 0,
    tool: "hand",
    seedIndex: 0,
    feedIndex: 0,
    seeds: defaultSeeds(),
    feed: defaultFeed(),
    soil: 10,
    inventory: {}, // harvested crops cropId -> count
    goods: defaultGoods(), // yumurta, süt, yün, et
    harvestFX: [], // flying harvest visuals
    panelTab: "seeds",
    panelOpen: false,
    invOpen: false,
    hover: { plot: null, animal: null, till: null, wx: 0, wy: 0 },
    map: null,
    player: null,
    animals: [],
    plots: [],
    collectibles: [],
    traps: [],
    balloons: [],
    chests: [],
    props: [],
    particles: [],
    animFX: [],
    butterflies: [],
    clouds: [],
    birds: [],
    floatTexts: [],
    goal: null,
    progress: { harvest: 0, feed: 0, collect: 0, moneyEarned: 0 },
    transition: 0,
  };

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(src));
      img.src = src;
    });
  }

  async function loadAll() {
    await Promise.all(
      Object.entries(ASSETS).map(async ([key, path]) => {
        images[key] = await loadImage(path);
      })
    );
    ready = true;
  }

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const rand = (a, b) => a + Math.random() * (b - a);
  const choice = (a) => a[(Math.random() * a.length) | 0];
  const dist = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by);

  function showToast(msg, ms = 1800) {
    toastEl.textContent = msg;
    toastEl.classList.remove("hidden", "tiny", "buy");
    toastTimer = ms;
  }

  function showOverlay(eyebrow, title, text, btn) {
    overlayEyebrow.textContent = eyebrow;
    overlayTitle.textContent = title;
    overlayText.textContent = text;
    btnStart.textContent = btn;
    overlay.classList.remove("hidden");
  }

  function hideOverlay() {
    overlay.classList.add("hidden");
  }

  /* ---- localStorage kayıt ---- */
  const SAVE_KEY = "balabanland_save_v1";
  let saveDirty = false;
  let saveAcc = 0;

  function markSave() {
    if (state.mode === "play") saveDirty = true;
  }

  function hasSave() {
    try {
      return !!localStorage.getItem(SAVE_KEY);
    } catch (_) {
      return false;
    }
  }

  function clearSave() {
    try {
      localStorage.removeItem(SAVE_KEY);
    } catch (_) { /* ignore */ }
  }

  function peekSave() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (!data || data.v !== 1) return null;
      return data;
    } catch (_) {
      return null;
    }
  }

  function buildSavePayload() {
    if (!state.map || !state.player) return null;
    return {
      v: 1,
      savedAt: Date.now(),
      levelIndex: state.levelIndex,
      money: state.money,
      score: state.score,
      hearts: state.hearts,
      seeds: { ...state.seeds },
      feed: { ...state.feed },
      soil: state.soil,
      inventory: { ...state.inventory },
      goods: { ...state.goods },
      seedIndex: state.seedIndex,
      feedIndex: state.feedIndex,
      tool: state.tool,
      progress: { ...state.progress },
      goal: state.goal ? { ...state.goal } : null,
      grid: state.map.grid.map((row) => row.join(",")),
      plots: state.plots.map((p) => ({
        tx: p.tx, ty: p.ty,
        crop: p.crop, stage: p.stage, grow: p.grow,
        watered: !!p.watered, ready: !!p.ready,
      })),
      animals: state.animals.map((a) => ({
        kind: a.kind, x: a.x, y: a.y,
        hunger: a.hunger, hungerDrain: a.hungerDrain,
        bound: a.bound || null, dir: a.dir,
        produceT: a.produceT, happy: a.happy,
      })),
      props: state.props,
      collectibles: state.collectibles,
      butterflies: state.butterflies,
      traps: state.traps,
      balloons: state.balloons,
      chests: state.chests,
      player: {
        x: state.player.x,
        y: state.player.y,
        facing: state.player.facing,
        dir: state.player.dir,
      },
    };
  }

  function saveGame(force = false) {
    if (!force && state.mode !== "play") return false;
    const payload = buildSavePayload();
    if (!payload) return false;
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
      saveDirty = false;
      saveAcc = 0;
      return true;
    } catch (err) {
      console.warn("Kayıt başarısız", err);
      return false;
    }
  }

  function tickSave(dt) {
    if (state.mode !== "play") return;
    saveAcc += dt;
    if ((saveDirty && saveAcc >= 2) || saveAcc >= 15) saveGame();
  }

  function applySaveData(data) {
    const level = getLevel(data.levelIndex);
    state.levelIndex = data.levelIndex | 0;
    state.money = data.money | 0;
    state.score = data.score | 0;
    state.hearts = Math.max(1, data.hearts | 0);
    state.seeds = { ...defaultSeeds(), ...(data.seeds || {}) };
    state.feed = { ...defaultFeed(), ...(data.feed || {}) };
    state.soil = data.soil != null ? data.soil : 10;
    state.inventory = { ...(data.inventory || {}) };
    state.goods = { ...defaultGoods(), ...(data.goods || {}) };
    state.seedIndex = data.seedIndex | 0;
    state.feedIndex = data.feedIndex | 0;
    state.progress = {
      harvest: 0, feed: 0, collect: 0, moneyEarned: 0,
      ...(data.progress || {}),
    };
    state.goal = data.goal ? { ...data.goal } : { ...level.goal };
    state.map = {
      grid: (data.grid || []).map((row) => row.split(",")),
    };
    state.plots = (data.plots || []).map((p) => {
      const plot = makePlot(p.tx, p.ty);
      plot.crop = p.crop || null;
      plot.stage = p.stage | 0;
      plot.grow = +p.grow || 0;
      plot.watered = !!p.watered;
      plot.ready = !!p.ready;
      return plot;
    });
    state.animals = (data.animals || []).map((a) => {
      const animal = makeAnimal(a.kind, a.x, a.y, a.bound || null);
      animal.hunger = a.hunger != null ? a.hunger : animal.hunger;
      animal.hungerDrain = a.hungerDrain || animal.hungerDrain;
      animal.dir = a.dir != null ? a.dir : 1;
      animal.produceT = a.produceT != null ? a.produceT : animal.produceT;
      animal.happy = a.happy || 0;
      return animal;
    });
    state.props = data.props || [];
    state.collectibles = data.collectibles || [];
    state.butterflies = data.butterflies || [];
    state.traps = data.traps || [];
    state.balloons = data.balloons || [];
    state.chests = data.chests || [];
    state.particles = [];
    state.animFX = [];
    state.floatTexts = [];
    state.harvestFX = [];
    const px = data.player?.x ?? 28 * TILE;
    const py = data.player?.y ?? 20 * TILE;
    state.player = makePlayer(px, py);
    if (data.player) {
      state.player.facing = data.player.facing != null ? data.player.facing : 1;
      state.player.dir = data.player.dir || "right";
    }
    state.mode = "play";
    state.invOpen = true;
    state.panelOpen = false;
    initClouds();
    hud.levelName.textContent = level.name;
    hud.hint.textContent = "Kayıttan devam · " + (level.blurb || "");
    setTool(data.tool || "hand");
    updateHud();
    syncPanelUi();
    hideOverlay();
    showToast("Kayıttan devam");
  }

  function refreshTitleForSave() {
    const data = peekSave();
    const btnNew = $("btn-new-game");
    if (data && state.mode === "title") {
      const lvl = getLevel(data.levelIndex);
      const when = data.savedAt ? new Date(data.savedAt).toLocaleString("tr-TR") : "";
      showOverlay(
        "Kayıt bulundu",
        "Balaban Farm",
        `Seviye ${data.levelIndex + 1} · ${lvl.name} · $${data.money} · Skor ${data.score}${when ? " · " + when : ""}`,
        "Devam Et"
      );
      if (btnNew) btnNew.classList.remove("hidden");
    } else {
      showOverlay(
        "Hoş geldin",
        "Balaban Farm",
        "Sunnyside World (danieldiggle) sprite’larıyla çiftlik: ek, sula, hasat et, hayvan besle. Atıf: CREDITS.md",
        "Çiftliğe Gir"
      );
      if (btnNew) btnNew.classList.add("hidden");
    }
  }

  function resetCareer() {
    state.money = 40;
    state.score = 0;
    state.hearts = 3;
    state.inventory = {};
    state.goods = defaultGoods();
    state.feed = defaultFeed();
    state.seeds = defaultSeeds();
    state.soil = 10;
    state.seedIndex = 0;
    state.feedIndex = 0;
  }

  function playTransition(cb) {
    transitionEl.classList.remove("hidden");
    transitionEl.classList.add("active");
    state.transition = 1;
    setTimeout(() => {
      if (cb) cb();
      transitionEl.classList.remove("active");
      setTimeout(() => transitionEl.classList.add("hidden"), 400);
      state.transition = 0;
    }, 480);
  }

  function floatText(x, y, text, color = "#ffe7a0", size = 10) {
    state.floatTexts.push({ x, y, text, color, size, life: 1.0, vy: -22 });
  }

  function tinyToast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.remove("hidden", "buy");
    toastEl.classList.add("tiny");
    toastTimer = 1400;
  }

  function buyNotice(title, detail) {
    toastEl.textContent = detail ? `${title} — ${detail}` : title;
    toastEl.classList.remove("hidden", "tiny");
    toastEl.classList.add("buy");
    toastTimer = 2200;
  }

  function playBuyFx(anchor, label, color = "#a8d96a", itemSel) {
    const root = document.body;
    let cx = window.innerWidth / 2;
    let cy = window.innerHeight * 0.45;
    if (anchor && anchor.getBoundingClientRect) {
      const r = anchor.getBoundingClientRect();
      cx = r.left + r.width / 2;
      cy = r.top + r.height / 2;
    }

    const tag = document.createElement("span");
    tag.className = "buy-fx";
    tag.style.left = `${cx}px`;
    tag.style.top = `${cy - 6}px`;
    tag.style.color = color;
    tag.textContent = label;
    root.appendChild(tag);
    setTimeout(() => tag.remove(), 720);

    for (let i = 0; i < 6; i++) {
      const s = document.createElement("span");
      s.className = "buy-fx spark";
      const ang = Math.random() * Math.PI * 2;
      const dist = 10 + Math.random() * 18;
      s.style.left = `${cx + (Math.random() - 0.5) * 8}px`;
      s.style.top = `${cy + (Math.random() - 0.5) * 6}px`;
      s.style.background = i % 2 ? color : "#ffe7a0";
      s.style.setProperty("--dx", `${Math.cos(ang) * dist}px`);
      s.style.setProperty("--dy", `${Math.sin(ang) * dist - 8}px`);
      root.appendChild(s);
      setTimeout(() => s.remove(), 560);
    }

    const moneyHud = hud.money && hud.money.closest(".hud-item");
    if (moneyHud) {
      moneyHud.classList.remove("ping");
      void moneyHud.offsetWidth;
      moneyHud.classList.add("ping");
      setTimeout(() => moneyHud.classList.remove("ping"), 420);
    }

    if (state.player) spawnBurst(state.player.x + 6, state.player.y - 4, color, 7, 38);

    if (itemSel) {
      requestAnimationFrame(() => {
        const row = document.querySelector(itemSel);
        if (!row) return;
        row.classList.remove("bought");
        void row.offsetWidth;
        row.classList.add("bought");
        setTimeout(() => row.classList.remove("bought"), 480);
      });
    }
  }

  function spawnBurst(x, y, color, n = 12, speed = 60) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = rand(speed * 0.3, speed);
      state.particles.push({
        x, y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s - 20,
        life: rand(0.35, 0.9),
        color,
        size: rand(2, 4),
        gravity: 90,
      });
    }
  }

  function spawnAnimFX(type, x, y, frames = 8, fps = 12) {
    state.animFX.push({ type, x, y, frame: 0, frames, fps, t: 0, life: frames / fps });
  }

  /* ---- tiles (Sunnyside world16 atlas, 16px) ---- */
  function drawWorldTile(col, row, dx, dy) {
    const img = images.world16;
    if (!img) return;
    ctx.drawImage(img, col * 16, row * 16, 16, 16, dx, dy, 16, 16);
  }

  function drawSprite(img, sx, sy, sw, sh, dx, dy, dw, dh, flipX) {
    if (!img) return;
    ctx.save();
    if (flipX) {
      ctx.translate(dx + dw, dy);
      ctx.scale(-1, 1);
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, dw, dh);
    } else {
      ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
    }
    ctx.restore();
  }

  function drawImg(key, dx, dy, dw, dh) {
    const img = images[key];
    if (!img) return;
    ctx.drawImage(img, dx, dy, dw || img.width, dh || img.height);
  }

  /* ---- map helpers ---- */
  function makeGrid(fill) {
    return Array.from({ length: MH }, () => Array(MW).fill(fill));
  }
  function fillRect(g, x, y, w, h, v) {
    for (let j = y; j < y + h; j++)
      for (let i = x; i < x + w; i++)
        if (j >= 0 && j < MH && i >= 0 && i < MW) g[j][i] = v;
  }

  /** Create plantable plots for every soil tile on the grid */
  function plotsFromSoil(g) {
    const plots = [];
    for (let ty = 0; ty < MH; ty++) {
      for (let tx = 0; tx < MW; tx++) {
        if (g[ty][tx] === "soil") plots.push(makePlot(tx, ty));
      }
    }
    return plots;
  }
  function stampPath(g, pts, width = 2) {
    for (let p = 0; p < pts.length - 1; p++) {
      const [x0, y0] = pts[p];
      const [x1, y1] = pts[p + 1];
      const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
      for (let s = 0; s <= steps; s++) {
        const t = s / steps;
        const cx = Math.round(x0 + (x1 - x0) * t);
        const cy = Math.round(y0 + (y1 - y0) * t);
        fillRect(g, cx - (width >> 1), cy - (width >> 1), width, width, "path");
      }
    }
  }
  function borderCliff(g) {
    for (let x = 0; x < MW; x++) {
      g[0][x] = "cliff"; g[MH - 1][x] = "cliff";
      if (g[1][x] !== "path") g[1][x] = "edge";
      if (g[MH - 2][x] !== "path") g[MH - 2][x] = "edge";
    }
    for (let y = 0; y < MH; y++) {
      g[y][0] = "cliff"; g[y][MW - 1] = "cliff";
      if (g[y][1] !== "path") g[y][1] = "edge";
      if (g[y][MW - 2] !== "path") g[y][MW - 2] = "edge";
    }
  }

  function solidAt(px, py, ww = 14, hh = 10) {
    const pts = [
      [px + 3, py + hh - 2],
      [px + ww - 3, py + hh - 2],
      [px + ww / 2, py + hh - 2],
    ];
    for (const [x, y] of pts) {
      const tx = (x / TILE) | 0;
      const ty = (y / TILE) | 0;
      if (tx < 0 || ty < 0 || tx >= MW || ty >= MH) return true;
      const cell = state.map.grid[ty][tx];
      if (cell === "cliff" || cell === "block") return true;
    }
    for (const p of state.props) {
      if (!p.solid) continue;
      if (px + 3 < p.x + p.sw && px + ww - 3 > p.x + p.sx && py + hh - 4 < p.y + p.sh && py + hh > p.y + p.sy)
        return true;
    }
    return false;
  }

  /* ---- entities ---- */
  function makePlayer(x, y) {
    return {
      x, y, z: 0, vz: 0,
      dir: "right",
      facing: 1,
      frame: 0,
      anim: 0,
      moving: false,
      running: false,
      jumping: false,
      action: null,
      actionT: 0,
      speed: 70,
      baseSpeed: 70,
      slowT: 0,
      invuln: 0,
      fx: { speed: 0, shield: 0, magnet: 0 },
      dustT: 0,
    };
  }

  function makeAnimal(kind, x, y, bound) {
    return {
      kind, x, y, bound,
      dir: 1,
      frame: 0,
      anim: 0,
      timer: rand(0.6, 2),
      hunger: rand(0.35, 0.85),
      hungerDrain: 1 / 90,
      happy: 0,
      fedLeft: 0,
      speed: kind === "cow" || kind === "pig" || kind === "sheep" ? 18 : 28,
      w: kind === "cow" || kind === "pig" || kind === "sheep" ? 28 : 16,
      h: 20,
      produceT: rand(10, 20),
    };
  }

  function makePlot(tx, ty) {
    return {
      tx, ty,
      x: tx * TILE,
      y: ty * TILE,
      crop: null,
      stage: 0,
      grow: 0,
      watered: false,
      ready: false,
      seedFlash: 0,
      waterFlash: 0,
    };
  }

  function makeCollectible(type, x, y, extra = {}) {
    return Object.assign({
      type, x, y,
      baseY: y,
      phase: rand(0, 6),
      taken: false,
      value: 5,
    }, extra);
  }

  function makeTrap(type, x, y) {
    return { type, x, y, frame: 0, anim: 0, pulse: rand(0, 3), active: true, cool: 0 };
  }

  function makeButterfly(x, y) {
    return {
      x, y,
      tx: x + rand(-40, 40),
      ty: y + rand(-30, 30),
      phase: rand(0, 6),
      color: choice(["#ff7eb9", "#c45de8", "#4c8fe8", "#f0c36a", "#5dcf8a", "#ff9f43"]),
      taken: false,
      flap: 0,
    };
  }

  function makeCloud(x, y, w) {
    return { x, y, w, speed: rand(4, 12), layer: Math.random() < 0.5 ? 0 : 1 };
  }

  /* ---- levels ---- */
  function propTree(tx, ty) {
    return { kind: "tree", x: tx * TILE, y: ty * TILE, sx: 10, sy: 36, sw: 20, sh: 14, solid: true };
  }
  function propHouse(tx, ty) {
    return { kind: "house", x: tx * TILE, y: ty * TILE - 18, sx: 8, sy: 48, sw: 28, sh: 18, solid: true };
  }
  function propMill(tx, ty) {
    return { kind: "windmill", x: tx * TILE, y: ty * TILE, sx: 10, sy: 40, sw: 30, sh: 20, solid: true };
  }
  function fenceBox(props, x, y, w, h) {
    for (let i = 0; i < w; i++) {
      props.push({ kind: "fenceH", x: (x + i) * TILE, y: y * TILE, sx: 0, sy: 6, sw: 16, sh: 8, solid: true });
      props.push({ kind: "fenceH", x: (x + i) * TILE, y: (y + h) * TILE, sx: 0, sy: 6, sw: 16, sh: 8, solid: true });
    }
    for (let j = 1; j < h; j++) {
      props.push({ kind: "fenceV", x: x * TILE, y: (y + j) * TILE, sx: 2, sy: 0, sw: 8, sh: 14, solid: true });
      props.push({ kind: "fenceV", x: (x + w) * TILE, y: (y + j) * TILE, sx: 2, sy: 0, sw: 8, sh: 14, solid: true });
    }
  }

  /** Ortak seviye üretici — soil / hayvan / hedef artarak genişler */
  function buildFarmLevel(cfg) {
    const g = makeGrid("grass");
    const clutter = cfg.clutter || 40;
    for (let i = 0; i < clutter; i++) {
      fillRect(g, (2 + Math.random() * 54) | 0, (2 + Math.random() * 34) | 0, 2 + (Math.random() * 2) | 0, 2, "dark");
    }
    const path = cfg.path || [[4, 20], [30, 20], [55, 22]];
    stampPath(g, path, cfg.pathW || 3);
    for (const [sx, sy, sw, sh] of (cfg.soils || [])) fillRect(g, sx, sy, sw, sh, "soil");
    if (cfg.plaza) fillRect(g, cfg.plaza[0], cfg.plaza[1], cfg.plaza[2], cfg.plaza[3], "path");
    borderCliff(g);

    const plots = plotsFromSoil(g);
    const props = [];
    if (cfg.house) props.push(propHouse(cfg.house[0], cfg.house[1]));
    if (cfg.mill) props.push(propMill(cfg.mill[0], cfg.mill[1]));
    (cfg.trees || []).forEach(([tx, ty]) => props.push(propTree(tx, ty)));
    if (cfg.pen) fenceBox(props, cfg.pen[0], cfg.pen[1], cfg.pen[2], cfg.pen[3]);

    const animals = [];
    for (const a of (cfg.animals || [])) {
      animals.push(makeAnimal(a[0], a[1] * TILE, a[2] * TILE, a[3] || null));
    }

    const collectibles = [];
    const nFlower = cfg.flowers ?? 8;
    const nCoin = cfg.coins ?? 5;
    for (let i = 0; i < nFlower; i++) collectibles.push(makeCollectible("flower", rand(4, 54) * TILE, rand(4, 34) * TILE, { variant: i % 2, value: 6 + (cfg.tier || 1) * 2 }));
    for (let i = 0; i < nCoin; i++) collectibles.push(makeCollectible("coin", rand(5, 53) * TILE, rand(5, 33) * TILE, { value: 8 + (cfg.tier || 1) * 2 }));
    for (let i = 0; i < (cfg.golds || 0); i++) collectibles.push(makeCollectible("gold", rand(8, 50) * TILE, rand(8, 30) * TILE, { power: choice(["speed", "shield", "magnet"]) }));
    for (let i = 0; i < (cfg.mushrooms || 0); i++) collectibles.push(makeCollectible("mushroom", rand(6, 52) * TILE, rand(6, 32) * TILE, { value: 12 + (cfg.tier || 1) * 3 }));
    if (cfg.acorns) for (let i = 0; i < cfg.acorns; i++) collectibles.push(makeCollectible("acorn", rand(6, 52) * TILE, rand(6, 32) * TILE, { value: 10 }));

    const butterflies = [];
    for (let i = 0; i < (cfg.butterflies || 6); i++) butterflies.push(makeButterfly(rand(6, 52) * TILE, rand(6, 32) * TILE));

    const traps = [];
    for (let i = 0; i < (cfg.traps || 0); i++) {
      traps.push(makeTrap(i % 3 === 0 ? "rock" : "fire", rand(8, 50) * TILE, rand(8, 32) * TILE));
    }

    const balloons = Array.from({ length: cfg.balloons || 4 }, () => ({
      x: rand(6, 52) * TILE, baseY: rand(6, 32) * TILE, phase: rand(0, 6),
      color: choice(["#e85d4c", "#4c8fe8", "#f0c36a", "#c45de8", "#5dcf8a"]), collected: false, pop: 0,
    }));

    const chests = (cfg.chests || []).map(([x, y, r]) => ({ x: x * TILE, y: y * TILE, open: false, reward: r }));
    const start = cfg.start || { x: 28 * TILE, y: 20 * TILE };

    return { grid: g, plots, props, animals, collectibles, butterflies, traps, balloons, chests, start };
  }

  const LEVEL_DEFS = [
    { name: "Bahçe Başlangıcı", blurb: "Küçük tarla · çapa ile çimeni tarlaya çevir, istediğin kadar genişlet!", tier: 1, goal: { money: 60, harvest: 3, collect: 4, feed: 1 },
      soils: [[12, 12, 6, 5]], house: [24, 6], mill: [48, 6], trees: [[5, 5], [52, 8], [6, 32]],
      animals: [["chicken", 16, 22], ["chicken", 18, 24]], flowers: 6, coins: 4, butterflies: 5, balloons: 3,
      chests: [[22, 12, 30]], start: { x: 28 * TILE, y: 20 * TILE }, traps: 1 },
    { name: "Çayır Açılışı", blurb: "Boş çayır — tarlayı kendin aç! Ek, sula, hasat.", tier: 1, goal: { money: 90, harvest: 5, collect: 5, feed: 1 },
      soils: [[20, 16, 4, 3]], house: [8, 6], trees: [[50, 6], [54, 30], [4, 28]],
      animals: [["chicken", 30, 22], ["duck", 34, 24]], flowers: 8, coins: 5, butterflies: 6, balloons: 4,
      chests: [[40, 14, 40]], start: { x: 22 * TILE, y: 18 * TILE }, traps: 1 },
    { name: "Hayvan Çiftliği", blurb: "İnekleri besle, yumurta topla. Tarlayı genişlet.", tier: 2, goal: { money: 130, harvest: 6, collect: 6, feed: 3 },
      soils: [[8, 24, 8, 5], [40, 10, 6, 4]], house: [26, 5], pen: [8, 8, 11, 8],
      trees: [[4, 4], [52, 4], [55, 32]],
      animals: [["cow", 11, 10, { x: 9 * TILE, y: 9 * TILE, w: 9 * TILE, h: 6 * TILE }], ["cow", 14, 12, { x: 9 * TILE, y: 9 * TILE, w: 9 * TILE, h: 6 * TILE }], ["chicken", 32, 24], ["pig", 42, 20]],
      flowers: 9, coins: 7, golds: 1, butterflies: 7, balloons: 5, traps: 3,
      chests: [[10, 18, 45], [44, 16, 55]], start: { x: 30 * TILE, y: 18 * TILE } },
    { name: "İki Tarla", blurb: "İki başlangıç tarlası + istediğin kadar yeni toprak.", tier: 2, goal: { money: 160, harvest: 8, collect: 7, feed: 3 },
      soils: [[6, 10, 7, 5], [40, 22, 8, 5]], house: [28, 6], mill: [50, 8],
      trees: [[4, 4], [20, 32], [55, 30]], animals: [["sheep", 24, 20], ["chicken", 16, 18], ["duck", 36, 28]],
      flowers: 10, coins: 8, mushrooms: 1, butterflies: 8, balloons: 5, traps: 3,
      chests: [[18, 14, 50]], start: { x: 28 * TILE, y: 20 * TILE } },
    { name: "Hasat Vadisi", blurb: "Geniş vadide büyük hasat. Tuzaklardan zıpla!", tier: 3, goal: { money: 200, harvest: 10, collect: 8, feed: 4 },
      soils: [[6, 8, 10, 7], [28, 8, 10, 7], [14, 24, 12, 6]], house: [48, 26], mill: [4, 28],
      trees: [[4, 4], [22, 4], [46, 4]], animals: [["cow", 50, 12], ["pig", 52, 16], ["chicken", 44, 30], ["duck", 20, 34]],
      flowers: 12, coins: 10, golds: 2, butterflies: 9, balloons: 6, traps: 5,
      chests: [[8, 20, 70], [42, 20, 70]], start: { x: 24 * TILE, y: 21 * TILE }, path: [[4, 20], [24, 20], [24, 6], [50, 6], [50, 34]] },
    { name: "Göl Kenarı", blurb: "Dar tarlalar — çapa ile kenarları genişlet.", tier: 3, goal: { money: 240, harvest: 11, collect: 9, feed: 4 },
      soils: [[10, 18, 5, 4], [36, 12, 5, 4]], house: [22, 5], trees: [[5, 8], [50, 8], [8, 32], [48, 32]],
      animals: [["duck", 14, 26], ["duck", 40, 26], ["chicken", 28, 22], ["sheep", 44, 18]],
      flowers: 11, coins: 9, golds: 1, mushrooms: 2, butterflies: 10, balloons: 6, traps: 4,
      chests: [[30, 16, 80]], start: { x: 26 * TILE, y: 20 * TILE } },
    { name: "Değirmen Yolu", blurb: "Rüzgar değirmeni civarı. Daha çok hayvan, daha çok hedef.", tier: 4, goal: { money: 280, harvest: 12, collect: 10, feed: 5 },
      soils: [[8, 10, 8, 6], [34, 22, 10, 6]], house: [26, 6], mill: [48, 10],
      trees: [[4, 4], [55, 4], [4, 34]], animals: [["cow", 12, 20], ["pig", 40, 16], ["sheep", 44, 28], ["chicken", 20, 28], ["chicken", 22, 30]],
      flowers: 12, coins: 11, golds: 2, butterflies: 10, balloons: 7, traps: 5,
      chests: [[16, 14, 90], [46, 20, 90]], start: { x: 28 * TILE, y: 18 * TILE } },
    { name: "Tepe Tarlası", blurb: "Yüksek tepe — tarlayı aşağı doğru genişlet.", tier: 4, goal: { money: 320, harvest: 13, collect: 11, feed: 5 },
      soils: [[22, 8, 12, 5]], house: [8, 24], mill: [50, 24], trees: [[6, 6], [54, 6], [30, 32]],
      animals: [["cow", 40, 12], ["cow", 44, 14], ["pig", 16, 28], ["duck", 28, 26]],
      flowers: 13, coins: 12, golds: 2, mushrooms: 2, butterflies: 11, balloons: 7, traps: 6,
      chests: [[24, 16, 100], [36, 16, 100]], start: { x: 28 * TILE, y: 20 * TILE } },
    { name: "Çiftlik Kasabası", blurb: "Kalabalık kasaba. Çimenleri tarlaya çevir, üretim artır.", tier: 5, goal: { money: 360, harvest: 14, collect: 12, feed: 6 },
      soils: [[6, 8, 8, 5], [24, 22, 8, 5], [42, 8, 8, 5]], house: [28, 5], mill: [52, 26],
      pen: [10, 16, 8, 6], trees: [[4, 4], [20, 4], [55, 34]],
      animals: [["cow", 12, 18, { x: 11 * TILE, y: 17 * TILE, w: 6 * TILE, h: 4 * TILE }], ["sheep", 14, 19, { x: 11 * TILE, y: 17 * TILE, w: 6 * TILE, h: 4 * TILE }], ["pig", 46, 20], ["chicken", 30, 28], ["chicken", 32, 30], ["duck", 36, 14]],
      flowers: 14, coins: 12, golds: 3, butterflies: 12, balloons: 8, traps: 6,
      chests: [[18, 12, 110], [40, 24, 110]], start: { x: 30 * TILE, y: 16 * TILE } },
    { name: "Ateş Çemberi", blurb: "Daha çok tuzak! Zıpla, hasat et, tarlayı büyüt.", tier: 5, goal: { money: 400, harvest: 15, collect: 12, feed: 6 },
      soils: [[10, 12, 9, 6], [36, 20, 9, 6]], house: [26, 6], trees: [[5, 5], [55, 5], [5, 34], [55, 34]],
      animals: [["cow", 48, 12], ["pig", 14, 28], ["sheep", 40, 14], ["chicken", 24, 24], ["duck", 30, 30]],
      flowers: 14, coins: 13, golds: 2, mushrooms: 3, butterflies: 12, balloons: 8, traps: 9,
      chests: [[20, 18, 120], [42, 12, 120]], start: { x: 28 * TILE, y: 18 * TILE } },
    { name: "Büyük Ova", blurb: "Neredeyse boş ova — tarlayı istediğin gibi kur!", tier: 6, goal: { money: 450, harvest: 16, collect: 13, feed: 7 },
      soils: [[26, 18, 5, 4]], house: [6, 6], mill: [50, 6], trees: [[4, 20], [55, 20], [30, 4]],
      animals: [["cow", 12, 14], ["cow", 44, 14], ["pig", 20, 28], ["sheep", 40, 28], ["chicken", 28, 12], ["duck", 32, 30]],
      flowers: 15, coins: 14, golds: 3, acorns: 2, butterflies: 13, balloons: 9, traps: 7,
      chests: [[16, 20, 130], [44, 20, 130], [30, 28, 100]], start: { x: 28 * TILE, y: 16 * TILE }, clutter: 25 },
    { name: "Üç Bahçe", blurb: "Üç başlangıç bahçesi. Aralarını toprakla birleştir.", tier: 6, goal: { money: 500, harvest: 18, collect: 14, feed: 7 },
      soils: [[6, 8, 7, 5], [26, 20, 7, 5], [46, 8, 7, 5]], house: [28, 4], mill: [10, 28],
      trees: [[20, 6], [40, 6], [30, 34]], animals: [["cow", 14, 16], ["pig", 34, 14], ["sheep", 48, 20], ["chicken", 24, 28], ["chicken", 28, 30], ["duck", 40, 28]],
      flowers: 16, coins: 14, golds: 3, mushrooms: 2, butterflies: 14, balloons: 10, traps: 8,
      chests: [[12, 14, 140], [32, 14, 140], [48, 24, 140]], start: { x: 30 * TILE, y: 12 * TILE } },
    { name: "Gece Pazarı", blurb: "Zengin pazar — yüksek hedefler, bol sandık.", tier: 7, goal: { money: 560, harvest: 18, collect: 15, feed: 8 },
      soils: [[8, 10, 10, 6], [36, 22, 10, 6]], house: [24, 5], mill: [50, 28], plaza: [20, 16, 16, 6],
      trees: [[4, 4], [55, 4], [4, 34]], animals: [["cow", 12, 22], ["cow", 44, 12], ["pig", 30, 28], ["sheep", 18, 28], ["chicken", 40, 18], ["duck", 48, 20], ["chicken", 34, 14]],
      flowers: 16, coins: 15, golds: 4, butterflies: 14, balloons: 12, traps: 8,
      chests: [[22, 12, 150], [38, 12, 150], [28, 24, 180]], start: { x: 28 * TILE, y: 30 * TILE } },
    { name: "Festival Hazırlığı", blurb: "Festival öncesi son hazırlık. Tarlayı doldur!", tier: 7, goal: { money: 620, harvest: 20, collect: 16, feed: 8 },
      soils: [[8, 8, 12, 7], [34, 8, 12, 7], [16, 24, 20, 6]], house: [28, 5], mill: [4, 28],
      trees: [[4, 4], [55, 4], [55, 34]], animals: [["cow", 10, 20], ["cow", 46, 20], ["pig", 22, 18], ["sheep", 36, 18], ["chicken", 26, 32], ["chicken", 30, 32], ["duck", 14, 32], ["duck", 42, 32]],
      flowers: 18, coins: 16, golds: 4, mushrooms: 3, butterflies: 15, balloons: 12, traps: 9,
      chests: [[14, 16, 160], [44, 16, 160], [28, 20, 200]], start: { x: 28 * TILE, y: 18 * TILE } },
    { name: "Bahar Festivali", blurb: "Neredeyse final! Her şeyi topla, hayvanları mutlu et.", tier: 8, goal: { money: 700, harvest: 22, collect: 18, feed: 9 },
      soils: [[8, 8, 8, 5], [44, 8, 8, 5], [22, 28, 16, 5]], house: [26, 4], mill: [50, 24], plaza: [18, 14, 24, 10],
      trees: [], animals: [["cow", 12, 18], ["cow", 48, 18], ["pig", 20, 24], ["sheep", 36, 24], ["chicken", 28, 22], ["chicken", 32, 22], ["duck", 24, 18], ["duck", 40, 18]],
      flowers: 18, coins: 16, golds: 4, mushrooms: 4, butterflies: 16, balloons: 14, traps: 10,
      chests: [[18, 14, 180], [40, 14, 180], [18, 24, 180], [40, 24, 180]], start: { x: 30 * TILE, y: 32 * TILE },
      path: [[4, 20], [18, 20], [42, 20], [56, 20]], pathW: 4 },
    { name: "Büyük Festival", blurb: "Son seviye! Dev tarla, tüm hedefler, zafer!", tier: 9, goal: { money: 850, harvest: 25, collect: 20, feed: 10 },
      soils: [[6, 8, 14, 8], [34, 8, 14, 8], [12, 24, 30, 7]], house: [28, 4], mill: [4, 28],
      trees: [[20, 4], [40, 4]], animals: [["cow", 10, 18], ["cow", 48, 18], ["cow", 30, 14], ["pig", 18, 28], ["pig", 40, 28], ["sheep", 24, 20], ["sheep", 36, 20], ["chicken", 14, 32], ["chicken", 46, 32], ["duck", 28, 32], ["duck", 32, 32]],
      flowers: 20, coins: 18, golds: 5, mushrooms: 4, acorns: 3, butterflies: 18, balloons: 16, traps: 12,
      chests: [[16, 16, 200], [44, 16, 200], [20, 28, 220], [40, 28, 220], [30, 18, 300]], start: { x: 30 * TILE, y: 20 * TILE }, clutter: 55 },
  ];

  // festival trees ring for spring festival
  LEVEL_DEFS[14].trees = Array.from({ length: 10 }, (_, a) => {
    const ang = (a / 10) * Math.PI * 2;
    return [(30 + Math.cos(ang) * 20) | 0, (20 + Math.sin(ang) * 12) | 0];
  });

  const LEVELS = LEVEL_DEFS.map((def) => ({
    name: def.name,
    blurb: def.blurb,
    goal: def.goal,
    build() { return buildFarmLevel(def); },
  }));

  const ENDLESS_NAMES = [
    "Sonsuz Çayır", "Uzak Ova", "Yeni Bahçe", "Rüzgarlı Tepe", "Sisli Vadi",
    "Altın Tarla", "Kuzey Çiftlik", "Güneşli Bayır", "Yeşil Ada", "Hasat Yolu",
    "Bulut Çiftliği", "Dere Kenarı", "Ayçiçeği Ovası", "Bereketli Toprak", "Uçsuz Bahçe",
  ];

  /** Sınırsız seviye: tanımlı 16'dan sonra prosedürel üretir */
  function makeEndlessDef(index) {
    const n = index + 1;
    const tier = Math.min(20, 4 + Math.floor(index / 2));
    const scale = 1 + (index - LEVEL_DEFS.length) * 0.12;
    const money = Math.floor(80 + n * 45 + scale * 40);
    const harvest = Math.min(80, 4 + Math.floor(n * 1.2));
    const collect = Math.min(60, 4 + Math.floor(n * 0.9));
    const feed = Math.min(40, 1 + Math.floor(n * 0.55));
    const soilW = Math.max(3, 8 - Math.floor(index / 8));
    const soilH = Math.max(3, 5 - Math.floor(index / 10));
    const sx = 8 + ((index * 7) % 30);
    const sy = 8 + ((index * 5) % 18);
    const kinds = ["chicken", "duck", "pig", "sheep", "cow"];
    const animals = [];
    const animalCount = Math.min(14, 3 + Math.floor(n / 3));
    for (let i = 0; i < animalCount; i++) {
      animals.push([
        kinds[i % kinds.length],
        8 + ((i * 11 + index * 3) % 44),
        10 + ((i * 9 + index * 5) % 22),
      ]);
    }
    const name = `${ENDLESS_NAMES[index % ENDLESS_NAMES.length]} #${n}`;
    return {
      name,
      blurb: `Seviye ${n} · hedefler büyüyor · toprağı marketten alıp genişlet!`,
      tier,
      goal: { money, harvest, collect, feed },
      soils: [
        [sx % 40 + 4, sy % 24 + 4, soilW, soilH],
        [((sx + 20) % 40) + 4, ((sy + 10) % 22) + 6, Math.max(3, soilW - 1), Math.max(3, soilH - 1)],
      ],
      house: [26 + (index % 5), 4 + (index % 3)],
      mill: index % 2 ? [48, 8 + (index % 10)] : [4, 26],
      trees: [[4, 4], [55, 4], [4, 34], [55, 34], [30, 4], [12, 32]],
      animals,
      flowers: Math.min(28, 8 + Math.floor(n / 2)),
      coins: Math.min(24, 6 + Math.floor(n / 2)),
      golds: Math.min(8, 1 + Math.floor(n / 5)),
      mushrooms: Math.min(6, Math.floor(n / 6)),
      acorns: Math.min(4, Math.floor(n / 8)),
      butterflies: Math.min(22, 6 + Math.floor(n / 3)),
      balloons: Math.min(20, 4 + Math.floor(n / 3)),
      traps: Math.min(18, 2 + Math.floor(n / 3)),
      chests: [
        [10 + (index % 20), 12, 40 + n * 8],
        [40 - (index % 15), 20, 50 + n * 10],
        [28, 28, 60 + n * 12],
      ],
      start: { x: 28 * TILE, y: 18 * TILE },
      clutter: 30 + (index % 25),
      path: [[4, 20], [20 + (index % 10), 18], [40, 20], [55, 22]],
    };
  }

  function getLevel(index) {
    if (index < LEVELS.length) return LEVELS[index];
    const def = makeEndlessDef(index);
    return {
      name: def.name,
      blurb: def.blurb,
      goal: def.goal,
      build() { return buildFarmLevel(def); },
    };
  }

  function initClouds() {
    state.clouds = [];
    for (let i = 0; i < 10; i++) {
      state.clouds.push(makeCloud(rand(-40, WORLD_W), rand(10, 120), rand(40, 90)));
    }
    state.birds = [];
    for (let i = 0; i < 5; i++) {
      state.birds.push({
        x: rand(0, WORLD_W), y: rand(20, 100),
        dir: Math.random() < 0.5 ? -1 : 1,
        speed: rand(20, 40),
        frame: 0, anim: 0, layer: 1,
      });
    }
  }

  function loadLevel(index) {
    state.levelIndex = index;
    const level = getLevel(index);
    const built = level.build();
    state.map = { grid: built.grid };
    state.plots = built.plots;
    state.props = built.props;
    state.animals = built.animals;
    state.collectibles = built.collectibles;
    state.butterflies = built.butterflies;
    state.traps = built.traps;
    state.balloons = built.balloons;
    state.chests = built.chests;
    state.particles = [];
    state.animFX = [];
    state.floatTexts = [];
    state.harvestFX = [];
    state.goal = { ...level.goal };
    state.progress = { harvest: 0, feed: 0, collect: 0, moneyEarned: 0 };
    state.player = makePlayer(built.start.x, built.start.y);
    state.mode = "play";
    state.invOpen = true;
    initClouds();
    hud.levelName.textContent = level.name;
    hud.hint.textContent = level.blurb;
    setTool("hand");
    updateHud();
    syncPanelUi();
    hideOverlay();
    showToast(level.name);
    saveGame(true);
  }

  function goalMet() {
    const g = state.goal;
    const p = state.progress;
    return state.money >= g.money && p.harvest >= g.harvest && p.collect >= g.collect && p.feed >= g.feed;
  }

  function checkComplete() {
    if (state.mode !== "play") return;
    if (!goalMet()) return;
    spawnBurst(state.player.x + 8, state.player.y, "#f0c36a", 30, 100);
    state.mode = "complete";
    state.invOpen = false;
    state.panelOpen = false;
    syncPanelUi();
    const next = getLevel(state.levelIndex + 1);
    const cur = getLevel(state.levelIndex);
    showOverlay(
      "Seviye Tamam!",
      cur.name,
      `Skor ${state.score} · Para ${state.money} · Sırada: ${next.name}`,
      "Sonraki Seviye"
    );
    saveGame(true);
  }

  function updateHud() {
    const g = state.goal || { money: 0, harvest: 0, collect: 0, feed: 0 };
    const p = state.progress;
    hud.level.textContent = `${state.levelIndex + 1}∞`;
    hud.money.textContent = String(state.money);
    hud.score.textContent = String(state.score);
    hud.hearts.textContent = String(state.hearts);
    hud.goal.textContent = `${p.harvest}/${g.harvest}H ${p.feed}/${g.feed}B ${p.collect}/${g.collect}T`;
    const fx = [];
    const pl = state.player;
    if (pl) {
      if (pl.fx.speed > 0) fx.push(`Hız ${pl.fx.speed | 0}s`);
      if (pl.fx.shield > 0) fx.push(`Kalkan ${pl.fx.shield | 0}s`);
      if (pl.fx.magnet > 0) fx.push(`Magnet ${pl.fx.magnet | 0}s`);
    }
    hud.fx.textContent = fx.join(" · ");
    renderFarmPanel();
    renderSeedBar();
  }

  function renderSeedBar() {
    const seedSlots = $("seed-slots");
    const feedSlots = $("feed-slots");
    const soilSlots = $("soil-slots");
    const sel = $("inv-selected");
    if (!seedSlots) return;

    const selectedCrop = CROP_TYPES[state.seedIndex];
    const selectedFeed = FEED_TYPES[state.feedIndex];
    if (sel) {
      if (state.tool === "soil") {
        sel.textContent = `Toprak: x${state.soil || 0} — çimene tıkla`;
      } else if (state.tool === "feed") {
        sel.textContent = selectedFeed ? `Yem: ${selectedFeed.name} x${state.feed[selectedFeed.id] || 0}` : "Yem: —";
      } else {
        sel.textContent = selectedCrop ? `Tohum: ${selectedCrop.name} x${state.seeds[selectedCrop.id] || 0}` : "Tohum: —";
      }
    }

    if (soilSlots) {
      soilSlots.innerHTML = "";
      const qty = state.soil || 0;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "inv-slot" + (state.tool === "soil" ? " selected" : "") + (qty <= 0 ? " empty" : "");
      btn.title = `Toprak x${qty}`;
      const cv = document.createElement("canvas");
      cv.width = 24;
      cv.height = 24;
      const cctx = cv.getContext("2d");
      cctx.imageSmoothingEnabled = false;
      cctx.fillStyle = "#8b5a2b";
      cctx.fillRect(2, 4, 20, 16);
      cctx.fillStyle = "#a67c42";
      cctx.fillRect(4, 6, 16, 12);
      const nm = document.createElement("span");
      nm.className = "nm";
      nm.textContent = "Toprak";
      const q = document.createElement("span");
      q.className = "qty";
      q.textContent = `x${qty}`;
      btn.appendChild(cv);
      btn.appendChild(nm);
      btn.appendChild(q);
      btn.addEventListener("click", () => {
        setTool("soil");
        if (qty <= 0) {
          setPanelOpen(true);
          state.panelTab = "soil";
          renderFarmPanel();
          showToast("Marketten toprak al");
        } else tinyToast(`Toprak seçildi x${qty}`);
        updateHud();
      });
      soilSlots.appendChild(btn);
    }

    seedSlots.innerHTML = "";
    CROP_TYPES.forEach((crop, i) => {
      const qty = state.seeds[crop.id] || 0;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "inv-slot" + (state.seedIndex === i && state.tool === "hoe" ? " selected" : "") + (qty <= 0 ? " empty" : "");
      btn.title = `${crop.name} x${qty}`;
      const cv = document.createElement("canvas");
      cv.width = 24;
      cv.height = 24;
      const cctx = cv.getContext("2d");
      cctx.imageSmoothingEnabled = false;
      cctx.fillStyle = "#2f6b3a55";
      cctx.fillRect(0, 0, 24, 24);
      const img = images[`crop_${crop.id}_5`] || images.seeds;
      if (img) cctx.drawImage(img, 2, 2, 20, 20);
      const nm = document.createElement("span");
      nm.className = "nm";
      nm.textContent = crop.name.slice(0, 6);
      const q = document.createElement("span");
      q.className = "qty";
      q.textContent = `x${qty}`;
      btn.appendChild(cv);
      btn.appendChild(nm);
      btn.appendChild(q);
      btn.addEventListener("click", () => {
        state.seedIndex = i;
        setTool("hoe");
        if (qty <= 0) {
          setPanelOpen(true);
          state.panelTab = "seeds";
          buySeeds(crop.id, btn);
        } else tinyToast(`${crop.name} seçildi`);
        updateHud();
      });
      seedSlots.appendChild(btn);
    });

    if (feedSlots) {
      feedSlots.innerHTML = "";
      FEED_TYPES.forEach((feed, i) => {
        const qty = state.feed[feed.id] || 0;
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "inv-slot" + (state.feedIndex === i && state.tool === "feed" ? " selected" : "") + (qty <= 0 ? " empty" : "");
        btn.title = `${feed.name} x${qty}`;
        const cv = document.createElement("canvas");
        cv.width = 24;
        cv.height = 24;
        const cctx = cv.getContext("2d");
        cctx.imageSmoothingEnabled = false;
        cctx.fillStyle = "#2f6b3a55";
        cctx.fillRect(0, 0, 24, 24);
        const img = feedIconImg(feed);
        if (img) cctx.drawImage(img, 2, 2, 20, 20);
        const nm = document.createElement("span");
        nm.className = "nm";
        nm.textContent = feed.name.slice(0, 6);
        const q = document.createElement("span");
        q.className = "qty";
        q.textContent = `x${qty}`;
        btn.appendChild(cv);
        btn.appendChild(nm);
        btn.appendChild(q);
        btn.addEventListener("click", () => {
          state.feedIndex = i;
          setTool("feed");
          if (qty <= 0) {
            setPanelOpen(true);
            state.panelTab = "feed";
            buyFeed(feed.id, btn);
          } else tinyToast(`${feed.name} seçildi`);
          updateHud();
        });
        feedSlots.appendChild(btn);
      });
    }

    syncPanelUi();
  }

  function setPanelOpen(open) {
    state.panelOpen = !!open;
    syncPanelUi();
  }

  function setInvOpen(open) {
    state.invOpen = !!open;
    syncPanelUi();
  }

  function togglePanel() {
    if (state.mode !== "play") return;
    setPanelOpen(!state.panelOpen);
    tinyToast(state.panelOpen ? "Market açıldı" : "Market kapandı");
  }

  function toggleInv() {
    if (state.mode !== "play") return;
    setInvOpen(!state.invOpen);
    tinyToast(state.invOpen ? "Envanter açıldı" : "Envanter kapandı");
  }

  function syncPanelUi() {
    const panel = $("farm-panel");
    const inv = $("inv-bar");
    const btnP = $("btn-toggle-panel");
    const btnI = $("btn-toggle-inv");
    const playing = state.mode === "play";
    if (panel) {
      panel.classList.toggle("open", playing && state.panelOpen);
      panel.classList.toggle("pregame", !playing);
    }
    if (inv) {
      inv.classList.toggle("open", playing && state.invOpen);
      inv.classList.toggle("pregame", !playing);
    }
    if (btnP) btnP.classList.toggle("active", playing && state.panelOpen);
    if (btnI) btnI.classList.toggle("active", playing && state.invOpen);
    const dock = $("side-dock");
    const tools = $("toolbar");
    if (dock) dock.classList.toggle("pregame", !playing);
    if (tools) tools.classList.toggle("pregame", !playing);
    document.body.classList.toggle("playing", playing);
  }

  function paintSideIcons() {
    const m = $("icon-market");
    const inv = $("icon-inv");
    if (m) {
      const c = m.getContext("2d");
      c.imageSmoothingEnabled = false;
      c.clearRect(0, 0, 28, 28);
      // simple market stall / bag icon
      if (images.coins) c.drawImage(images.coins, 4, 6, 20, 16);
      else if (images.coin) c.drawImage(images.coin, 8, 8, 12, 12);
      else {
        c.fillStyle = "#f0c36a";
        c.fillRect(6, 10, 16, 12);
        c.fillStyle = "#e85d4c";
        c.fillRect(10, 6, 8, 6);
      }
    }
    if (inv) {
      const c = inv.getContext("2d");
      c.imageSmoothingEnabled = false;
      c.clearRect(0, 0, 28, 28);
      if (images.seeds) c.drawImage(images.seeds, 6, 8, 16, 14);
      else if (images[`crop_carrot_5`]) c.drawImage(images[`crop_carrot_5`], 4, 4, 20, 20);
      else {
        c.fillStyle = "#a8d96a";
        c.fillRect(7, 8, 14, 14);
      }
    }
  }

  function drawIconToCanvas(canvas, drawFn) {
    const c = canvas.getContext("2d");
    c.imageSmoothingEnabled = false;
    c.clearRect(0, 0, 28, 28);
    c.fillStyle = "#2f6b3a55";
    c.fillRect(0, 0, 28, 28);
    drawFn(c);
  }

  function renderFarmPanel() {
    const soilEl = $("tab-soil");
    const seedsEl = $("tab-seeds");
    const feedEl = $("tab-feed");
    const cropsEl = $("tab-crops");
    if (!seedsEl || !ready) return;

    if (soilEl) {
      soilEl.innerHTML = "";
      const own = document.createElement("p");
      own.className = "farm-hint";
      own.textContent = `Envanterde toprak: x${state.soil || 0} — alıp çimene koy`;
      soilEl.appendChild(own);
      SOIL_PACKS.forEach((pack) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "farm-item";
        btn.dataset.id = pack.id;
        const cv = document.createElement("canvas");
        cv.width = 28; cv.height = 28;
        drawIconToCanvas(cv, (c) => {
          c.fillStyle = "#8b5a2b";
          c.fillRect(4, 6, 20, 16);
          c.fillStyle = "#a67c42";
          c.fillRect(6, 8, 16, 12);
        });
        const meta = document.createElement("div");
        meta.className = "meta";
        meta.innerHTML = `<span class="name">${pack.name}</span><span class="qty">+${pack.pack} kare · $${pack.cost}</span>`;
        const buy = document.createElement("button");
        buy.type = "button";
        buy.className = "buy";
        buy.textContent = `Al $${pack.cost}`;
        buy.disabled = state.money < pack.cost;
        buy.addEventListener("click", (e) => {
          e.stopPropagation();
          buySoil(pack.id, e.currentTarget);
        });
        btn.appendChild(cv);
        btn.appendChild(meta);
        btn.appendChild(buy);
        btn.addEventListener("click", () => {
          setTool("soil");
          showToast("Toprak seçildi — çimene tıkla");
        });
        soilEl.appendChild(btn);
      });
    }

    seedsEl.innerHTML = "";
    CROP_TYPES.forEach((crop, i) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "farm-item" + (state.seedIndex === i ? " selected" : "");
      btn.dataset.id = crop.id;
      const cv = document.createElement("canvas");
      cv.width = 28; cv.height = 28;
      drawIconToCanvas(cv, (c) => {
        const img = images[`crop_${crop.id}_5`] || images.seeds;
        if (img) c.drawImage(img, 4, 4, 20, 20);
      });
      const meta = document.createElement("div");
      meta.className = "meta";
      meta.innerHTML = `<span class="name">${crop.name}</span><span class="qty">x${state.seeds[crop.id] || 0} · $${crop.seedCost}/${crop.pack} · büyüme ${fmtDur(crop.grow)}</span>`;
      const buy = document.createElement("button");
      buy.type = "button";
      buy.className = "buy";
      buy.textContent = `Al $${crop.seedCost}`;
      buy.disabled = state.money < crop.seedCost;
      buy.addEventListener("click", (e) => {
        e.stopPropagation();
        buySeeds(crop.id, e.currentTarget);
      });
      btn.appendChild(cv);
      btn.appendChild(meta);
      btn.appendChild(buy);
      btn.addEventListener("click", () => {
        state.seedIndex = i;
        setTool("hoe");
        showToast(`${crop.name} tohumu seçildi`);
        renderFarmPanel();
      });
      seedsEl.appendChild(btn);
    });

    feedEl.innerHTML = "";
    FEED_TYPES.forEach((feed, i) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "farm-item" + (state.feedIndex === i ? " selected" : "");
      btn.dataset.id = feed.id;
      const cv = document.createElement("canvas");
      cv.width = 28; cv.height = 28;
      drawIconToCanvas(cv, (c) => {
        const img = feedIconImg(feed);
        if (img) c.drawImage(img, 4, 4, 20, 20);
      });
      const meta = document.createElement("div");
      meta.className = "meta";
      meta.innerHTML = `<span class="name">${feed.name}</span><span class="qty">x${state.feed[feed.id] || 0} · $${feed.cost}/${feed.pack} · tokluk ${fmtDur(feed.hold)}</span>`;
      const buy = document.createElement("button");
      buy.type = "button";
      buy.className = "buy";
      buy.textContent = `Al $${feed.cost}`;
      buy.disabled = state.money < feed.cost;
      buy.addEventListener("click", (e) => {
        e.stopPropagation();
        buyFeed(feed.id, e.currentTarget);
      });
      btn.appendChild(cv);
      btn.appendChild(meta);
      btn.appendChild(buy);
      btn.addEventListener("click", () => {
        state.feedIndex = i;
        setTool("feed");
        showToast(`${feed.name} seçildi`);
        renderFarmPanel();
      });
      feedEl.appendChild(btn);
    });

    cropsEl.innerHTML = "";
    const owned = CROP_TYPES.filter((c) => (state.inventory[c.id] || 0) > 0)
      .slice()
      .sort((a, b) => a.sell - b.sell);
    const goodsOwned = Object.keys(GOODS).filter((id) => (state.goods?.[id] || 0) > 0);

    if (!owned.length && !goodsOwned.length) {
      const empty = document.createElement("p");
      empty.className = "farm-hint";
      empty.textContent = "Henüz ürün yok. Hasat et, hayvan besle veya kes (tavuk eti vb.).";
      cropsEl.appendChild(empty);
    }

    goodsOwned.forEach((id) => {
      const g = GOODS[id];
      const qty = state.goods[id] || 0;
      const row = document.createElement("button");
      row.type = "button";
      row.className = "farm-item";
      const cv = document.createElement("canvas");
      cv.width = 28; cv.height = 28;
      drawIconToCanvas(cv, (c) => {
        if (g.draw === "egg" && images.egg) c.drawImage(images.egg, 4, 4, 20, 20);
        else if (g.draw === "milk" && images.milk) c.drawImage(images.milk, 4, 4, 20, 20);
        else {
          c.fillStyle = g.color || "#e85d4c";
          c.fillRect(6, 8, 16, 12);
          c.fillStyle = "#fff6e855";
          c.fillRect(8, 10, 12, 4);
        }
      });
      const meta = document.createElement("div");
      meta.className = "meta";
      meta.innerHTML = `<span class="name">${g.name}</span><span class="qty">x${qty} · sat $${g.sell}</span>`;
      const sell = document.createElement("button");
      sell.type = "button";
      sell.className = "buy";
      sell.textContent = "Sat";
      sell.addEventListener("click", (e) => {
        e.stopPropagation();
        sellGood(id);
      });
      row.appendChild(cv);
      row.appendChild(meta);
      row.appendChild(sell);
      cropsEl.appendChild(row);
    });

    owned.forEach((crop) => {
      const row = document.createElement("button");
      row.type = "button";
      row.className = "farm-item";
      const cv = document.createElement("canvas");
      cv.width = 28; cv.height = 28;
      drawIconToCanvas(cv, (c) => {
        const img = images[`crop_${crop.id}_5`];
        if (img) c.drawImage(img, 4, 4, 20, 20);
      });
      const meta = document.createElement("div");
      meta.className = "meta";
      meta.innerHTML = `<span class="name">${crop.name}</span><span class="qty">x${state.inventory[crop.id]} · sat $${crop.sell} · büyüdü ${fmtDur(crop.grow)}</span>`;
      const sell = document.createElement("button");
      sell.type = "button";
      sell.className = "buy";
      sell.textContent = "Sat";
      sell.addEventListener("click", (e) => {
        e.stopPropagation();
        sellCrop(crop.id);
      });
      row.appendChild(cv);
      row.appendChild(meta);
      row.appendChild(sell);
      row.addEventListener("click", () => {
        state.selectedCropFeed = crop.id;
        setTool("feed");
        showToast(`${crop.name} ile besle (F)`);
      });
      cropsEl.appendChild(row);
    });

    document.querySelectorAll(".farm-tab").forEach((t) => {
      t.classList.toggle("active", t.dataset.tab === state.panelTab);
    });
    // Sekmeler birbirine karışmasın — sadece aktif sekme görünsün
    const show = (el, on) => {
      if (!el) return;
      el.classList.toggle("hidden", !on);
      el.style.display = on ? "grid" : "none";
    };
    show(soilEl, state.panelTab === "soil");
    show(seedsEl, state.panelTab === "seeds");
    show(feedEl, state.panelTab === "feed");
    show(cropsEl, state.panelTab === "crops");

    const hint = $("farm-hint");
    if (hint) {
      const hints = {
        soil: "Toprak al → çimene tıkla ve koy",
        seeds: "Tohum al → tarlaya Ek ile ek",
        feed: "Yem al → hayvanı Besle ile doyur",
        crops: "Hasat sat · yumurta/süt/yün/et · Hasat aracıyla hayvan kes/sat",
      };
      hint.textContent = hints[state.panelTab] || "Marketten ürün seç";
    }
  }

  function buySeeds(cropId, anchor) {
    const crop = CROP_TYPES.find((c) => c.id === cropId);
    if (!crop) return;
    if (state.money < crop.seedCost) {
      showToast("Para yetmez — daha ucuz tohum dene");
      return;
    }
    state.money -= crop.seedCost;
    state.seeds[crop.id] = (state.seeds[crop.id] || 0) + crop.pack;
    state.seedIndex = CROP_TYPES.findIndex((c) => c.id === cropId);
    buyNotice(
      `+${crop.pack} ${crop.name} tohum`,
      `Büyüme süresi ${fmtDur(crop.grow)} · −$${crop.seedCost}`
    );
    playBuyFx(anchor, `+${crop.pack}`, "#a8d96a", `#tab-seeds .farm-item[data-id="${crop.id}"]`);
    updateHud();
    markSave();
  }

  function buyFeed(feedId, anchor) {
    const feed = FEED_TYPES.find((f) => f.id === feedId);
    if (!feed) return;
    if (state.money < feed.cost) {
      showToast("Para yetmez — daha ucuz yem dene");
      return;
    }
    state.money -= feed.cost;
    state.feed[feed.id] = (state.feed[feed.id] || 0) + feed.pack;
    state.feedIndex = FEED_TYPES.findIndex((f) => f.id === feedId);
    buyNotice(
      `+${feed.pack} ${feed.name}`,
      `Tokluk süresi ${fmtDur(feed.hold)} · −$${feed.cost}`
    );
    playBuyFx(anchor, `+${feed.pack}`, "#f0c36a", `#tab-feed .farm-item[data-id="${feed.id}"]`);
    updateHud();
    markSave();
  }

  function buySoil(packId, anchor) {
    const pack = SOIL_PACKS.find((p) => p.id === packId);
    if (!pack) return;
    if (state.money < pack.cost) {
      showToast("Para yetmez — daha küçük paket dene");
      return;
    }
    state.money -= pack.cost;
    state.soil = (state.soil || 0) + pack.pack;
    setTool("soil");
    buyNotice(`+${pack.pack} toprak`, `Toplam x${state.soil} · −$${pack.cost}`);
    playBuyFx(anchor, `+${pack.pack}`, "#c4a882", `#tab-soil .farm-item[data-id="${pack.id}"]`);
    updateHud();
    markSave();
  }

  function sellCrop(cropId) {
    const crop = CROP_TYPES.find((c) => c.id === cropId);
    const n = state.inventory[cropId] || 0;
    if (!crop || n <= 0) return;
    state.inventory[cropId]--;
    addMoney(crop.sell, state.player.x, state.player.y);
    addScore(Math.floor(crop.sell / 2), state.player.x, state.player.y - 8);
    showToast(`${crop.name} satıldı +$${crop.sell}`);
    updateHud();
  }

  function sellGood(id) {
    const g = GOODS[id];
    const n = state.goods?.[id] || 0;
    if (!g || n <= 0) return;
    state.goods[id]--;
    addMoney(g.sell, state.player?.x, state.player?.y);
    addScore(Math.floor(g.sell / 2), state.player?.x, state.player?.y - 8);
    showToast(`${g.name} satıldı +$${g.sell}`);
    updateHud();
  }

  /** Beslenince ürün → envanter (tüm hayvanlar) */
  function giveAnimalProduct(animal, reason) {
    const info = ANIMAL_INFO[animal.kind];
    if (!info) return null;
    addGood(info.product, 1);
    floatText(animal.x, animal.y - 14, info.productName, "#ffe7a0", 9);
    spawnAnimFX("glint", animal.x, animal.y - 4, 6, 12);
    return info;
  }

  function trySellAnimal(targetAnimal) {
    const p = state.player;
    const animal = targetAnimal || state.animals.find((a) => dist(p.x + 8, p.y + 8, a.x + a.w / 2, a.y + a.h / 2) < 30);
    if (!animal) { showToast("Hayvana tıkla (Hasat ile kes/sat)"); return false; }
    if (targetAnimal && !inReach(animal.x + animal.w / 2, animal.y + animal.h / 2)) {
      showToast("Daha yaklaş");
      return false;
    }
    const info = ANIMAL_INFO[animal.kind];
    if (!info) { showToast("Bu hayvan satılamaz"); return false; }
    const idx = state.animals.indexOf(animal);
    if (idx < 0) return false;
    state.animals.splice(idx, 1);
    addMoney(info.sell, animal.x, animal.y);
    addScore(Math.floor(info.sell / 2), animal.x, animal.y - 8);
    // kesimde et envantere
    const meatId = info.meat || info.product;
    const meatName = info.meatName || info.productName;
    const meatQty = info.meatQty || 1;
    addGood(meatId, meatQty);
    spawnBurst(animal.x + 8, animal.y, "#e85d4c", 18, 55);
    floatText(animal.x, animal.y - 10, `+$${info.sell}`, "#f0c36a");
    floatText(animal.x, animal.y - 20, `+${meatQty} ${meatName}`, "#d4784a", 8);
    showToast(`${info.label} kesildi +$${info.sell} · +${meatQty} ${meatName}`);
    faceToward(animal.x, animal.y);
    p.action = "doing";
    p.actionT = 0.4;
    updateHud();
    markSave();
    return true;
  }

  function setTool(tool) {
    state.tool = tool;
    document.querySelectorAll(".tool").forEach((el) => {
      el.classList.toggle("active", el.dataset.tool === tool);
    });
  }

  function addMoney(n, x, y) {
    state.money += n;
    state.progress.moneyEarned += Math.max(0, n);
    if (x != null) floatText(x, y, `+${n}`, "#f0c36a");
    updateHud();
    markSave();
  }

  function addScore(n, x, y) {
    state.score += n;
    if (x != null) floatText(x, y - 8, `+${n}`, "#a8d96a");
    updateHud();
    markSave();
  }

  function hurtPlayer(amount = 1) {
    const p = state.player;
    if (p.invuln > 0 || p.fx.shield > 0 || p.jumping) return;
    state.hearts = Math.max(0, state.hearts - amount);
    p.invuln = 1.4;
    p.action = "hurt";
    p.actionT = 0.45;
    spawnBurst(p.x + 8, p.y + 8, "#e85d4c", 16, 70);
    showToast("Can yandı!");
    updateHud();
    if (state.hearts <= 0) {
      state.mode = "dead";
      state.invOpen = false;
      state.panelOpen = false;
      syncPanelUi();
      showOverlay("Oyundun!", "Can bitti", "Çiftliğe yeniden başla.", "Tekrar Dene");
      clearSave();
    }
  }

  function applyPower(power, x, y) {
    const p = state.player;
    if (power === "speed") {
      p.fx.speed = 8;
      showToast("Hız artışı!");
      spawnBurst(x, y, "#4c8fe8", 18, 80);
    } else if (power === "shield") {
      p.fx.shield = 10;
      showToast("Kalkan!");
      spawnBurst(x, y, "#7ec8e8", 18, 80);
    } else if (power === "magnet") {
      p.fx.magnet = 9;
      showToast("Magnet!");
      spawnBurst(x, y, "#c45de8", 18, 80);
    }
    updateHud();
  }

  /* ---- farming ---- */
  const REACH = 88;

  function canvasToWorld(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const sx = (clientX - rect.left) * (VIEW_W / rect.width);
    const sy = (clientY - rect.top) * (VIEW_H / rect.height);
    return {
      x: sx / SCALE + state.camX,
      y: sy / SCALE + state.camY,
    };
  }

  function inReach(wx, wy) {
    const p = state.player;
    if (!p) return false;
    return dist(p.x + 8, p.y + 8, wx, wy) <= REACH;
  }

  function getPlotAtWorld(wx, wy) {
    const tx = (wx / TILE) | 0;
    const ty = (wy / TILE) | 0;
    const exact = state.plots.find((p) => p.tx === tx && p.ty === ty);
    if (exact) return exact;
    // nearest plot within ~half tile — fixes edge-click misses
    let best = null;
    let bestD = 12;
    for (const p of state.plots) {
      const d = dist(wx, wy, p.x + 8, p.y + 8);
      if (d < bestD) {
        bestD = d;
        best = p;
      }
    }
    return best;
  }

  function getAnimalAtWorld(wx, wy) {
    let best = null;
    let bestD = 22;
    for (const a of state.animals) {
      const d = dist(wx, wy, a.x + a.w / 2, a.y + a.h / 2);
      if (d < bestD) {
        bestD = d;
        best = a;
      }
    }
    return best;
  }

  function plotAt(px, py) {
    return getPlotAtWorld(px + 8, py + 10);
  }

  function tileBlockedByProp(tx, ty) {
    const cx = tx * TILE + 8;
    const cy = ty * TILE + 8;
    for (const p of state.props) {
      if (!p.solid) continue;
      if (cx > p.x + p.sx && cx < p.x + p.sx + p.sw && cy > p.y + p.sy && cy < p.y + p.sy + p.sh) return true;
    }
    return false;
  }

  /** Çimen / koyu çimen üzerine toprak koyulabilir mi */
  function canTillAt(tx, ty) {
    if (!state.map || !state.map.grid) return false;
    if (tx < 2 || ty < 2 || tx >= MW - 2 || ty >= MH - 2) return false;
    const cell = state.map.grid[ty][tx];
    if (cell !== "grass" && cell !== "dark") return false;
    if (tileBlockedByProp(tx, ty)) return false;
    if (state.plots.some((p) => p.tx === tx && p.ty === ty)) return false;
    return true;
  }

  /** Envanterdeki topraktan 1 harcayarak tarla yerleştir */
  function tillAt(tx, ty, silent) {
    if (!canTillAt(tx, ty)) {
      if (!silent) showToast("Buraya toprak konamaz");
      return null;
    }
    if (!inReach(tx * TILE + 8, ty * TILE + 8)) {
      if (!silent) showToast("Daha yaklaş");
      return null;
    }
    if ((state.soil || 0) <= 0) {
      if (!silent) {
        showToast("Toprak yok — marketten al");
        setPanelOpen(true);
        state.panelTab = "soil";
        renderFarmPanel();
      }
      return null;
    }
    state.soil--;
    state.map.grid[ty][tx] = "soil";
    const plot = makePlot(tx, ty);
    state.plots.push(plot);
    spawnBurst(plot.x + 8, plot.y + 8, "#a67c42", 10, 40);
    spawnAnimFX("dust", plot.x, plot.y + 6);
    floatText(plot.x + 2, plot.y - 2, "-1 toprak", "#c4a882", 8);
    if (!silent) buyNotice("Toprak kondu", `Kalan x${state.soil}`);
    updateHud();
    markSave();
    return plot;
  }

  function placeSoilAtWorld(wx, wy) {
    return tillAt((wx / TILE) | 0, (wy / TILE) | 0, false);
  }

  function faceToward(wx, wy) {
    const p = state.player;
    if (!p) return;
    p.facing = wx >= p.x + 8 ? 1 : -1;
    const dx = wx - (p.x + 8);
    const dy = wy - (p.y + 8);
    if (Math.abs(dx) >= Math.abs(dy)) p.dir = dx >= 0 ? "right" : "left";
    else p.dir = dy >= 0 ? "down" : "up";
  }

  function tryPlant(targetPlot) {
    const p = state.player;
    const plot = targetPlot || plotAt(p.x, p.y);
    if (!plot) { showToast("Tarlaya tıkla / yaklaş"); return false; }
    if (targetPlot && !inReach(plot.x + 8, plot.y + 8)) {
      showToast("Daha yaklaş");
      return false;
    }
    if (plot.crop) { showToast("Burada ürün var"); return false; }
    const crop = CROP_TYPES[state.seedIndex];
    if ((state.seeds[crop.id] || 0) <= 0) {
      showToast("Tohum yok — marketten al (I)");
      setPanelOpen(true);
      state.panelTab = "seeds";
      renderFarmPanel();
      return false;
    }
    state.seeds[crop.id]--;
    plot.crop = crop.id;
    plot.stage = 0;
    plot.grow = 0;
    plot.watered = false;
    plot.ready = false;
    plot.seedFlash = 0.6;
    faceToward(plot.x + 8, plot.y + 8);
    p.action = "dig";
    p.actionT = 0.55;
    spawnBurst(plot.x + 8, plot.y + 8, "#a67c42", 12, 45);
    spawnAnimFX("dust", plot.x, plot.y + 8);
    floatText(plot.x + 2, plot.y - 4, `-${crop.name}`, "#a8d96a");
    showToast(`${crop.name} ekildi · ${fmtDur(crop.grow)} · şimdi sula`);
    updateHud();
    markSave();
    return true;
  }

  function tryWater(targetPlot) {
    const p = state.player;
    const plot = targetPlot || plotAt(p.x, p.y);
    if (!plot) { showToast("Sulamak için tarlaya tıkla"); return false; }
    if (!plot.crop) { showToast("Önce tohum ek"); return false; }
    if (targetPlot && !inReach(plot.x + 8, plot.y + 8)) {
      showToast("Daha yaklaş");
      return false;
    }
    if (plot.ready) { showToast("Hazır — hasat et!"); return false; }
    if (plot.watered) {
      tinyToast("Zaten sulu");
      return true;
    }
    plot.watered = true;
    plot.waterFlash = 0.7;
    faceToward(plot.x + 8, plot.y + 8);
    p.action = "water";
    p.actionT = 0.5;
    spawnBurst(plot.x + 8, plot.y + 4, "#4c8fe8", 18, 40);
    for (let i = 0; i < 8; i++) {
      state.particles.push({
        x: plot.x + 8, y: plot.y + 4,
        vx: rand(-20, 20), vy: rand(-40, -10),
        life: rand(0.3, 0.7), color: "#7ec8e8", size: rand(2, 3), gravity: 60,
      });
    }
    floatText(plot.x + 2, plot.y - 2, "Su!", "#7ec8e8", 9);
    tinyToast("Sulandı");
    return true;
  }

  function spawnHarvestFX(plot, cropId) {
    const imgKey = `crop_${cropId}_5`;
    state.harvestFX.push({
      x: plot.x + 8,
      y: plot.y + 8,
      vy: -70,
      life: 0.85,
      imgKey,
      spin: 0,
    });
    spawnBurst(plot.x + 8, plot.y + 4, "#ffe7a0", 22, 70);
    spawnBurst(plot.x + 8, plot.y + 4, "#a8d96a", 14, 50);
    spawnAnimFX("glint", plot.x, plot.y - 4, 6, 14);
    spawnAnimFX("dust", plot.x + 2, plot.y + 10, 8, 16);
  }

  function tryHarvest(targetPlot) {
    const p = state.player;
    const plot = targetPlot || plotAt(p.x, p.y);
    if (!plot || !plot.crop) { showToast("Hasat edilecek ürüne tıkla"); return false; }
    if (targetPlot && !inReach(plot.x + 8, plot.y + 8)) {
      showToast("Daha yaklaş");
      return false;
    }
    if (!plot.ready) { showToast(plot.watered ? "Henüz olgun değil" : "Önce sula!"); return false; }
    const crop = CROP_TYPES.find((c) => c.id === plot.crop);
    state.inventory[crop.id] = (state.inventory[crop.id] || 0) + 1;
    state.progress.harvest++;
    addScore(crop.sell, plot.x, plot.y);
    addMoney(Math.floor(crop.sell * 0.5), plot.x, plot.y - 10);
    spawnHarvestFX(plot, crop.id);
    faceToward(plot.x + 8, plot.y + 8);
    p.action = "doing";
    p.actionT = 0.4;
    plot.crop = null;
    plot.stage = 0;
    plot.grow = 0;
    plot.watered = false;
    plot.ready = false;
    showToast(`${crop.name} hasat!`);
    updateHud();
    checkComplete();
    markSave();
    return true;
  }

  function tryFeed(targetAnimal) {
    const p = state.player;
    const animal = targetAnimal || state.animals.find((a) => dist(p.x + 8, p.y + 8, a.x + a.w / 2, a.y + a.h / 2) < 30);
    if (!animal) { showToast("Hayvana tıkla / yaklaş"); return false; }
    if (targetAnimal && !inReach(animal.x + animal.w / 2, animal.y + animal.h / 2)) {
      showToast("Daha yaklaş");
      return false;
    }

    let usedLabel = "";
    let holdSec = 90;
    let scoreGain = 15;

    const feed = FEED_TYPES[state.feedIndex];
    if (feed && (state.feed[feed.id] || 0) > 0) {
      state.feed[feed.id]--;
      holdSec = feed.hold;
      scoreGain = feed.score;
      usedLabel = feed.name;
    } else if (state.selectedCropFeed && (state.inventory[state.selectedCropFeed] || 0) > 0) {
      const crop = CROP_TYPES.find((c) => c.id === state.selectedCropFeed);
      state.inventory[state.selectedCropFeed]--;
      holdSec = Math.min(900, 60 + crop.feed * 12);
      scoreGain = crop.feed + 10;
      usedLabel = crop.name;
    } else {
      const held = Object.entries(state.inventory).find(([, n]) => n > 0);
      if (held) {
        const crop = CROP_TYPES.find((c) => c.id === held[0]);
        state.inventory[held[0]]--;
        holdSec = Math.min(900, 50 + crop.feed * 10);
        scoreGain = crop.feed + 8;
        usedLabel = crop.name;
      } else {
        showToast("Yem yok — marketten al (B / I)");
        setPanelOpen(true);
        state.panelTab = "feed";
        renderFarmPanel();
        return false;
      }
    }

    animal.hunger = 1;
    animal.hungerDrain = 1 / Math.max(20, holdSec);
    animal.fedLeft = holdSec;
    animal.happy = 2.5;
    animal.produceT = rand(4, 8); // yakında tekrar ürün
    state.progress.feed++;
    addScore(scoreGain, animal.x, animal.y);
    addMoney(Math.floor(scoreGain * 0.4), animal.x, animal.y - 10);
    spawnBurst(animal.x + 8, animal.y, "#ff7eb9", 16, 50);
    floatText(animal.x, animal.y - 12, "♥", "#ff7eb9");
    const produced = giveAnimalProduct(animal, "feed");
    faceToward(animal.x + animal.w / 2, animal.y + animal.h / 2);
    p.action = "doing";
    p.actionT = 0.35;
    const info = ANIMAL_INFO[animal.kind];
    const label = info ? info.label : animal.kind;
    const prodMsg = produced ? ` · +1 ${produced.productName}` : "";
    showToast(`${label} beslendi · ${usedLabel} · ${fmtDur(holdSec)} tok${prodMsg}`);
    updateHud();
    checkComplete();
    markSave();
    return true;
  }

  function tryInteractAt(wx, wy) {
    for (const c of state.chests) {
      if (!c.open && dist(wx, wy, c.x + 8, c.y + 8) < 16) {
        if (!inReach(c.x + 8, c.y + 8)) { showToast("Daha yaklaş"); return; }
        c.open = true;
        addMoney(c.reward, c.x, c.y);
        addScore(c.reward, c.x, c.y - 8);
        spawnBurst(c.x + 8, c.y, "#f0c36a", 20, 70);
        spawnAnimFX("glint", c.x, c.y - 4);
        showToast(`Sandık! +${c.reward}`);
        return;
      }
    }
    const animal = getAnimalAtWorld(wx, wy);
    if (animal) { tryFeed(animal); return; }
    const plot = getPlotAtWorld(wx, wy);
    if (plot) {
      if (plot.ready) tryHarvest(plot);
      else if (plot.crop && !plot.watered) tryWater(plot);
      else if (plot.crop && plot.watered) {
        const crop = CROP_TYPES.find((c) => c.id === plot.crop);
        const left = crop ? Math.max(0, crop.grow - plot.grow) : 0;
        showToast(plot.ready ? "Hasat et!" : `Büyüyor… ${fmtDur(left)} kaldı`);
      }
      else tryPlant(plot);
      return;
    }
    if (canTillAt((wx / TILE) | 0, (wy / TILE) | 0)) {
      placeSoilAtWorld(wx, wy);
      return;
    }
    showToast("Toprak koy / tarlaya / hayvana tıkla");
  }

  function handleWorldClick(wx, wy) {
    if (state.mode !== "play" || !state.player) return;
    const tool = state.tool;
    const plot = getPlotAtWorld(wx, wy);
    const animal = getAnimalAtWorld(wx, wy);

    if (tool === "soil") {
      if (plot) showToast("Burası zaten tarla · Ek ile tohum ek");
      else placeSoilAtWorld(wx, wy);
      return;
    }
    if (tool === "hoe") {
      if (plot) {
        if (!plot.crop) tryPlant(plot);
        else if (!plot.watered) tryWater(plot);
        else if (plot.ready) tryHarvest(plot);
        else {
          const crop = CROP_TYPES.find((c) => c.id === plot.crop);
          const left = crop ? Math.max(0, crop.grow - plot.grow) : 0;
          showToast(`Büyüyor… ${fmtDur(left)} kaldı`);
        }
      } else showToast("Önce toprak koy (Toprak / 4)");
      return;
    }
    if (tool === "water") {
      if (plot) tryWater(plot);
      else showToast("Ekili tarlaya tıkla");
      return;
    }
    if (tool === "harvest") {
      if (animal) trySellAnimal(animal);
      else if (plot) tryHarvest(plot);
      else showToast("Olgun ürüne veya hayvana tıkla (kes/sat)");
      return;
    }
    if (tool === "feed") {
      if (animal) tryFeed(animal);
      else showToast("Hayvana tıkla");
      return;
    }
    tryInteractAt(wx, wy);
  }

  function tryInteract() {
    const p = state.player;
    tryInteractAt(p.x + 8, p.y + 8);
  }

  /* ---- update ---- */
  function updatePlayer(dt) {
    const p = state.player;
    if (p.action) {
      p.actionT -= dt;
      if (p.actionT <= 0) p.action = null;
    }

    // effects
    if (p.fx.speed > 0) p.fx.speed -= dt;
    if (p.fx.shield > 0) p.fx.shield -= dt;
    if (p.fx.magnet > 0) p.fx.magnet -= dt;
    if (p.invuln > 0) p.invuln -= dt;
    if (p.slowT > 0) {
      p.slowT -= dt;
      if (p.slowT <= 0) p.baseSpeed = 70;
    }

    let dx = 0, dy = 0;
    if (keys["ArrowLeft"] || keys.a || keys.A) dx -= 1;
    if (keys["ArrowRight"] || keys.d || keys.D) dx += 1;
    if (keys["ArrowUp"] || keys.w || keys.W) dy -= 1;
    if (keys["ArrowDown"] || keys.s || keys.S) dy += 1;
    if (dx && dy) { dx *= 0.707; dy *= 0.707; }

    p.running = !!(keys.Shift || keys.ShiftLeft || keys.ShiftRight);
    const spdMult = (p.running ? 1.55 : 1) * (p.fx.speed > 0 ? 1.45 : 1);
    p.moving = !!(dx || dy) && !p.action;

    if (p.moving) {
      if (Math.abs(dx) >= Math.abs(dy)) {
        p.dir = dx > 0 ? "right" : "left";
        p.facing = dx > 0 ? 1 : -1;
      } else p.dir = dy > 0 ? "down" : "up";
      p.anim += dt * (p.running ? 14 : 10);
      p.frame = p.anim | 0;
      p.dustT -= dt;
      if (p.dustT <= 0) {
        p.dustT = p.running ? 0.08 : 0.16;
        spawnAnimFX(p.running ? "dustRun" : "dust", p.x + 4, p.y + 14, p.running ? 8 : 8, 16);
      }
    } else {
      p.frame = 0;
      p.anim = 0;
    }

    // jump
    if (p.jumping) {
      p.vz += 520 * dt;
      p.z += p.vz * dt;
      if (p.z >= 0) {
        p.z = 0;
        p.vz = 0;
        p.jumping = false;
        spawnAnimFX("dustLand", p.x + 2, p.y + 12, 6, 14);
        spawnBurst(p.x + 8, p.y + 14, "#c4a882", 8, 30);
      }
    }

    if (!p.action) {
      const nx = p.x + dx * p.baseSpeed * spdMult * dt;
      const ny = p.y + dy * p.baseSpeed * spdMult * dt;
      if (!solidAt(nx, p.y)) p.x = nx;
      if (!solidAt(p.x, ny)) p.y = ny;
    }
    p.x = clamp(p.x, TILE, WORLD_W - TILE * 2);
    p.y = clamp(p.y, TILE, WORLD_H - TILE * 2);

    // magnet collect
    const magR = p.fx.magnet > 0 ? 70 : 16;
    collectNear(p, magR);
  }

  function collectNear(p, radius) {
    const px = p.x + 8, py = p.y + 8;
    for (const c of state.collectibles) {
      if (c.taken) continue;
      if (dist(px, py, c.x + 4, c.y + 4) < radius) {
        c.taken = true;
        state.progress.collect++;
        if (c.power) applyPower(c.power, c.x, c.y);
        else {
          addMoney(c.value, c.x, c.y);
          addScore(c.value, c.x, c.y - 6);
        }
        spawnBurst(c.x, c.y, "#ffe7a0", 12, 50);
        spawnAnimFX("glint", c.x - 2, c.y - 4);
        checkComplete();
      }
    }
    for (const b of state.butterflies) {
      if (b.taken) continue;
      if (dist(px, py, b.x, b.y) < radius + 4) {
        b.taken = true;
        state.progress.collect++;
        addMoney(15, b.x, b.y);
        addScore(25, b.x, b.y - 8);
        spawnBurst(b.x, b.y, b.color, 16, 60);
        showToast("Kelebek!");
        checkComplete();
      }
    }
    for (const b of state.balloons) {
      if (b.collected) continue;
      const by = b.baseY + Math.sin(state.time * 2 + b.phase) * 6;
      if (dist(px, py, b.x, by) < 18) {
        b.collected = true;
        b.pop = 0.35;
        state.progress.collect++;
        addMoney(8, b.x, by);
        addScore(20, b.x, by);
        spawnBurst(b.x, by, b.color, 14, 55);
        checkComplete();
      }
    }
  }

  function updatePlots(dt) {
    for (const plot of state.plots) {
      if (plot.seedFlash > 0) plot.seedFlash -= dt;
      if (plot.waterFlash > 0) plot.waterFlash -= dt;
      if (!plot.crop || plot.ready) continue;
      const crop = CROP_TYPES.find((c) => c.id === plot.crop);
      // Without water: stuck as seed. With water: grow through stages.
      if (!plot.watered) {
        plot.stage = 0;
        continue;
      }
      plot.grow += dt;
      const stage = Math.min(5, 1 + Math.floor((plot.grow / crop.grow) * 5));
      if (stage !== plot.stage) {
        plot.stage = stage;
        spawnAnimFX("glint", plot.x + 2, plot.y, 4, 10);
        floatText(plot.x + 4, plot.y - 2, `Lv${stage}`, "#a8d96a");
      }
      if (plot.grow >= crop.grow) {
        plot.ready = true;
        plot.stage = 5;
        spawnBurst(plot.x + 8, plot.y + 4, "#a8d96a", 12, 40);
        floatText(plot.x, plot.y - 6, "Hasat!", "#ffe7a0");
      }
    }
  }

  function updateAnimals(dt) {
    for (const a of state.animals) {
      a.hunger = Math.max(0, a.hunger - dt * (a.hungerDrain || 0.02));
      if (a.fedLeft > 0) a.fedLeft = Math.max(0, a.fedLeft - dt);
      else a.fedLeft = animalFedLeft(a);
      if (a.happy > 0) a.happy -= dt;
      a.timer -= dt;
      a.produceT -= dt;
      // Tokken ürün → doğrudan envanter (tüm hayvanlar)
      if (a.produceT <= 0 && a.hunger > 0.45) {
        a.produceT = rand(14, 28);
        const info = giveAnimalProduct(a, "tick");
        if (!info) {
          state.collectibles.push(makeCollectible("coin", a.x + 4, a.y + 16, { value: 10 }));
        }
      }
      if (a.timer <= 0) {
        a.dir = choice([-1, 1, 0, 0]);
        a.timer = rand(0.8, 2.5);
      }
      if (a.dir !== 0) {
        a.anim += dt * 5;
        a.frame = a.anim | 0;
        const nx = a.x + a.dir * a.speed * dt * (0.5 + a.hunger);
        let ok = !solidAt(nx, a.y, a.w, a.h);
        if (a.bound) ok = ok && nx >= a.bound.x && nx + a.w <= a.bound.x + a.bound.w;
        if (ok) a.x = nx;
        else a.timer = 0;
      }
    }
  }

  function updateTraps(dt) {
    const p = state.player;
    for (const t of state.traps) {
      t.anim += dt * 8;
      t.frame = t.anim | 0;
      t.cool = Math.max(0, t.cool - dt);
      const hit = dist(p.x + 8, p.y + 8, t.x + 8, t.y + 8) < (t.type === "fire" ? 16 : 14);
      if (hit && t.cool <= 0) {
        t.cool = 1.2;
        if (t.type === "fire") {
          spawnBurst(t.x + 8, t.y + 4, "#ff6b35", 14, 55);
          floatText(t.x, t.y - 8, "Ateş!", "#ff6b35");
          hurtPlayer(1);
        } else {
          spawnBurst(t.x + 8, t.y + 4, "#888", 10, 40);
          p.baseSpeed = 40;
          p.slowT = 1.5;
          floatText(t.x, t.y - 8, "Tuzak!", "#ccc");
          hurtPlayer(1);
        }
      }
    }
  }

  function updateButterflies(dt) {
    for (const b of state.butterflies) {
      if (b.taken) continue;
      b.flap += dt * 10;
      const dx = b.tx - b.x;
      const dy = b.ty - b.y;
      b.x += dx * dt * 0.8 + Math.sin(state.time * 3 + b.phase) * 8 * dt;
      b.y += dy * dt * 0.8 + Math.cos(state.time * 2.5 + b.phase) * 6 * dt;
      if (Math.hypot(dx, dy) < 8) {
        b.tx = clamp(b.x + rand(-50, 50), 32, WORLD_W - 32);
        b.ty = clamp(b.y + rand(-40, 40), 32, WORLD_H - 32);
      }
    }
  }

  function updateParallax(dt) {
    for (const c of state.clouds) {
      c.x += c.speed * dt;
      if (c.x > WORLD_W + 60) c.x = -c.w;
    }
    for (const b of state.birds) {
      b.x += b.dir * b.speed * dt;
      b.anim += dt * 8;
      b.frame = b.anim | 0;
      if (b.x < -40) { b.x = WORLD_W + 20; b.y = rand(20, 110); }
      if (b.x > WORLD_W + 40) { b.x = -20; b.y = rand(20, 110); }
    }
  }

  function updateFX(dt) {
    for (const p of state.particles) {
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += (p.gravity || 80) * dt;
    }
    state.particles = state.particles.filter((p) => p.life > 0);

    for (const fx of state.animFX) {
      fx.t += dt;
      fx.frame = Math.min(fx.frames - 1, (fx.t * fx.fps) | 0);
      fx.life -= dt;
    }
    state.animFX = state.animFX.filter((f) => f.life > 0);

    for (const f of state.floatTexts) {
      f.life -= dt;
      f.y += f.vy * dt;
    }
    state.floatTexts = state.floatTexts.filter((f) => f.life > 0);

    for (const h of state.harvestFX) {
      h.life -= dt;
      h.y += h.vy * dt;
      h.vy += 40 * dt;
      h.spin += dt * 8;
    }
    state.harvestFX = state.harvestFX.filter((h) => h.life > 0);

    for (const b of state.balloons) if (b.pop > 0) b.pop -= dt;
  }

  function updateCamera() {
    const p = state.player;
    const viewW = VIEW_W / SCALE;
    const viewH = VIEW_H / SCALE;
    // Envanter / toolbar altı kapladığı için kamerayı yukarı kaydır — harita altı görünsün
    const uiCover = state.invOpen ? 95 : 48;
    const targetX = p.x + 8 - viewW / 2;
    const targetY = p.y + 8 - (viewH - uiCover) * 0.45;
    const maxX = Math.max(0, WORLD_W - viewW);
    const maxY = Math.max(0, WORLD_H - viewH + uiCover);
    state.camX += (clamp(targetX, 0, maxX) - state.camX) * 0.12;
    state.camY += (clamp(targetY, 0, maxY) - state.camY) * 0.12;
  }

  /* ---- draw ---- */
  function drawParallaxBack() {
    // sky gradient strip at top of world cam
    for (const c of state.clouds) {
      if (c.layer !== 0) continue;
      const px = c.x - state.camX * 0.35;
      const py = c.y - state.camY * 0.15;
      ctx.fillStyle = "rgba(255,255,255,0.55)";
      ctx.beginPath();
      ctx.ellipse(px, py, c.w * 0.5, c.w * 0.18, 0, 0, Math.PI * 2);
      ctx.ellipse(px + c.w * 0.25, py + 2, c.w * 0.35, c.w * 0.14, 0, 0, Math.PI * 2);
      ctx.ellipse(px - c.w * 0.2, py + 3, c.w * 0.3, c.w * 0.12, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawParallaxMid() {
    for (const c of state.clouds) {
      if (c.layer !== 1) continue;
      const px = c.x - state.camX * 0.55;
      const py = c.y - state.camY * 0.25;
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      ctx.beginPath();
      ctx.ellipse(px, py, c.w * 0.45, c.w * 0.16, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    for (const b of state.birds) {
      const px = b.x - state.camX * 0.6;
      const py = b.y - state.camY * 0.3;
      const fr = b.frame % 4;
      drawSprite(images.ssBird, fr * 16, 0, 16, 16, px, py, 14, 14, b.dir < 0);
    }
  }

  function drawGround() {
    const g = state.map.grid;
    const camTX = (state.camX / TILE) | 0;
    const camTY = (state.camY / TILE) | 0;
    const tilesX = ((VIEW_W / SCALE) / TILE | 0) + 3;
    const tilesY = ((VIEW_H / SCALE) / TILE | 0) + 3;
    for (let ty = camTY; ty < camTY + tilesY; ty++) {
      for (let tx = camTX; tx < camTX + tilesX; tx++) {
        if (ty < 0 || tx < 0 || ty >= MH || tx >= MW) continue;
        const cell = g[ty][tx];
        const dx = tx * TILE, dy = ty * TILE;
        const v = (tx * 7 + ty * 13) & 1;
        if (cell === "cliff") {
          ctx.fillStyle = "#2a1a10";
          ctx.fillRect(dx, dy, TILE, TILE);
          drawWorldTile(10, 4, dx, dy);
        } else if (cell === "path") {
          ctx.fillStyle = v ? "#de9c51" : "#ee9d51";
          ctx.fillRect(dx, dy, TILE, TILE);
          drawWorldTile(v ? 1 : 3, v ? 7 : 1, dx, dy);
        } else if (cell === "soil") {
          ctx.fillStyle = "#8b5a2b";
          ctx.fillRect(dx, dy, TILE, TILE);
          ctx.fillStyle = "#6b4423";
          ctx.fillRect(dx + 1, dy + 1, TILE - 2, TILE - 2);
          drawWorldTile(v ? 10 : 11, 4, dx, dy);
          ctx.globalAlpha = 0.35;
          ctx.fillStyle = "#5a3818";
          ctx.fillRect(dx + 2, dy + 2, TILE - 4, TILE - 4);
          ctx.globalAlpha = 1;
        } else if (cell === "dark" || cell === "edge") {
          ctx.fillStyle = v ? "#5ca14f" : "#53994d";
          ctx.fillRect(dx, dy, TILE, TILE);
          drawWorldTile(v ? 0 : 1, 3, dx, dy);
        } else {
          ctx.fillStyle = v ? "#6eb453" : "#71b754";
          ctx.fillRect(dx, dy, TILE, TILE);
          drawWorldTile(v ? 1 : 2, v ? 1 : 2, dx, dy);
        }
      }
    }
  }

  function drawPlot(plot) {
    // soil tile highlight
    if (plot.crop || true) {
      ctx.fillStyle = plot.watered ? "rgba(76,143,232,0.18)" : "rgba(139,90,43,0.15)";
      if (plot.crop) ctx.fillRect(plot.x + 1, plot.y + 1, 14, 14);
    }

    if (!plot.crop) {
      ctx.globalAlpha = 0.22;
      ctx.strokeStyle = "#fff";
      ctx.strokeRect(plot.x + 2, plot.y + 2, 12, 12);
      ctx.globalAlpha = 1;
      return;
    }

    // Stage 0 = buried seed (then disappears into sprout after watering)
    if (plot.stage === 0) {
      const bob = plot.seedFlash > 0 ? Math.sin(state.time * 20) * 1.5 : 0;
      const seedImg = images.seeds;
      if (seedImg) {
        ctx.globalAlpha = plot.seedFlash > 0 ? 1 : 0.85;
        ctx.drawImage(seedImg, plot.x + 3, plot.y + 5 + bob, 10, 9);
        ctx.globalAlpha = 1;
      } else {
        ctx.fillStyle = "#c4a882";
        ctx.fillRect(plot.x + 5, plot.y + 8, 6, 4);
      }
      if (!plot.watered) {
        ctx.globalAlpha = 0.55 + Math.sin(state.time * 4) * 0.25;
        ctx.fillStyle = "#7ec8e8";
        ctx.beginPath();
        ctx.arc(plot.x + 12, plot.y + 3, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    } else {
      const key = `crop_${plot.crop}_${plot.stage}`;
      const img = images[key];
      if (img) {
        // tarla karesine (16x16) sığdır; büyüme hafifçe artsın ama taşmasın
        const maxW = 14;
        const maxH = 14;
        const growT = 0.62 + (plot.stage / 5) * 0.38; // stage1≈%62 → stage5=%100
        const fit = Math.min(maxW / img.width, maxH / img.height) * growT;
        const dw = Math.max(6, img.width * fit);
        const dh = Math.max(6, img.height * fit);
        ctx.drawImage(img, plot.x + (16 - dw) / 2, plot.y + 15 - dh, dw, dh);
      }
    }

    if (plot.waterFlash > 0) {
      ctx.globalAlpha = plot.waterFlash;
      ctx.fillStyle = "rgba(100,180,255,0.35)";
      ctx.fillRect(plot.x, plot.y, 16, 16);
      ctx.globalAlpha = 1;
    } else if (plot.watered && !plot.ready) {
      ctx.fillStyle = "rgba(76,143,232,0.45)";
      ctx.fillRect(plot.x + 2, plot.y + 13, 12, 2);
    }

    if (plot.ready) {
      const pulse = 0.5 + Math.sin(state.time * 5) * 0.5;
      ctx.globalAlpha = 0.4 + pulse * 0.4;
      ctx.strokeStyle = "#ffe7a0";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(plot.x + 0.5, plot.y + 0.5, 15, 15);
      ctx.globalAlpha = 1;
    } else if (plot.watered && plot.crop) {
      const left = plotGrowLeft(plot);
      if (left > 0 && (state.hover.plot === plot || left < 30)) {
        ctx.font = "bold 6px Nunito, sans-serif";
        ctx.fillStyle = "#ffe7a0";
        ctx.textAlign = "center";
        ctx.fillText(fmtDur(left), plot.x + 8, plot.y - 1);
        ctx.textAlign = "left";
      }
    }

    // mouse hover outline
    if (state.hover.plot === plot) {
      const can = inReach(plot.x + 8, plot.y + 8);
      ctx.strokeStyle = can ? "#fff6e8" : "#e85d4c";
      ctx.globalAlpha = 0.85;
      ctx.lineWidth = 2;
      ctx.strokeRect(plot.x - 0.5, plot.y - 0.5, 17, 17);
      ctx.globalAlpha = 1;
      if (plot.crop && !plot.ready) {
        const crop = CROP_TYPES.find((c) => c.id === plot.crop);
        const left = plotGrowLeft(plot);
        const msg = !plot.watered ? "Sula!" : `Kalan ${fmtDur(left)} / ${fmtDur(crop.grow)}`;
        ctx.font = "bold 7px Nunito, sans-serif";
        ctx.fillStyle = "#fff6e8";
        ctx.textAlign = "center";
        ctx.fillText(msg, plot.x + 8, plot.y - 8);
        ctx.textAlign = "left";
      }
    }
  }

  function drawProp(p) {
    if (p.kind === "house") {
      const img = images.house;
      if (img) {
        const dw = 40;
        const dh = Math.round((img.height / img.width) * dw);
        ctx.drawImage(img, p.x + 4, p.y + 96 - dh - 8, dw, dh);
      }
      if (images.smoke) {
        const fr = ((state.time * 10) | 0) % 30;
        drawSprite(images.smoke, fr * (images.smoke.width / 30), 0, images.smoke.width / 30, images.smoke.height, p.x + 14, p.y + 20, 14, 18);
      }
    } else if (p.kind === "tree") {
      const fr = ((state.time * 4 + p.x) | 0) % 4;
      const fw = images.treeSS.width / 4;
      drawSprite(images.treeSS, fr * fw, 0, fw, images.treeSS.height, p.x - 4, p.y - 28, 32, 40);
    } else if (p.kind === "windmill") {
      const fr = ((state.time * 8) | 0) % 9;
      const fw = images.windmill.width / 9;
      drawSprite(images.windmill, fr * fw, 0, fw, images.windmill.height, p.x, p.y - 36, 48, 56);
    } else if (p.kind === "fenceH") {
      drawSprite(images.fence, 0, 0, 16, 16, p.x, p.y, 16, 12);
    } else if (p.kind === "fenceV") {
      drawSprite(images.fence, 0, 16, 16, 16, p.x, p.y - 4, 10, 18);
    }
  }

  function drawCollectible(c) {
    if (c.taken) return;
    const bob = Math.sin(state.time * 3 + c.phase) * 2;
    const y = c.baseY != null ? c.baseY + bob : c.y + bob;
    const x = c.x;
    if (c.type === "flower") drawImg(c.variant ? "flower2" : "flower1", x, y, 12, 16);
    else if (c.type === "coin") drawImg("coin", x, y, 10, 9);
    else if (c.type === "gold") drawImg("gold", x, y, 12, 12);
    else if (c.type === "mushroom") {
      const fw = images.mushroom.width / 4;
      drawSprite(images.mushroom, (((state.time * 4) | 0) % 4) * fw, 0, fw, images.mushroom.height, x - 2, y - 4, 16, 16);
    } else if (c.type === "acorn") drawImg("acorn", x, y, 10, 10);
    else if (c.type === "egg") drawImg("egg", x, y, 10, 11);
    else if (c.type === "milk") drawImg("milk", x, y, 10, 12);
    if (c.power) {
      ctx.globalAlpha = 0.5 + Math.sin(state.time * 6) * 0.3;
      ctx.strokeStyle = "#ffe7a0";
      ctx.beginPath();
      ctx.arc(x + 6, y + 6, 10, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }

  function drawButterfly(b) {
    if (b.taken) return;
    const flap = Math.sin(b.flap) * 0.6;
    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.fillStyle = b.color;
    ctx.beginPath();
    ctx.ellipse(-4, 0, 5, 3 + flap, -0.4, 0, Math.PI * 2);
    ctx.ellipse(4, 0, 5, 3 + flap, 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#1f1710";
    ctx.fillRect(-1, -3, 2, 6);
    ctx.restore();
  }

  function drawTrap(t) {
    if (t.type === "fire") {
      drawImg("campfire", t.x, t.y, 18, 16);
      const fr = t.frame % 4;
      drawSprite(images.fire, fr * 5, 0, 5, 10, t.x + 4, t.y - 6, 12, 14);
      // glow
      ctx.globalAlpha = 0.15 + Math.sin(state.time * 6 + t.pulse) * 0.08;
      ctx.fillStyle = "#ff6b35";
      ctx.beginPath();
      ctx.arc(t.x + 9, t.y + 6, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    } else {
      drawImg("rock", t.x + 2, t.y + 2, 12, 12);
      ctx.globalAlpha = 0.4;
      drawImg("uiAlert", t.x + 2, t.y - 10, 12, 12);
      ctx.globalAlpha = 1;
    }
  }

  function drawAnimal(a) {
    const map = {
      chicken: "ssChicken", cow: "ssCow", pig: "ssPig",
      sheep: "ssSheep", duck: "ssDuck",
    };
    const key = map[a.kind];
    const img = images[key];
    if (!img) return;
    const frames = 4;
    const fw = img.width / frames;
    const fh = img.height;
    const fr = a.frame % frames;
    const dw = a.kind === "cow" || a.kind === "pig" || a.kind === "sheep" ? 28 : 16;
    const dh = a.kind === "cow" || a.kind === "pig" || a.kind === "sheep" ? 28 : 16;
    // shadow
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    ctx.beginPath();
    ctx.ellipse(a.x + dw / 2, a.y + dh - 2, dw * 0.35, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    drawSprite(img, fr * fw, 0, fw, fh, a.x, a.y, dw, dh, a.dir < 0);
    if (a.happy > 0) drawImg("uiLove", a.x + dw / 2 - 6, a.y - 14, 12, 12);
    else if (a.hunger < 0.35) {
      drawImg("uiAlert", a.x + dw / 2 - 6, a.y - 14, 12, 12);
    }

    function drawSolidLabel(text, x, y, fill) {
      ctx.save();
      ctx.globalAlpha = 1;
      ctx.font = "bold 10px Nunito, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const w = Math.ceil(ctx.measureText(text).width) + 10;
      const h = 14;
      ctx.fillStyle = "rgba(15, 20, 12, 0.92)";
      ctx.strokeStyle = "#f4e2b0";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(x - w / 2, y - h / 2, w, h, 4);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = fill;
      ctx.shadowColor = "transparent";
      ctx.fillText(text, x, y + 0.5);
      ctx.restore();
    }

    if (state.hover.animal === a) {
      const can = inReach(a.x + a.w / 2, a.y + a.h / 2);
      ctx.strokeStyle = can ? "#ff7eb9" : "#e85d4c";
      ctx.globalAlpha = 1;
      ctx.lineWidth = 2;
      ctx.strokeRect(a.x - 2, a.y - 2, dw + 4, dh + 4);
      const info = ANIMAL_INFO[a.kind];
      const left = animalFedLeft(a);
      const cx = a.x + dw / 2;
      drawSolidLabel(info ? info.label : a.kind, cx, a.y - 36, "#fff6e8");
      drawSolidLabel(a.hunger < 0.35 ? "Aç!" : `Tok ${fmtDur(left)}`, cx, a.y - 22, a.hunger < 0.35 ? "#e85d4c" : "#a8d96a");
      if (info) {
        drawSolidLabel(`${info.productName} · Kes $${info.sell}`, cx, a.y - 8, "#f0c36a");
      }
    } else if (a.hunger > 0.45) {
      const left = animalFedLeft(a);
      if (left > 0 && left < 90) {
        drawSolidLabel(fmtDur(left), a.x + dw / 2, a.y - 8, "#a8d96a");
      }
    } else if (a.hunger < 0.35) {
      drawSolidLabel("Aç!", a.x + dw / 2, a.y - 8, "#e85d4c");
    }
  }

  function drawPlayer() {
    const p = state.player;
    const flip = p.facing < 0;
    let img = images.idle;
    let frames = 9;
    let showFrame = 0;

    if (p.action === "hurt") {
      img = images.hurt; frames = 8;
      showFrame = Math.min(frames - 1, ((0.45 - p.actionT) / 0.45) * frames | 0);
    } else if (p.action === "dig") {
      img = images.dig; frames = 13;
      showFrame = Math.min(frames - 1, ((0.55 - p.actionT) / 0.55) * frames | 0);
    } else if (p.action === "water") {
      img = images.waterAnim; frames = 5;
      showFrame = Math.min(frames - 1, ((0.5 - p.actionT) / 0.5) * frames | 0);
    } else if (p.action === "doing") {
      img = images.doing; frames = 8;
      showFrame = Math.min(frames - 1, ((0.4 - p.actionT) / 0.4) * frames | 0);
    } else if (p.jumping) {
      img = images.jump; frames = 9;
      const t = clamp(-p.vz / 200 + 0.5, 0, 1);
      showFrame = Math.min(frames - 1, (t * frames) | 0);
    } else if (p.moving && p.running) {
      img = images.run; frames = 8;
      showFrame = p.frame % frames;
    } else if (p.moving) {
      img = images.walk; frames = 8;
      showFrame = p.frame % frames;
    } else {
      showFrame = (state.time * 6 | 0) % frames;
    }

    if (!img) return;
    const fw = Math.floor(img.width / frames);
    const fh = img.height;
    // ~1.4x — fits 16px tile world without towering over props
    const dw = Math.max(16, Math.round(fw * 1.4));
    const dh = Math.max(20, Math.round(fh * 1.4));
    const dx = p.x + 8 - dw / 2;
    const dy = p.y + 14 - dh - p.z;

    // shadow on ground
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.beginPath();
    ctx.ellipse(p.x + 8, p.y + 13, Math.max(4, dw * 0.28), 2.5, 0, 0, Math.PI * 2);
    ctx.fill();

    if (p.invuln > 0 && ((state.time * 20) | 0) % 2 === 0) {
      // blink while invulnerable
    } else {
      drawSprite(img, showFrame * fw, 0, fw, fh, dx, dy, dw, dh, flip);
    }

    // shield aura
    if (p.fx.shield > 0) {
      ctx.globalAlpha = 0.35 + Math.sin(state.time * 8) * 0.15;
      ctx.strokeStyle = "#7ec8e8";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(p.x + 8, p.y + 4 - p.z, 16, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    if (p.fx.speed > 0) {
      ctx.globalAlpha = 0.4;
      ctx.fillStyle = "#4c8fe8";
      ctx.fillRect(p.x - 4, p.y + 8 - p.z, 4, 2);
      ctx.fillRect(p.x - 8, p.y + 11 - p.z, 5, 2);
      ctx.globalAlpha = 1;
    }
  }

  function drawBalloon(b) {
    if (b.collected && b.pop <= 0) return;
    const y = b.baseY + Math.sin(state.time * 2 + b.phase) * 6;
    if (b.collected) {
      ctx.globalAlpha = Math.max(0, b.pop / 0.35);
      ctx.strokeStyle = b.color;
      ctx.beginPath();
      ctx.arc(b.x, y, 10 + (0.35 - b.pop) * 18, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
      return;
    }
    ctx.strokeStyle = "#fff8";
    ctx.beginPath();
    ctx.moveTo(b.x, y + 8);
    ctx.quadraticCurveTo(b.x + Math.sin(state.time * 3 + b.phase) * 3, y + 16, b.x, y + 22);
    ctx.stroke();
    ctx.fillStyle = b.color;
    ctx.beginPath();
    ctx.ellipse(b.x, y, 7, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff8";
    ctx.beginPath();
    ctx.ellipse(b.x - 2, y - 3, 2, 3, -0.4, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawChest(c) {
    drawSprite(images.chest, 0, c.open ? 16 : 0, 16, 16, c.x, c.y, 16, 16);
    if (!c.open) {
      ctx.globalAlpha = 0.4 + Math.sin(state.time * 4) * 0.25;
      ctx.fillStyle = "#ffe7a0";
      ctx.beginPath();
      ctx.arc(c.x + 8, c.y - 4, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  function drawAnimFX(fx) {
    let img = null, frames = fx.frames, fw = 0;
    if (fx.type === "dust") { img = images.dust; frames = 8; }
    else if (fx.type === "dustRun") { img = images.dustRun; frames = 8; }
    else if (fx.type === "dustLand") { img = images.dustLand; frames = 6; }
    else if (fx.type === "glint") { img = images.glint; frames = 6; }
    if (!img) return;
    fw = img.width / frames;
    const fr = Math.min(frames - 1, fx.frame);
    drawSprite(img, fr * fw, 0, fw, img.height, fx.x, fx.y, fw * 1.5, img.height * 1.5);
  }

  function drawParticles() {
    for (const p of state.particles) {
      ctx.globalAlpha = clamp(p.life * 2, 0, 1);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size);
    }
    ctx.globalAlpha = 1;
  }

  function drawFloatTexts() {
    for (const f of state.floatTexts) {
      ctx.globalAlpha = clamp(f.life * 1.5, 0, 1);
      ctx.fillStyle = f.color;
      ctx.font = `bold ${f.size || 10}px Nunito, sans-serif`;
      ctx.fillText(f.text, f.x, f.y);
    }
    ctx.globalAlpha = 1;
  }

  function drawHarvestFX() {
    for (const h of state.harvestFX) {
      const img = images[h.imgKey];
      ctx.save();
      ctx.globalAlpha = clamp(h.life * 1.4, 0, 1);
      ctx.translate(h.x, h.y);
      ctx.rotate(h.spin);
      if (img) ctx.drawImage(img, -10, -10, 20, 20);
      else {
        ctx.fillStyle = "#a8d96a";
        ctx.fillRect(-6, -6, 12, 12);
      }
      ctx.restore();
    }
  }

  function render() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, VIEW_W, VIEW_H);

    // sky
    const sky = ctx.createLinearGradient(0, 0, 0, VIEW_H);
    sky.addColorStop(0, "#7ec8e8");
    sky.addColorStop(0.45, "#b8e4a8");
    sky.addColorStop(1, "#5ba84a");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);

    ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);
    ctx.translate(-state.camX, -state.camY);

    drawParallaxBack();
    drawGround();
    drawParallaxMid();

    for (const plot of state.plots) drawPlot(plot);
    if (state.hover.till) {
      const { tx, ty } = state.hover.till;
      const can = inReach(tx * TILE + 8, ty * TILE + 8);
      ctx.strokeStyle = can ? "#a8d96a" : "#e85d4c";
      ctx.globalAlpha = 0.75;
      ctx.lineWidth = 2;
      ctx.setLineDash([3, 3]);
      ctx.strokeRect(tx * TILE + 0.5, ty * TILE + 0.5, 15, 15);
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;
    }

    const list = [];
    for (const p of state.props) list.push({ y: p.y + (p.sh || 16), t: "prop", r: p });
    for (const c of state.chests) list.push({ y: c.y + 16, t: "chest", r: c });
    for (const t of state.traps) list.push({ y: t.y + 14, t: "trap", r: t });
    for (const c of state.collectibles) if (!c.taken) list.push({ y: c.y + 12, t: "col", r: c });
    for (const a of state.animals) list.push({ y: a.y + a.h, t: "animal", r: a });
    for (const b of state.butterflies) if (!b.taken) list.push({ y: b.y + 8, t: "bfly", r: b });
    for (const b of state.balloons) if (!b.collected || b.pop > 0) list.push({ y: b.baseY + 24, t: "bal", r: b });
    list.push({ y: state.player.y + 16, t: "player", r: state.player });
    list.sort((a, b) => a.y - b.y);

    for (const item of list) {
      if (item.t === "prop") drawProp(item.r);
      else if (item.t === "chest") drawChest(item.r);
      else if (item.t === "trap") drawTrap(item.r);
      else if (item.t === "col") drawCollectible(item.r);
      else if (item.t === "animal") drawAnimal(item.r);
      else if (item.t === "bfly") drawButterfly(item.r);
      else if (item.t === "bal") drawBalloon(item.r);
      else if (item.t === "player") drawPlayer();
    }

    for (const fx of state.animFX) drawAnimFX(fx);
    drawParticles();
    drawHarvestFX();
    drawFloatTexts();

    // screen space UI vignette + objective
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const vg = ctx.createRadialGradient(VIEW_W / 2, VIEW_H / 2, VIEW_H * 0.25, VIEW_W / 2, VIEW_H / 2, VIEW_H * 0.8);
    vg.addColorStop(0, "rgba(0,0,0,0)");
    vg.addColorStop(1, "rgba(10,20,8,0.3)");
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);

    if (state.mode === "play" && state.goal) {
      const g = state.goal, p = state.progress;
      ctx.fillStyle = "rgba(31,23,16,0.6)";
      ctx.fillRect(12, 12, 420, 44);
      ctx.strokeStyle = "rgba(244,226,176,0.35)";
      ctx.strokeRect(12.5, 12.5, 419, 43);
      ctx.fillStyle = "#ffe7a0";
      ctx.font = "12px Nunito, sans-serif";
      ctx.fillText(
        `Para ${state.money}/${g.money} · Hasat ${p.harvest}/${g.harvest} · Besle ${p.feed}/${g.feed} · Topla ${p.collect}/${g.collect}`,
        22, 38
      );
    }
  }

  /* ---- loop ---- */
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    state.time += dt;

    if (toastTimer > 0) {
      toastTimer -= dt * 1000;
      if (toastTimer <= 0) toastEl.classList.add("hidden");
    }

    if (state.mode === "play" && ready) {
      updatePlayer(dt);
      updatePlots(dt);
      updateAnimals(dt);
      updateTraps(dt);
      updateButterflies(dt);
      updateParallax(dt);
      updateFX(dt);
      updateCamera();
      tickSave(dt);
      if ((state.time * 2 | 0) !== ((state.time - dt) * 2 | 0)) updateHud();
    } else if (ready) {
      updateFX(dt);
      updateParallax(dt);
    }

    if (ready && state.map) render();
    else {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = "#2f6b3a";
      ctx.fillRect(0, 0, VIEW_W, VIEW_H);
      ctx.fillStyle = "#fff";
      ctx.font = "16px Nunito";
      ctx.fillText("Yükleniyor…", 400, 320);
    }
    requestAnimationFrame(frame);
  }

  /* ---- input ---- */
  window.addEventListener("keydown", (e) => {
    keys[e.key] = true;
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) e.preventDefault();
    if (state.mode !== "play") {
      if (e.key === " " || e.key === "Enter") btnStart.click();
      return;
    }
    const p = state.player;
    if ((e.key === " " || e.code === "Space") && p && !p.jumping && p.z === 0 && !p.action) {
      p.jumping = true;
      p.vz = -210;
      spawnAnimFX("dust", p.x + 2, p.y + 12);
    }
    if (e.key === "e" || e.key === "E") tryInteract();
    if (e.key === "1") { setTool("hoe"); tryPlant(); }
    if (e.key === "2") { setTool("water"); tryWater(); }
    if (e.key === "3") {
      setTool("harvest");
      const p = state.player;
      const a = p && state.animals.find((x) => dist(p.x + 8, p.y + 8, x.x + x.w / 2, x.y + x.h / 2) < 30);
      if (a) trySellAnimal(a);
      else tryHarvest();
    }
    if (e.key === "f" || e.key === "F") { setTool("feed"); tryFeed(); }
    if (e.key === "q" || e.key === "Q") {
      state.seedIndex = (state.seedIndex + CROP_TYPES.length - 1) % CROP_TYPES.length;
      updateHud();
    }
    if (e.key === "r" || e.key === "R") {
      state.seedIndex = (state.seedIndex + 1) % CROP_TYPES.length;
      updateHud();
    }
    if (e.key === "i" || e.key === "I") togglePanel();
    if (e.key === "b" || e.key === "B") toggleInv();
  });
  window.addEventListener("keyup", (e) => { keys[e.key] = false; });

  /* ---- touch / mobile controls ---- */
  (function setupTouchControls() {
    const dirMap = {
      up: ["w", "W", "ArrowUp"],
      down: ["s", "S", "ArrowDown"],
      left: ["a", "A", "ArrowLeft"],
      right: ["d", "D", "ArrowRight"],
    };
    function setDir(dir, on) {
      (dirMap[dir] || []).forEach((k) => { keys[k] = on; });
    }
    document.querySelectorAll(".touch-btn[data-dir]").forEach((btn) => {
      const dir = btn.dataset.dir;
      const press = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDir(dir, true);
        btn.classList.add("active");
      };
      const release = (e) => {
        e.preventDefault();
        setDir(dir, false);
        btn.classList.remove("active");
      };
      btn.addEventListener("pointerdown", press);
      btn.addEventListener("pointerup", release);
      btn.addEventListener("pointercancel", release);
      btn.addEventListener("pointerleave", release);
    });
    const touchJump = $("touch-jump");
    const touchAct = $("touch-act");
    if (touchJump) {
      touchJump.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        if (state.mode !== "play") return;
        const p = state.player;
        if (p && !p.jumping && p.z === 0 && !p.action) {
          p.jumping = true;
          p.vz = -210;
          spawnAnimFX("dust", p.x + 2, p.y + 12);
        }
      });
    }
    if (touchAct) {
      touchAct.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        if (state.mode !== "play") return;
        const tool = state.tool;
        if (tool === "hoe") tryPlant();
        else if (tool === "water") tryWater();
        else if (tool === "harvest") {
          const p = state.player;
          const a = p && state.animals.find((x) => dist(p.x + 8, p.y + 8, x.x + x.w / 2, x.y + x.h / 2) < 30);
          if (a) trySellAnimal(a);
          else tryHarvest();
        } else if (tool === "feed") tryFeed();
        else if (tool === "soil") {
          const p = state.player;
          if (p) placeSoilAtWorld(p.x + 8, p.y + 8);
        } else tryInteract();
      });
    }
    // pointer hover for tooltips on touch devices
    canvas.addEventListener("pointermove", (e) => {
      if (state.mode !== "play") return;
      if (e.pointerType === "mouse") return; // mousemove already handles
      const w = canvasToWorld(e.clientX, e.clientY);
      state.hover.wx = w.x;
      state.hover.wy = w.y;
      state.hover.plot = getPlotAtWorld(w.x, w.y);
      state.hover.animal = getAnimalAtWorld(w.x, w.y);
      const ttx = (w.x / TILE) | 0;
      const tty = (w.y / TILE) | 0;
      state.hover.till = !state.hover.plot && !state.hover.animal && canTillAt(ttx, tty) ? { tx: ttx, ty: tty } : null;
    });
  })();

  document.querySelectorAll(".tool").forEach((el) => {
    el.addEventListener("click", () => {
      setTool(el.dataset.tool);
      const names = {
        hand: "El — tıkla",
        hoe: "Ek — tarlaya tohum",
        soil: "Toprak — çimene koy",
        water: "Su — ürüne tıkla",
        harvest: "Hasat / Kes — ürün veya hayvan sat",
        feed: "Besle — tüm hayvanlar ürün verir",
      };
      showToast(names[el.dataset.tool] || "Araç seçildi");
    });
  });

  canvas.style.cursor = "crosshair";
  canvas.addEventListener("mousemove", (e) => {
    if (state.mode !== "play") return;
    const w = canvasToWorld(e.clientX, e.clientY);
    state.hover.wx = w.x;
    state.hover.wy = w.y;
    state.hover.plot = getPlotAtWorld(w.x, w.y);
    state.hover.animal = getAnimalAtWorld(w.x, w.y);
    const ttx = (w.x / TILE) | 0;
    const tty = (w.y / TILE) | 0;
    state.hover.till = !state.hover.plot && !state.hover.animal && canTillAt(ttx, tty) ? { tx: ttx, ty: tty } : null;
    const over = state.hover.plot || state.hover.animal || state.hover.till;
    canvas.style.cursor = over ? "pointer" : "crosshair";
  });
  canvas.addEventListener("mouseleave", () => {
    state.hover.plot = null;
    state.hover.animal = null;
    state.hover.till = null;
    canvas.style.cursor = "crosshair";
  });
  canvas.addEventListener("click", (e) => {
    if (state.mode !== "play") return;
    e.preventDefault();
    const w = canvasToWorld(e.clientX, e.clientY);
    handleWorldClick(w.x, w.y);
  });
  // prevent accidental text select while clicking farm
  canvas.addEventListener("contextmenu", (e) => e.preventDefault());

  document.querySelectorAll(".farm-tab").forEach((el) => {
    el.addEventListener("click", () => {
      state.panelTab = el.dataset.tab;
      renderFarmPanel();
    });
  });

  const btnTogglePanel = $("btn-toggle-panel");
  const btnToggleInv = $("btn-toggle-inv");
  const btnClosePanel = $("btn-close-panel");
  const btnCloseInv = $("btn-close-inv");
  if (btnTogglePanel) btnTogglePanel.addEventListener("click", togglePanel);
  if (btnToggleInv) btnToggleInv.addEventListener("click", toggleInv);
  if (btnClosePanel) btnClosePanel.addEventListener("click", () => setPanelOpen(false));
  if (btnCloseInv) btnCloseInv.addEventListener("click", (e) => {
    e.stopPropagation();
    setInvOpen(false);
  });
  const invBar = $("inv-bar");
  const invHead = invBar && invBar.querySelector(".inv-bar-head");
  if (invHead) {
    invHead.addEventListener("click", () => {
      if (!state.invOpen) setInvOpen(true);
    });
  }

  /** Fare tekerleği / trackpad: panellerde kaydır */
  function bindPanelWheel(el, isActive) {
    if (!el) return;
    el.addEventListener(
      "wheel",
      (e) => {
        if (isActive && !isActive()) return;
        const max = el.scrollHeight - el.clientHeight;
        if (max <= 1) return;
        e.preventDefault();
        e.stopPropagation();
        el.scrollTop = Math.max(0, Math.min(max, el.scrollTop + e.deltaY));
      },
      { passive: false }
    );
  }

  bindPanelWheel(document.querySelector(".farm-scroll"), () => state.panelOpen);
  bindPanelWheel($("inv-scroll"), () => state.invOpen);

  syncPanelUi();
  if (ready) paintSideIcons();

  function startNewGame() {
    clearSave();
    resetCareer();
    playTransition(() => loadLevel(0));
  }

  function continueOrStart() {
    if (!ready) return;
    if (state.mode === "complete") {
      playTransition(() => loadLevel(state.levelIndex + 1));
      return;
    }
    if (state.mode === "dead" || state.mode === "win") {
      startNewGame();
      return;
    }
    if (state.mode === "title") {
      const data = peekSave();
      if (data) {
        playTransition(() => {
          try {
            applySaveData(data);
            saveGame(true);
          } catch (err) {
            console.error(err);
            clearSave();
            resetCareer();
            loadLevel(0);
            showToast("Kayıt bozuktu — yeni oyun");
          }
        });
      } else {
        startNewGame();
      }
    }
  }

  btnStart.addEventListener("click", continueOrStart);

  const btnNewGame = $("btn-new-game");
  if (btnNewGame) {
    btnNewGame.addEventListener("click", () => {
      if (!ready) return;
      if (!confirm("Kayıt silinip sıfırdan başlanacak. Emin misin?")) return;
      startNewGame();
    });
  }

  window.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") saveGame();
  });
  window.addEventListener("beforeunload", () => {
    saveGame();
  });

  refreshTitleForSave();

  loadAll()
    .then(() => {
      paintSideIcons();
      syncPanelUi();
      refreshTitleForSave();
      showToast(hasSave() ? "Kayıt hazır — Devam Et" : "Hazır! Yandan Market / Çanta aç");
    })
    .catch((err) => {
      overlayText.textContent = "Yükleme hatası: " + err.message;
      console.error(err);
    });

  requestAnimationFrame(frame);
})();
