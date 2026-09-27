// ==========================================
// Game State & DOM References
// ==========================================
const questionwindow = document.getElementById("askquestion");
const gamewindow = document.getElementById("gmwindow");
const xbtn = document.getElementById("xbtn");
const obtn = document.getElementById("obtn");
const startGameBtn = document.getElementById("startGameBtn");
const player1Input = document.getElementById("player1name");
const player2Input = document.getElementById("player2name");

const p1Card = document.getElementById("p1Card");
const p2Card = document.getElementById("p2Card");
const p1DisplayName = document.getElementById("p1DisplayName");
const p2DisplayName = document.getElementById("p2DisplayName");
const p1DisplayChoice = document.getElementById("p1DisplayChoice");
const p2DisplayChoice = document.getElementById("p2DisplayChoice");
const p1ScoreEl = document.getElementById("p1Score");
const p2ScoreEl = document.getElementById("p2Score");
const tieScoreEl = document.getElementById("tieScore");

const turnshower = document.getElementById("turnshower");
const turnText = document.getElementById("turnText");
const tiles = Array.from(document.querySelectorAll(".tile"));

const nextRoundBtn = document.getElementById("nextRoundBtn");
const playagainBtn = document.getElementById("playagain");
const resetScoresBtn = document.getElementById("restrt");
const newMatchBtn = document.getElementById("newMatchBtn");

// State
let player1Name = "Player 1";
let player2Name = "Player 2";
let p1Choice = "X";
let p2Choice = "O";
let p1Score = 0;
let p2Score = 0;
let tieScore = 0;

let currentTurn = "X"; // "X" or "O"
let roundStarter = "X";
let count = 0;
let isGameOver = false;
let boardState = ["", "", "", "", "", "", "", "", ""];

const winningCombos = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]             // Diagonals
];

// Setup Elements
const p1SymbolTag = document.getElementById("p1SymbolTag");
const p2SymbolTag = document.getElementById("p2SymbolTag");

const coolNames = [
    "CyberNova", "PixelKing", "Viper", "Phoenix", "Shadow", 
    "NeonPulse", "Titan", "Blaze", "FrostByte", "Echo", 
    "Maverick", "Vortex", "Apex", "Zenith", "Specter", "ZeroCool"
];

function getRandomName(exclude = "") {
    const filtered = coolNames.filter(n => n !== exclude);
    return filtered[Math.floor(Math.random() * filtered.length)];
}

// Wire up dice randomizer buttons
document.querySelectorAll(".btn-random-name").forEach(btn => {
    btn.addEventListener("click", () => {
        sounds.playClick();
        const targetId = btn.dataset.target;
        const input = document.getElementById(targetId);
        if (input) {
            const otherVal = targetId === "player1name" ? (player2Input ? player2Input.value : "") : (player1Input ? player1Input.value : "");
            input.value = getRandomName(otherVal);
            input.focus();
        }
    });
});

// Wire up clear input buttons
document.querySelectorAll(".btn-clear-input").forEach(btn => {
    btn.addEventListener("click", () => {
        sounds.playClick();
        const targetId = btn.dataset.target;
        const input = document.getElementById(targetId);
        if (input) {
            input.value = "";
            input.focus();
        }
    });
});

// ==========================================
// Setup & Side Choice Handling
// ==========================================
let chosenSide = "X";

if (xbtn && obtn) {
    xbtn.addEventListener("click", () => {
        sounds.playClick();
        chosenSide = "X";
        xbtn.classList.add("selected");
        obtn.classList.remove("selected");
        if (p1SymbolTag) p1SymbolTag.innerText = "X";
        if (p2SymbolTag) p2SymbolTag.innerText = "O";
    });

    obtn.addEventListener("click", () => {
        sounds.playClick();
        chosenSide = "O";
        obtn.classList.add("selected");
        xbtn.classList.remove("selected");
        if (p1SymbolTag) p1SymbolTag.innerText = "O";
        if (p2SymbolTag) p2SymbolTag.innerText = "X";
    });
}

if (startGameBtn) {
    startGameBtn.addEventListener("click", startMatch);
}

function startMatch() {
    sounds.playClick();
    
    player1Name = player1Input.value.trim() || "Player 1";
    player2Name = player2Input.value.trim() || "Player 2";
    
    p1Choice = chosenSide;
    p2Choice = chosenSide === "X" ? "O" : "X";
    
    // Update Scoreboard Header Details
    p1DisplayName.innerText = player1Name;
    p2DisplayName.innerText = player2Name;
    p1DisplayChoice.innerText = `Plays ${p1Choice}`;
    p2DisplayChoice.innerText = `Plays ${p2Choice}`;
    
    p1Score = 0;
    p2Score = 0;
    tieScore = 0;
    updateScoreboardUI();

    // Transition from setup to active game
    questionwindow.style.display = "none";
    gamewindow.style.display = "flex";

    roundStarter = "X"; // "X" always makes first move in Tic Tac Toe
    resetBoard();
}

