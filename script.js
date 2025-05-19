let board;
let score = 0;
let currentMode = 'classic';
const boardSize = 4;
let timer = null;
let timeLeft = 60;

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("classic-btn").addEventListener("click", () => startGame("classic"));
  document.getElementById("timed-btn").addEventListener("click", () => startGame("timed"));
  document.getElementById("hardcore-btn").addEventListener("click", () => startGame("hardcore"));
  document.getElementById("infinite-btn").addEventListener("click", () => startGame("infinite"));
  document.getElementById("back-btn").addEventListener("click", backToMenu);
  document.addEventListener("keydown", handleKey);
  resetGame();
});

function startGame(mode) {
  currentMode = mode;
  document.getElementById("main-menu").classList.add("hidden");
  document.getElementById("game-container").classList.remove("hidden");
  document.getElementById("mode-name").textContent = `${capitalize(mode)} Mode`;

  // Show timer only in timed and hardcore modes
  const timerDiv = document.getElementById("timer");
  if (mode === "timed" || mode === "hardcore") {
    timerDiv.classList.remove("hidden");
  } else {
    timerDiv.classList.add("hidden");
  }

  resetGame();

  if (mode === 'timed') {
    timeLeft = 60;
    startTimer();
  } else if (mode === 'hardcore') {
    timeLeft = 10;
    startTimer(true);
  }
}

function backToMenu() {
  clearInterval(timer);
  document.getElementById("main-menu").classList.remove("hidden");
  document.getElementById("game-container").classList.add("hidden");
}

function resetGame() {
  board = Array.from({ length: boardSize }, () => Array(boardSize).fill(0));
  score = 0;
  updateScore();
  clearInterval(timer);
  updateTimeLeftDisplay();
  addRandomTile();
  addRandomTile();
  drawBoard();
}

function updateScore() {
  document.getElementById("score").textContent = score;
}

function updateTimeLeftDisplay() {
  document.getElementById("time-left").textContent = timeLeft;
}

function drawBoard() {
  const boardElement = document.getElementById("game-board");
  boardElement.innerHTML = "";
  for (let r = 0; r < boardSize; r++) {
    for (let c = 0; c < boardSize; c++) {
      const tile = document.createElement("div");
      tile.className = "tile";
      tile.textContent = board[r][c] === 0 ? "" : board[r][c];
      boardElement.appendChild(tile);
    }
  }
}

function addRandomTile() {
  let empty = [];
  for (let r = 0; r < boardSize; r++) {
    for (let c = 0; c < boardSize; c++) {
      if (board[r][c] === 0) empty.push([r, c]);
    }
  }
  if (empty.length > 0) {
    const [r, c] = empty[Math.floor(Math.random() * empty.length)];
    board[r][c] = Math.random() < 0.9 ? 2 : 4;
  }
}

function handleKey(e) {
  const key = e.key.toLowerCase();
  let moved = false;

  switch (key) {
    case "arrowup":
    case "w":
      moved = moveUp(); break;
    case "arrowdown":
    case "s":
      moved = moveDown(); break;
    case "arrowleft":
    case "a":
      moved = moveLeft(); break;
    case "arrowright":
    case "d":
      moved = moveRight(); break;
  }

  if (moved) {
    const moveSound = document.getElementById("move-sound");
    if (moveSound) moveSound.play();
    addRandomTile();
    drawBoard();
  }

  if (currentMode === "hardcore") {
    timeLeft = 10;
    updateTimeLeftDisplay();
  }
}

function moveLeft() {
  let moved = false;
  const mergeSound = document.getElementById("merge-sound");
  for (let r = 0; r < boardSize; r++) {
    let row = board[r].filter(x => x !== 0);
    for (let i = 0; i < row.length - 1; i++) {
      if (row[i] === row[i + 1]) {
        row[i] *= 2;
        score += row[i];
        if (mergeSound) mergeSound.play();
        row[i + 1] = 0;
        i++;
      }
    }
    row = row.filter(x => x !== 0);
    while (row.length < boardSize) row.push(0);
    if (board[r].toString() !== row.toString()) moved = true;
    board[r] = row;
  }
  updateScore();
  return moved;
}

function moveRight() {
  flipBoard();
  const moved = moveLeft();
  flipBoard();
  return moved;
}

function moveUp() {
  rotateBoardLeft();
  const moved = moveLeft();
  rotateBoardRight();
  return moved;
}

function moveDown() {
  rotateBoardRight();
  const moved = moveLeft();
  rotateBoardLeft();
  return moved;
}

function flipBoard() {
  for (let r = 0; r < boardSize; r++) {
    board[r].reverse();
  }
}

function rotateBoardLeft() {
  const newBoard = Array.from({ length: boardSize }, () => Array(boardSize).fill(0));
  for (let r = 0; r < boardSize; r++) {
    for (let c = 0; c < boardSize; c++) {
      newBoard[boardSize - c - 1][r] = board[r][c];
    }
  }
  board = newBoard;
}

function rotateBoardRight() {
  const newBoard = Array.from({ length: boardSize }, () => Array(boardSize).fill(0));
  for (let r = 0; r < boardSize; r++) {
    for (let c = 0; c < boardSize; c++) {
      newBoard[c][boardSize - r - 1] = board[r][c];
    }
  }
  board = newBoard;
}

function startTimer(resetOnZero = false) {
  updateTimeLeftDisplay();
  clearInterval(timer);
  timer = setInterval(() => {
    timeLeft--;
    updateTimeLeftDisplay();
    if (timeLeft <= 0) {
      clearInterval(timer);
      if (resetOnZero) {
        alert("⏱️ Time’s up! Restarting Hardcore Mode.");
        resetGame();
        startTimer(true);
      } else {
        alert(`Game Over! Final Score: ${score}`);
        backToMenu();
      }
    }
  }, 1000);
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
