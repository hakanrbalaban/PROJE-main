const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");
c.imageSmoothingEnabled = false;
const dpr = window.devicePixelRatio || 1;

canvas.width = 1024 * dpr;
canvas.height = 576 * dpr;
const MAP_COLS = 28;
const MAP_ROWS = 28;
const MAP_WIDTH = 16 * MAP_COLS;
const MAP_HEIGHT = 16 * MAP_ROWS;

const MAP_SCALE = 3;
const VIEWPORT_WIDTH = canvas.width / MAP_SCALE;
const VIEWPORT_HEIGHT = canvas.height / MAP_SCALE;
const VIEWPORT_CENTER_X = VIEWPORT_WIDTH / 2;
const VIEWPORT_CENTER_Y = VIEWPORT_HEIGHT / 2;
const MAX_SCROLL_X = MAP_WIDTH - VIEWPORT_WIDTH;
const MAX_SCROLL_Y = MAP_HEIGHT - VIEWPORT_HEIGHT;
const layersData = {
  l_Terrain: l_Terrain,
  l_Trees_1: l_Trees_1,
  l_Trees_2: l_Trees_2,
  l_Trees_3: l_Trees_3,
  l_Trees_4: l_Trees_4,
  l_Landscape_Decorations: l_Landscape_Decorations,
  l_Landscape_Decorations_2: l_Landscape_Decorations_2,
  l_Houses: l_Houses,
  l_House_Decorations: l_House_Decorations,
  l_Characters: l_Characters,
  l_Collisions: l_Collisions,
};
const frontRenderLayersData = {
  l_Front_Renders: l_Front_Renders,
};

const tilesets = {
  l_Terrain: { imageUrl: "./images/terrain.png", tileSize: 16, animations: [] },
  l_Front_Renders: {
    imageUrl: "./images/decorations.png",
    tileSize: 16,
    animations: [],
  },
  l_Trees_1: {
    imageUrl: "./images/decorations.png",
    tileSize: 16,
    animations: [],
  },
  l_Trees_2: {
    imageUrl: "./images/decorations.png",
    tileSize: 16,
    animations: [],
  },
  l_Trees_3: {
    imageUrl: "./images/decorations.png",
    tileSize: 16,
    animations: [],
  },
  l_Trees_4: {
    imageUrl: "./images/decorations.png",
    tileSize: 16,
    animations: [],
  },
  l_Landscape_Decorations: {
    imageUrl: "./images/decorations.png",
    tileSize: 16,
    animations: [],
  },
  l_Landscape_Decorations_2: {
    imageUrl: "./images/decorations.png",
    tileSize: 16,
    animations: [],
  },
  l_Houses: {
    imageUrl: "./images/decorations.png",
    tileSize: 16,
    animations: [],
  },
  l_House_Decorations: {
    imageUrl: "./images/decorations.png",
    tileSize: 16,
    animations: [],
  },
  l_Characters: {
    imageUrl: "./images/characters.png",
    tileSize: 16,
    animations: [],
  },
  l_Collisions: {
    imageUrl: "./images/characters.png",
    tileSize: 16,
    animations: [],
  },
};

// Tile setup
const collisionBlocks = [];
const blockSize = 16; // Assuming each tile is 16x16 pixels

collisions.forEach((row, y) => {
  row.forEach((symbol, x) => {
    if (symbol === 1) {
      collisionBlocks.push(
        new CollisionBlock({
          x: x * blockSize,
          y: y * blockSize,
          size: blockSize,
        }),
      );
    }
  });
});

const firstLayerKey = Object.keys(layersData)[0];
const firstLayer = layersData[firstLayerKey];

const tilesetImages = {};
const animatedCells = {};
const animationsByLayer = {};

const renderLayer = (
  tilesData,
  tilesetImage,
  tileSize,
  context,
  skipSymbols,
) => {
  const tilesPerRow = Math.ceil(tilesetImage.width / tileSize);

  tilesData.forEach((row, y) => {
    row.forEach((symbol, x) => {
      if (symbol !== 0 && (!skipSymbols || !skipSymbols.has(symbol))) {
        const tileIndex = symbol - 1;
        const srcX = (tileIndex % tilesPerRow) * tileSize;
        const srcY = Math.floor(tileIndex / tilesPerRow) * tileSize;
        context.drawImage(
          tilesetImage,
          srcX,
          srcY,
          tileSize,
          tileSize,
          x * 16,
          y * 16,
          16,
          16,
        );
      }
    });
  });
};

