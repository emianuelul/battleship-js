export class Ship {
  #length;
  #times_hit;
  #name;

  constructor(len, name) {
    this.#length = len;
    this.#times_hit = 0;
    this.#name = name;
  }

  hit() {
    this.#times_hit += 1;
    console.log('hit');
  }

  getLength() {
    return this.#length;
  }

  getHitNum() {
    return this.#times_hit;
  }

  getName() {
    return this.#name;
  }

  isSunk() {
    return this.#length <= this.#times_hit;
  }
}
