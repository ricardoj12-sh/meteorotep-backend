const express = require('express');
const router = express.Router();
const authmiddleware = require('../middleware/authmiddleware');
const earthquakeController = require('../controllers/earthquakecontroller');

// Desestructura los métodos del controlador
const { getRecentEarthquakesByLocation, getRecentEarthquakesByCity, exportEarthquakeReport, saveSearchToFavorites, getFavoriteSearches, saveSearchToHistory, getSearchHistory } = earthquakeController;

// Ruta para obtener sismos recientes por ciudad
router.get('/recent-earthquakes', getRecentEarthquakesByCity);

// Ruta para exportar reporte de sismos a Excel
router.get('/export-earthquake-report', exportEarthquakeReport);

// Ruta protegida para obtener sismos recientes por ubicación del usuario
router.get('/recent-earthquakes-by-location', getRecentEarthquakesByLocation);

// Endpoint para guardar búsqueda en favoritos (ejemplo con ubicación)
router.post('/save-favorite', authmiddleware, saveSearchToFavorites);

// Endpoint para obtener búsquedas favoritas
router.get('/favorite-searches', authmiddleware, getFavoriteSearches);

// Endpoint para guardar búsqueda en el historial
router.post('/save-history/:city', authmiddleware, saveSearchToHistory);

// Endpoint para obtener el historial de búsquedas
router.get('/search-history', authmiddleware, getSearchHistory);

module.exports = router;
