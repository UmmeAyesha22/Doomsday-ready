// Finds a circular dependency that would be created if `movieId`
// got `newPrerequisiteIds` as its prerequisites.
//
// prerequisitesOf: Map of movieId -> array of its prerequisite ids
//                  (the current graph, WITHOUT movieId's own old prerequisites)
//
// Returns the cycle as an array of ids, e.g. [3, 1, 3], or null if it is safe.
function findCycle(movieId, newPrerequisiteIds, prerequisitesOf) {
  const visited = new Set();

  function dfs(current, path) {
    if (current === movieId) return [...path, current]; // back at the start: cycle!
    if (visited.has(current)) return null;               // already checked, no cycle here
    visited.add(current);

    for (const next of prerequisitesOf.get(current) || []) {
      const found = dfs(next, [...path, current]);
      if (found) return found;
    }
    return null;
  }

  for (const start of newPrerequisiteIds) {
    const found = dfs(start, [movieId]);
    if (found) return found;
  }
  return null;
}

module.exports = { findCycle };