const fs = require('fs');
const path = require('path');
const weatherService = require('../services/weatherService');
const excelService = require('../services/excelService');
const db = require('../database/db');

const getDayOfWeek = (dateStr) => {
    const date = new Date(dateStr);
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    // Asegurarse de que la fecha esté en la zona horaria local
    const localDate = new Date(date.toLocaleDateString());
    
    return daysOfWeek[localDate.getDay()];
};


// Función para exportar pronóstico diario a Excel
const exportDailyForecastToExcel = async (req, res, next) => {
    const { city, lat, lon } = req.query;

    try {
        let forecast;
        if (city) {
            forecast = await weatherService.getDailyForecast(city);
        } else if (lat && lon) {
            forecast = await weatherService.getDailyForecastByCoordinates(lat, lon);
        } else {
            return res.status(400).json({ error: 'City or latitude and longitude are required' });
        }

        if (!forecast || forecast.length === 0) {
            return res.status(404).json({ error: 'No forecast data available' });
        }

        console.log('Forecast:', forecast);

        // Definir directorios para guardar el archivo
        const projectDir = path.resolve(__dirname, '..');
        const filesDir = path.join(projectDir, 'files');

        // Crear carpeta 'files' si no existe
        if (!fs.existsSync(filesDir)) {
            fs.mkdirSync(filesDir);
        }

        // Generar archivo de Excel
        const safeCityName = city.replace(/[/\\?%*:|"<>]/g, ''); // Eliminar caracteres inválidos
        const fileName = `daily_forecast_${safeCityName || `coords_${lat}_${lon}`}_${Date.now()}.xlsx`;
        const filePath = path.join(filesDir, fileName);
        await excelService.generateDailyForecastExcelReport(forecast, safeCityName || `coords_${lat}_${lon}`);

        // Enviar el archivo al cliente para su descarga
        res.download(filePath, fileName);

        console.log(`Reporte de clima guardado en: ${filePath}`);
    } catch (error) {
        next(error);
    }
};

const getDailyForecast = async (req, res) => {
    const { city, lat, lon } = req.query;

    try {
        let forecast;
        if (city) {
            forecast = await weatherService.getDailyForecast(city);
        } else if (lat && lon) {
            forecast = await weatherService.getDailyForecastByCoordinates(lat, lon);
        } else {
            return res.status(400).json({ error: 'City or latitude and longitude are required' });
        }

        if (!forecast || forecast.length === 0) {
            return res.status(404).json({ error: 'No forecast data available' });
        }

        // Ordenar pronóstico por fecha
        forecast.sort((a, b) => new Date(a.date) - new Date(b.date));

        // Eliminar duplicados por fecha y actualizar dayOfWeek
        const uniqueForecast = Array.from(new Map(forecast.map(item => [item.date, { ...item, dayOfWeek: getDayOfWeek(item.date) }])).values());

        res.json({ forecast: uniqueForecast });
    } catch (error) {
        console.error('Error fetching daily forecast:', error);
        res.status(500).json({ error: 'Error fetching daily forecast' });
    }
};


const getCurrentWeatherAndForecast = async (req, res) => {
    const { lat, lon, city } = req.query;

    try {
        let weatherData;
        if (city) {
            weatherData = await weatherService.getCurrentWeatherAndForecastByCity(city);
        } else if (lat && lon) {
            weatherData = await weatherService.getCurrentWeatherAndForecast(lat, lon);
        } else {
            return res.status(400).json({ error: 'City or latitude and longitude are required' });
        }

        // Ordenar pronóstico por fecha
        weatherData.forecast.sort((a, b) => new Date(a.date) - new Date(b.date));

        // Asegúrate de que el pronóstico no tenga días duplicados y actualiza dayOfWeek
        const uniqueForecast = Array.from(new Map(weatherData.forecast.map(item => [item.date, { ...item, dayOfWeek: getDayOfWeek(item.date) }])).values());

        res.json({ currentWeather: weatherData.currentWeather, forecast: uniqueForecast });
    } catch (error) {
        console.error('Error fetching current weather and forecast:', error);
        res.status(500).json({ error: 'Error fetching current weather and forecast' });
    }
};

// Función para guardar la búsqueda en el historial
const saveSearchToHistory = async (req, res, next) => {
    const { userId } = req;
    const { city } = req.params; // Obtener ciudad desde los parámetros de la solicitud

    try {
        await db.query('INSERT INTO search_history (user_id, search_query, search_type) VALUES (?, ?, ?)', [userId, city, 'weather']);
        res.status(200).json({ message: 'Búsqueda guardada en el historial correctamente' });
    } catch (error) {
        console.error('Error al guardar la búsqueda en el historial:', error);
        next(error);
    }
};

// Función para obtener el historial de búsquedas
const getSearchHistory = async (req, res, next) => {
    const { userId } = req;

    try {
        const [rows] = await db.query('SELECT * FROM search_history WHERE user_id = ? ORDER BY created_at DESC', [userId]);
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error al obtener el historial de búsquedas:', error);
        next(error);
    }
};

// Función para guardar la búsqueda en favoritos
const saveSearchToFavorites = async (req, res, next) => {
    const { userId } = req;
    const { location } = req.body; // Obtener ubicación desde el cuerpo de la solicitud

    try {
        await db.query('INSERT INTO favorite_searches (user_id, search_query, search_type) VALUES (?, ?, ?)', [userId, location, 'weather']);
        res.status(200).json({ message: 'Búsqueda guardada en favoritos correctamente' });
    } catch (error) {
        console.error('Error al guardar la búsqueda en favoritos:', error);
        next(error);
    }
};

// Función para obtener el clima actual
const getCurrentWeather = async (req, res) => {
    const city = req.params.city;
    try {
        const weather = await weatherService.getCurrentWeather(city);
        res.json({ weather });
    } catch (error) {
        console.error('Error fetching current weather:', error);
        res.status(500).json({ error: 'Error fetching current weather' });
    }
};

// Función para obtener las búsquedas favoritas
const getFavoriteSearches = async (req, res, next) => {
    const { userId } = req;

    try {
        const [rows] = await db.query('SELECT * FROM favorite_searches WHERE user_id = ? AND search_type = ? ORDER BY created_at DESC', [userId, 'weather']);
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error al obtener las búsquedas favoritas:', error);
        next(error);
    }
};

module.exports = {
    getDailyForecast,
    exportDailyForecastToExcel,
    getCurrentWeatherAndForecast,
    getSearchHistory,
    saveSearchToHistory,
    saveSearchToFavorites,
    getCurrentWeather,
    getFavoriteSearches
};
