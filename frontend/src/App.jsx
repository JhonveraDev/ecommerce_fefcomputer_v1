import React from 'react';
import { Header } from './components/Header/Header.jsx';
import { Hero } from './components/Hero/Hero.jsx';
import { FeaturedCategories } from './components/FeaturedCategories';
import { featuredCategoryItems } from './data/featuredCategories.tsx';

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
    </>
  );
}
