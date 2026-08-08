import { CheckCircle2, X } from 'lucide-react';
import { useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import styles from './CartNotification.module.css';

export function CartNotification() {
  const { notice, dismissNotice } = useCart();
  useEffect(() => {
    if (!notice) return undefined;
    const timer = window.setTimeout(dismissNotice, 3600);
    return () => window.clearTimeout(timer);
  }, [notice, dismissNotice]);
  if (!notice) return null;
  return <aside className={styles.toast} role="status" aria-live="polite">
    <CheckCircle2 size={22} aria-hidden="true" />
    <div><b>Producto agregado al carrito</b><span>{notice.product.name}{notice.quantity > 1 ? ` · Cantidad: ${notice.quantity}` : ''}</span></div>
    <button type="button" aria-label="Cerrar notificación" onClick={dismissNotice}><X size={18} /></button>
  </aside>;
}
