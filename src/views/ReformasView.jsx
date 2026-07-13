import React, { useState, useMemo } from 'react';

export default function ReformasView({ properties, navigateToDetail }) {
  const [filterLocation, setFilterLocation] = useState('');
  const [filterType, setFilterType] = useState('');

  const filteredReforms = useMemo(() => {
    return properties.filter(prop => {
      const matchLoc = filterLocation === '' || (prop.location || '').toLowerCase().includes(filterLocation.toLowerCase());
      const matchType = filterType === '' || prop.type === filterType;
      return matchLoc && matchType;
    });
  }, [properties, filterLocation, filterType]);

  const clearFilters = () => {
    setFilterLocation('');
    setFilterType('');
  };

  return (
    <main id="seccion-filtros-reformas" className="bg-gray-100 flex-grow text-left">

      {/* SECCIÓN LEMA DE IMPACTO */}
      <section className="relative bg-slate-950 text-white py-20 overflow-hidden px-4 text-center">
        <div className="relative max-w-5xl mx-auto text-center flex flex-col items-center justify-center space-y-6">
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight max-w-4xl mx-auto text-center text-white block w-full">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-400 block mt-2 text-center w-full">
              Nuestro trabajo habla por sí solo.
            </span>
          </h1>
          <p className="text-white text-xs sm:text-sm max-w-2xl mx-auto text-center leading-relaxed font-light block w-full">
            Un recorrido por las reformas que ya completamos: el antes y el después, ambiente por ambiente, de cada obra realizada por nuestro estudio.
          </p>
        </div>
      </section>

      {/* BARRA DE FILTROS */}
      <section className="relative -mt-8 max-w-6xl mx-auto px-4 z-30">
        <div className="bg-white rounded-2xl shadow-xl border border-neutral-100 p-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-100">
            <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">Filtrar obras realizadas</h3>
            {(filterLocation || filterType) && (
              <button onClick={clearFilters} className="text-xs font-bold text-orange-600 hover:text-orange-700 underline">
                Limpiar filtros
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Ubicación / Barrio</label>
              <input
                type="text" placeholder="Ej. La Plata..." value={filterLocation}
                onChange={(e) => setFilterLocation(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-orange-500 text-slate-700"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Tipo de Inmueble</label>
              <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="w-full bg-neutral-50 border border-neutral-200 rounded-lg py-2 px-2 text-xs text-slate-700">
                <option value="">Cualquiera</option>
                <option value="Departamento">Departamento</option>
                <option value="PH">PH</option>
                <option value="Casa">Casa</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* GALERÍA DE REFORMAS */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 border-b border-neutral-100 pb-5">
          <div>
            <h2 className="text-lg font-bold text-slate-950 uppercase tracking-wider">Obras Realizadas</h2>
          </div>
          <div className="text-xs font-semibold text-slate-600 mt-2 sm:mt-0">
            Mostrando <span className="text-orange-600 font-black">{filteredReforms.length}</span> transformaciones
          </div>
        </div>

        {filteredReforms.length === 0 ? (
          <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center max-w-lg mx-auto">
            <h3 className="font-bold text-slate-800">Todavía no hay reformas cargadas con estos filtros</h3>
            <button onClick={clearFilters} className="mt-4 px-4 py-2 bg-slate-900 hover:bg-orange-600 text-white rounded-lg text-xs font-bold transition">
              Mostrar todas
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {filteredReforms.map((property) => (
              <div key={property.id} className="bg-white rounded-2xl border border-neutral-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group">

                <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
                  <img src={property.coverImage} alt={property.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />

                  <span className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-orange-600 text-white text-[8px] sm:text-[9px] font-extrabold uppercase px-2 py-0.5 sm:py-1 rounded tracking-wider">
                    Reforma Realizada
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
                      {property.description}
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
                      Ver el antes y después ➔
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
