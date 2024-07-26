const axios = require('axios');

const USGS_API_URL = 'https://earthquake.usgs.gov/fdsnws/event/1/query';

exports.getRecentEarthquakesByCoordinates = async (latitude, longitude) => {
    try {
        const params = {
            format: 'geojson',
            starttime: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // Cambiado a 10 días
            endtime: new Date().toISOString(),
            latitude: latitude,
            longitude: longitude,
            maxradius: 100  // Radio de búsqueda en kilómetros
        };

        const response = await axios.get(USGS_API_URL, { params });
        return response.data.features;  // Extrae los datos de los terremotos
    } catch (error) {
        console.error('Error fetching earthquake data:', error);
        throw error;
    }
};
