import { ProductCard, type Product } from '../FeaturedProducts/FeaturedProducts';
import { mockProducts } from '../../data/mockProducts';
import styles from './RelatedProducts.module.css';

type Props = {
  currentProduct: Product;
  onProductClick: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onAddToWishlist: (product: Product) => void;
  onCompare: (product: Product) => void;
  onQuickView: (product: Product) => void;
};

export function RelatedProducts({ currentProduct, onProductClick, onAddToCart, onAddToWishlist, onCompare, onQuickView }: Props) {
  const related = mockProducts
    .filter((product) => product.id !== currentProduct.id)
    .sort((first, second) => {
      const score = (product: typeof first) => (product.category === currentProduct.category ? 4 : 0) + (product.brand === currentProduct.brand ? 2 : 0) + product.rating / 10 + product.reviewCount / 10000;
      return score(second) - score(first);
    })
    .slice(0, 4) as Product[];

  if (!related.length) return null;
  return <section className={styles.section} aria-labelledby="related-products-title">
    <header><h2 id="related-products-title">Productos relacionados</h2></header>
    <div className={styles.grid}>{related.map((product) => <ProductCard compact key={product.id} product={product} onProductClick={onProductClick} onAddToCart={onAddToCart} onAddToWishlist={onAddToWishlist} onCompare={onCompare} onQuickView={onQuickView} />)}</div>
  </section>;
}
