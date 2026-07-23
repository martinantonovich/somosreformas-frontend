import { stripHtml } from './richText';
import { isVideoUrl } from './media';

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

// Convierte una URL de imagen a data URL para poder incrustarla en el PDF.
// Si falla (CORS, red, etc.) devolvemos null y el PDF se genera igual, sin esa foto.
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

function filaFicha(doc, x, y, etiqueta, valor) {
  doc.setFont('helvetica', 'bold').setFontSize(7).setTextColor(120, 120, 120);
  doc.text(sanitizeForPdf(etiqueta).toUpperCase(), x, y);
  doc.setFont('helvetica', 'bold').setFontSize(11).setTextColor(20, 20, 20);
  doc.text(sanitizeForPdf(String(valor)), x, y + 5.5);
}

// 📄 Arma un PDF de la ficha técnica de la propiedad, con el mismo diseño estándar para todas.
export async function generarFichaPDF(property) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let y = 15;

  // Encabezado con marca
  doc.setFillColor(2, 6, 23);
  doc.rect(0, 0, pageWidth, 22, 'F');
  doc.setFont('helvetica', 'bold').setFontSize(14).setTextColor(255, 255, 255);
  doc.text('SOMOS', margin, 14);
  doc.setTextColor(234, 88, 12);
  doc.text('REFORMAS', margin + doc.getTextWidth('SOMOS ') + 2, 14);
  y = 32;

  // Fotos: las que eligió el admin (📄 PDF en el panel), o si no eligió ninguna, las primeras
  // 4 de la galería (que ya incluyen la portada como primera). Se descartan videos: un PDF no
  // reproduce video, así que si el admin marcó uno, simplemente no entra en la ficha.
  const candidatas = (property.pdfImages?.length > 0 ? property.pdfImages : (property.gallery || []).slice(0, 4))
    .filter(url => url && !isVideoUrl(url));

  const [fotoPrincipalUrl, ...fotosSecundariasUrls] = candidatas;

  // Foto principal: ocupa el ancho completo, alto según su propia proporción (sin estirarla)
  if (fotoPrincipalUrl) {
    const foto = await urlToDataUrl(fotoPrincipalUrl);
    if (foto) {
      const maxWidth = pageWidth - margin * 2;
      const maxHeight = 95;
      const { width, height } = encajarEnCaja(foto.width, foto.height, maxWidth, maxHeight);
      const xCentrado = margin + (maxWidth - width) / 2;
      try {
        doc.addImage(foto.dataUrl, foto.formato, xCentrado, y, width, height, undefined, 'FAST');
      } catch {
        // Formato no soportado por jsPDF: seguimos sin la foto.
      }
      y += maxHeight + 8;
    }
  }

  // Título, ubicación y precio
  doc.setFont('helvetica', 'bold').setFontSize(16).setTextColor(15, 15, 15);
  doc.text(sanitizeForPdf(property.title) || 'Propiedad', margin, y);
  y += 6;
  doc.setFont('helvetica', 'normal').setFontSize(10).setTextColor(90, 90, 90);
  doc.text(sanitizeForPdf(`${property.direccion ? property.direccion + ' — ' : ''}${property.location || ''}`), margin, y);
  y += 8;

  if (property.operation !== 'No Disponible') {
    const moneda = property.operation === 'Venta' ? 'USD' : 'ARS';
    doc.setFont('helvetica', 'bold').setFontSize(13).setTextColor(234, 88, 12);
    doc.text(sanitizeForPdf(`${property.operation} — ${moneda} ${(property.price ?? 0).toLocaleString('es-AR')}`), margin, y);
    y += 10;
  } else {
    y += 4;
  }

  // Fotos secundarias: grilla en su propia proporción, cada una encajada en su celda (sin recortar)
  if (fotosSecundariasUrls.length > 0) {
    const fotos = (await Promise.all(fotosSecundariasUrls.map(urlToDataUrl))).filter(Boolean);
    if (fotos.length > 0) {
      const gap = 3;
      const cellWidth = (pageWidth - margin * 2 - gap * (fotos.length - 1)) / fotos.length;
      const cellHeight = 38;
      fotos.forEach((foto, idx) => {
        const { width, height } = encajarEnCaja(foto.width, foto.height, cellWidth, cellHeight);
        const cellX = margin + idx * (cellWidth + gap);
        const x = cellX + (cellWidth - width) / 2;
        const yImg = y + (cellHeight - height) / 2;
        try {
          doc.addImage(foto.dataUrl, foto.formato, x, yImg, width, height, undefined, 'FAST');
        } catch {
          // Se saltea esta foto si el formato no es compatible.
        }
      });
      y += cellHeight + 8;
    }
  }

  // Ficha técnica en grilla
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

  const colWidth = (pageWidth - margin * 2) / 4;
  datos.forEach(([etiqueta, valor], idx) => {
    const col = idx % 4;
    const fila = Math.floor(idx / 4);
    filaFicha(doc, margin + col * colWidth, y + fila * 14, etiqueta, valor ?? '-');
  });
  y += Math.ceil(datos.length / 4) * 14 + 4;

  // Servicios
  const servicios = [];
  if (property.services?.electricidad) servicios.push('Electricidad');
  if (property.services?.gasNatural) servicios.push('Gas natural');
  if (property.services?.cloaca) servicios.push('Cloaca');
  if (servicios.length > 0) {
    doc.setDrawColor(230, 230, 230).line(margin, y, pageWidth - margin, y);
    y += 6;
    doc.setFont('helvetica', 'bold').setFontSize(9).setTextColor(50, 50, 50);
    doc.text('SERVICIOS DISPONIBLES', margin, y);
    y += 5;
    doc.setFont('helvetica', 'normal').setFontSize(9).setTextColor(70, 70, 70);
    doc.text(sanitizeForPdf(servicios.join('   •   ')), margin, y);
    y += 8;
  }

  // Descripción (texto plano, sin las etiquetas HTML del editor ni emojis)
  const descripcionPlano = sanitizeForPdf(stripHtml(property.description || property.descripcion || ''));
  if (descripcionPlano) {
    doc.setDrawColor(230, 230, 230).line(margin, y, pageWidth - margin, y);
    y += 6;
    doc.setFont('helvetica', 'bold').setFontSize(9).setTextColor(50, 50, 50);
    doc.text('DESCRIPCIÓN', margin, y);
    y += 5;
    doc.setFont('helvetica', 'normal').setFontSize(9.5).setTextColor(60, 60, 60);
    const lineas = doc.splitTextToSize(descripcionPlano, pageWidth - margin * 2);
    doc.text(lineas, margin, y);
    y += lineas.length * 4.5 + 4;
  }

  // Pie de página
  doc.setFont('helvetica', 'normal').setFontSize(8).setTextColor(150, 150, 150);
  doc.text('Somos Reformas — somosreformas.com.ar — +54 9 2257526756', margin, doc.internal.pageSize.getHeight() - 10);

  const nombreArchivo = (property.slug || 'propiedad') + '.pdf';
  doc.save(nombreArchivo);
}
