import React, { useEffect, useRef, useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  CircleUserRound,
  Flame,
  Grid2X2,
  Headphones,
  Heart,
  MapPin,
  Menu,
  MonitorSmartphone,
  Search,
  ShoppingCart,
  Sparkles,
  X,
} from 'lucide-react';
import styles from './Header.module.css';
import { MiniCart } from '../MiniCart/MiniCart';

const navigationItems = [
  { label: 'Ofertas', icon: Flame, accent: true },
  { label: 'Inicio', dropdown: true, active: true },
  { label: 'Nosotros' },
  { label: 'Tienda', dropdown: true },
  { label: 'Marcas', dropdown: true },
  { label: 'Tecnología', dropdown: true },
  { label: 'Blog', dropdown: true },
  { label: 'Páginas', dropdown: true },
  { label: 'Contacto' },
];

const actionItems = [
  { label: 'Comparar', value: 3, icon: Sparkles },
  { label: 'Favoritos', value: 6, icon: Heart },
  { label: 'Carrito', value: 2, icon: ShoppingCart },
  { label: 'Cuenta', icon: CircleUserRound },
];

function Brand() {
  return (
    <a className={styles.brand} href="#inicio" aria-label="FEFCOMPUTER, inicio">
      <span className={styles.brandMark} aria-hidden="true">
        <MonitorSmartphone size={31} strokeWidth={2.2} />
      </span>
      <span>
        <strong>FEF</strong><b>COMPUTER</b>
        <small>TECNOLOGÍA Y CONFIANZA</small>
      </span>
    </a>
  );
}

function HeaderAction({ icon: Icon, label, value, onClick }) {
  return (
    <button className={styles.headerAction} type="button" aria-label={label} onClick={onClick}>
      <span className={styles.actionIcon}>
        <Icon size={27} strokeWidth={1.8} />
        {value ? <span className={styles.counter}>{value}</span> : null}
      </span>
      <span>{label}</span>
    </button>
  );
}

function CartHeaderAction({ value, open, setOpen }) {
  const closeTimer = useRef();
  const keepOpen = () => { window.clearTimeout(closeTimer.current); setOpen(true); };
  const scheduleClose = () => { closeTimer.current = window.setTimeout(() => setOpen(false), 380); };
  const openCart = () => { window.location.hash = 'carrito'; window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' })); setOpen(false); };
  return <div className={styles.cartAction} onMouseEnter={keepOpen} onMouseLeave={scheduleClose}>
    <HeaderAction icon={ShoppingCart} label="Carrito" value={value} onClick={openCart} />
    <MiniCart open={open} onClose={() => setOpen(false)} />
  </div>;
}

export function Header({ cartCount = 0, wishlistCount = 0, compareCount = 0 }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [miniCartOpen, setMiniCartOpen] = useState(false);
  const getSearchFromUrl = () => new URLSearchParams(window.location.hash.split('?')[1] || window.location.search).get('search') || '';
  const [search, setSearch] = useState(getSearchFromUrl);
  useEffect(() => {
    const syncSearch = () => setSearch(getSearchFromUrl());
    window.addEventListener('hashchange', syncSearch);
    window.addEventListener('popstate', syncSearch);
    return () => { window.removeEventListener('hashchange', syncSearch); window.removeEventListener('popstate', syncSearch); };
  }, []);
  const submitSearch = (event) => {
    event.preventDefault();
    const query = search.trim();
    window.location.hash = query ? `tienda?search=${encodeURIComponent(query)}` : 'tienda';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className={styles.header} id="inicio">
      <div className={styles.topBar}>
        <div className={styles.container}>
          <nav className={styles.utilityLinks} aria-label="Enlaces de utilidad">
            <a href="#nosotros">Nosotros</a>
            <a href="#cuenta">Mi cuenta</a>
            <a href="#favoritos">Favoritos</a>
            <a href="#rastrear">Rastrea tu pedido</a>
          </nav>
          <p className={styles.tagline}>Tecnología para potenciar tus ideas</p>
          <div className={styles.topControls}>
            <span>¿Necesitas ayuda? <a href="tel:+573000000000">Llámanos: <b>+57 311 8961906</b></a></span>
            <button type="button">Español <ChevronDown size={12} /></button>
            <button type="button">COP <ChevronDown size={12} /></button>
          </div>
        </div>
      </div>

      <div className={styles.mainBar}>
        <div className={`${styles.container} ${styles.mainContent}`}>
          <Brand />
          <form className={styles.searchBar} role="search" onSubmit={submitSearch}>
            <button className={styles.categorySelect} type="button">
              Todas las categorías <ChevronDown size={15} />
            </button>
            <label className="srOnly" htmlFor="product-search">Buscar productos</label>
            <input id="product-search" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Busca computadores, periféricos y más..." />
            <button className={styles.searchButton} type="submit" aria-label="Buscar"><Search size={24} /></button>
          </form>
          <button className={styles.location} type="button">
            <MapPin size={19} />
            <span><b>Tu ubicación</b><small>Selecciona tu ciudad</small></span>
            <ChevronDown size={14} />
          </button>
          <div className={styles.actions}>
            {actionItems.map((action) => action.label === 'Carrito' ? <CartHeaderAction key={action.label} value={cartCount} open={miniCartOpen} setOpen={setMiniCartOpen} /> : <HeaderAction key={action.label} {...action} value={action.label === 'Favoritos' ? wishlistCount : action.label === 'Comparar' ? compareCount : action.value} onClick={action.label === 'Favoritos' ? () => { window.location.hash = 'favoritos'; } : action.label === 'Comparar' ? () => { window.location.hash = 'comparar'; } : undefined} />)}
          </div>
          <button className={styles.mobileToggle} type="button" aria-label="Abrir menú" aria-expanded={mobileMenuOpen} onClick={() => setMobileMenuOpen((open) => !open)}>
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      <div className={`${styles.navigationBar} ${mobileMenuOpen ? styles.menuOpen : ''}`}>
        <div className={`${styles.container} ${styles.navigationContent}`}>
          <button className={styles.browseCategories} type="button"><Grid2X2 size={20} /> Explorar categorías <ChevronDown size={16} /></button>
          <nav className={styles.primaryNavigation} aria-label="Navegación principal">
            {navigationItems.map(({ label, icon: Icon, accent, active, dropdown }) => (
              <a key={label} href={label === 'Contacto' ? '#contacto' : `#${label.toLowerCase()}`} className={`${accent ? styles.accentItem : ''} ${active ? styles.activeItem : ''}`}>
                {Icon ? <Icon size={20} /> : null}{label}{dropdown ? <ChevronDown size={14} /> : null}
              </a>
            ))}
          </nav>
          <a className={styles.support} href="tel:+573000000000">
            <Headphones size={35} strokeWidth={1.8} />
            <span><b>+57 311 896 1906</b><small>Soporte al cliente</small></span>
          </a>
          <a className={styles.mobileBrowse} href="#categorias">Ver todas las categorías <ChevronRight size={16} /></a>
        </div>
      </div>
    </header>
  );
}
