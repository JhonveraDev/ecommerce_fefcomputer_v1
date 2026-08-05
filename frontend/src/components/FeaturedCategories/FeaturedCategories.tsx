import { useRef } from 'react';
import type { CSSProperties } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { CategoryCard } from './CategoryCard';
import type { FeaturedCategoriesProps } from './types';
import styles from './FeaturedCategories.module.css';

export function FeaturedCategories({
  items,
  title,
  tabs = [],
  visibleItems = 7,
  accentColor = '#2fb779',
  onCategoryClick,
  onTabClick,
  className = '',
}: FeaturedCategoriesProps) {
  const railRef = useRef<HTMLDivElement>(null);
  const sectionStyle = {
    '--visible-items': visibleItems,
    '--featured-accent': accentColor,
  } as CSSProperties;

  const moveRail = (direction: number) => {
    railRef.current?.scrollBy({ left: direction * 600, behavior: 'smooth' });
  };

  return (
    <section className={`${styles.section} ${className}`} style={sectionStyle} aria-labelledby="featured-categories-title">
      <div className={styles.heading}>
        <div className={styles.headingGroup}>
          <h2 id="featured-categories-title">{title}</h2>
          {tabs.length > 0 ? (
            <nav className={styles.tabs} aria-label={`${title}, filtros`}>
              {tabs.map((tab) => (
                <button key={tab.id} className={tab.active ? styles.activeTab : ''} type="button" onClick={() => onTabClick?.(tab)}>
                  {tab.label}
                </button>
              ))}
            </nav>
          ) : null}
        </div>
        <div className={styles.navigation} aria-label="Navegación de categorías">
          <button type="button" aria-label="Ver categorías anteriores" onClick={() => moveRail(-1)}><ArrowLeft size={19} /></button>
          <button type="button" aria-label="Ver más categorías" onClick={() => moveRail(1)}><ArrowRight size={19} /></button>
        </div>
      </div>
      <div className={styles.rail} ref={railRef}>
        {items.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            onClick={onCategoryClick}
            style={{
              '--category-background': category.backgroundColor,
              '--category-icon-color': category.iconColor,
            } as CSSProperties}
          />
        ))}
      </div>
    </section>
  );
}
