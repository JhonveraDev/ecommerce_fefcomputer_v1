import React from 'react';
import { Header } from './components/Header/Header.jsx';
import { Hero } from './components/Hero/Hero.jsx';
import { FeaturedCategories } from './components/FeaturedCategories';
import { PromoBanners } from './components/PromoBanners';
import { NewsletterOffer } from './components/NewsletterOffer';
import { Footer } from './components/Footer';
import { DealsCarousel } from './components/DealsCarousel';
import { featuredCategoryItems } from './data/featuredCategories.tsx';
import { homePromoBanners } from './data/promoBanners';
import { newsletterOffer } from './data/newsletterOffer';
import { footerData } from './data/footer';
import { dailyDealsBanner, dailyDealProducts } from './data/dailyDeals';

export default function App() {
  return (
    <>
      <Header />
      <Hero />
      <FeaturedCategories
        title="Categorías destacadas"
        items={featuredCategoryItems}
        visibleItems={8}
        tabs={featuredCategoryItems.slice(0, 4).map((category, index) => ({ id: category.id, label: category.name, active: index === 0 }))}
        onCategoryClick={(category) => console.info('Categoría seleccionada:', category.id)}
      />
      <PromoBanners
        items={homePromoBanners}
        onBannerClick={(banner) => console.info('Promoción seleccionada:', banner.id)}
      />
      <DealsCarousel
        products={dailyDealProducts}
        bannerImage={dailyDealsBanner.image}
        bannerTitle={dailyDealsBanner.title}
        bannerCtaLabel={dailyDealsBanner.ctaLabel}
        onProductClick={(product) => console.info('Producto seleccionado:', product.slug)}
        onAddToCart={(product) => console.info('Producto agregado:', product.slug)}
      />
      <NewsletterOffer
        {...newsletterOffer}
        onSubmit={(email) => console.info('Suscripción solicitada:', email)}
      />
      <Footer {...footerData} />
    </>
  );
}
