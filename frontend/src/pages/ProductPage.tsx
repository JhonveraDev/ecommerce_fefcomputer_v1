import { ChevronRight, Heart, Home, Minus, Plus, ShoppingCart, Sparkles, Star } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { Product } from '../components/FeaturedProducts/FeaturedProducts';
import { StoreSidebar } from '../components/StoreSidebar';
import { RelatedProducts } from '../components/RelatedProducts';
import { useWishlist } from '../context/WishlistContext';
import { navigate } from '../utils/navigation';
import styles from './ProductPage.module.css';

type FullProduct = Product & { description?: string; shortDescription?: string; sku?: string; stock?: number; variantId?: string; selectedVariant?: Record<string, string>; imageUrls?: string[]; specifications?: Record<string, string>; warranty?: string | null; condition?: string | null; tags?: string[]; seoTitle?: string | null; seoDescription?: string | null; variants?: Array<{ id: string; sku: string; attributes: Record<string, string>; priceOverride: number | null; stock: number }>; weightGrams?: number | null; lengthCm?: number | null; widthCm?: number | null; heightCm?: number | null };
type Props = { products: FullProduct[]; product: FullProduct | undefined; onAddToCart: (product: FullProduct, quantity: number) => void; onAddToWishlist: (product: FullProduct) => void; onCompare: (product: FullProduct) => void; onQuickView?: (product: FullProduct) => void };
const money = (value: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value);

