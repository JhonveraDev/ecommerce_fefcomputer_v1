import { Eye, Heart, Shuffle } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { useCompare } from '../../context/CompareContext';
import styles from './ProductCardActions.module.css';

type ProductBase = { id: string; slug: string; name: string };
type Props<T extends ProductBase> = { product: T; className?: string; onAddToWishlist?: (product: T) => void; onCompare?: (product: T) => void; onQuickView?: (product: T) => void; };
const actions = [{ id: 'wishlist', label: 'Agregar a favoritos', Icon: Heart }, { id: 'compare', label: 'Comparar producto', Icon: Shuffle }, { id: 'quickView', label: 'Vista rápida', Icon: Eye }] as const;

export function ProductCardActions<T extends ProductBase>({ product, className, onAddToWishlist, onCompare, onQuickView }: Props<T>) {
  const { isFavorite, toggleWishlist } = useWishlist() as any;
  const { isInCompare, toggleCompare } = useCompare() as any;
  const handlers = { quickView: onQuickView };
  return <div className={`${styles.actions} ${className ?? ''}`} aria-label={`Acciones para ${product.name}`}>{actions.map(({ id, label, Icon }) => <button key={id} type="button" className={styles.action} aria-label={label} data-tooltip={label} onClick={(event) => { event.stopPropagation(); if (id === 'wishlist') { toggleWishlist(product); onAddToWishlist?.(product); return; } if (id === 'compare') { toggleCompare(product); return; } if (handlers[id]) { handlers[id]?.(product); return; } console.info(`TODO: ${label.toLowerCase()}`, product.slug); }}><Icon size={18} strokeWidth={1.8} fill={id === 'wishlist' && isFavorite(product.id) ? 'currentColor' : 'none'} color={id === 'compare' && isInCompare(product.id) ? 'var(--color-primary)' : undefined} aria-hidden="true" /></button>)}</div>;
}