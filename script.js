const ROWS = 3;
const COLS = 3;
const TIE  = -1;
const EMPTY = 0;
const PLAYER1 = 1;
const PLAYER2 = 2;
const SYMBOLS = { [EMPTY]: " ", [PLAYER1]: "O", [PLAYER2]: "X" };
const IMAGES = { [PLAYER1]: "o.svg", [PLAYER2]: "x.svg" }

function createGameboard() {
    const matrix = Array.from({ length: ROWS }, () => new Array(COLS).fill(EMPTY));

    const getRow = (row) => matrix[row];

    const getCol = (col) => matrix.map(row => row[col]);

    const checkLineWinner = (line) => {
        if (line.every(cell => cell === PLAYER1)) { return PLAYER1; }
        if (line.every(cell => cell === PLAYER2)) { return PLAYER2; }

        return EMPTY;
    }

    const checkWinner = () => {
        // Check the rows for a winner.
        for (let row = 0; row < ROWS; row++) {
            let winner = checkLineWinner(getRow(row));
            if (winner !== 0) {
                return winner;
            }
        }
        // Check the columns for a winner.
        for (let col = 0; col < COLS; col++) {
            let winner = checkLineWinner(getCol(col));
            if (winner !== 0) {
                return winner;
            }
        }
        // Check the descending diagonal.
        let winnerDiag1 = checkLineWinner([matrix[0][0], matrix[1][1], matrix[2][2]]);
        if (winnerDiag1 !== 0) {
            return winnerDiag1;
        }
        // Check the ascending diagonal.
        let winnerDiag2 = checkLineWinner([matrix[2][0], matrix[1][1], matrix[0][2]]);
        if (winnerDiag2 !== 0) {
            return winnerDiag2;
        }

        return EMPTY;
    }

    const checkFull = () => {
        return matrix.every(row => row.every(cell => cell !== EMPTY));
    }

    const isEmpty = (row, col) => getCell(row, col) === EMPTY;

    const getCell = (row, col) => {
        if (row < 0 || row >= ROWS) { throw Error("Row out of bounds"); }
        if (col < 0 || col >= COLS) { throw Error("Col out of bounds"); }

        return matrix[row][col];
    }

    const setCell = (row, col, value) => {
        if (row < 0 || row >= ROWS) { throw Error("Row out of bounds"); }
        if (col < 0 || col >= COLS) { throw Error("Col out of bounds"); }

        if (value !== EMPTY && value !== PLAYER1 && value !== PLAYER2) {
            throw Error("Invalid player");
        }

        matrix[row][col] = value;
    }

    const reset = () => {
        for (let row = 0; row < ROWS; row++) {
            matrix[row].fill(EMPTY);
        }
    }

    const print = () => {
        console.log(getCol(0));
        let str = "";

        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
                str += "[" + SYMBOLS[getCell(row, col)] + "]";
            }
            str += "\n";
        }

        console.log(str);
    }

    return {isEmpty, getCell, setCell, reset, checkWinner, checkFull, print};
};

function createPlayer(player, name) {
    if (player !== PLAYER1 && player !== PLAYER2) {
        throw Error("Invalid player");
    }

    const id = player;

    let score = 0;

    const getId = () => id;

    const getScore = () => score;

    const addScore = () => score++;

    const getName = () => name;

    const getMove = (board) => { 
        throw Error("getMove must be implemented by a subclass");
    }

    const handleUserInput = (row, col) => {
        throw Error("handleUserInput must be implemented by a subclass");
    }

    const print = () => {
        console.log(`Player: ${id}`);
    }

    return {getId, getScore, addScore, getName, getMove, handleUserInput, print};
}

function createHumanPlayer(player, name) {
    const base = createPlayer(player, name);

    let move = null;

    const getMove = (board) => {
        if (move === null) {
            return null;
        }

        const copy = move;
        move = null;

        return copy;
    }

    const handleUserInput = (row, col) => {
        if (row < 0 || row >= ROWS) { throw Error("Row out of bounds"); }
        if (col < 0 || col >= COLS) { throw Error("Col out of bounds"); }

        move = [row, col];
    }

    const print = () => {
        console.log(`Player: ${base.getId()} (human)`);
    }

    return Object.assign({}, base, { getMove, handleUserInput, print });
}

function createMatch(board, player1, player2) {
    const players = [player1, player2];

    let activePlayerIndex = 0;

    const getActivePlayer = () => players[activePlayerIndex];
        
    const setNextPlayer = () => activePlayerIndex = (activePlayerIndex + 1) % 2;

    const handleUserInput = (row, col) => {
        if (row < 0 || row > ROWS) { return; }
        if (col < 0 || col > COLS) { return; }

        if (!board.isEmpty(row, col)) {
            return;
        }

        getActivePlayer().handleUserInput(row, col);
    }

    const executeMove = () => {
        const player = getActivePlayer();
        const move   = player.getMove(board);

        if (move === null) {
            return false;
        }

        board.setCell(move[0], move[1], player.getId());
        return true;
    }

    const checkGameStatus = () => {
        const winner = board.checkWinner();
        if (winner !== 0) {
            return winner;
        }

        if (board.checkFull()) {
            return TIE;
        }

        return EMPTY;
    }

    const doStep = () => {
        // Try to execute a movement.
        if (!executeMove()) {
            return EMPTY;
        }

        setNextPlayer();
        return checkGameStatus();
    }

    return { getActivePlayer, handleUserInput, doStep };
};

