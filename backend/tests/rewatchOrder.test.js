const test = require('node:test');
const assert = require('node:assert/strict');
const { buildRewatchOrder } = require('../src/algorithms/rewatchOrder');

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

// Checks the three rules: no repeats, no target, every movie after its prerequisites
function assertValidOrder(order, targetId, prerequisitesOf) {
  assert.equal(new Set(order).size, order.length, 'a movie appears twice');
  assert.ok(!order.includes(targetId), 'the target must not be included');

  order.forEach((id, index) => {
    for (const prerequisiteId of prerequisitesOf.get(id)) {
      const position = order.indexOf(prerequisiteId);
      assert.ok(
        position !== -1 && position < index,
        `movie ${id} must come after its prerequisite ${prerequisiteId}`
      );
    }
  });
}

const sorted = (list) => [...list].sort((a, b) => a - b);

test('Doomsday needs all 7 other movies', () => {
  const order = buildRewatchOrder(8, graph);
  assert.deepEqual(sorted(order), [1, 2, 3, 4, 5, 6, 7]);
  assertValidOrder(order, 8, graph);
});

test('Civil War needs Iron Man, The First Avenger, then The Avengers', () => {
  const order = buildRewatchOrder(4, graph);
  assert.deepEqual(sorted(order), [1, 2, 3]);
  assert.equal(order[order.length - 1], 3);
  assertValidOrder(order, 4, graph);
});

test('Ragnarok has no prerequisites, so the list is empty', () => {
  assert.deepEqual(buildRewatchOrder(5, graph), []);
});

test('a shared prerequisite appears only once', () => {
  // 4 needs 2 and 3, and both of them need 1
  const diamond = new Map([
    [1, []],
    [2, [1]],
    [3, [1]],
    [4, [2, 3]],
  ]);
  const order = buildRewatchOrder(4, diamond);
  assert.deepEqual(sorted(order), [1, 2, 3]);
  assertValidOrder(order, 4, diamond);
});