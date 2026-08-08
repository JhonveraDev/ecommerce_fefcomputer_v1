import { Fragment } from 'react';
import { AlignLeft, BadgeCheck, Barcode, Boxes, ChevronRight, CircleDollarSign, Home, LayoutGrid, PackageCheck, Plus, ShoppingCart, Sparkles, Star, Tag, Trash2, X } from 'lucide-react';
import { useCompare } from '../context/CompareContext';
import { mockProducts } from '../data/mockProducts';
import styles from './ComparePage.module.css';

const money = (value: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value);
const labels = [
  { label: 'Marca', hint: 'Fabricante', Icon: BadgeCheck, value: (p: any) => p.brand },
  { label: 'Categoría', hint: 'Tipo de producto', Icon: Boxes, value: (p: any) => p.category },
  { label: 'SKU', hint: 'Código de referencia', Icon: Barcode, value: (p: any) => p.sku || '—' },
  { label: 'Precio anterior', hint: 'Precio de lista', Icon: Tag, value: (p: any) => p.previousPrice ? money(p.previousPrice) : '—' },
  { label: 'Valoración', hint: 'Opiniones de clientes', Icon: Star, value: (p: any) => `${p.rating}/5 (${p.reviewCount})` },
  { label: 'Disponibilidad', hint: 'Inventario actual', Icon: PackageCheck, value: (p: any) => p.stock ? `${p.stock} unidades` : 'Agotado' },
  { label: 'Descripción', hint: 'Resumen del producto', Icon: AlignLeft, value: (p: any) => p.shortDescription || '—' },
];

function AttributeLabel({ label, hint, Icon }: { label: string; hint: string; Icon: any }) {
  return <div className={styles.label}><span className={styles.labelIcon}><Icon size={16} strokeWidth={2} /></span><span className={styles.labelCopy}><b>{label}</b><small>{hint}</small></span></div>;
}

export function ComparePage({ onProductClick, onAddToCart }: { onProductClick: (p: any) => void; onAddToCart: (p: any) => void }) {
  const { productIds, removeFromCompare, clearCompare } = useCompare() as any;
  const products = mockProducts.filter((product) => productIds.includes(product.id));

  if (!products.length) return <main className={styles.page}><nav className={styles.breadcrumb} aria-label="Migas de pan"><a href="#inicio"><Home size={16} />Inicio</a><ChevronRight size={15} /><b>Comparar</b></nav><section className={styles.empty}><Sparkles size={52} /><h1>Compara productos</h1><p>Selecciona hasta 4 productos desde la tienda para comparar sus características.</p><a href="#tienda">Explorar tienda</a></section></main>;

  return <main className={styles.page}><nav className={styles.breadcrumb} aria-label="Migas de pan"><a href="#inicio"><Home size={16} />Inicio</a><ChevronRight size={15} /><b>Comparar</b></nav><header className={styles.heading}><div><h1>Comparar productos</h1><p>{products.length} de 4 productos seleccionados</p></div><button type="button" onClick={clearCompare}><Trash2 size={16} />Limpiar comparación</button></header><div className={styles.scroller}><section className={styles.table} style={{ gridTemplateColumns: `210px repeat(${products.length}, minmax(220px, 1fr))` }}><div className={`${styles.label} ${styles.productLabel}`}><span className={styles.labelIcon}><LayoutGrid size={16} /></span><span className={styles.labelCopy}><b>Productos</b><small>Características comparadas</small></span></div>{products.map((product) => <article className={styles.product} key={product.id}><button className={styles.remove} type="button" aria-label={`Quitar ${product.name}`} onClick={() => removeFromCompare(product.id)}><X size={17} /></button><button className={styles.visual} type="button" onClick={() => onProductClick(product)}><img src={product.image} alt={product.name} /><b>{product.name}</b></button></article>)}{labels.map(({ label, hint, Icon, value }) => <Fragment key={label}><AttributeLabel label={label} hint={hint} Icon={Icon} />{products.map((product) => <div className={label === 'Descripción' ? styles.description : styles.value} key={`${label}-${product.id}`}>{label === 'Valoración' && <span className={styles.stars}>{Array.from({ length: 5 }, (_, index) => <Star key={index} size={13} fill={index < Math.round(product.rating) ? 'currentColor' : 'none'} />)}</span>}{value(product)}</div>)}</Fragment>)}<div className={`${styles.label} ${styles.actionLabel}`}><span className={styles.labelIcon}><CircleDollarSign size={16} /></span><span className={styles.labelCopy}><b>Acción</b><small>Compra este producto</small></span></div>{products.map((product) => <button className={styles.add} key={`add-${product.id}`} type="button" disabled={!product.stock} onClick={() => onAddToCart(product)}><ShoppingCart size={17} />Agregar al carrito</button>)}</section></div>{products.length < 4 && <a className={styles.addMore} href="#tienda"><Plus size={18} />Agregar otro producto</a>}</main>;
}
