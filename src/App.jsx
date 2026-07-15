import React, { useState, useEffect } from 'react';
// Podés dejar esta importación por ahora, pero ya no la usaremos como estado inicial
import { INITIAL_PROPERTIES } from './data/properties.js';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import HomeView from './views/HomeView.jsx';
import DetailView from './views/DetailView.jsx';
import AdminView from './views/AdminView.jsx';
import ReformasView from './views/ReformasView.jsx';
import CotizadorView from './views/CotizadorView.jsx';

export default function App() {
  const [view, setView] = useState('home'); 
  const [selectedProperty, setSelectedProperty] = useState(null);
  
  // Arrancamos con el estado de propiedades vacío ([]) esperando al backend
  const [properties, setProperties] = useState([]);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8090';

  // 🧭 Mapeo único entre pantallas y URLs, usado tanto para navegar como para leer la URL
  const pathByView = { home: '/', reformas: '/reformas', cotizador: '/cotizador', admin: '/admin' };

  // 🌐 Toda navegación pasa por acá: cambia la pantalla Y la URL a la vez (soporta atrás/adelante del navegador)
  const navigateTo = (viewName, property = null) => {
    const url = viewName === 'detail' && property?.slug
      ? `${window.location.origin}/?prop=${property.slug}`
      : `${window.location.origin}${pathByView[viewName] || '/'}`;
    window.history.pushState({}, '', url);
    setSelectedProperty(property);
    setView(viewName);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 🔙 Soporte para los botones Atrás/Adelante del navegador: re-derivamos la pantalla desde la URL actual
  useEffect(() => {
    const handlePopState = () => {
      const { pathname, search } = window.location;
      const params = new URLSearchParams(search);
      const propSlug = params.get('prop');
      const propId = params.get('propId');

      if (propSlug || propId) {
        const propiedadEncontrada = propSlug
          ? properties.find(p => p.slug === propSlug.trim())
          : properties.find(p => p.id === parseInt(propId));
        if (propiedadEncontrada) {
          setSelectedProperty(propiedadEncontrada);
          setView('detail');
          return;
        }
      }

      const viewFromPath = Object.keys(pathByView).find(key => pathByView[key] === pathname) || 'home';
      setSelectedProperty(null);
      setView(viewFromPath);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [properties]);

  // 🌱 Al cargar la página por primera vez, si la URL ya apunta a /reformas, /cotizador o /admin,
  // arrancamos directo ahí (el caso de /?prop= se resuelve más abajo una vez que llegan las propiedades)
  useEffect(() => {
    const viewFromPath = Object.keys(pathByView).find(key => pathByView[key] === window.location.pathname);
    if (viewFromPath && viewFromPath !== 'home') setView(viewFromPath);
  }, []);

  // 🔌 CONEXIÓN AL BACKEND: Traemos las propiedades reales al cargar la app
  useEffect(() => {
    fetch(`${apiUrl}/api/propiedades`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Error en la respuesta del servidor');
        }
        return response.json();
      })
      .then(data => {
        const mappedProperties = data.map(prop => {
          
          // 1. Buscamos la portada contemplando cómo Jackson formatea los booleanos
          const imagenPortadaObj = prop.imagenes?.find(img => 
            img.esPortada === true || img.es_portada === true || img.portada === true
          );
          
          const coverImageUrl = imagenPortadaObj 
            ? (imagenPortadaObj.urlImagen || imagenPortadaObj.url_imagen)
            : 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200';

          // 2. Filtramos el resto de las imágenes excluyendo la portada
          const galeriaUrls = prop.imagenes?.filter(img => 
            !(img.esPortada === true || img.es_portada === true || img.portada === true)
          ).map(img => img.urlImagen || img.url_imagen) || [];
          
          if (galeriaUrls.length === 0) {
            galeriaUrls.push(coverImageUrl);
          }

          // 3. Mapeamos los comparables
          const comparablesMapeados = prop.comparables?.map(comp => ({
            spaceName: comp.nombreEspacio || 'Espacio Principal',
            before: comp.urlAntes,
            after: comp.urlDespues,
            description: comp.descripcion || 'Transformación integral realizada por Somos Reformas.',
            video: comp.urlVideo || null,
            procesoMedia: (comp.procesoMedia || []).map(m => ({
              url: m.urlMedia,
              tipo: m.tipoMedia,
              descripcion: m.descripcion || ''
            }))
          })) || [];

          // Retornamos el formato exacto que tus vistas HomeView y DetailView consumen
          return {
            id: prop.id,
            title: prop.titulo,
            slug: prop.slug,
            price: prop.precio,
            location: prop.localidad,
            operation: prop.operacion,
            type: prop.tipo,
            rooms: prop.ambientes,
            beds: prop.dormitorios,
            baths: prop.banos,
            sizeTotal: prop.m2Totales,
            sizeCovered: prop.m2Cubiertos,
            sizeSemiCovered: prop.m2Semicubiertos || 0,
            sizeUncovered: prop.m2Descubiertos || 0,
            floor: prop.pisoPlanta || 'PB',
            bankEligible: prop.aptoBanco ? 'Sí' : 'No',
            direccion: prop.direccion,
            description: prop.descripcion,
            reformStory: prop.historiaReforma,
            latitud: prop.latitud,
            longitud: prop.longitud,
            coverImage: coverImageUrl,
            gallery: galeriaUrls,
            comparables: comparablesMapeados,
            services: {
              electricidad: prop.servicioElectricidad,
              gasNatural: prop.servicioGasNatural,
              cloaca: prop.servicioCloaca
            },
            estadoActual: prop.estadoActual,
            antiguedad: prop.antiguedad,
            orientacion: prop.orientacion,
            cochera: prop.cochera ? 'Sí' : 'No',
            calefaccion: prop.calefaccion,
            sistemaAgua: prop.sistemaAgua,
            estadoReforma: prop.estadoReforma || null
          };
        });

        // Guardamos la lista completa mapeada en tu estado global
        setProperties(mappedProperties);
        // 🎯 DEEP LINKING INTERCEPTOR: Soporta ID tradicional y Slug amigable
        const urlParams = new URLSearchParams(window.location.search);
        const propSlug = urlParams.get('prop');   // 👈 Captura el nuevo parámetro de texto
        const propId = urlParams.get('propId'); // Mantener soporte para los links viejos
        
        if (propSlug) {
          // Búsqueda por Slug (texto amigable)
          const propiedadEncontrada = mappedProperties.find(p => p.slug === propSlug.trim());
          if (propiedadEncontrada) {
            setSelectedProperty(propiedadEncontrada);
            setView('detail');
          }
        } else if (propId) {
          // Búsqueda por ID tradicional (Retrocompatibilidad por si quedó un link viejo en WhatsApp/Mail)
          const propiedadEncontrada = mappedProperties.find(p => p.id === parseInt(propId));
          if (propiedadEncontrada) {
            setSelectedProperty(propiedadEncontrada);
            setView('detail');
          }
        }
      })
      .catch(error => {
        console.error("Error cargando propiedades en el inicio:", error);
      });
  }, []); // Se ejecuta una sola vez al montar la aplicación

  // 🏗️ El catálogo comercial (Venta/Alquiler) y las reformas (En Proceso/Realizada) ya no son excluyentes:
  // una reforma Realizada puede estar también en venta/alquiler si todavía no se vendió.
  const saleRentProperties = properties.filter(p => p.operation === 'Venta' || p.operation === 'Alquiler');
  const reformasEnProceso = properties.filter(p => p.estadoReforma === 'EN_PROCESO');
  const reformasRealizadas = properties.filter(p => p.estadoReforma === 'REALIZADA');

  // 📊 GA4 no detecta solo los cambios de sección porque esta SPA no cambia la URL al navegar
  // entre pestañas (salvo al entrar al detalle de una propiedad). Mandamos el pageview a mano.
  useEffect(() => {
    if (typeof window.gtag !== 'function') return;

    const pathByView = {
      home: '/',
      reformas: '/reformas',
      cotizador: '/cotizador',
      detail: selectedProperty?.slug ? `/?prop=${selectedProperty.slug}` : '/detalle',
      admin: '/admin'
    };
    const titleByView = {
      home: 'Propiedades Disponibles',
      reformas: 'Reformas',
      cotizador: 'Cotizá tu Reforma',
      detail: selectedProperty?.title ? `Detalle: ${selectedProperty.title}` : 'Detalle de propiedad',
      admin: 'Admin'
    };

    window.gtag('event', 'page_view', {
      page_path: pathByView[view] || `/${view}`,
      page_title: titleByView[view] || view
    });
  }, [view, selectedProperty]);

  const triggerToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4500);
  };

  const navigateToDetail = (property) => navigateTo('detail', property);

  return (
    <div className="min-h-screen bg-neutral-50 text-slate-800 font-sans flex flex-col">
      {/* 💻 Simulador de navegador */}


      {/* 🏛️ Header estático */}
      <Header navigateTo={navigateTo} view={view} />

      {/* 🔀 Enrutador Dinámico de Vistas */}
      {view === 'home' && (
        <HomeView properties={saleRentProperties} navigateToDetail={navigateToDetail} />
      )}

      {view === 'reformas' && (
        <ReformasView enProceso={reformasEnProceso} realizadas={reformasRealizadas} navigateToDetail={navigateToDetail} />
      )}

      {view === 'cotizador' && (
        <CotizadorView triggerToast={triggerToast} navigateTo={navigateTo} />
      )}

      {view === 'detail' && (
        <DetailView
          selectedProperty={selectedProperty}
          navigateTo={navigateTo}
          triggerToast={triggerToast}
        />
      )}

      {view === 'admin' && (
        <AdminView
          setProperties={setProperties}
          properties={properties}
          navigateTo={navigateTo}
          triggerToast={triggerToast}
        />
      )}

      {/* ✉️ Footer con Formulario */}
      <Footer navigateTo={navigateTo} triggerToast={triggerToast} />

      {/* Toast Notificación flotante (Si lo tenés maquetado al final) */}
      {toast.show && (
        <div className={`fixed bottom-5 right-5 z-50 p-4 rounded-xl text-white ${toast.type === 'error' ? 'bg-red-600' : 'bg-orange-600'}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}