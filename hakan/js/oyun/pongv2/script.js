console.log("Hata Yapabilen Yapay Zekalı Profesyonel Pong Oyunu Yüklendi.");

const canvas = document.querySelector(".canvas");
const ctx = canvas.getContext("2d");

// --- OYUN AYARLARI VE NESNELERİ ---

// Oyuncu Raketi (Sol)
const player = {
    x: 10,
    y: canvas.height / 2 - 50,
    width: 12,
    height: 100,
    color: "#00ffcc", // Neon Turkuaz
    score: 0,
    speed: 7
};

// Yapay Zeka Raketi (Sağ)
const ai = {
    x: canvas.width - 22,
    y: canvas.height / 2 - 50,
    width: 12,
    height: 100,
    color: "#ff0055", // Neon Pembe
    score: 0,
    speed: 5.5,       // Takip hızı
    targetOffset: 0   // Yapay zekanın "insani" hata payı sapması
};

// Top Nesnesi
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 8,
    speed: 6,
    velocityX: 6,
    velocityY: 6,
    color: "#ffffff"
};

// --- YARDIMCI ÇİZİM FONKSİYONLARI ---

function drawRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

function drawCircle(x, y, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
}

function drawText(text, x, y, color) {
    ctx.fillStyle = color;
    ctx.font = "bold 45px sans-serif";
    ctx.fillText(text, x, y);
}

function drawNet() {
    for (let i = 0; i <= canvas.height; i += 15) {
        drawRect(canvas.width / 2 - 1, i, 2, 10, "rgba(255, 255, 255, 0.2)");
    }
}

// Top ve Yapay Zeka Hedefini Sıfırlama
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.velocityX = -ball.velocityX; // Sayıyı yiyen tarafa doğru fırlat
    ball.speed = 6;                  // Hızı başlangıç değerine çek
    ai.targetOffset = 0;             // Yeni turda hata payını temizle
}

// Çarpışma Algılama (Kutu Çarpışma Testi)
function collision(b, p) {
    return (
        b.x + b.radius > p.x &&
        b.x - b.radius < p.x + p.width &&
        b.y + b.radius > p.y &&
        b.y - b.radius < p.y + p.height
    );
}

// --- ANA OYUN MANTIĞI (UPDATE) ---

function update() {
    // 1. Topun Pozisyonunu İlerlet
    ball.x += ball.velocityX;
    ball.y += ball.velocityY;

    // 2. Yapay Zeka Hareketi (Hata Payı Algoritmalı)
    // Sadece topun merkezini değil, top merkezi + rastgele hesaplanan sapmayı hedefliyor
    let aiTarget = ball.y - ai.height / 2 + ai.targetOffset;
    ai.y += (aiTarget - ai.y) * 0.08; // Yumuşak takip etkisi

    // Yapay zekanın ekrandan dışarı taşmasını engelle
    ai.y = Math.max(0, Math.min(canvas.height - ai.height, ai.y));

    // 3. Oyuncu Raketinin Hareketi (W-S veya Yön Tuşları)
    if (keys["w"] || keys["W"] || keys["ArrowUp"]) {
        player.y = Math.max(0, player.y - player.speed);
    }
    if (keys["s"] || keys["S"] || keys["ArrowDown"]) {
        player.y = Math.min(canvas.height - player.height, player.y + player.speed);
    }

    // 4. Alt ve Üst Duvarlardan Sekme (Burada sıkışma yaşanmaz)
    if (ball.y - ball.radius < 0) {
        ball.velocityY = Math.abs(ball.velocityY);
    } else if (ball.y + ball.radius > canvas.height) {
        ball.velocityY = -Math.abs(ball.velocityY);
    }

    // 5. Raket Çarpışma Yönetimi
    let playerPaddle = ball.x < canvas.width / 2 ? player : ai;

    if (collision(ball, playerPaddle)) {
        // Profesyonel Fizik: Top raketin neresine çarptıysa ona göre açı ver
        let collidePoint = ball.y - (playerPaddle.y + playerPaddle.height / 2);
        collidePoint = collidePoint / (playerPaddle.height / 2); // Değeri -1 ile 1 arasına normalize et

        let angleRad = (Math.PI / 4) * collidePoint; // Maksimum 45 derecelik açı
        let direction = ball.x < canvas.width / 2 ? 1 : -1;

        // Yeni hız bileşenlerini ata
        ball.velocityX = direction * ball.speed * Math.cos(angleRad);
        ball.velocityY = ball.speed * Math.sin(angleRad);

        // --- SIKIŞMAYI ÖNLEYEN POZİSYON SABİTLEME ---
        if (direction === 1) {
            ball.x = player.x + player.width + ball.radius; // Sol raketin dışına sabitle
        } else {
            ball.x = ai.x - ball.radius; // Sağ raketin dışına sabitle
        }

        // --- YAPAY ZEKA İÇİN YENİ HATA PAYI ÜRET ---
        // Top her rakete çarptığında bir sonraki hamle için -45px ile +45px arası sapma üretir
        ai.targetOffset = (Math.random() - 0.5) * 90;

        // Oyun heyecanını artırmak için topu her vuruşta biraz hızlandır
        ball.speed += 0.4;
    }

    // 6. Skor ve Sayı Olma Durumu
    if (ball.x - ball.radius < 0) {
        ai.score++;
        resetBall();
    } else if (ball.x + ball.radius > canvas.width) {
        player.score++;
        resetBall();
    }
}

// --- EKRANA ÇİZİM MANTIĞI (RENDER) ---

function render() {
    // Koyu modern arka plan temizliği
    drawRect(0, 0, canvas.width, canvas.height, "#1a1a2e");

    // File/Orta çizgi
    drawNet();

    // Skor Tablosu
    drawText(player.score, canvas.width / 4, 60, "rgba(255, 255, 255, 0.6)");
    drawText(ai.score, (canvas.width * 3) / 4, 60, "rgba(255, 255, 255, 0.6)");

    // Sol Oyuncu Raketi
    drawRect(player.x, player.y, player.width, player.height, player.color);

    // Sağ Yapay Zeka Raketi
    drawRect(ai.x, ai.y, ai.width, ai.height, ai.color);

    // Top
    drawCircle(ball.x, ball.y, ball.radius, ball.color);
}

// --- KLAVYE DİNLEYİCİLERİ VE OYUN DÖNGÜSÜ ---

const keys = {};
document.addEventListener("keydown", (e) => (keys[e.key] = true));
document.addEventListener("keyup", (e) => (keys[e.key] = false));

function gameLoop() {
    update();
    render();
    requestAnimationFrame(gameLoop);
}

// Oyunu Resmi Olarak Başlat
gameLoop();