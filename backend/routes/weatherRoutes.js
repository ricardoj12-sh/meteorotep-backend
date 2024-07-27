const express = require('express');
const router = express.Router();
const weatherController = require('../controllers/weathercontroller');
const authmiddleware = require('../middleware/authmiddleware'); // Importa el middleware de autenticación


// Endpoint para el clima actual y pronóstico según ubicación del usuario
router.get('/currentAndForecast', authmiddleware, weatherController.getCurrentWeatherAndForecast);

// Endpoint para el pronóstico diario
router.get('/daily-forecast', authmiddleware, weatherController.getDailyForecast);

// Endpoint para obtener el clima actual según ciudad
router.get('/current-weather/:city', weatherController.getCurrentWeather);

// Endpoint para exportar pronóstico diario a Excel (requiere autenticación)
router.get('/export-daily-forecast', authmiddleware, weatherController.exportDailyForecastToExcel);

// Endpoint para guardar búsqueda en historial (ejemplo con ciudad)
router.post('/save-history/:city', authmiddleware, weatherController.saveSearchToHistory);

// Endpoint para obtener historial de búsquedas
router.get('/search-history', authmiddleware, weatherController.getSearchHistory);
router.post('/save-favorite', authmiddleware, weatherController.saveSearchToFavorites);
router.get('/favorite-searches', authmiddleware, weatherController.getFavoriteSearches);

module.exports = router;
