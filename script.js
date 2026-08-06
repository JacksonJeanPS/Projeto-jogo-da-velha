const cellElements = document.querySelectorAll("[data-cell]");
const board = document.querySelector("[data-board]");
const statusElement = document.querySelector("[data-status]");
const playerIndicator = document.querySelector("[data-player-indicator]");
const restartButton = document.querySelector("[data-restart-button]");
const winningMessage = document.querySelector("[data-winning-message]");
const winningMessageText = document.querySelector("[data-winning-message-text]");
const winningMessageButton = document.querySelector("[data-winning-message-button]");
const scoreBoard = document.querySelector("[data-score-board]");
const scoreXElement = document.querySelector("[data-score-x]");
const scoreOElement = document.querySelector("[data-score-o]");
const scoreDrawElement = document.querySelector("[data-score-draw]");
const clearScoreButton = document.querySelector("[data-clear-score]");
const modeButtons = document.querySelectorAll("[data-mode-btn]");

const PLAYERS = {
    X: "X",
    O: "O"
};

const MODES = {
    PVP: "pvp",
    PVC: "pvc"
};

const WINNING_COMBINATIONS = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

const gameState = {
    board: Array(9).fill(null),
    currentPlayer: PLAYERS.X,
    isGameActive: true,
    winningCombination: null,
    mode: MODES.PVP
};

const scoreState = {
    X: 0,
    O: 0,
    draw: 0
};

let focusedCellIndex = 0;

function init() {
    gameState.board = Array(9).fill(null);
    gameState.currentPlayer = PLAYERS.X;
    gameState.isGameActive = true;
    gameState.winningCombination = null;
    gameState.mode = gameState.mode || MODES.PVP;
    focusedCellIndex = 0;

    cellElements.forEach((cell) => {
        cell.classList.remove(PLAYERS.X, PLAYERS.O, "winner");
        cell.textContent = "";
        cell.removeEventListener("click", handleCellClick);
        cell.addEventListener("click", handleCellClick);
        cell.setAttribute("tabindex", "-1");
    });

    board.setAttribute("aria-hidden", "false");
    winningMessage.setAttribute("aria-hidden", "true");

    setBoardHoverClass();
    winningMessage.classList.remove("show");
    updateAriaLabels();
    updateStatus();
    loadScore();
    renderScore();
    focusCell(focusedCellIndex);
}

function updateAriaLabels() {
    cellElements.forEach((cell, index) => {
        const row = Math.floor(index / 3) + 1;
        const col = (index % 3) + 1;
        const mark = gameState.board[index];
        if (mark) {
            cell.setAttribute("aria-label", `Posição ${row}, ${col} - Marcada com ${mark === PLAYERS.X ? "X" : "O"}`);
        } else {
            cell.setAttribute("aria-label", `Posição ${row}, ${col} - Vazia`);
        }
    });
}

function renderBoard() {
    gameState.board.forEach((mark, index) => {
        const cell = cellElements[index];
        cell.textContent = mark || "";
        cell.classList.remove(PLAYERS.X, PLAYERS.O);
        if (mark) {
            cell.classList.add(mark);
        }
    });
    updateAriaLabels();
}

function focusCell(index) {
    focusedCellIndex = index;
    cellElements[index].focus();
}

function handleBoardKeyDown(e) {
    if (!gameState.isGameActive) {
        return;
    }

    const key = e.key;
    const row = Math.floor(focusedCellIndex / 3);
    const col = focusedCellIndex % 3;

    e.preventDefault();

    switch (key) {
        case "ArrowLeft":
            if (col > 0) {
                focusCell(focusedCellIndex - 1);
            }
            break;
        case "ArrowRight":
            if (col < 2) {
                focusCell(focusedCellIndex + 1);
            }
            break;
        case "ArrowUp":
            if (row > 0) {
                focusCell(focusedCellIndex - 3);
            }
            break;
        case "ArrowDown":
            if (row < 2) {
                focusCell(focusedCellIndex + 3);
            }
            break;
        case "Enter":
        case " ":
            cellElements[focusedCellIndex].click();
            break;
    }
}

function handleCellClick(e) {
    const cell = e.target;
    const index = parseInt(cell.dataset.index);

    if (!gameState.isGameActive || gameState.board[index]) {
        return;
    }

    gameState.board[index] = gameState.currentPlayer;
    renderBoard();
    cell.focus();

    const result = checkWinner();

    if (result.winner) {
        highlightWinningCells(result.winningCombination);
        endGame(false, result.winner, result.winningCombination);
    } else if (checkDraw()) {
        endGame(true);
    } else {
        swapTurns();
        if (gameState.mode === MODES.PVC && gameState.currentPlayer === PLAYERS.O) {
            makeAIMove();
        }
    }
}

function checkWinner(board = gameState.board) {
    for (const combination of WINNING_COMBINATIONS) {
        const [a, b, c] = combination;
        if (
            board[a] &&
            board[a] === board[b] &&
            board[a] === board[c]
        ) {
            return {
                winner: board[a],
                winningCombination: combination
            };
        }
    }
    return { winner: null, winningCombination: null };
}

function checkDraw(board = gameState.board) {
    return board.every((cell) => cell !== null);
}

