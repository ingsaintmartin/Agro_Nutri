package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Calculate
import androidx.compose.material.icons.filled.Save
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.AgronomicDatabase
import com.example.data.CropRequirement
import com.example.data.FertilizerOption
import com.example.data.SoilAnalysisEntity
import com.example.ui.viewmodel.AgroViewModel
import com.example.ui.viewmodel.CalculationResult

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CalculatorScreen(
    viewModel: AgroViewModel,
    onNavigateBack: () -> Unit,
    onSavedSuccessfully: () -> Unit
) {
    var sampleName by remember { mutableStateOf("Lote 1 - Muestreo Suelo") }
    var selectedCropIndex by remember { mutableStateOf(0) }
    val currentCrop = AgronomicDatabase.crops[selectedCropIndex]

    var targetYieldText by remember { mutableStateOf(currentCrop.typicalYield.toString()) }
    var soilNText by remember { mutableStateOf("15.0") } // ppm
    var soilPText by remember { mutableStateOf("12.0") } // ppm Bray
    var soilKText by remember { mutableStateOf("180.0") } // ppm
    var soilPhText by remember { mutableStateOf("6.4") }
    var soilMoText by remember { mutableStateOf("2.5") } // % OM

    var selectedFertNIndex by remember { mutableStateOf(0) } // Urea
    var selectedFertPIndex by remember { mutableStateOf(1) } // MAP

    val currentFertN = AgronomicDatabase.fertilizers.filter { it.nContent > 0 }[selectedFertNIndex]
    val currentFertP = AgronomicDatabase.fertilizers.filter { it.pContent > 0 }[selectedFertPIndex]

    var calculationResult by remember { mutableStateOf<CalculationResult?>(null) }
    var savedMessage by remember { mutableStateOf(false) }

    fun performCalculation() {
        val targetYield = targetYieldText.toDoubleOrNull() ?: currentCrop.typicalYield
        val soilN = soilNText.toDoubleOrNull() ?: 0.0
        val soilP = soilPText.toDoubleOrNull() ?: 0.0
        val soilK = soilKText.toDoubleOrNull() ?: 0.0
        val soilMo = soilMoText.toDoubleOrNull() ?: 2.0

        calculationResult = viewModel.calculateRequirements(
            targetYield = targetYield,
            cropNPerTon = currentCrop.nPerTon,
            cropPPerTon = currentCrop.pPerTon,
            cropKPerTon = currentCrop.kPerTon,
            soilN = soilN,
            soilP = soilP,
            soilK = soilK,
            soilMo = soilMo,
            fertNPercent = currentFertN.nContent,
            fertPPercent = currentFertP.pContent,
            fertKPercent = 60.0 // KCl default
        )
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Calculadora de Fertilización", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Volver")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = MaterialTheme.colorScheme.surface)
            )
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .background(MaterialTheme.colorScheme.background),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // General Info & Sample Name
            item {
                Card(
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Text(text = "1. Identificación del Lote", fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
                        OutlinedTextField(
                            value = sampleName,
                            onValueChange = { sampleName = it },
                            label = { Text("Nombre del Lote / Muestra") },
                            modifier = Modifier.fillMaxWidth(),
                            singleLine = true
                        )

                        // Crop selection
                        Text(text = "Seleccionar Cultivo Destino", style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.SemiBold)
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            AgronomicDatabase.crops.forEachIndexed { index, crop ->
                                FilterChip(
                                    selected = selectedCropIndex == index,
                                    onClick = {
                                        selectedCropIndex = index
                                        targetYieldText = crop.typicalYield.toString()
                                        performCalculation()
                                    },
                                    label = { Text(crop.name) }
                                )
                            }
                        }

                        OutlinedTextField(
                            value = targetYieldText,
                            onValueChange = { targetYieldText = it },
                            label = { Text("Rendimiento Objetivo (t/ha)") },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            modifier = Modifier.fillMaxWidth(),
                            singleLine = true
                        )
                    }
                }
            }

            // Soil Test Values Card
            item {
                Card(
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Text(text = "2. Resultados del Muestreo de Suelo", fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
                        
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            OutlinedTextField(
                                value = soilNText,
                                onValueChange = { soilNText = it },
                                label = { Text("Nitrógeno (ppm N)") },
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                                modifier = Modifier.weight(1f),
                                singleLine = true
                            )
                            OutlinedTextField(
                                value = soilPText,
                                onValueChange = { soilPText = it },
                                label = { Text("Fósforo (ppm Bray)") },
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                                modifier = Modifier.weight(1f),
                                singleLine = true
                            )
                        }

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            OutlinedTextField(
                                value = soilKText,
                                onValueChange = { soilKText = it },
                                label = { Text("Potasio (ppm K)") },
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                                modifier = Modifier.weight(1f),
                                singleLine = true
                            )
                            OutlinedTextField(
                                value = soilMoText,
                                onValueChange = { soilMoText = it },
                                label = { Text("Materia Orgánica (%)") },
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                                modifier = Modifier.weight(1f),
                                singleLine = true
                            )
                        }

                        OutlinedTextField(
                            value = soilPhText,
                            onValueChange = { soilPhText = it },
                            label = { Text("pH del Suelo (en agua 1:2.5)") },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            modifier = Modifier.fillMaxWidth(),
                            singleLine = true
                        )
                    }
                }
            }

            // Fertilizers Selection Card
            item {
                Card(
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Text(text = "3. Selección de Fertilizantes", fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
                        
                        Text(text = "Fertilizante Nitrogenado: ${currentFertN.name} (${currentFertN.nContent}% N)", style = MaterialTheme.typography.bodyMedium)
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            AgronomicDatabase.fertilizers.filter { it.nContent > 0 }.forEachIndexed { idx, fert ->
                                FilterChip(
                                    selected = selectedFertNIndex == idx,
                                    onClick = { selectedFertNIndex = idx },
                                    label = { Text(fert.name.split(" ")[0]) }
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(4.dp))
                        Text(text = "Fertilizante Fosforado: ${currentFertP.name} (${currentFertP.pContent}% P2O5)", style = MaterialTheme.typography.bodyMedium)
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            AgronomicDatabase.fertilizers.filter { it.pContent > 0 }.forEachIndexed { idx, fert ->
                                FilterChip(
                                    selected = selectedFertPIndex == idx,
                                    onClick = { selectedFertPIndex = idx },
                                    label = { Text(fert.name.split(" ")[0]) }
                                )
                            }
                        }
                    }
                }
            }

            // Calculate Button
            item {
                Button(
                    onClick = { performCalculation() },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(50.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary)
                ) {
                    Icon(Icons.Default.Calculate, contentDescription = null)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Calcular Recomendación", fontSize = 16.sp, fontWeight = FontWeight.Bold)
                }
            }

            // Results Section
            calculationResult?.let { res ->
                item {
                    Card(
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer),
                        shape = MaterialTheme.shapes.large
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(20.dp),
                            verticalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            Text(
                                text = "Resultado de Recomendación - $sampleName",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.onPrimaryContainer
                            )
                            HorizontalDivider(color = MaterialTheme.colorScheme.onPrimaryContainer.copy(alpha = 0.2f))

                            ResultRow(
                                nutrient = "Nitrógeno (N)",
                                demand = "${res.totalNDemand.toInt()} kg/ha",
                                deficit = "${res.netNDeficit.toInt()} kg/ha",
                                recommendation = "${res.fertilizerNRate.toInt()} kg/ha de ${currentFertN.name}"
                            )

                            ResultRow(
                                nutrient = "Fósforo (P2O5)",
                                demand = "${res.totalPDemand.toInt()} kg/ha",
                                deficit = "${res.netPDeficit.toInt()} kg/ha",
                                recommendation = "${res.fertilizerPRate.toInt()} kg/ha de ${currentFertP.name}"
                            )

                            Spacer(modifier = Modifier.height(8.dp))

                            Button(
                                onClick = {
                                    viewModel.saveAnalysis(
                                        SoilAnalysisEntity(
                                            sampleName = sampleName,
                                            cropName = currentCrop.name,
                                            targetYield = targetYieldText.toDoubleOrNull() ?: currentCrop.typicalYield,
                                            soilN = soilNText.toDoubleOrNull() ?: 0.0,
                                            soilP = soilPText.toDoubleOrNull() ?: 0.0,
                                            soilK = soilKText.toDoubleOrNull() ?: 0.0,
                                            soilPh = soilPhText.toDoubleOrNull() ?: 6.0,
                                            soilMo = soilMoText.toDoubleOrNull() ?: 2.0,
                                            chosenFertilizerN = currentFertN.name,
                                            chosenFertilizerP = currentFertP.name,
                                            chosenFertilizerK = "Cloruro de Potasio",
                                            recommendedNRateKgHa = res.fertilizerNRate,
                                            recommendedPRateKgHa = res.fertilizerPRate,
                                            recommendedKRateKgHa = res.fertilizerKRate
                                        )
                                    )
                                    savedMessage = true
                                },
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = MaterialTheme.colorScheme.secondary,
                                    contentColor = MaterialTheme.colorScheme.onSecondary
                                ),
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Icon(Icons.Default.Save, contentDescription = null, modifier = Modifier.size(18.dp))
                                Spacer(modifier = Modifier.width(8.dp))
                                Text("Guardar en Historial de Lotes")
                            }

                            if (savedMessage) {
                                Text(
                                    text = "¡Análisis y recomendación guardados correctamente!",
                                    color = MaterialTheme.colorScheme.primary,
                                    fontWeight = FontWeight.Bold,
                                    style = MaterialTheme.typography.bodySmall
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun ResultRow(nutrient: String, demand: String, deficit: String, recommendation: String) {
    Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
        Text(text = nutrient, fontWeight = FontWeight.Bold, style = MaterialTheme.typography.bodyLarge)
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Text(text = "Demanda: $demand", style = MaterialTheme.typography.bodySmall)
            Text(text = "Déficit Neto: $deficit", style = MaterialTheme.typography.bodySmall)
        }
        Text(
            text = "👉 Aplicar: $recommendation",
            fontWeight = FontWeight.Bold,
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.primary
        )
    }
}
