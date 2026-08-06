import { BadgeDollarSign, Handshake, Network, PackageCheck, ReceiptText } from 'lucide-react';
import newsletterTechBackground from '../assets/newsletter/newsletter-tech-background.png';
import type { NewsletterBenefit } from '../components/NewsletterOffer';

export const newsletterBenefits: NewsletterBenefit[] = [
  { id: 'offers', title: 'Precios y ofertas', description: 'Promociones para ti', icon: <BadgeDollarSign /> },
  { id: 'delivery', title: 'Envíos confiables', description: 'Cobertura nacional', icon: <Handshake /> },
  { id: 'newsletter', title: 'Ofertas semanales', description: 'Al suscribirte', icon: <ReceiptText /> },
  { id: 'catalog', title: 'Amplio catálogo', description: 'Tecnología para cada necesidad', icon: <Network /> },
  { id: 'returns', title: 'Compra segura', description: 'Soporte especializado', icon: <PackageCheck /> },
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