function minimax(board, depth, isMaximizing) {
    const result = checkWinner(board);

    if (result.winner === PLAYERS.O) return 10 - depth;
    if (result.winner === PLAYERS.X) return depth - 10;
    if (checkDraw(board)) return 0;

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === null) {
                board[i] = PLAYERS.O;
                let score = minimax(board, depth + 1, false);
                board[i] = null;
                if (score > bestScore) bestScore = score;
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === null) {
                board[i] = PLAYERS.X;
                let score = minimax(board, depth + 1, true);
                board[i] = null;
                if (score < bestScore) bestScore = score;
            }
        }
        return bestScore;
    }
}

function getAIMove() {
    let bestScore = -Infinity;
    let move = null;

    for (let i = 0; i < 9; i++) {
        if (gameState.board[i] === null) {
            gameState.board[i] = PLAYERS.O;
            let score = minimax(gameState.board, 0, false);
            gameState.board[i] = null;
            if (score > bestScore) {
                bestScore = score;
                move = i;
            }
        }
    }

    return move;
}

function makeAIMove() {
    statusElement.classList.add("thinking");
    statusElement.innerHTML = 'O computador está pensando... <span class="player-indicator">O</span>';

    setTimeout(() => {
        const index = getAIMove();
        if (index !== null && gameState.isGameActive) {
            gameState.board[index] = PLAYERS.O;
            renderBoard();
            cellElements[index].scrollIntoView({ block: "nearest" });

            const result = checkWinner();
            if (result.winner) {
                highlightWinningCells(result.winningCombination);
                endGame(false, result.winner, result.winningCombination);
            } else if (checkDraw()) {
                endGame(true);
            } else {
                swapTurns();
            }
        }
    }, 400);
}

function handleModeChange(e) {
    modeButtons.forEach((btn) => {
        btn.classList.remove("active");
        btn.setAttribute("aria-pressed", "false");
    });
    e.target.classList.add("active");
    e.target.setAttribute("aria-pressed", "true");
    gameState.mode = e.target.value;
    resetGame();
}

function highlightWinningCells(combination) {
    combination.forEach((index) => {
        cellElements[index].classList.add("winner");
    });
}

function endGame(isDraw, winner = null, winningCombination = null) {
    gameState.isGameActive = false;
    gameState.winningCombination = winningCombination;

    if (isDraw) {
        statusElement.textContent = "Empate!";
        statusElement.classList.add("draw");
        statusElement.classList.remove("win");
        winningMessageText.textContent = "Deu velha!";
        winningMessageText.classList.add("draw");
        winningMessageText.classList.remove("win");
        playerIndicator.textContent = "";
    } else {
        statusElement.innerHTML = `${winner} venceu!`;
        statusElement.classList.add("win");
        statusElement.classList.remove("draw");
        winningMessageText.textContent = `${winner} venceu!`;
        winningMessageText.classList.add("win");
        winningMessageText.classList.remove("draw");
        playerIndicator.textContent = "";
    }

    board.classList.remove("X", "O");
    winningMessage.classList.add("show");
    winningMessage.setAttribute("aria-hidden", "false");
    board.setAttribute("aria-hidden", "true");

    updateScore(isDraw ? null : winner);
}

function updateStatus() {
    statusElement.classList.remove("win", "draw", "thinking");
    playerIndicator.textContent = gameState.currentPlayer;
    playerIndicator.className = "player-indicator " + gameState.currentPlayer;
}

function swapTurns() {
    gameState.currentPlayer =
        gameState.currentPlayer === PLAYERS.X ? PLAYERS.O : PLAYERS.X;
    setBoardHoverClass();
    updateStatus();
}

function setBoardHoverClass() {
    board.classList.remove(PLAYERS.X, PLAYERS.O);
    board.classList.add(
        gameState.currentPlayer === PLAYERS.O ? PLAYERS.O : PLAYERS.X
    );
}

function resetGame() {
    init();
}

function loadScore() {
    const savedScore = localStorage.getItem("jogoDaVelhaScore");
    if (savedScore) {
        try {
            const parsed = JSON.parse(savedScore);
            scoreState.X = parsed.X || 0;
            scoreState.O = parsed.O || 0;
            scoreState.draw = parsed.draw || 0;
        } catch (e) {
            scoreState.X = 0;
            scoreState.O = 0;
            scoreState.draw = 0;
        }
    }
}

function saveScore() {
    localStorage.setItem(
        "jogoDaVelhaScore",
        JSON.stringify(scoreState)
    );
}

function updateScore(winner) {
    if (winner === PLAYERS.X) {
        scoreState.X++;
    } else if (winner === PLAYERS.O) {
        scoreState.O++;
    } else {
        scoreState.draw++;
    }
    saveScore();
    renderScore();
}

function renderScore() {
    if (scoreXElement) scoreXElement.textContent = scoreState.X;
    if (scoreOElement) scoreOElement.textContent = scoreState.O;
    if (scoreDrawElement) scoreDrawElement.textContent = scoreState.draw;
}

function clearScore() {
    scoreState.X = 0;
    scoreState.O = 0;
    scoreState.draw = 0;
    saveScore();
    renderScore();
}

restartButton.addEventListener("click", resetGame);
winningMessageButton.addEventListener("click", resetGame);
board.addEventListener("keydown", handleBoardKeyDown);
clearScoreButton.addEventListener("click", clearScore);
modeButtons.forEach((btn) => btn.addEventListener("click", handleModeChange));

init();
