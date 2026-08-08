const aliases = {
  audifono: ['auricular'],
  audifonos: ['auriculares'],
  auricular: ['audifono'],
  auriculares: ['audifonos'],
  laptop: ['portatil', 'computador'],
  portatil: ['laptop'],
  computadora: ['computador', 'laptop'],
  playstation: ['play', 'station'],
};

export function normalizeSearchText(value = '') {
  return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().replace(/\s+/g, ' ');
}

function distance(first, second) {
  const previous = Array.from({ length: second.length + 1 }, (_, index) => index);
  for (let row = 1; row <= first.length; row += 1) {
    const current = [row];
    for (let column = 1; column <= second.length; column += 1) current[column] = Math.min(current[column - 1] + 1, previous[column] + 1, previous[column - 1] + (first[row - 1] === second[column - 1] ? 0 : 1));
    previous.splice(0, previous.length, ...current);
  }
  return previous[second.length];
}

const maxTypoDistance = (word) => word.length <= 4 ? 1 : word.length <= 7 ? 2 : 3;

function fieldScore(term, field, weight) {
  if (!field) return 0;
  if (field === term) return weight * 1.5;
  if (field.includes(term)) return weight;
  const words = field.split(' ');
  if (words.some((word) => word.startsWith(term))) return weight * 0.8;
  if (term.length < 3) return 0;
  const closest = words.reduce((minimum, word) => Math.min(minimum, distance(term, word)), Infinity);
  return closest <= maxTypoDistance(term) ? weight * (1 - closest / (maxTypoDistance(term) + 1)) * 0.6 : 0;
}

/** Finds relevant products without mutating the original collection. */
export function searchProducts(products, query) {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return products.map((product) => ({ product, score: 0 }));
  const queryTerms = [...new Set(normalizedQuery.split(' ').flatMap((term) => [term, ...(aliases[term] ?? [])]))];
  return products.map((product) => {
    const fields = [[normalizeSearchText(product.name), 180], [normalizeSearchText(product.brand), 105], [normalizeSearchText(product.category), 90], [normalizeSearchText(product.shortDescription), 45], [normalizeSearchText(product.description), 30], [normalizeSearchText(product.sku), 75]];
    const name = fields[0][0];
    let score = name === normalizedQuery ? 1200 : name.includes(normalizedQuery) ? 700 : 0;
    let matchedTerms = 0;
    queryTerms.forEach((term) => { const best = Math.max(...fields.map(([field, weight]) => fieldScore(term, field, weight))); if (best > 0) matchedTerms += 1; score += best; });
    score += (matchedTerms / queryTerms.length) * 120;
    return { product, score, matchedTerms };
  }).filter(({ score, matchedTerms }) => matchedTerms > 0 && score >= 55).sort((first, second) => second.score - first.score || second.product.reviewCount - first.product.reviewCount);
}
