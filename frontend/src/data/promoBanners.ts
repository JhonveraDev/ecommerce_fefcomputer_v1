import gamingPromoBackground from '../assets/promos/promo-gaming-background.png';
import solarPromoBackground from '../assets/promos/promo-solar-background.png';
import cctvPromoBackground from '../assets/promos/promo-cctv-background.png';
import type { PromoBannerItem } from '../components/PromoBanners';

export const homePromoBanners: PromoBannerItem[] = [
  { id: 'gaming-solutions', title: 'Potencia tu setup con tecnología gaming', ctaLabel: 'Ver computadores', image: gamingPromoBackground, imageAlt: 'Setup gaming con computador, laptop y periféricos', backgroundColor: '#eaf2fb', textColor: '#0a2342', ctaColor: '#006ce5', href: '#categoria-computadores-gaming' },
  { id: 'solar-energy', title: 'Energía solar eficiente para cada proyecto', ctaLabel: 'Explorar energía', image: solarPromoBackground, imageAlt: 'Solución solar con inversor, batería y panel', backgroundColor: '#edf5fc', textColor: '#0a2342', ctaColor: '#005fcb', href: '#categoria-paneles-solares' },
  { id: 'security-solutions', title: 'Protege tus espacios con CCTV inteligente', ctaLabel: 'Ver seguridad', image: cctvPromoBackground, imageAlt: 'Sistema profesional de videovigilancia CCTV', backgroundColor: '#e6f0fa', textColor: '#0a2342', ctaColor: '#004fa8', href: '#categoria-sistemas-cctv' },
];
