import { ShoppingCart } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ProductCardActions } from '../ProductCardActions';
import styles from './FeaturedProducts.module.css';

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  brand: string;
  price: number;
  previousPrice: number | null;
  image: string;
  baseStock?: number;
  variantStock?: number;
  stock?: number;
  status: 'Disponible' | 'Agotado' | 'Oferta' | 'Nuevo';
  tags?: string[];
  relatedProductIds?: string[];
  hasVariants?: boolean;
};

type Props = {
  products: Product[];
  onProductClick?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  onAddToWishlist?: (product: Product) => void;
  onCompare?: (product: Product) => void;
  onQuickView?: (product: Product) => void;
};

const money = (value: number) => new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
}).format(value);

const tabs = [
  { id: 'all', label: 'Selección' },
  { id: 'offer', label: 'Ofertas' },
  { id: 'new', label: 'Novedades' },
];

const HOME_FEATURED_LIMIT = 5;

export function ProductCard({ product, onProductClick, onAddToCart, onAddToWishlist, onCompare, onQuickView, compact = false }: {
  product: Product;
  onProductClick?: Props['onProductClick'];
  onAddToCart?: Props['onAddToCart'];
  onAddToWishlist?: Props['onAddToWishlist'];
  onCompare?: Props['onCompare'];
  onQuickView?: Props['onQuickView'];
  compact?: boolean;
}) {
  const discount = product.previousPrice
    ? Math.round((1 - product.price / product.previousPrice) * 100)
    : 0;
  const label = product.status === 'Oferta' ? `-${discount}%` : product.status === 'Nuevo' ? 'Nuevo' : null;

  return (
    <article className={`${styles.card} ${compact ? styles.compact : ''}`}>
      {label && <span className={`${styles.badge} ${product.status === 'Nuevo' ? styles.newBadge : ''}`}>{label}</span>}
      <ProductCardActions className={styles.actions} product={product} onAddToWishlist={onAddToWishlist} onCompare={onCompare} onQuickView={onQuickView} />
      <button className={styles.media} type="button" onClick={() => onProductClick?.(product)} aria-label={`Ver ${product.name}`}>
        <img src={product.image} alt={product.name} />
      </button>
      <div className={styles.details}>
        <p className={styles.category}>{product.category}</p>
        <button className={styles.product} type="button" onClick={() => onProductClick?.(product)}><h3>{product.name}</h3></button>
        <p className={styles.brand}>Por {product.brand}</p>
      </div>
      <div className={styles.footer}>
        <div className={styles.prices}>
          <strong>{money(product.price)}</strong>
          {product.previousPrice && <del>{money(product.previousPrice)}</del>}
        </div>
        <button className={styles.add} type="button" onClick={() => product.hasVariants ? onProductClick?.(product) : onAddToCart?.(product)}>
          <ShoppingCart size={17} aria-hidden="true" />
          Agregar
        </button>
      </div>
    </article>
  );
}

export function FeaturedProducts({ products, onProductClick, onAddToCart, onAddToWishlist, onCompare, onQuickView }: Props) {
  const [activeTab, setActiveTab] = useState('all');
  const visibleProducts = useMemo(() => {
    const ordered = [...products].sort((first, second) => {
      const priority = (product: Product) => product.previousPrice !== null ? 0 : product.status === 'Nuevo' ? 1 : 2;
      return priority(first) - priority(second);
    });
    if (activeTab === 'offer') return ordered.filter((product) => product.previousPrice !== null);
    if (activeTab === 'new') return ordered.filter((product) => product.status === 'Nuevo');
    return ordered;
  }, [activeTab, products]);
  const featuredProducts = visibleProducts.slice(0, HOME_FEATURED_LIMIT);

  return (
    <section className={styles.section} aria-labelledby="featured-products-title">
      <header className={styles.header}>
        <div><p className={styles.eyebrow}>Selección de la semana</p><h2 id="featured-products-title">Productos destacados</h2></div>
        <div className={styles.headerActions}><nav aria-label="Filtrar productos destacados">{tabs.map((tab) => <button className={activeTab === tab.id ? styles.active : ''} key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}>{tab.label}</button>)}</nav><a className={styles.viewAll} href="/tienda?sort=featured">Ver todos</a></div>
      </header>
      <div className={styles.grid}>
        {featuredProducts.map((product) => (
          <ProductCard key={product.id} product={product} onProductClick={onProductClick} onAddToCart={onAddToCart} onAddToWishlist={onAddToWishlist} onCompare={onCompare} onQuickView={onQuickView} />
        ))}
      </div>
      {!featuredProducts.length && <p className={styles.empty}>No hay productos destacados en esta categoría por ahora.</p>}
    </section>
  );
}
