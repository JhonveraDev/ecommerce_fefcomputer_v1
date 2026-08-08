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
import { ProductPage } from './pages/ProductPage';
import { CartPage } from './pages/CartPage';
import { CartProvider, useCart } from './context/CartContext';
import { CartNotification } from './components/CartNotification/CartNotification';
import { featuredCategoryItems } from './data/featuredCategories.tsx';
import { homePromoBanners } from './data/promoBanners';
import { newsletterOffer } from './data/newsletterOffer';
import { footerData } from './data/footer';
import { dailyDealsBanner, dailyDealProducts } from './data/dailyDeals';
import { featuredProducts } from './data/featuredProducts';
import { mockProducts } from './data/mockProducts';

function Storefront() {
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const { itemCount, addItem } = useCart();
  const getPage = (hash = window.location.hash) => hash.startsWith('#tienda') ? 'store' : hash.startsWith('#producto/') ? 'product' : hash === '#carrito' ? 'cart' : 'home';
  const [locationHash, setLocationHash] = useState(() => window.location.hash);
  const page = getPage(locationHash);
  useEffect(() => { const updateLocation = () => setLocationHash(window.location.hash); window.addEventListener('hashchange', updateLocation); return () => window.removeEventListener('hashchange', updateLocation); }, []);
  const openProduct = (product) => { window.location.hash = `producto/${product.slug}`; window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const selectedProduct = mockProducts.find((product) => product.slug === decodeURIComponent(locationHash.replace('#producto/', '')));
  const addToCart = (product, quantity = 1) => addItem(product, quantity);
  const addToWishlist = (product) => console.info('TODO: agregar a favoritos:', product.slug);
  const compare = (product) => console.info('TODO: comparar producto:', product.slug);
  const sharedHeader = <Header cartCount={itemCount} />;
  const sharedQuickView = <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} onAddToCart={addToCart} onAddToWishlist={addToWishlist} onCompare={compare} />;

  if (page === 'cart') return <>{sharedHeader}<CartPage onProductClick={openProduct} /><Footer {...footerData} /></>;
  if (page === 'product') return <>{sharedHeader}<ProductPage product={selectedProduct} onAddToCart={addToCart} onAddToWishlist={addToWishlist} onCompare={compare} onQuickView={setQuickViewProduct} /><NewsletterOffer {...newsletterOffer} onSubmit={(email) => console.info('Suscripción solicitada:', email)} /><Footer {...footerData} />{sharedQuickView}</>;
  if (page === 'store') return <>{sharedHeader}<StorePage onQuickView={setQuickViewProduct} onProductClick={openProduct} onAddToCart={addToCart} /><NewsletterOffer {...newsletterOffer} onSubmit={(email) => console.info('Suscripción solicitada:', email)} /><Footer {...footerData} />{sharedQuickView}</>;

  return <>{sharedHeader}<Hero /><FeaturedCategories title="Categorías destacadas" items={featuredCategoryItems} visibleItems={8} tabs={featuredCategoryItems.slice(0, 4).map((category, index) => ({ id: category.id, label: category.name, active: index === 0 }))} onCategoryClick={(category) => console.info('Categoría seleccionada:', category.id)} /><PromoBanners items={homePromoBanners} onBannerClick={(banner) => console.info('Promoción seleccionada:', banner.id)} /><FeaturedProducts products={featuredProducts} onProductClick={openProduct} onAddToCart={addToCart} onAddToWishlist={addToWishlist} onCompare={compare} onQuickView={setQuickViewProduct} /><DealsCarousel products={dailyDealProducts} bannerImage={dailyDealsBanner.image} bannerTitle={dailyDealsBanner.title} bannerCtaLabel={dailyDealsBanner.ctaLabel} onProductClick={openProduct} onAddToCart={addToCart} onAddToWishlist={addToWishlist} onCompare={compare} onQuickView={setQuickViewProduct} /><TimedDeals products={dailyDealProducts} onProductClick={openProduct} onAddToCart={addToCart} /><NewsletterOffer {...newsletterOffer} onSubmit={(email) => console.info('Suscripción solicitada:', email)} /><Footer {...footerData} />{sharedQuickView}</>;
}

export default function App() { return <CartProvider><Storefront /><CartNotification /></CartProvider>; }