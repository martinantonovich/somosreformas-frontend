import React, { useState, useMemo, useEffect } from 'react';
import { getEstadoPropiedadBadge } from '../utils/estadoPropiedad';
import { stripHtml } from '../utils/richText';
import { isVideoUrl } from '../utils/media';

const PAGE_SIZE = 9;

function PropertyCard({ property, navigateToDetail }) {
  const [imgIndex, setImgIndex] = useState(0);
  const images = property.gallery?.length > 0 ? property.gallery : [property.coverImage];
  const currentImage = images[imgIndex] || property.coverImage;

  const goPrev = (e) => {
    e.stopPropagation();
    setImgIndex(i => (i === 0 ? images.length - 1 : i - 1));
  };
  const goNext = (e) => {
    e.stopPropagation();
    setImgIndex(i => (i === images.length - 1 ? 0 : i + 1));
  };

  return (
    <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group">

      {/* Contenedor de la Imagen */}
      <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
        {isVideoUrl(currentImage) ? (
          <video src={currentImage} className="w-full h-full object-cover" />
        ) : (
          <img src={currentImage} alt={property.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        )}

        {/* Badge de tipo de Operación */}
        <span className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-slate-950 text-white text-[8px] sm:text-[9px] font-extrabold uppercase px-2 py-0.5 sm:py-1 rounded tracking-wider">
          {property.operation}
        </span>

        {/* ✨ CORRECCIÓN BADGE ESTADO: Muestra "A estrenar" en vez de property.status vacío */}
        <span className="absolute top-2 right-2 sm:top-3 sm:right-3 text-[8px] sm:text-[9px] font-extrabold uppercase px-2 py-0.5 sm:py-1 rounded tracking-wider bg-emerald-600 text-white">
          {property.estadoActual || 'A Estrenar'}
        </span>

        {/* 🏗️ Distintivo cuando esta unidad además es una reforma terminada por el estudio */}
        {property.estadoReforma === 'REALIZADA' && (
          <span className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 text-[8px] sm:text-[9px] font-extrabold uppercase px-2 py-0.5 sm:py-1 rounded tracking-wider bg-slate-950/90 text-white">
            🏗️ Reformada
          </span>
        )}

        {/* 🏷️ Cartel comercial: Reservado / En Negociación / Vendido / Alquilado */}
        {(() => {
          const estadoBadge = getEstadoPropiedadBadge(property.estadoPropiedad);
          return estadoBadge && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-950/50">
              <span className={`text-xs sm:text-sm font-black uppercase tracking-widest px-4 py-1.5 rounded-lg shadow-lg -rotate-6 ${estadoBadge.className}`}>
                {estadoBadge.label}
              </span>
            </div>
          );
        })()}

        {/* ‹ › Navegación de fotos directo desde la tarjeta, sin entrar al detalle */}
        {images.length > 1 && (
          <>
            <button
              onClick={goPrev}
              aria-label="Foto anterior"
              className="absolute left-1.5 top-1/2 -translate-y-1/2 bg-white/90 text-slate-800 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center shadow-md text-xs font-bold opacity-0 group-hover:opacity-100 transition hover:bg-white active:scale-95 z-10"
            >
              ❮
            </button>
            <button
              onClick={goNext}
              aria-label="Foto siguiente"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-white/90 text-slate-800 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center shadow-md text-xs font-bold opacity-0 group-hover:opacity-100 transition hover:bg-white active:scale-95 z-10"
            >
              ❯
            </button>
            <span className="absolute bottom-2 right-2 bg-slate-950/70 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full z-10">
              {imgIndex + 1}/{images.length}
            </span>
          </>
        )}
      </div>

      {/* Contenido de la Tarjeta */}
      <div className="p-4 sm:p-5 flex-grow flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-baseline mb-1.5 sm:mb-2">
            {/* ✨ CORRECCIÓN CRÍTICA DE PRECIO Y MONEDA DINÁMICA */}
            <span
              onClick={() => navigateToDetail(property)}
              className="text-base sm:text-lg font-black text-slate-950 cursor-pointer hover:text-orange-600 transition-colors"
            >
              {property.operation === 'Venta' ? 'USD' : 'ARS'} {(property.price ?? 0).toLocaleString('es-AR')}
            </span>
            <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 bg-neutral-100 py-0.5 px-2 rounded">
              {property.type}
            </span>
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-500 font-bold flex items-center space-x-1 mb-1.5">
            📍 {property.location}
          </p>
          <h3
            onClick={() => navigateToDetail(property)}
            className="font-extrabold text-slate-800 text-xs sm:text-sm hover:text-orange-600 transition-colors line-clamp-1 cursor-pointer"
          >
            {property.title}
          </h3>
          <p className="text-[11px] sm:text-xs text-slate-500 line-clamp-2 mt-1.5 font-light leading-relaxed">
            {stripHtml(property.description)}
          </p>
        </div>

        {/* Info Técnica y Botón */}
        <div className="mt-3 sm:mt-4 pt-3 border-t border-neutral-100">
          <div className="flex justify-between text-[10px] sm:text-[11px] font-bold text-slate-600 mb-3 sm:mb-4">
            <span>{property.rooms} Amb.</span>
            <span>{property.beds} Dorm.</span>
            <span>{property.sizeTotal} m²</span>
          </div>
          <button
            onClick={() => navigateToDetail(property)}
            className="w-full bg-slate-950 hover:bg-orange-600 text-white text-[10px] sm:text-[11px] font-bold py-2 sm:py-2.5 rounded-xl transition"
          >
            Ver proceso & detalles ➔
          </button>
        </div>
      </div>
    </div>
  );
}

