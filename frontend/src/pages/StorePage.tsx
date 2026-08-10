import { Check, ChevronDown, ChevronLeft, ChevronRight, Grid2X2, SlidersHorizontal } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ProductCard, type Product } from '../components/FeaturedProducts/FeaturedProducts';
import { StoreSidebar } from '../components/StoreSidebar';
import { StoreBanner } from '../components/StoreBanner';
import { TimedDeals } from '../components/TimedDeals';
import { mockProducts } from '../data/mockProducts';
import { searchProducts } from '../utils/productSearch';
import styles from './StorePage.module.css';
import { navigate } from '../utils/navigation';

const pageButtons = (total: number) => total <= 5 ? Array.from({ length: total }, (_, index) => index + 1) : [1, 2, 3, '…', total];
const displayOptions = [12, 20, 36];
const sortOptions = [
  { value: 'featured', label: 'Destacados' },
  { value: 'price', label: 'Precio: menor a mayor' },
  { value: 'price-high', label: 'Precio: mayor a menor' },
  { value: 'rating', label: 'Mejor calificación' },
];

type Props = { onQuickView: (product: Product) => void; onProductClick: (product: Product) => void; onAddToCart: (product: Product) => void; locationPath: string };
type SearchResult = { product: Product; score: number };

export function StorePage({ onQuickView, onProductClick, onAddToCart, locationPath }: Props) {
  const params = useMemo(() => new URLSearchParams(locationPath.split('?')[1] || window.location.search), [locationPath]);
  const search = params.get('search') || '';
  const category = params.get('categoria') || 'Todas';
  const sort = params.get('sort') || 'featured';
  const requestedLimit = Number(params.get('mostrar')) || 20;
  const limit = displayOptions.includes(requestedLimit) ? requestedLimit : 20;
  const [openMenu, setOpenMenu] = useState<'display' | 'sort' | null>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const selectedSort = sortOptions.find((option) => option.value === sort) ?? sortOptions[0];
  const updateParams = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(params);
    Object.entries(updates).forEach(([key, value]) => value ? next.set(key, value) : next.delete(key));
    navigate(`tienda${next.toString() ? `?${next.toString()}` : ''}`);
  };
  const filtered = useMemo(() => (searchProducts(mockProducts, search) as SearchResult[])
    .filter(({ product }) => category === 'Todas' || product.category === category)
    .sort((first, second) => sort === 'price' ? first.product.price - second.product.price : sort === 'price-high' ? second.product.price - first.product.price : sort === 'rating' ? second.product.rating - first.product.rating : search ? second.score - first.score : second.product.reviewCount - first.product.reviewCount)
    .map(({ product }) => product), [search, category, sort]);
  const total = Math.max(1, Math.ceil(filtered.length / limit));
  const requestedPage = Number(params.get('page')) || 1;
  const page = Math.min(Math.max(requestedPage, 1), total);
  const shown = filtered.slice((page - 1) * limit, page * limit);
  const selectCategory = (value: string) => updateParams({ categoria: value === 'Todas' ? null : value, page: null });
  const clearSearch = () => updateParams({ search: null, page: null });

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!controlsRef.current?.contains(event.target as Node)) setOpenMenu(null);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenMenu(null);
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, []);

  return <main>
    <StoreBanner title="Tienda" items={['Inicio', 'Tienda']} />
    <section className={styles.layout}>
      <StoreSidebar selectedCategory={category} onCategorySelect={selectCategory} onProductClick={onQuickView} />
      <div className={styles.catalog}>
        {search && <div className={styles.searchSummary}><div><span>Resultados para:</span><strong>“{search}”</strong><small>{filtered.length} productos encontrados</small></div><button type="button" onClick={clearSearch}>Limpiar búsqueda</button></div>}
        <div className={styles.toolbar}>
          <p>Encontramos <b>{filtered.length}</b> productos para ti</p>
          <div className={styles.controls} ref={controlsRef}>
            <div className={styles.menuWrap}>
              <button className={styles.menuTrigger} type="button" aria-haspopup="menu" aria-expanded={openMenu === 'display'} onClick={() => setOpenMenu(openMenu === 'display' ? null : 'display')}><Grid2X2 size={17} /><span>Mostrar: <b>{limit}</b></span><ChevronDown size={16} /></button>
              {openMenu === 'display' && <div className={styles.menu} role="menu" aria-label="Cantidad de productos mostrados">{displayOptions.map((option) => <button key={option} type="button" role="menuitemradio" aria-checked={limit === option} className={limit === option ? styles.menuSelected : ''} onClick={() => { updateParams({ mostrar: option === 20 ? null : String(option), page: null }); setOpenMenu(null); }}><span>{limit === option && <Check size={16} />}</span>Mostrar {option}</button>)}</div>}
            </div>
            <div className={styles.menuWrap}>
              <button className={styles.menuTrigger} type="button" aria-haspopup="menu" aria-expanded={openMenu === 'sort'} onClick={() => setOpenMenu(openMenu === 'sort' ? null : 'sort')}><SlidersHorizontal size={17} /><span>Ordenar: <b>{selectedSort.label}</b></span><ChevronDown size={16} /></button>
              {openMenu === 'sort' && <div className={`${styles.menu} ${styles.sortMenu}`} role="menu" aria-label="Ordenar productos">{sortOptions.map((option) => <button key={option.value} type="button" role="menuitemradio" aria-checked={sort === option.value} className={sort === option.value ? styles.menuSelected : ''} onClick={() => { updateParams({ sort: option.value === 'featured' ? null : option.value, page: null }); setOpenMenu(null); }}><span>{sort === option.value && <Check size={16} />}</span>{option.label}</button>)}</div>}
            </div>
          </div>
        </div>
        {shown.length ? <div className={styles.grid}>{shown.map((product) => <ProductCard compact key={product.id} product={product} onProductClick={onProductClick} onAddToCart={onAddToCart} onQuickView={onQuickView} />)}</div> : <div className={styles.emptyState}><h2>No encontramos productos para “{search}”</h2><p>Intenta con otro término o revisa la ortografía.</p><button type="button" onClick={clearSearch}>Ver todos los productos</button></div>}
        {shown.length > 0 && <nav className={styles.pagination} aria-label="Paginación"><button disabled={page === 1} onClick={() => updateParams({ page: String(page - 1) })}><ChevronLeft size={17} /></button>{pageButtons(total).map((item, index) => item === '…' ? <span key={`ellipsis-${index}`}>…</span> : <button key={item} className={page === item ? styles.current : ''} onClick={() => updateParams({ page: String(item) })}>{item}</button>)}<button disabled={page === total} onClick={() => updateParams({ page: String(page + 1) })}><ChevronRight size={17} /></button></nav>}
        {!search && <TimedDeals products={mockProducts} onProductClick={(product) => onProductClick(product as Product)} onAddToCart={(product) => onAddToCart(product as Product)} />}
      </div>
    </section>
  </main>;
}