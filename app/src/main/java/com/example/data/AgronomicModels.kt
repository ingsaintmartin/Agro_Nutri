package com.example.data

data class CropRequirement(
    val name: String,
    val scientificName: String,
    val nPerTon: Double, // kg N per ton of grain
    val pPerTon: Double, // kg P2O5 per ton of grain
    val kPerTon: Double, // kg K2O per ton of grain
    val typicalYield: Double, // t/ha average
    val description: String
)

data class FertilizerOption(
    val name: String,
    val formula: String,
    val nContent: Double, // %
    val pContent: Double, // % P2O5
    val kContent: Double, // % K2O
    val sulfurContent: Double = 0.0, // % S
    val description: String
)

object AgronomicDatabase {
    val crops = listOf(
        CropRequirement(
            name = "Maíz",
            scientificName = "Zea mays",
            nPerTon = 20.0,
            pPerTon = 4.5,
            kPerTon = 18.0,
            typicalYield = 8.0,
            description = "Alto requerimiento nitrogenado y potásico. Clave fraccionamiento en V6."
        ),
        CropRequirement(
            name = "Soja",
            scientificName = "Glycine max",
            nPerTon = 80.0, // Fija biológicamente gran parte
            pPerTon = 6.0,
            kPerTon = 35.0,
            typicalYield = 3.5,
            description = "Fijación biológica de nitrógeno (FBN). Alta demanda de Fósforo y Azufre."
        ),
        CropRequirement(
            name = "Trigo",
            scientificName = "Triticum aestivum",
            nPerTon = 25.0,
            pPerTon = 5.0,
            kPerTon = 20.0,
            typicalYield = 4.5,
            description = "Fertilización nitrogenada al macollaje y espigazón para definir proteína."
        ),
        CropRequirement(
            name = "Girasol",
            scientificName = "Helianthus annuus",
            nPerTon = 35.0,
            pPerTon = 6.5,
            kPerTon = 45.0,
            typicalYield = 2.5,
            description = "Excelente explorador radicular. Sensible a deficiencia de Boro y Potasio."
        ),
        CropRequirement(
            name = "Cebada",
            scientificName = "Hordeum vulgare",
            nPerTon = 22.0,
            pPerTon = 4.8,
            kPerTon = 19.0,
            typicalYield = 5.0,
            description = "Requerimiento similar al trigo pero con mayor sensibilidad al exceso de N (encame)."
        )
    )

    val fertilizers = listOf(
        FertilizerOption(
            name = "Urea Granulada",
            formula = "CO(NH2)2",
            nContent = 46.0,
            pContent = 0.0,
            kContent = 0.0,
            description = "Fertilizante nitrogenado sólido de alta concentración. Requiere incorporación para evitar volatilización."
        ),
        FertilizerOption(
            name = "Fosfato Monoamónico (MAP)",
            formula = "NH4H2PO4",
            nContent = 11.0,
            pContent = 52.0,
            kContent = 0.0,
            description = "Excelente fuente fosforada con aporte inicial de nitrógeno. Ideal a la siembra (arranque)."
        ),
        FertilizerOption(
            name = "Fosfato Diamónico (DAP)",
            formula = "(NH4)2HPO4",
            nContent = 18.0,
            pContent = 46.0,
            kContent = 0.0,
            description = "Fosforado con mayor relación nitrogenada. Muy utilizado en cultivos estivales."
        ),
        FertilizerOption(
            name = "Súper Fosfato Triplo (TSP)",
            formula = "Ca(H2PO4)2",
            nContent = 0.0,
            pContent = 46.0,
            kContent = 0.0,
            description = "Fuente fosforada sin nitrógeno, aporta calcio y fósforo soluble."
        ),
        FertilizerOption(
            name = "Cloruro de Potasio (KCl)",
            formula = "KCl",
            nContent = 0.0,
            pContent = 0.0,
            kContent = 60.0,
            description = "Principal fuente potásica para reposición en suelos agrícolas de altos rindes."
        ),
        FertilizerOption(
            name = "Sulfato de Amonio",
            formula = "(NH4)2SO4",
            nContent = 21.0,
            pContent = 0.0,
            kContent = 0.0,
            sulfurContent = 24.0,
            description = "Aporte dual de Nitrógeno y Azufre (24% S), muy demandado en suelos pampeanos."
        )
    )
}
