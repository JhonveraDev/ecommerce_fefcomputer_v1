import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { mockProducts, productCategories } from '../../data/mockProducts';
import styles from './StoreSidebar.module.css';

const INITIAL_CATEGORY_COUNT = 8;

type Props = { selectedCategory?: string; onCategorySelect: (category: string) => void };

export function CategoryFilter({ selectedCategory = 'Todas', onCategorySelect }: Props) {
  const [expanded, setExpanded] = useState(false);
  const visibleCategories = productCategories.slice(0, INITIAL_CATEGORY_COUNT);
  const extraCategories = productCategories.slice(INITIAL_CATEGORY_COUNT);
  const count = (category: string) => category === 'Todas' ? mockProducts.length : mockProducts.filter((product) => product.category === category).length;
  const categoryButton = (category: string) => <button key={category} className={selectedCategory === category ? styles.selected : ''} type="button" onClick={() => onCategorySelect(category)}>{category}<span>{count(category)}</span></button>;

  return <section className={styles.filters} aria-label="Filtrar por categorías">
    <h2>Categorías</h2>
    {categoryButton('Todas')}
    {visibleCategories.map(categoryButton)}
    {extraCategories.length > 0 && <div id="sidebar-extra-categories" className={`${styles.extraCategories} ${expanded ? styles.expanded : ''}`}><div>{extraCategories.map(categoryButton)}</div></div>}
    {extraCategories.length > 0 && <button className={styles.categoryToggle} type="button" aria-expanded={expanded} aria-controls="sidebar-extra-categories" onClick={() => setExpanded((value) => !value)}>{expanded ? 'Ver menos' : 'Ver más'} {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</button>}
  </section>;
}
