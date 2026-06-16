const canvas = document.querySelector(".canvas"); // HTML'de <canvas class="canvas"></canvas> olmalı
const ctx = canvas.getContext("2d");

// Oyun nesnelerini tamamen JS içinde yönetiyoruz (En sağlıklı Canvas yöntemi)
let racket1Y = 150;
let racket2Y = 150;
const racketWidth = 10;
const racketHeight = 100;

let ballX = canvas.width / 2;
let ballY = canvas.height / 2;
let ballSpeedX = 4;
let ballSpeedY = 4;
const ballRadius = 10;

let score1 = 0;
let score2 = 0;

function resetBall() {
  ballX = canvas.width / 2;
  ballY = canvas.height / 2;
  ballSpeedX = -ballSpeedX; // Sayı yiyen tarafa doğru başlasın
}

function draw() {
  // Arka planı temizle ve çiz
  ctx.fillStyle = "rgb(211, 195, 195)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 1. Raket (Sol - Yeşil)
  ctx.fillStyle = "rgb(0, 255, 34)";
  ctx.fillRect(10, racket1Y, racketWidth, racketHeight);

  // 2. Raket (Sağ - Yeşil)
  ctx.fillRect(canvas.width - 20, racket2Y, racketWidth, racketHeight);

  // Top (Kırmızı)
  ctx.fillStyle = "rgb(255, 0, 0)";
  ctx.beginPath();
  ctx.arc(ballX, ballY, ballRadius, 0, 2 * Math.PI);
  ctx.fill();

  // Skorlar
  ctx.fillStyle = "rgb(255, 255, 255)";
  ctx.font = "30px Arial";
  ctx.fillText(score1, canvas.width / 4, 50);
  ctx.fillText(score2, (canvas.width * 3) / 4, 50);
}

function update() {
  // Hareketleri güncelle
  ballX += ballSpeedX;
  ballY += ballSpeedY;

  // Üst ve alt duvarlara çarpma kontrolü
  if (ballY - ballRadius <= 0 || ballY + ballRadius >= canvas.height) {
    ballSpeedY = -ballSpeedY;
  }

  // SOL RAKET ÇARPIŞMA KONTROLÜ
if (
  ballX - ballRadius <= 20 && // Raketin sağ kenarına ulaştı mı? (Genişliğe göre ayarlı)
  ballY >= racket1Y && 
  ballY <= racket1Y + racketHeight
) {
  ballSpeedX = Math.abs(ballSpeedX); // Hızı kesinlikle POZİTİF (sağa doğru) yap
  ballX = 20 + ballRadius; // Topu raketin hemen dışına ışınla (Sıkışmayı önleyen kritik satır!)
}

// SAĞ RAKET ÇARPIŞMA KONTROLÜ
if (
  ballX + ballRadius >= canvas.width - 20 && // Raketin sol kenarına ulaştı mı?
  ballY >= racket2Y && 
  ballY <= racket2Y + racketHeight
) {
  ballSpeedX = -Math.abs(ballSpeedX); // Hızı kesinlikle NEGATİF (sola doğru) yap
  ballX = canvas.width - 20 - ballRadius; // Topu raketin hemen dışına ışınla!
}

  // Sayı olma durumları (Sağ ve sol duvarlar)
  if (ballX <= 0) {
    score2++;
    resetBall();
  }
  if (ballX >= canvas.width) {
    score1++;
    resetBall();
  }

  // Raket Hareketleri (1. Oyuncu: W/S | 2. Oyuncu: Ok Tuşları)
  if (keys["w"] || keys["W"]) racket1Y = Math.max(0, racket1Y - 5);
  if (keys["s"] || keys["S"]) racket1Y = Math.min(canvas.height - racketHeight, racket1Y + 5);
  
  if (keys["ArrowUp"]) racket2Y = Math.max(0, racket2Y - 5);
  if (keys["ArrowDown"]) racket2Y = Math.min(canvas.height - racketHeight, racket2Y + 5);

  draw();
  requestAnimationFrame(update);
}

const keys = {};

document.addEventListener("keydown", (e) => { keys[e.key] = true; });
document.addEventListener("keyup", (e) => { keys[e.key] = false; });

// Oyunu başlat
update();