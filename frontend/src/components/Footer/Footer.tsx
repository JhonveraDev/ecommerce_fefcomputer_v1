import React from 'react';
import { ArrowUp, Headphones, MonitorSmartphone } from 'lucide-react';
import type { FooterProps } from './types';
import styles from './Footer.module.css';
import appStoreImage from '../../assets/footer/app-store.jpg';
import googlePlayImage from '../../assets/footer/google-play.jpg';
import paymentMethodsImage from '../../assets/footer/payment-method.png';

function Brand() {
  return <a className={styles.brand} href="#inicio" aria-label="FEFCOMPUTER, inicio"><span className={styles.brandMark} aria-hidden="true"><MonitorSmartphone size={29} strokeWidth={2.15} /></span><span><strong>FEF</strong><b>COMPUTER</b><small>TECNOLOGÍA Y CONFIANZA</small></span></a>;
}

export function Footer({ description, contacts, columns, downloadLabel, paymentLabel, phones, socials, copyright }: FooterProps) {
  return <footer className={styles.footer}><div className={styles.container}>
    <div className={styles.mainContent}>
      <section className={styles.about} aria-label="Información de FEFCOMPUTER"><Brand /><p>{description}</p><address className={styles.contacts}>{contacts.map(({ icon: Icon, label, value, href }) => { const content = <><Icon size={17} aria-hidden="true" /><span><b>{label}</b>{value}</span></>; return href ? <a key={label} href={href}>{content}</a> : <div key={label}>{content}</div>; })}</address></section>
      <div className={styles.linkColumns}>{columns.map((column) => <nav key={column.title} className={styles.column} aria-label={column.title}><h2>{column.title}</h2>{column.links.map((link) => <a key={link.label} href={link.href}>{link.label}</a>)}</nav>)}</div>
      <section className={styles.install} aria-label="Aplicación y pagos"><h2>Descarga nuestra app</h2><p>{downloadLabel}</p><div className={styles.storeBadges}><a href="#app" aria-label="Descargar en App Store"><img src={appStoreImage} alt="Descargar en App Store" /></a><a href="#app" aria-label="Descargar en Google Play"><img src={googlePlayImage} alt="Descargar en Google Play" /></a></div><p className={styles.paymentLabel}>{paymentLabel}</p><img className={styles.paymentMethods} src={paymentMethodsImage} alt="Métodos de pago aceptados" /></section>
    </div>
    <div className={styles.bottomBar}><p className={styles.copyright}>{copyright}<br />Todos los derechos reservados</p><div className={styles.phoneGroup} aria-label="Líneas de atención">{phones.map((phone) => <a key={phone.label} className={styles.phone} href={phone.href}><Headphones size={31} /><span><b>{phone.label}</b><small>{phone.detail}</small></span></a>)}</div><div className={styles.socialArea}><div className={styles.followRow}><b>Síguenos</b><span>{socials.map(({ label, href, icon: Icon }) => <a key={label} href={href} aria-label={label}><Icon size={16} /></a>)}</span></div><small>Recibe novedades y ofertas exclusivas</small></div><a className={styles.toTop} href="#inicio" aria-label="Volver al inicio"><ArrowUp size={23} /></a></div>
  </div></footer>;
}
