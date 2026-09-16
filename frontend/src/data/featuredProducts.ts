import { mockProducts } from './mockProducts';

/**
 * The home grid deliberately uses a small, stable selection so its desktop
 * composition remains complete (two rows of five cards).
 */
export const featuredProducts = [...mockProducts]
  .sort((a, b) => {
    const scoreA = a.status === 'Oferta' ? 100 : 0;
    const scoreB = b.status === 'Oferta' ? 100 : 0;
    return scoreB - scoreA;
  })
  .slice(0, 10);
