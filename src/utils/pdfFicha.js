import { stripHtml } from './richText';
import { isVideoUrl } from './media';
import { generarMapaEstatico } from './osmMap';

// Las fuentes básicas de PDF (Helvetica) sólo soportan WinAnsi/Latin-1 + un puñado de símbolos
// de tipografía (comillas, guiones, viñeta). Cualquier emoji u otro símbolo fuera de eso sale
// como caracteres corruptos, así que los sacamos de cualquier texto que vaya al PDF.
function sanitizeForPdf(text) {
  if (!text) return '';
  return text
    .replace(/[^\x00-\xFF‘’“”–—•…]/gu, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/ +([.,!?;:])/g, '$1')
    .trim();
}

async function urlToDataUrl(url) {
  try {
    const response = await fetch(url, { mode: 'cors' });
    const blob = await response.blob();
    const formato = blob.type.includes('png') ? 'PNG' : 'JPEG';
    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    const { width, height } = await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = reject;
      img.src = dataUrl;
    });
    return { dataUrl, formato, width, height };
  } catch {
    return null;
  }
}

// Encaja una imagen dentro de un cuadro máximo sin recortarla ni distorsionarla (como object-fit: contain).
function encajarEnCaja(imgWidth, imgHeight, maxWidth, maxHeight) {
  const escala = Math.min(maxWidth / imgWidth, maxHeight / imgHeight);
  return { width: imgWidth * escala, height: imgHeight * escala };
}

// 🎨 Paleta de marca (la misma que el sitio: navy oscuro + acento naranja)
const NAVY = [2, 6, 23];
const ORANGE = [234, 88, 12];
const CREAM = [250, 248, 245];
const GRAY_LINE = [225, 220, 212];
const GRAY_TEXT = [90, 90, 90];
const DARK_TEXT = [20, 20, 20];

const HEADER_H = 24;
const FOOTER_H = 16;
const MARGIN = 14;

function drawChrome(doc, pageWidth, pageHeight) {
  // Header
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, pageWidth, HEADER_H, 'F');
  doc.setFont('helvetica', 'bold').setFontSize(13).setTextColor(255, 255, 255);
  doc.text('SOMOS', MARGIN, HEADER_H / 2 + 3);
  doc.setTextColor(...ORANGE);
  doc.text('REFORMAS', MARGIN + doc.getTextWidth('SOMOS ') + 1, HEADER_H / 2 + 3);
  doc.setFont('helvetica', 'normal').setFontSize(8).setTextColor(180, 180, 190);
  doc.text('Real Estate & Premium Design', pageWidth - MARGIN, HEADER_H / 2 + 3, { align: 'right' });

  // Footer (el número de página se agrega al final, cuando ya sabemos el total)
  doc.setFillColor(...NAVY);
  doc.rect(0, pageHeight - FOOTER_H, pageWidth, FOOTER_H, 'F');
  const footerY = pageHeight - FOOTER_H / 2 + 1.5;
  doc.setFont('helvetica', 'normal').setFontSize(8).setTextColor(220, 220, 225);

  // Sitio e Instagram como links reales, cada uno abre su propia URL al hacer click
  let footerX = MARGIN;
  const sitio = 'somosreformas.com.ar';
  doc.textWithLink(sitio, footerX, footerY, { url: 'https://somosreformas.com.ar' });
  footerX += doc.getTextWidth(sitio);
  const separador = '   ·   ';
  doc.text(separador, footerX, footerY);
  footerX += doc.getTextWidth(separador);
  const instagram = '@somosreformas';
  doc.textWithLink(instagram, footerX, footerY, { url: 'https://www.instagram.com/somosreformas/' });

  doc.text('+54 9 2257526756', pageWidth - MARGIN, footerY, { align: 'right' });

  // Marco + fondo crema del área de contenido, para que no sea solo blanco liso
  const frameY = HEADER_H + 4;
  const frameH = pageHeight - HEADER_H - FOOTER_H - 8;
  doc.setFillColor(...CREAM);
  doc.roundedRect(MARGIN - 4, frameY, pageWidth - (MARGIN - 4) * 2, frameH, 3, 3, 'F');
  doc.setDrawColor(...ORANGE).setLineWidth(0.6);
  doc.roundedRect(MARGIN - 4, frameY, pageWidth - (MARGIN - 4) * 2, frameH, 3, 3, 'S');

  return HEADER_H + 10; // Y donde arranca el contenido
}

