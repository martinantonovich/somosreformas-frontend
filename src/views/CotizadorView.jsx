import React, { useState } from 'react';

export default function CotizadorView({ triggerToast, navigateTo }) {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8090';

  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    tipoInmueble: 'Departamento',
    m2Aproximados: '',
    objetivoReforma: 'Vender más caro',
    mensaje: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      nombre: `${form.nombre.trim()} ${form.apellido.trim()}`,
      email: form.email,
      telefono: form.telefono,
      mensaje: form.mensaje || 'Sin comentarios adicionales.',
      origen: 'cotizador',
      tipoInmueble: form.tipoInmueble,
      m2Aproximados: parseInt(form.m2Aproximados) || null,
      objetivoReforma: form.objetivoReforma
    };

    fetch(`${apiUrl}/api/consultas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then((res) => {
        if (!res.ok) throw new Error('Error al enviar la cotización al servidor');
        return res.json();
      })
      .then(() => {
        triggerToast(`¡Gracias ${form.nombre}! Recibimos tu solicitud y te vamos a contactar a la brevedad.`, 'success');
        setForm({
          nombre: '', apellido: '', email: '', telefono: '',
          tipoInmueble: 'Departamento', m2Aproximados: '',
          objetivoReforma: 'Vender más caro', mensaje: ''
        });
      })
      .catch(() => {
        triggerToast('No se pudo enviar la cotización. Intentá nuevamente más tarde.', 'error');
      })
      .finally(() => setIsSubmitting(false));
  };

  const handleWhatsAppDirect = () => {
    const text = encodeURIComponent('¡Hola Somos Reformas! Quiero cotizar la reforma de mi propiedad.');
    window.open(`https://wa.me/5492216397424?text=${text}`, '_blank');
  };

  return (
    <main className="bg-gray-100 flex-grow text-left">

      {/* HERO */}
      <section className="relative bg-slate-950 text-white py-20 overflow-hidden px-4 text-center">
        <div className="relative max-w-4xl mx-auto text-center flex flex-col items-center justify-center space-y-6">
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight max-w-4xl mx-auto text-center text-white block w-full">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-400 block mt-2 text-center w-full">
              Cotizá la reforma de tu propiedad
            </span>
          </h1>
          <p className="text-white text-xs sm:text-sm max-w-2xl mx-auto text-center leading-relaxed font-light block w-full">
            Ya sea para venderla más cara o para vivir en un lugar mejor, te ayudamos a transformar tu propiedad con el mismo estándar premium que ves en nuestras obras realizadas.
          </p>
        </div>
      </section>

      {/* BENEFICIOS */}
      <section className="relative -mt-8 max-w-6xl mx-auto px-4 z-30">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl shadow-xl border border-neutral-100 p-5 text-center">
            <span className="text-2xl block mb-2">💰</span>
            <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider mb-1">Vendé más caro</h3>
            <p className="text-[11px] text-slate-500 leading-relaxed">Una reforma integral premium eleva el valor de venta muy por encima de su costo.</p>
          </div>
          <div className="bg-white rounded-2xl shadow-xl border border-neutral-100 p-5 text-center">
            <span className="text-2xl block mb-2">🏡</span>
            <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider mb-1">Viví en un lugar mejor</h3>
            <p className="text-[11px] text-slate-500 leading-relaxed">Rediseñamos y renovamos tu espacio para que disfrutes vivir ahí, sin mudarte.</p>
          </div>
          <div className="bg-white rounded-2xl shadow-xl border border-neutral-100 p-5 text-center">
            <span className="text-2xl block mb-2">📐</span>
            <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider mb-1">Proceso transparente</h3>
            <p className="text-[11px] text-slate-500 leading-relaxed">Seguimiento con fotos, videos y avances de obra, ambiente por ambiente.</p>
          </div>
        </div>
      </section>

      {/* FORMULARIO + CONTACTO */}
      <section className="max-w-6xl mx-auto px-4 py-16 grid grid-cols-1 lg:grid-cols-12 gap-8">

        <div className="lg:col-span-7 bg-white border border-neutral-100 p-6 rounded-2xl shadow-sm">
          <span className="text-[10px] font-extrabold text-orange-600 uppercase tracking-widest block mb-1">Solicitá tu cotización</span>
          <h2 className="text-slate-950 font-black text-lg mb-4">Contanos sobre tu propiedad</h2>

          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Nombre</label>
                <input type="text" required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="w-full bg-neutral-50 border border-neutral-200 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:border-orange-500" />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Apellido</label>
                <input type="text" required value={form.apellido} onChange={(e) => setForm({ ...form, apellido: e.target.value })} className="w-full bg-neutral-50 border border-neutral-200 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:border-orange-500" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Correo Electrónico</label>
                <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full bg-neutral-50 border border-neutral-200 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:border-orange-500" />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Celular / WhatsApp</label>
                <input type="tel" required value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} className="w-full bg-neutral-50 border border-neutral-200 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:border-orange-500" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Tipo de Inmueble</label>
                <select value={form.tipoInmueble} onChange={(e) => setForm({ ...form, tipoInmueble: e.target.value })} className="w-full bg-neutral-50 border border-neutral-200 rounded-lg p-2.5 text-slate-800">
                  <option value="Departamento">Departamento</option>
                  <option value="PH">PH</option>
                  <option value="Casa">Casa</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">M² Aproximados</label>
                <input type="number" placeholder="Ej. 80" value={form.m2Aproximados} onChange={(e) => setForm({ ...form, m2Aproximados: e.target.value })} className="w-full bg-neutral-50 border border-neutral-200 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:border-orange-500" />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">¿Cuál es tu objetivo?</label>
              <select value={form.objetivoReforma} onChange={(e) => setForm({ ...form, objetivoReforma: e.target.value })} className="w-full bg-neutral-50 border border-neutral-200 rounded-lg p-2.5 text-slate-800">
                <option value="Vender más caro">Vender la propiedad más cara</option>
                <option value="Vivir mejor">Vivir en un lugar mejor</option>
                <option value="Ambas">Ambas cosas</option>
                <option value="No sé aún">Todavía no lo sé</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Contanos más (opcional)</label>
              <textarea rows="3" placeholder="Estado actual de la propiedad, ambientes a reformar, plazos..." value={form.mensaje} onChange={(e) => setForm({ ...form, mensaje: e.target.value })} className="w-full bg-neutral-50 border border-neutral-200 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:border-orange-500"></textarea>
            </div>

            <button type="submit" disabled={isSubmitting} className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition-all duration-200 active:scale-[0.99] disabled:bg-neutral-300">
              {isSubmitting ? 'Enviando...' : 'Solicitar Cotización'}
            </button>
          </form>
        </div>

        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-950 text-white rounded-2xl p-6 shadow-sm space-y-3">
            <span className="text-[10px] font-extrabold text-orange-500 uppercase tracking-widest block">Contacto Directo</span>
            <p className="text-xs text-slate-300 leading-relaxed">¿Preferís hablar directamente con nosotros? Escribinos por WhatsApp y te asesoramos sin compromiso.</p>
            <button onClick={handleWhatsAppDirect} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-4 rounded-xl text-xs transition flex items-center justify-center space-x-2 shadow-sm active:scale-[0.98]">
              <span>Consultar por WhatsApp</span>
            </button>
            <div className="text-xs space-y-1.5 text-slate-400 font-medium pt-3 border-t border-slate-900">
              <p>📍 La Plata, Buenos Aires</p>
              <p>📍 La Costa, Buenos Aires</p>
              <p>✉ reformassomos@gmail.com</p>
              <p>📞 +54 9 221 6397424</p>
            </div>
          </div>

          <div className="bg-white border border-neutral-100 rounded-2xl p-6 shadow-sm">
            <span className="text-[10px] font-extrabold text-orange-600 uppercase tracking-widest block mb-1">Prueba Social</span>
            <p className="text-xs text-slate-600 leading-relaxed mb-3">Mirá el antes y después de las obras que ya completamos antes de cotizar la tuya.</p>
            {navigateTo && (
              <button onClick={() => navigateTo('reformas')} className="w-full bg-slate-950 hover:bg-orange-600 text-white text-[11px] font-bold py-2.5 rounded-xl transition">
                Ver reformas realizadas ➔
              </button>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
