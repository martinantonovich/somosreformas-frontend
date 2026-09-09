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
  // f_auto y q_auto van separados por "/" (transformaciones encadenadas), NO por "," — el
  // admin guarda temporalmente varias URLs juntas separadas por comas (galleryUrls), y una
  // coma adentro de la URL misma la corta a la mitad ahí. Con "/" no hay ese choque.
  return url.replace('/image/upload/', '/image/upload/f_auto/q_auto/');
}

// Quita el audio al reproducir un video de Cloudinary (transformación ac_none), sin tener
// que volver a subirlo. Se usa cuando el admin marca un video como "Sin sonido".
export function cloudinaryMuteUrl(url) {
  if (!url || typeof url !== 'string') return url;
  if (!url.includes('res.cloudinary.com') || !url.includes('/video/upload/')) return url;
  if (url.includes('/video/upload/ac_none')) return url; // ya tiene la transformación
  return url.replace('/video/upload/', '/video/upload/ac_none/');
}

// Aplica cloudinaryMuteUrl solo si corresponde (es video Y está marcado sin sonido).
export function aplicarSinSonido(url, sinSonido) {
  return sinSonido && isVideoUrl(url) ? cloudinaryMuteUrl(url) : url;
}

// Inverso de aplicarSinSonido: al editar una propiedad ya guardada, sólo llega la URL final
// (con o sin la transformación ac_none ya aplicada), no el booleano por separado — se
// reconstruye mirando si la URL la tiene.
export function tieneSinSonido(url) {
  return typeof url === 'string' && url.includes('/video/upload/ac_none');
}
