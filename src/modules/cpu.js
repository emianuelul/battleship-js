export class CPU {
  #cpu_neighbors = [];
  #cpu_hits = [];
  #enemy_board;
  #cells_to_avoid = [];

  constructor(enemyBoard) {
    this.#enemy_board = enemyBoard;
  }

  #isCoordHit(coord, hits) {
    return hits.some((hit) => hit[0] === coord[0] && hit[1] === coord[1]);
  }

  #isWithinBounds(coord) {
    return coord[0] >= 0 && coord[0] <= 9 && coord[1] >= 0 && coord[1] <= 9;
  }

  #generateCoords() {
    let i = Math.floor(Math.min(Math.random(), 0.99) * 10);
    let j = Math.floor(Math.min(Math.random(), 0.99) * 10);

    let coords = [i, j];

    while (
      this.#isCoordHit(coords, this.#enemy_board.getHits()) ||
      this.#isAdjacentToShipHit(coords)
    ) {
      i = Math.floor(Math.min(Math.random(), 0.99) * 10);
      j = Math.floor(Math.min(Math.random(), 0.99) * 10);
      coords = [i, j];
    }
    return coords;
  }

  #isAdjacentToShipHit(coord) {
    for (const hit of this.#cells_to_avoid) {
      const rowDiff = Math.abs(coord[0] - hit[0]);
      const colDiff = Math.abs(coord[1] - hit[1]);

      if (rowDiff <= 1 && colDiff <= 1 && !(rowDiff === 0 && colDiff === 0)) {
        return true;
      }
    }

    return false;
  }

  #hit = false;
  play_move() {
    this.#hit = false;
    let coords;
    if (this.#cpu_neighbors.length === 0) {
      coords = this.#generateCoords();
      this.#cpu_hits = [];
    } else {
      coords = this.#cpu_neighbors.pop();
      while (coords && this.#isCoordHit(coords, this.#enemy_board.getHits())) {
        coords = this.#cpu_neighbors.pop();
      }

      if (!coords) {
        coords = this.#generateCoords();
        this.#cpu_hits = [];
      }
    }

    if (this.#enemy_board.getBoard()[coords[0]][coords[1]] !== 0) {
      // HIT
      this.#hit = true;
      this.#cpu_hits.push(coords);
      this.#cells_to_avoid.push(coords);

      let directions = [];
      if (this.#cpu_hits.length === 1) {
        const up = [coords[0] - 1, coords[1]];
        const down = [coords[0] + 1, coords[1]];
        const left = [coords[0], coords[1] - 1];
        const right = [coords[0], coords[1] + 1];

        directions = [up, down, left, right];
      } else if (this.#cpu_hits.length >= 2) {
        this.#cpu_neighbors = [];

        const first = this.#cpu_hits[0];
        const last = this.#cpu_hits[this.#cpu_hits.length - 1];
        const prelast = this.#cpu_hits[this.#cpu_hits.length - 2];

        let direction = [last[0] - prelast[0], last[1] - prelast[1]];

        const is_valid_direction =
          (Math.abs(direction[0]) === 1 && direction[1] === 0) ||
          (Math.abs(direction[1]) === 1 && direction[0] === 0);

        if (!is_valid_direction) {
          direction = [last[0] - first[0], last[1] - first[1]];
          const length = Math.abs(direction[0]) + Math.abs(direction[1]);
          direction = [
            direction[0] !== 0 ? direction[0] / Math.abs(direction[0]) : 0,
            direction[1] !== 0 ? direction[1] / Math.abs(direction[1]) : 0,
          ];
        }

        const next_check = [last[0] + direction[0], last[1] + direction[1]];

        if (
          this.#isWithinBounds(next_check) &&
          !this.#isCoordHit(next_check, this.#enemy_board.getHits())
        ) {
          directions.push(next_check);
        } else {
          // Forward is blocked, try opposite immediately
          const opposite_check = [first[0] - direction[0], first[1] - direction[1]];

          if (
            this.#isWithinBounds(opposite_check) &&
            !this.#isCoordHit(opposite_check, this.#enemy_board.getHits())
          ) {
            directions.push(opposite_check);
          }
        }
      }

      for (const direction of directions) {
        if (
          !this.#isWithinBounds(direction) ||
          this.#isCoordHit(direction, this.#enemy_board.getHits())
        )
          continue;
        this.#cpu_neighbors.push(direction);
      }
    } else {
      // MISS
      if (this.#cpu_hits.length >= 2 && this.#cpu_neighbors.length === 0) {
        const first = this.#cpu_hits[0];
        const last = this.#cpu_hits[this.#cpu_hits.length - 1];
        const direction = [last[0] - first[0], last[1] - first[1]];

        const dir_normalized = [
          direction[0] !== 0 ? direction[0] / Math.abs(direction[0]) : 0,
          direction[1] !== 0 ? direction[1] / Math.abs(direction[1]) : 0,
        ];

        const opposite_check = [
          first[0] - dir_normalized[0],
          first[1] - dir_normalized[1],
        ];

        if (
          this.#isWithinBounds(opposite_check) &&
          !this.#isCoordHit(opposite_check, this.#enemy_board.getHits())
        ) {
          this.#cpu_neighbors.push(opposite_check);
        } else {
          this.#cpu_hits = [];
          this.#cpu_neighbors = [];
        }
      }
    }

    let pixel = document.querySelector(`[coord="${coords[0]}-${coords[1]}"]`);
    if (pixel) {
      pixel.click();
    }
    return this.#hit;
  }
}
