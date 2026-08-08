import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Grid2X2, SlidersHorizontal } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ProductCard, type Product } from '../components/FeaturedProducts/FeaturedProducts';
import { StoreBanner } from '../components/StoreBanner';
import { PromotionalBanner, RecentProducts } from '../components/StoreSidebar';
import { TimedDeals } from '../components/TimedDeals';
import { mockProducts, productCategories } from '../data/mockProducts';
import styles from './StorePage.module.css';

const PAGE_SIZE = 20;
const INITIAL_CATEGORY_COUNT = 8;
const pageButtons = (page: number, total: number) => total <= 5 ? Array.from({ length: total }, (_, index) => index + 1) : [1, 2, 3, '…', total];

export function StorePage({ onQuickView }: { onQuickView: (product: Product) => void }) {
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState('Todas');
  const [categoriesExpanded, setCategoriesExpanded] = useState(false);
  const [sort, setSort] = useState('featured');
  const filtered = useMemo(() => mockProducts
    .filter((product) => category === 'Todas' || product.category === category)
    .sort((first, second) => sort === 'price' ? first.price - second.price : sort === 'rating' ? second.rating - first.rating : second.reviewCount - first.reviewCount), [category, sort]);
  const total = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const shown = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const selectCategory = (value: string) => { setCategory(value); setPage(1); };
  const recent = mockProducts.filter((product) => product.status === 'Nuevo').slice().reverse();
  const visibleCategories = productCategories.slice(0, INITIAL_CATEGORY_COUNT);
  const extraCategories = productCategories.slice(INITIAL_CATEGORY_COUNT);

  return <main>
    <StoreBanner title="Tienda" items={['Inicio', 'Tienda']} />
    <section className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.filters}>
          <h2>Categorías</h2>
          <button className={category === 'Todas' ? styles.selected : ''} onClick={() => selectCategory('Todas')}>Todas<span>{mockProducts.length}</span></button>
          {visibleCategories.map((categoryName) => <button key={categoryName} className={category === categoryName ? styles.selected : ''} onClick={() => selectCategory(categoryName)}>{categoryName}<span>{mockProducts.filter((product) => product.category === categoryName).length}</span></button>)}
          {extraCategories.length > 0 && <div id="store-extra-categories" className={`${styles.extraCategories} ${categoriesExpanded ? styles.expanded : ''}`}><div>{extraCategories.map((categoryName) => <button key={categoryName} className={category === categoryName ? styles.selected : ''} onClick={() => selectCategory(categoryName)}>{categoryName}<span>{mockProducts.filter((product) => product.category === categoryName).length}</span></button>)}</div></div>}
          {extraCategories.length > 0 && <button className={styles.categoryToggle} type="button" aria-expanded={categoriesExpanded} aria-controls="store-extra-categories" onClick={() => setCategoriesExpanded((expanded) => !expanded)}>{categoriesExpanded ? 'Ver menos' : 'Ver más'} {categoriesExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</button>}
        </div>
        <div className={styles.stickySidebarContent}>
          <RecentProducts products={recent} onProductClick={onQuickView} />
          <PromotionalBanner />
        </div>
      </aside>
      <div className={styles.catalog}>
        <div className={styles.toolbar}>
          <p>Encontramos <b>{filtered.length}</b> productos para ti</p>
          <div>
            <label><Grid2X2 size={16} />Mostrar<select defaultValue="20"><option>20</option></select></label>
            <label><SlidersHorizontal size={16} />Ordenar<select value={sort} onChange={(event) => setSort(event.target.value)}><option value="featured">Destacados</option><option value="price">Precio</option><option value="rating">Calificación</option></select></label>
          </div>
        </div>
        <div className={styles.grid}>{shown.map((product) => <ProductCard compact key={product.id} product={product} onProductClick={() => {}} onAddToCart={() => {}} onQuickView={onQuickView} />)}</div>
        <nav className={styles.pagination} aria-label="Paginación">
          <button disabled={page === 1} onClick={() => setPage(page - 1)}><ChevronLeft size={17} /></button>
          {pageButtons(page, total).map((item, index) => item === '…' ? <span key={`ellipsis-${index}`}>…</span> : <button key={item} className={page === item ? styles.current : ''} onClick={() => setPage(item as number)}>{item}</button>)}
          <button disabled={page === total} onClick={() => setPage(page + 1)}><ChevronRight size={17} /></button>
        </nav>
        <TimedDeals products={mockProducts} onProductClick={onQuickView} onAddToCart={(product) => console.info('Producto agregado:', product.slug)} />
      </div>
    </section>
  </main>;
}
