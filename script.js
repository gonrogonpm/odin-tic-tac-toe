const ROWS = 3;
const COLS = 3;
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

function createPlayer() {
    return {};
}

function createHumanPlayer() {
    return {};
}

gameboard.setCell(0, 0, PLAYER1);
gameboard.setCell(2, 1, PLAYER2);
gameboard.print();
console.log(gameboard.checkFull());