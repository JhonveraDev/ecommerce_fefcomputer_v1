import { ShoppingBag, Trash2 } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import styles from './MiniCart.module.css';

const money = (value) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value);

export function MiniCart({ open, onClose }) {
  const { items, subtotal, removeItem } = useCart();
  const openCart = () => { window.location.hash = 'carrito'; window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' })); onClose(); };
  return <section className={`${styles.panel} ${open ? styles.open : ''}`} aria-label="Resumen del carrito" aria-hidden={!open}>
    <h2>Tu carrito</h2>
    {!items.length ? <div className={styles.empty}><ShoppingBag size={31} /><p>Tu carrito está vacío</p><a href="#tienda" onClick={onClose}>Explorar tienda</a></div> : <><div className={styles.items}>{items.map(({ product, quantity }) => <article key={product.id}><img src={product.image} alt={product.name} /><div><b>{product.name}</b><span>{quantity} × {money(product.price)}</span></div><button type="button" aria-label={`Eliminar ${product.name}`} onClick={() => removeItem(product.id)}><Trash2 size={16} /></button></article>)}</div><div className={styles.total}><span>Subtotal</span><strong>{money(subtotal)}</strong></div><footer><button type="button" className={styles.view} onClick={openCart}>Ver carrito</button><button type="button" className={styles.checkout} onClick={() => console.info('Checkout pendiente de implementación')}>Checkout</button></footer></>}
  </section>;
}
