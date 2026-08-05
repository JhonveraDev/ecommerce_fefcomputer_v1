import type { CSSProperties, ReactNode } from 'react';

export interface FeaturedCategory {
  id: string;
  name: string;
  productCount: number;
  image?: string;
  icon?: ReactNode;
  backgroundColor?: string;
  iconColor?: string;
  href?: string;
}

export interface FeaturedCategoryTab {
  id: string;
  label: string;
  active?: boolean;
}

export interface FeaturedCategoriesProps {
  items: FeaturedCategory[];
  title: string;
  tabs?: FeaturedCategoryTab[];
  visibleItems?: number;
  accentColor?: string;
  onCategoryClick?: (category: FeaturedCategory) => void;
  onTabClick?: (tab: FeaturedCategoryTab) => void;
  className?: string;
}

export interface CategoryCardProps {
  category: FeaturedCategory;
  onClick?: (category: FeaturedCategory) => void;
  style?: CSSProperties;
}
