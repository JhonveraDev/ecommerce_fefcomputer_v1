import gamingLaptopImage from '../assets/promos/gaming-laptop-v2.png';
import solarInverterImage from '../assets/promos/solar-inverter-v2.png';
import cctvSystemImage from '../assets/promos/cctv-system-v2.png';
import type { PromoBannerItem } from '../components/PromoBanners';

export const homePromoBanners: PromoBannerItem[] = [
  { id: 'gaming-solutions', title: 'Potencia tu setup con tecnología gaming', ctaLabel: 'Ver computadores', image: gamingLaptopImage, imageAlt: 'Laptop gaming de alto rendimiento', backgroundColor: '#e8edf4', textColor: '#092548', ctaColor: '#2545d5', href: '#categoria-computadores-gaming' },
  { id: 'solar-energy', title: 'Energía solar eficiente para cada proyecto', ctaLabel: 'Explorar energía', image: solarInverterImage, imageAlt: 'Inversor y batería de energía solar', backgroundColor: '#edf1f4', textColor: '#092548', ctaColor: '#2754cc', href: '#categoria-paneles-solares' },
  { id: 'security-solutions', title: 'Protege tus espacios con CCTV inteligente', ctaLabel: 'Ver seguridad', image: cctvSystemImage, imageAlt: 'Sistema de seguridad CCTV con cámara domo', backgroundColor: '#e6ebf2', textColor: '#092548', ctaColor: '#1a2989', href: '#categoria-sistemas-cctv' },
];
