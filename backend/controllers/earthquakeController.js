// earthquakeController.js
const earthquakeService = require('../services/earthquakeservice');
const excelService = require('../services/excelService');
const db = require('../database/db');
const axios = require('axios'); 

const googleMapsApiKey = 'AIzaSyCaFgo3l3atkS8bsuZGOOKDAI6hGrmJCgc';

async function getLocationByCity(city) {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(city)}&key=${googleMapsApiKey}`;
    
    try {
        const response = await axios.get(url);
        if (response.data.status === 'OK' && response.data.results.length > 0) {
            const location = response.data.results[0].geometry.location;
            return {
                latitude: location.lat,
                longitude: location.lng
            };
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error fetching location from Google Geocoding API:', error);
        throw error;
    }
}

async function getRecentEarthquakesByCity(req, res) {
    const { city } = req.query;

    try {
        const location = await getLocationByCity(city);

        if (!location) {
            return res.status(404).json({ error: `No se encontró la ubicación para la ciudad ${city}` });
        }

        const earthquakeData = await earthquakeService.getRecentEarthquakesByCoordinates(location.latitude, location.longitude);

        res.json(earthquakeData);
    } catch (error) {
        console.error('Error fetching recent earthquakes:', error);
        res.status(500).json({ error: 'Error fetching recent earthquakes' });
    }
}

async function getRecentEarthquakesByLocation(req, res) {
    const { latitude, longitude } = req.query;

    if (!latitude || !longitude) {
        return res.status(400).json({ error: 'Latitud y longitud son requeridas' });
    }

    try {
        const earthquakeData = await earthquakeService.getRecentEarthquakesByCoordinates(latitude, longitude);

        res.json(earthquakeData);
    } catch (error) {
        console.error('Error fetching recent earthquakes by location:', error);
        res.status(500).json({ error: 'Error fetching recent earthquakes by location' });
    }
}

async function exportEarthquakeReport(req, res) {
    const { city } = req.query;

    if (!city) {
        return res.status(400).json({ error: 'El nombre de la ciudad es requerido' });
    }

    try {
        const location = await getLocationByCity(city);

        if (!location) {
            return res.status(404).json({ error: `No se encontró la ubicación para la ciudad ${city}` });
        }

        const earthquakeData = await earthquakeService.getRecentEarthquakesByCoordinates(location.latitude, location.longitude);

        const excelFilePath = await excelService.generateEarthquakeExcelReport(earthquakeData, city);
        res.download(excelFilePath);
    } catch (error) {
        console.error('Error al exportar el reporte de sismos:', error);
        res.status(500).json({ error: 'Error al exportar el reporte de sismos' });
    }
}

const saveSearchToFavorites = async (req, res, next) => {
    const { userId } = req;
    const { location } = req.body;

    try {
        await db.query('INSERT INTO favorite_searches (user_id, search_query, search_type) VALUES (?, ?, ?)', [userId, location, 'earthquake']);
        res.status(200).json({ message: 'Búsqueda guardada en favoritos correctamente' });
    } catch (error) {
        console.error('Error al guardar la búsqueda en favoritos:', error);
        next(error);
    }
};

const getFavoriteSearches = async (req, res, next) => {
    const { userId } = req;

    try {
        const [rows] = await db.query('SELECT * FROM favorite_searches WHERE user_id = ? ORDER BY created_at DESC', [userId]);
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error al obtener las búsquedas favoritas:', error);
        next(error);
    }
};

const saveSearchToHistory = async (req, res, next) => {
    const { userId } = req;
    const { city } = req.params;

    try {
        await db.query('INSERT INTO search_history (user_id, search_query, search_type) VALUES (?, ?, ?)', [userId, city, 'earthquake']);
        res.status(200).json({ message: 'Búsqueda guardada en el historial correctamente' });
    } catch (error) {
        console.error('Error al guardar la búsqueda en el historial:', error);
        next(error);
    }
};

const getSearchHistory = async (req, res, next) => {
    const { userId } = req;

    try {
        const [rows] = await db.query('SELECT * FROM search_history WHERE user_id = ? AND search_type = ? ORDER BY created_at DESC', [userId, 'earthquake']);
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error al obtener el historial de búsquedas:', error);
        next(error);
    }
};

module.exports = {
    getRecentEarthquakesByCity,
    exportEarthquakeReport,
    getRecentEarthquakesByLocation,
    getFavoriteSearches,
    saveSearchToFavorites,
    saveSearchToHistory,
    getSearchHistory
};