const renderStaticLayers = async (layersData) => {
  const offscreenCanvas = document.createElement("canvas");
  offscreenCanvas.width = MAP_WIDTH;
  offscreenCanvas.height = MAP_HEIGHT;
  const offscreenContext = offscreenCanvas.getContext("2d");

  for (const [layerName, tilesData] of Object.entries(layersData)) {
    const tilesetInfo = tilesets[layerName];
    if (tilesetInfo) {
      try {
        const tilesetImage = await loadImage(tilesetInfo.imageUrl);
        tilesetImages[layerName] = tilesetImage;
        const animations = tilesetInfo.animations || [];
        animationsByLayer[layerName] = animations;
        const startSymbols = new Set(animations.map((a) => a.frames[0]));
        if (startSymbols.size) {
          const cells = [];
          tilesData.forEach((row, y) => {
            row.forEach((symbol, x) => {
              if (startSymbols.has(symbol))
                cells.push({ x, y, startSymbol: symbol });
            });
          });
          animatedCells[layerName] = cells;
        }
        renderLayer(
          tilesData,
          tilesetImage,
          tilesetInfo.tileSize,
          offscreenContext,
          startSymbols,
        );
      } catch (error) {
        console.error(`Failed to load image for layer ${layerName}:`, error);
      }
    }
  }

  return offscreenCanvas;
};

function drawAnimatedTiles(context, now) {
  for (const layerName in animatedCells) {
    const cells = animatedCells[layerName];
    if (!cells || !cells.length) continue;
    const animations = animationsByLayer[layerName] || [];
    const tilesetImage = tilesetImages[layerName];
    const info = tilesets[layerName];
    if (!tilesetImage || !info) continue;
    const tileSize = info.tileSize;
    const tilesPerRow = Math.ceil(tilesetImage.width / tileSize);
    for (const cell of cells) {
      const anim = animations.find((a) => a.frames[0] === cell.startSymbol);
      if (!anim) continue;
      const fps = anim.fps > 0 ? anim.fps : 6;
      const frameIndex = Math.floor((now / 1000) * fps) % anim.frames.length;
      const symbol = anim.frames[frameIndex];
      const tileIndex = symbol - 1;
      const srcX = (tileIndex % tilesPerRow) * tileSize;
      const srcY = Math.floor(tileIndex / tilesPerRow) * tileSize;
      context.drawImage(
        tilesetImage,
        srcX,
        srcY,
        tileSize,
        tileSize,
        cell.x * 16,
        cell.y * 16,
        16,
        16,
      );
    }
  }
}
// END - Tile setup

// Change xy coordinates to move player's default position
const player = new Player({
  x: 100,
  y: 100,
  size: 15,
});
const monsterSprites = {
  walkDown: {
    x: 0,
    y: 0,
    width: 16,
    height: 16,
    frameCount: 4,
  },
  walkUp: {
    x: 16,
    y: 0,
    width: 16,
    height: 16,
    frameCount: 4,
  },
  walkLeft: {
    x: 32,
    y: 0,
    width: 16,
    height: 16,
    frameCount: 4,
  },
  walkRight: {
    x: 48,
    y: 0,
    width: 16,
    height: 16,
    frameCount: 4,
  },
};
const monsters = [
  new Monster({
    x: 200,
    y: 150,
    size: 15,
    imgSrc: "./images/bamboo.png",
    sprites: monsterSprites,
  }),
  new Monster({
    x: 300,
    y: 150,
    size: 15,
    imgSrc: "./images/dragon.png",
    sprites: monsterSprites,
  }),
  new Monster({
    x: 48,
    y: 400,
    size: 15,
    imgSrc: "./images/bamboo.png",
    sprites: monsterSprites,
  }),
  new Monster({
    x: 288,
    y: 416,
    size: 15,
    imgSrc: "./images/bamboo.png",
    sprites: monsterSprites,
  }),
  new Monster({
    x: 112,
    y: 416,
    size: 15,
    imgSrc: "./images/dragon.png",
    sprites: monsterSprites,
  }),
  new Monster({
    x: 48,
    y: 400,
    size: 15,
    imgSrc: "./images/bamboo.png",
    sprites: monsterSprites,
  }),
  new Monster({
    x: 288,
    y: 416,
    size: 15,
    imgSrc: "./images/bamboo.png",
    sprites: monsterSprites,
  }),
  new Monster({
    x: 48,
    y: 400,
    size: 15,
    imgSrc: "./images/bamboo.png",
    sprites: monsterSprites,
  }),
  new Monster({
    x: 112,
    y: 416,
    size: 15,
    imgSrc: "./images/dragon.png",
    sprites: monsterSprites,
  }),
  new Monster({
    x: 400,
    y: 400,
    size: 15,
    imgSrc: "./images/bamboo.png",
    sprites: monsterSprites,
  }),
];
const initialMonsterData = [
  { x: 200, y: 150, imgSrc: "./images/bamboo.png" },
  { x: 300, y: 150, imgSrc: "./images/dragon.png" },
  { x: 48, y: 400, imgSrc: "./images/bamboo.png" },
  { x: 288, y: 416, imgSrc: "./images/bamboo.png" },
  { x: 112, y: 416, imgSrc: "./images/dragon.png" },
  { x: 48, y: 400, imgSrc: "./images/bamboo.png" },
  { x: 288, y: 416, imgSrc: "./images/bamboo.png" },
  { x: 48, y: 400, imgSrc: "./images/bamboo.png" },
  { x: 112, y: 416, imgSrc: "./images/dragon.png" },
  { x: 400, y: 400, imgSrc: "./images/bamboo.png" }
];

