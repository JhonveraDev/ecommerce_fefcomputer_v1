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
import { WishlistPage } from './pages/WishlistPage';
import { ComparePage } from './pages/ComparePage';
import { ContactPage } from './pages/ContactPage';
import { AuthPage } from './pages/AuthPage';
import { AccountPage, AddressesPage, OrderDetailPage, OrdersPage } from './pages/AccountPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { WishlistProvider, useWishlist } from './context/WishlistContext';
import { CompareProvider, useCompare } from './context/CompareContext';
import { CartNotification } from './components/CartNotification/CartNotification';
import { WishlistNotification } from './components/WishlistNotification/WishlistNotification';
import { CompareNotification } from './components/CompareNotification/CompareNotification';
import { featuredCategoryItems } from './data/featuredCategories.tsx';
import { homePromoBanners } from './data/promoBanners';
import { newsletterOffer } from './data/newsletterOffer';
import { footerData } from './data/footer';
import { dailyDealsBanner, dailyDealProducts } from './data/dailyDeals';
import { featuredProducts } from './data/featuredProducts';
import { mockProducts } from './data/mockProducts';

function Storefront() {
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const { isAuthenticated, isLoading } = useAuth();
  const { itemCount, addItem } = useCart();
  const wishlist = useWishlist();
  const compareState = useCompare();
  const { wishlistCount } = wishlist;
  const getPage = (hash = window.location.hash) => hash.startsWith('#tienda') ? 'store' : hash.startsWith('#producto/') ? 'product' : hash === '#carrito' ? 'cart' : hash === '#favoritos' ? 'wishlist' : hash === '#comparar' ? 'compare' : hash === '#contacto' ? 'contact' : hash.startsWith('#login') ? 'login' : hash.startsWith('#registro') ? 'register' : hash.startsWith('#recuperar-password') ? 'forgot' : hash.startsWith('#restablecer-password') ? 'reset' : hash.startsWith('#mis-pedidos/') ? 'order-detail' : hash.startsWith('#mis-pedidos') ? 'orders' : hash === '#mis-direcciones' ? 'addresses' : hash === '#cuenta' ? 'account' : 'home';
  const [locationHash, setLocationHash] = useState(() => window.location.hash);
  const page = getPage(locationHash);
  useEffect(() => { const updateLocation = () => setLocationHash(window.location.hash); window.addEventListener('hashchange', updateLocation); return () => window.removeEventListener('hashchange', updateLocation); }, []);
  const openProduct = (product) => { window.location.hash = `producto/${product.slug}`; window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const selectedProduct = mockProducts.find((product) => product.slug === decodeURIComponent(locationHash.replace('#producto/', '')));
  const addToCart = (product, quantity = 1) => addItem(product, quantity);
  const addToWishlist = (product) => console.info('Favorito actualizado:', product.slug);
  const compare = (product) => compareState.toggleCompare(product);
  const sharedHeader = <Header cartCount={itemCount} wishlistCount={wishlistCount} compareCount={compareState.compareCount} />;
  const sharedQuickView = <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} onAddToCart={addToCart} onAddToWishlist={addToWishlist} onCompare={compare} />;

  if (!isLoading && !isAuthenticated && ['account', 'orders', 'addresses'].includes(page)) { window.location.hash = 'login'; return <>{sharedHeader}</>; }
  if (page === 'login') return <>{sharedHeader}<AuthPage mode="login" /><Footer {...footerData} /></>;
  if (page === 'register') return <>{sharedHeader}<AuthPage mode="register" /><Footer {...footerData} /></>;
  if (page === 'forgot') return <>{sharedHeader}<AuthPage mode="forgot" /><Footer {...footerData} /></>;
  if (page === 'reset') return <>{sharedHeader}<AuthPage mode="reset" /><Footer {...footerData} /></>;
  if (page === 'account') return <>{sharedHeader}<AccountPage /><Footer {...footerData} /></>;
  if (page === 'order-detail') return <>{sharedHeader}<OrderDetailPage /><Footer {...footerData} /></>;
  if (page === 'orders') return <>{sharedHeader}<OrdersPage /><Footer {...footerData} /></>;
  if (page === 'addresses') return <>{sharedHeader}<AddressesPage /><Footer {...footerData} /></>;
  if (page === 'cart') return <>{sharedHeader}<CartPage onProductClick={openProduct} /><Footer {...footerData} /></>;
  if (page === 'compare') return <>{sharedHeader}<ComparePage onProductClick={openProduct} onAddToCart={addToCart} /><Footer {...footerData} /></>;
  if (page === 'wishlist') return <>{sharedHeader}<WishlistPage onProductClick={openProduct} onAddToCart={addToCart} /><NewsletterOffer {...newsletterOffer} onSubmit={(email) => console.info('Suscripción solicitada:', email)} /><Footer {...footerData} /></>;
  if (page === 'contact') return <>{sharedHeader}<ContactPage /><Footer {...footerData} /></>;
  if (page === 'product') return <>{sharedHeader}<ProductPage product={selectedProduct} onAddToCart={addToCart} onAddToWishlist={addToWishlist} onCompare={compare} onQuickView={setQuickViewProduct} /><NewsletterOffer {...newsletterOffer} onSubmit={(email) => console.info('Suscripción solicitada:', email)} /><Footer {...footerData} />{sharedQuickView}</>;
  if (page === 'store') return <>{sharedHeader}<StorePage locationHash={locationHash} onQuickView={setQuickViewProduct} onProductClick={openProduct} onAddToCart={addToCart} /><NewsletterOffer {...newsletterOffer} onSubmit={(email) => console.info('Suscripción solicitada:', email)} /><Footer {...footerData} />{sharedQuickView}</>;

  return <>{sharedHeader}<Hero /><FeaturedCategories title="Categorías destacadas" items={featuredCategoryItems} visibleItems={8} tabs={featuredCategoryItems.slice(0, 4).map((category, index) => ({ id: category.id, label: category.name, active: index === 0 }))} onCategoryClick={(category) => console.info('Categoría seleccionada:', category.id)} /><PromoBanners items={homePromoBanners} onBannerClick={(banner) => console.info('Promoción seleccionada:', banner.id)} /><FeaturedProducts products={featuredProducts} onProductClick={openProduct} onAddToCart={addToCart} onAddToWishlist={addToWishlist} onCompare={compare} onQuickView={setQuickViewProduct} /><DealsCarousel products={dailyDealProducts} bannerImage={dailyDealsBanner.image} bannerTitle={dailyDealsBanner.title} bannerCtaLabel={dailyDealsBanner.ctaLabel} onProductClick={openProduct} onAddToCart={addToCart} onAddToWishlist={addToWishlist} onCompare={compare} onQuickView={setQuickViewProduct} /><TimedDeals products={dailyDealProducts} onProductClick={openProduct} onAddToCart={addToCart} /><NewsletterOffer {...newsletterOffer} onSubmit={(email) => console.info('Suscripción solicitada:', email)} /><Footer {...footerData} />{sharedQuickView}</>;
}

export default function App() { return <AuthProvider><CartProvider><WishlistProvider><CompareProvider><Storefront /><CartNotification /><WishlistNotification /><CompareNotification /></CompareProvider></WishlistProvider></CartProvider></AuthProvider>; }
