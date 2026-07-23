// ══════════════════════════════════════════════
//   AgroNutri PWA — data.js
//   Datos agronómicos portados desde AgronomicModels.kt
// ══════════════════════════════════════════════

const CROPS = [
  {
    name: "Maíz",
    scientificName: "Zea mays",
    nPerTon: 20.0,
    pPerTon: 4.5,
    kPerTon: 18.0,
    typicalYield: 8.0,
    description: "Alto requerimiento nitrogenado y potásico. Clave fraccionamiento en V6."
  },
  {
    name: "Soja",
    scientificName: "Glycine max",
    nPerTon: 80.0,
    pPerTon: 6.0,
    kPerTon: 35.0,
    typicalYield: 3.5,
    description: "Fija biológicamente ~70% del N. Foco en P y K. Inoculación con Bradyrhizobium."
  },
  {
    name: "Trigo",
    scientificName: "Triticum aestivum",
    nPerTon: 25.0,
    pPerTon: 5.0,
    kPerTon: 5.0,
    typicalYield: 4.0,
    description: "N fraccionado: macollaje + encañazón. Sensible a deficiencias de P en arranque."
  },
  {
    name: "Girasol",
    scientificName: "Helianthus annuus",
    nPerTon: 30.0,
    pPerTon: 9.0,
    kPerTon: 80.0,
    typicalYield: 2.5,
    description: "Alto extractor de potasio. Evitar exceso de N que reduce calidad de aceite."
  },
  {
    name: "Sorgo",
    scientificName: "Sorghum bicolor",
    nPerTon: 18.0,
    pPerTon: 4.0,
    kPerTon: 16.0,
    typicalYield: 6.0,
    description: "Eficiente en uso de agua. Responde bien al N. Similar a maíz en nutrición."
  },
  {
    name: "Cebada",
    scientificName: "Hordeum vulgare",
    nPerTon: 22.0,
    pPerTon: 4.5,
    kPerTon: 5.0,
    typicalYield: 4.5,
    description: "Para maltería, controlar N (máx 2% proteína en grano). P en arranque fundamental."
  },
  {
    name: "Algodón",
    scientificName: "Gossypium hirsutum",
    nPerTon: 55.0,
    pPerTon: 10.0,
    kPerTon: 45.0,
    typicalYield: 1.5,
    description: "Alto requerimiento de K y N. Aplicar B como micronutriente en floración."
  }
];

const FERTILIZERS = [
  {
    name: "Urea",
    formula: "CO(NH₂)₂",
    nContent: 46.0,
    pContent: 0.0,
    kContent: 0.0,
    sulfurContent: 0.0,
    description: "Fuente nitrogenada sólida más concentrada y económica. Requiere incorporación."
  },
  {
    name: "MAP",
    formula: "NH₄H₂PO₄",
    nContent: 11.0,
    pContent: 52.0,
    kContent: 0.0,
    sulfurContent: 0.0,
    description: "Fosfato monoamónico. Arrancador ideal. Bajo pH local favorece absorción."
  },
  {
    name: "DAP",
    formula: "(NH₄)₂HPO₄",
    nContent: 18.0,
    pContent: 46.0,
    kContent: 0.0,
    sulfurContent: 0.0,
    description: "Diamónico fosfato. Alta eficiencia de P. Ideal para siembra directa."
  },
  {
    name: "UAN (Líquido)",
    formula: "UAN 32%",
    nContent: 32.0,
    pContent: 0.0,
    kContent: 0.0,
    sulfurContent: 0.0,
    description: "Solución nitrogenada líquida. Permite fertirriego y aplicación foliar diluida."
  },
  {
    name: "SOP",
    formula: "K₂SO₄",
    nContent: 0.0,
    pContent: 0.0,
    kContent: 50.0,
    sulfurContent: 17.0,
    description: "Sulfato de potasio. Aporta K y S. Preferido en cultivos sensibles al cloro."
  },
  {
    name: "KCl",
    formula: "KCl",
    nContent: 0.0,
    pContent: 0.0,
    kContent: 60.0,
    sulfurContent: 0.0,
    description: "Cloruro de potasio. Fuente K más económica. No usar en tabaco o papa."
  },
  {
    name: "Nitrato de Amonio",
    formula: "NH₄NO₃",
    nContent: 34.0,
    pContent: 0.0,
    kContent: 0.0,
    sulfurContent: 0.0,
    description: "Rápida disponibilidad. Mitad NO₃ (inmediato) + mitad NH₄ (liberación diferida)."
  },
  {
    name: "Superfosfato Simple",
    formula: "Ca(H₂PO₄)₂",
    nContent: 0.0,
    pContent: 20.0,
    kContent: 0.0,
    sulfurContent: 11.0,
    description: "Aporta P y S. Económico para corrección de suelos deficientes en azufre."
  },
  {
    name: "Superfosfato Triple",
    formula: "Ca(H₂PO₄)₂",
    nContent: 0.0,
    pContent: 46.0,
    kContent: 0.0,
    sulfurContent: 1.5,
    description: "Alta concentración de P. Sin aporte de S. Para suelos bien abastecidos en azufre."
  }
];
