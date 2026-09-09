// Cloudinary siempre mete el resource_type en la URL ("/video/upload/" vs "/image/upload/"),
// así que no hace falta guardar el tipo aparte para saber cómo renderizar cada archivo.
export function isVideoUrl(url) {
  if (!url) return false;
  return url.includes('/video/upload/') || /\.(mp4|webm|mov|m4v)(\?|$)/i.test(url);
}

// Fuerza que Cloudinary entregue un formato que el navegador pueda mostrar. Sin esto, una
// foto subida en HEIC (el formato por defecto de las fotos de iPhone) queda guardada tal
// cual, y como casi ningún navegador puede mostrar HEIC en una etiqueta <img>, el archivo se
// ofrece para descargar en vez de verse — pasa igual con fotos ya subidas antes de este fix,
// porque la conversión se aplica al pedirla, no hace falta volver a subir nada.
export function cloudinaryDisplayUrl(url) {
  if (!url || typeof url !== 'string') return url;
  if (!url.includes('res.cloudinary.com') || !url.includes('/image/upload/')) return url;
  if (url.includes('/image/upload/f_auto')) return url; // ya tiene la transformación
  return url.replace('/image/upload/', '/image/upload/f_auto,q_auto/');
}
