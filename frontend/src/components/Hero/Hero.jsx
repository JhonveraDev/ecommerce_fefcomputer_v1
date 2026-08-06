import React, { useEffect, useState } from 'react';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import gamingImage from '../../assets/hero/hero-wide-gaming.png';
import securityNetworkImage from '../../assets/hero/hero-wide-security-network.png';
import solarDataImage from '../../assets/hero/hero-wide-solar-data.png';
import styles from './Hero.module.css';

const heroBackgrounds = [gamingImage, securityNetworkImage, solarDataImage];

export function Hero() {
  const [activeBackground, setActiveBackground] = useState(0);

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduceMotion.matches) return undefined;

    const intervalId = window.setInterval(() => {
      setActiveBackground((current) => (current + 1) % heroBackgrounds.length);
    }, 6000);

    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <main className={styles.hero}>
      <div className={styles.heroFrame}>
        {heroBackgrounds.map((background, index) => (
          <img
            key={background}
            className={`${styles.background} ${index === activeBackground ? styles.backgroundActive : ''}`}
            src={background}
            alt=""
            aria-hidden="true"
          />
        ))}
        <div className={styles.overlay} aria-hidden="true" />
        <section className={styles.content} aria-labelledby="hero-title">
          <p className={styles.eyebrow}><ShieldCheck size={18} /> Tecnología que sí responde</p>
          <h1 id="hero-title">Potencia tus ideas con la tecnología correcta.</h1>
          <p className={styles.description}>Equipos, conectividad y soluciones confiables para tu hogar, negocio o próximo gran proyecto.</p>
          <div className={styles.actions}>
            <a className={styles.primaryAction} href="#tienda">Explorar productos <ArrowRight size={18} /></a>
            <a className={styles.secondaryAction} href="#ofertas">Ver ofertas</a>
          </div>
        </section>
        <div className={styles.indicators} role="tablist" aria-label="Seleccionar imagen del banner principal">
          {heroBackgrounds.map((background, index) => (
            <button
              key={background}
              className={index === activeBackground ? styles.indicatorActive : ''}
              type="button"
              role="tab"
              aria-label={`Mostrar banner ${index + 1}`}
              aria-selected={index === activeBackground}
              onClick={() => setActiveBackground(index)}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
