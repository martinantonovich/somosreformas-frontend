import { stripHtml } from './richText';

// Convierte una URL de imagen a data URL para poder incrustarla en el PDF.
// Si falla (CORS, red, etc.) devolvemos null y el PDF se genera igual, sin foto.
async function urlToDataUrl(url) {
  try {
    const response = await fetch(url, { mode: 'cors' });
    const blob = await response.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

function filaFicha(doc, x, y, ancho, etiqueta, valor) {
  doc.setFont('helvetica', 'bold').setFontSize(7).setTextColor(120, 120, 120);
  doc.text(etiqueta.toUpperCase(), x, y);
  doc.setFont('helvetica', 'bold').setFontSize(11).setTextColor(20, 20, 20);
  doc.text(String(valor), x, y + 5.5);
}

// 📄 Arma un PDF de la ficha técnica de la propiedad, con los mismos datos que se ven en el detalle.
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

  // Foto de portada (si se puede descargar)
  const coverDataUrl = await urlToDataUrl(property.coverImage);
  if (coverDataUrl) {
    const imgWidth = pageWidth - margin * 2;
    const imgHeight = imgWidth * 0.55;
    try {
      doc.addImage(coverDataUrl, 'JPEG', margin, y, imgWidth, imgHeight, undefined, 'FAST');
      y += imgHeight + 8;
    } catch {
      // Si el formato de la imagen no es compatible, seguimos sin ella.
    }
  }

  // Título y precio
  doc.setFont('helvetica', 'bold').setFontSize(16).setTextColor(15, 15, 15);
  doc.text(property.title || 'Propiedad', margin, y);
  y += 6;
  // Sin emojis acá: las fuentes básicas de jsPDF (Helvetica) no los soportan y salen corruptos.
  doc.setFont('helvetica', 'normal').setFontSize(10).setTextColor(90, 90, 90);
  doc.text(`${property.direccion ? property.direccion + ' — ' : ''}${property.location || ''}`, margin, y);
  y += 8;

  if (property.operation !== 'No Disponible') {
    const moneda = property.operation === 'Venta' ? 'USD' : 'ARS';
    doc.setFont('helvetica', 'bold').setFontSize(13).setTextColor(234, 88, 12);
    doc.text(`${property.operation} — ${moneda} ${(property.price ?? 0).toLocaleString('es-AR')}`, margin, y);
    y += 10;
  } else {
    y += 4;
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
    filaFicha(doc, margin + col * colWidth, y + fila * 14, colWidth, etiqueta, valor ?? '-');
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
    doc.text(servicios.join('   •   '), margin, y);
    y += 8;
  }

  // Descripción (texto plano, sin las etiquetas HTML del editor)
  const descripcionPlano = stripHtml(property.description || property.descripcion || '');
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
