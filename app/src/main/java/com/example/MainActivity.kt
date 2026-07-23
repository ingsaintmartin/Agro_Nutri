package com.example

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.example.ui.screens.*
import com.example.ui.theme.MyApplicationTheme
import com.example.ui.viewmodel.AgroViewModel

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            MyApplicationTheme {
                val navController = rememberNavController()
                val agroViewModel: AgroViewModel = viewModel()

                NavHost(navController = navController, startDestination = "home") {
                    composable("home") {
                        HomeScreen(
                            viewModel = agroViewModel,
                            onNavigateToCalculator = { navController.navigate("calculator") },
                            onNavigateToCrops = { navController.navigate("crops") },
                            onNavigateToFertilizers = { navController.navigate("fertilizers") },
                            onNavigateToHistory = { navController.navigate("history") },
                            onNavigateToAi = { navController.navigate("ai_consultant") }
                        )
                    }
                    composable("calculator") {
                        CalculatorScreen(
                            viewModel = agroViewModel,
                            onNavigateBack = { navController.popBackStack() },
                            onSavedSuccessfully = { navController.navigate("history") }
                        )
                    }
                    composable("crops") {
                        CropsDatabaseScreen(
                            onNavigateBack = { navController.popBackStack() }
                        )
                    }
                    composable("fertilizers") {
                        FertilizersScreen(
                            onNavigateBack = { navController.popBackStack() }
                        )
                    }
                    composable("history") {
                        HistoryScreen(
                            viewModel = agroViewModel,
                            onNavigateBack = { navController.popBackStack() }
                        )
                    }
                    composable("ai_consultant") {
                        AiConsultantScreen(
                            viewModel = agroViewModel,
                            onNavigateBack = { navController.popBackStack() }
                        )
                    }
                }
            }
        }
    }
}
