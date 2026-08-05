import type { ReactNode } from 'react';
import {
  BatteryCharging, Camera, Cpu, Gamepad2, HardDrive, Laptop, Monitor,
  Network, Printer, Router, Server, SunMedium, Usb, Waypoints,
} from 'lucide-react';
import { mockProducts, productCategories } from './mockProducts';
import type { FeaturedCategory } from '../components/FeaturedCategories';

type CategoryPresentation = {
  icon: ReactNode;
  backgroundColor: string;
  iconColor: string;
};

const categoryPresentation: Record<string, CategoryPresentation> = {
  'Computadores Gaming': { icon: <Gamepad2 />, backgroundColor: '#e6f4ff', iconColor: '#087bb5' },
  Laptops: { icon: <Laptop />, backgroundColor: '#e9f8f4', iconColor: '#129a7e' },
  Monitores: { icon: <Monitor />, backgroundColor: '#e8f5fc', iconColor: '#176f9f' },
  'Paneles Solares': { icon: <SunMedium />, backgroundColor: '#e5f7f1', iconColor: '#0f9873' },
  'Sistemas CCTV': { icon: <Camera />, backgroundColor: '#eaf1fc', iconColor: '#285eaa' },
  'Redes y Telecomunicaciones': { icon: <Network />, backgroundColor: '#e2f7f6', iconColor: '#087f87' },
  Servidores: { icon: <Server />, backgroundColor: '#e5effb', iconColor: '#2469ae' },
  'Componentes para PC': { icon: <Cpu />, backgroundColor: '#e6f6ee', iconColor: '#168c68' },
  'Accesorios Tecnológicos': { icon: <Usb />, backgroundColor: '#edf5ff', iconColor: '#3779bb' },
  Periféricos: { icon: <Gamepad2 />, backgroundColor: '#e7f8f5', iconColor: '#15967f' },
  Almacenamiento: { icon: <HardDrive />, backgroundColor: '#e8f2fc', iconColor: '#2b73b8' },
  Impresoras: { icon: <Printer />, backgroundColor: '#e8f8f2', iconColor: '#0d9270' },
  'Equipos de Oficina': { icon: <Router />, backgroundColor: '#e7f4fd', iconColor: '#2776ad' },
  'Energía y UPS': { icon: <BatteryCharging />, backgroundColor: '#e4f8ef', iconColor: '#11966f' },
};

export const featuredCategoryItems: FeaturedCategory[] = productCategories.map((name) => ({
  id: name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-'),
  name,
  productCount: mockProducts.filter((product) => product.category === name).length,
  icon: categoryPresentation[name]?.icon ?? <Waypoints />,
  backgroundColor: categoryPresentation[name]?.backgroundColor ?? '#e8f4fb',
  iconColor: categoryPresentation[name]?.iconColor ?? '#1587a8',
  href: `#categoria-${name.toLowerCase()}`,
}));
