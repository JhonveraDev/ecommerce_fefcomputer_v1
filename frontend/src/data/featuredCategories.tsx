import type { ReactNode } from 'react';
import {
  BatteryCharging, Camera, Cpu, Gamepad2, HardDrive, Laptop, Monitor,
  Network, Printer, Router, Server, SunMedium, Usb, Waypoints,
} from 'lucide-react';
import { mockProducts, productCategories } from './mockProducts';
import type { FeaturedCategory } from '../components/FeaturedCategories';

const categoryPresentation: Record<string, { icon: ReactNode; backgroundColor: string }> = {
  'Computadores Gaming': { icon: <Gamepad2 />, backgroundColor: '#edf9ec' },
  Laptops: { icon: <Laptop />, backgroundColor: '#fff8df' },
  Monitores: { icon: <Monitor />, backgroundColor: '#eaf8ff' },
  'Paneles Solares': { icon: <SunMedium />, backgroundColor: '#fff1e8' },
  'Sistemas CCTV': { icon: <Camera />, backgroundColor: '#f8efff' },
  'Redes y Telecomunicaciones': { icon: <Network />, backgroundColor: '#eaf9f3' },
  Servidores: { icon: <Server />, backgroundColor: '#edf4ff' },
  'Componentes para PC': { icon: <Cpu />, backgroundColor: '#fff0ec' },
  'Accesorios Tecnológicos': { icon: <Usb />, backgroundColor: '#eef7ff' },
  Periféricos: { icon: <Gamepad2 />, backgroundColor: '#f4f7e8' },
  Almacenamiento: { icon: <HardDrive />, backgroundColor: '#fff4e8' },
  Impresoras: { icon: <Printer />, backgroundColor: '#f2efff' },
  'Equipos de Oficina': { icon: <Router />, backgroundColor: '#eef8f8' },
  'Energía y UPS': { icon: <BatteryCharging />, backgroundColor: '#fff2dc' },
};

export const featuredCategoryItems: FeaturedCategory[] = productCategories.map((name) => ({
  id: name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-'),
  name,
  productCount: mockProducts.filter((product) => product.category === name).length,
  icon: categoryPresentation[name]?.icon ?? <Waypoints />,
  backgroundColor: categoryPresentation[name]?.backgroundColor ?? '#eff8f1',
  href: `#categoria-${name.toLowerCase()}`,
}));
