import { ChevronRight, Home, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import styles from './CartPage.module.css';

const money = (value: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value);

function QuantityControl({ value, max, onChange }: { value: number; max?: number; onChange: (value: number) => void }) {
  return <div className={styles.quantity} aria-label="Cantidad"><button type="button" aria-label="Reducir cantidad" disabled={value === 1} onClick={() => onChange(value - 1)}><Minus size={16} /></button><span>{value}</span><button type="button" aria-label="Aumentar cantidad" disabled={max !== undefined && value >= max} onClick={() => onChange(value + 1)}><Plus size={16} /></button></div>;
}

function CartItem({ item, onProductClick }: { item: any; onProductClick: (product: any) => void }) {
  const { updateQuantity, removeItem } = useCart() as any;
  const { product, quantity } = item;
  return <article className={styles.item}>
    <button className={styles.product} type="button" onClick={() => onProductClick(product)}><span className={styles.image}><img src={product.image} alt={product.name} /></span><span><b>{product.name}</b>{product.sku && <small>SKU: {product.sku}</small>}{product.brand && <small>{product.brand}</small>}</span></button>
    <div className={styles.unitPrice}><span>Precio unitario</span><strong>{money(product.price)}</strong>{product.previousPrice && <del>{money(product.previousPrice)}</del>}</div>
    <QuantityControl value={quantity} max={product.stock} onChange={(value) => updateQuantity(product.id, value)} />
    <strong className={styles.lineTotal}>{money(product.price * quantity)}</strong>
    <button className={styles.remove} type="button" aria-label={`Eliminar ${product.name}`} onClick={() => removeItem(product.id)}><Trash2 size={18} /></button>
  </article>;
}

function CartSummary() {
  const { items, subtotal, savings } = useCart() as any;
  const shipping = 0;
  return <aside className={styles.summary}><h2>Resumen del pedido</h2><dl><div><dt>Subtotal</dt><dd>{money(subtotal)}</dd></div>{savings > 0 && <div><dt>Descuentos</dt><dd className={styles.savings}>−{money(savings)}</dd></div>}<div><dt>Envío</dt><dd>{shipping ? money(shipping) : 'Gratis'}</dd></div><div className={styles.total}><dt>Total</dt><dd>{money(subtotal + shipping)}</dd></div></dl><button type="button" disabled={!items.length} onClick={() => console.info('Checkout pendiente de implementación')}><ShoppingBag size={18} />Proceder al pago</button><a href="#tienda">Continuar comprando</a></aside>;
}

export function CartPage({ onProductClick }: { onProductClick: (product: any) => void }) {
  const { items, itemCount, clearCart } = useCart() as any;
  if (!items.length) return <main className={styles.page}><nav className={styles.breadcrumb} aria-label="Migas de pan"><a href="#inicio"><Home size={16} />Inicio</a><ChevronRight size={15} /><a href="#tienda">Tienda</a><ChevronRight size={15} /><b>Carrito</b></nav><section className={styles.empty}><ShoppingBag size={52} /><h1>Tu carrito está vacío</h1><p>Agrega productos para comenzar tu compra.</p><a href="#tienda">Ir a la tienda</a></section></main>;
  return <main className={styles.page}><nav className={styles.breadcrumb} aria-label="Migas de pan"><a href="#inicio"><Home size={16} />Inicio</a><ChevronRight size={15} /><a href="#tienda">Tienda</a><ChevronRight size={15} /><b>Carrito</b></nav><header className={styles.heading}><div><h1>Tu carrito</h1><p>Tienes <b>{itemCount}</b> {itemCount === 1 ? 'producto' : 'productos'} en tu carrito</p></div><button type="button" onClick={clearCart}><Trash2 size={16} />Vaciar carrito</button></header><div className={styles.layout}><section className={styles.items} aria-label="Productos en el carrito"><header className={styles.tableHeader}><span>Producto</span><span>Precio unitario</span><span>Cantidad</span><span>Subtotal</span><span>Eliminar</span></header>{items.map((item: any) => <CartItem key={item.product.id} item={item} onProductClick={onProductClick} />)}</section><CartSummary /></div></main>;
}
