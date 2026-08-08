import React, { useEffect, useState } from 'react';
import { Header } from './components/Header/Header.jsx';
import { Hero } from './components/Hero/Hero.jsx';
import { FeaturedCategories } from './components/FeaturedCategories';
import { PromoBanners } from './components/PromoBanners';
import { NewsletterOffer } from './components/NewsletterOffer';
import { Footer } from './components/Footer';
import { DealsCarousel } from './components/DealsCarousel';
import { FeaturedProducts } from './components/FeaturedProducts';
import { QuickViewModal } from './components/QuickViewModal';
import { TimedDeals } from './components/TimedDeals';
import { StorePage } from './pages/StorePage';
import { featuredCategoryItems } from './data/featuredCategories.tsx';
import { homePromoBanners } from './data/promoBanners';
import { newsletterOffer } from './data/newsletterOffer';
import { footerData } from './data/footer';
import { dailyDealsBanner, dailyDealProducts } from './data/dailyDeals';
import { featuredProducts } from './data/featuredProducts';
import { mockProducts } from './data/mockProducts';
import { ProductPage } from './pages/ProductPage';

export default function App() {
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const getPage = () => window.location.hash === '#tienda' ? 'store' : window.location.hash.startsWith('#producto/') ? 'product' : 'home';
  const [page, setPage] = useState(getPage);
  useEffect(() => { const updatePage = () => setPage(getPage()); window.addEventListener('hashchange', updatePage); return () => window.removeEventListener('hashchange', updatePage); }, []);
  const openProduct = (product) => { window.location.hash = `producto/${product.slug}`; window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const selectedProduct = mockProducts.find((product) => product.slug === decodeURIComponent(window.location.hash.replace('#producto/', '')));
  const addToCart = (product, quantity = 1) => console.info('Producto agregado:', product.slug, 'cantidad:', quantity);
  const addToWishlist = (product) => console.info('TODO: agregar a favoritos:', product.slug);
  const compare = (product) => console.info('TODO: comparar producto:', product.slug);

  if (page === 'product') return <><Header /><ProductPage product={selectedProduct} onAddToCart={addToCart} onAddToWishlist={addToWishlist} onCompare={compare} /><NewsletterOffer {...newsletterOffer} onSubmit={(email) => console.info('Suscripción solicitada:', email)} /><Footer {...footerData} /></>;

  if (page === 'store') return <><Header /><StorePage onQuickView={setQuickViewProduct} onProductClick={openProduct} /><NewsletterOffer {...newsletterOffer} onSubmit={(email) => console.info('Suscripción solicitada:', email)} /><Footer {...footerData} /><QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} onAddToCart={addToCart} onAddToWishlist={addToWishlist} onCompare={compare} /></>;

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
      <FeaturedProducts
        products={featuredProducts}
        onProductClick={openProduct}
        onAddToCart={addToCart}
        onAddToWishlist={addToWishlist}
        onCompare={compare}
        onQuickView={setQuickViewProduct}
      />
      <DealsCarousel
        products={dailyDealProducts}
        bannerImage={dailyDealsBanner.image}
        bannerTitle={dailyDealsBanner.title}
        bannerCtaLabel={dailyDealsBanner.ctaLabel}
        onProductClick={openProduct}
        onAddToCart={addToCart}
        onAddToWishlist={addToWishlist}
        onCompare={compare}
        onQuickView={setQuickViewProduct}
      />
      <TimedDeals
        products={dailyDealProducts}
        onProductClick={openProduct}
        onAddToCart={addToCart}
      />
      <NewsletterOffer
        {...newsletterOffer}
        onSubmit={(email) => console.info('Suscripción solicitada:', email)}
      />
      <Footer {...footerData} />
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={addToCart}
        onAddToWishlist={addToWishlist}
        onCompare={compare}
      />
    </>
  );
}
