import gamingPromoBackground from '../assets/promos/promo-gaming-background.png';
import solarPromoBackground from '../assets/promos/promo-solar-background.png';
import cctvPromoBackground from '../assets/promos/promo-cctv-background.png';
import type { PromoBannerItem } from '../components/PromoBanners';

export const homePromoBanners: PromoBannerItem[] = [
  { id: 'gaming-solutions', title: 'Potencia tu setup con tecnología gaming', ctaLabel: 'Ver computadores', image: gamingPromoBackground, imageAlt: 'Setup gaming con computador, laptop y periféricos', backgroundColor: '#e8edf4', textColor: '#092548', ctaColor: '#2545d5', href: '#categoria-computadores-gaming' },
  { id: 'solar-energy', title: 'Energía solar eficiente para cada proyecto', ctaLabel: 'Explorar energía', image: solarPromoBackground, imageAlt: 'Solución solar con inversor, batería y panel', backgroundColor: '#edf1f4', textColor: '#092548', ctaColor: '#2754cc', href: '#categoria-paneles-solares' },
  { id: 'security-solutions', title: 'Protege tus espacios con CCTV inteligente', ctaLabel: 'Ver seguridad', image: cctvPromoBackground, imageAlt: 'Sistema profesional de videovigilancia CCTV', backgroundColor: '#e6ebf2', textColor: '#092548', ctaColor: '#1a2989', href: '#categoria-sistemas-cctv' },
];
