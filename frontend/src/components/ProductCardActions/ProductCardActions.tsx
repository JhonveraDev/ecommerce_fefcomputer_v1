import { Eye, Heart, Shuffle } from 'lucide-react';
import styles from './ProductCardActions.module.css';

type ProductBase = { id: string; slug: string; name: string };

type Props<T extends ProductBase> = {
  product: T;
  className?: string;
  onAddToWishlist?: (product: T) => void;
  onCompare?: (product: T) => void;
  onQuickView?: (product: T) => void;
};

const actions = [
  { id: 'wishlist', label: 'Agregar a favoritos', Icon: Heart },
  { id: 'compare', label: 'Comparar producto', Icon: Shuffle },
  { id: 'quickView', label: 'Vista rápida', Icon: Eye },
] as const;

export function ProductCardActions<T extends ProductBase>({ product, className, onAddToWishlist, onCompare, onQuickView }: Props<T>) {
  const handlers = { wishlist: onAddToWishlist, compare: onCompare, quickView: onQuickView };

  return (
    <div className={`${styles.actions} ${className ?? ''}`} aria-label={`Acciones para ${product.name}`}>
      {actions.map(({ id, label, Icon }) => (
        <button key={id} type="button" className={styles.action} aria-label={label} data-tooltip={label} onClick={(event) => {
          event.stopPropagation();
          if (handlers[id]) {
            handlers[id]?.(product);
            return;
          }
          // TODO: connect this quick action when the wishlist, compare, and preview flows are available.
          console.info(`TODO: ${label.toLowerCase()}`, product.slug);
        }}>
          <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}
