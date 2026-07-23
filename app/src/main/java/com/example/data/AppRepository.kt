package com.example.data

import kotlinx.coroutines.flow.Flow

class AppRepository(private val dao: SoilAnalysisDao) {
    val allAnalyses: Flow<List<SoilAnalysisEntity>> = dao.getAllAnalyses()

    suspend fun insertAnalysis(analysis: SoilAnalysisEntity) {
        dao.insertAnalysis(analysis)
    }

    suspend fun deleteAnalysis(id: Long) {
        dao.deleteAnalysis(id)
    }
}