const keys = {
  w: {
    pressed: false,
  },
  a: {
    pressed: false,
  },
  s: {
    pressed: false,
  },
  d: {
    pressed: false,
  },
};

let lastTime = performance.now();
let frontRendersCanvas;

const hearts = [
  new Heart({
    x: 10,
    y: 10,
  }),
  new Heart({
    x: 32,
    y: 10,
  }),
  new Heart({
    x: 54,
    y: 10,
  }),
]; 
const leafs = [
  new Sprite({
    x: 20,
    y: 20,
    velocity: {
      x: 0.08,
      y: 0.08,
    },
  }),
]

let elapsedTime = 0;
let isGameOver = false; // Oyunun bitiş durumunu tutar
let score = 0; // Oyuncunun skorunu tutar

// Yeniden başlatma için tuş dinleyicisi
window.addEventListener("keydown", (event) => {
  if (isGameOver && (event.key === "r" || event.key === "R")) {
    resetGame();
  }
});

function resetGame() {
  // Canları sıfırla (tüm kalpleri dolu yap)
  hearts.forEach(heart => heart.currentFrame = 4);
  
  // Oyuncuyu başlangıç pozisyonuna getir ve hit durumlarını sıfırla
  player.x = 100;
  player.y = 100;
  player.isInvincible = false;
  player.isAttacking = false;
  player.hasHitEnemy = false;
  if (player.reset) player.reset(); 

  // Mevcut canavarları tamamen temizle
  monsters.length = 0; 
  
  // 10 canavarın hepsini şablona göre yeniden oluştur
  initialMonsterData.forEach(data => {
    monsters.push(
      new Monster({
        x: data.x,
        y: data.y,
        size: 15,
        imgSrc: data.imgSrc,
        sprites: monsterSprites
      })
    );
  });

  // Yaprakları ve skoru sıfırla
  leafs.length = 0;
  score = 0; 

  // Döngüyü canlandır
  isGameOver = false;
  lastTime = performance.now();
}
function animate(backgroundCanvas) {
  // Calculate delta time
  const currentTime = performance.now();
  const deltaTime = (currentTime - lastTime) / 1000;
  lastTime = currentTime;

  // Güncellemeler sadece oyun devam ederken yapılır
  if (!isGameOver) {
    elapsedTime += deltaTime;
    if (elapsedTime > 1.5) {
      leafs.push(new Sprite({
        x: Math.random() * 150,
        y: Math.random() * 50,
        velocity: {
          x: 0.08,
          y: 0.08,
        },
      }));
      elapsedTime = 0;
    }

    // Update player position
    player.handleInput(keys);
    player.update(deltaTime, collisionBlocks);
  }

  const horizontalScrollDistance = Math.min(
    Math.max(0, player.center.x - VIEWPORT_CENTER_X),
    MAX_SCROLL_X,
  );
  const verticalScrollDistance = Math.min(
    Math.max(0, player.center.y - VIEWPORT_CENTER_Y),
    MAX_SCROLL_Y,
  );

  // Render scene
  c.save();
  c.scale(MAP_SCALE, MAP_SCALE);
  c.translate(-horizontalScrollDistance, -verticalScrollDistance);
  c.clearRect(0, 0, canvas.width, canvas.height);
  c.drawImage(backgroundCanvas, 0, 0);
  drawAnimatedTiles(c, currentTime);
  player.draw(c);

  // render monsters
  for (let i = monsters.length - 1; i >= 0; i--) {
    const monster = monsters[i];
    
    if (!isGameOver) {
      monster.update(deltaTime, collisionBlocks);
    }
    monster.draw(c);

    // detect for collision
    if (!isGameOver) {
      if (
        player.attackBox.x + player.attackBox.width >= monster.x &&
        player.attackBox.x <= monster.x + monster.width &&
        player.attackBox.y + player.attackBox.height >= monster.y &&
        player.attackBox.y <= monster.y + monster.height &&
        player.isAttacking && !player.hasHitEnemy
      ) {
        monster.receiveHit();
        player.hasHitEnemy = true;
        console.log("Monster health:", monster.health);
        if (monster.health <= 0) {
          score += 100; // Her canavar öldüğünde 100 puan ver
          monsters.splice(i, 1);
        }
      }
      
      if (
        player.x + player.width >= monster.x &&
        player.x <= monster.x + monster.width &&
        player.y + player.height >= monster.y &&
        player.y <= monster.y + monster.height && 
        !player.isInvincible
      ) {
        player.receiveHit();
        
        // Can azaltılmadan önce dolu olan kalpleri bul
        let filledHearts = hearts.filter((heart) => heart.currentFrame === 4);
        console.log("Filled hearts before hit:", filledHearts);
        
        if (filledHearts.length > 0) {
          // Son dolu kalbi boşalt
          filledHearts[filledHearts.length - 1].currentFrame = 0;
          
          // Güncel dolu kalp sayısını kontrol et
          const remainingHearts = hearts.filter((heart) => heart.currentFrame === 4).length;
          console.log("Remaining filled hearts:", remainingHearts);
          
          // Eğer hiç dolu kalp kalmadıysa oyunu bitir
          if (remainingHearts <= 0) { 
            isGameOver = true; 
          }
        }
      }
    }
  }

  c.drawImage(frontRendersCanvas, 0, 0);
  
  for (let i = leafs.length - 1; i >= 0; i--) {
    const leaf = leafs[i];
    if (!isGameOver) {
      leaf.update(deltaTime);
    }
    leaf.draw(c);
    if (leaf.alpha <= 0) {
      leafs.splice(i, 1);
    }
  }

  c.restore();

  // Arayüz Çizimi (Sabit Kalpler)
  c.save();
  c.scale(MAP_SCALE, MAP_SCALE);
  hearts.forEach((heart) => {
    heart.draw(c)
  })
  // Canların hemen yanına skoru yazdır (Örn: X: 80, Y: 18 pozisyonuna)
  c.fillStyle = "white";
  c.font = "bold 8px sans-serif"; // Ölçeklendiği için küçük font boyutu yeterlidir
  c.fillText("SCORE: " + score, 80, 25);
  c.restore();

  // --- GAME OVER EKRANI (EN ÜSTE ÇİZİLİR) ---
  if (isGameOver) {
    c.save();
    c.fillStyle = "rgba(0, 0, 0, 0.6)"; 
    c.fillRect(0, 0, canvas.width, canvas.height);

    c.textAlign = "center";
    c.textBaseline = "middle";

    c.fillStyle = "red";
    c.font = "bold 48px sans-serif";
    c.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 30);

    // Skor gösterimi
    c.fillStyle = "yellow";
    c.font = "bold 28px sans-serif";
    c.fillText("Final Score: " + score, canvas.width / 2, canvas.height / 2 + 10);

    c.fillStyle = "white";
    c.font = "24px sans-serif";
    c.fillText("Press 'R' to Restart", canvas.width / 2, canvas.height / 2 + 30);
    
    c.restore();
  }

  // Tek bir döngü çağrısı
  requestAnimationFrame(() => animate(backgroundCanvas));
}

const startRendering = async () => {
  try {
    const backgroundCanvas = await renderStaticLayers(layersData);
    frontRendersCanvas = await renderStaticLayers(frontRenderLayersData);
    console.log("Front renders canvas:", frontRendersCanvas);
    if (!backgroundCanvas) {
      console.error("Failed to create the background canvas");
      return;
    }

    animate(backgroundCanvas);
  } catch (error) {
    console.error("Error during rendering:", error);
  }
};

startRendering();
