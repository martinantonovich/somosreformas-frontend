import React, { useState, useEffect } from 'react';

export default function AdminView({ setProperties, properties, setView, triggerToast }) {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');
  
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8090';

  useEffect(() => {
    const loggedUser = localStorage.getItem('reformas_admin_session');
    if (loggedUser) setIsAdminLoggedIn(true);
  }, []);
  
  // 🎯 ESTADO TOTALMENTE ALINEADO A LA NUEVA ESPECIFICACIÓN
  const [newProp, setNewProp] = useState({
    title: '', 
    price: '',              // En USD si es venta, en ARS si es alquiler
    expensas: '0',          // Solo Alquiler
    location: 'La Plata, Buenos Aires',
    operation: 'Venta',     // 'Venta', 'Alquiler' o 'No Disponible'
    estadoReforma: '',      // '', 'EN_PROCESO' o 'REALIZADA' (independiente de operation)
    type: 'Departamento',
    address: '', 
    latitud: '', 
    longitud: '',
    rooms: '3', 
    beds: '2', 
    baths: '1', 
    sizeBuilt: '', 
    sizeTotal: '', 
    sizeSemiCovered: '0', 
    sizeUncovered: '0',
    floor: 'PB', 
    estadoActual: 'Excelente',
    antiguedad: '',
    orientacion: 'Norte',
    cochera: 'No',
    bankEligible: 'Sí',     // Apto Crédito (Solo Venta)
    
    // Servicios (Booleanos o Strings según tu especificación)
    servLuz: true,
    servGas: true,
    servAgua: true,
    calefaccion: 'Estufa',   // String para indicar aire o estufa
    sistemaAgua: 'Calefón',  // String para termotanque, calefon, etc
    
    description: '', 
    reformStory: '',
    coverImage: '', 
    galleryUrls: '', 
    existingImages: [], 
    comparables: []          // Solo Venta usa esto
  });

  const [isUploading, setIsUploading] = useState(false);

  // 📸 FUNCIÓN MULTIMEDIA COMPLETA CLOUDINARY
  const uploadImagesToCloudinary = async (e, field, index = null) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const cloudName = "dldibpwyr";
    const uploadPreset = "somos_reformas_preset";
    const isProcesoMedia = field === 'procesoMedia';
    const resourceType = field === 'compVideo' ? 'video' : 'image';

    try {
      const archivosVacios = Array.from(files).filter(f => f.size === 0).map(f => f.name);
      if (archivosVacios.length > 0) {
        throw new Error(`El archivo "${archivosVacios[0]}" llegó vacío (0 bytes) al navegador. Probá guardarlo de nuevo (ej. re-exportar o re-descargar la imagen) y volvé a subirlo.`);
      }

      const uploadPromises = Array.from(files).map(async (file) => {
        console.log(`📤 Subiendo "${file.name}" (${(file.size / 1024).toFixed(0)} KB, ${file.type})`);
        const fileResourceType = isProcesoMedia
          ? (file.type.startsWith('video') ? 'video' : 'image')
          : resourceType;

        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", uploadPreset);

        const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${fileResourceType}/upload`, {
          method: "POST",
          body: formData
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          console.error(`❌ Cloudinary rechazó "${file.name}":`, errorData);
          throw new Error(errorData?.error?.message ? `"${file.name}": ${errorData.error.message}` : "Error en la subida a Cloudinary");
        }
        const data = await response.json();
        return isProcesoMedia ? { url: data.secure_url, tipo: fileResourceType === 'video' ? 'video' : 'imagen', descripcion: '' } : data.secure_url;
      });

      const uploadedResults = await Promise.all(uploadPromises);
      const uploadedUrls = uploadedResults;

      if (field === 'coverImage') {
        setNewProp(prev => ({ ...prev, coverImage: uploadedUrls[0] }));
        triggerToast("¡Foto de portada actualizada!", "success");
      } else if (field === 'galleryUrls') {
        setNewProp(prev => {
          const currentUrls = prev.galleryUrls ? prev.galleryUrls.split(',').map(u => u.trim()).filter(Boolean) : [];
          const combined = [...currentUrls, ...uploadedUrls].join(', ');
          return { ...prev, galleryUrls: combined };
        });
        triggerToast(`¡${uploadedUrls.length} imágenes añadidas!`, "success");
      } else if (field === 'compBefore' && index !== null) {
        setNewProp(prev => {
          const updatedComps = [...prev.comparables];
          updatedComps[index].before = uploadedUrls[0];
          return { ...prev, comparables: updatedComps };
        });
      } else if (field === 'compAfter' && index !== null) {
        setNewProp(prev => {
          const updatedComps = [...prev.comparables];
          updatedComps[index].after = uploadedUrls[0];
          return { ...prev, comparables: updatedComps };
        });
      } else if (field === 'procesoMedia' && index !== null) {
        setNewProp(prev => {
          const updatedComps = [...prev.comparables];
          const current = updatedComps[index].procesoMedia || [];
          updatedComps[index] = { ...updatedComps[index], procesoMedia: [...current, ...uploadedResults] };
          return { ...prev, comparables: updatedComps };
        });
        triggerToast(`¡${uploadedResults.length} archivo(s) de proceso añadidos!`, "success");
      }
    } catch (error) {
      console.error(error);
      triggerToast(error.message || "Error multimedia.", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const addComparableSpace = () => {
    setNewProp(prev => ({
      ...prev,
      comparables: [...prev.comparables, { spaceName: '', before: '', after: '', descripcion: '', video: '', procesoMedia: [] }]
    }));
  };

  const removeComparableSpace = (index) => {
    setNewProp(prev => ({ ...prev, comparables: prev.comparables.filter((_, i) => i !== index) }));
  };

  const handleComparableChange = (index, key, value) => {
    setNewProp(prev => {
      const updatedComps = [...prev.comparables];
      updatedComps[index][key] = value;
      return { ...prev, comparables: updatedComps };
    });
  };

  const removeProcesoMedia = (compIndex, mediaIndex) => {
    setNewProp(prev => {
      const updatedComps = [...prev.comparables];
      updatedComps[compIndex] = {
        ...updatedComps[compIndex],
        procesoMedia: updatedComps[compIndex].procesoMedia.filter((_, i) => i !== mediaIndex)
      };
      return { ...prev, comparables: updatedComps };
    });
  };

  const updateProcesoMediaCaption = (compIndex, mediaIndex, text) => {
    setNewProp(prev => {
      const updatedComps = [...prev.comparables];
      const list = [...updatedComps[compIndex].procesoMedia];
      list[mediaIndex] = { ...list[mediaIndex], descripcion: text };
      updatedComps[compIndex] = { ...updatedComps[compIndex], procesoMedia: list };
      return { ...prev, comparables: updatedComps };
    });
  };

  // 🚀 ENVÍO ESTRUCTURADO HACIA SPRING BOOT
  const handleFormSubmit = (e) => {
    e.preventDefault();
    
    // Consolidamos todas las URLs de imágenes del formulario
    let listaCompletaUrls = [...(newProp.existingImages || [])];
    
    if (newProp.galleryUrls?.trim()) {
      newProp.galleryUrls.split(',').forEach(url => {
        if (url.trim() && !listaCompletaUrls.includes(url.trim())) {
          listaCompletaUrls.push(url.trim());
        }
      });
    }

    // 🎯 REGLA DE NEGOCIO: La primera de la lista pasa a ser la de Portada (esPortada = true)
    // El resto se insertan como secundarias (esPortada = false)
    const imagenesPayload = [];
    listaCompletaUrls.forEach((url, index) => {
      if (index === 0) {
        imagenesPayload.push({ urlImagen: url, esPortada: true });
        // Se duplica al principio de las secundarias para que el carrusel público la contenga
        imagenesPayload.push({ urlImagen: url, esPortada: false });
      } else {
        imagenesPayload.push({ urlImagen: url, esPortada: false });
      }
    });

    const comparablesPayload = newProp.estadoReforma
      ? newProp.comparables
          .filter(c => c.spaceName?.trim() && (c.before?.trim() || c.after?.trim() || c.procesoMedia?.length > 0))
          .map(c => ({
            nombreEspacio: c.spaceName || 'Espacio Común',
            urlAntes: c.before?.trim() || null,
            urlDespues: c.after?.trim() || null,
            descripcion: c.descripcion?.trim() || "Reforma premium por Somos Reformas.",
            procesoMedia: (c.procesoMedia || []).filter(m => m.url).map(m => ({
              urlMedia: m.url,
              tipoMedia: m.tipo,
              descripcion: m.descripcion?.trim() || null
            }))
          }))
      : [];

    const propertyPayload = {
      titulo: newProp.title,
      slug: newProp.title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-'),
      precio: parseFloat(newProp.price) || 0,
      expensas: newProp.operation === 'Alquiler' ? parseFloat(newProp.expensas) : 0,
      localidad: newProp.location,
      operacion: newProp.operation,
      tipo: newProp.type,
      direccion: newProp.address,
      pisoPlanta: newProp.floor,
      latitud: parseFloat(newProp.latitud) || null,
      longitud: parseFloat(newProp.longitud) || null,
      ambientes: parseInt(newProp.rooms) || 1,
      dormitorios: parseInt(newProp.beds) || 0,
      banos: parseInt(newProp.baths) || 1,
      m2Cubiertos: parseInt(newProp.sizeBuilt || 0),
      m2Totales: parseInt(newProp.sizeTotal || 0),
      m2Semicubiertos: parseInt(newProp.sizeSemiCovered || 0),
      m2Descubiertos: parseInt(newProp.sizeUncovered || 0),
      estadoActual: newProp.estadoActual,
      antiguedad: parseInt(newProp.antiguedad) || 0,
      orientacion: newProp.orientacion,
      cochera: newProp.cochera === 'Sí',
      aptoBanco: newProp.operation === 'Venta' ? (newProp.bankEligible === 'Sí') : false,
      servicioElectricidad: newProp.servLuz,
      servicioGasNatural: newProp.servGas,
      servicioCloaca: newProp.servAgua,
      calefaccion: newProp.calefaccion,
      sistemaAgua: newProp.sistemaAgua,
      descripcion: newProp.description,
      historiaReforma: newProp.estadoReforma ? newProp.reformStory : '',
      estadoReforma: newProp.estadoReforma || null,
      imagenes: imagenesPayload,
      comparables: comparablesPayload
    };

    const url = isEditing ? `${apiUrl}/api/propiedades/${editingId}` : `${apiUrl}/api/propiedades`;
    console.log("✈️ ENVIANDO A URL:", url, "CON ID DE EDICIÓN:", editingId);

    fetch(url, {
      method: isEditing ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(propertyPayload)
    })
    .then(res => { 
      if (!res.ok) throw new Error("Error en la respuesta del servidor."); 
      return res.json(); 
    })
.then((savedProperty) => {
      triggerToast(isEditing ? "¡Propiedad modificada con éxito!" : "¡Propiedad publicada con éxito!", "success");
      
      // 📸 1. Extracción ultra segura de la portada contemplando cómo Jackson formatea los booleanos
      const imagenPortadaObj = savedProperty.imagenes?.find(img => 
        img.esPortada === true || img.es_portada === true || img.portada === true
      );
      const primaryImg = imagenPortadaObj 
        ? (imagenPortadaObj.urlImagen || imagenPortadaObj.url_imagen)
        : listaCompletaUrls[0];

      // 📸 2. Filtramos el resto de las imágenes excluyendo la portada para evitar duplicados desordenados
      const filtradasSinPortada = savedProperty.imagenes?.filter(img => 
        !(img.esPortada === true || img.es_portada === true || img.portada === true)
      ).map(img => img.urlImagen || img.url_imagen).filter(Boolean) || listaCompletaUrls.slice(1);

      // 🎯 Regla de negocio: Forzamos que la foto de portada quede siempre como primera en la galería secundaria
      const galleryFinal = [primaryImg, ...filtradasSinPortada.filter(url => url !== primaryImg)];

      // 📐 3. Mapeo seguro de comparables (Antes y Después) resolviendo las propiedades en inglés/español
      const comparablesFinal = (savedProperty.comparables || []).map(c => ({
        spaceName: c.spaceName || c.nombreEspacio || c.nombre_espacio || 'Espacio Principal',
        before: c.before || c.urlAntes || c.url_antes || '',
        after: c.after || c.urlDespues || c.url_despues || '',
        description: c.description || c.descripcion || 'Transformación integral realizada por Somos Reformas.',
        video: c.video || c.urlVideo || c.url_video || null,
        procesoMedia: (c.procesoMedia || []).map(m => ({
          url: m.urlMedia || m.url_media,
          tipo: m.tipoMedia || m.tipo_media || 'imagen',
          descripcion: m.descripcion || ''
        }))
      }));

      // Sincronizamos con el formato exacto en inglés que App.jsx distribuye a HomeView y DetailView
      const formattedProperty = {
        id: savedProperty.id,
        title: savedProperty.titulo || savedProperty.title,
        slug: savedProperty.slug,
        price: savedProperty.precio || savedProperty.price,
        location: savedProperty.localidad || savedProperty.location,
        operation: savedProperty.operacion || savedProperty.operation,
        type: savedProperty.tipo || savedProperty.type,
        rooms: savedProperty.ambientes || savedProperty.rooms,
        beds: savedProperty.dormitorios || savedProperty.beds,
        baths: savedProperty.banos || savedProperty.baths,
        sizeTotal: savedProperty.m2Totales || savedProperty.sizeTotal,
        sizeCovered: savedProperty.m2Cubiertos || savedProperty.sizeCovered,
        sizeSemiCovered: savedProperty.m2Semicubiertos || savedProperty.sizeSemiCovered || 0,
        sizeUncovered: savedProperty.m2Descubiertos || savedProperty.sizeUncovered || 0,
        floor: savedProperty.pisoPlanta || savedProperty.floor || 'PB',
        bankEligible: savedProperty.aptoBanco === true || savedProperty.bankEligible === 'Sí' ? 'Sí' : 'No',
        direccion: savedProperty.direccion || savedProperty.address,
        description: savedProperty.descripcion || savedProperty.description,
        reformStory: savedProperty.historiaReforma || savedProperty.reformStory,
        latitud: savedProperty.latitud,
        longitud: savedProperty.longitud,
        coverImage: primaryImg,
        gallery: galleryFinal,
        comparables: comparablesFinal,
        services: {
          electricidad: savedProperty.servicioElectricidad ?? savedProperty.services?.electricidad ?? true,
          gasNatural: savedProperty.servicioGasNatural ?? savedProperty.services?.gasNatural ?? true,
          cloaca: savedProperty.servicioCoalca ?? savedProperty.services?.cloaca ?? true
        },
        estadoActual: savedProperty.estadoActual,
        antiguedad: savedProperty.antiguedad,
        orientacion: savedProperty.orientacion,
        cochera: savedProperty.cochera === true || savedProperty.cochera === 'Sí' ? 'Sí' : 'No',
        calefaccion: savedProperty.calefaccion,
        sistemaAgua: savedProperty.sistemaAgua,
        estadoReforma: savedProperty.estadoReforma || null
      };

      if (isEditing) {
        setProperties(properties.map(p => p.id === editingId ? formattedProperty : p));
      } else {
        setProperties([formattedProperty, ...properties]);
      }
      
      setIsEditing(false);
      setEditingId(null);
      setView('home'); 
    })
    .catch((err) => {
      console.error(err);
      triggerToast("Error al guardar.", "error");
    });
  };

  // ✕ REMOVER UNA SOLA IMAGEN DE LA GALERÍA
  const handleRemoveImage = (urlToRemove) => {
    if (!urlToRemove) return;
    setNewProp(prev => {
      const filtradas = (prev.existingImages || []).filter(img => {
        const urlStr = typeof img === 'string' ? img : (img.urlImagen || img.url_imagen || '');
        return urlStr.trim() !== urlToRemove.trim();
      });
      return { ...prev, existingImages: filtradas };
    });
    triggerToast("Foto removida de la galería", "info");
  };
  
  // 📝 PREPARACIÓN AUTOMÁTICA DEL FORMULARIO DE EDICIÓN
  const handleStartEdit = (prop) => {
    setIsEditing(true);
    setEditingId(prop.id);
    
    // 📸 Extraemos las URLs limpias como strings planos sin importar el formato
    const rawImages = prop.imagenes || [];
    const coverObj = rawImages.find(img => img.esPortada === true || img.portada === true);
    const coverUrl = prop.coverImage || coverObj?.urlImagen || '';

    const todasLasFotos = [];
    if (coverUrl && coverUrl.trim()) todasLasFotos.push(coverUrl.trim());
    
    // Sumamos la galería asegurando strings limpios
    const galleryUrls = prop.gallery || [];
    galleryUrls.forEach(url => {
      if (url && typeof url === 'string' && url.trim() !== coverUrl.trim()) {
        todasLasFotos.push(url.trim());
      }
    });

    const formattedComps = (prop.comparables || []).map(c => ({
      spaceName: c.spaceName || '',
      before: c.before || '',
      after: c.after || '',
      descripcion: c.description || c.descripcion || '',
      video: c.video || '',
      procesoMedia: c.procesoMedia || []
    }));

    setNewProp({
      title: prop.title || '',
      price: (prop.price ?? '').toString(),
      expensas: (prop.expensas ?? '0').toString(),
      location: prop.location || 'La Plata, Buenos Aires',
      operation: prop.operation || 'Venta', // Garantiza leer el formato de App.jsx
      estadoReforma: prop.estadoReforma || '',
      type: prop.type || 'Departamento',
      address: prop.direccion || '',
      latitud: prop.latitud ? prop.latitud.toString() : '',
      longitud: prop.longitud ? prop.longitud.toString() : '',
      rooms: (prop.rooms ?? '1').toString(),
      beds: (prop.beds ?? '0').toString(),
      baths: (prop.baths ?? '1').toString(),
      sizeBuilt: (prop.sizeCovered || prop.sizeBuilt || '').toString(),
      sizeTotal: (prop.sizeTotal ?? '').toString(),
      sizeSemiCovered: (prop.sizeSemiCovered ?? '0').toString(),
      sizeUncovered: (prop.sizeUncovered ?? '0').toString(),
      floor: prop.floor || 'PB',
      estadoActual: prop.estadoActual || 'Excellent',
      // antiguedad: prop.antiguedad ? prop.antiguedad.toString() : '',
      // Buscá esta línea exacta adentro del setNewProp de handleStartEdit:
      antiguedad: (prop.antiguedad !== null && prop.antiguedad !== undefined) ? prop.antiguedad.toString() : '',
      orientacion: prop.orientacion || 'Norte',
      cochera: prop.cochera === true || prop.cochera === 'Sí' ? 'Sí' : 'No',
      bankEligible: prop.bankEligible || 'Sí',
      
      servLuz: prop.services?.electricidad ?? true,
      servGas: prop.services?.gasNatural ?? true,
      servAgua: prop.services?.cloaca ?? true,
      
      calefaccion: prop.calefaccion || 'Estufa',
      sistemaAgua: prop.sistemaAgua || 'Calefón',
      description: prop.description || '',
      reformStory: prop.reformStory || '',
      
      existingImages: todasLasFotos, // Colección limpia de strings planos
      galleryUrls: '',
      coverImage: coverUrl,
      comparables: formattedComps
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ✓ Atajo para pasar una reforma "En Proceso" a "Realizada": precarga el form de edición
  // ya con el estado cambiado, para que el admin revise/complete la foto de "después" antes de guardar
  const handleMarkAsRealizada = (p) => {
    handleStartEdit(p);
    setNewProp(prev => ({ ...prev, estadoReforma: 'REALIZADA' }));
    triggerToast('Revisá la foto de "después" de cada ambiente y guardá para confirmar.', 'info');
  };

  const handleAdminLoginSubmit = (e) => {
    e.preventDefault();
    setAdminError('');
    fetch(`${apiUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: adminUsername, password: adminPassword })
    })
    .then(res => { if (!res.ok) throw new Error(); return res.json(); })
    .then(data => {
      if (data.rol === 'admin' || data.rol === 'ADMIN') {
        localStorage.setItem('reformas_admin_session', JSON.stringify(data));
        setIsAdminLoggedIn(true);
      } else setAdminError("Acceso denegado.");
    })
    .catch(() => setAdminError("Error de autenticación."));
  };

  const handleDeleteProperty = (id) => {
    if (window.confirm("¿Estás seguro de que querés eliminar esta propiedad? Se borrarán también todas sus fotos.")) {
      fetch(`${apiUrl}/api/propiedades/${id}`, { 
        method: 'DELETE' 
      })
      .then(response => {
        if (!response.ok) throw new Error();
        // Filtramos el estado local para que desaparezca de la tabla al instante
        setProperties(properties.filter(p => p.id !== id));
        triggerToast("Propiedad eliminada correctamente.", "success");
      })
      .catch(() => triggerToast("Error al intentar eliminar la propiedad.", "error"));
    }
  };

  return (
    <main className="flex-grow py-6 sm:py-8 bg-slate-950 text-slate-100 text-left min-h-screen">
      <div className="max-w-6xl mx-auto px-4">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800 pb-4 sm:pb-6 mb-6 sm:mb-8 gap-4">
          <div>
            <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest block mb-1">Estudio & Gestión</span>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white m-0">Administración de Catálogo</h1>
          </div>
          <button onClick={() => setView('home')} className="w-full sm:w-auto text-center px-4 py-2.5 bg-slate-900 text-slate-300 rounded-lg text-xs font-bold transition">
            Cerrar Panel
          </button>
        </div>

        {!isAdminLoggedIn ? (
          <div className="max-w-md mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
            <h3 className="font-bold text-white text-center mb-4">🔐 Autenticación</h3>
            {adminError && <div className="bg-red-900/30 border border-red-800 p-2.5 rounded text-xs text-red-400 text-center mb-3">{adminError}</div>}
            <form onSubmit={handleAdminLoginSubmit} className="space-y-3 text-xs">
              <input type="email" autoComplete="off" value={adminUsername} onChange={(e) => setAdminUsername(e.target.value)} className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-white" placeholder="Usuario" />
              <input type="password" autoComplete="new-password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-white" placeholder="Contraseña" />
              <button type="submit" className="w-full bg-orange-600 p-3 rounded-xl font-bold uppercase text-white">Entrar</button>
            </form>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            
            {/* 🛠️ FORMULARIO DE CARGA/EDICIÓN */}
            <div className="lg:col-span-1 bg-slate-900 border border-slate-800 p-4 sm:p-5 rounded-2xl shadow-xl space-y-4 h-fit">
              <h3 className="font-extrabold text-white text-xs uppercase tracking-wider border-b border-slate-800 pb-2 m-0">
                {isEditing ? '📝 Editar Publicación' : '✨ Nueva Publicación'}
              </h3>

              <form onSubmit={handleFormSubmit} className="space-y-3 text-xs text-slate-300">
                
                {/* Tipo de Operación: Gatillo de cambio estructural */}
                <div>
                  <label className="block text-[10px] font-bold uppercase text-orange-400 mb-1">Tipo de Operación</label>
                  <select value={newProp.operation} onChange={(e) => setNewProp({...newProp, operation: e.target.value})} className="w-full bg-slate-950 border border-orange-500/30 rounded-lg p-2 font-bold text-white">
                    <option value="Venta">Venta (Maneja USD)</option>
                    <option value="Alquiler">Alquiler (Maneja ARS y Expensas)</option>
                    <option value="No Disponible">No Disponible (No se vende ni alquila)</option>
                  </select>
                </div>

                {/* ¿Es una reforma? Independiente de la operación: una reforma Realizada puede además estar en Venta/Alquiler */}
                <div>
                  <label className="block text-[10px] font-bold uppercase text-orange-400 mb-1">¿Es una reforma?</label>
                  <select value={newProp.estadoReforma || ''} onChange={(e) => setNewProp({...newProp, estadoReforma: e.target.value})} className="w-full bg-slate-950 border border-orange-500/30 rounded-lg p-2 font-bold text-white">
                    <option value="">No es una reforma</option>
                    <option value="EN_PROCESO">En Proceso (mostrando avance de obra)</option>
                    <option value="REALIZADA">Realizada (obra terminada)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Título comercial</label>
                  <input type="text" required placeholder="Ej: PH Remodelado a Nuevo" value={newProp.title || ''} onChange={(e) => setNewProp({...newProp, title: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white" />
                </div>

                {/* Bloque de Precios Dinámico: sólo aplica si está en Venta o Alquiler */}
                {(newProp.operation === 'Venta' || newProp.operation === 'Alquiler') && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                        {newProp.operation === 'Venta' ? 'Valor (USD)' : 'Valor Mensual (ARS)'}
                      </label>
                      <input type="number" required placeholder="Valor" value={newProp.price || ''} onChange={(e) => setNewProp({...newProp, price: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-mono font-bold" />
                    </div>
                    <div>
                      {newProp.operation === 'Alquiler' ? (
                        <>
                          <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Expensas (ARS)</label>
                          <input type="number" placeholder="0" value={newProp.expensas || ''} onChange={(e) => setNewProp({...newProp, expensas: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-mono" />
                        </>
                      ) : (
                        <>
                          <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Apto Crédito</label>
                          <select value={newProp.bankEligible} onChange={(e) => setNewProp({...newProp, bankEligible: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white">
                            <option value="Sí">Sí</option>
                            <option value="No">No</option>
                          </select>
                        </>
                      )}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Localidad</label>
                    <input type="text" required value={newProp.location || ''} onChange={(e) => setNewProp({...newProp, location: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Tipo Inmueble</label>
                    <select value={newProp.type} onChange={(e) => setNewProp({...newProp, type: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white">
                      <option value="Departamento">Departamento</option>
                      <option value="PH">PH</option>
                      <option value="Casa">Casa</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Dirección exacta</label>
                    <input type="text" required placeholder="Calle 20 e/ 39 y 40" value={newProp.address || ''} onChange={(e) => setNewProp({...newProp, address: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Piso / Planta</label>
                    <input type="text" required value={newProp.floor || ''} onChange={(e) => setNewProp({...newProp, floor: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white" />
                  </div>
                </div>

                {/* Coordenadas Geográficas fijas */}
                <div className="grid grid-cols-2 gap-2 bg-slate-950/40 p-2 rounded-xl border border-slate-800/50">
                  <div>
                    <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">Latitud (Mapa)</label>
                    <input type="number" step="any" placeholder="-34.9292" value={newProp.latitud || ''} onChange={(e) => setNewProp({...newProp, latitud: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-white text-[11px]" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">Longitud (Mapa)</label>
                    <input type="number" step="any" placeholder="-57.9372" value={newProp.longitud || ''} onChange={(e) => setNewProp({...newProp, longitud: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-white text-[11px]" />
                  </div>
                </div>

                {/* Estructura Interna */}
                <div className="grid grid-cols-4 gap-1.5">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 mb-0.5">Amb.</label>
                    <input type="number" value={newProp.rooms || ''} onChange={(e) => setNewProp({...newProp, rooms: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-white text-center" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 mb-0.5">Dorm.</label>
                    <input type="number" value={newProp.beds || ''} onChange={(e) => setNewProp({...newProp, beds: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-white text-center" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 mb-0.5">Baños</label>
                    <input type="number" value={newProp.baths || ''} onChange={(e) => setNewProp({...newProp, baths: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-white text-center" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 mb-0.5">Cochera</label>
                    <select value={newProp.cochera} onChange={(e) => setNewProp({...newProp, cochera: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-1 text-white text-center">
                      <option value="Sí">Sí</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                </div>

                {/* Métricas de Superficie */}
                <div className="grid grid-cols-4 gap-1">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 mb-0.5">Cub M²</label>
                    <input type="number" required placeholder="60" value={newProp.sizeBuilt || ''} onChange={(e) => setNewProp({...newProp, sizeBuilt: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-1 text-white text-center" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 mb-0.5">Semic M²</label>
                    <input type="number" value={newProp.sizeSemiCovered || '0'} onChange={(e) => setNewProp({...newProp, sizeSemiCovered: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-1 text-white text-center" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 mb-0.5">Desc M²</label>
                    <input type="number" value={newProp.sizeUncovered || '0'} onChange={(e) => setNewProp({...newProp, sizeUncovered: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-1 text-white text-center" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 mb-0.5">Tot M²</label>
                    <input type="number" required placeholder="80" value={newProp.sizeTotal || ''} onChange={(e) => setNewProp({...newProp, sizeTotal: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-1 text-white text-center" />
                  </div>
                </div>

                {/* Ficha Técnica Extendida */}
                <div className="grid grid-cols-3 gap-2 bg-slate-950/20 p-2 rounded-xl border border-slate-800/40">
                  <div>
                    <label className="block text-[9px] text-slate-400 mb-0.5">Estado</label>
                    <input type="text" placeholder="Ej: Excelente" value={newProp.estadoActual} onChange={(e) => setNewProp({...newProp, estadoActual: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-1 text-white" />
                  </div>
                  <div>
                    <label className="block text-[9px] text-slate-400 mb-0.5">Antigüedad</label>
                    <input type="number" placeholder="0 (Estrenar)" value={newProp.antiguedad} onChange={(e) => setNewProp({...newProp, antiguedad: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-1 text-white text-center" />
                  </div>
                  <div>
                    <label className="block text-[9px] text-slate-400 mb-0.5">Orientación</label>
                    <select value={newProp.orientacion} onChange={(e) => setNewProp({...newProp, orientacion: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-0.5 text-white">
                      <option value="Norte">Norte</option>
                      <option value="Sur">Sur</option>
                      <option value="Este">Este</option>
                      <option value="Oeste">Oeste</option>
                    </select>
                  </div>
                </div>

                {/* Red de Servicios Básicos y Sistemas */}
                <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 space-y-2">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Conectividad & Servicios</span>
                  <div className="flex justify-between items-center px-1">
                    <label className="flex items-center space-x-1.5"><input type="checkbox" checked={newProp.servLuz} onChange={(e) => setNewProp({...newProp, servLuz: e.target.checked})} /> <span>Luz</span></label>
                    <label className="flex items-center space-x-1.5"><input type="checkbox" checked={newProp.servGas} onChange={(e) => setNewProp({...newProp, servGas: e.target.checked})} /> <span>Gas</span></label>
                    <label className="flex items-center space-x-1.5"><input type="checkbox" checked={newProp.servAgua} onChange={(e) => setNewProp({...newProp, servAgua: e.target.checked})} /> <span>Agua</span></label>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/60">
                    <div>
                      <label className="block text-[8px] text-slate-400 uppercase font-bold mb-0.5">Calefacción</label>
                      <input type="text" placeholder="Ej: Split Frio/Calor" value={newProp.calefaccion} onChange={(e) => setNewProp({...newProp, calefaccion: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-1 text-[11px] text-white" />
                    </div>
                    <div>
                      <label className="block text-[8px] text-slate-400 uppercase font-bold mb-0.5">Agua Sanitaria</label>
                      <input type="text" placeholder="Ej: Termotanque" value={newProp.sistemaAgua} onChange={(e) => setNewProp({...newProp, sistemaAgua: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-1 text-[11px] text-white" />
                    </div>
                  </div>
                </div>
                {/* 📸 GALERÍA MULTIMEDIA INTERACTIVA */}
                <div className="border-t border-slate-800 pt-2 space-y-2">
                  <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider block">Administrador de Fotos</span>
                  
                  {/* Vista previa de imágenes cargadas con opción de borrar */}
                  {newProp.existingImages?.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800/60">
                      {newProp.existingImages.map((img, index) => {
                        // Extraemos el string limpio de la URL de forma segura
                        const urlString = typeof img === 'string' ? img : (img.urlImagen || img.url_imagen || '');
                        if (!urlString) return null;

                        return (
                          <div key={index} className="relative aspect-video rounded overflow-hidden border border-slate-800 group bg-slate-900">
                            <img src={urlString} alt="Cargada" className="w-full h-full object-cover" />
                            {index === 0 && (
                              <span className="absolute bottom-0 inset-x-0 bg-orange-600/90 text-white text-[7px] text-center uppercase font-black tracking-widest py-0.5">Portada</span>
                            )}
                            <button 
                              type="button" 
                              onClick={() => handleRemoveImage(urlString)} 
                              className="absolute top-0 right-0 bg-red-600 text-white font-bold text-[10px] w-4 h-4 rounded-bl flex items-center justify-center shadow hover:bg-red-700 transition"
                            >
                              ✕
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="bg-slate-950 p-2 rounded-xl border border-slate-800/60 space-y-1">
                    <label className="block text-[9px] text-slate-400 font-bold uppercase">Subir nuevas fotos a la galería</label>
                    <input type="file" accept="image/*" multiple onChange={(e) => uploadImagesToCloudinary(e, 'galleryUrls')} className="w-full text-slate-400 text-xs cursor-pointer" />
                    <textarea readOnly rows="1" placeholder="Nuevas URLs listas..." value={newProp.galleryUrls || ''} className="w-full bg-slate-900 border border-slate-800 rounded p-1 text-white text-[9px] font-mono mt-1" />
                  </div>
                </div>

                {/* 📐 COMPARADOR RENDERIZADO CONDICIONAL: sólo si la propiedad es (o fue) una reforma */}
                {!!newProp.estadoReforma && (
                  <div className="border-t border-slate-800 pt-2 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider">Estudio de Obra ({newProp.comparables?.length || 0})</span>
                      <button type="button" onClick={addComparableSpace} className="px-2 py-0.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded text-[10px] uppercase">+</button>
                    </div>
                    {newProp.comparables?.map((comp, idx) => (
                      <div key={idx} className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-2 relative">
                        <button type="button" onClick={() => removeComparableSpace(idx)} className="absolute top-1 right-2 text-red-400 font-bold text-xs">✕</button>
                        
                        <input type="text" required placeholder="Nombre del espacio (Ej: Living)" value={comp.spaceName || ''} onChange={(e) => handleComparableChange(idx, 'spaceName', e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded p-1 text-white text-[11px]" />
                        
                        <div className="grid grid-cols-2 gap-2 text-[10px]">
                          {/* FOTO ANTES */}
                          <div>
                            <label className="text-slate-500 font-bold block mb-1">Antes de la Reforma</label>
                            {comp.before && (
                              <div className="aspect-video w-full rounded overflow-hidden border border-slate-800 mb-1 bg-slate-900">
                                <img src={comp.before} alt="Antes" className="w-full h-full object-cover" />
                              </div>
                            )}
                            <input type="file" accept="image/*" onChange={(e) => uploadImagesToCloudinary(e, 'compBefore', idx)} className="w-full text-slate-400 text-[10px]" />
                          </div>

                          {/* FOTO DESPUÉS */}
                          <div>
                            <label className="text-slate-500 font-bold block mb-1">
                              Después de la Reforma{newProp.estadoReforma === 'EN_PROCESO' && ' (opcional, se completa al finalizar)'}
                            </label>
                            {comp.after && (
                              <div className="aspect-video w-full rounded overflow-hidden border border-slate-800 mb-1 bg-slate-900">
                                <img src={comp.after} alt="Después" className="w-full h-full object-cover" />
                              </div>
                            )}
                            <input type="file" accept="image/*" onChange={(e) => uploadImagesToCloudinary(e, 'compAfter', idx)} className="w-full text-slate-400 text-[10px]" />
                          </div>
                        </div>

                        <textarea
                          rows="2"
                          placeholder="Descripción del cambio en este ambiente..."
                          value={comp.descripcion || ''}
                          onChange={(e) => handleComparableChange(idx, 'descripcion', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-white text-[11px]"
                        />

                        <div className="text-[10px] border-t border-slate-800/60 pt-2">
                          <label className="text-slate-500 font-bold block mb-1">Fotos y videos del proceso de obra (opcional)</label>
                          {comp.procesoMedia?.length > 0 && (
                            <div className="grid grid-cols-2 gap-2 mb-1.5">
                              {comp.procesoMedia.map((media, mediaIdx) => (
                                <div key={mediaIdx} className="bg-slate-900 border border-slate-800 rounded-lg p-1.5 space-y-1 relative">
                                  <button
                                    type="button"
                                    onClick={() => removeProcesoMedia(idx, mediaIdx)}
                                    className="absolute top-1 right-1 bg-red-600 text-white font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center shadow hover:bg-red-700 transition z-10"
                                  >
                                    ✕
                                  </button>
                                  <div className="aspect-video w-full rounded overflow-hidden border border-slate-800 bg-slate-950">
                                    {media.tipo === 'video' ? (
                                      <video src={media.url} controls className="w-full h-full object-cover" />
                                    ) : (
                                      <img src={media.url} alt="Proceso" className="w-full h-full object-cover" />
                                    )}
                                  </div>
                                  <input
                                    type="text"
                                    placeholder="Ej: Semana 2, demolición..."
                                    value={media.descripcion || ''}
                                    onChange={(e) => updateProcesoMediaCaption(idx, mediaIdx, e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded p-1 text-white text-[9px]"
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                          <input type="file" accept="image/*,video/*" multiple onChange={(e) => uploadImagesToCloudinary(e, 'procesoMedia', idx)} className="w-full text-slate-400 text-[10px]" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="border-t border-slate-800 pt-2">
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Reseña Comercial</label>
                  <textarea rows="2" placeholder="Acabados, iluminación..." value={newProp.description || ''} onChange={(e) => setNewProp({...newProp, description: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none"></textarea>
                </div>

                {!!newProp.estadoReforma && (
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Historia técnica de la reforma</label>
                    <textarea rows="2" placeholder="Estructura de obra..." value={newProp.reformStory || ''} onChange={(e) => setNewProp({...newProp, reformStory: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none"></textarea>
                  </div>
                )}

                <button type="submit" disabled={isUploading} className="w-full bg-orange-600 text-white font-bold p-3.5 rounded-xl uppercase tracking-wider disabled:bg-slate-800 disabled:text-slate-500">
                  {isUploading ? 'Procesando archivos...' : isEditing ? '✓ Guardar Cambios' : '✓ Publicar'}
                </button>
              </form>
            </div>

            {/* 📋 CATÁLOGO LISTADO */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl">
                <h3 className="font-extrabold text-white text-xs uppercase tracking-wider mb-4 m-0">Inmuebles en Catálogo ({properties.length})</h3>
                {/* 📱 VISTA EN TARJETAS PARA CELULARES (Se oculta automáticamente en PC) */}
                <div className="block md:hidden space-y-3">
                  {properties.map((p) => (
                    <div key={p.id} className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-3">
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0">
                          <h4 className="font-bold text-white text-sm truncate">{p.titulo || p.title}</h4>
                          <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
                            <span>{p.tipo || p.type} — <span className={`font-semibold uppercase ${p.operation === 'Venta' ? 'text-orange-400' : p.operation === 'No Disponible' ? 'text-slate-500' : 'text-blue-400'}`}>{p.operation}</span></span>
                            {p.estadoReforma === 'EN_PROCESO' && <span className="bg-amber-950 text-amber-400 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase">En Proceso</span>}
                            {p.estadoReforma === 'REALIZADA' && <span className="bg-purple-950 text-purple-400 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase">Realizada</span>}
                          </p>
                        </div>
                        <span className="text-xs font-bold text-white bg-slate-950 border border-slate-800 px-2 py-1 rounded-lg font-mono whitespace-nowrap flex-shrink-0">
                          {p.operation === 'No Disponible' ? 'Sin precio' : `${p.operation === 'Venta' ? 'USD' : 'ARS'} ${(p.price ?? 0).toLocaleString('es-AR')}`}
                        </span>
                      </div>

                      {/* Botones de acción amplios para el dedo en el celular */}
                      <div className={`grid ${p.estadoReforma === 'EN_PROCESO' ? 'grid-cols-2' : 'grid-cols-3'} gap-2 pt-2 border-t border-slate-800/60 text-center`}>
                        <button
                          type="button"
                          onClick={() => { setView(p.estadoReforma ? 'reformas' : 'home'); triggerToast("Redirigido.", "info"); }}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2 rounded-lg text-[10px] uppercase tracking-wider"
                        >
                          Ver
                        </button>
                        {p.estadoReforma === 'EN_PROCESO' && (
                          <button
                            type="button"
                            onClick={() => handleMarkAsRealizada(p)}
                            className="bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 font-bold py-2 rounded-lg text-[10px] uppercase tracking-wider"
                          >
                            ✓ Realizada
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleStartEdit(p)}
                          className="bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 border border-amber-500/30 font-bold py-2 rounded-lg text-[10px] uppercase tracking-wider"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProperty(p.id)}
                          className="bg-red-950/40 hover:bg-red-900/30 text-red-400 border border-red-900/40 font-bold py-2 rounded-lg text-[10px] uppercase tracking-wider"
                        >
                          Borrar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 💻 VISTA EN TABLA TRADICIONAL PARA PANTALLAS MEDIANAS Y GRANDES (Se oculta en celulares) */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase">
                        <th className="py-2.5">Título</th>
                        <th className="py-2.5">Tipo</th>
                        <th className="py-2.5">Operación</th>
                        <th className="py-2.5">Precio</th>
                        <th className="py-2.5 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {properties.map((p) => (
                        <tr key={p.id} className="border-b border-slate-900/50 hover:bg-slate-900/40 transition">
                          <td className="py-3 font-semibold text-white">{p.titulo || p.title}</td>
                          <td className="py-3 text-slate-400">{p.tipo || p.type}</td>
                          <td className="py-3">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${p.operation === 'Venta' ? 'bg-orange-950 text-orange-400' : p.operation === 'No Disponible' ? 'bg-slate-800 text-slate-400' : 'bg-blue-950 text-blue-400'}`}>{p.operation}</span>
                              {p.estadoReforma === 'EN_PROCESO' && <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-950 text-amber-400">En Proceso</span>}
                              {p.estadoReforma === 'REALIZADA' && <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-950 text-purple-400">Realizada</span>}
                            </div>
                          </td>
                          <td className="py-3 font-bold text-white font-mono">
                            {p.operation === 'No Disponible' ? 'Sin precio' : `${p.operation === 'Venta' ? 'USD' : 'ARS'} ${(p.price ?? 0).toLocaleString('es-AR')}`}
                          </td>
                          <td className="py-3 text-right space-x-3 whitespace-nowrap">
                            <button onClick={() => { setView(p.estadoReforma ? 'reformas' : 'home'); triggerToast("Redirigido.", "info"); }} className="text-slate-400 hover:text-white transition">Ver</button>
                            {p.estadoReforma === 'EN_PROCESO' && (
                              <button onClick={() => handleMarkAsRealizada(p)} className="text-emerald-500 hover:text-emerald-400 font-bold transition">✓ Realizada</button>
                            )}
                            <button onClick={() => handleStartEdit(p)} className="text-amber-500 hover:text-amber-400 font-bold transition">Editar</button>
                            <button onClick={() => handleDeleteProperty(p.id)} className="text-red-500 hover:text-red-400 font-bold transition">Borrar</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </main>
  );
}