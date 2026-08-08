import { ChevronRight, Heart, Home, Minus, Plus, ShoppingCart, Sparkles, Star } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { Product } from '../components/FeaturedProducts/FeaturedProducts';
import { StoreSidebar } from '../components/StoreSidebar';
import { RelatedProducts } from '../components/RelatedProducts';
import styles from './ProductPage.module.css';

type FullProduct = Product & { description?: string; shortDescription?: string; sku?: string; stock?: number };
type Props = { product: FullProduct | undefined; onAddToCart: (product: FullProduct, quantity: number) => void; onAddToWishlist: (product: FullProduct) => void; onCompare: (product: FullProduct) => void; onQuickView?: (product: FullProduct) => void };
const money = (value: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value);

function ProductGallery({ product }: { product: FullProduct }) {
  const images = useMemo(() => [product.image], [product.image]);
  const [selected, setSelected] = useState(0);
  useEffect(() => setSelected(0), [product.id]);
  return <section className={styles.gallery} aria-label={`Galería de ${product.name}`}>
    <div className={styles.mainImage}><img src={images[selected]} alt={product.name} /></div>
    <div className={styles.thumbnails}>{images.map((image, index) => <button key={image} type="button" className={selected === index ? styles.thumbnailSelected : ''} aria-label={`Ver imagen ${index + 1}`} onClick={() => setSelected(index)}><img src={image} alt="" /></button>)}</div>
  </section>;
}

function Rating({ product }: { product: FullProduct }) {
  return <div className={styles.rating} aria-label={`${product.rating} de 5 estrellas`}>
    {Array.from({ length: 5 }, (_, index) => <Star key={index} size={17} fill={index < Math.round(product.rating) ? 'currentColor' : 'none'} />)}
    <span>({product.reviewCount} reseñas)</span>
  </div>;
}

function ProductInformation({ product, onAddToCart, onAddToWishlist, onCompare }: Omit<Props, 'product'> & { product: FullProduct }) {
  const [quantity, setQuantity] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);
  useEffect(() => { setQuantity(1); setWishlisted(false); }, [product.id]);
  const outOfStock = product.status === 'Agotado' || !product.stock;
  const discount = product.previousPrice && product.previousPrice > product.price ? Math.round((1 - product.price / product.previousPrice) * 100) : 0;
  const increment = () => setQuantity((value) => Math.min(product.stock || 1, value + 1));
  return <section className={styles.info}>
    <div className={styles.eyebrow}><span>{product.status === 'Oferta' ? 'Oferta especial' : product.category}</span>{product.brand && <span>Marca: <b>{product.brand}</b></span>}</div>
    <h1>{product.name}</h1>
    <Rating product={product} />
    <div className={styles.priceRow}><strong>{money(product.price)}</strong>{product.previousPrice && <del>{money(product.previousPrice)}</del>}{discount > 0 && <small>{discount}% OFF</small>}</div>
    <p className={`${styles.availability} ${outOfStock ? styles.unavailable : ''}`}>{outOfStock ? 'Agotado' : `Disponible · ${product.stock} unidades`}</p>
    {(product.description || product.shortDescription) && <p className={styles.description}>{product.description || product.shortDescription}</p>}
    <div className={styles.purchase}>
      <div className={styles.quantity} aria-label="Seleccionar cantidad"><button type="button" aria-label="Reducir cantidad" disabled={quantity === 1} onClick={() => setQuantity((value) => Math.max(1, value - 1))}><Minus size={17} /></button><span>{quantity}</span><button type="button" aria-label="Aumentar cantidad" disabled={outOfStock || quantity >= (product.stock || 1)} onClick={increment}><Plus size={17} /></button></div>
      <button className={styles.add} type="button" disabled={outOfStock} onClick={() => onAddToCart(product, quantity)}><ShoppingCart size={19} />Agregar al carrito</button>
      <button className={`${styles.iconAction} ${wishlisted ? styles.activeAction : ''}`} type="button" aria-label="Agregar a favoritos" onClick={() => { setWishlisted(!wishlisted); onAddToWishlist(product); }}><Heart size={20} fill={wishlisted ? 'currentColor' : 'none'} /></button>
      <button className={styles.iconAction} type="button" aria-label="Comparar producto" onClick={() => onCompare(product)}><Sparkles size={19} /></button>
    </div>
    <dl className={styles.meta}><div><dt>Categoría</dt><dd>{product.category}</dd></div>{product.sku && <div><dt>SKU</dt><dd>{product.sku}</dd></div>}<div><dt>Marca</dt><dd>{product.brand}</dd></div><div><dt>Estado</dt><dd>{outOfStock ? 'Agotado' : 'En stock'}</dd></div></dl>
  </section>;
}

function ProductDetails({ product }: { product: FullProduct }) {
  return <section className={styles.details}><h2>Detalles del producto</h2><p>{product.description || product.shortDescription || 'No hay información adicional disponible para este producto.'}</p><div><span>Marca <b>{product.brand}</b></span><span>Categoría <b>{product.category}</b></span>{product.sku && <span>SKU <b>{product.sku}</b></span>}</div></section>;
}

export function ProductPage({ product, onAddToCart, onAddToWishlist, onCompare, onQuickView }: Props) {
  if (!product) return <main className={styles.notFound}><h1>Producto no encontrado</h1><p>El producto que buscas no está disponible o fue eliminado.</p><a href="#tienda">Volver a la tienda</a></main>;
  const browseCategory = (category: string) => { window.location.hash = `#tienda?categoria=${encodeURIComponent(category)}`; };
  return <main className={styles.page}><nav className={styles.breadcrumb} aria-label="Migas de pan"><a href="#inicio"><Home size={16} />Inicio</a><ChevronRight size={15} /><a href="#tienda">Tienda</a><ChevronRight size={15} /><span>{product.category}</span><ChevronRight size={15} /><b>{product.name}</b></nav><div className={styles.productLayout}><StoreSidebar onCategorySelect={browseCategory} onProductClick={(recentProduct) => { window.location.hash = `#producto/${recentProduct.slug}`; window.scrollTo({ top: 0, behavior: 'smooth' }); }} /><div className={styles.productArea}><div className={styles.content}><ProductGallery product={product} /><ProductInformation product={product} onAddToCart={onAddToCart} onAddToWishlist={onAddToWishlist} onCompare={onCompare} /></div><ProductDetails product={product} /><RelatedProducts currentProduct={product} onProductClick={(relatedProduct) => { window.location.hash = `#producto/${relatedProduct.slug}`; window.scrollTo({ top: 0, behavior: 'smooth' }); }} onAddToCart={(relatedProduct) => onAddToCart(relatedProduct, 1)} onAddToWishlist={onAddToWishlist} onCompare={onCompare} onQuickView={onQuickView ?? (() => {})} /></div></div></main>;
}
