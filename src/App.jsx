import React, { useState, useEffect } from 'react';
// Podés dejar esta importación por ahora, pero ya no la usaremos como estado inicial
import { INITIAL_PROPERTIES } from './data/properties.js'; 
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import HomeView from './views/HomeView.jsx';
import DetailView from './views/DetailView.jsx';
import AdminView from './views/AdminView.jsx';

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
          
          // 1. Buscamos la portada contemplando cómo Jackson formatea los booleanos (esPortada, es_portada o portada)
          console.log(`📸 Imágenes crudas de la propiedad ${prop.titulo}:`, prop.imagenes);
          const imagenPortadaObj = prop.imagenes?.find(img => 
            img.esPortada === true || img.es_portada === true || img.portada === true
          );
          
          const coverImageUrl = imagenPortadaObj 
            ? (imagenPortadaObj.urlImagen || imagenPortadaObj.url_imagen)
            : 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200';

          // 2. Filtramos el resto de las imágenes excluyendo la que detectamos como portada
          const galeriaUrls = prop.imagenes?.filter(img => 
            !(img.esPortada === true || img.es_portada === true || img.portada === true)
          ).map(img => img.urlImagen || img.url_imagen) || [];
          
          // Si no tiene imágenes secundarias, le metemos la portada para que el carrusel tenga al menos una
          if (galeriaUrls.length === 0) {
            galeriaUrls.push(coverImageUrl);
          }

          // 3. Mapeamos los comparables apuntando al atributo real 'descripcion' de tu Java
          const comparablesMapeados = prop.comparables?.map(comp => ({
            spaceName: comp.nombreEspacio || 'Espacio Principal', // Machea con tu getter de Java
            before: comp.urlAntes,
            after: comp.urlDespues,
            description: comp.descripcion || 'Transformación integral realizada por Somos Reformas.' // 👈 Apunta a comp.descripcion
          })) || [];

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
            
            // 📸 Datos de imágenes relacionales 100% listos
            coverImage: coverImageUrl,
            gallery: galeriaUrls,
            comparables: comparablesMapeados,

            services: {
              cocina: prop.servicioCocina,
              aguaCaliente: prop.servicioAguaCaliente,
              electricidad: prop.servicioElectricidad,
              pavimento: prop.servicioPavimento,
              cable: prop.servicioCable,
              gasNatural: prop.servicioGasNatural,
              cloaca: prop.servicioCloaca,
              internet: prop.servicioInternet
            }
          };
        });
        console.log("🔍 PROPIEDADES MAPEADAS DESDE POSTGRES:", mappedProperties);
        setProperties(mappedProperties);
      })
      .catch(error => {
        console.error("Error conectando a la API:", error);
        triggerToast("No se pudo conectar con el servidor de datos.", "error");
      });
  }, []); // El array vacío asegura que esto corra una sola vez al prender la web

  const triggerToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4500);
  };

  const navigateToDetail = (property) => {
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
        <HomeView properties={properties} navigateToDetail={navigateToDetail} />
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