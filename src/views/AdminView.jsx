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
  
  // ⚡ ESTADO OPTIMIZADO: comparables ahora es un array nativo
  const [newProp, setNewProp] = useState({
    title: '', price: '', location: 'La Plata, Buenos Aires', operation: 'Venta', type: 'Departamento',
    rooms: '3', beds: '2', baths: '1', sizeBuilt: '', sizeTotal: '', sizeSemiCovered: '0', sizeUncovered: '0',
    floor: 'PB', bankEligible: 'Sí', address: '', description: '', reformStory: '',
    coverImage: '', 
    galleryUrls: '', // Aquí guardamos las URLs nuevas separadas por comas
    existingImages: [], // 🎯 Guardamos las fotos que ya pertenecen a la propiedad al editar
    comparables: [{ spaceName: 'Espacio Principal', before: '', after: '' }] // 🎯 Array de ambientes
  });

  const [isUploading, setIsUploading] = useState(false);

  // 📸 FUNCIÓN MEJORADA: Soporta subida de archivos múltiples a Cloudinary
  const uploadImagesToCloudinary = async (e, field, index = null) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const cloudName = "dldibpwyr"; 
    const uploadPreset = "somos_reformas_preset"; 

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", uploadPreset);

        const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: "POST",
          body: formData
        });
        if (!response.ok) throw new Error("Error en la subida a Cloudinary");
        const data = await response.json();
        return data.secure_url;
      });

      // Ejecutamos todas las subidas en paralelo
      const uploadedUrls = await Promise.all(uploadPromises);

      if (field === 'coverImage') {
        setNewProp(prev => ({ ...prev, coverImage: uploadedUrls[0] }));
        triggerToast("¡Foto de portada actualizada!", "success");
      } else if (field === 'galleryUrls') {
        // 🎯 Punto 3: Unimos las múltiples fotos seleccionadas juntas
        setNewProp(prev => {
          const currentUrls = prev.galleryUrls ? prev.galleryUrls.split(',').map(u => u.trim()).filter(Boolean) : [];
          const combined = [...currentUrls, ...uploadedUrls].join(', ');
          return { ...prev, galleryUrls: combined };
        });
        triggerToast(`¡${uploadedUrls.length} imágenes añadidas a la galería!`, "success");
      } else if (field === 'compBefore' && index !== null) {
        setNewProp(prev => {
          const updatedComps = [...prev.comparables];
          updatedComps[index].before = uploadedUrls[0];
          return { ...prev, comparables: updatedComps };
        });
        triggerToast("Foto del 'Antes' cargada.", "success");
      } else if (field === 'compAfter' && index !== null) {
        setNewProp(prev => {
          const updatedComps = [...prev.comparables];
          updatedComps[index].after = uploadedUrls[0];
          return { ...prev, comparables: updatedComps };
        });
        triggerToast("Foto del 'Después' cargada.", "success");
      }

    } catch (error) {
      console.error(error);
      triggerToast("Error al procesar los archivos multimedia.", "error");
    } finally {
      setIsUploading(false);
    }
  };

  // 📐 Manejo dinámico del array de Ambientes (Antes y Después)
  const addComparableSpace = () => {
    setNewProp(prev => ({
      ...prev,
      comparables: [...prev.comparables, { spaceName: '', before: '', after: '' }]
    }));
  };

  const removeComparableSpace = (index) => {
    setNewProp(prev => ({
      ...prev,
      comparables: prev.comparables.filter((_, i) => i !== index)
    }));
  };

  const handleComparableChange = (index, key, value) => {
    setNewProp(prev => {
      const updatedComps = [...prev.comparables];
      updatedComps[index][key] = value;
      return { ...prev, comparables: updatedComps };
    });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    
    // 🎯 Combinar imágenes existentes y nuevas de forma limpia (Evita error 500)
    const imagenesPayload = [];

    // 1. Agregamos la foto de portada actual
    if (newProp.coverImage?.trim()) {
      imagenesPayload.push({ urlImagen: newProp.coverImage.trim(), esPortada: true });
    }

    // 2. Mantenemos las imágenes secundarias que YA existían en la base de datos (Punto 2)
    if (newProp.existingImages && newProp.existingImages.length > 0) {
      newProp.existingImages.forEach(img => {
        // Evitamos duplicar si por alguna razón quedó marcada como portada
        if (img.urlImagen !== newProp.coverImage) {
          imagenesPayload.push({ 
            urlImagen: img.urlImagen || img.url_imagen, 
            esPortada: false 
          });
        }
      });
    }

    // 3. Sumamos las fotos nuevas que acabas de subir a Cloudinary en esta sesión
    if (newProp.galleryUrls?.trim()) {
      newProp.galleryUrls.split(',').forEach(url => {
        if (url.trim()) imagenesPayload.push({ urlImagen: url.trim(), esPortada: false });
      });
    }

    // Estructurar array de comparables dinámicos
    const comparablesPayload = prevComps => newProp.comparables
      .filter(c => c.before?.trim() && c.after?.trim())
      .map(c => ({
        nombreEspacio: c.spaceName || 'Espacio Común',
        urlAntes: c.before.trim(),
        urlDespues: c.after.trim(),
        description: "Transformación integral realizada por Somos Reformas."
      }));

    const propertyPayload = {
      titulo: newProp.title,
      slug: newProp.title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-'),
      precio: parseFloat(newProp.price) || 0,
      localidad: newProp.location, operacion: newProp.operation, tipo: newProp.type,
      ambientes: parseInt(newProp.rooms) || 1, dormitorios: parseInt(newProp.beds) || 1, banos: parseInt(newProp.baths) || 1,
      m2Cubiertos: parseInt(newProp.sizeBuilt) || 0, m2Totales: parseInt(newProp.sizeTotal) || 0,
      m2Semicubiertos: parseInt(newProp.sizeSemiCovered) || 0, m2Descubiertos: parseInt(newProp.sizeUncovered) || 0,
      direccion: newProp.address, pisoPlanta: newProp.floor, aptoBanco: newProp.bankEligible === "Sí",
      descripcion: newProp.description, historiaReforma: newProp.reformStory,
      imagenes: imagenesPayload,
      comparables: comparablesPayload(),
      servicioCocina: true, servicioAguaCaliente: true, servicioElectricidad: true, servicioPavimento: true, servicioCable: true, servicioGasNatural: true, servicioCloaca: true, servicioInternet: true
    };

    const url = isEditing ? `${apiUrl}/api/propiedades/${editingId}` : `${apiUrl}/api/propiedades`;

    fetch(url, {
      method: isEditing ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(propertyPayload)
    })
    .then(response => {
      if (!response.ok) throw new Error('Error en servidor');
      return response.json();
    })
    .then(() => {
      triggerToast(isEditing ? "¡Inmueble editado con éxito!" : "¡Inmueble publicado!", "success");
      setView('home'); 
      window.location.reload();
    })
    .catch(() => triggerToast("Error al guardar cambios.", "error"));
  };

  const handleStartEdit = (prop) => {
    setIsEditing(true);
    setEditingId(prop.id);
    
    const rawImages = prop.imagenes || [];
    const coverObj = rawImages.find(img => img.esPortada || img.portada);
    const coverUrl = prop.coverImage || coverObj?.urlImagen || '';

    // Mapeamos los comparables existentes que vengan de Java
    const formattedComps = prop.comparables?.map(c => ({
      spaceName: c.nombreEspacio || c.spaceName || '',
      before: c.urlAntes || c.before || '',
      after: c.urlDespues || c.after || ''
    })) || [{ spaceName: 'Espacio Principal', before: '', after: '' }];

    setNewProp({
      title: prop.title || prop.titulo || '',
      price: prop.price ? prop.price.toString() : '',
      location: prop.location || prop.localidad || 'La Plata, Buenos Aires',
      operation: prop.operation || prop.operacion || 'Venta',
      type: prop.type || prop.tipo || 'Departamento',
      rooms: prop.rooms?.toString() || '3',
      beds: prop.beds?.toString() || '2',
      baths: prop.baths?.toString() || '1',
      sizeBuilt: (prop.sizeCovered || prop.m2Cubiertos || '').toString(),
      sizeTotal: (prop.sizeTotal || prop.m2Totales || '').toString(),
      sizeSemiCovered: (prop.sizeSemiCovered || prop.m2Semicubiertos || '0').toString(),
      sizeUncovered: (prop.sizeUncovered || prop.m2Descubiertos || '0').toString(),
      floor: prop.floor || prop.pisoPlanta || 'PB',
      bankEligible: prop.bankEligible || (prop.aptoBanco ? 'Sí' : 'No'),
      address: prop.direccion || '',
      description: prop.description || prop.descripcion || '',
      reformStory: prop.reformStory || prop.historiaReforma || '',
      coverImage: coverUrl,
      galleryUrls: '', // Limpio para las fotos NUEVAS que se agreguen en esta edición
      existingImages: rawImages.filter(img => !img.esPortada), // Guardamos el backup de las viejas
      comparables: formattedComps
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    .catch(() => setAdminError("Credenciales incorrectas."));
  };

  const handleDeleteProperty = (id) => {
    if (window.confirm("¿Estás seguro?")) {
      fetch(`${apiUrl}/api/propiedades/${id}`, { method: 'DELETE' })
      .then(() => {
        setProperties(properties.filter(p => p.id !== id));
        triggerToast("Eliminado.", "success");
      });
    }
  };

  return (
    <main className="flex-grow py-6 sm:py-8 bg-slate-950 text-slate-100 text-left min-h-screen">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* HEADER RESPONSIVO */}
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
              <input type="email" value={adminUsername} onChange={(e) => setAdminUsername(e.target.value)} className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-white" />
              <input type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-white" />
              <button type="submit" className="w-full bg-orange-600 p-3 rounded-xl font-bold uppercase text-white">Entrar</button>
            </form>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            
            {/* Formulario Izquierdo */}
            <div className="lg:col-span-1 bg-slate-900 border border-slate-800 p-4 sm:p-5 rounded-2xl shadow-xl space-y-4 h-fit">
              <h3 className="font-extrabold text-white text-xs uppercase tracking-wider border-b border-slate-800 pb-2 m-0">
                {isEditing ? '📝 Editar Inmueble' : '✨ Publicar Nueva Reforma'}
              </h3>

              <form onSubmit={handleFormSubmit} className="space-y-3 text-xs text-slate-300">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Título comercial</label>
                  <input type="text" required placeholder="PH Remodelado" value={newProp.title || ''} onChange={(e) => setNewProp({...newProp, title: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white" />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Precio (USD)</label>
                    <input type="number" required placeholder="150000" value={newProp.price || ''} onChange={(e) => setNewProp({...newProp, price: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Localidad</label>
                    <input type="text" required value={newProp.location || ''} onChange={(e) => setNewProp({...newProp, location: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white" />
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

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Tipo Inmueble</label>
                    <select value={newProp.type || 'Departamento'} onChange={(e) => setNewProp({...newProp, type: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white">
                      <option value="Departamento">Departamento</option>
                      <option value="PH">PH</option>
                      <option value="Casa">Casa</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Apto Banco</label>
                    <select value={newProp.bankEligible || 'Sí'} onChange={(e) => setNewProp({...newProp, bankEligible: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white">
                      <option value="Sí">Sí</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-1.5">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 mb-0.5">Amb.</label>
                    <input type="number" value={newProp.rooms || ''} onChange={(e) => setNewProp({...newProp, rooms: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-white text-center" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 mb-0.5">Dorm.</label>
                    <input type="number" value={newProp.beds || ''} onChange={(e) => setNewProp({...newProp, beds: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-white text-center" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 mb-0.5">Baños</label>
                    <input type="number" value={newProp.baths || ''} onChange={(e) => setNewProp({...newProp, baths: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-white text-center" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 mb-0.5">Cub M²</label>
                    <input type="number" required placeholder="60" value={newProp.sizeBuilt || ''} onChange={(e) => setNewProp({...newProp, sizeBuilt: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-white text-center" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-1.5">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 mb-0.5">Tot M²</label>
                    <input type="number" required placeholder="80" value={newProp.sizeTotal || ''} onChange={(e) => setNewProp({...newProp, sizeTotal: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-white text-center" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 mb-0.5">Semic M²</label>
                    <input type="number" value={newProp.sizeSemiCovered || '0'} onChange={(e) => setNewProp({...newProp, sizeSemiCovered: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-white text-center" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 mb-0.5">Desc M²</label>
                    <input type="number" value={newProp.sizeUncovered || '0'} onChange={(e) => setNewProp({...newProp, sizeUncovered: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-white text-center" />
                  </div>
                </div>

                {/* 📸 SECCIÓN MULTIMEDIA OPTIMIZADA */}
                <div className="border-t border-slate-800 pt-2 space-y-3">
                  <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider block">Galería Multimedia</span>
                  
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/60 space-y-1">
                    <label className="block text-[9px] text-slate-400 font-bold uppercase">Foto de Portada</label>
                    <input type="file" accept="image/*" onChange={(e) => uploadImagesToCloudinary(e, 'coverImage')} className="w-full text-slate-400 text-xs" />
                    {newProp.coverImage && <p className="text-[9px] text-emerald-400 truncate font-mono mt-1">✓ {newProp.coverImage}</p>}
                  </div>

                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/60 space-y-1">
                    {/* 🎯 PUNTO 3: Agregamos el atributo multiple */}
                    <label className="block text-[9px] text-slate-400 font-bold uppercase">Subir múltiples fotos secundarias juntas</label>
                    <input type="file" accept="image/*" multiple onChange={(e) => uploadImagesToCloudinary(e, 'galleryUrls')} className="w-full text-slate-400 text-xs cursor-pointer" />
                    
                    {isEditing && newProp.existingImages.length > 0 && (
                      <p className="text-[9px] text-slate-400 italic mt-1">Se conservarán {newProp.existingImages.length} fotos previas.</p>
                    )}
                    <textarea readOnly rows="2" placeholder="Links acumulados..." value={newProp.galleryUrls || ''} className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-white text-[10px] font-mono mt-1" />
                  </div>
                </div>

                {/* 📐 SECCIÓN COMPARADOR MULTI-AMBIENTE (Punto 2) */}
                <div className="border-t border-slate-800 pt-2 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider">Estudio de Obra ({newProp.comparables.length})</span>
                    <button type="button" onClick={addComparableSpace} className="px-2 py-0.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded text-[10px] uppercase">
                      + Añadir Ambiente
                    </button>
                  </div>
                  
                  {newProp.comparables.map((comp, idx) => (
                    <div key={idx} className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-2 relative">
                      {newProp.comparables.length > 1 && (
                        <button type="button" onClick={() => removeComparableSpace(idx)} className="absolute top-1 right-2 text-red-400 hover:text-red-300 font-bold text-xs">
                          Eliminar
                        </button>
                      )}
                      <div>
                        <label className="block text-[9px] text-slate-400 mb-0.5">Nombre del espacio</label>
                        <input type="text" required placeholder="Ej. Cocina o Baño" value={comp.spaceName || ''} onChange={(e) => handleComparableChange(idx, 'spaceName', e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded p-1 text-white text-[11px]" />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-0.5">
                          <label className="block text-[8px] text-slate-500 uppercase font-bold">Antes</label>
                          <input type="file" accept="image/*" onChange={(e) => uploadImagesToCloudinary(e, 'compBefore', idx)} className="w-full text-[9px] text-slate-400" />
                          {comp.before && <p className="text-[8px] text-emerald-400 truncate font-mono">✓ Subida</p>}
                        </div>
                        <div className="space-y-0.5">
                          <label className="block text-[8px] text-slate-500 uppercase font-bold">Después</label>
                          <input type="file" accept="image/*" onChange={(e) => uploadImagesToCloudinary(e, 'compAfter', idx)} className="w-full text-[9px] text-slate-400" />
                          {comp.after && <p className="text-[8px] text-emerald-400 truncate font-mono">✓ Subida</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-slate-800 pt-2">
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Reseña Comercial</label>
                  <textarea rows="2" placeholder="Acabados, iluminación..." value={newProp.description || ''} onChange={(e) => setNewProp({...newProp, description: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none"></textarea>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Historia técnica</label>
                  <textarea rows="2" placeholder="Estructura de obra..." value={newProp.reformStory || ''} onChange={(e) => setNewProp({...newProp, reformStory: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none"></textarea>
                </div>

                <button type="submit" disabled={isUploading} className="w-full bg-orange-600 text-white font-bold p-3.5 rounded-xl uppercase tracking-wider transition-all disabled:bg-slate-800 disabled:text-slate-500">
                  {isUploading ? 'Procesando archivos...' : isEditing ? '✓ Guardar Cambios' : '✓ Publicar Propiedad'}
                </button>
              </form>
            </div>

            {/* Catálogo Derecho */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl">
                <h3 className="font-extrabold text-white text-xs uppercase tracking-wider mb-4 m-0">Inmuebles en Catálogo ({properties.length})</h3>
                
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase">
                        <th className="py-2.5">Título</th>
                        <th className="py-2.5">Zona</th>
                        <th className="py-2.5">Precio</th>
                        <th className="py-2.5 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {properties.map((p) => (
                        <tr key={p.id} className="border-b border-slate-900/50 hover:bg-slate-900/40 transition">
                          <td className="py-3 font-semibold text-white">{p.title}</td>
                          <td className="py-3 text-slate-400">{p.location}</td>
                          <td className="py-3 font-bold text-orange-400 font-mono">USD {p.price.toLocaleString('es-AR')}</td>
                          <td className="py-3 text-right space-x-3 whitespace-nowrap">
                            <button onClick={() => { setView('home'); triggerToast("Redirigido.", "info"); }} className="text-slate-400 hover:text-white transition">Ver público</button>
                            <button onClick={() => handleStartEdit(p)} className="text-amber-500 hover:text-amber-400 font-bold transition">Editar</button>
                            <button onClick={() => handleDeleteProperty(p.id)} className="text-red-500 hover:text-red-400 font-bold transition">Eliminar</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="block md:hidden space-y-3">
                  {properties.map((p) => (
                    <div key={p.id} className="bg-slate-950 border border-slate-800/80 rounded-xl p-3.5 space-y-2">
                      <h4 className="font-bold text-white text-sm">{p.title}</h4>
                      <p className="text-xs text-orange-400 font-mono">USD {p.price.toLocaleString('es-AR')}</p>
                      <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-slate-900 text-center text-[10px] font-bold uppercase tracking-wider">
                        <button onClick={() => setView('home')} className="bg-slate-900 text-slate-300 py-1.5 rounded-lg">Ver</button>
                        <button onClick={() => handleStartEdit(p)} className="bg-amber-950/40 text-amber-400 py-1.5 rounded-lg">Editar</button>
                        <button onClick={() => handleDeleteProperty(p.id)} className="bg-red-950/40 text-red-400 py-1.5 rounded-lg">Borrar</button>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            </div>

          </div>
        )}
      </div>
    </main>
  );
}