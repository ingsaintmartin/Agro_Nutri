package com.example.data

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import kotlinx.coroutines.flow.Flow

@Dao
interface SoilAnalysisDao {
    @Query("SELECT * FROM soil_analyses ORDER BY timestamp DESC")
    fun getAllAnalyses(): Flow<List<SoilAnalysisEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAnalysis(analysis: SoilAnalysisEntity)

    @Query("DELETE FROM soil_analyses WHERE id = :id")
    suspend fun deleteAnalysis(id: Long)
}
