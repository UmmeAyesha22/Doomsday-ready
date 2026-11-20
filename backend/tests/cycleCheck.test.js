const test = require('node:test');
const assert = require('node:assert/strict');
const { findCycle } = require('../src/algorithms/cycleCheck');

// Sample data from the task:
// 1 Iron Man, 2 The First Avenger, 3 The Avengers, 4 Civil War,
// 5 Ragnarok, 6 Infinity War, 7 Endgame, 8 Doomsday
const graph = new Map([
  [1, []],
  [2, []],
  [3, [1, 2]],
  [4, [3]],
  [5, []],
  [6, [4, 5]],
  [7, [6]],
  [8, [7]],
]);

test('Endgame as a prerequisite of Iron Man creates a cycle', () => {
  assert.deepEqual(findCycle(1, [7], graph), [1, 7, 6, 4, 3, 1]);
});

test('Doomsday as a prerequisite of Iron Man creates a cycle', () => {
  assert.deepEqual(findCycle(1, [8], graph), [1, 8, 7, 6, 4, 3, 1]);
});

test('a movie cannot be its own prerequisite', () => {
  assert.deepEqual(findCycle(3, [3], graph), [3, 3]);
});

test('a safe prerequisite returns null', () => {
  assert.equal(findCycle(5, [1], graph), null);
  assert.equal(findCycle(2, [5], graph), null);
});

test('no new prerequisites can never create a cycle', () => {
  assert.equal(findCycle(1, [], graph), null);
});