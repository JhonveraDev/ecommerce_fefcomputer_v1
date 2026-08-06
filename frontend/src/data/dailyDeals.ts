import { mockProducts } from './mockProducts';
import bannerImage from '../assets/deals/deals-solar-sidebar-v3.png';
export const dailyDealProducts = mockProducts.filter((product) => product.status === 'Oferta' || (product.previousPrice !== null && product.previousPrice > product.price));
export const dailyDealsBanner = { image: bannerImage, title: 'Energía que transforma tu espacio', ctaLabel: 'Ver energía solar' };
