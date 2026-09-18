import { ChevronLeft, ChevronRight, Heart, Minus, Plus, ShoppingCart, X, ZoomIn, ZoomOut } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { createPortal } from 'react-dom';
import { useWishlist } from '../../context/WishlistContext';
import styles from './QuickViewModal.module.css';

type Product = {
  id: string; name: string; image: string; price: number; slug: string;
  previousPrice?: number | null; category?: string; brand?: string; stock?: number; status?: string; description?: string; shortDescription?: string; imageUrls?: string[];
};

type Props = {
  product: Product | null;
  onClose: () => void;
  onAddToCart?: (product: Product, quantity: number) => void;
  onAddToWishlist?: (product: Product) => void;
  onCompare?: (product: Product) => void;
};

const money = (value: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value);

export function QuickViewModal({ product, onClose, onAddToCart, onAddToWishlist, onCompare }: Props) {
  const [quantity, setQuantity] = useState(1);
  const { toggleWishlist } = useWishlist() as any;
  const [isClosing, setIsClosing] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState('50% 50%');
  const closeButton = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLElement>(null);
  const closeTimer = useRef<number>();
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    if (!product) return;
    closeButton.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { requestClose(); return; }
      if (event.key !== 'Tab') return;
      const focusable = modalRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled)');
      if (!focusable?.length) return;
      const first = focusable[0]; const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => { window.clearTimeout(closeTimer.current); window.removeEventListener('keydown', onKeyDown); };
  }, [product]);

  useEffect(() => { setQuantity(1); setIsClosing(false); setSelectedImage(0); setIsZoomed(false); setZoomOrigin('50% 50%'); }, [product?.id]);

  const images = useMemo(() => {
    if (!product) return [];
    const available = product.imageUrls?.filter(Boolean) ?? [];
    return available.length ? available : [product.image];
  }, [product]);

  if (!product) return null;
  const discount = product.previousPrice && product.previousPrice > product.price
    ? Math.round((1 - product.price / product.previousPrice) * 100) : 0;
  const isOutOfStock = product.status === 'Agotado' || product.stock === 0;
  const requestClose = () => {
    if (isClosing) return;
    setIsClosing(true);
    closeTimer.current = window.setTimeout(onClose, 180);
  };
  const hasMultipleImages = images.length > 1;
  const changeImage = (direction: -1 | 1) => {
    setSelectedImage((current) => (current + direction + images.length) % images.length);
    setIsZoomed(false);
    setZoomOrigin('50% 50%');
  };
  const selectImage = (index: number) => {
    setSelectedImage(index);
    setIsZoomed(false);
    setZoomOrigin('50% 50%');
  };
  const updateZoomOrigin = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!isZoomed) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = Math.min(100, Math.max(0, ((event.clientX - bounds.left) / bounds.width) * 100));
    const y = Math.min(100, Math.max(0, ((event.clientY - bounds.top) / bounds.height) * 100));
    setZoomOrigin(`${x}% ${y}%`);
  };

  return createPortal(
    <div className={`${styles.overlay} ${isClosing ? styles.closing : ''}`} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) requestClose(); }}>
      <section ref={modalRef} className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="quick-view-title">
        <button ref={closeButton} className={styles.close} type="button" aria-label="Cerrar vista rápida" onClick={requestClose}><X size={23} /></button>
        <div className={styles.gallery}>
          <div className={styles.mainImage} role="group" aria-label={`Imagen ${selectedImage + 1} de ${images.length} de ${product.name}`} onPointerMove={updateZoomOrigin} onPointerLeave={() => isZoomed && setZoomOrigin('50% 50%')} onPointerDown={(event) => { touchStartX.current = event.pointerType === 'touch' ? event.clientX : null; }} onPointerUp={(event) => { if (touchStartX.current === null) return; const distance = event.clientX - touchStartX.current; touchStartX.current = null; if (Math.abs(distance) > 40 && hasMultipleImages) changeImage(distance > 0 ? -1 : 1); }}>
            <img className={isZoomed ? styles.zoomed : ''} style={isZoomed ? { transformOrigin: zoomOrigin } : undefined} src={images[selectedImage]} alt={product.name} />
            {hasMultipleImages && <><button className={`${styles.imageNavigation} ${styles.previousImage}`} type="button" aria-label="Ver imagen anterior" onClick={() => changeImage(-1)}><ChevronLeft size={22} /></button><button className={`${styles.imageNavigation} ${styles.nextImage}`} type="button" aria-label="Ver imagen siguiente" onClick={() => changeImage(1)}><ChevronRight size={22} /></button></>}
            <button className={styles.zoomControl} type="button" aria-label={isZoomed ? 'Reducir zoom' : 'Ampliar imagen'} aria-pressed={isZoomed} onClick={() => { setIsZoomed((value) => !value); setZoomOrigin('50% 50%'); }}>{isZoomed ? <ZoomOut size={20} /> : <ZoomIn size={20} />}</button>
            <span className={styles.zoomHint}>{isZoomed ? 'Mueve el cursor para explorar' : 'Ampliar imagen'}</span>
          </div>
          <div className={styles.thumbnails} aria-label="Galería del producto">
            {images.map((image, index) => <button type="button" className={index === selectedImage ? styles.selected : ''} key={`${image}-${index}`} aria-label={`Ver imagen ${index + 1} de ${product.name}`} aria-current={index === selectedImage} onClick={() => selectImage(index)}><img src={image} alt="" /></button>)}
          </div>
        </div>
        <div className={styles.details}>
          {discount > 0 && <span className={styles.discount}>Oferta {discount}%</span>}
          <p className={styles.category}>{product.category ?? product.brand ?? 'Producto destacado'}</p>
          <h2 id="quick-view-title">{product.name}</h2>
          <div className={styles.prices}><strong>{money(product.price)}</strong>{product.previousPrice && <del>{money(product.previousPrice)}</del>}{discount > 0 && <small>{discount}% de descuento</small>}</div>
          <p className={`${styles.stock} ${isOutOfStock ? styles.outOfStock : ''}`}>{isOutOfStock ? 'Agotado' : `Disponible${product.stock ? `: ${product.stock} unidades` : ''}`}</p>
          <p className={styles.description}>{product.description ?? product.shortDescription ?? 'Información detallada de este producto disponible próximamente.'}</p>
          <div className={styles.purchase}>
            <div className={styles.quantity} aria-label="Cantidad"><button type="button" aria-label="Reducir cantidad" disabled={quantity === 1} onClick={() => setQuantity((value) => Math.max(1, value - 1))}><Minus size={16} /></button><span>{quantity}</span><button type="button" aria-label="Aumentar cantidad" onClick={() => setQuantity((value) => value + 1)}><Plus size={16} /></button></div>
            <button className={styles.add} type="button" disabled={isOutOfStock} onClick={() => onAddToCart?.(product, quantity)}><ShoppingCart size={18} />Agregar al carrito</button>
          </div>
          <div className={styles.secondary}><button type="button" onClick={() => { toggleWishlist(product); onAddToWishlist?.(product); }}><Heart size={17} />Favoritos</button><button type="button" onClick={() => onCompare?.(product)}>Comparar</button></div>
          <dl><div><dt>Marca</dt><dd>{product.brand ?? 'No especificada'}</dd></div><div><dt>Referencia</dt><dd>{product.slug}</dd></div></dl>
        </div>
      </section>
    </div>, document.body,
  );
}
