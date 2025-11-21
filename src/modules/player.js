import { Gameboard } from './gameBoard';

export class Player {
  #board;
  #type;
  #name;

  constructor(type, name) {
    this.#board = new Gameboard();
    this.#type = type;
    this.#name = name;
  }

  getBoard() {
    return this.#board;
  }

  getType() {
    return this.#type;
  }

  getName() {
    return this.#name;
  }
}