function createGame(player1, player2) {
    let gameboard = createGameboard();
    let match = createMatch(gameboard, player1, player2);
    let round = 0;
    let running = false;
    let lastResult = null;

    const getGameboard = () => gameboard;

    const getRound = () => round;

    const getPlayer1Name = () => player1.getName();

    const getPlayer2Name = () => player2.getName();

    const getPlayer1Score = () => player1.getScore();

    const getPlayer2Score = () =>  player2.getScore();

    const getActivePlayerName = () => match.getActivePlayer().getId() === player1.getId() ? getPlayer1Name() : getPlayer2Name();

    const getLastMovementResult = () => lastResult;

    const startNextRound = () => {
        if (running) {
            return;
        }

        gameboard.reset();
        match = createMatch(gameboard, player1, player2);
        round++;
        running = true;
    }

    const handleUserInput = (row, col) => {
        if (!running) {
            return;
        }

        match.handleUserInput(row, col);
        lastResult = match.doStep();

        switch (lastResult) {
            case PLAYER1: player1.addScore(); running = false; break;
            case PLAYER2: player2.addScore(); running = false; break;
            case TIE:     running = false; break;
            default:      running = true;  break;
        }
    }

    return { getGameboard, getRound, getPlayer1Name, getPlayer1Score, getPlayer2Name, getPlayer2Score, getActivePlayerName, getLastMovementResult, startNextRound, handleUserInput }
}

function createRenderer() {
    const elemRound = document.querySelector("#game-round");
    const elemState = document.querySelector("#game-state");
    const elemBoard = document.querySelector("#board");
    const elemPlayer1Name  = document.querySelector("#player-1-name");
    const elemPlayer1Score = document.querySelector("#player-1-score");
    const elemPlayer2Name  = document.querySelector("#player-2-name");
    const elemPlayer2Score = document.querySelector("#player-2-score");
    
    const syncPage = (game) => {
        const cells = elemBoard.querySelectorAll(".cell");

        elemRound.textContent = `Round ${game.getRound()}`;
        elemState.textContent = `Turn of player ${game.getActivePlayerName()}`;
        elemPlayer1Name .textContent = game.getPlayer1Name();
        elemPlayer1Score.textContent = game.getPlayer1Score();
        elemPlayer2Name .textContent = game.getPlayer2Name();
        elemPlayer2Score.textContent = game.getPlayer2Score();
        
        cells.forEach(cell => {
            const row = Number(cell.dataset.row);
            const col = Number(cell.dataset.col);
            const val = game.getGameboard().getCell(row, col);

            if (IMAGES[val]) {
                cell.innerHTML = `<img src="images/${IMAGES[val]}" alt="${SYMBOLS[val]}" width="20" height="20">`;
            }
            else {
                cell.textContent = "";
            }
        });

        switch (game.getLastMovementResult()) {
            case PLAYER1: elemState.textContent = "Player 1 wins!"; break;
            case PLAYER2: elemState.textContent = "Player 2 wins!"; break;
            case TIE:     elemState.textContent = "Tie"; break;
        }
    }

    return { syncPage };
};


(function setup() {
    const elemBoard = document.querySelector("#board");
    if (!elemBoard) {
        console.error("Board element not found");
        return;
    }

    const elemButtonNextRound = document.querySelector("#button-next-round");
    if (!elemButtonNextRound) {
        console.error("Next round button not found");
        return;
    }

    const player1 = createHumanPlayer(PLAYER1, "Foo");
    const player2 = createHumanPlayer(PLAYER2, "Bar");
    const game = createGame(player1, player2);
    const renderer = createRenderer();

    console.log(player1.getName());
    console.log(game.getPlayer1Name());

    const start = () => {
        elemBoard.addEventListener("click", handleCellClick);
        elemButtonNextRound.disabled = true;
        elemButtonNextRound.removeEventListener("click", handleNextRoundClick);
        game.startNextRound();
        renderer.syncPage(game);
    }

    const finish = () => {
        elemBoard.removeEventListener("click", handleCellClick);
        elemButtonNextRound.disabled = false;
        elemButtonNextRound.addEventListener("click", handleNextRoundClick);
    }

    const handleNextRoundClick = event => {
        start();
    }

    const handleCellClick = event => {
        let cell = event.target.closest(".cell");
        if (!cell) {
            return;
        }

        const row = Number(cell.dataset.row);
        const col = Number(cell.dataset.col);

        game.handleUserInput(row, col);
        renderer.syncPage(game);

        if (game.getLastMovementResult() !== EMPTY) {
            finish();
        }
    }

    start();
})();