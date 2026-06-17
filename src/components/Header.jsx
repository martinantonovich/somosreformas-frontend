import React from 'react';

export default function Header({ setView, setSelectedProperty, view }) {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* LOGO */}
        <div 
          className="flex items-center space-x-2.5 cursor-pointer group select-none max-w-full" 
          onClick={() => { setView('home'); setSelectedProperty(null); }}
        >
          {/* Reducido de w-11/h-11 a w-9/h-9 para cuidar el ancho en mobile */}
          <div className="w-9 h-9 bg-slate-950 text-white rounded flex items-center justify-center shadow-md group-hover:bg-orange-600 transition-colors duration-300 flex-shrink-0">
            <span className="font-black text-xs">SR</span>
          </div>
          
          <div className="flex flex-col min-w-0">
            {/* Ajustamos el tracking y tamaño responsivo para evitar el desborde */}
            <span className="text-xs sm:text-sm font-light tracking-[0.18em] text-slate-900 block uppercase leading-none truncate">
              somos<span className="font-extrabold text-orange-600">reformas</span>
            </span>
            {/* Reducido levemente el mt y el tracking */}
            <span className="text-[8px] sm:text-[9px] text-slate-400 font-semibold uppercase tracking-[0.12em] mt-1 block truncate">
              real estate & premium design
            </span>
          </div>
        </div>

        {/* MENÚ */}
        <nav className="flex space-x-8 text-xs font-semibold uppercase tracking-wider">
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
            Propiedades Disponibles
            </button>
          <button 
            onClick={() => {
              const element = document.getElementById('footer-contact');
              if (element) element.scrollIntoView({ behavior: 'smooth' });
            }}
            className="text-slate-600 hover:text-orange-600 py-2 transition-colors"
          >
            Contacto Directo
          </button>
        </nav>

      </div>
    </header>
  );
}