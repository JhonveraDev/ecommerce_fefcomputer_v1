import { ChevronRight, Home } from 'lucide-react';
import styles from './StoreBanner.module.css';
type Props = { title: string; items: string[] };
export function StoreBanner({ title, items }: Props) { return <section className={styles.banner}><h1>{title}</h1><nav aria-label="Migas de pan">{items.map((item, index) => <span key={item}>{index === 0 ? <Home size={15} /> : null}{item}{index < items.length - 1 && <ChevronRight size={14} />}</span>)}</nav></section>; }
