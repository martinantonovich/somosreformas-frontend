// Venta se carga en USD, Alquiler en ARS — para poder ordenar/filtrar todo junto por su valor
// real (no por el número duro), convertimos el alquiler a su equivalente en USD con la
// cotización configurada desde el admin.
export function valorRealUsd(property, cotizacionDolar) {
  const precio = property.price ?? 0;
  if (property.operation === 'Alquiler') {
    return precio / (cotizacionDolar || 1500);
  }
  return precio; // Venta y "No Disponible" ya están en USD (o no aplica)
}
