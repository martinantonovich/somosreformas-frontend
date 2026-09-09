import { cloudinaryDisplayUrl } from './media.js';

// Mapea los comparables "crudos" que manda el backend (procesoMedia + etapa) al formato de
// 3 columnas (antesMedia/duranteMedia/actualMedia) que usan tanto el sitio público (DetailView)
// como el panel de admin (editor de "Estudio de Obra"). Centralizado acá para no repetir la
// lógica de agrupamiento por etapa en los dos lugares.
export function mapearComparablesDesdeBackend(comparablesCrudos) {
  return (comparablesCrudos || []).map(comp => {
    const todosMedia = (comp.procesoMedia || []).map(m => ({
      url: cloudinaryDisplayUrl(m.urlMedia),
      tipo: m.tipoMedia,
      descripcion: m.descripcion || '',
      etapa: m.etapa || 'DURANTE'
    }));

    const antesMedia = todosMedia.filter(m => m.etapa === 'ANTES');
    const duranteMedia = todosMedia.filter(m => m.etapa === 'DURANTE');
    const actualMedia = todosMedia.filter(m => m.etapa === 'ACTUAL');

    // Compatibilidad con reformas cargadas antes de este esquema de 3 columnas
    if (antesMedia.length === 0 && comp.urlAntes) {
      antesMedia.push({ url: cloudinaryDisplayUrl(comp.urlAntes), tipo: 'imagen', descripcion: '' });
    }
    if (actualMedia.length === 0 && comp.urlDespues) {
      actualMedia.push({ url: cloudinaryDisplayUrl(comp.urlDespues), tipo: 'imagen', descripcion: '' });
    }
    if (duranteMedia.length === 0 && comp.urlVideo) {
      duranteMedia.push({ url: comp.urlVideo, tipo: 'video', descripcion: '' });
    }

    return {
      spaceName: comp.nombreEspacio || 'Espacio Principal',
      before: cloudinaryDisplayUrl(comp.urlAntes),
      after: cloudinaryDisplayUrl(comp.urlDespues),
      description: comp.descripcion || 'Transformación integral realizada por Somos Reformas.',
      video: comp.urlVideo || null,
      procesoMedia: todosMedia,
      antesMedia,
      duranteMedia,
      actualMedia,
      descripcionAntes: comp.descripcionAntes || '',
      descripcionDurante: comp.descripcionDurante || '',
      descripcionActual: comp.descripcionActual || ''
    };
  });
}
