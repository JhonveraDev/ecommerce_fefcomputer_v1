import type { CategoryCardProps } from './types';
import styles from './CategoryCard.module.css';

export function CategoryCard({ category, onClick, style }: CategoryCardProps) {
  const content = (
    <>
      <span className={styles.visual}>
        {category.image ? <img src={category.image} alt="" /> : category.icon}
      </span>
      <strong>{category.name}</strong>
      <small>{category.productCount} productos</small>
    </>
  );

  if (category.href && !onClick) {
    return <a className={styles.card} style={style} href={category.href}>{content}</a>;
  }

  return (
    <button className={styles.card} style={style} type="button" onClick={() => onClick?.(category)}>
      {content}
    </button>
  );
}
