import { ChevronRight, ShoppingCart, Star } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import gamingBackground from '../../assets/promos/promo-gaming-background.png';
import securityBackground from '../../assets/promos/promo-cctv-background.png';
import solarBackground from '../../assets/promos/promo-solar-background.png';
import styles from './TimedDeals.module.css';

type Product = { id: string; slug: string; name: string; brand: string; price: number; previousPrice: number | null; rating: number; reviewCount: number };
type Props = { products: Product[]; onProductClick?: (product: Product) => void; onAddToCart?: (product: Product) => void };
const backgrounds = [gamingBackground, solarBackground, securityBackground, gamingBackground];
const money = (value: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value);

function Countdown() {
  const target = useMemo(() => Date.now() + 1000 * 60 * 60 * 12, []);
  const [left, setLeft] = useState(() => Math.max(0, target - Date.now()));
  useEffect(() => { const timer = window.setInterval(() => setLeft(Math.max(0, target - Date.now())), 1000); return () => window.clearInterval(timer); }, [target]);
  const total = Math.floor(left / 1000);
  const values = [Math.floor(total / 86400), Math.floor(total / 3600) % 24, Math.floor(total / 60) % 60, total % 60];
  return <div className={styles.countdown} aria-label="Tiempo restante de la oferta">{['Días', 'Horas', 'Min', 'Seg'].map((label, index) => <span key={label}><b>{String(values[index]).padStart(2, '0')}</b><small>{label}</small></span>)}</div>;
}

export function TimedDeals({ products, onProductClick, onAddToCart }: Props) {
  const deals = products.filter((product) => product.previousPrice && product.previousPrice > product.price).slice(0, 4);
  return <section className={styles.section} aria-labelledby="timed-deals-title"><header><h2 id="timed-deals-title">Ofertas por tiempo limitado</h2><a href="#ofertas">Ver todas <ChevronRight size={16} /></a></header><div className={styles.grid}>{deals.map((product, index) => <article className={styles.card} key={product.id}><div className={styles.visual} style={{ backgroundImage: `url(${backgrounds[index]})` }}><Countdown /></div><div className={styles.content}><button className={styles.title} type="button" onClick={() => onProductClick?.(product)}><h3>{product.name}</h3></button><div className={styles.rating}>{Array.from({ length: 5 }, (_, star) => <Star key={star} size={13} fill={star < Math.round(product.rating) ? 'currentColor' : 'none'} />)}<small>({product.reviewCount})</small></div><p>Por <span>{product.brand}</span></p><div className={styles.footer}><div><strong>{money(product.price)}</strong><del>{money(product.previousPrice!)}</del></div><button className={styles.add} type="button" onClick={() => onAddToCart?.(product)}><ShoppingCart size={16} />Agregar</button></div></div></article>)}</div></section>;
}
