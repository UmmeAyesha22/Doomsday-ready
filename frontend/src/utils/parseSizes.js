// "2, 5" or "2 5" -> [2, 5]. Anything that isn't a number becomes NaN.
export function parseSizes(text) {
  return text
    .split(/[\s,]+/)
    .filter((part) => part !== '')
    .map(Number);
}

// Same rules as the backend. Returns a list of problems (empty = fine).
export function checkCinema(name, sizes) {
  const problems = [];
  if (name.trim() === '') problems.push('Enter a cinema name.');
  if (name.trim().length > 255) problems.push('The name can be at most 255 characters.');
  if (sizes.length === 0) {
    problems.push('Enter at least one bundle size.');
    return problems;
  }
  if (sizes.length > 10) problems.push('A cinema can have at most 10 bundle sizes.');
  if (!sizes.every((s) => Number.isInteger(s) && s >= 1 && s <= 500)) {
    problems.push('Each bundle size must be a whole number from 1 to 500.');
  }
  if (new Set(sizes).size !== sizes.length) problems.push('Bundle sizes must all be different.');
  return problems;
}