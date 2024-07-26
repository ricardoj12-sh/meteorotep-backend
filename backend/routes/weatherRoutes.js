const express = require('express');
const router = express.Router();
const weatherController = require('../controllers/weatherController');
const authMiddleware = require('../middleware/authMiddleware'); // Importa el middleware de autenticación


// Endpoint para el clima actual y pronóstico según ubicación del usuario
router.get('/currentAndForecast', authMiddleware, weatherController.getCurrentWeatherAndForecast);

// Endpoint para el pronóstico diario
router.get('/daily-forecast', authMiddleware, weatherController.getDailyForecast);

// Endpoint para obtener el clima actual según ciudad
router.get('/current-weather/:city', weatherController.getCurrentWeather);

// Endpoint para exportar pronóstico diario a Excel (requiere autenticación)
router.get('/export-daily-forecast', authMiddleware, weatherController.exportDailyForecastToExcel);

// Endpoint para guardar búsqueda en historial (ejemplo con ciudad)
router.post('/save-history/:city', authMiddleware, weatherController.saveSearchToHistory);

// Endpoint para obtener historial de búsquedas
router.get('/search-history', authMiddleware, weatherController.getSearchHistory);
router.post('/save-favorite', authMiddleware, weatherController.saveSearchToFavorites);
router.get('/favorite-searches', authMiddleware, weatherController.getFavoriteSearches);

module.exports = router;
