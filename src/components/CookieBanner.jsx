import React, { useState, useEffect } from 'react';

const STORAGE_KEY = 'sr_cookie_notice_visto';

export default function CookieBanner({ navigateTo }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, '1');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 bg-slate-950 text-white px-4 py-3 sm:py-4 shadow-2xl border-t border-slate-800">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
        <p className="text-[11px] sm:text-xs text-slate-300 leading-relaxed flex-grow text-center sm:text-left">
          🍪 Usamos cookies para analizar el tráfico del sitio (Google Analytics) y mejorar tu experiencia.{' '}
          <button
            onClick={() => { setVisible(false); navigateTo('politica'); }}
            className="text-orange-400 font-semibold hover:underline"
          >
            Más información
          </button>
        </p>
        <button
          onClick={dismiss}
          className="w-full sm:w-auto shrink-0 bg-orange-600 hover:bg-orange-700 text-white font-bold px-5 py-2 rounded-lg text-xs transition"
        >
          Entendido
        </button>
      </div>
    </div>
  );
}
