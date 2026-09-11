import type { Product } from '../FeaturedProducts/FeaturedProducts';
import { CategoryFilter } from './CategoryFilter';
import { PromotionalBanner } from './PromotionalBanner';
import { RecentProducts } from './RecentProducts';
import styles from './StoreSidebar.module.css';

type Props = { products: Product[]; selectedCategory?: string; onCategorySelect: (category: string) => void; onProductClick: (product: Product) => void };

export function StoreSidebar({ products, selectedCategory, onCategorySelect, onProductClick }: Props) {
  const recentProducts = products.filter((product) => product.status === 'Nuevo').slice(0, 3);
  return <aside className={styles.sidebar}>
    <CategoryFilter products={products} selectedCategory={selectedCategory} onCategorySelect={onCategorySelect} />
    <div className={styles.stickySidebarContent}>
      <RecentProducts products={recentProducts} onProductClick={onProductClick} />
      <PromotionalBanner />
    </div>
  </aside>;
}
