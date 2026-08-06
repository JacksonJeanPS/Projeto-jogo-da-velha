const cellElements = document.querySelectorAll("[data-cell]");
const board = document.querySelector("[data-board]");
const statusElement = document.querySelector("[data-status]");
const playerIndicator = document.querySelector("[data-player-indicator]");
const restartButton = document.querySelector("[data-restart-button]");
const winningMessage = document.querySelector("[data-winning-message]");
const winningMessageText = document.querySelector("[data-winning-message-text]");
const winningMessageButton = document.querySelector("[data-winning-message-button]");

const PLAYERS = {
    X: "X",
    O: "O"
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
    winningCombination: null
};

let focusedCellIndex = 0;

function init() {
    gameState.board = Array(9).fill(null);
    gameState.currentPlayer = PLAYERS.X;
    gameState.isGameActive = true;
    gameState.winningCombination = null;
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
        endGame(false, result.winner, result.winningCombination);
    } else if (checkDraw()) {
        endGame(true);
    } else {
        swapTurns();
    }
}

function checkWinner() {
    for (const combination of WINNING_COMBINATIONS) {
        const [a, b, c] = combination;
        if (
            gameState.board[a] &&
            gameState.board[a] === gameState.board[b] &&
            gameState.board[a] === gameState.board[c]
        ) {
            highlightWinningCells(combination);
            return {
                winner: gameState.board[a],
                winningCombination: combination
            };
        }
    }
    return { winner: null, winningCombination: null };
}

function checkDraw() {
    return gameState.board.every((cell) => cell !== null);
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
}

function updateStatus() {
    statusElement.classList.remove("win", "draw");
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

restartButton.addEventListener("click", resetGame);
winningMessageButton.addEventListener("click", resetGame);
board.addEventListener("keydown", handleBoardKeyDown);

init();
