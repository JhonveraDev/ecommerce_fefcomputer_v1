import { ArrowRight } from 'lucide-react';
import solarImage from '../../assets/promos/promo-solar-background.png';
import styles from './StoreSidebar.module.css';
export function PromotionalBanner() { return <a className={styles.promo} href="#ofertas"><img src={solarImage} alt=""/><span>Soluciones eficientes</span><strong>Hasta 17%<br/>en energía<br/><em>solar</em></strong><small>Ver ofertas <ArrowRight size={14}/></small></a>; }
