import { ArrowLeft, ArrowRight, ShoppingCart, Star } from 'lucide-react';
import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import styles from './DealsCarousel.module.css';

type Product = { id:string; slug:string; name:string; brand:string; price:number; previousPrice:number|null; image:string; stock:number; rating:number; reviewCount:number };
type Props = { products:Product[]; bannerImage:string; bannerTitle:string; bannerCtaLabel:string; onProductClick?:(p:Product)=>void; onAddToCart?:(p:Product)=>void };
const money=(value:number)=>new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',maximumFractionDigits:0}).format(value);

function Card({product,onProductClick,onAddToCart}:{product:Product;onProductClick?:Props['onProductClick'];onAddToCart?:Props['onAddToCart']}) {
  const discount=product.previousPrice?Math.round((1-product.price/product.previousPrice)*100):0;
  return <article className={styles.card}>{discount?<span className={styles.discount}>-{discount}%</span>:null}<button className={styles.product} type="button" onClick={()=>onProductClick?.(product)}><img src={product.image} alt=""/><p>{product.brand}</p><h3>{product.name}</h3><span className={styles.rating}>{Array.from({length:5},(_,i)=><Star key={i} size={13} fill={i<Math.round(product.rating)?'currentColor':'none'}/>)}<small>({product.reviewCount})</small></span><div className={styles.prices}><b>{money(product.price)}</b>{product.previousPrice?<del>{money(product.previousPrice)}</del>:null}</div></button><div className={styles.stock}><span><i style={{width:'72%'}}/></span><p>Disponibles: {product.stock}</p></div><button className={styles.add} type="button" onClick={()=>onAddToCart?.(product)}><ShoppingCart size={17}/>Agregar al carrito</button></article>;
}

export function DealsCarousel({products,bannerImage,bannerTitle,bannerCtaLabel,onProductClick,onAddToCart}:Props) {
  const [tab,setTab]=useState('featured'); const [start,setStart]=useState(0); const [paused,setPaused]=useState(false);
  const deals=useMemo(()=>products.filter(p=>p.previousPrice&&p.previousPrice>p.price).sort((a,b)=>tab==='popular'?b.reviewCount-a.reviewCount:tab==='new'?b.id.localeCompare(a.id):b.rating-a.rating),[products,tab]);
  const visible=4; const maxStart=Math.max(0,deals.length-visible);
  const move=(direction:'next'|'previous')=>setStart(value=>direction==='next'?(value>=maxStart?0:value+1):Math.max(0,value-1));
  useEffect(()=>{ if(paused||!maxStart)return; const timer=window.setInterval(()=>move('next'),6500); return()=>window.clearInterval(timer); },[paused,maxStart]);
  const choose=(id:string)=>{setTab(id);setStart(0)};
  return <section className={styles.section} aria-label="Ofertas del día"><header><h2>Ofertas del día</h2><nav aria-label="Ordenar ofertas">{[['featured','Destacados'],['popular','Populares'],['new','Recién agregados']].map(([id,label])=><button key={id} className={tab===id?styles.active:''} onClick={()=>choose(id)}>{label}</button>)}</nav></header><div className={styles.layout}><aside className={styles.banner}><img src={bannerImage} alt=""/><div><h3>{bannerTitle}</h3><a href="#ofertas">{bannerCtaLabel}<ArrowRight size={15}/></a></div></aside><div className={styles.viewport} onMouseEnter={()=>setPaused(true)} onMouseLeave={()=>setPaused(false)}><div className={styles.trackViewport}><div className={styles.products} style={{'--deal-index':start} as CSSProperties}>{deals.map(p=><Card key={p.id} product={p} onProductClick={onProductClick} onAddToCart={onAddToCart}/>)}</div></div><button className={`${styles.arrow} ${styles.prev}`} aria-label="Ver ofertas anteriores" disabled={!start} onClick={()=>move('previous')}><ArrowLeft size={20}/></button><button className={`${styles.arrow} ${styles.next}`} aria-label="Ver más ofertas" onClick={()=>move('next')}><ArrowRight size={20}/></button></div></div></section>;
}
