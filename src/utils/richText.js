// Quita las etiquetas HTML para mostrar un resumen en texto plano de una sola línea
// (cards del listado, con line-clamp). Los textos viejos ya eran texto plano, así que
// esto no les cambia nada.
export function stripHtml(html) {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

// Igual que stripHtml, pero para texto plano MULTILÍNEA (ej. el PDF de la ficha): conserva
// los saltos entre párrafos/subtítulos/ítems de lista en vez de aplastar todo en una sola
// línea corrida sin puntuación.
export function htmlToPlainTextConSaltos(html) {
  if (!html) return '';
  return html
    .replace(/<\/(p|h1|h2|h3|h4|div)>/gi, '\n\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<li[^>]*>/gi, '• ')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// Clases Tailwind (variantes arbitrarias) para que el HTML enriquecido (negrita, subtítulos, listas)
// se vea igual tanto adentro del editor de admin como en la ficha de detalle pública.
export const RICH_TEXT_CLASSES =
  "[&_h2]:text-sm [&_h2]:font-extrabold [&_h2]:mt-2 [&_h2]:mb-1 " +
  "[&_h3]:text-xs [&_h3]:font-extrabold [&_h3]:mt-2 [&_h3]:mb-1 " +
  "[&_strong]:font-bold [&_em]:italic " +
  "[&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_li]:mb-0.5 " +
  "[&_p]:mb-1.5 [&_p:last-child]:mb-0";

// Solo se usa en el editor (admin): estilo del placeholder cuando está vacío.
export const RICH_TEXT_PLACEHOLDER_CLASSES =
  "[&_.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] " +
  "[&_.is-editor-empty:first-child::before]:text-slate-600 " +
  "[&_.is-editor-empty:first-child::before]:float-left " +
  "[&_.is-editor-empty:first-child::before]:h-0 " +
  "[&_.is-editor-empty:first-child::before]:pointer-events-none";
