export const INITIAL_PROPERTIES = [
{
    id: 1,
    title: "PH Palermo con Terrazas de Diseño",
    slug: "ph-palermo-terrazas-diseno",
    price: 185000,
    location: "Palermo, CABA",
    operation: "Venta",
    type: "PH",
    rooms: 3,
    beds: 2,
    baths: 2,
    sizeTotal: 120,
    sizeCovered: 85,
    status: "Reformado a estrenar",
    description: "Espectacular PH reciclado por completo con materiales de primera calidad por nuestro equipo. Cuenta con un diseño abierto que integra cocina, comedor y una magnífica salida a terraza privada con parrilla de hormigón visto.",
    coverImage: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=1200", // Living reformado
    gallery: [
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=1200"
    ],
    // Comparaciones de la transformación de lo que compramos y rehicimos
    comparables: [
      {
        spaceName: "Living / Estar",
        before: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=800",
        after: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=1200",
        description: "Adquirimos esta unidad muy deteriorada. Demolimos los muros oscuros para lograr una planta abierta de diseño contemporáneo, restaurando vigas y ganando iluminación cruzada."
      },
      {
        spaceName: "Cocina / Comedor",
        before: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&q=80&w=800",
        after: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&q=80&w=1200",
        description: "Reemplazamos por completo cañerías viejas de plomo. Instalamos isla central en mármol de Carrara, griferías empotradas y mobiliario a medida de alta gama."
      },
      {
        spaceName: "Terraza",
        before: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800",
        after: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=1200",
        description: "Un espacio antes abandonado y con filtraciones. Realizamos impermeabilización total con doble membrana, sumamos parrilla de diseño y solárium premium."
      }
    ],
    features: {
      patio: "No",
      balcon: "Sí (Terraza de 35m²)",
      cocina: "Concepto abierto premium",
      lavadero: "Independiente",
      estado: "Excelente - A estrenar post reforma integral"
    },
    reformStory: "Este PH original presentaba severos problemas de cimientos, humedad y distribución fragmentada de época. Nuestro estudio adquirió la propiedad, rediseñó el plano estructural, renovó toda la red de servicios (agua, gas, electricidad) y ejecutó acabados minimalistas premium. Hoy se vende como una joya arquitectónica nueva."
  },
  {
    id: 2,
    title: "Semipiso Recoleta de Estilo Francés",
    slug: "semipiso-recoleta-estilo-frances",
    price: 245000,
    location: "Recoleta, CABA",
    operation: "Venta",
    type: "Departamento",
    rooms: 4,
    beds: 3,
    baths: 2,
    sizeTotal: 105,
    sizeCovered: 98,
    status: "Reformado a estrenar",
    description: "Semipiso de categoría completamente renovado. Conserva la elegancia señorial de sus techos de doble altura y molduras, pero con una distribución, cocina y baños adaptados a las exigencias de la vida moderna.",
    coverImage: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1200",
    gallery: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&q=80&w=1200"
    ],
    comparables: [
      {
        spaceName: "Salón Principal",
        before: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&q=80&w=800",
        after: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1200",
        description: "Pulido e hidrolaqueado de las maderas de pinotea originales, recuperación artesanal de molduras francesas e integración de iluminación LED cálida."
      },
      {
        spaceName: "Dormitorio Suite",
        before: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=800",
        after: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=1200",
        description: "Transformamos un sector de servicio obsoleto en una Master Suite imponente con amplio vestidor, baño de microcemento y doble vidriado acústico."
      }
    ],
    features: {
      patio: "No",
      balcon: "Sí (Francés)",
      cocina: "Integrada con barra de silestone",
      lavadero: "Sí (Integrado)",
      estado: "Excelente - Recién remodelado"
    },
    reformStory: "Una joya del patrimonio porteño que rescatamos de un estado de abandono crítico. Se hizo la renovación completa de cañerías por termofusión, instalación de calefacción por radiadores, y una optimización de distribución que generó un tercer dormitorio en suite."
  },
  {
    id: 3,
    title: "Casa de Diseño Nórdico en Colegiales",
    slug: "casa-diseno-nordico-colegiales",
    price: 320000,
    location: "Colegiales, CABA",
    operation: "Venta",
    type: "Casa",
    rooms: 5,
    beds: 4,
    baths: 3,
    sizeTotal: 240,
    sizeCovered: 180,
    status: "Reformado a estrenar",
    description: "Casa de 3 plantas que compramos en estado de ruina y reconstruimos de forma total. Hoy cuenta con jardín, piscina, suite con vestidor, paneles solares integrados y terminaciones de lujo.",
    coverImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200",
    gallery: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?auto=format&fit=crop&q=80&w=1200"
    ],
    comparables: [
      {
        spaceName: "Acceso & Fachada",
        before: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800",
        after: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200",
        description: "Reconstrucción total de la fachada con hormigón visto y rejas de seguridad de diseño, sumando portón automatizado."
      },
      {
        spaceName: "La Cocina",
        before: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=800",
        after: "https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?auto=format&fit=crop&q=80&w=1200",
        description: "Se creó una cocina gourmet en isla con mesadas de Neolith, anafe por inducción y extractor italiano de última generación."
      }
    ],
    features: {
      patio: "Sí (Jardín con Piscina)",
      balcon: "Sí (Aterrazado)",
      cocina: "Isla de diseño minimalista",
      lavadero: "Independiente en planta superior",
      estado: "A Estrenar - Obra finalizada recientemente"
    },
    reformStory: "Adquirimos este inmueble con peligro de derrumbe. Reforzamos las bases con perfiles de doble T, ganamos metros construyendo una planta alta con estructura metálica ligera y diseñamos un jardín paisajista con piscina automatizada."
  }
];