package com.example.ui.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.BuildConfig
import com.example.data.AppDatabase
import com.example.data.AppRepository
import com.example.data.SoilAnalysisEntity
import com.squareup.moshi.Moshi
import com.squareup.moshi.kotlin.reflect.KotlinJsonAdapterFactory
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody

data class CalculationResult(
    val totalNDemand: Double,
    val availableN: Double,
    val netNDeficit: Double,
    val fertilizerNRate: Double,
    val totalPDemand: Double,
    val availableP: Double,
    val netPDeficit: Double,
    val fertilizerPRate: Double,
    val totalKDemand: Double,
    val availableK: Double,
    val netKDeficit: Double,
    val fertilizerKRate: Double
)

class AgroViewModel(application: Application) : AndroidViewModel(application) {
    private val repository: AppRepository

    val savedAnalyses: StateFlow<List<SoilAnalysisEntity>>

    init {
        val dao = AppDatabase.getDatabase(application).soilAnalysisDao()
        repository = AppRepository(dao)
        savedAnalyses = repository.allAnalyses.stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = emptyList()
        )
    }

    fun calculateRequirements(
        targetYield: Double,
        cropNPerTon: Double,
        cropPPerTon: Double,
        cropKPerTon: Double,
        soilN: Double, // ppm
        soilP: Double, // ppm Bray
        soilK: Double, // ppm
        soilMo: Double, // % OM
        fertNPercent: Double,
        fertPPercent: Double,
        fertKPercent: Double
    ): CalculationResult {
        // Total crop demand (kg/ha)
        val totalN = targetYield * cropNPerTon
        val totalP = targetYield * cropPPerTon
        val totalK = targetYield * cropKPerTon

        // Estimated available soil nutrients (agronomic standard estimation for Pampa region)
        val availN = (soilN * 3.0) + (soilMo * 15.0)
        val availP = soilP * 2.0
        val availK = soilK * 2.2

        val netN = maxOf(0.0, totalN - availN)
        val netP = maxOf(0.0, totalP - availP)
        val netK = maxOf(0.0, totalK - availK)

        val rateN = if (fertNPercent > 0) netN / (fertNPercent / 100.0) else 0.0
        val rateP = if (fertPPercent > 0) netP / (fertPPercent / 100.0) else 0.0
        val rateK = if (fertKPercent > 0) netK / (fertKPercent / 100.0) else 0.0

        return CalculationResult(
            totalNDemand = totalN,
            availableN = availN,
            netNDeficit = netN,
            fertilizerNRate = rateN,
            totalPDemand = totalP,
            availableP = availP,
            netPDeficit = netP,
            fertilizerPRate = rateP,
            totalKDemand = totalK,
            availableK = availK,
            netKDeficit = netK,
            fertilizerKRate = rateK
        )
    }

    fun saveAnalysis(entity: SoilAnalysisEntity) {
        viewModelScope.launch {
            repository.insertAnalysis(entity)
        }
    }

    fun deleteAnalysis(id: Long) {
        viewModelScope.launch {
            repository.deleteAnalysis(id)
        }
    }

    // Gemini AI agronomic recommendation via REST API
    suspend fun getAiRecommendation(prompt: String): String {
        return withContext(Dispatchers.IO) {
            try {
                val apiKey = BuildConfig.GEMINI_API_KEY
                if (apiKey.isBlank() || apiKey == "MY_GEMINI_API_KEY") {
                    return@withContext "API Key de Gemini no configurada. Por favor configure su GEMINI_API_KEY en el panel de secretos de AI Studio."
                }
                val client = OkHttpClient()
                val json = """
                    {
                      "contents": [{
                        "parts": [{
                          "text": "Actúa como un agrónomo senior experto en nutrición de suelos y fertilización en la región pampeana. Responde de forma profesional, práctica y técnica a la siguiente consulta: $prompt"
                        }]
                      }]
                    }
                """.trimIndent()
                val body = json.toRequestBody("application/json; charset=utf-8".toMediaType())
                val request = Request.Builder()
                    .url("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=$apiKey")
                    .post(body)
                    .build()

                client.newCall(request).execute().use { response ->
                    if (!response.isSuccessful) return@withContext "Error en la consulta IA (${response.code})."
                    val respBody = response.body?.string() ?: return@withContext "Sin respuesta."
                    val adapter = Moshi.Builder().add(KotlinJsonAdapterFactory()).build().adapter(Map::class.java)
                    val map = adapter.fromJson(respBody) as? Map<*, *>
                    val candidates = map?.get("candidates") as? List<*>
                    val candidate = candidates?.firstOrNull() as? Map<*, *>
                    val content = candidate?.get("content") as? Map<*, *>
                    val parts = content?.get("parts") as? List<*>
                    val part = parts?.firstOrNull() as? Map<*, *>
                    val text = part?.get("text") as? String
                    text ?: "No se pudo interpretar la respuesta."
                }
            } catch (e: Exception) {
                "Error al consultar al asistente IA: ${e.localizedMessage ?: e.toString()}"
            }
        }
    }
}
