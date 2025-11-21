import { Ship } from '../src/modules/ship';

test('Exists', () => {
  expect(Ship).toBeDefined();
});

describe('Methods', () => {
  test('Constructor', () => {
    expect(new Ship(3)).toBeDefined();
  });

  test('Hit 1', () => {
    let test = new Ship(3);
    test.hit();
    expect(test.getHitNum()).toBe(1);
  });

  test('Hit 2', () => {
    let test = new Ship(3);
    test.hit();
    test.hit();
    expect(test.getHitNum()).toBe(2);
  });

  test('Hit 3', () => {
    let test = new Ship(3);
    test.hit();
    test.hit();
    test.hit();
    expect(test.getHitNum()).toBe(3);
  });

  test('Sink', () => {
    let test = new Ship(3);
    test.hit();
    test.hit();
    test.hit();
    expect(test.isSunk()).toBe(true);
  });

  test('Not Sunk', () => {
    let test = new Ship(3);
    test.hit();
    test.hit();
    expect(test.isSunk()).toBe(false);
  });
});
