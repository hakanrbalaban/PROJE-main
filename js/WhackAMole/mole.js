let currentMoleTile;
let currentPlantTile;
let score = 0;
let gameOver = false;
let moleInterval;
let plantInterval;

window.onload = function () {
    document.getElementById("restart").addEventListener("click", setGame);
    setGame(); // Sayfa açılınca oyun başlasın
}

function setGame() {

    // Her şeyi resetle
    score = 0;
    gameOver = false;
    currentMoleTile = null;
    currentPlantTile = null;
    document.getElementById("score").innerText = score;

    // Board'u sıfırla
    const board = document.getElementById("board");
    board.innerHTML = "";

    // Tile'ları tekrar oluştur
    for (let i = 0; i < 9; i++) {
        let tile = document.createElement("div");
        tile.id = i.toString();
        tile.addEventListener("click", selectTile);
        board.appendChild(tile);
    }

    // Önceki interval'ları temizle
    clearInterval(moleInterval);
    clearInterval(plantInterval);

    // Yeni interval'lar başlat
    moleInterval = setInterval(setMole, 1000);
    plantInterval = setInterval(setPlant, 2000);
}

function getRandomTile() {
    return Math.floor(Math.random() * 9).toString();
}

function setMole() {
    if (gameOver) return;

    if (currentMoleTile) currentMoleTile.innerHTML = "";

    let mole = document.createElement("img");
    mole.src = "./monty-mole.png";

    let num = getRandomTile();

    if (currentPlantTile && currentPlantTile.id === num) return;

    currentMoleTile = document.getElementById(num);
    currentMoleTile.appendChild(mole);
}

function setPlant() {
    if (gameOver) return;

    if (currentPlantTile) currentPlantTile.innerHTML = "";

    let plant = document.createElement("img");
    plant.src = "./piranha-plant.png";

    let num = getRandomTile();

    if (currentMoleTile && currentMoleTile.id === num) return;

    currentPlantTile = document.getElementById(num);
    currentPlantTile.appendChild(plant);
}

function selectTile() {
    if (gameOver) return;

    if (this === currentMoleTile) {
        score += 10;
        document.getElementById("score").innerText = score;
    }
    else if (this === currentPlantTile) {
        document.getElementById("score").innerText = "GAME OVER — Score: " + score;
        gameOver = true;
    }
}
