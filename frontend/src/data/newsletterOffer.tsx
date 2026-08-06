import newsletterTechBackground from '../assets/newsletter/newsletter-tech-background.png';
import offersIcon from '../assets/general/icon-1.svg';
import deliveryIcon from '../assets/general/icon-2.svg';
import weeklyOffersIcon from '../assets/general/icon-3.svg';
import catalogIcon from '../assets/general/icon-4.svg';
import securePurchaseIcon from '../assets/general/icon-5.svg';
import type { NewsletterBenefit } from '../components/NewsletterOffer';

export const newsletterBenefits: NewsletterBenefit[] = [
  { id: 'offers', title: 'Precios y ofertas', description: 'Promociones para ti', icon: <img src={offersIcon} alt="" /> },
  { id: 'delivery', title: 'Envíos confiables', description: 'Cobertura nacional', icon: <img src={deliveryIcon} alt="" /> },
  { id: 'newsletter', title: 'Ofertas semanales', description: 'Al suscribirte', icon: <img src={weeklyOffersIcon} alt="" /> },
  { id: 'catalog', title: 'Amplio catálogo', description: 'Tecnología para cada necesidad', icon: <img src={catalogIcon} alt="" /> },
  { id: 'returns', title: 'Compra segura', description: 'Soporte especializado', icon: <img src={securePurchaseIcon} alt="" /> },
];

export const newsletterOffer = {
  title: 'Recibe lo mejor de la tecnología en un solo lugar',
  description: <>Suscríbete y recibe novedades, ofertas y soluciones de <span>FEFCOMPUTER</span>.</>,
  image: newsletterTechBackground,
  imageAlt: 'Equipos gaming sobre una superficie reflectante',
  emailPlaceholder: 'Tu correo electrónico',
  submitLabel: 'Suscribirme',
  benefits: newsletterBenefits,
};
