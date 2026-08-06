import type { CSSProperties, ReactNode } from 'react';

export interface PromoBannerItem {
  id: string;
  title: string;
  ctaLabel: string;
  image: string;
  href?: string;
  backgroundColor?: string;
  textColor?: string;
  ctaColor?: string;
  imageAlt: string;
}

export interface PromoBannersProps {
  items: PromoBannerItem[];
  onBannerClick?: (banner: PromoBannerItem) => void;
  className?: string;
  renderCtaIcon?: () => ReactNode;
}

export interface PromoBannerCardProps {
  banner: PromoBannerItem;
  onClick?: (banner: PromoBannerItem) => void;
  style?: CSSProperties;
  ctaIcon?: ReactNode;
}
