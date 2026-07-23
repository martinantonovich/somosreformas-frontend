// 🗺️ Arma una imagen de mapa estática combinando tiles oficiales de OpenStreetMap en un canvas,
// ya que los servicios comunitarios de "static map" sin API key (staticmap.openstreetmap.de y
// similares) dejaron de existir. tile.openstreetmap.org sí sirve los tiles con CORS abierto,
// así que los combinamos nosotros y dibujamos el marcador encima.
// Requisito de la licencia de OSM: siempre mostrar la atribución "© OpenStreetMap contributors".

const TILE_SIZE = 256;

function lonToWorldX(lon, zoom) {
  return ((lon + 180) / 360) * TILE_SIZE * 2 ** zoom;
}

function latToWorldY(lat, zoom) {
  const latRad = (lat * Math.PI) / 180;
  return ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * TILE_SIZE * 2 ** zoom;
}

function cargarImagen(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

// Devuelve un data URL (PNG) de un mapa de `width`x`height` px centrado en (lat, lon).
export async function generarMapaEstatico(lat, lon, { width = 500, height = 260, zoom = 15 } = {}) {
  const centerX = lonToWorldX(lon, zoom);
  const centerY = latToWorldY(lat, zoom);
  const originX = centerX - width / 2;
  const originY = centerY - height / 2;

  const tileMinX = Math.floor(originX / TILE_SIZE);
  const tileMaxX = Math.floor((originX + width) / TILE_SIZE);
  const tileMinY = Math.floor(originY / TILE_SIZE);
  const tileMaxY = Math.floor((originY + height) / TILE_SIZE);
  const maxTileIndex = 2 ** zoom - 1;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#e5e3df';
  ctx.fillRect(0, 0, width, height);

  const cargas = [];
  for (let tx = tileMinX; tx <= tileMaxX; tx++) {
    for (let ty = tileMinY; ty <= tileMaxY; ty++) {
      if (tx < 0 || ty < 0 || tx > maxTileIndex || ty > maxTileIndex) continue;
      const url = `https://tile.openstreetmap.org/${zoom}/${tx}/${ty}.png`;
      cargas.push(
        cargarImagen(url)
          .then(img => ctx.drawImage(img, tx * TILE_SIZE - originX, ty * TILE_SIZE - originY))
          .catch(() => {}) // Si un tile puntual falla, seguimos con el resto del mosaico
      );
    }
  }
  await Promise.all(cargas);

  // Marcador (pin) centrado, con los colores de la marca
  const cx = width / 2;
  const cy = height / 2;
  ctx.beginPath();
  ctx.moveTo(cx, cy + 14);
  ctx.quadraticCurveTo(cx - 11, cy - 2, cx, cy - 12);
  ctx.quadraticCurveTo(cx + 11, cy - 2, cx, cy + 14);
  ctx.closePath();
  ctx.fillStyle = '#ea580c';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#ffffff';
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy - 4, 4, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();

  // Atribución obligatoria por la licencia de datos de OSM
  ctx.font = '10px sans-serif';
  const atribucion = '© OpenStreetMap contributors';
  const anchoTexto = ctx.measureText(atribucion).width;
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.fillRect(0, height - 14, anchoTexto + 8, 14);
  ctx.fillStyle = '#333333';
  ctx.fillText(atribucion, 4, height - 4);

  return canvas.toDataURL('image/png');
}
