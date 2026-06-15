import React, { useState } from 'react';

export default function DetailView({ selectedProperty, setView, setSelectedProperty, triggerToast }) {
  const [activeComparableIndex, setActiveComparableIndex] = useState(0);
  const [compareSliderVal, setCompareSliderVal] = useState(50);
  const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0);

  if (!selectedProperty) return null;

  // 🔋 Mapeo dinámico de servicios directo de la base de datos unificada
  const listaServicios = [];
  if (selectedProperty.services?.cocina) listaServicios.push("Cocina");
  if (selectedProperty.services?.aguaCaliente) listaServicios.push("Agua caliente");
  if (selectedProperty.services?.electricidad) listaServicios.push("Electricidad");
  if (selectedProperty.services?.pavimento) listaServicios.push("Pavimento");
  if (selectedProperty.services?.cable) listaServicios.push("Cable");
  if (selectedProperty.services?.gasNatural) listaServicios.push("Gas natural");
  if (selectedProperty.services?.cloaca) listaServicios.push("Cloaca");
  if (selectedProperty.services?.internet) listaServicios.push("Internet");

  // 📍 Generador unificado de URL para Google Maps usando la propiedad real de la base de datos
  const mapsEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(selectedProperty.direccion + ", " + selectedProperty.location)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  const getWhatsAppMessage = (property) => {
    if (!property) return '';
    return `¡Hola Somos Reformas! Estoy interesado/a en la propiedad: "${property.title}" ubicada en ${property.location}. Me gustaría agendar una visita.`;
  };

  const handleWhatsAppRedirect = () => {
    const textEncoded = encodeURIComponent(getWhatsAppMessage(selectedProperty));
    const waUrl = `https://wa.me/5492216397424?text=${textEncoded}`;
    window.open(waUrl, '_blank');
  };

  const handleCopyLink = () => {
    const customUrl = `https://somosreformas.com/propiedades/${selectedProperty.slug}`;
    navigator.clipboard.writeText(customUrl)
      .then(() => triggerToast("¡Enlace listo para enviar copiado al portapapeles!", "success"))
      .catch(() => triggerToast("Error al copiar el enlace", "error"));
  };

  return (
    <main className="flex-grow py-6 bg-gray-200 text-left font-sans">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* BOTÓN VOLVER */}
        <button 
          onClick={() => { setView('home'); setSelectedProperty(null); }}
          className="mb-4 inline-flex items-center space-x-1.5 text-xs font-bold text-slate-600 hover:text-orange-600 transition"
        >
          <span>❮ Volver al listado</span>
        </button>

        {/* ENCABEZADO */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6">
          <div>
            <div className="flex flex-wrap gap-1.5 mb-2">
              <span className="bg-orange-100 text-orange-700 text-[9px] font-bold uppercase px-2 py-0.5 rounded">{selectedProperty.operation}</span>
              <span className="bg-slate-100 text-slate-800 text-[9px] font-bold uppercase px-2 py-0.5 rounded">{selectedProperty.type}</span>
              <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold uppercase px-2 py-0.5 rounded">A Estrenar</span>
              
              {/* 🏛️ CORRECCIÓN: Leemos directamente de la propiedad del backend */}
              {selectedProperty.bankEligible === "Sí" && (
                <span className="bg-blue-100 text-blue-800 text-[9px] font-bold uppercase px-2 py-0.5 rounded">Apto Banco</span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight m-0">{selectedProperty.title}</h1>
          </div>
          <div className="bg-white border border-neutral-100 px-5 py-2.5 rounded-xl shadow-sm">
            <span className="text-[9px] text-slate-400 font-bold uppercase block mb-0.5">Valor</span>
            <span className="text-xl font-black text-slate-900 font-mono">USD {selectedProperty.price.toLocaleString('es-AR')}</span>
          </div>
        </div>

        {/* BLOQUE 1: FOTOS Y PANEL DE CONTACTO */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 lg:items-stretch">
          <div className="lg:col-span-2 space-y-4 flex flex-col justify-between">
            <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden shadow-sm relative aspect-[16/9] w-full">
              <img src={selectedProperty.gallery?.[currentGalleryIndex] || selectedProperty.coverImage} alt="Propiedad" className="w-full h-full object-cover" />
              {selectedProperty.gallery?.length > 1 && (
                <>
                  <button onClick={() => setCurrentGalleryIndex(prev => prev === 0 ? selectedProperty.gallery.length - 1 : prev - 1)} className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 text-slate-800 w-8 h-8 rounded-full flex items-center justify-center shadow-md text-xs font-bold hover:bg-white">❮</button>
                  <button onClick={() => setCurrentGalleryIndex(prev => prev === selectedProperty.gallery.length - 1 ? 0 : prev + 1)} className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 text-slate-800 w-8 h-8 rounded-full flex items-center justify-center shadow-md text-xs font-bold hover:bg-white">❯</button>
                  <span className="absolute bottom-4 right-4 bg-slate-950/80 text-white text-[10px] font-bold px-3 py-1 rounded-full">{currentGalleryIndex + 1} de {selectedProperty.gallery.length} fotos</span>
                </>
              )}
            </div>
            {selectedProperty.gallery?.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto pb-1">
                {selectedProperty.gallery.map((img, idx) => (
                  <button key={idx} onClick={() => setCurrentGalleryIndex(idx)} className={`relative flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${currentGalleryIndex === idx ? 'border-orange-500 scale-95' : 'border-transparent opacity-70'}`}>
                    <img src={img} alt="Mini" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex w-full">
            <div className="bg-white border border-neutral-100 p-6 rounded-2xl shadow-sm flex flex-col justify-between w-full h-full">
              <div className="space-y-4">
                <span className="text-[10px] font-extrabold text-emerald-600 block uppercase tracking-wider">✦ Asesoramiento Inmediato</span>
                <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-100 text-[11px] text-slate-600">
                  <span className="text-[9px] font-extrabold text-emerald-600 block uppercase mb-1">💬 WhatsApp Directo:</span>
                  <p className="bg-white p-2.5 rounded border border-neutral-200/50 leading-relaxed font-mono italic text-slate-500 line-clamp-4 m-0">
                    "{getWhatsAppMessage(selectedProperty)}"
                  </p>
                </div>
              </div>
              <div className="space-y-2 mt-6">
                <button onClick={handleWhatsAppRedirect} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 px-4 rounded-xl text-xs transition flex items-center justify-center space-x-2 shadow-sm active:scale-[0.99]">
                  <span>Consultar por WhatsApp</span>
                </button>
                <button onClick={handleCopyLink} className="w-full bg-neutral-100 hover:bg-neutral-200 text-slate-700 py-2.5 rounded-lg text-xs font-bold text-center transition">
                  🔗 Enlace de la ficha
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* BLOQUE 2: FICHA TÉCNICA EXTENDIDA Y MAPA REAL */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-neutral-100 p-6 shadow-sm space-y-6">
            <div>
              <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider mb-4 pb-2 border-b border-neutral-100">Ficha Técnica Completa</h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs mb-6">
                <div className="bg-neutral-50 p-2.5 rounded-lg border border-neutral-100">
                  <span className="text-[9px] text-slate-400 font-bold uppercase block mb-0.5">Mts² Construidos</span>
                  <span className="font-black text-slate-800">{selectedProperty.sizeCovered} m²</span>
                </div>
                <div className="bg-neutral-50 p-2.5 rounded-lg border border-neutral-100">
                  <span className="text-[9px] text-slate-400 font-bold uppercase block mb-0.5">Mts² Totales</span>
                  <span className="font-black text-slate-800">{selectedProperty.sizeTotal} m²</span>
                </div>
                
                {selectedProperty.sizeSemiCovered > 0 && (
                  <div className="bg-neutral-50 p-2.5 rounded-lg border border-neutral-100">
                    <span className="text-[9px] text-slate-400 font-bold uppercase block mb-0.5">Mts² Semicubiertos</span>
                    <span className="font-black text-slate-800">{selectedProperty.sizeSemiCovered} m²</span>
                  </div>
                )}

                {selectedProperty.sizeUncovered > 0 && (
                  <div className="bg-neutral-50 p-2.5 rounded-lg border border-neutral-100">
                    <span className="text-[9px] text-slate-400 font-bold uppercase block mb-0.5">Mts² Descubiertos</span>
                    <span className="font-black text-slate-800">{selectedProperty.sizeUncovered} m²</span>
                  </div>
                )}

                <div className="bg-neutral-50 p-2.5 rounded-lg border border-neutral-100">
                  <span className="text-[9px] text-slate-400 font-bold uppercase block mb-0.5">Ambientes</span>
                  <span className="font-black text-slate-800">{selectedProperty.rooms}</span>
                </div>
                <div className="bg-neutral-50 p-2.5 rounded-lg border border-neutral-100">
                  <span className="text-[9px] text-slate-400 font-bold uppercase block mb-0.5">Dormitorios</span>
                  <span className="font-black text-slate-800">{selectedProperty.beds}</span>
                </div>
                <div className="bg-neutral-50 p-2.5 rounded-lg border border-neutral-100">
                  <span className="text-[9px] text-slate-400 font-bold uppercase block mb-0.5">Baños</span>
                  <span className="font-black text-slate-800">{selectedProperty.baths}</span>
                </div>
                <div className="bg-neutral-50 p-2.5 rounded-lg border border-neutral-100">
                  <span className="text-[9px] text-slate-400 font-bold uppercase block mb-0.5">Piso / Planta</span>
                  <span className="font-black text-slate-800">{selectedProperty.floor}</span>
                </div>
                <div className="bg-neutral-50 p-2.5 rounded-lg border border-neutral-100">
                  <span className="text-[9px] text-slate-400 font-bold uppercase block mb-0.5">Condición</span>
                  <span className="font-black text-emerald-600">A Estrenar</span>
                </div>
              </div>

              <div className="border-t border-neutral-100 pt-4">
                <h4 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider mb-3">Servicios Disponibles</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {listaServicios.map((service, idx) => (
                    <div key={idx} className="flex items-center space-x-1.5 text-slate-700">
                      <span className="text-orange-500 font-bold">✓</span>
                      <span>{service}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="border-t border-neutral-100 pt-4 mt-4">
                <h4 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider mb-2">Descripción de la Propiedad</h4>
                <p className="text-xs text-slate-600 leading-relaxed font-light whitespace-pre-line">{selectedProperty.description}</p>
              </div>
            </div>
          </div>

          {/* Ubicación y Mapa Dinámico */}
          <div className="bg-white rounded-2xl border border-neutral-100 p-5 shadow-sm space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider mb-3 pb-2 border-b border-neutral-100">Ubicación</h3>
              <div className="flex items-start space-x-2 text-xs mb-3">
                <span className="text-base mt-0.5">📍</span>
                <div>
                  {/* 🏛️ CORRECCIÓN: dirección real de la BD */}
                  <strong className="text-slate-800 block">{selectedProperty.direccion}</strong>
                  <span className="text-slate-500">{selectedProperty.location}</span>
                </div>
              </div>
            </div>

            <div className="w-full flex-grow min-h-[220px] rounded-xl overflow-hidden border border-neutral-200 shadow-inner relative">
              <iframe 
                title="Google Maps Location"
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                loading="lazy" 
                allowFullScreen 
                src={mapsEmbedUrl}
              ></iframe>
            </div>

            <button 
              onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(selectedProperty.direccion + ", " + selectedProperty.location)}`, '_blank')}
              className="w-full bg-slate-950 hover:bg-orange-600 text-white font-bold py-2 rounded-lg text-xs transition text-center"
            >
              Ver en Google Maps Grande ➔
            </button>
          </div>
        </div>

        {/* BLOQUE 3: ANTES Y DESPUÉS */}
        {selectedProperty.comparables?.length > 0 && (
          <div className="bg-slate-950 text-white rounded-2xl p-6 shadow-xl border border-slate-800 w-full mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-900">
              <div>
                <h3 className="font-extrabold text-sm uppercase tracking-wider text-white m-0">📐 El Proceso de Obra: Antes y Después</h3>
                <p className="text-[11px] text-slate-400 mt-1">Deslizá el control central para visualizar el cambio estructural realizado por nuestro estudio.</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {selectedProperty.comparables.map((comp, idx) => (
                <button
                  key={idx}
                  onClick={() => { setActiveComparableIndex(idx); setCompareSliderVal(50); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    activeComparableIndex === idx ? 'bg-orange-600 text-white shadow-md' : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  {comp.spaceName}
                </button>
              ))}
            </div>

            <div className="relative w-full aspect-[2/1] rounded-xl overflow-hidden bg-slate-900 select-none border border-slate-800">
              <img src={selectedProperty.comparables[activeComparableIndex].after} alt="Después" className="absolute inset-0 w-full h-full object-cover" />
              <span className="absolute right-3 bottom-3 z-10 bg-emerald-600 text-white text-[9px] font-extrabold uppercase px-2 py-0.5 rounded shadow">Terminado a Estrenar</span>

              <div className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${compareSliderVal}%` }}>
                <img src={selectedProperty.comparables[activeComparableIndex].before} alt="Antes" className="absolute inset-0 h-full object-cover" style={{ width: '100%', maxWidth: 'none' }} />
                <span className="absolute left-3 bottom-3 z-10 bg-amber-600 text-white text-[9px] font-extrabold uppercase px-2 py-0.5 rounded shadow whitespace-nowrap">Antes de la Reforma</span>
              </div>

              <div className="absolute inset-y-0 w-1 bg-white cursor-ew-resize flex items-center justify-center" style={{ left: `${compareSliderVal}%` }}>
                <div className="w-6 h-6 rounded-full bg-orange-600 border-2 border-white shadow-xl flex items-center justify-center text-xs text-white pointer-events-none">↔</div>
              </div>
            </div>

            <div className="mt-4 flex items-center space-x-3">
              <span className="text-[10px] font-bold uppercase text-slate-400 whitespace-nowrap">Deslice para comparar</span>
              <input type="range" min="0" max="100" value={compareSliderVal} onChange={(e) => setCompareSliderVal(e.target.value)} className="flex-grow h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500" />
            </div>

            <p className="mt-4 bg-slate-900/50 p-3 rounded-lg text-xs text-slate-300 leading-relaxed italic border border-slate-900/80 m-0">
              📌 {selectedProperty.comparables[activeComparableIndex].description}
            </p>

            <div className="mt-4 pt-4 border-t border-slate-900 text-xs text-slate-400 font-light">
              <strong>Historia técnica:</strong> {selectedProperty.reformStory}
            </div>
          </div>
        )}

      </div>
    </main>
  );
}