// ==========================================
// Turn & Scoreboard Management
// ==========================================
function updateTurnUI() {
    const isP1Turn = currentTurn === p1Choice;
    const activePlayerName = isP1Turn ? player1Name : player2Name;
    const activeChoice = currentTurn;

    turnText.innerText = `${activePlayerName}'s Turn (${activeChoice})`;

    if (isP1Turn) {
        p1Card.classList.add("active-turn");
        p2Card.classList.remove("active-turn");
    } else {
        p2Card.classList.add("active-turn");
        p1Card.classList.remove("active-turn");
    }

    // Set pulse dot color to match current player
    const pulseDot = document.querySelector(".pulse-dot");
    if (pulseDot) {
        pulseDot.style.backgroundColor = activeChoice === "X" ? "var(--color-x)" : "var(--color-o)";
        pulseDot.style.boxShadow = `0 0 10px ${activeChoice === "X" ? "var(--color-x)" : "var(--color-o)"}`;
    }
}

function updateScoreboardUI() {
    p1ScoreEl.innerText = p1Score;
    p2ScoreEl.innerText = p2Score;
    tieScoreEl.innerText = tieScore;
}

// ==========================================
// Gameplay Logic
// ==========================================
tiles.forEach((tile, index) => {
    tile.addEventListener("click", () => handleTileClick(tile, index));
});

function handleTileClick(tile, index) {
    if (isGameOver || boardState[index] !== "") return;

    // Apply mark
    boardState[index] = currentTurn;
    tile.innerText = currentTurn;
    tile.classList.add(currentTurn === "X" ? "tile-x" : "tile-o");
    tile.disabled = true;

    sounds.playMove(currentTurn === "X");
    count++;

    // Evaluate Win / Tie
    const winResult = checkWinner();

    if (winResult) {
        handleWin(winResult);
    } else if (count >= 9) {
        handleTie();
    } else {
        // Toggle turn
        currentTurn = currentTurn === "X" ? "O" : "X";
        updateTurnUI();
    }
}

function checkWinner() {
    for (let i = 0; i < winningCombos.length; i++) {
        const [a, b, c] = winningCombos[i];
        if (
            boardState[a] !== "" &&
            boardState[a] === boardState[b] &&
            boardState[b] === boardState[c]
        ) {
            return {
                winnerChoice: boardState[a],
                combo: [a, b, c]
            };
        }
    }
    return null;
}

function handleWin(winResult) {
    isGameOver = true;
    
    // Highlight winning tiles
    winResult.combo.forEach(idx => {
        tiles[idx].classList.add("winner-tile");
    });

    // Disable all remaining tiles
    tiles.forEach(t => (t.disabled = true));

    const isP1Winner = winResult.winnerChoice === p1Choice;
    const winnerName = isP1Winner ? player1Name : player2Name;

    if (isP1Winner) {
        p1Score++;
    } else {
        p2Score++;
    }
    updateScoreboardUI();

    // Small delay for victory modal pop
    setTimeout(() => {
        gameDone(winnerName);
    }, 450);
}

function handleTie() {
    isGameOver = true;
    tieScore++;
    updateScoreboardUI();

    setTimeout(() => {
        gameDone("Tied");
    }, 400);
}

// ==========================================
// Round & Reset Handlers
// ==========================================
function resetBoard() {
    boardState = ["", "", "", "", "", "", "", "", ""];
    count = 0;
    isGameOver = false;

    tiles.forEach(tile => {
        tile.innerText = "";
        tile.className = "tile";
        tile.disabled = false;
    });

    currentTurn = roundStarter;
    updateTurnUI();
}

function nextRound() {
    sounds.playClick();
    closeOverlay();
    confetti.clear();

    // Alternate who starts each round
    roundStarter = roundStarter === "X" ? "O" : "X";
    resetBoard();
}

if (nextRoundBtn) nextRoundBtn.addEventListener("click", nextRound);
if (playagainBtn) playagainBtn.addEventListener("click", nextRound);

if (resetScoresBtn) {
    resetScoresBtn.addEventListener("click", () => {
        sounds.playClick();
        p1Score = 0;
        p2Score = 0;
        tieScore = 0;
        updateScoreboardUI();
        roundStarter = "X";
        resetBoard();
    });
}

if (newMatchBtn) {
    newMatchBtn.addEventListener("click", () => {
        sounds.playClick();
        closeOverlay();
        confetti.clear();
        gamewindow.style.display = "none";
        questionwindow.style.display = "block";
    });
}