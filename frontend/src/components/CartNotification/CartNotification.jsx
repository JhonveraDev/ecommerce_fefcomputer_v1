import { CheckCircle2, ShoppingCart, X } from 'lucide-react';
import { useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import styles from './CartNotification.module.css';

export function CartNotification() {
  const { notice, dismissNotice } = useCart();
  useEffect(() => {
    if (!notice) return undefined;
    const timer = window.setTimeout(dismissNotice, 5200);
    return () => window.clearTimeout(timer);
  }, [notice, dismissNotice]);
  if (!notice) return null;
  const openCart = () => { window.location.hash = 'carrito'; window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' })); dismissNotice(); };
  return <aside className={styles.toast} role="status" aria-live="polite">
    <header><CheckCircle2 size={25} aria-hidden="true" /><b>Artículo añadido a la cesta</b><button type="button" aria-label="Cerrar notificación" onClick={dismissNotice}><X size={19} /></button></header>
    <div className={styles.product}><img src={notice.product.image} alt={notice.product.name} /><div><strong>{notice.product.name}</strong>{notice.product.brand && <span>{notice.product.brand}</span>}{notice.quantity > 1 && <small>Cantidad: {notice.quantity}</small>}</div></div>
    <footer><button className={styles.continue} type="button" onClick={dismissNotice}>Seguir comprando</button><button className={styles.viewCart} type="button" onClick={openCart}><ShoppingCart size={20} />Ver mi cesta</button></footer>
  </aside>;
}