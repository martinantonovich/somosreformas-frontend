import React from 'react';

export default function Header({ setView, setSelectedProperty, view }) {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* LOGO */}
        <div 
          className="flex items-center space-x-3 cursor-pointer group" 
          onClick={() => { setView('home'); setSelectedProperty(null); }}
        >
          <div className="w-11 h-11 bg-slate-950 text-white rounded flex items-center justify-center shadow-md group-hover:bg-orange-600 transition-colors duration-300">
            <span className="font-bold text-sm">SR</span>
          </div>
          
          <div className="flex flex-col">
            <span className="text-sm font-light tracking-[0.25em] text-slate-900 block uppercase leading-none">
              somos<span className="font-extrabold text-orange-600">reformas</span>
            </span>
            <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-[0.18em] mt-1.5 block">
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