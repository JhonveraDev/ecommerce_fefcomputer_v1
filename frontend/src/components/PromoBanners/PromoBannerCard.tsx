import type { PromoBannerCardProps } from './types';
import styles from './PromoBannerCard.module.css';

export function PromoBannerCard({ banner, onClick, style, ctaIcon }: PromoBannerCardProps) {
  const content = (
    <>
      <div className={styles.copy}>
        <h3>{banner.title}</h3>
        <span className={styles.cta}>{banner.ctaLabel}{ctaIcon}</span>
      </div>
      <img className={styles.productImage} src={banner.image} alt={banner.imageAlt} />
    </>
  );

  if (banner.href && !onClick) return <a className={styles.card} style={style} href={banner.href}>{content}</a>;

  return <button className={styles.card} style={style} type="button" onClick={() => onClick?.(banner)}>{content}</button>;
}
