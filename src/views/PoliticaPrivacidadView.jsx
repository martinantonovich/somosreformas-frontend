import React from 'react';

export default function PoliticaPrivacidadView({ navigateTo }) {
  return (
    <main className="bg-gray-100 flex-grow text-left py-16 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-neutral-100 shadow-sm p-6 sm:p-10 space-y-8">
        <div>
          <button
            onClick={() => navigateTo('home')}
            className="text-xs font-bold text-slate-600 hover:text-orange-600 transition mb-4 inline-block"
          >
            ❮ Volver al inicio
          </button>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">Política de Privacidad</h1>
          <p className="text-xs text-slate-400 mt-2">Última actualización: julio de 2026</p>
        </div>

        <section className="space-y-3">
          <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">¿Qué datos recopilamos?</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Cuando completás el formulario de contacto o el cotizador, guardamos los datos que nos das (nombre, email, teléfono y tu consulta) para poder responderte. No los compartimos con terceros salvo lo necesario para gestionar tu consulta (por ejemplo, contactarte por WhatsApp).
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Cookies y analítica</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Usamos <strong>Google Analytics</strong> para entender cómo se usa el sitio (qué páginas se visitan, desde dónde llega la gente, etc.). Para eso, Google Analytics instala cookies propias en tu navegador (<code className="bg-neutral-100 px-1 rounded text-[11px]">_ga</code>, <code className="bg-neutral-100 px-1 rounded text-[11px]">_ga_*</code>) que nos permiten reconocer visitas, sin identificarte personalmente.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">
            También usamos <strong>Vercel Analytics</strong>, que no utiliza cookies: mide visitas de forma anónima y agregada.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">
            Podés bloquear estas cookies desde la configuración de tu navegador en cualquier momento; el sitio sigue funcionando igual, solo dejamos de poder medir tu visita.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Contacto</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Si querés que eliminemos tus datos de contacto o tenés alguna consulta sobre esta política, escribinos a{' '}
            <a href="mailto:reformassomos@gmail.com" className="text-orange-600 font-semibold hover:underline">reformassomos@gmail.com</a>.
          </p>
        </section>
      </div>
    </main>
  );
}
