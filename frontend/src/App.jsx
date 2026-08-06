import React from 'react';
import { Header } from './components/Header/Header.jsx';
import { Hero } from './components/Hero/Hero.jsx';
import { FeaturedCategories } from './components/FeaturedCategories';
import { PromoBanners } from './components/PromoBanners';
import { NewsletterOffer } from './components/NewsletterOffer';
import { Footer } from './components/Footer';
import { featuredCategoryItems } from './data/featuredCategories.tsx';
import { homePromoBanners } from './data/promoBanners';
import { newsletterOffer } from './data/newsletterOffer';
import { footerData } from './data/footer';

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
      <NewsletterOffer
        {...newsletterOffer}
        onSubmit={(email) => console.info('Suscripción solicitada:', email)}
      />
      <Footer {...footerData} />
    </>
  );
}