function crearEstado(doc) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  return { doc, pageWidth, pageHeight, y: drawChrome(doc, pageWidth, pageHeight) };
}

// Si lo próximo a dibujar no entra en lo que queda de página, arranca una hoja nueva.
function asegurarEspacio(state, necesario) {
  const limite = state.pageHeight - FOOTER_H - 6;
  if (state.y + necesario > limite) {
    state.doc.addPage();
    state.y = drawChrome(state.doc, state.pageWidth, state.pageHeight);
  }
}

function tituloSeccion(state, texto) {
  asegurarEspacio(state, 10);
  state.doc.setFillColor(...ORANGE);
  state.doc.rect(MARGIN, state.y - 3, 3, 3, 'F');
  state.doc.setFont('helvetica', 'bold').setFontSize(9.5).setTextColor(...NAVY);
  state.doc.text(sanitizeForPdf(texto).toUpperCase(), MARGIN + 5, state.y);
  state.y += 6;
}

function filaFicha(state, x, y, etiqueta, valor) {
  const { doc } = state;
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(x, y - 4.5, 40, 13, 1.5, 1.5, 'F');
  doc.setDrawColor(...GRAY_LINE).setLineWidth(0.3);
  doc.roundedRect(x, y - 4.5, 40, 13, 1.5, 1.5, 'S');
  doc.setFont('helvetica', 'bold').setFontSize(6.5).setTextColor(140, 140, 140);
  doc.text(sanitizeForPdf(etiqueta).toUpperCase(), x + 2.5, y);
  doc.setFont('helvetica', 'bold').setFontSize(10).setTextColor(...DARK_TEXT);
  doc.text(sanitizeForPdf(String(valor)), x + 2.5, y + 5.5);
}

