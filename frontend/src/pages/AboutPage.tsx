import { ArrowRight, Award, Building2, Headphones, ShieldCheck, Truck, UsersRound } from 'lucide-react';
import { StoreBanner } from '../components/StoreBanner';
import techAdvisor from '../assets/about-tech-advisor.png';
import techCollaboration from '../assets/about-tech-collaboration.png';
import styles from './AboutPage.module.css';

const commitments = [
  { icon: Award, title: 'Experiencia que respalda', text: 'Asesoramos cada compra con conocimiento técnico y atención honesta.' },
  { icon: UsersRound, title: 'Cercanos a tu proyecto', text: 'Escuchamos tus necesidades para recomendar soluciones que sí funcionan.' },
  { icon: ShieldCheck, title: 'Compra con confianza', text: 'Productos seleccionados, respaldo y acompañamiento después de tu compra.' },
];
const services = [
  { icon: Award, title: 'Precios competitivos', text: 'Tecnología de calidad con opciones pensadas para cada presupuesto.' },
  { icon: Building2, title: 'Soluciones para empresas', text: 'Equipamos y acompañamos a negocios, oficinas e instituciones.' },
  { icon: Truck, title: 'Envíos seguros', text: 'Llevamos tus equipos y accesorios con cuidado hasta donde los necesites.' },
  { icon: Headphones, title: 'Soporte especializado', text: 'Un equipo preparado para resolver tus dudas antes y después de comprar.' },
];

export function AboutPage() {
  return <main className={styles.page}>
    <StoreBanner title="Nosotros" items={['Inicio', 'Nosotros']} />
    <section className={styles.introduction} aria-labelledby="about-heading">
      <div className={styles.imageComposition} aria-label="Asesoría tecnológica personalizada">
        <figure className={styles.secondaryPhoto}><img src={techCollaboration} alt="Asesoría de tecnología en un espacio de trabajo" /></figure>
        <figure className={styles.primaryPhoto}><img src={techAdvisor} alt="Especialista FEFComputer atendiendo a un cliente" /></figure>
      </div>
      <div className={styles.copy}>
        <span className={styles.eyebrow}>Tecnología con propósito</span>
        <h2 id="about-heading">Tu aliado para encontrar la tecnología que necesitas.</h2>
        <p>En FEFComputer creemos que la tecnología debe ser cercana, clara y útil. Por eso reunimos equipos, periféricos y soluciones confiables para acompañarte en cada proyecto.</p>
        <p>Trabajamos para que comprar tecnología sea una experiencia sencilla: te asesoramos, resolvemos tus dudas y te ayudamos a elegir con tranquilidad.</p>
        <a className={styles.cta} href="#tienda">Conoce nuestra tienda <ArrowRight size={17} /></a>
      </div>
    </section>
    <section className={styles.commitments} aria-label="Nuestra esencia">{commitments.map(({ icon: Icon, title, text }) => <article key={title}><span className={styles.commitmentIcon}><Icon size={28} /></span><h3>{title}</h3><p>{text}</p></article>)}</section>
    <section className={styles.stats} aria-label="FEFComputer en cifras"><div><strong>+6</strong><span>Años de experiencia</span></div><div><strong>+500</strong><span>Productos disponibles</span></div><div><strong>+1.000</strong><span>Clientes atendidos</span></div><div><strong>100%</strong><span>Compromiso contigo</span></div></section>
    <section className={styles.offer} aria-labelledby="offer-heading"><header><span className={styles.eyebrow}>Lo que nos diferencia</span><h2 id="offer-heading">Más que productos, soluciones para avanzar.</h2><p>Todo lo que necesitas para equipar tus ideas, estudiar, trabajar, crear o hacer crecer tu negocio.</p></header><div className={styles.serviceGrid}>{services.map(({ icon: Icon, title, text }) => <article key={title}><span><Icon size={31} /></span><h3>{title}</h3><p>{text}</p></article>)}</div></section>
  </main>;
}
