// Finds the fewest bundles whose seats add up to exactly `groupSize`.
//
// bundleSizes: array of bundle sizes, e.g. [1, 3, 4]
// groupSize:   number of seats needed
//
// Returns { totalBundles, bundles: [{ size, count }] } (biggest size first),
// or null when no exact combination exists.
function findMinBundles(bundleSizes, groupSize) {
  const sizes = [...bundleSizes].sort((a, b) => a - b);

  // dp[i] = fewest bundles to get exactly i seats (Infinity = impossible)
  const dp = new Array(groupSize + 1).fill(Infinity);
  // choice[i] = the last bundle size used to reach i seats in the best way
  const choice = new Array(groupSize + 1).fill(0);
  dp[0] = 0;

  for (let seats = 1; seats <= groupSize; seats++) {
    for (const size of sizes) {
      if (size > seats) break; // sizes are sorted, so no later size fits either
      if (dp[seats - size] + 1 < dp[seats]) {
        dp[seats] = dp[seats - size] + 1;
        choice[seats] = size;
      }
    }
  }

  if (dp[groupSize] === Infinity) return null; // not possible

  // Walk back through `choice` and count how many of each size we used
  const counts = new Map();
  for (let seats = groupSize; seats > 0; seats -= choice[seats]) {
    counts.set(choice[seats], (counts.get(choice[seats]) || 0) + 1);
  }

  const bundles = [...counts.entries()]
    .map(([size, count]) => ({ size, count }))
    .sort((a, b) => b.size - a.size);

  return { totalBundles: dp[groupSize], bundles };
}

module.exports = { findMinBundles };