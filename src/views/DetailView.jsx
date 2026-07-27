import React, { useState } from 'react';
import { getEstadoPropiedadBadge } from '../utils/estadoPropiedad';
import { RICH_TEXT_CLASSES } from '../utils/richText';
import { isVideoUrl } from '../utils/media';

export default function DetailView({ selectedProperty, navigateTo, triggerToast }) {
  const [activeComparableIndex, setActiveComparableIndex] = useState(0);
  const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0);
  const [carouselIdx, setCarouselIdx] = useState({});

  // 🎠 Índice del carrusel de cada columna (Antes/Durante/Actual), independiente por ambiente.
  const getCarouselIdx = (key, len) => {
    if (len <= 0) return 0;
    const raw = carouselIdx[key] ?? 0;
    return ((raw % len) + len) % len;
  };
  const stepCarousel = (key, len, dir) => {
    setCarouselIdx(prev => ({ ...prev, [key]: ((prev[key] ?? 0) + dir + len) % len }));
  };
  const goToCarouselIdx = (key, i) => {
    setCarouselIdx(prev => ({ ...prev, [key]: i }));
  };

  if (!selectedProperty) return null;
    console.log("selectedProperty completo:", selectedProperty);
    console.log("latitud:", selectedProperty.latitud);
    console.log("longitud:", selectedProperty.longitud);

  // 🏗️ estadoReforma es independiente de operation: una reforma puede además estar en venta/alquiler
  const isEnProceso = selectedProperty.estadoReforma === 'EN_PROCESO';
  const isRealizada = selectedProperty.estadoReforma === 'REALIZADA';
  const isReforma = isEnProceso || isRealizada;
  const isComercial = selectedProperty.operation === 'Venta' || selectedProperty.operation === 'Alquiler';
  // 🚧 Mientras la obra no está en venta/alquiler (en proceso, o realizada pero sin publicar todavía),
  // mostramos la documentación Antes/Durante/Actual arriba, en el lugar de la galería normal —
  // así se distingue claramente de una ficha de propiedad disponible. Al publicarla (isComercial),
  // vuelve al formato original y esta documentación pasa a la sección "Obras Realizadas" más abajo.
  const mostrarObraArriba = isReforma && !isComercial && selectedProperty.comparables?.length > 0;
  const estadoPropiedadBadge = getEstadoPropiedadBadge(selectedProperty.estadoPropiedad);
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
  
  const latitud = selectedProperty.latitud;
  const longitud = selectedProperty.longitud;
  const direccionDestino = selectedProperty.direccion || selectedProperty.address || '';
  const localidadDestino = selectedProperty.localidad || selectedProperty.location || 'La Plata';

  // 🔌 Embed (iframe) con la sintaxis oficial de Google Maps
  const mapsEmbedUrl = (latitud && longitud)
    ? `https://maps.google.com/maps?q=${latitud},${longitud}&z=16&output=embed`
    : `https://maps.google.com/maps?q=${encodeURIComponent(direccionDestino + ", " + localidadDestino)}&z=15&output=embed`;

  // ✅ URL para abrir en nueva pestaña (Botón Grande)
  const urlGrande = (latitud && longitud)
    ? `https://www.google.com/maps?q=${latitud},${longitud}&z=16`
    : `https://www.google.com/maps?q=${encodeURIComponent(direccionDestino + ", " + localidadDestino)}&z=15`;

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8090';
  const getWhatsAppMessage = (property) => {
    if (!property) return '';
    const esComercial = property.operation === 'Venta' || property.operation === 'Alquiler';
    if (esComercial) {
      return `¡Hola Somos Reformas! Estoy interesado/a en la propiedad: "${property.title}" ubicada en ${property.location}. Me gustaría agendar una visita.`;
    }
    if (property.estadoReforma === 'EN_PROCESO') {
      return `¡Hola Somos Reformas! Vi el avance de la obra "${property.title}" y quiero consultar sobre este proyecto / cotizar algo similar.`;
    }
    if (property.estadoReforma === 'REALIZADA') {
      return `¡Hola Somos Reformas! Vi la reforma "${property.title}" y quiero cotizar algo similar para mi propiedad.`;
    }
    return `¡Hola Somos Reformas! Estoy interesado/a en la propiedad: "${property.title}" ubicada en ${property.location}. Me gustaría agendar una visita.`;
  };

  const handleWhatsAppRedirect = () => {
    // 1. Armamos el mensaje en base a tu lógica original
    const textEncoded = encodeURIComponent(getWhatsAppMessage(selectedProperty));
    const waUrl = `https://wa.me/5492257526756?text=${textEncoded}`;

    // 2. 🚀 DETONADOR EN SEGUNDO PLANO PARA N8N
    // Generamos el lead con el origen "detalle_propiedad" para registrarlo en Google Sheets
    const leadPayload = {
      nombre: "Interesado Directo (Click WhatsApp)",
      email: "Click en Ficha",
      telefono: "Ver en chat de WhatsApp",
      mensaje: `El usuario solicitó asesoramiento inmediato por la propiedad: "${selectedProperty.title}"`,
      idPropiedad: selectedProperty.id, // Pasamos el ID dinámico
      origen: "detalle_propiedad"       // El origen clave que lee tu n8n
    };

    // Le pegamos a tu API de Spring Boot de forma silenciosa
    fetch(`${apiUrl}/api/consultas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(leadPayload)
    })
    .then(res => {
      if (res.ok) console.log("🚀 Lead de ficha trackeado correctamente en la solapa consultas_web");
    })
    .catch(err => console.error("Error registrando lead en n8n:", err));

    // 3. Abrimos el WhatsApp de inmediato sin demoras para el usuario
    window.open(waUrl, '_blank');
  };

  const handleCopyLink = () => {
    // const customUrl = `${window.location.origin}/?propId=${selectedProperty.id}`;
    const customUrl = `${window.location.origin}/?prop=${selectedProperty.slug}`;
    
    navigator.clipboard.writeText(customUrl)
      .then(() => triggerToast("¡Enlace listo para enviar copiado al portapapeles!", "success"))
      .catch(() => triggerToast("Error al copiar el enlace", "error"));
  };

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      const { generarFichaPDF } = await import('../utils/pdfFicha');
      await generarFichaPDF(selectedProperty);
    } catch (error) {
      console.error('Error generando el PDF:', error);
      triggerToast('No se pudo generar el PDF. Probá de nuevo.', 'error');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // 🎠 Tabs por ambiente + las 3 columnas (Antes/Durante/Actual) con su mini-carrusel cada una.
  // Se usa tanto arriba (obra en curso / recién realizada) como en "Obras Realizadas" más abajo.
  const renderObraShowcase = () => {
    const activeComp = selectedProperty.comparables[activeComparableIndex];
    const columnas = [
      { key: 'antes', label: 'Antes', badge: 'bg-amber-600', media: activeComp.antesMedia || [], caption: activeComp.descripcionAntes, vacio: 'Aún no hay fotos del estado inicial.' },
      { key: 'durante', label: 'Durante', badge: 'bg-orange-600', media: activeComp.duranteMedia || [], caption: activeComp.descripcionDurante, vacio: 'Todavía no hay avance cargado.' },
      { key: 'actual', label: 'Actual', badge: 'bg-emerald-600', media: activeComp.actualMedia || [], caption: activeComp.descripcionActual, vacio: 'Todavía no hay fotos del estado actual.' }
    ];

    return (
      <>
        <div className="flex flex-wrap gap-2 mb-4">
          {selectedProperty.comparables.map((comp, idx) => (
            <button
              key={idx}
              onClick={() => setActiveComparableIndex(idx)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeComparableIndex === idx ? 'bg-orange-600 text-white shadow-md' : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              {comp.spaceName}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {columnas.map(col => {
            const carouselKey = `${activeComparableIndex}-${col.key}`;
            const idx = getCarouselIdx(carouselKey, col.media.length);
            const item = col.media[idx];

            return (
              <div key={col.key}>
                <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shadow-lg aspect-[3/4]">
                  {item ? (
                    <>
                      {item.tipo === 'video' ? (
                        <video src={item.url} controls className="w-full h-full object-cover" />
                      ) : (
                        <img src={item.url} alt={col.label} className="w-full h-full object-cover" />
                      )}
                      {col.media.length > 1 && (
                        <>
                          <button
                            type="button"
                            onClick={() => stepCarousel(carouselKey, col.media.length, -1)}
                            className="absolute left-1 top-1/2 -translate-y-1/2 z-20 bg-slate-950/70 hover:bg-slate-950 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm"
                          >
                            ‹
                          </button>
                          <button
                            type="button"
                            onClick={() => stepCarousel(carouselKey, col.media.length, 1)}
                            className="absolute right-1 top-1/2 -translate-y-1/2 z-20 bg-slate-950/70 hover:bg-slate-950 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm"
                          >
                            ›
                          </button>
                          <span className="absolute right-1.5 bottom-1.5 z-20 bg-slate-950/80 text-white text-[9px] font-bold px-1.5 py-0.5 rounded pointer-events-none">
                            {idx + 1}/{col.media.length}
                          </span>
                        </>
                      )}
                      <span className={`absolute left-2 top-2 z-20 ${col.badge} text-white text-[9px] font-extrabold uppercase px-2 py-0.5 rounded shadow pointer-events-none`}>
                        {col.label}
                      </span>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600 text-[10px] text-center px-3">
                      {col.vacio}
                    </div>
                  )}
                </div>

                {/* Miniaturas, igual que en la galería principal */}
                {col.media.length > 1 && (
                  <div className="flex space-x-1.5 overflow-x-auto pb-1 mt-1.5 scrollbar-thin">
                    {col.media.map((m, mIdx) => (
                      <button
                        key={mIdx}
                        type="button"
                        onClick={() => goToCarouselIdx(carouselKey, mIdx)}
                        className={`relative shrink-0 w-12 h-9 rounded-md overflow-hidden border-2 transition-all bg-slate-900 ${idx === mIdx ? 'border-orange-500 scale-95 opacity-100' : 'border-transparent opacity-60'}`}
                      >
                        {m.tipo === 'video' ? (
                          <video src={m.url} preload="metadata" className="w-full h-full object-cover" />
                        ) : (
                          <img src={m.url} alt="Mini" className="w-full h-full object-cover" />
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {item?.descripcion && (
                  <p className="text-[10px] text-slate-400 mt-1 italic leading-relaxed">{item.descripcion}</p>
                )}
                {col.caption && (
                  <p className="mt-2 bg-slate-900/50 p-2 rounded-lg text-[11px] text-slate-300 leading-relaxed italic border border-slate-900/80 m-0">
                    📌 {col.caption}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </>
    );
  };

  // 💬 Caja de contacto/WhatsApp. `apilada` = true cuando va debajo del showcase de obra a todo
  // el ancho (en vez de al costado de la galería), así se acomoda como una barra horizontal.
  const renderContactBox = (apilada) => (
    <div className={`bg-white border border-neutral-100 p-4 sm:p-6 rounded-2xl shadow-sm w-full ${apilada ? 'sm:flex sm:items-center sm:gap-6' : 'flex flex-col justify-between'}`}>
      <div className="space-y-3 sm:flex-1">
        <span className="text-[10px] font-extrabold text-emerald-600 block uppercase tracking-wider">
          {isEnProceso ? '✦ Consultános sobre esta obra' : isReforma ? '✦ ¿Querés algo similar?' : '✦ Asesoramiento Inmediato'}
        </span>
        <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-100 text-[11px] text-slate-600">
          <span className="text-[9px] font-extrabold text-emerald-600 block uppercase mb-1">💬 WhatsApp Directo:</span>
          <p className="bg-white p-2.5 rounded border border-neutral-200/50 leading-relaxed font-mono italic text-slate-500 line-clamp-3 sm:line-clamp-4 m-0">
            "{getWhatsAppMessage(selectedProperty)}"
          </p>
        </div>
      </div>
      <div className={`space-y-2 mt-4 ${apilada ? 'sm:mt-0 sm:w-64 sm:shrink-0' : 'sm:mt-6'}`}>
        <button onClick={handleWhatsAppRedirect} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-4 rounded-xl text-xs transition flex items-center justify-center space-x-2 shadow-sm active:scale-[0.98]">
          <span>Consultar por WhatsApp</span>
        </button>
        <button onClick={handleCopyLink} className="w-full bg-neutral-100 hover:bg-neutral-200 text-slate-700 py-2 rounded-lg text-xs font-bold text-center transition active:scale-[0.98]">
          🔗 Enlace de la ficha
        </button>
        <button onClick={handleDownloadPdf} disabled={isGeneratingPdf} className="w-full bg-neutral-100 hover:bg-neutral-200 text-slate-700 py-2 rounded-lg text-xs font-bold text-center transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-wait">
          {isGeneratingPdf ? 'Generando PDF...' : '📄 Descargar ficha en PDF'}
        </button>
      </div>
    </div>
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  console.log("Coordenadas detectadas en Detalle:", latitud, longitud);
  return (
    <main className="flex-grow py-4 sm:py-6 bg-gray-100 text-left font-sans">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* BOTÓN VOLVER Y LOGO RESPONSIVO */}
        <div className="flex justify-between items-center mb-4 gap-2">
          <button 
            onClick={() => navigateTo('home')}
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-600 hover:text-orange-600 transition p-1"
          >
            <span>❮ Volver al listado</span>
          </button>

          {/* 🏛️ LOGO OPTIMIZADO PARA PREVENIR EL DESBORDE (OVERFLOW) */}
          <div 
            className="flex items-center space-x-2.5 cursor-pointer group select-none max-w-[60%] sm:max-w-full" 
            onClick={() => navigateTo('home')}
          >
            <img
              src="/logo.JPG"
              alt="Somos Reformas"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover shadow-md group-hover:scale-105 transition-transform duration-300 shrink-0"
            />
            <div className="flex flex-col min-w-0">
              <span className="text-xs sm:text-sm font-light tracking-[0.18em] text-slate-900 block uppercase leading-none truncate">
                somos<span className="font-extrabold text-orange-600">reformas</span>
              </span>
              <span className="text-[8px] sm:text-[9px] text-slate-400 font-semibold uppercase tracking-[0.12em] mt-1 block truncate">
                real estate & premium design
              </span>
            </div>
          </div>
        </div>

        {/* 🏗️ CINTA DISTINTIVA: deja en claro si es una obra en curso o ya finalizada, y si está en venta */}
        {isEnProceso && (
          <div className="bg-amber-500 text-slate-950 rounded-xl px-4 py-2.5 mb-4 flex items-center gap-2 shadow-sm">
            <span className="text-base">🚧</span>
            <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wider m-0">
              Obra en Proceso <span className="font-semibold normal-case">— Estamos trabajando en esta propiedad ahora mismo. Mostramos el avance en tiempo real.</span>
            </p>
          </div>
        )}
        {isRealizada && (
          <div className="bg-slate-950 text-white rounded-xl px-4 py-2.5 mb-4 flex items-center gap-2 shadow-sm">
            <span className="text-base">🏗️</span>
            <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wider m-0">
              Obra Finalizada <span className="text-slate-400 font-semibold normal-case">
                {isComercial
                  ? `— Esta reforma ya está lista y disponible para ${selectedProperty.operation === 'Venta' ? 'venta' : 'alquiler'}.`
                  : '— Esta propiedad no está disponible para venta ni alquiler. Mostramos el proceso de la reforma.'}
              </span>
            </p>
          </div>
        )}

        {/* ENCABEZADO RESTRUCTURADO */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6">
          <div className="w-full md:w-auto">
            <div className="flex flex-wrap gap-1.5 mb-2">
              {estadoPropiedadBadge && (
                <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${estadoPropiedadBadge.className}`}>{estadoPropiedadBadge.label}</span>
              )}
              <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${isReforma ? 'bg-slate-800 text-slate-200' : 'bg-orange-100 text-orange-700'}`}>{selectedProperty.operation}</span>
              <span className="bg-slate-100 text-slate-800 text-[9px] font-bold uppercase px-2 py-0.5 rounded">{selectedProperty.type}</span>
              {isComercial && !isReforma && <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold uppercase px-2 py-0.5 rounded">A Estrenar</span>}
              {isComercial && !isReforma && selectedProperty.bankEligible === "Sí" && (
                <span className="bg-blue-100 text-blue-800 text-[9px] font-bold uppercase px-2 py-0.5 rounded">Apto Banco</span>
              )}
              {isEnProceso && <span className="bg-amber-100 text-amber-800 text-[9px] font-bold uppercase px-2 py-0.5 rounded">🚧 En Proceso</span>}
              {isRealizada && <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold uppercase px-2 py-0.5 rounded">✓ Obra Finalizada</span>}
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight m-0 leading-tight">{selectedProperty.title}</h1>
          </div>
          {isComercial ? (
            <div className="bg-white border border-neutral-100 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl shadow-sm w-full md:w-auto flex flex-row md:flex-col justify-between items-center md:items-start">
              <span className="text-[9px] text-slate-400 font-bold uppercase block md:mb-0.5">Valor</span>
              <span className="text-lg sm:text-xl font-black text-slate-900 font-mono">
                {selectedProperty.operation === 'Venta' ? 'USD' : 'ARS'} {(selectedProperty.price ?? 0).toLocaleString('es-AR')}
              </span>
              {selectedProperty.operation === 'Alquiler' && selectedProperty.expensas > 0 && (
                <span className="text-[10px] text-slate-500 font-bold">
                  + Expensas ARS {selectedProperty.expensas.toLocaleString('es-AR')}
                </span>
              )}
            </div>
          ) : isEnProceso ? (
            <div className="bg-white border border-neutral-100 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl shadow-sm w-full md:w-auto flex flex-row md:flex-col justify-between items-center md:items-start">
              <span className="text-[9px] text-slate-400 font-bold uppercase block md:mb-0.5">Estado</span>
              <span className="text-sm sm:text-base font-black text-amber-600">
                Obra en Proceso 🚧
              </span>
            </div>
          ) : isRealizada ? (
            <div className="bg-white border border-neutral-100 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl shadow-sm w-full md:w-auto flex flex-row md:flex-col justify-between items-center md:items-start">
              <span className="text-[9px] text-slate-400 font-bold uppercase block md:mb-0.5">Estado</span>
              <span className="text-sm sm:text-base font-black text-emerald-600">
                Obra Finalizada ✓
              </span>
            </div>
          ) : null}
        </div>

        {/* BLOQUE 1: FOTOS Y PANEL DE CONTACTO */}
        {mostrarObraArriba ? (
          /* 🚧 Propiedad en obra (todavía no publicada): el showcase Antes/Durante/Actual ocupa
             todo el ancho para que las 3 columnas se vean grandes, y la caja de contacto queda
             debajo como una barra horizontal, en vez de ir apretada al costado. */
          <div className="space-y-4 mb-6">
            <div className="bg-slate-950 rounded-2xl border-2 border-amber-600/50 shadow-md p-4 sm:p-5 w-full">
              <div className="mb-4">
                <h2 className="font-extrabold text-sm uppercase tracking-wider text-white m-0">
                  {isEnProceso ? '🚧 Avance de la Obra' : '📐 Documentación de la Reforma'}
                </h2>
                <p className="text-[11px] text-slate-400 mt-1">
                  {isEnProceso
                    ? 'Así va progresando cada ambiente, en tiempo real: antes, durante y estado actual.'
                    : 'Así fue el proceso de esta reforma: antes, durante y resultado final.'}
                </p>
              </div>
              {renderObraShowcase()}
            </div>

            {renderContactBox(true)}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2 space-y-3 flex flex-col justify-between">
              {/* 📸 CARRUSEL PRINCIPAL INTELIGENTE: Controla fotos verticales y horizontales de forma automatizada */}
              <div className="bg-slate-950 rounded-2xl border border-neutral-900 overflow-hidden shadow-md relative aspect-[4/3] sm:aspect-[16/9] w-full flex items-center justify-center">
                {isVideoUrl(selectedProperty.gallery?.[currentGalleryIndex]) ? (
                  <video
                    src={selectedProperty.gallery[currentGalleryIndex]}
                    controls
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <img
                    src={selectedProperty.gallery?.[currentGalleryIndex] || selectedProperty.coverImage}
                    alt="Propiedad"
                    className="w-full h-full object-contain cursor-zoom-in"
                    onClick={() => setIsModalOpen(true)}
                  />
                )}
                {selectedProperty.gallery?.length > 1 && (
                  <>
                    <button onClick={() => setCurrentGalleryIndex(prev => prev === 0 ? selectedProperty.gallery.length - 1 : prev - 1)} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 text-slate-800 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shadow-md text-xs font-bold hover:bg-white active:scale-95 z-10">❮</button>
                    <button onClick={() => setCurrentGalleryIndex(prev => prev === selectedProperty.gallery.length - 1 ? 0 : prev + 1)} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 text-slate-800 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shadow-md text-xs font-bold hover:bg-white active:scale-95 z-10">❯</button>
                    <span className="absolute bottom-3 right-3 bg-slate-950/80 text-white text-[9px] sm:text-[10px] font-bold px-2.5 py-1 rounded-full z-10">{currentGalleryIndex + 1} de {selectedProperty.gallery.length} fotos</span>
                  </>
                )}
              </div>

              {/* Carrusel de miniaturas */}
              {selectedProperty.gallery?.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-thin">
                  {selectedProperty.gallery.map((img, idx) => (
                    <button key={idx} onClick={() => setCurrentGalleryIndex(idx)} className={`relative flex-shrink-0 w-14 h-10 sm:w-16 sm:h-12 rounded-lg overflow-hidden border-2 transition-all bg-slate-900 ${currentGalleryIndex === idx ? 'border-orange-500 scale-95 opacity-100' : 'border-transparent opacity-60'}`}>
                      {isVideoUrl(img) ? (
                        <video src={img} preload="metadata" className="w-full h-full object-cover" />
                      ) : (
                        <img src={img} alt="Mini" className="w-full h-full object-cover" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {renderContactBox(false)}
          </div>
        )}

        {/* BLOQUE 2: FICHA TÉCNICA EXTENDIDA Y MAPA REAL */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-neutral-100 p-4 sm:p-6 shadow-sm space-y-5">
            <div>
              <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider mb-3 pb-2 border-b border-neutral-100">Ficha Técnica Completa</h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 text-xs mb-4">
                <div className="bg-neutral-50 p-2 sm:p-2.5 rounded-lg border border-neutral-100">
                  <span className="text-[9px] text-slate-400 font-bold uppercase block mb-0.5">Mts² Construidos</span>
                  <span className="font-black text-slate-800">{selectedProperty.sizeCovered || selectedProperty.m2_cubiertos} m²</span>
                </div>
                <div className="bg-neutral-50 p-2 sm:p-2.5 rounded-lg border border-neutral-100">
                  <span className="text-[9px] text-slate-400 font-bold uppercase block mb-0.5">Mts² Totales</span>
                  <span className="font-black text-slate-800">{selectedProperty.sizeTotal || selectedProperty.m2_totales} m²</span>
                </div>
                {(selectedProperty.sizeSemiCovered > 0 || selectedProperty.m2_semicubiertos > 0) && (
                  <div className="bg-neutral-50 p-2 sm:p-2.5 rounded-lg border border-neutral-100">
                    <span className="text-[9px] text-slate-400 font-bold uppercase block mb-0.5">Mts² Semicub.</span>
                    <span className="font-black text-slate-800">{selectedProperty.sizeSemiCovered || selectedProperty.m2_semicubiertos} m²</span>
                  </div>
                )}
                {(selectedProperty.sizeUncovered > 0 || selectedProperty.m2_descubiertos > 0) && (
                  <div className="bg-neutral-50 p-2 sm:p-2.5 rounded-lg border border-neutral-100">
                    <span className="text-[9px] text-slate-400 font-bold uppercase block mb-0.5">Mts² Descub.</span>
                    <span className="font-black text-slate-800">{selectedProperty.sizeUncovered || selectedProperty.m2_descubiertos} m²</span>
                  </div>
                )}
                <div className="bg-neutral-50 p-2 sm:p-2.5 rounded-lg border border-neutral-100">
                  <span className="text-[9px] text-slate-400 font-bold uppercase block mb-0.5">Ambientes</span>
                  <span className="font-black text-slate-800">{selectedProperty.rooms || selectedProperty.ambientes}</span>
                </div>
                <div className="bg-neutral-50 p-2 sm:p-2.5 rounded-lg border border-neutral-100">
                  <span className="text-[9px] text-slate-400 font-bold uppercase block mb-0.5">Dormitorios</span>
                  <span className="font-black text-slate-800">{selectedProperty.beds || selectedProperty.dormitorios}</span>
                </div>
                <div className="bg-neutral-50 p-2 sm:p-2.5 rounded-lg border border-neutral-100">
                  <span className="text-[9px] text-slate-400 font-bold uppercase block mb-0.5">Baños</span>
                  <span className="font-black text-slate-800">{selectedProperty.baths || selectedProperty.banos}</span>
                </div>
                <div className="bg-neutral-50 p-2 sm:p-2.5 rounded-lg border border-neutral-100">
                  <span className="text-[9px] text-slate-400 font-bold uppercase block mb-0.5">Piso / Planta</span>
                  <span className="font-black text-slate-800">{selectedProperty.floor || selectedProperty.piso_planta || 'P.B.'}</span>
                </div>
                <div className="bg-neutral-50 p-2 sm:p-2.5 rounded-lg border border-neutral-100">
                  <span className="text-[9px] text-slate-400 font-bold uppercase block mb-0.5">Condición</span>
                  <span className={`font-black ${selectedProperty.antiguedad === 0 || !selectedProperty.antiguedad ? 'text-emerald-600' : 'text-slate-700'}`}>
                    {selectedProperty.antiguedad === 0 || !selectedProperty.antiguedad
                      ? 'A Estrenar'
                      : `${selectedProperty.antiguedad} ${selectedProperty.antiguedad === 1 ? 'año' : 'años'}`}
                  </span>
                </div>
              </div>

              <div className="border-t border-neutral-100 pt-3">
                <h4 className="font-bold text-slate-800 text-[10px] uppercase tracking-wider mb-2">Servicios Disponibles</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {listaServicios.map((service, idx) => (
                    <div key={idx} className="flex items-center space-x-1.5 text-slate-700">
                      <span className="text-orange-500 font-bold">✓</span>
                      <span>{service}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="border-t border-neutral-100 pt-3 mt-3">
                <h4 className="font-bold text-slate-800 text-[10px] uppercase tracking-wider mb-1.5">Descripción de la Propiedad</h4>
                <div
                  className={`text-sm text-slate-900 leading-relaxed whitespace-pre-line ${RICH_TEXT_CLASSES}`}
                  dangerouslySetInnerHTML={{ __html: selectedProperty.description || selectedProperty.descripcion || '' }}
                />
              </div>
            </div>
          </div>

          {/* Ubicación y Mapa Dinámico Responsivo */}
          <div className="bg-white rounded-2xl border border-neutral-100 p-4 sm:p-5 shadow-sm space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider mb-3 pb-2 border-b border-neutral-100">Ubicación</h3>
              <div className="flex items-start space-x-2 text-xs mb-1">
                <span className="text-base mt-0.5">📍</span>
                <div>
                  <strong className="text-slate-800 block">{selectedProperty.direccion}</strong>
                  <span className="text-slate-500">{selectedProperty.location || selectedProperty.localidad}</span>
                </div>
              </div>
            </div>

            <div className="w-full flex-grow min-h-[180px] sm:min-h-[220px] rounded-xl overflow-hidden border border-neutral-200 shadow-inner relative">
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
  onClick={() => window.open(urlGrande, '_blank')}
  className="w-full bg-slate-950 hover:bg-orange-600 text-white font-bold py-2 rounded-lg text-xs transition text-center"
>
  Ver en Google Maps Grande ➔
</button>

          </div>
        </div>

        {/* BLOQUE 3: OBRAS REALIZADAS — sólo cuando la documentación no se muestra ya arriba (BLOQUE 1) */}
        {selectedProperty.comparables?.length > 0 && !mostrarObraArriba && (
          <div className="bg-slate-950 text-white rounded-2xl p-4 sm:p-6 shadow-xl border border-slate-800 w-full mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-4 border-b border-slate-900">
              <div>
                <h3 className="font-extrabold text-sm uppercase tracking-wider text-white m-0">
                  {isRealizada ? '📐 Documentación de la Reforma Realizada' : '📐 Estudio de Obra: Antes y Después'}
                </h3>
                <p className="text-[11px] text-slate-400 mt-1">
                  Así fue el proceso de esta reforma, ambiente por ambiente: antes, durante y resultado final.
                </p>
              </div>
            </div>

            {renderObraShowcase()}

            <div className="mt-4 pt-4 border-t border-slate-900 text-xs text-slate-400 font-light">
              <strong>Historia técnica:</strong> {selectedProperty.reformStory || selectedProperty.historia_reforma}
            </div>

            {isReforma && (
              <div className="mt-4 pt-4 border-t border-slate-900">
              <div className="bg-orange-600/10 border border-orange-600/30 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-xs text-white font-semibold m-0 text-center sm:text-left">
                  ¿Querés una reforma así en tu propiedad? Cotizala gratis.
                </p>
                <button
                  onClick={() => navigateTo('cotizador')}
                  className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2.5 px-5 rounded-xl text-xs transition whitespace-nowrap"
                >
                  Cotizar mi reforma ➔
                </button>
              </div>
              </div>
            )}
          </div>
        )}

        {/* 🎬 MODAL PREMIUM INTEGRADO ADENTRO DEL RETURN (Abajo de todo el layout) */}
        {isModalOpen && (
          <div 
            className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
            onClick={() => setIsModalOpen(false)}
          >
            <button 
              onClick={() => setIsModalOpen(false)} 
              className="absolute top-4 right-4 text-white hover:text-orange-500 text-2xl font-bold bg-slate-900/60 w-10 h-10 rounded-full flex items-center justify-center transition z-50"
            >
              ✕
            </button>

            <div 
              className="relative max-w-5xl max-h-[85vh] flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              {isVideoUrl(selectedProperty.gallery?.[currentGalleryIndex]) ? (
                <video
                  src={selectedProperty.gallery[currentGalleryIndex]}
                  controls
                  autoPlay
                  className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
                />
              ) : (
                <img
                  src={selectedProperty.gallery?.[currentGalleryIndex] || selectedProperty.coverImage}
                  alt="Propiedad Grande"
                  className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
                />
              )}

              {selectedProperty.gallery?.length > 1 && (
                <>
                  <button 
                    onClick={() => setCurrentGalleryIndex(prev => prev === 0 ? selectedProperty.gallery.length - 1 : prev - 1)} 
                    className="absolute left-4 bg-slate-900/80 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold hover:bg-orange-600 transition z-40"
                  >
                    ❮
                  </button>
                  <button 
                    onClick={() => setCurrentGalleryIndex(prev => prev === selectedProperty.gallery.length - 1 ? 0 : prev + 1)} 
                    className="absolute right-4 bg-slate-900/80 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold hover:bg-orange-600 transition z-40"
                  >
                    ❯
                  </button>
                </>
              )}
            </div>
          </div>
        )}

      </div>
    </main>
  );
}