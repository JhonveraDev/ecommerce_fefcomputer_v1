import { ArrowRight, ShoppingCart, Star, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import styles from './WelcomeOffer.module.css';

const STORAGE_KEY = 'fefcomputer-welcome-offer-seen';
const money = (value) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value);

export function WelcomeOffer({ product, onAddToCart, onViewProduct }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const closeButton = useRef(null);
  const timer = useRef(null);

  useEffect(() => {
    if (!product || window.localStorage.getItem(STORAGE_KEY)) return;
    setIsOpen(true);
  }, [product]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButton.current?.focus();
    const onKeyDown = (event) => { if (event.key === 'Escape') close(); };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
      window.clearTimeout(timer.current);
    };
  }, [isOpen]);

  if (!isOpen || !product) return null;
  const discount = product.previousPrice ? Math.round((1 - product.price / product.previousPrice) * 100) : 0;
  const close = () => {
    if (isClosing) return;
    window.localStorage.setItem(STORAGE_KEY, 'true');
    setIsClosing(true);
    timer.current = window.setTimeout(() => setIsOpen(false), 180);
  };
  const viewProduct = () => { close(); onViewProduct?.(product); };
  const addToCart = () => { onAddToCart?.(product, 1); close(); };

  return createPortal(
    <div className={`${styles.overlay} ${isClosing ? styles.closing : ''}`} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}>
      <section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="welcome-offer-title" aria-describedby="welcome-offer-description">
        <button ref={closeButton} className={styles.close} type="button" aria-label="Cerrar oferta" onClick={close}><X size={23} /></button>
        <div className={styles.content}>
          <p className={styles.eyebrow}>Oferta de bienvenida</p>
          <h2 id="welcome-offer-title">Tecnología que impulsa tus mejores ideas</h2>
          <p id="welcome-offer-description" className={styles.description}>Aprovecha este precio especial por tiempo limitado.</p>
          <p className={styles.category}>{product.category}</p>
          <h3>{product.name}</h3>
          <div className={styles.rating} aria-label={`${product.rating} de 5 estrellas`}>{Array.from({ length: 5 }, (_, index) => <Star key={index} size={15} fill={index < Math.round(product.rating) ? 'currentColor' : 'none'} />)}<span>({product.reviewCount} reseñas)</span></div>
          <div className={styles.prices}><strong>{money(product.price)}</strong>{product.previousPrice && <del>{money(product.previousPrice)}</del>}</div>
          {discount > 0 && <span className={styles.discount}>Ahorra {discount}%</span>}
          <div className={styles.actions}>
            <button className={styles.add} type="button" onClick={addToCart}><ShoppingCart size={18} />Agregar al carrito</button>
            <button className={styles.view} type="button" onClick={viewProduct}>Ver producto <ArrowRight size={17} /></button>
          </div>
        </div>
        <div className={styles.visual} aria-hidden="true">
          <span className={styles.offerBadge}>-{discount}%<small>OFERTA</small></span>
          <div className={styles.imageWrap}><img src={product.image} alt="" /></div>
          <span className={styles.glow} />
        </div>
      </section>
    </div>, document.body,
  );
}
