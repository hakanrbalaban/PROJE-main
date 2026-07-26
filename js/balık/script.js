(() => {
  "use strict";

  // ---------------------------------------------------------------------------
  // Constants
  // ---------------------------------------------------------------------------
  const CANVAS_W = 800;
  const CANVAS_H = 600;
  const WATER_SURFACE_Y = 250;
  const HOOK_DROP_SPEED = 4.5;
  const HOOK_REEL_SPEED = 5.5;
  const MAX_FISH = 8;
  const FISH_SCALE = 3.5;
  const HOOK_SCALE = 2.2;
  const FISHERMAN_SCALE = 2.4;
  const SCORE_PER_FISH = 10;

  /** Core assets required by the brief + extra fish variants from the pack. */
  const IMAGE_SOURCES = {
    background: "fishing/background.png",
    fisherman: "fishing/fisherman.png",
    hook: "fishing/hook.png",
    fish: "fishing/fish.png",
    anchovy: "fishing/A - Salt Water/Anchovy Outline.png",
    clownfish: "fishing/A - Salt Water/Clownfish Outline.png",
    pufferfish: "fishing/A - Salt Water/Pufferfish Outline.png",
    surgeonfish: "fishing/A - Salt Water/Surgeonfish Outline.png",
    angelfish: "fishing/B - Fresh Water/Angelfish Outline.png",
    bass: "fishing/B - Fresh Water/Bass Outline.png",
    catfish: "fishing/B - Fresh Water/Catfish Outline.png",
    goldfish: "fishing/B - Fresh Water/Goldfish Outline.png",
    trout: "fishing/B - Fresh Water/Rainbow Trout Outline.png",
  };

  const FISH_KEYS = [
    "fish",
    "anchovy",
    "clownfish",
    "pufferfish",
    "surgeonfish",
    "angelfish",
    "bass",
    "catfish",
    "goldfish",
    "trout",
  ];

  // ---------------------------------------------------------------------------
  // DOM / Canvas
  // ---------------------------------------------------------------------------
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  const loadingEl = document.getElementById("loading");

  ctx.imageSmoothingEnabled = false;

  // ---------------------------------------------------------------------------
  // Image loader
  // ---------------------------------------------------------------------------
  function loadImages(sources) {
    const entries = Object.entries(sources);
    const images = {};

    return Promise.all(
      entries.map(
        ([key, src]) =>
          new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
              images[key] = img;
              resolve();
            };
            img.onerror = () => reject(new Error(`Görsel yüklenemedi: ${src}`));
            img.src = src;
          })
      )
    ).then(() => images);
  }

  // ---------------------------------------------------------------------------
  // Game state
  // ---------------------------------------------------------------------------
  const state = {
    images: null,
    score: 0,
    fishes: [],
    rod: {
      // Tip of the fishing pole (line start)
      tipX: 0,
      tipY: 0,
      // Hook position
      x: 0,
      y: 0,
      // idle | dropping | reeling
      status: "idle",
      caughtFish: null,
    },
    fisherman: {
      x: 0,
      y: 0,
      w: 0,
      h: 0,
    },
    keys: {
      spacePressed: false,
    },
  };

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------
  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function randInt(min, max) {
    return Math.floor(rand(min, max + 1));
  }

  function rectsOverlap(a, b) {
    return (
      a.x < b.x + b.w &&
      a.x + a.w > b.x &&
      a.y < b.y + b.h &&
      a.y + a.h > b.y
    );
  }

  // ---------------------------------------------------------------------------
  // Fish factory
  // ---------------------------------------------------------------------------
  function createFish(images) {
    const key = FISH_KEYS[randInt(0, FISH_KEYS.length - 1)];
    const img = images[key];
    const w = img.width * FISH_SCALE;
    const h = img.height * FISH_SCALE;
    const goingRight = Math.random() < 0.5;
    const speed = rand(1.2, 3.2);

    return {
      img,
      w,
      h,
      x: goingRight ? -w - rand(0, 120) : CANVAS_W + rand(0, 120),
      y: rand(WATER_SURFACE_Y + 40, CANVAS_H - h - 20),
      vx: goingRight ? speed : -speed,
      caught: false,
    };
  }

  function ensureFishPopulation() {
    while (state.fishes.filter((f) => !f.caught).length < MAX_FISH) {
      state.fishes.push(createFish(state.images));
    }
  }

  // ---------------------------------------------------------------------------
  // Rod / hook
  // ---------------------------------------------------------------------------
  function resetHookToIdle() {
    const rod = state.rod;
    rod.x = rod.tipX - (state.images.hook.width * HOOK_SCALE) / 2;
    rod.y = rod.tipY;
    rod.status = "idle";
    rod.caughtFish = null;
  }

  function getHookHitbox() {
    const img = state.images.hook;
    const w = img.width * HOOK_SCALE;
    const h = img.height * HOOK_SCALE;
    // Smaller inner hitbox for fairer catches
    return {
      x: state.rod.x + w * 0.2,
      y: state.rod.y + h * 0.35,
      w: w * 0.6,
      h: h * 0.55,
    };
  }

  function tryDropHook() {
    if (state.rod.status === "idle") {
      state.rod.status = "dropping";
    }
  }

  function updateRod() {
    const rod = state.rod;
    const hookH = state.images.hook.height * HOOK_SCALE;
    const maxY = CANVAS_H - hookH - 8;

    if (rod.status === "dropping") {
      rod.y += HOOK_DROP_SPEED;

      // Catch check
      const hit = getHookHitbox();
      for (const fish of state.fishes) {
        if (fish.caught) continue;
        if (rectsOverlap(hit, { x: fish.x, y: fish.y, w: fish.w, h: fish.h })) {
          fish.caught = true;
          rod.caughtFish = fish;
          rod.status = "reeling";
          break;
        }
      }

      if (rod.y >= maxY) {
        rod.y = maxY;
        rod.status = "reeling";
      }
    } else if (rod.status === "reeling") {
      rod.y -= HOOK_REEL_SPEED;

      if (rod.caughtFish) {
        const fish = rod.caughtFish;
        fish.x = rod.x + (state.images.hook.width * HOOK_SCALE - fish.w) / 2;
        fish.y = rod.y + hookH * 0.55;
      }

      if (rod.y <= rod.tipY) {
        if (rod.caughtFish) {
          state.score += SCORE_PER_FISH;
          state.fishes = state.fishes.filter((f) => f !== rod.caughtFish);
        }
        resetHookToIdle();
        ensureFishPopulation();
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Fish update
  // ---------------------------------------------------------------------------
  function updateFishes() {
    for (const fish of state.fishes) {
      if (fish.caught) continue;
      fish.x += fish.vx;

      // Respawn when off-screen
      if (fish.vx > 0 && fish.x > CANVAS_W + 40) {
        fish.x = -fish.w - rand(0, 80);
        fish.y = rand(WATER_SURFACE_Y + 40, CANVAS_H - fish.h - 20);
        fish.vx = rand(1.2, 3.2);
      } else if (fish.vx < 0 && fish.x < -fish.w - 40) {
        fish.x = CANVAS_W + rand(0, 80);
        fish.y = rand(WATER_SURFACE_Y + 40, CANVAS_H - fish.h - 20);
        fish.vx = -rand(1.2, 3.2);
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Drawing
  // ---------------------------------------------------------------------------
  function drawBackground() {
    ctx.drawImage(state.images.background, 0, 0, CANVAS_W, CANVAS_H);
  }

  function drawFisherman() {
    const img = state.images.fisherman;
    const { x, y, w, h } = state.fisherman;
    ctx.drawImage(img, x, y, w, h);
  }

  function drawLineAndHook() {
    const rod = state.rod;
    const hookImg = state.images.hook;
    const hw = hookImg.width * HOOK_SCALE;
    const hh = hookImg.height * HOOK_SCALE;
    const hookCenterX = rod.x + hw / 2;

    // Fishing line (misina)
    ctx.save();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(rod.tipX, rod.tipY);
    ctx.lineTo(hookCenterX, rod.y + 2);
    ctx.stroke();
    ctx.restore();

    ctx.drawImage(hookImg, rod.x, rod.y, hw, hh);
  }

  function drawFish(fish) {
    ctx.save();
    if (fish.vx < 0 && !fish.caught) {
      // Flip horizontally for left-swimming fish
      ctx.translate(fish.x + fish.w, fish.y);
      ctx.scale(-1, 1);
      ctx.drawImage(fish.img, 0, 0, fish.w, fish.h);
    } else {
      ctx.drawImage(fish.img, fish.x, fish.y, fish.w, fish.h);
    }
    ctx.restore();
  }

  function drawFishes() {
    // Draw free fish first, caught fish last (on top of line)
    for (const fish of state.fishes) {
      if (!fish.caught) drawFish(fish);
    }
    for (const fish of state.fishes) {
      if (fish.caught) drawFish(fish);
    }
  }

  function drawScore() {
    ctx.save();
    ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
    ctx.fillRect(12, 12, 140, 40);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 22px Segoe UI, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(`Skor: ${state.score}`, 24, 32);
    ctx.restore();
  }

  function drawIdleHint() {
    if (state.rod.status !== "idle") return;
    ctx.save();
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    ctx.font = "16px Segoe UI, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("SPACE — oltayı bırak", CANVAS_W / 2, WATER_SURFACE_Y - 18);
    ctx.restore();
  }

  function draw() {
    drawBackground();
    drawFisherman();
    drawLineAndHook();
    drawFishes();
    drawScore();
    drawIdleHint();
  }

  // ---------------------------------------------------------------------------
  // Loop
  // ---------------------------------------------------------------------------
  function update() {
    updateRod();
    updateFishes();
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  // ---------------------------------------------------------------------------
  // Input
  // ---------------------------------------------------------------------------
  function setupInput() {
    window.addEventListener("keydown", (e) => {
      if (e.code === "Space" || e.key === " ") {
        e.preventDefault();
        if (!state.keys.spacePressed) {
          state.keys.spacePressed = true;
          tryDropHook();
        }
      }
    });

    window.addEventListener("keyup", (e) => {
      if (e.code === "Space" || e.key === " ") {
        state.keys.spacePressed = false;
      }
    });
  }

  // ---------------------------------------------------------------------------
  // Init
  // ---------------------------------------------------------------------------
  function placeFisherman() {
    const img = state.images.fisherman;
    const w = img.width * FISHERMAN_SCALE;
    const h = img.height * FISHERMAN_SCALE;
    // Standing on the pier / shore band of the background
    const x = CANVAS_W / 2 - w / 2 + 20;
    const y = WATER_SURFACE_Y - h + 8;

    state.fisherman = { x, y, w, h };

    // Pole tip roughly at the raised arm / pole end of the sprite
    state.rod.tipX = x + w * 0.92;
    state.rod.tipY = y + h * 0.22;
    resetHookToIdle();
  }

  async function init() {
    try {
      state.images = await loadImages(IMAGE_SOURCES);
      loadingEl.classList.add("hidden");

      placeFisherman();
      ensureFishPopulation();
      setupInput();
      loop();
    } catch (err) {
      loadingEl.textContent = err.message || "Yükleme hatası";
      console.error(err);
    }
  }

  init();
})();
