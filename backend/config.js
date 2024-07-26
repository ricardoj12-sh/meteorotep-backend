require('dotenv').config(); // Carga las variables de entorno desde el archivo .env

module.exports = {
    jwtSecret: process.env.JWT_SECRET || 'djbwhdhnudhbwnxjnwdhuwwdhwxndh',
    jwtExpirySeconds: parseInt(process.env.JWT_EXPIRY_SECONDS, 10) || 3600,
    apiKeys: {
        openWeatherMap: process.env.OPENWEATHERMAP_API_KEY || '9f0699e75c0ca345057344fac67123d7',
        GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY || 'AIzaSyCaFgo3l3atkS8bsuZGOOKDAI6hGrmJCgc'

    },
    db: {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'ricardojosue2005',
        database: process.env.DB_DATABASE || 'meteorotep'
    }
};