import { Eye, Heart, Minus, Plus, ShoppingCart, Star, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import styles from './QuickViewModal.module.css';

type Product = {
  id: string; name: string; image: string; price: number; slug: string;
  previousPrice?: number | null; category?: string; brand?: string; rating?: number;
  reviewCount?: number; stock?: number; status?: string; description?: string; shortDescription?: string;
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
  const [isClosing, setIsClosing] = useState(false);
  const closeButton = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLElement>(null);
  const closeTimer = useRef<number>();

  useEffect(() => {
    if (!product) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
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
    return () => { window.clearTimeout(closeTimer.current); document.body.style.overflow = previousOverflow; window.removeEventListener('keydown', onKeyDown); };
  }, [product]);

  useEffect(() => { setQuantity(1); setIsClosing(false); }, [product?.id]);

  if (!product) return null;
  const discount = product.previousPrice && product.previousPrice > product.price
    ? Math.round((1 - product.price / product.previousPrice) * 100) : 0;
  const isOutOfStock = product.status === 'Agotado' || product.stock === 0;
  const requestClose = () => {
    if (isClosing) return;
    setIsClosing(true);
    closeTimer.current = window.setTimeout(onClose, 180);
  };
  const images = Array.from({ length: 4 }, () => product.image);

  return createPortal(
    <div className={`${styles.overlay} ${isClosing ? styles.closing : ''}`} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) requestClose(); }}>
      <section ref={modalRef} className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="quick-view-title">
        <button ref={closeButton} className={styles.close} type="button" aria-label="Cerrar vista rápida" onClick={requestClose}><X size={23} /></button>
        <div className={styles.gallery}>
          <div className={styles.mainImage}><img src={product.image} alt={product.name} /><Eye size={21} aria-hidden="true" /></div>
          <div className={styles.thumbnails} aria-label="Galería del producto">
            {images.map((image, index) => <button type="button" className={index === 0 ? styles.selected : ''} key={index} aria-label={`Ver imagen ${index + 1} de ${product.name}`}><img src={image} alt="" /></button>)}
          </div>
        </div>
        <div className={styles.details}>
          {discount > 0 && <span className={styles.discount}>Oferta {discount}%</span>}
          <p className={styles.category}>{product.category ?? product.brand ?? 'Producto destacado'}</p>
          <h2 id="quick-view-title">{product.name}</h2>
          <div className={styles.rating} aria-label={`${product.rating ?? 0} de 5 estrellas`}>{Array.from({ length: 5 }, (_, index) => <Star key={index} size={15} fill={index < Math.round(product.rating ?? 0) ? 'currentColor' : 'none'} />)}<span>({product.reviewCount ?? 0} reseñas)</span></div>
          <div className={styles.prices}><strong>{money(product.price)}</strong>{product.previousPrice && <del>{money(product.previousPrice)}</del>}{discount > 0 && <small>{discount}% de descuento</small>}</div>
          <p className={`${styles.stock} ${isOutOfStock ? styles.outOfStock : ''}`}>{isOutOfStock ? 'Agotado' : `Disponible${product.stock ? `: ${product.stock} unidades` : ''}`}</p>
          <p className={styles.description}>{product.description ?? product.shortDescription ?? 'Información detallada de este producto disponible próximamente.'}</p>
          <div className={styles.purchase}>
            <div className={styles.quantity} aria-label="Cantidad"><button type="button" aria-label="Reducir cantidad" disabled={quantity === 1} onClick={() => setQuantity((value) => Math.max(1, value - 1))}><Minus size={16} /></button><span>{quantity}</span><button type="button" aria-label="Aumentar cantidad" onClick={() => setQuantity((value) => value + 1)}><Plus size={16} /></button></div>
            <button className={styles.add} type="button" disabled={isOutOfStock} onClick={() => onAddToCart?.(product, quantity)}><ShoppingCart size={18} />Agregar al carrito</button>
          </div>
          <div className={styles.secondary}><button type="button" onClick={() => onAddToWishlist?.(product)}><Heart size={17} />Favoritos</button><button type="button" onClick={() => onCompare?.(product)}>Comparar</button></div>
          <dl><div><dt>Marca</dt><dd>{product.brand ?? 'No especificada'}</dd></div><div><dt>Referencia</dt><dd>{product.slug}</dd></div></dl>
        </div>
      </section>
    </div>, document.body,
  );
}
