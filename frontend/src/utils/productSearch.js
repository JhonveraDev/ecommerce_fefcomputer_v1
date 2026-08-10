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

const words = (value) => normalizeSearchText(value).split(' ').filter(Boolean);
const typoDistance = (word) => word.length <= 5 ? 1 : word.length <= 9 ? 1 : 2;

function distance(first, second) {
  const previous = Array.from({ length: second.length + 1 }, (_, index) => index);
  for (let row = 1; row <= first.length; row += 1) {
    const current = [row];
    for (let column = 1; column <= second.length; column += 1) current[column] = Math.min(current[column - 1] + 1, previous[column] + 1, previous[column - 1] + (first[row - 1] === second[column - 1] ? 0 : 1));
    previous.splice(0, previous.length, ...current);
  }
  return previous[second.length];
}

function scoreCandidate(term, fields, allowTypo) {
  let best = 0;
  fields.forEach(([value, weight]) => {
    const fieldWords = words(value);
    if (fieldWords.includes(term)) best = Math.max(best, weight);
    else if (fieldWords.some((word) => word.startsWith(term))) best = Math.max(best, weight * 0.72);
    else if (allowTypo && term.length >= 4 && fieldWords.some((word) => distance(term, word) <= typoDistance(term))) best = Math.max(best, weight * 0.42);
  });
  return best;
}

function productFields(product) {
  return {
    primary: [[product.name, 180], [product.brand, 105], [product.category, 90], [product.sku, 75]],
    secondary: [[product.shortDescription, 38], [product.description, 22]],
  };
}

/** Finds products by requiring every query term to be relevant. */
export function searchProducts(products, query) {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return products.map((product) => ({ product, score: 0 }));
  const queryTerms = [...new Set(words(normalizedQuery))];
  const catalog = products.map((product) => ({ product, fields: productFields(product) }));
  const directTerms = new Set(queryTerms.filter((term) => catalog.some(({ fields }) => scoreCandidate(term, fields.primary, true) > 0)));

  return catalog.map(({ product, fields }) => {
    const name = normalizeSearchText(product.name);
    let score = name === normalizedQuery ? 1200 : name.includes(normalizedQuery) ? 700 : 0;
    const matched = queryTerms.map((term) => {
      const candidates = directTerms.has(term) ? [term] : [term, ...(aliases[term] ?? [])];
      const candidateScore = Math.max(...candidates.map((candidate) => scoreCandidate(candidate, fields.primary, true) || scoreCandidate(candidate, fields.secondary, false)));
      score += candidateScore;
      return candidateScore > 0;
    });
    return { product, score, matchedTerms: matched.filter(Boolean).length };
  }).filter(({ matchedTerms }) => matchedTerms === queryTerms.length)
    .sort((first, second) => second.score - first.score || second.product.reviewCount - first.product.reviewCount);
}