import React, { useState, useEffect } from 'react';

export default function AdminView({ setProperties, properties, setView, triggerToast }) {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminUsername, setAdminUsername] = useState('admin@somosreformas.com');
  const [adminPassword, setAdminPassword] = useState('123456');
  const [adminError, setAdminError] = useState('');
  
  // 🔄 ESTADOS CLAVE PARA CONTROLAR LA EDICIÓN
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // 🔄 PERSISTENCIA DE SESIÓN LOCAL: Al levantar el componente, chequeamos si ya estabas logueado
  useEffect(() => {
    const loggedUser = localStorage.getItem('reformas_admin_session');
    if (loggedUser) {
      setIsAdminLoggedIn(true);
    }
  }, []);
  
  // Formulario con la estructura extendida para tus propiedades reales 📸 Agregamos campos de texto para las URLs separadas por comas
  const [newProp, setNewProp] = useState({
    title: '',
    price: '',
    location: 'La Plata, Buenos Aires',
    operation: 'Venta',
    type: 'Departamento',
    rooms: '3',
    beds: '2',
    baths: '1',
    sizeBuilt: '',
    sizeTotal: '',
    sizeSemiCovered: '0',
    sizeUncovered: '0',
    floor: 'PB',
    bankEligible: 'Sí',
    address: '',
    description: '',
    reformStory: '',
    coverImage: '', // Foto principal (es_portada = true)
    galleryUrls: '', // Links divididos por coma para propiedad_imagenes
    compName: 'Espacio Principal', // Nombre del ambiente a comparar
    compBefore: '', // Foto antes de la reforma
    compAfter: ''  // Foto después de la reforma
  });

const handleAdminLoginSubmit = (e) => {
    e.preventDefault();
    setAdminError('');

    fetch('http://localhost:8090/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: adminUsername,
        password: adminPassword
      })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Credenciales inválidas o error de servidor');
      }
      return response.json();
    })
    .then(data => {
      // Verificamos que tenga el rol correspondiente antes de dar el pase libre
      if (data.rol === 'admin' || data.rol === 'ADMIN') {
        // Guardamos en localStorage para persistir tras un F5 (guardamos como string JSON)
        localStorage.setItem('reformas_admin_session', JSON.stringify(data));
        
        setIsAdminLoggedIn(true);
        triggerToast("Sesión iniciada correctamente desde PostgreSQL.", "success");
      } else {
        setAdminError("Acceso denegado: Tu usuario no posee rango de Administrador.");
      }
    })
    .catch(error => {
      console.error("Login Error:", error);
      setAdminError("Email o contraseña incorrectos. Intente nuevamente.");
    });
  };

  // 🚪 FUNCIÓN DE LOGOUT (OPCIONAL): Para limpiar la sesión
  const handleLogout = () => {
    localStorage.removeItem('reformas_admin_session');
    setIsAdminLoggedIn(false);
    triggerToast("Sesión cerrada correctamente.", "info");
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    
    // 🔀 Transformamos los hilos de texto divididos por comas en la estructura relacional que espera Java
    const imagenesPayload = [];
    if (newProp.coverImage.trim()) {
      imagenesPayload.push({ urlImagen: newProp.coverImage.trim(), esPortada: true });
    }
    if (newProp.galleryUrls.trim()) {
      newProp.galleryUrls.split(',').forEach(url => {
        if (url.trim()) imagenesPayload.push({ urlImagen: url.trim(), esPortada: false });
      });
    }

    const comparablesPayload = [];
    if (newProp.compBefore.trim() && newProp.compAfter.trim()) {
      comparablesPayload.push({
        nombreEspacio: newProp.compName,
        urlAntes: newProp.compBefore.trim(),
        urlDespues: newProp.compAfter.trim(),
        description: "Transformación integral realizada por Somos Reformas."
      });
    }

    const propertyPayload = {
      titulo: newProp.title,
      slug: newProp.title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-'),
      precio: parseFloat(newProp.price) || 0,
      localidad: newProp.location,
      operacion: newProp.operation,
      tipo: newProp.type,
      ambientes: parseInt(newProp.rooms) || 1,
      dormitorios: parseInt(newProp.beds) || 1,
      banos: parseInt(newProp.baths) || 1,
      m2Cubiertos: parseInt(newProp.sizeBuilt) || 0,
      m2Totales: parseInt(newProp.sizeTotal) || 0,
      m2Semicubiertos: parseInt(newProp.sizeSemiCovered) || 0,
      m2Descubiertos: parseInt(newProp.sizeUncovered) || 0,
      direccion: newProp.address,
      pisoPlanta: newProp.floor,
      aptoBanco: newProp.bankEligible === "Sí",
      descripcion: newProp.description,
      historiaReforma: newProp.reformStory,
      
      // Adjuntamos las listas hijas para JPA
      imagenes: imagenesPayload,
      comparables: comparablesPayload,

      servicioCocina: true,
      servicioAguaCaliente: true,
      servicioElectricidad: true,
      servicioPavimento: true,
      servicioCable: true,
      servicioGasNatural: true,
      servicioCloaca: true,
      servicioInternet: true
    };

    const url = isEditing 
      ? `http://localhost:8090/api/propiedades/${editingId}` 
      : 'http://localhost:8090/api/propiedades';

    fetch(url, {
      method: isEditing ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(propertyPayload)
    })
    .then(response => {
      if (!response.ok) throw new Error('Error al guardar en el servidor');
      return response.json();
    })
    .then(() => {
      triggerToast(isEditing ? "¡Inmueble actualizado con éxito!" : "¡Inmueble publicado con éxito!", "success");
      setIsEditing(false);
      setEditingId(null);
      setView('home'); 
      window.location.reload();
    })
    .catch(error => {
      console.error("Error:", error);
      triggerToast("Hubo un error al guardar en la base de datos.", "error");
    });
  };

  const handleDeleteProperty = (id) => {
    if (window.confirm("¿Estás seguro de que querés eliminar esta propiedad?")) {
      fetch(`http://localhost:8090/api/propiedades/${id}`, { method: 'DELETE' })
      .then(response => {
        if (!response.ok) throw new Error('Error al eliminar');
        setProperties(properties.filter(prop => prop.id !== id));
        triggerToast("Propiedad eliminada correctamente.", "success");
      })
      .catch(error => console.error(error));
    }
  };

