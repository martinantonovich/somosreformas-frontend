// Estado comercial de la propiedad (independiente de estadoReforma, que es sobre la obra).
// '' / null = disponible, no se muestra ningún cartel.
export const ESTADOS_PROPIEDAD = [
  { value: '', label: 'Disponible' },
  { value: 'RESERVADO', label: 'Reservado' },
  { value: 'EN_NEGOCIACION', label: 'En Negociación' },
  { value: 'VENDIDO', label: 'Vendido' },
  { value: 'ALQUILADO', label: 'Alquilado' },
];

const BADGES = {
  RESERVADO: { label: 'Reservado', className: 'bg-amber-500 text-white' },
  EN_NEGOCIACION: { label: 'En Negociación', className: 'bg-blue-600 text-white' },
  VENDIDO: { label: 'Vendido', className: 'bg-rose-600 text-white' },
  ALQUILADO: { label: 'Alquilado', className: 'bg-purple-600 text-white' },
};

export function getEstadoPropiedadBadge(estadoPropiedad) {
  return BADGES[estadoPropiedad] || null;
}