// 📄 Arma un PDF de la ficha técnica de la propiedad, con el mismo diseño estándar para todas.
export async function generarFichaPDF(property) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const state = crearEstado(doc);
  const { pageWidth } = state;
  const contentWidth = pageWidth - MARGIN * 2;

  // Fotos: las que eligió el admin (📄 PDF en el panel), o si no eligió ninguna, las primeras
  // 4 de la galería (que ya incluyen la portada como primera). Se descartan videos.
  const candidatas = (property.pdfImages?.length > 0 ? property.pdfImages : (property.gallery || []).slice(0, 4))
    .filter(url => url && !isVideoUrl(url));
  const [fotoPrincipalUrl, ...fotosSecundariasUrls] = candidatas;

  // Foto principal
  if (fotoPrincipalUrl) {
    const foto = await urlToDataUrl(fotoPrincipalUrl);
    if (foto) {
      const maxHeight = 105;
      asegurarEspacio(state, maxHeight + 4);
      const { width, height } = encajarEnCaja(foto.width, foto.height, contentWidth, maxHeight);
      const x = MARGIN + (contentWidth - width) / 2;
      try {
        doc.addImage(foto.dataUrl, foto.formato, x, state.y, width, height, undefined, 'FAST');
        doc.setDrawColor(...GRAY_LINE).setLineWidth(0.3).rect(x, state.y, width, height, 'S');
      } catch {
        // Formato no soportado por jsPDF: seguimos sin la foto.
      }
      state.y += maxHeight + 8;
    }
  }

  // Título, ubicación y precio
  asegurarEspacio(state, 24);
  doc.setFont('helvetica', 'bold').setFontSize(16).setTextColor(...NAVY);
  doc.text(sanitizeForPdf(property.title) || 'Propiedad', MARGIN, state.y);
  state.y += 6;
  doc.setFont('helvetica', 'normal').setFontSize(10).setTextColor(...GRAY_TEXT);
  doc.text(sanitizeForPdf(`${property.direccion ? property.direccion + ' — ' : ''}${property.location || ''}`), MARGIN, state.y);
  state.y += 8;

  if (property.operation !== 'No Disponible') {
    const moneda = property.operation === 'Venta' ? 'USD' : 'ARS';
    const texto = sanitizeForPdf(`${property.operation} — ${moneda} ${(property.price ?? 0).toLocaleString('es-AR')}`);
    doc.setFont('helvetica', 'bold').setFontSize(12);
    const anchoTexto = doc.getTextWidth(texto);
    doc.setFillColor(...ORANGE);
    doc.roundedRect(MARGIN, state.y - 5.5, anchoTexto + 8, 9, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.text(texto, MARGIN + 4, state.y);
    state.y += 12;
  } else {
    state.y += 4;
  }

  // Fotos secundarias
  if (fotosSecundariasUrls.length > 0) {
    const fotos = (await Promise.all(fotosSecundariasUrls.map(urlToDataUrl))).filter(Boolean);
    if (fotos.length > 0) {
      const cellHeight = 46;
      asegurarEspacio(state, cellHeight + 6);
      const gap = 3;
      const cellWidth = (contentWidth - gap * (fotos.length - 1)) / fotos.length;
      fotos.forEach((foto, idx) => {
        const { width, height } = encajarEnCaja(foto.width, foto.height, cellWidth, cellHeight);
        const cellX = MARGIN + idx * (cellWidth + gap);
        const x = cellX + (cellWidth - width) / 2;
        const yImg = state.y + (cellHeight - height) / 2;
        try {
          doc.addImage(foto.dataUrl, foto.formato, x, yImg, width, height, undefined, 'FAST');
          doc.setDrawColor(...GRAY_LINE).setLineWidth(0.3).rect(x, yImg, width, height, 'S');
        } catch {
          // Se saltea esta foto si el formato no es compatible.
        }
      });
      state.y += cellHeight + 8;
    }
  }

  // Ficha técnica en grilla de "chips"
  const datos = [
    ['Tipo', property.type],
    ['Ambientes', property.rooms],
    ['Dormitorios', property.beds],
    ['Baños', property.baths],
    ['M² Totales', property.sizeTotal ? `${property.sizeTotal} m²` : '-'],
    ['M² Cubiertos', property.sizeCovered ? `${property.sizeCovered} m²` : '-'],
    ['Piso / Planta', property.floor || 'PB'],
    ['Condición', (!property.antiguedad) ? 'A Estrenar' : `${property.antiguedad} años`],
  ];
  tituloSeccion(state, 'Ficha Técnica');
  const filasDatos = Math.ceil(datos.length / 4);
  asegurarEspacio(state, filasDatos * 15);
  const colGap = 2;
  const colWidth = (contentWidth - colGap * 3) / 4;
  datos.forEach(([etiqueta, valor], idx) => {
    const col = idx % 4;
    const fila = Math.floor(idx / 4);
    filaFicha(state, MARGIN + col * (colWidth + colGap), state.y + fila * 15, etiqueta, valor ?? '-');
  });
  state.y += filasDatos * 15 + 4;

  // Descripción (texto plano, sin las etiquetas HTML del editor ni emojis)
  const descripcionPlano = sanitizeForPdf(stripHtml(property.description || property.descripcion || ''));
  if (descripcionPlano) {
    doc.setFont('helvetica', 'normal').setFontSize(9.5);
    const lineas = doc.splitTextToSize(descripcionPlano, contentWidth);
    tituloSeccion(state, 'Descripción');
    asegurarEspacio(state, lineas.length * 4.6 + 4);
    doc.setFont('helvetica', 'normal').setFontSize(9.5).setTextColor(60, 60, 60);
    doc.text(lineas, MARGIN, state.y);
    state.y += lineas.length * 4.6 + 6;
  }

  // Ubicación + mapa (tiles oficiales de OSM combinados en canvas, gratis y sin API key)
  if (property.latitud && property.longitud) {
    try {
      const mapDataUrl = await generarMapaEstatico(property.latitud, property.longitud, { width: 500, height: 260, zoom: 15 });
      tituloSeccion(state, 'Ubicación');
      const maxHeight = 55;
      asegurarEspacio(state, maxHeight + 4);
      const { width, height } = encajarEnCaja(500, 260, contentWidth, maxHeight);
      const x = MARGIN + (contentWidth - width) / 2;
      doc.addImage(mapDataUrl, 'PNG', x, state.y, width, height, undefined, 'FAST');
      doc.setDrawColor(...GRAY_LINE).setLineWidth(0.3).rect(x, state.y, width, height, 'S');
      state.y += maxHeight + 4;
    } catch {
      // Si el mapa no se pudo generar (sin red, tiles caídos), seguimos sin esa sección.
    }
  }

  // Numeración de páginas (recién ahora que sabemos el total)
  const totalPaginas = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPaginas; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal').setFontSize(8).setTextColor(220, 220, 225);
    doc.text(`Página ${i} de ${totalPaginas}`, state.pageWidth / 2, state.pageHeight - FOOTER_H / 2 + 1.5, { align: 'center' });
  }

  const nombreArchivo = (property.slug || 'propiedad') + '.pdf';
  doc.save(nombreArchivo);
}
