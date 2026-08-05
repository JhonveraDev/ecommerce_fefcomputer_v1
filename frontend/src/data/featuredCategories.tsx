import gamingPcImage from '../assets/categories/gaming-pc.png';
import laptopImage from '../assets/categories/laptop.png';
import monitorImage from '../assets/categories/monitor.png';
import solarPanelImage from '../assets/categories/solar-panel.png';
import cctvCameraImage from '../assets/categories/cctv-camera.png';
import networkRouterImage from '../assets/categories/network-router.png';
import serverImage from '../assets/categories/server.png';
import pcComponentsImage from '../assets/categories/pc-components.png';
import techAccessoryImage from '../assets/categories/tech-accessory.png';
import peripheralsImage from '../assets/categories/peripherals.png';
import storageImage from '../assets/categories/storage.png';
import printerImage from '../assets/categories/printer.png';
import officeEquipmentImage from '../assets/categories/office-equipment.png';
import upsImage from '../assets/categories/ups.png';
import { mockProducts, productCategories } from './mockProducts';
import type { FeaturedCategory } from '../components/FeaturedCategories';

const categoryImages: Record<string, string> = {
  'Computadores Gaming': gamingPcImage,
  Laptops: laptopImage,
  Monitores: monitorImage,
  'Paneles Solares': solarPanelImage,
  'Sistemas CCTV': cctvCameraImage,
  'Redes y Telecomunicaciones': networkRouterImage,
  Servidores: serverImage,
  'Componentes para PC': pcComponentsImage,
  'Accesorios Tecnológicos': techAccessoryImage,
  Periféricos: peripheralsImage,
  Almacenamiento: storageImage,
  Impresoras: printerImage,
  'Equipos de Oficina': officeEquipmentImage,
  'Energía y UPS': upsImage,
};

export const featuredCategoryItems: FeaturedCategory[] = productCategories.map((name) => ({
  id: name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-'),
  name,
  productCount: mockProducts.filter((product) => product.category === name).length,
  image: categoryImages[name],
  backgroundColor: '#f1f4f7',
  href: `#categoria-${name.toLowerCase()}`,
}));
