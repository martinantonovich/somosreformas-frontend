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
            video: comp.urlVideo || null
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
            sistemaAgua: prop.sistemaAgua
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

  // 🏗️ Separamos el catálogo comercial (Venta/Alquiler) de las reformas históricas (solo muestra)
  const saleRentProperties = properties.filter(p => p.operation !== 'Reforma');
  const reformProperties = properties.filter(p => p.operation === 'Reforma');

  const triggerToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4500);
  };

  const navigateToDetail = (property) => {
    // 🚀 ALINEACIÓN CON LA URL: Cuando el usuario hace clic normal desde la home, 
    // le inyectamos el slug a la barra de direcciones para que si tira F5 se quede ahí.
    if (property?.slug) {
      window.history.pushState({}, '', `${window.location.origin}/?prop=${property.slug}`);
    }
    setSelectedProperty(property);
    setView('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-slate-800 font-sans flex flex-col">
      {/* 💻 Simulador de navegador */}


      {/* 🏛️ Header estático */}
      <Header setView={setView} setSelectedProperty={setSelectedProperty} view={view} />

      {/* 🔀 Enrutador Dinámico de Vistas */}
      {view === 'home' && (
        <HomeView properties={saleRentProperties} navigateToDetail={navigateToDetail} />
      )}

      {view === 'reformas' && (
        <ReformasView properties={reformProperties} navigateToDetail={navigateToDetail} />
      )}

      {view === 'cotizador' && (
        <CotizadorView triggerToast={triggerToast} setView={setView} />
      )}

      {view === 'detail' && (
        <DetailView 
          selectedProperty={selectedProperty} 
          setView={setView} 
          setSelectedProperty={setSelectedProperty} 
          triggerToast={triggerToast} 
        />
      )}
      
      {view === 'admin' && (
        <AdminView 
          setProperties={setProperties} 
          properties={properties} 
          setView={setView} 
          triggerToast={triggerToast} 
        />
      )}

      {/* ✉️ Footer con Formulario */}
      <Footer setView={setView} triggerToast={triggerToast} />

      {/* Toast Notificación flotante (Si lo tenés maquetado al final) */}
      {toast.show && (
        <div className={`fixed bottom-5 right-5 z-50 p-4 rounded-xl text-white ${toast.type === 'error' ? 'bg-red-600' : 'bg-orange-600'}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}