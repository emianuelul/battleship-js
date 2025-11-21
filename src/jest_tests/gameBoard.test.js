import { Gameboard } from '../src/modules/gameBoard';
import { Ship } from '../src/modules/ship';

test('Exists', () => {
  expect(Gameboard).toBeDefined();
});

describe('Methods', () => {
  test('Constructor', () => {
    const board = new Gameboard();

    expect(new Gameboard()).toBeDefined();
  });

  test('Initializes as empty', () => {
    const board = new Gameboard();

    board.getBoard().forEach((r) => {
      r.forEach((c) => expect(c).toBe(0));
    });
  });

  test('Place ship at valid position', () => {
    const board = new Gameboard();

    const ship = new Ship(3);
    expect(board.placeShip(0, 0, 'x', ship)).toBe(true);
    expect(board.getBoard()[0][0]).toEqual(ship);
    expect(board.getBoard()[0][1]).toEqual(ship);
    expect(board.getBoard()[0][2]).toEqual(ship);
  });

  test(`Overlapping won't work`, () => {
    const board = new Gameboard();

    const ship1 = new Ship(3);
    const ship2 = new Ship(3);

    board.placeShip(0, 0, 'x', ship1);
    expect(board.placeShip(0, 0, 'y', ship2)).toBe(false);
    expect(board.placeShip(0, 1, 'y', ship2)).toBe(false);
    expect(board.placeShip(0, 2, 'y', ship2)).toBe(false);
  });

  test('Receive hits/miss and keep track of them', () => {
    const board = new Gameboard();
    const ship = new Ship(3);

    board.placeShip(0, 0, 'x', ship);
    board.receiveAttack(0, 0);
    board.receiveAttack(5, 5);

    expect(ship.getHitNum()).toBe(1);
    expect(board.getHits()).toContainEqual([0, 0]);
    expect(board.getHits()).toContainEqual([5, 5]);
  });

  test('Ship rotations', () => {
    const board = new Gameboard();
    const ship1 = new Ship(3);
    const ship2 = new Ship(3);

    board.placeShip(0, 0, 'x', ship1);
    board.placeShip(2, 0, 'y', ship2);

    expect(board.getBoard()[0][0]).toEqual(ship1);
    expect(board.getBoard()[0][1]).toEqual(ship1);
    expect(board.getBoard()[0][2]).toEqual(ship1);

    expect(board.getBoard()[2][0]).toEqual(ship2);
    expect(board.getBoard()[3][0]).toEqual(ship2);
    expect(board.getBoard()[4][0]).toEqual(ship2);
  });

  test('Check if all ships are sunk', () => {
    const board = new Gameboard();
    const ship1 = new Ship(3);
    const ship2 = new Ship(3);

    board.placeShip(0, 0, 'x', ship1);
    board.placeShip(2, 0, 'y', ship2);

    board.receiveAttack(0, 0);
    board.receiveAttack(0, 1);
    board.receiveAttack(0, 2);

    expect(ship1.getHitNum()).toBe(3);
    expect(ship1.isSunk()).toBe(true);
    expect(board.checkSunk()).toBe(false);

    board.receiveAttack(2, 0);
    board.receiveAttack(3, 0);
    board.receiveAttack(4, 0);

    expect(ship2.getHitNum()).toBe(3);
    expect(ship2.isSunk()).toBe(true);
    expect(board.checkSunk()).toBe(true);
  });
});
