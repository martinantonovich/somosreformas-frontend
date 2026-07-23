// Cloudinary siempre mete el resource_type en la URL ("/video/upload/" vs "/image/upload/"),
// así que no hace falta guardar el tipo aparte para saber cómo renderizar cada archivo.
export function isVideoUrl(url) {
  if (!url) return false;
  return url.includes('/video/upload/') || /\.(mp4|webm|mov|m4v)(\?|$)/i.test(url);
}
