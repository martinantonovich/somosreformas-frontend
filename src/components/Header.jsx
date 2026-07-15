import React, { useState } from 'react';

export default function Header({ navigateTo, view }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    {
      key: 'home',
      shortLabel: 'Propiedades',
      fullLabel: 'Propiedades Disponibles',
      active: view === 'home',
      onClick: () => {
        navigateTo('home');
        setTimeout(() => {
          const element = document.getElementById('seccion-filtros');
          if (element) element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      },
    },
    {
      key: 'reformas',
      shortLabel: 'Reformas',
      fullLabel: 'Reformas Realizadas',
      active: view === 'reformas',
      onClick: () => navigateTo('reformas'),
    },
    {
      key: 'cotizador',
      shortLabel: 'Cotizar',
      fullLabel: 'Cotizá tu Reforma',
      active: view === 'cotizador',
      onClick: () => navigateTo('cotizador'),
    },
    {
      key: 'contacto',
      shortLabel: 'Contacto',
      fullLabel: 'Contacto Directo',
      active: false,
      onClick: () => {
        const element = document.getElementById('footer-contact');
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      },
    },
  ];

  const handleNavClick = (item) => {
    item.onClick();
    setMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2">

        {/* LOGO */}
        <div
          className="flex items-center space-x-2 cursor-pointer group select-none shrink-0"
          onClick={() => { navigateTo('home'); setMenuOpen(false); }}
        >
          <img
            src="/logo.JPG"
            alt="Somos Reformas"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover shadow-md group-hover:scale-105 transition-transform duration-300 shrink-0"
          />

          <div className="flex flex-col min-w-0">
            <span className="text-[11px] sm:text-sm font-light tracking-[0.12em] sm:tracking-[0.18em] text-slate-900 block uppercase leading-none">
              somos<span className="font-extrabold text-orange-600">reformas</span>
            </span>
            {/* Oculto en mobile, visible desde sm */}
            <span className="hidden sm:block text-[9px] text-slate-400 font-semibold uppercase tracking-[0.12em] mt-1">
              real estate & premium design
            </span>
          </div>
        </div>

        {/* MENÚ - versión escritorio */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-wider shrink-0">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => handleNavClick(item)}
              className={`transition-colors py-2 ${item.active ? 'text-orange-600 border-b-2 border-orange-600' : 'text-slate-600 hover:text-orange-600'}`}
            >
              {item.fullLabel}
            </button>
          ))}
        </nav>

        {/* BOTÓN HAMBURGUESA - versión mobile */}
        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          className="md:hidden flex items-center justify-center w-9 h-9 rounded text-slate-700 hover:text-orange-600 hover:bg-slate-100 transition-colors shrink-0"
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={menuOpen}
        >
          {menuOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>

      </div>

      {/* MENÚ DESPLEGABLE - versión mobile */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out border-t border-neutral-100 ${menuOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0 border-t-0'}`}
      >
        <nav className="flex flex-col px-4 py-2 text-xs font-semibold uppercase tracking-wider">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => handleNavClick(item)}
              className={`text-left py-3 border-b border-neutral-100 last:border-b-0 transition-colors ${item.active ? 'text-orange-600' : 'text-slate-600 hover:text-orange-600'}`}
            >
              {item.shortLabel}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}