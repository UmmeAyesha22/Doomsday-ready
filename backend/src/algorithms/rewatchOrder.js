// Returns every movie that must be watched before `targetId`:
// its prerequisites, their prerequisites, and so on, each exactly once,
// in an order where every movie comes after its own prerequisites.
// The target itself is not included.
//
// prerequisitesOf: Map of movieId -> array of prerequisite ids
function buildRewatchOrder(targetId, prerequisitesOf) {
  const visited = new Set();
  const order = [];

  function dfs(id) {
    if (visited.has(id)) return; // already handled, never add a movie twice
    visited.add(id);

    // first handle everything this movie depends on...
    for (const prerequisiteId of prerequisitesOf.get(id) || []) {
      dfs(prerequisiteId);
    }
    // ...then add the movie itself (post-order)
    order.push(id);
  }

  dfs(targetId);
  order.pop(); // the target is always last, so remove it
  return order;
}

module.exports = { buildRewatchOrder };