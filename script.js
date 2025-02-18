const ROWS = 3;
const COLS = 3;
const TIE  = -1;
const EMPTY = 0;
const PLAYER1 = 1;
const PLAYER2 = 2;
const SYMBOLS = { [EMPTY]: " ", [PLAYER1]: "O", [PLAYER2]: "X" };

const gameboard = (function () {
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

    return {getCell, setCell, reset, checkWinner, checkFull, print};
})();

function createPlayer(player) {
    if (player !== PLAYER1 && player !== PLAYER2) {
        throw Error("Invalid player");
    }

    const id = player;

    const getId = () => id;

    const getMove = (board) => { 
        throw Error("getMove must be implemented by a subclass");
    }

    const handleUserInput = (row, col) => {
        throw Error("handleUserInput must be implemented by a subclass");
    }

    const print = () => {
        console.log(`Player: ${id}`);
    }

    return {getId, getMove, handleUserInput, print};
}

function createHumanPlayer(player) {
    const base = createPlayer(player);

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

    let currentPlayerIndex = 0;

    const getCurrentPlayer = () => players[currentPlayerIndex];
        
    const setNextPlayer = () => currentPlayerIndex = (currentPlayerIndex + 1) % 2;

    const handleUserInput = (row, col) => {
        getCurrentPlayer().handleUserInput(row, col);
    }

    const executeMove = () => {
        const player = getCurrentPlayer();
        const move   = player.getMove(board);

        if (move === null) {
            return false;
        }

        board.setCell(move[0], move[1], player.getId());
        board.print();
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
        executeMove();
        setNextPlayer();
        return checkGameStatus();
    }

    return { handleUserInput, doStep };
};

const renderer = (function() {
    const elemGame  = document.querySelector("#game");
    const elemState = document.querySelector("#game-state");
    const elemBoard = document.querySelector("#board");
    
    const syncPage = (board, result) => {
        const cells = elemBoard.querySelectorAll(".cell");

        console.log(cells);
        cells.forEach(cell => {
            const row = Number(cell.dataset.row);
            const col = Number(cell.dataset.col);
            const symbol = SYMBOLS[board.getCell(row, col)];

            cell.textContent = symbol;
        });


        switch (result) {
            case PLAYER1: elemState.textContent = "Player 1 wins!"; break;
            case PLAYER2: elemState.textContent = "Player 2 wins!"; break;
            case TIE:     elemState.textContent = "Tie"; break;
            default:      elemState.textContent = "\u00A0"; break;
        }
    }

    return { syncPage };
})();

let player1 = createHumanPlayer(PLAYER1);
let player2 = createHumanPlayer(PLAYER2);
let match = createMatch(gameboard, player1, player2);

const testMovements = [
    [0, 0], [1, 1], [0, 1], [2, 0], [0, 2]
];

(function setup() {
    let step = 0;

    const button = document.querySelector("#step");
    button.addEventListener("click", () => {
        if (step >= testMovements.length) {
            return;
        }

        match.handleUserInput(testMovements[step][0], testMovements[step][1]);
        const stepResult = match.doStep();

        renderer.syncPage(gameboard, stepResult);

        step++;
        if (step >= testMovements.length) {
            button.disabled    = true;
            button.textContent = "No more steps";
        }
    });
})();