const https = require('https');
require('dotenv').config(); // Carga las variables de entorno desde el archivo .env

const API_KEY = process.env.API_KEY; // Obtiene la clave de API desde las variables de entorno
const BASE_URL = 'https://api.openweathermap.org'; // Asegúrate de incluir el protocolo

// Función para realizar solicitudes a la API
function fetchFromAPI(path) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.openweathermap.org',
            port: 443,
            path: path,
            method: 'GET'
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    console.log('API Response:', jsonData); // Agrega esta línea para depurar
                    resolve(jsonData);
                } catch (error) {
                    reject(new Error('Error parsing response data'));
                }
            });
        });

        req.on('error', (err) => {
            console.error('Error fetching data from API:', err);
            reject(err);
        });

        req.end();
    });
}

// Obtener coordenadas de la ciudad
function getCityCoordinates(city) {
    const url = `/geo/1.0/direct?q=${encodeURIComponent(city)}&appid=${API_KEY}&limit=1`;
    return fetchFromAPI(url).then(jsonData => {
        if (jsonData.length === 0) {
            throw new Error(`City not found for query: ${city}`);
        }
        const { lat, lon } = jsonData[0];
        return { lat, lon };
    });
}

// Obtener el nombre del día de la semana
function getDayOfWeek(date) {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return daysOfWeek[date.getUTCDay()];
}

function getDailyForecast(city) {
    const url = `/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;
    return fetchFromAPI(url).then(jsonData => {
        if (!jsonData || !jsonData.list || jsonData.list.length === 0) {
            throw new Error('No forecast data available');
        }

        const uniqueDays = new Map();
        jsonData.list.forEach(item => {
            const date = new Date(item.dt * 1000);
            const dateStr = date.toISOString().split('T')[0];
            const dayOfWeek = getDayOfWeek(date);

            if (!uniqueDays.has(dateStr)) {
                uniqueDays.set(dateStr, {
                    date: dateStr,
                    dayOfWeek: dayOfWeek,
                    temperature: item.main.temp,
                    feels_like: item.main.feels_like,
                    pressure: item.main.pressure,
                    humidity: item.main.humidity,
                    weather: item.weather[0].description,
                    windSpeed: item.wind.speed,
                    clouds: item.clouds.all,
                    pop: item.pop
                });
            }
        });

        return Array.from(uniqueDays.values());
    }).catch(error => {
        console.error('Error fetching daily forecast data:', error);
        throw new Error('Error fetching daily forecast');
    });
}


// Obtener el clima actual por coordenadas
function getCurrentWeather(lat, lon) {
    const url = `/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
    return fetchFromAPI(url).then(jsonData => {
        if (!jsonData || !jsonData.main) {
            throw new Error('No weather data available');
        }

        const {
            main: { temp, feels_like, temp_min, temp_max, pressure, humidity },
            wind: { speed },
            sys: { country },
            name,
            weather
        } = jsonData;

        const { description, icon } = weather[0];

        return {
            description,
            iconURL: `https://openweathermap.org/img/wn/${icon}.png`,
            temp,
            feels_like,
            temp_min,
            temp_max,
            pressure,
            humidity,
            speed,
            country,
            name
        };
    }).catch(error => {
        console.error('Error fetching current weather:', error);
        throw new Error('Error fetching current weather');
    });
}

function getDailyForecastByCoordinates(lat, lon) {
    const url = `/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
    return fetchFromAPI(url).then(jsonData => {
        if (!jsonData || !jsonData.list || jsonData.list.length === 0) {
            throw new Error('No forecast data available');
        }

        const uniqueDays = new Map();
        jsonData.list.forEach(item => {
            const date = new Date(item.dt * 1000);
            const dateStr = date.toISOString().split('T')[0];
            const dayOfWeek = getDayOfWeek(date);

            if (!uniqueDays.has(dateStr)) {
                uniqueDays.set(dateStr, {
                    date: dateStr,
                    dayOfWeek: dayOfWeek,
                    temperature: item.main.temp,
                    feels_like: item.main.feels_like,
                    pressure: item.main.pressure,
                    humidity: item.main.humidity,
                    weather: item.weather[0].description,
                    windSpeed: item.wind.speed,
                    clouds: item.clouds.all,
                    pop: item.pop
                });
            }
        });

        return Array.from(uniqueDays.values());
    }).catch(error => {
        console.error('Error fetching daily forecast data by coordinates:', error);
        throw new Error('Error fetching daily forecast');
    });
}

// Obtener el clima actual y pronóstico por ciudad
async function getCurrentWeatherAndForecastByCity(city) {
    try {
        const { lat, lon } = await getCityCoordinates(city);
        const [currentWeather, forecast] = await Promise.all([
            getCurrentWeather(lat, lon),
            getDailyForecast(city)
        ]);
        return { currentWeather, forecast };
    } catch (error) {
        console.error('Error fetching current weather and forecast by city:', error);
        throw error;
    }
}

// Obtener el clima actual y pronóstico por coordenadas
async function getCurrentWeatherAndForecast(lat, lon) {
    try {
        const [currentWeather, forecast] = await Promise.all([
            getCurrentWeather(lat, lon),
            getDailyForecastByCoordinates(lat, lon)
        ]);
        return { currentWeather, forecast };
    } catch (error) {
        console.error('Error fetching current weather and forecast:', error);
        throw error;
    }
}

module.exports = {
    getDailyForecast,
    getCurrentWeather,
    getCurrentWeatherAndForecast,
    getCurrentWeatherAndForecastByCity,
    getDailyForecastByCoordinates
};
