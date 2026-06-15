import React, { useState } from 'react';

export default function Footer({ setView, triggerToast }) {
  const [footerContact, setFooterContact] = useState({
    nombre: '',
    apellido: '',
    email: '',
    celular: '',
    consulta: ''
  });

const handleFooterContactSubmit = (e) => {
    e.preventDefault();

    // 📦 Modelamos el payload exacto que espera la entidad Consulta de Spring Boot
    const consultaPayload = {
      nombre: `${footerContact.nombre.trim()} ${footerContact.apellido.trim()}`,
      email: footerContact.email,
      telefono: footerContact.celular,
      mensaje: footerContact.consulta
    };

    // 🚀 MANDAMOS LA CONSULTA AL BACKEND (Puerto 8090)
    fetch('http://localhost:8090/api/consultas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(consultaPayload)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Error al enviar la consulta al servidor');
      }
      return response.json();
    })
    .then(() => {
      // Notificación flotante de éxito
      triggerToast(`¡Gracias ${footerContact.nombre}! Tu consulta fue enviada con éxito.`, "success");
      
      // Reseteamos el formulario para dejarlo limpio
      setFooterContact({
        nombre: '',
        apellido: '',
        email: '',
        celular: '',
        consulta: ''
      });
    })
    .catch(error => {
      console.error("Error al enviar formulario:", error);
      triggerToast("No se pudo enviar la consulta. Intentá nuevamente más tarde.", "error");
    });
  };
  
  return (
    <footer id="footer-contact" className="bg-slate-950 text-slate-400 border-t border-slate-900 py-16 mt-auto text-left">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Columna Izquierda: Info de Marca */}
        <div className="lg:col-span-5 space-y-6">
          <div className="flex items-center space-x-3">
            <span className="text-white font-light tracking-widest uppercase text-base">
              somos<span className="font-extrabold text-orange-500">reformas</span>
            </span>
          </div>
          <p className="text-xs leading-relaxed text-white font-light max-w-sm">
            Especialistas en la refacción y remodelación de propiedades.
          </p>
          <div className="text-xs space-y-2 text-slate-400 font-medium">
            <p>📍 La Plata, Buenos Aires</p>
            <p>📍 La Costa, Buenos Aires</p>
            
            <p>✉ somosreformas@gmail.com</p>
            <p>📞 +54 9 221 6397424</p>
          </div>
          <p className="text-[10px] text-slate-700">
            <span 
              onClick={() => { setView('admin'); triggerToast("Accediendo al panel administrativo.", "info"); }}
              className="cursor-pointer hover:text-orange-500 font-bold"
              title="Acceso secreto"
            >
              ©
            </span> 2026 Teddyware. Todos los derechos reservados.
          </p>
        </div>

        {/* Columna Derecha: Formulario de Contacto Real */}
        <div className="lg:col-span-7 bg-slate-900/40 border border-slate-200 p-6 rounded-2xl shadow-xl space-y-4">
          <div>
            <span className="text-[10px] font-extrabold text-orange-500 uppercase tracking-widest block mb-1">Contacto Comercial</span>
            <h3 className="text-white font-bold text-sm">¿Tenés una consulta o querés coordinar una visita?</h3>
          </div>

          <form onSubmit={handleFooterContactSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-white mb-1">Nombre</label>
                <input 
                  type="text" required placeholder="Ej. Sofía" value={footerContact.nombre}
                  onChange={(e) => setFooterContact({...footerContact, nombre: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-white mb-1">Apellido</label>
                <input 
                  type="text" required placeholder="Ej. Martínez" value={footerContact.apellido}
                  onChange={(e) => setFooterContact({...footerContact, apellido: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-white mb-1">Correo Electrónico</label>
                <input 
                  type="email" required placeholder="sofia@ejemplo.com" value={footerContact.email}
                  onChange={(e) => setFooterContact({...footerContact, email: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-white mb-1">Celular / WhatsApp</label>
                <input 
                  type="tel" required placeholder="Ej. 11 1234-5678" value={footerContact.celular}
                  onChange={(e) => setFooterContact({...footerContact, celular: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-white mb-1">Consulta</label>
              <textarea 
                rows="3" required placeholder="Escribí tu consulta sobre las propiedades..." value={footerContact.consulta}
                onChange={(e) => setFooterContact({...footerContact, consulta: e.target.value})}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-orange-500"
              ></textarea>
            </div>

            <button 
              type="submit" 
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition-all duration-200 active:scale-[0.99]"
            >
              Enviar Consulta
            </button>
          </form>
        </div>

      </div>
    </footer>
  );
}