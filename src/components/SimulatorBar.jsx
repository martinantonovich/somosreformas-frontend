import React from 'react';

export default function SimulatorBar({ view, setView, urlInput, setUrlInput, properties, setSelectedProperty, triggerToast }) {
  
  const handleUrlSubmit = (e) => {
    e.preventDefault();
    const cleanUrl = urlInput.trim().toLowerCase();
    
    if (cleanUrl.includes('/admin') || cleanUrl.endsWith('admin')) {
      setView('admin');
      setSelectedProperty(null);
    } else if (cleanUrl.includes('somosreformas.com') && (cleanUrl.endsWith('/') || cleanUrl.endsWith('.com'))) {
      setView('home');
      setSelectedProperty(null);
    } else {
      const found = properties.find(p => cleanUrl.includes(p.slug));
      if (found) {
        setSelectedProperty(found);
        setView('detail');
      } else {
        triggerToast("URL no válida. Prueba con /admin", "error");
      }
    }
  };

  return (
    <div className="bg-slate-900 text-white px-4 py-2 flex items-center space-x-3 text-xs border-b border-slate-800">
      <button onClick={() => { setView('home'); setSelectedProperty(null); }} className="p-1 bg-slate-800 rounded hover:bg-slate-700">🏠</button>
      <div className="flex-grow max-w-xl">
        <form onSubmit={handleUrlSubmit} className="relative flex items-center">
          <input 
            type="text" value={urlInput} onChange={(e) => setUrlInput(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-slate-300 font-mono text-[11px] rounded-lg pl-3 pr-10 py-1"
          />
          <button type="submit" className="absolute right-1 px-2 py-0.5 bg-orange-600 rounded text-[10px] text-white">Ir</button>
        </form>
      </div>
    </div>
  );
}