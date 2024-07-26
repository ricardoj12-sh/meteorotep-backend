const axios = require('axios');
require('dotenv').config(); // Carga las variables de entorno desde el archivo .env

const GOOGLE_MAPS_API_URL = 'https://maps.googleapis.com/maps/api/geocode/json';
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY; // Reemplaza con tu clave API válida

exports.getLocationByCity = async (cityName) => {
    try {
        const geoParams = {
            address: cityName,
            key: GOOGLE_MAPS_API_KEY
        };

        const geoResponse = await fetchData(GOOGLE_MAPS_API_URL, geoParams);
        return extractLocationFromGeoResponse(geoResponse);
    } catch (error) {
        console.error('Error fetching location data:', error);
        throw error;
    }
};

async function fetchData(url, params) {
    try {
        const response = await axios.get(url, { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching data from API:', error);
        throw error;
    }
}

function extractLocationFromGeoResponse(response) {
    try {
        if (response.status === 'OK' && response.results.length > 0) {
            const location = response.results[0].geometry.location;
            return {
                latitude: location.lat,
                longitude: location.lng
            };
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error parsing geocoding response:', error);
        throw error;
    }
}