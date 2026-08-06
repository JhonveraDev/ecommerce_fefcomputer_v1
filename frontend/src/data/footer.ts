import { Facebook, Instagram, Linkedin, Mail, MapPin, MessageCircle, Phone, Twitter } from 'lucide-react';
import type { FooterProps } from '../components/Footer/types';

export const footerData: FooterProps = {
  description: 'Tecnología confiable para transformar tu hogar, oficina y empresa.',
  contacts: [{ icon: MapPin, label: 'Dirección:', value: 'Bogotá, Colombia' }, { icon: Phone, label: 'Llámanos:', value: '+57 311 896 1906', href: 'tel:+573118961906' }, { icon: Mail, label: 'Email:', value: 'ventas@fefcomputer.co', href: 'mailto:ventas@fefcomputer.co' }, { icon: MessageCircle, label: 'Horario:', value: 'Lun - Sáb, 8:00 - 18:00' }],
  columns: [
    { title: 'Empresa', links: [{ label: 'Nosotros', href: '#nosotros' }, { label: 'Información de envíos', href: '#envios' }, { label: 'Política de privacidad', href: '#privacidad' }, { label: 'Términos y condiciones', href: '#terminos' }, { label: 'Contáctanos', href: '#contacto' }, { label: 'Centro de ayuda', href: '#ayuda' }, { label: 'Trabaja con nosotros', href: '#empleo' }] },
    { title: 'Cuenta', links: [{ label: 'Iniciar sesión', href: '#cuenta' }, { label: 'Ver carrito', href: '#carrito' }, { label: 'Mis favoritos', href: '#favoritos' }, { label: 'Rastrear pedido', href: '#rastrear' }, { label: 'Solicitar soporte', href: '#soporte' }, { label: 'Detalles de envío', href: '#envios' }, { label: 'Comparar productos', href: '#comparar' }] },
    { title: 'Corporativo', links: [{ label: 'Vende con nosotros', href: '#vendedores' }, { label: 'Programa de afiliados', href: '#afiliados' }, { label: 'Soluciones empresariales', href: '#empresas' }, { label: 'Carreras', href: '#empleo' }, { label: 'Proveedores', href: '#proveedores' }, { label: 'Accesibilidad', href: '#accesibilidad' }, { label: 'Promociones', href: '#ofertas' }] },
    { title: 'Destacados', links: [{ label: 'Computadores Gaming', href: '#gaming' }, { label: 'Laptops', href: '#laptops' }, { label: 'Monitores', href: '#monitores' }, { label: 'Videovigilancia', href: '#cctv' }, { label: 'Redes y conectividad', href: '#redes' }, { label: 'Almacenamiento', href: '#almacenamiento' }, { label: 'Energía y UPS', href: '#energia' }] },
  ],
  downloadLabel: 'Próximamente en App Store y Google Play', paymentLabel: 'Pasarelas de pago seguras',
  phones: [{ label: '+57 311 896 1906', detail: 'Lun - Sáb: 8:00 - 18:00', href: 'tel:+573118961906' }, { label: 'Soporte técnico', detail: 'Atención especializada', href: 'tel:+573118961906' }],
  socials: [{ label: 'Facebook', href: '#facebook', icon: Facebook }, { label: 'X', href: '#twitter', icon: Twitter }, { label: 'Instagram', href: '#instagram', icon: Instagram }, { label: 'LinkedIn', href: '#linkedin', icon: Linkedin }], copyright: '© 2026, FEFCOMPUTER',
};
