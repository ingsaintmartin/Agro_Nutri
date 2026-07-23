package com.example.data

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "soil_analyses")
data class SoilAnalysisEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val sampleName: String,
    val cropName: String,
    val targetYield: Double, // t/ha
    val soilN: Double, // ppm or kg/ha available
    val soilP: Double, // ppm Bray
    val soilK: Double, // ppm
    val soilPh: Double,
    val soilMo: Double, // % Organic Matter
    val chosenFertilizerN: String,
    val chosenFertilizerP: String,
    val chosenFertilizerK: String,
    val recommendedNRateKgHa: Double,
    val recommendedPRateKgHa: Double,
    val recommendedKRateKgHa: Double,
    val timestamp: Long = System.currentTimeMillis()
)