export default function HomeView({ properties, navigateToDetail, enProcesoCount = 0, navigateToReformas }) {
  const [filterLocation, setFilterLocation] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterOperation, setFilterOperation] = useState('');
  const [filterRooms, setFilterRooms] = useState('');
  const [filterMaxPrice, setFilterMaxPrice] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredProperties = useMemo(() => {
    return properties.filter(prop => {
      const matchLoc = filterLocation === '' || (prop.location || '').toLowerCase().includes(filterLocation.toLowerCase());
      const matchType = filterType === '' || prop.type === filterType;
      const matchOp = filterOperation === '' || prop.operation === filterOperation;
      const matchRooms = filterRooms === '' || prop.rooms === parseInt(filterRooms);
      const matchPrice = filterMaxPrice === '' || (prop.price ?? 0) <= parseInt(filterMaxPrice);
      return matchLoc && matchType && matchOp && matchRooms && matchPrice;
    });
  }, [properties, filterLocation, filterType, filterOperation, filterRooms, filterMaxPrice]);

  // Si cambian los filtros (o el resultado encoge), volvemos siempre a la página 1
  useEffect(() => {
    setCurrentPage(1);
  }, [filterLocation, filterType, filterOperation, filterRooms, filterMaxPrice]);

  const totalPages = Math.max(1, Math.ceil(filteredProperties.length / PAGE_SIZE));
  const paginatedProperties = filteredProperties.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const irAPagina = (pagina) => {
    setCurrentPage(pagina);
    document.getElementById('catalogo-propiedades')?.scrollIntoView({ behavior: 'smooth' });
  };

  const clearFilters = () => {
    setFilterLocation('');
    setFilterType('');
    setFilterOperation('');
    setFilterRooms('');
    setFilterMaxPrice('');
  };

  return (
    <main id="seccion-filtros" className="bg-gray-100 flex-grow text-left">

      {/* SECCIÓN LEMA DE IMPACTO */}
      <section className="relative bg-slate-950 text-white py-20 overflow-hidden px-4 text-center">
        <div className="relative max-w-5xl mx-auto text-center flex flex-col items-center justify-center space-y-6">
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight max-w-4xl mx-auto text-center text-white block w-full">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-400 block mt-2 text-center w-full">
              Compramos lo antiguo.<br /> Lo transformamos a nuevo.
            </span>
          </h1>
          <p className="text-white text-xs sm:text-sm max-w-2xl mx-auto text-center leading-relaxed font-light block w-full">
            Seleccionamos ubicaciones estratégicas, realizamos una transformación arquitectónica integral con acabados de calidad, y te entregamos una propiedad premium a estrenar.
          </p>
        </div>
      </section>

      {/* BARRA DE FILTROS */}
      <section className="relative -mt-8 max-w-6xl mx-auto px-4 z-30">
        <div className="bg-white rounded-2xl shadow-xl border border-neutral-100 p-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-100">
            <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">Filtros de búsqueda rápida</h3>
            {(filterLocation || filterType || filterOperation || filterRooms || filterMaxPrice) && (
              <button onClick={clearFilters} className="text-xs font-bold text-orange-600 hover:text-orange-700 underline">
                Limpiar filtros
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Ubicación / Barrio</label>
              <input
                type="text" placeholder="Ej. La Plata..." value={filterLocation}
                onChange={(e) => setFilterLocation(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-orange-500 text-slate-700"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Operación</label>
              <select value={filterOperation} onChange={(e) => setFilterOperation(e.target.value)} className="w-full bg-neutral-50 border border-neutral-200 rounded-lg py-2 px-2 text-xs text-slate-700">
                <option value="">Cualquiera</option>
                <option value="Venta">Venta</option>
                <option value="Alquiler">Alquiler</option>
              </select>
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
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Ambientes</label>
              <select value={filterRooms} onChange={(e) => setFilterRooms(e.target.value)} className="w-full bg-neutral-50 border border-neutral-200 rounded-lg py-2 px-2 text-xs text-slate-700">
                <option value="">Cualquiera</option>
                <option value="1">1 Ambiente</option>
                <option value="2">2 Ambientes</option>
                <option value="3">3 Ambientes</option>
                <option value="4">4+ Ambientes</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Precio Máx</label>
              <input
                type="number" placeholder="Monto máximo..." value={filterMaxPrice}
                onChange={(e) => setFilterMaxPrice(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-orange-500 text-slate-700"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 🚧 BANNER: acceso directo a las obras en proceso, que de otro modo quedan escondidas
          detrás de Reformas → pestaña "En Proceso" */}
      {enProcesoCount > 0 && navigateToReformas && (
        <section className="max-w-6xl mx-auto px-4 mt-10">
          <button
            onClick={() => navigateToReformas('enProceso')}
            className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-950 hover:bg-slate-900 border border-amber-500/30 rounded-2xl px-6 py-5 text-left transition group"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🚧</span>
              <div>
                <p className="text-white font-extrabold text-sm">
                  Tenemos {enProcesoCount} {enProcesoCount === 1 ? 'obra en proceso' : 'obras en proceso'} ahora mismo
                </p>
                <p className="text-slate-400 text-xs">Mirá el avance semana a semana, antes de que salgan a la venta.</p>
              </div>
            </div>
            <span className="shrink-0 bg-amber-500 text-slate-950 text-xs font-extrabold uppercase px-4 py-2 rounded-full group-hover:bg-amber-400 transition">
              Ver obras en proceso ➔
            </span>
          </button>
        </section>
      )}

      {/* CATÁLOGO DE PROPIEDADES */}
      <section id="catalogo-propiedades" className="max-w-6xl mx-auto px-4 py-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 border-b border-neutral-100 pb-5">
          <div>
            <h2 className="text-lg font-bold text-slate-950 uppercase tracking-wider">Unidades</h2>
          </div>
          <div className="text-xs font-semibold text-slate-600 mt-2 sm:mt-0">
            Mostrando <span className="text-orange-600 font-black">{filteredProperties.length}</span> hogares a estrenar
          </div>
        </div>

        {filteredProperties.length === 0 ? (
          <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center max-w-lg mx-auto">
            <h3 className="font-bold text-slate-800">No encontramos resultados</h3>
            <button onClick={clearFilters} className="mt-4 px-4 py-2 bg-slate-900 hover:bg-orange-600 text-white rounded-lg text-xs font-bold transition">
              Mostrar todas
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {paginatedProperties.map((property) => (
                <PropertyCard key={property.id} property={property} navigateToDetail={navigateToDetail} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-12">
                <button
                  onClick={() => irAPagina(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white border border-neutral-200 text-slate-700 rounded-lg text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition"
                >
                  ❮ Anterior
                </button>
                <span className="text-xs font-bold text-slate-600">
                  Página <span className="text-orange-600">{currentPage}</span> de {totalPages}
                </span>
                <button
                  onClick={() => irAPagina(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-slate-950 text-white rounded-lg text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-orange-600 transition"
                >
                  Siguiente ❯
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}
