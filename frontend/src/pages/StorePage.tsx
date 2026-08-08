import { ChevronLeft, ChevronRight, Grid2X2, SlidersHorizontal } from 'lucide-react';
import { useMemo } from 'react';
import { ProductCard, type Product } from '../components/FeaturedProducts/FeaturedProducts';
import { StoreSidebar } from '../components/StoreSidebar';
import { StoreBanner } from '../components/StoreBanner';
import { TimedDeals } from '../components/TimedDeals';
import { mockProducts } from '../data/mockProducts';
import { searchProducts } from '../utils/productSearch';
import styles from './StorePage.module.css';

const PAGE_SIZE = 20;
const pageButtons = (total: number) => total <= 5 ? Array.from({ length: total }, (_, index) => index + 1) : [1, 2, 3, '…', total];

type Props = { onQuickView: (product: Product) => void; onProductClick: (product: Product) => void; onAddToCart: (product: Product) => void; locationHash: string };
type SearchResult = { product: Product; score: number };

export function StorePage({ onQuickView, onProductClick, onAddToCart, locationHash }: Props) {
  const params = useMemo(() => new URLSearchParams(locationHash.split('?')[1] || window.location.search), [locationHash]);
  const search = params.get('search') || '';
  const category = params.get('categoria') || 'Todas';
  const sort = params.get('sort') || 'featured';
  const updateParams = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(params);
    Object.entries(updates).forEach(([key, value]) => value ? next.set(key, value) : next.delete(key));
    window.location.hash = `tienda${next.toString() ? `?${next.toString()}` : ''}`;
  };
  const filtered = useMemo(() => (searchProducts(mockProducts, search) as SearchResult[])
    .filter(({ product }) => category === 'Todas' || product.category === category)
    .sort((first, second) => sort === 'price' ? first.product.price - second.product.price : sort === 'price-high' ? second.product.price - first.product.price : sort === 'rating' ? second.product.rating - first.product.rating : search ? second.score - first.score : second.product.reviewCount - first.product.reviewCount)
    .map(({ product }) => product), [search, category, sort]);
  const total = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const requestedPage = Number(params.get('page')) || 1;
  const page = Math.min(Math.max(requestedPage, 1), total);
  const shown = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const selectCategory = (value: string) => updateParams({ categoria: value === 'Todas' ? null : value, page: null });
  const clearSearch = () => updateParams({ search: null, page: null });

  return <main>
    <StoreBanner title="Tienda" items={['Inicio', 'Tienda']} />
    <section className={styles.layout}>
      <StoreSidebar selectedCategory={category} onCategorySelect={selectCategory} onProductClick={onQuickView} />
      <div className={styles.catalog}>
        {search && <div className={styles.searchSummary}><div><span>Resultados para:</span><strong>“{search}”</strong><small>{filtered.length} productos encontrados</small></div><button type="button" onClick={clearSearch}>Limpiar búsqueda</button></div>}
        <div className={styles.toolbar}>
          <p>Encontramos <b>{filtered.length}</b> productos para ti</p>
          <div>
            <label><Grid2X2 size={16} />Mostrar<select defaultValue="20"><option>20</option></select></label>
            <label><SlidersHorizontal size={16} />Ordenar<select value={sort} onChange={(event) => updateParams({ sort: event.target.value === 'featured' ? null : event.target.value, page: null })}><option value="featured">Destacados</option><option value="price">Precio: menor a mayor</option><option value="price-high">Precio: mayor a menor</option><option value="rating">Calificación</option></select></label>
          </div>
        </div>
        {shown.length ? <div className={styles.grid}>{shown.map((product) => <ProductCard compact key={product.id} product={product} onProductClick={onProductClick} onAddToCart={onAddToCart} onQuickView={onQuickView} />)}</div> : <div className={styles.emptyState}><h2>No encontramos productos para “{search}”</h2><p>Intenta con otro término o revisa la ortografía.</p><button type="button" onClick={clearSearch}>Ver todos los productos</button></div>}
        {shown.length > 0 && <nav className={styles.pagination} aria-label="Paginación"><button disabled={page === 1} onClick={() => updateParams({ page: String(page - 1) })}><ChevronLeft size={17} /></button>{pageButtons(total).map((item, index) => item === '…' ? <span key={`ellipsis-${index}`}>…</span> : <button key={item} className={page === item ? styles.current : ''} onClick={() => updateParams({ page: String(item) })}>{item}</button>)}<button disabled={page === total} onClick={() => updateParams({ page: String(page + 1) })}><ChevronRight size={17} /></button></nav>}
        {!search && <TimedDeals products={mockProducts} onProductClick={(product) => onProductClick(product as Product)} onAddToCart={(product) => onAddToCart(product as Product)} />}
      </div>
    </section>
  </main>;
}