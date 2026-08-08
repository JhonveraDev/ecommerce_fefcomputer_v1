import type { Product } from '../FeaturedProducts/FeaturedProducts';
import { mockProducts } from '../../data/mockProducts';
import { CategoryFilter } from './CategoryFilter';
import { PromotionalBanner } from './PromotionalBanner';
import { RecentProducts } from './RecentProducts';
import styles from './StoreSidebar.module.css';

type Props = { selectedCategory?: string; onCategorySelect: (category: string) => void; onProductClick: (product: Product) => void };

export function StoreSidebar({ selectedCategory, onCategorySelect, onProductClick }: Props) {
  const recentProducts = mockProducts.filter((product) => product.status === 'Nuevo').slice().reverse() as Product[];
  return <aside className={styles.sidebar}>
    <CategoryFilter selectedCategory={selectedCategory} onCategorySelect={onCategorySelect} />
    <div className={styles.stickySidebarContent}>
      <RecentProducts products={recentProducts} onProductClick={onProductClick} />
      <PromotionalBanner />
    </div>
  </aside>;
}