const handleStartEdit = (prop) => {
    setIsEditing(true);
    setEditingId(prop.id);
    
    // 🔍 Buscamos la foto de portada real dentro del array de imágenes de la propiedad
    // Contemplamos todas las variantes de booleanos de Jackson
    const coverImgObj = prop.gallery?.length ? null : prop.imagenes?.find(img => img.esPortada || img.portada || img.es_portada);
    
    // Si ya pasó por el mapeo de App.jsx, la url de portada estará directo en prop.coverImage
    const coverUrl = prop.coverImage || coverImgObj?.urlImagen || coverImgObj?.url_imagen || '';

    // 📸 Filtramos las imágenes secundarias mapeando tanto urlImagen como url_imagen de forma segura
    let galleryImgs = '';
    if (prop.gallery && prop.gallery.length > 0) {
      // Si ya viene procesado por App.jsx como un array de strings simples:
      // Filtramos para que no repita la foto de portada en el string de edición si no querés
      galleryImgs = prop.gallery.filter(url => url !== prop.coverImage).join(', ');
    } else if (prop.imagenes) {
      // Si viene crudo del backend de Java:
      galleryImgs = prop.imagenes
        .filter(img => !(img.esPortada || img.portada || img.es_portada))
        .map(img => img.urlImagen || img.url_imagen)
        .join(', ');
    }

    // 📐 Buscamos el primer comparable de la lista
    const mainComp = prop.comparables?.[0];

    setNewProp({
      title: prop.title || prop.titulo || '',
      price: prop.price ? prop.price.toString() : '',
      location: prop.location || prop.localidad || 'La Plata, Buenos Aires',
      operation: prop.operation || prop.operacion || 'Venta',
      type: prop.type || prop.tipo || 'Departamento',
      rooms: prop.rooms ? prop.rooms.toString() : '3',
      beds: prop.beds ? prop.beds.toString() : '2',
      baths: prop.baths ? prop.baths.toString() : '1',
      sizeBuilt: prop.sizeCovered ? prop.sizeCovered.toString() : '',
      sizeTotal: prop.sizeTotal ? prop.sizeTotal.toString() : '',
      sizeSemiCovered: prop.sizeSemiCovered ? prop.sizeSemiCovered.toString() : '0',
      sizeUncovered: prop.sizeUncovered ? prop.sizeUncovered.toString() : '0',
      floor: prop.floor || prop.pisoPlanta || 'PB',
      bankEligible: prop.bankEligible || (prop.aptoBanco ? 'Sí' : 'No') || 'Sí',
      address: prop.direccion || '',
      description: prop.description || prop.descripcion || '',
      reformStory: prop.reformStory || prop.historiaReforma || '',
      
      // 🎯 Inyectamos las URLs recuperadas en los inputs correspondientes:
      coverImage: coverUrl,
      galleryUrls: galleryImgs,
      compName: mainComp?.spaceName || mainComp?.nombreEspacio || 'Espacio Principal',
      compBefore: mainComp?.before || mainComp?.urlAntes || '',
      compAfter: mainComp?.after || mainComp?.urlDespues || ''
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className="flex-grow py-8 bg-gray-200 text-slate-100 text-left">
      <div className="max-w-6xl mx-auto px-4">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800 pb-6 mb-8 gap-4">
          <div>
            <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest block mb-1">Operación Privada</span>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white m-0">Administración de Catálogo</h1>
          </div>
          <button onClick={() => setView('home')} className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg text-xs font-bold transition">
            Cerrar Panel Privado
          </button>
        </div>

        {!isAdminLoggedIn ? (
          <div className="max-w-md mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl my-12">
            <div className="text-center mb-6">
              <span className="text-3xl block mb-2">🔐</span>
              <h3 className="font-bold text-white text-base">Autenticación de Administrador</h3>
              <p className="text-xs text-slate-400 mt-1">Ingresá tus credenciales para gestionar propiedades.</p>
            </div>
            {adminError && <div className="bg-red-950/40 border border-red-800 text-red-300 text-xs p-3 rounded-lg mb-4 text-center">{adminError}</div>}
            <form onSubmit={handleAdminLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Email Corporativo</label>
                <input type="email" value={adminUsername} onChange={(e) => setAdminUsername(e.target.value)} className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg p-2.5 text-xs focus:outline-none focus:border-orange-500 font-mono" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Contraseña</label>
                <input type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg p-2.5 text-xs focus:outline-none focus:border-orange-500 font-mono" />
              </div>
              <button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold p-3 rounded-xl text-xs uppercase tracking-wider transition-all mt-2">Iniciar Sesión</button>
            </form>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Formulario Izquierdo */}
            <div className="lg:col-span-1 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4">
              <h3 className="font-extrabold text-white text-xs uppercase tracking-wider border-b border-slate-800 pb-2 m-0">Publicar Nueva Reforma</h3>

              <form onSubmit={handleFormSubmit} className="space-y-3 text-xs text-slate-300">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Título comercial</label>
                  <input type="text" required placeholder="Ej. PH Remodelado con Terraza" value={newProp.title} onChange={(e) => setNewProp({...newProp, title: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-orange-500" />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Precio (USD)</label>
                    <input type="number" required placeholder="150000" value={newProp.price} onChange={(e) => setNewProp({...newProp, price: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Localidad</label>
                    <input type="text" required placeholder="La Plata" value={newProp.location} onChange={(e) => setNewProp({...newProp, location: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Dirección exacta</label>
                    <input type="text" required placeholder="Calle 50 nro 400" value={newProp.address} onChange={(e) => setNewProp({...newProp, address: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Piso / Planta</label>
                    <input type="text" required placeholder="PB, 1er Piso" value={newProp.floor} onChange={(e) => setNewProp({...newProp, floor: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Tipo Inmueble</label>
                    <select value={newProp.type} onChange={(e) => setNewProp({...newProp, type: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white">
                      <option value="Departamento">Departamento</option>
                      <option value="PH">PH</option>
                      <option value="Casa">Casa</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Apto Banco</label>
                    <select value={newProp.bankEligible} onChange={(e) => setNewProp({...newProp, bankEligible: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white">
                      <option value="Sí">Sí</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-1.5">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 mb-0.5">Amb.</label>
                    <input type="number" value={newProp.rooms} onChange={(e) => setNewProp({...newProp, rooms: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-white text-center" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 mb-0.5">Dorm.</label>
                    <input type="number" value={newProp.beds} onChange={(e) => setNewProp({...newProp, beds: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-white text-center" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 mb-0.5">Baños</label>
                    <input type="number" value={newProp.baths} onChange={(e) => setNewProp({...newProp, baths: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-white text-center" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 mb-0.5">Cub M²</label>
                    <input type="number" required placeholder="80" value={newProp.sizeBuilt} onChange={(e) => setNewProp({...newProp, sizeBuilt: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-white text-center" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-1.5">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 mb-0.5">Tot M²</label>
                    <input type="number" required placeholder="100" value={newProp.sizeTotal} onChange={(e) => setNewProp({...newProp, sizeTotal: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-white text-center" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 mb-0.5">Semic M²</label>
                    <input type="number" value={newProp.sizeSemiCovered} onChange={(e) => setNewProp({...newProp, sizeSemiCovered: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-white text-center" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 mb-0.5">Desc M²</label>
                    <input type="number" value={newProp.sizeUncovered} onChange={(e) => setNewProp({...newProp, sizeUncovered: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-white text-center" />
                  </div>
                </div>

                {/* 📸 SECCIÓN IMÁGENES DE CLOUDINARY */}
                <div className="border-t border-slate-800 pt-2 space-y-2">
                  <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider block">Galería Multimedia (URLs)</span>
                  <div>
                    <label className="block text-[9px] text-slate-400 mb-0.5">Foto de Portada Principal</label>
                    <input type="text" placeholder="https://res.cloudinary.com/.../portada.jpg" value={newProp.coverImage} onChange={(e) => setNewProp({...newProp, coverImage: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-white" />
                  </div>
                  <div>
                    <label className="block text-[9px] text-slate-400 mb-0.5">Fotos Secundarias (Separadas por comas)</label>
                    <textarea rows="1" placeholder="url1.jpg, url2.jpg, url3.jpg" value={newProp.galleryUrls} onChange={(e) => setNewProp({...newProp, galleryUrls: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-white focus:outline-none"></textarea>
                  </div>
                </div>

                {/* 📐 SECCIÓN COMPARADOR ANTES Y DESPUÉS */}
                <div className="border-t border-slate-800 pt-2 space-y-2">
                  <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider block">Estudio de Obra (Antes y Después)</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[9px] text-slate-400 mb-0.5">Nombre Espacio</label>
                      <input type="text" value={newProp.compName} onChange={(e) => setNewProp({...newProp, compName: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-white" />
                    </div>
                    <div>
                      <label className="block text-[9px] text-slate-400 mb-0.5">URL Foto Antes</label>
                      <input type="text" placeholder="https://..." value={newProp.compBefore} onChange={(e) => setNewProp({...newProp, compBefore: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-white" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[9px] text-slate-400 mb-0.5">URL Foto Después (Terminado)</label>
                    <input type="text" placeholder="https://..." value={newProp.compAfter} onChange={(e) => setNewProp({...newProp, compAfter: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-white" />
                  </div>
                </div>

                <div className="border-t border-slate-800 pt-2">
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Reseña Comercial</label>
                  <textarea rows="2" placeholder="Acabados, iluminación, etc..." value={newProp.description} onChange={(e) => setNewProp({...newProp, description: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-orange-500"></textarea>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Historia técnica (Reforma)</label>
                  <textarea rows="2" placeholder="Detalle estructural de la obra..." value={newProp.reformStory} onChange={(e) => setNewProp({...newProp, reformStory: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-orange-500"></textarea>
                </div>

                <div className="flex space-x-2 mt-4">
                  <button type="submit" className="flex-grow bg-orange-600 hover:bg-orange-700 text-white font-bold p-3 rounded-xl text-xs uppercase tracking-wider transition-all">
                    {isEditing ? '✓ Guardar Cambios' : '✓ Publicar Propiedad'}
                  </button>
                  {isEditing && (
                    <button type="button" onClick={() => {
                      setIsEditing(false); setEditingId(null);
                      setNewProp({
                        title: '', price: '', location: 'La Plata, Buenos Aires', operation: 'Venta', type: 'Departamento', rooms: '3', beds: '2', baths: '1', sizeBuilt: '', sizeTotal: '', sizeSemiCovered: '0', sizeUncovered: '0', floor: 'PB', bankEligible: 'Sí', address: '', description: '', reformStory: '', coverImage: '', galleryUrls: '', compName: 'Espacio Principal', compBefore: '', compAfter: ''
                      });
                    }} className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-3 rounded-xl text-xs font-bold transition">
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Tabla Derecha */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
                <h3 className="font-extrabold text-white text-xs uppercase tracking-wider mb-4 m-0">Inmuebles en Catálogo</h3>
                <div className="overflow-x-auto">
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
                            <button onClick={() => { setView('home'); triggerToast("Redirigido al catálogo.", "info"); }} className="text-slate-400 hover:text-white text-xs transition">Ver público</button>
                            <button onClick={() => handleStartEdit(p)} className="text-amber-500 hover:text-amber-400 text-xs font-bold transition">Editar</button>
                            <button onClick={() => handleDeleteProperty(p.id)} className="text-red-500 hover:text-red-400 text-xs font-bold transition">Eliminar</button>
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