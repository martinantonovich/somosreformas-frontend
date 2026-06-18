import React from 'react';

export default function Header({ setView, setSelectedProperty, view }) {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2">
        
        {/* LOGO */}
        <div 
          className="flex items-center space-x-2 cursor-pointer group select-none shrink-0" 
          onClick={() => { setView('home'); setSelectedProperty(null); }}
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 bg-slate-950 text-white rounded flex items-center justify-center shadow-md group-hover:bg-orange-600 transition-colors duration-300 flex-shrink-0">
            <span className="font-black text-[10px] sm:text-xs">SR</span>
          </div>
          
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

        {/* MENÚ */}
        <nav className="flex items-center gap-3 sm:gap-8 text-[10px] sm:text-xs font-semibold uppercase tracking-wider shrink-0">
          <button 
            onClick={() => {
              setView('home');
              setSelectedProperty(null);
              setTimeout(() => {
                const element = document.getElementById('seccion-filtros');
                if (element) element.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }} 
            className={`transition-colors py-2 ${view === 'home' ? 'text-orange-600 border-b-2 border-orange-600' : 'text-slate-600 hover:text-orange-600'}`}
          >
            {/* Texto corto en mobile, completo en sm+ */}
            <span className="sm:hidden">Propiedades</span>
            <span className="hidden sm:inline">Propiedades Disponibles</span>
          </button>
          <button 
            onClick={() => {
              const element = document.getElementById('footer-contact');
              if (element) element.scrollIntoView({ behavior: 'smooth' });
            }}
            className="text-slate-600 hover:text-orange-600 py-2 transition-colors"
          >
            <span className="sm:hidden">Contacto</span>
            <span className="hidden sm:inline">Contacto Directo</span>
          </button>
        </nav>

      </div>
    </header>
  );
}