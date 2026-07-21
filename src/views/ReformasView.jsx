import React, { useState } from 'react';
import { stripHtml } from '../utils/richText';

export default function ReformasView({ enProceso, realizadas, navigateToDetail }) {
  const [activeTab, setActiveTab] = useState('realizadas');

  const displayedProperties = activeTab === 'realizadas' ? realizadas : enProceso;

  return (
    <main id="seccion-filtros-reformas" className="bg-gray-100 flex-grow text-left">

      {/* SECCIÓN LEMA DE IMPACTO + PESTAÑAS */}
      <section className="relative bg-slate-950 text-white py-20 overflow-hidden px-4 text-center">
        <div className="relative max-w-5xl mx-auto text-center flex flex-col items-center justify-center space-y-8">
          <div className="space-y-6">
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight max-w-4xl mx-auto text-center text-white block w-full">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-400 block mt-2 text-center w-full">
                Nuestro trabajo habla por sí solo.
              </span>
            </h1>
            <p className="text-white text-xs sm:text-sm max-w-2xl mx-auto text-center leading-relaxed font-light block w-full">
              {activeTab === 'realizadas'
                ? 'Un recorrido por las reformas que ya completamos: el antes y el después, ambiente por ambiente, de cada obra realizada por nuestro estudio.'
                : 'Un recorrido por las reformas que estamos haciendo: los avances, ambiente por ambiente, de cada obra realizada por nosotros.'}
            </p>
          </div>

          {/* PESTAÑAS: Realizadas / En Proceso — bien visibles, tipo control segmentado */}
          <div className="inline-flex bg-slate-900 rounded-full p-1.5 sm:p-2 shadow-2xl border border-slate-800 gap-1">
            <button
              onClick={() => setActiveTab('realizadas')}
              className={`px-5 sm:px-8 py-3 sm:py-3.5 rounded-full text-xs sm:text-sm font-extrabold uppercase tracking-wider transition ${
                activeTab === 'realizadas' ? 'bg-orange-600 text-white shadow-lg scale-105' : 'text-slate-400 hover:text-white'
              }`}
            >
              ✓ Realizadas ({realizadas.length})
            </button>
            <button
              onClick={() => setActiveTab('enProceso')}
              className={`px-5 sm:px-8 py-3 sm:py-3.5 rounded-full text-xs sm:text-sm font-extrabold uppercase tracking-wider transition ${
                activeTab === 'enProceso' ? 'bg-amber-500 text-slate-950 shadow-lg scale-105' : 'text-slate-400 hover:text-white'
              }`}
            >
              🚧 En Proceso ({enProceso.length})
            </button>
          </div>
        </div>
      </section>

      {/* GALERÍA DE REFORMAS */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 border-b border-neutral-100 pb-5">
          <div>
            <h2 className="text-lg font-bold text-slate-950 uppercase tracking-wider">
              {activeTab === 'realizadas' ? 'Obras Realizadas' : 'Obras en Proceso'}
            </h2>
          </div>
          <div className="text-xs font-semibold text-slate-600 mt-2 sm:mt-0">
            Mostrando <span className="text-orange-600 font-black">{displayedProperties.length}</span> transformaciones
          </div>
        </div>

        {displayedProperties.length === 0 ? (
          <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center max-w-lg mx-auto">
            <h3 className="font-bold text-slate-800">
              {activeTab === 'realizadas' ? 'Todavía no hay reformas realizadas cargadas.' : 'Todavía no hay obras en proceso cargadas.'}
            </h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {displayedProperties.map((property) => (
              <div key={property.id} className="bg-white rounded-2xl border border-neutral-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group">

                <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
                  <img src={property.coverImage} alt={property.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />

                  <span className={`absolute top-2 left-2 sm:top-3 sm:left-3 text-white text-[8px] sm:text-[9px] font-extrabold uppercase px-2 py-0.5 sm:py-1 rounded tracking-wider ${activeTab === 'realizadas' ? 'bg-orange-600' : 'bg-amber-600'}`}>
                    {activeTab === 'realizadas' ? 'Reforma Realizada' : '🚧 En Proceso'}
                  </span>
                </div>

                <div className="p-4 sm:p-5 flex-grow flex flex-col justify-between">
                  <div>
                    <p className="text-[10px] sm:text-[11px] text-slate-500 font-bold flex items-center space-x-1 mb-1.5">
                      📍 {property.location}
                    </p>
                    <h3 className="font-extrabold text-slate-800 text-xs sm:text-sm group-hover:text-orange-600 transition-colors line-clamp-1">
                      {property.title}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-slate-500 line-clamp-2 mt-1.5 font-light leading-relaxed">
                      {stripHtml(property.description)}
                    </p>
                  </div>

                  <div className="mt-3 sm:mt-4 pt-3 border-t border-neutral-100">
                    <div className="flex justify-between text-[10px] sm:text-[11px] font-bold text-slate-600 mb-3 sm:mb-4">
                      <span>{property.type}</span>
                      <span>{property.rooms} Amb.</span>
                      <span>{property.sizeTotal} m²</span>
                    </div>
                    <button
                      onClick={() => navigateToDetail(property)}
                      className="w-full bg-slate-950 hover:bg-orange-600 text-white text-[10px] sm:text-[11px] font-bold py-2 sm:py-2.5 rounded-xl transition"
                    >
                      {activeTab === 'realizadas' ? 'Ver el antes y después ➔' : 'Ver el avance de la obra ➔'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
