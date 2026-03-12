//board
let board;
const rowCount = 21;
const columnCount = 19;
const tileSize = 32;
const boardWidth = columnCount * tileSize;
const boardHeight = rowCount * tileSize;
// let boardWidth = Math.min(32*19, window.innerWidth);
// let boardHeight = Math.min(21*32, window.innerHeight);
let context;

let blueGhostImage;
let orangeGhostImage;
let pinkGhostImage;
let redGhostImage;
let pacmanUpImage;
let pacmanDownImage;
let pacmanLeftImage;
let pacmanRightImage;
let wallImage;

//X = wall, O = skip, P = pac man, ' ' = food
//Ghosts: b = blue, o = orange, p = pink, r = red
const tileMap = [
  "XXXXXXXXXXXXXXXXXXX",
  "X        X        X",
  "X XX XXX X XXX XX X",
  "X                 X",
  "X XX X XXXXX X XX X",
  "X    X       X    X",
  "XXXX XXXX XXXX XXXX",
  "OOOX X       X XOOO",
  "XXXX X XXrXX X XXXX",
  "O       bpo       O",
  "XXXX X XXXXX X XXXX",
  "OOOX X       X XOOO",
  "XXXX X XXXXX X XXXX",
  "X        X        X",
  "X XX XXX X XXX XX X",
  "X  X     P     X  X",
  "XX X X XXXXX X X XX",
  "X    X   X   X    X",
  "X XXXXXX X XXXXXX X",
  "X                 X",
  "XXXXXXXXXXXXXXXXXXX",
];

const walls = new Set();
const foods = new Set();
const ghosts = new Set();
let pacman;
const directions = ["U", "D", "L", "R"];
let score = 0;
let lives = 3;
let gameOver = false;

window.onload = function () {
  board = document.getElementById("board");
  board.height = boardHeight;
  board.width = boardWidth;
  context = board.getContext("2d");

  loadImages();
  
};


function loadImages() {
  blueGhostImage = new Image();
  blueGhostImage.src = "blueGhost.png";
  orangeGhostImage = new Image();
  orangeGhostImage.src = "orangeGhost.png";
  pinkGhostImage = new Image();
  pinkGhostImage.src = "pinkGhost.png";
  redGhostImage = new Image();
  redGhostImage.src = "redGhost.png";
  pacmanUpImage = new Image();
  pacmanUpImage.src = "pacmanUp.png";
  pacmanDownImage = new Image();
  pacmanDownImage.src = "pacmanDown.png";
  pacmanLeftImage = new Image();
  pacmanLeftImage.src = "pacmanLeft.png";
  pacmanRightImage = new Image();
  pacmanRightImage.src = "pacmanRight.png";
  wallImage = new Image();
  wallImage.src = "wall.png";
}

function loadMap() {
  walls.clear();
  foods.clear();
  ghosts.clear();
}

const Block = {
  constructor(image, x, y, width, height) {
    this.image = image;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    this.startX = x;
    this.startY = y;
  }
}