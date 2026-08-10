import { AlertTriangle, ArrowRight, BadgeCheck, Clock3, FileText, Headphones, Scale, ShieldCheck } from 'lucide-react';
import { StoreBanner } from '../components/StoreBanner';
import styles from './TermsPage.module.css';

const sections = [
  { id: 'aceptacion', title: 'Aceptacion de los terminos', text: 'Al navegar, crear una cuenta o realizar una compra en FEFCOMPUTER, aceptas estas condiciones generales. Te recomendamos revisarlas antes de usar nuestros servicios.', points: ['Debes proporcionar informacion veraz y actualizada.', 'El uso del sitio debe realizarse de forma legal y respetuosa.'] },
  { id: 'productos', title: 'Productos, precios y disponibilidad', text: 'Las imagenes, caracteristicas, precios e inventario se presentan como referencia y pueden cambiar sin previo aviso. Confirmamos la disponibilidad de cada articulo durante el proceso de compra.', points: ['Los precios se muestran en pesos colombianos (COP).', 'Las promociones aplican durante su vigencia y segun existencias.'] },
  { id: 'pedidos', title: 'Pedidos, pagos y validaciones', text: 'Un pedido se procesa despues de validar el pago, la informacion de contacto y la disponibilidad del producto. Podremos comunicarnos contigo si necesitamos confirmar algun dato.', points: ['La confirmacion de compra sera enviada al correo registrado.', 'Los pagos se gestionan mediante medios de pago autorizados.'] },
  { id: 'envios', title: 'Envios, entregas y recepcion', text: 'Los tiempos de entrega dependen de la ciudad, el producto y el operador logistico. Es importante revisar el pedido al recibirlo e informarnos cualquier novedad oportunamente.', points: ['La cobertura y costos se informan antes de finalizar la compra.', 'El titular o una persona autorizada debe recibir el pedido.'] },
  { id: 'garantias', title: 'Garantias y soporte', text: 'Los productos cuentan con las garantias aplicables segun el fabricante y la normativa vigente. Conserva la factura o comprobante de compra para solicitar soporte.', points: ['El diagnostico tecnico determina la aplicacion de la garantia.', 'Nuestro equipo te acompanara en el proceso de soporte.'] },
  { id: 'actualizaciones', title: 'Actualizaciones del documento', text: 'Podemos modificar estas condiciones cuando actualicemos nuestros servicios, procesos o requisitos legales. La version vigente siempre estara disponible en esta pagina.', points: ['Publicaremos la fecha de actualizacion en la version final.', 'Los cambios entraran en vigor desde su publicacion.'] },
];

export function TermsPage() {
  return <main className={styles.page}>
    <StoreBanner title="Terminos y condiciones" items={['Inicio', 'Terminos y condiciones']} />
    <section className={styles.hero} aria-labelledby="terms-heading">
      <div className={styles.heroCopy}><span className={styles.eyebrow}><Scale size={15} /> Documentacion legal</span><h1 id="terms-heading">Terminos y condiciones</h1><p>Condiciones generales para navegar y comprar de forma segura en FEFCOMPUTER.</p><div className={styles.metadata}><span><Clock3 size={16} /> Version provisional</span><span><BadgeCheck size={16} /> Informacion de referencia</span></div></div>
      <div className={styles.heroSeal} aria-hidden="true"><ShieldCheck size={56} /><span>FEF<br />COMPUTER</span></div>
    </section>
    <section className={styles.notice} aria-label="Aviso sobre contenido provisional"><AlertTriangle size={22} /><div><strong>Documento en construccion</strong><p>El contenido de esta pagina es un ejemplo de estructura. Sera reemplazado por los terminos y condiciones oficiales cuando esten disponibles.</p></div></section>
    <section className={styles.layout}>
      <aside className={styles.toc} aria-label="Contenido del documento"><div className={styles.tocHeader}><FileText size={19} /><div><span>En esta pagina</span><b>Contenido</b></div></div><nav>{sections.map(({ id, title }, index) => <a href={`#${id}`} key={id}><small>{String(index + 1).padStart(2, '0')}</small><span>{title}</span></a>)}</nav></aside>
      <article className={styles.document}><header className={styles.documentHeader}><span><FileText size={23} /></span><div><p>FEFCOMPUTER</p><h2>Condiciones generales de uso y compra</h2></div></header><div className={styles.documentBody}>{sections.map(({ id, title, text, points }, index) => <section id={id} key={id}><span className={styles.sectionNumber}>{String(index + 1).padStart(2, '0')}</span><div><h3>{title}</h3><p>{text}</p><ul>{points.map((point) => <li key={point}>{point}</li>)}</ul></div></section>)}</div></article>
      <aside className={styles.support}><Headphones size={27} /><span>Necesitas ayuda?</span><h2>Estamos aqui para orientarte.</h2><p>Contacta a nuestro equipo si tienes preguntas sobre una compra o estas condiciones.</p><a href="/contacto">Hablar con soporte <ArrowRight size={16} /></a></aside>
    </section>
  </main>;
}