function ProductGallery({ product }: { product: FullProduct }) {
  const images = useMemo(() => product.imageUrls?.length ? product.imageUrls : [product.image], [product.image, product.imageUrls]);
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

function ProductInformation({ product, onAddToCart, onAddToWishlist, onCompare }: Omit<Props, 'product' | 'products'> & { product: FullProduct }) {
  const [quantity, setQuantity] = useState(1);
  const [variantId, setVariantId] = useState('');
  const { isFavorite, toggleWishlist } = useWishlist() as any;
  const wishlisted = isFavorite(product.id);
  useEffect(() => { setQuantity(1); setVariantId(''); }, [product.id]);
  const variant = product.variants?.find((item) => item.id === variantId);
  const selectedProduct: FullProduct = variant ? { ...product, variantId: variant.id, selectedVariant: variant.attributes, sku: variant.sku, price: variant.priceOverride ?? product.price, previousPrice: null, stock: variant.stock } : product;
  const outOfStock = selectedProduct.status === 'Agotado' || !selectedProduct.stock;
  const discount = selectedProduct.previousPrice && selectedProduct.previousPrice > selectedProduct.price ? Math.round((1 - selectedProduct.price / selectedProduct.previousPrice) * 100) : 0;
  const increment = () => setQuantity((value) => Math.min(selectedProduct.stock || 1, value + 1));
  return <section className={styles.info}>
    <div className={styles.eyebrow}><span>{product.status === 'Oferta' ? 'Oferta especial' : product.category}</span>{product.brand && <span>Marca: <b>{product.brand}</b></span>}</div>
    <h1>{product.name}</h1>
    <Rating product={product} />
    <div className={styles.priceRow}><strong>{money(selectedProduct.price)}</strong>{selectedProduct.previousPrice && <del>{money(selectedProduct.previousPrice)}</del>}{discount > 0 && <small>{discount}% OFF</small>}</div>
    {product.variants?.length ? <div className={styles.variantPicker}><b>Elige una variante</b><div>{product.variants.map((item) => { const selected = variantId === item.id; return <button key={item.id} type="button" aria-pressed={selected} title={selected ? 'Quitar selección de variante' : 'Seleccionar variante'} className={selected ? styles.variantSelected : ''} onClick={() => { setVariantId(selected ? '' : item.id); setQuantity(1); }}>{Object.values(item.attributes).join(' · ') || item.sku}<small>{selected ? 'Seleccionada · pulsa de nuevo para quitarla' : `${item.stock} disponibles`}</small></button>; })}</div></div> : null}
    <p className={`${styles.availability} ${outOfStock ? styles.unavailable : ''}`}>{outOfStock ? 'Agotado' : `Disponible · ${selectedProduct.stock} unidades`}</p>
    {(product.description || product.shortDescription) && <p className={styles.description}>{product.description || product.shortDescription}</p>}
    <div className={styles.purchase}>
      <div className={styles.quantity} aria-label="Seleccionar cantidad"><button type="button" aria-label="Reducir cantidad" disabled={quantity === 1} onClick={() => setQuantity((value) => Math.max(1, value - 1))}><Minus size={17} /></button><span>{quantity}</span><button type="button" aria-label="Aumentar cantidad" disabled={outOfStock || quantity >= (selectedProduct.stock || 1)} onClick={increment}><Plus size={17} /></button></div>
      <button className={styles.add} type="button" disabled={outOfStock} onClick={() => onAddToCart(selectedProduct, quantity)}><ShoppingCart size={19} />Agregar al carrito</button>
      <button className={`${styles.iconAction} ${wishlisted ? styles.activeAction : ''}`} type="button" aria-label="Agregar a favoritos" onClick={() => { toggleWishlist(product); onAddToWishlist(product); }}><Heart size={20} fill={wishlisted ? 'currentColor' : 'none'} /></button>
      <button className={styles.iconAction} type="button" aria-label="Comparar producto" onClick={() => onCompare(product)}><Sparkles size={19} /></button>
    </div>
    <dl className={styles.meta}><div><dt>Categoría</dt><dd>{product.category}</dd></div>{selectedProduct.sku && <div><dt>SKU</dt><dd>{selectedProduct.sku}</dd></div>}<div><dt>Marca</dt><dd>{product.brand}</dd></div><div><dt>Estado</dt><dd>{outOfStock ? 'Agotado' : 'En stock'}</dd></div></dl>
  </section>;
}

function ProductDetails({ product }: { product: FullProduct }) {
  const dimensions = [product.lengthCm, product.widthCm, product.heightCm].every((value) => value != null) ? `${product.lengthCm} × ${product.widthCm} × ${product.heightCm} cm` : null;
  const condition = product.condition === 'NEW' ? 'Nuevo' : product.condition === 'REFURBISHED' ? 'Reacondicionado' : product.condition === 'USED' ? 'Usado' : null;
  return <section className={styles.details}><h2>Detalles del producto</h2><p>{product.description || product.shortDescription || 'No hay información adicional disponible para este producto.'}</p><div><span>Marca <b>{product.brand}</b></span><span>Categoría <b>{product.category}</b></span>{product.sku && <span>SKU <b>{product.sku}</b></span>}{condition && <span>Condición <b>{condition}</b></span>}{product.warranty && <span>Garantía <b>{product.warranty}</b></span>}{product.tags?.length ? <span>Etiquetas <b>{product.tags.join(', ')}</b></span> : null}{product.weightGrams != null && <span>Peso <b>{product.weightGrams} g</b></span>}{dimensions && <span>Dimensiones <b>{dimensions}</b></span>}{Object.entries(product.specifications || {}).map(([key, value]) => <span key={key}>{key} <b>{value}</b></span>)}</div></section>;
}

export function ProductPage({ products, product, onAddToCart, onAddToWishlist, onCompare, onQuickView }: Props) {
  useEffect(() => {
    if (!product) return undefined;
    const previousTitle = document.title;
    const description = document.querySelector('meta[name="description"]');
    const previousDescription = description?.getAttribute('content');
    document.title = product.seoTitle || product.name;
    if (description) description.setAttribute('content', product.seoDescription || product.shortDescription || product.description || '');
    return () => { document.title = previousTitle; if (description && previousDescription != null) description.setAttribute('content', previousDescription); };
  }, [product]);
  if (!product) return <main className={styles.notFound}><h1>Producto no encontrado</h1><p>El producto que buscas no está disponible o fue eliminado.</p><a href="/tienda">Volver a la tienda</a></main>;
  const browseCategory = (category: string) => { navigate('/tienda?categoria=' + encodeURIComponent(category)); };
  return <main className={styles.page}><nav className={styles.breadcrumb} aria-label="Migas de pan"><a href="/"><Home size={16} />Inicio</a><ChevronRight size={15} /><a href="/tienda">Tienda</a><ChevronRight size={15} /><span>{product.category}</span><ChevronRight size={15} /><b>{product.name}</b></nav><div className={styles.productLayout}><StoreSidebar products={products} onCategorySelect={browseCategory} onProductClick={(recentProduct) => { navigate('/producto/' + recentProduct.slug); }} /><div className={styles.productArea}><div className={styles.content}><ProductGallery product={product} /><ProductInformation product={product} onAddToCart={onAddToCart} onAddToWishlist={onAddToWishlist} onCompare={onCompare} /></div><ProductDetails product={product} /><RelatedProducts products={products} currentProduct={product} onProductClick={(relatedProduct) => { navigate('/producto/' + relatedProduct.slug); }} onAddToCart={(relatedProduct) => onAddToCart(relatedProduct, 1)} onAddToWishlist={onAddToWishlist} onCompare={onCompare} onQuickView={onQuickView ?? (() => {})} /></div></div></main>;
}
