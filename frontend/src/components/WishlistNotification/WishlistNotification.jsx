import { Heart, X } from 'lucide-react';
import { useEffect } from 'react';
import { useWishlist } from '../../context/WishlistContext';
import styles from './WishlistNotification.module.css';

export function WishlistNotification() {
  const { notice, dismissNotice } = useWishlist();
  useEffect(() => { if (!notice) return undefined; const timer = window.setTimeout(dismissNotice, 4000); return () => window.clearTimeout(timer); }, [notice, dismissNotice]);
  if (!notice) return null;
  return <aside className={styles.toast} role="status" aria-live="polite"><Heart size={23} fill="currentColor" aria-hidden="true" /><img src={notice.product.image} alt="" /><div><b>{notice.added ? 'Añadido a favoritos' : 'Eliminado de favoritos'}</b><span>{notice.product.name}</span></div><button type="button" aria-label="Cerrar notificación" onClick={dismissNotice}><X size={18} /></button></aside>;
}
