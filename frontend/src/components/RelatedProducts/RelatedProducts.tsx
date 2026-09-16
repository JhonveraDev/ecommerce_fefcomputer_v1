import { ProductCard, type Product } from '../FeaturedProducts/FeaturedProducts';
import styles from './RelatedProducts.module.css';

type Props = {
  products: Product[];
  currentProduct: Product;
  onProductClick: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onAddToWishlist: (product: Product) => void;
  onCompare: (product: Product) => void;
  onQuickView: (product: Product) => void;
};

export function RelatedProducts({ products, currentProduct, onProductClick, onAddToCart, onAddToWishlist, onCompare, onQuickView }: Props) {
  const related = products
    .filter((product) => product.id !== currentProduct.id)
    .sort((first, second) => {
      const score = (product: typeof first) => (product.category === currentProduct.category ? 4 : 0) + (product.brand === currentProduct.brand ? 2 : 0);
      return score(second) - score(first);
    })
    .slice(0, 4) as Product[];

  if (!related.length) return null;
  return <section className={styles.section} aria-labelledby="related-products-title">
    <header><h2 id="related-products-title">Productos relacionados</h2></header>
    <div className={styles.grid}>{related.map((product) => <ProductCard compact key={product.id} product={product} onProductClick={onProductClick} onAddToCart={onAddToCart} onAddToWishlist={onAddToWishlist} onCompare={onCompare} onQuickView={onQuickView} />)}</div>
  </section>;
}
