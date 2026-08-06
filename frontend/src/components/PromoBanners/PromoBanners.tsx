import { ArrowRight } from 'lucide-react';
import type { CSSProperties } from 'react';
import { PromoBannerCard } from './PromoBannerCard';
import type { PromoBannersProps } from './types';
import styles from './PromoBanners.module.css';

export function PromoBanners({ items, onBannerClick, className = '', renderCtaIcon }: PromoBannersProps) {
  return (
    <section className={`${styles.section} ${className}`} aria-label="Promociones destacadas">
      <div className={styles.grid}>
        {items.map((banner) => (
          <PromoBannerCard key={banner.id} banner={banner} onClick={onBannerClick}
            ctaIcon={renderCtaIcon?.() ?? <ArrowRight size={15} aria-hidden="true" />}
            style={{ '--promo-background': banner.backgroundColor, '--promo-text': banner.textColor, '--promo-cta': banner.ctaColor } as CSSProperties}
          />
        ))}
      </div>
    </section>
  );
}
