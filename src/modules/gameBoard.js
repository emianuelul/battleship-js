export class Gameboard {
  #board = [];
  #hits = [];
  #ships = [];

  constructor() {
    for (let i = 0; i < 10; i++) {
      this.#board[i] = [];
      for (let j = 0; j < 10; j++) {
        this.#board[i][j] = 0;
      }
    }
  }

  receiveAttack(x, y) {
    this.#hits.push([x, y]);

    if (this.#board[x][y] !== 0) {
      this.#board[x][y].hit();
      return true;
    }

    return false;
  }

  canPlace(row, col, rotation, shipLen) {
    for (let i = 0; i < shipLen; i++) {
      const c = rotation === 'x' ? col + i : col;
      const r = rotation === 'y' ? row + i : row;

      if (!this.#isAreaClear(r, c)) {
        return false;
      }
    }

    return true;
  }

  #isAreaClear(row, col) {
    for (let r = row - 1; r <= row + 1; r++) {
      for (let c = col - 1; c <= col + 1; c++) {
        if (r >= 0 && r < 10 && c >= 0 && c < 10) {
          if (this.#board[r][c] !== 0) {
            return false;
          }
        }
      }
    }
    return true;
  }

  placeShip(row, col, rotation, ship) {
    // check overlaps first
    const shipLen = ship.getLength();

    if (row < 0 || col < 0 || row >= 10 || col >= 10) {
      return;
    }

    if (rotation === 'x') {
      if (shipLen + col > 10) {
        col = 10 - shipLen;
      }
    } else if (rotation === 'y') {
      if (shipLen + row > 10) {
        row = 10 - shipLen;
      }
    }

    if (!this.canPlace(row, col, rotation, shipLen)) {
      return false;
    }

    for (let i = 0; i < shipLen; i++) {
      const new_row = rotation === 'y' ? row + i : row;
      const new_col = rotation === 'x' ? col + i : col;
      this.#board[new_row][new_col] = ship;
    }

    this.#ships.push(ship);

    return true;
  }

  checkSunk() {
    let sunk = 0;
    for (const ship of this.#ships) {
      if (ship.isSunk()) {
        sunk += 1;
      }
    }

    return this.#ships.length === sunk;
  }

  getBoard() {
    return this.#board;
  }

  getHits() {
    return this.#hits;
  }

  resetBoard() {
    for (let i = 0; i < 10; i++) {
      this.#board[i] = [];
      for (let j = 0; j < 10; j++) {
        this.#board[i][j] = 0;
      }
    }
  }
}
