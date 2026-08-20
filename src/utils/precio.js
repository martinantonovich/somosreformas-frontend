// Una propiedad puede estar en Venta (USD), en Alquiler (ARS), en las dos a la vez, o en
// ninguna ("No Disponible"). Estos helpers centralizan cómo comparar/etiquetar eso, para no
// repetir la lógica de "qué precio corresponde" en cada vista.

// Valor real en USD para ordenar/filtrar. `operationContext` es la operación activa en el
// filtro (si el usuario está viendo sólo Venta o sólo Alquiler); si es null (viendo "todas"
// mezcladas), se prioriza el valor de Venta cuando existe, y si no el de Alquiler convertido.
export function valorRealUsd(property, cotizacionDolar, operationContext = null) {
  const cotizacion = cotizacionDolar || 1500;

  if (operationContext === 'Venta') return property.priceVenta ?? 0;
  if (operationContext === 'Alquiler') return (property.priceAlquiler ?? 0) / cotizacion;

  if (property.priceVenta != null) return property.priceVenta;
  if (property.priceAlquiler != null) return property.priceAlquiler / cotizacion;
  return 0;
}

export function isComercial(property) {
  return property.priceVenta != null || property.priceAlquiler != null;
}

// Texto para badges: "Venta y Alquiler" | "Venta" | "Alquiler" | "No Disponible"
export function etiquetaOperacion(property) {
  const venta = property.priceVenta != null;
  const alquiler = property.priceAlquiler != null;
  if (venta && alquiler) return 'Venta y Alquiler';
  if (venta) return 'Venta';
  if (alquiler) return 'Alquiler';
  return 'No Disponible';
}
