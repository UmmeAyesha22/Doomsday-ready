const test = require('node:test');
const assert = require('node:assert/strict');
const { findMinBundles } = require('../src/algorithms/bookingQuote');

// Total seats in a result, to check the "exactly the group size" rule
function seatsOf(result) {
  return result.bundles.reduce((sum, bundle) => sum + bundle.size * bundle.count, 0);
}

test('sizes 1, 3, 4 and group 6 gives 3 x 2', () => {
  assert.deepEqual(findMinBundles([1, 3, 4], 6), {
    totalBundles: 2,
    bundles: [{ size: 3, count: 2 }],
  });
});

test('sizes 2, 5 and group 11 gives 5 x 1 and 2 x 3', () => {
  assert.deepEqual(findMinBundles([2, 5], 11), {
    totalBundles: 4,
    bundles: [
      { size: 5, count: 1 },
      { size: 2, count: 3 },
    ],
  });
});

test('sizes 6, 9, 20 and group 44 gives 20 x 1, 9 x 2, 6 x 1', () => {
  assert.deepEqual(findMinBundles([6, 9, 20], 44), {
    totalBundles: 4,
    bundles: [
      { size: 20, count: 1 },
      { size: 9, count: 2 },
      { size: 6, count: 1 },
    ],
  });
});

test('sizes 4, 6 and group 7 is not possible', () => {
  assert.equal(findMinBundles([4, 6], 7), null);
});

test('a group of 1 with a bundle of 1 needs one bundle', () => {
  assert.deepEqual(findMinBundles([1, 3, 4], 1), {
    totalBundles: 1,
    bundles: [{ size: 1, count: 1 }],
  });
});

test('the order of the bundle sizes does not matter', () => {
  assert.deepEqual(findMinBundles([4, 1, 3], 6), findMinBundles([1, 3, 4], 6));
});

test('the largest group (10000) works and is exact', () => {
  const result = findMinBundles([6, 9, 20], 10000);
  assert.equal(result.totalBundles, 500);
  assert.deepEqual(result.bundles, [{ size: 20, count: 500 }]);
  assert.equal(seatsOf(result), 10000);
});

test('the seats always add up to exactly the group size', () => {
  for (let group = 1; group <= 200; group++) {
    const result = findMinBundles([4, 7, 11], group);
    if (result !== null) {
      assert.equal(seatsOf(result), group);
    }
  }
});