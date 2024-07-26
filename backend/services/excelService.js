const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');

exports.generateEarthquakeExcelReport = async (earthquakeData, city) => {
    const directoryPath = path.join(__dirname, '..', 'files');
    const filePath = path.join(directoryPath, `earthquake_report_${city}_${Date.now()}.xlsx`);

    // Crear la carpeta si no existe
    if (!fs.existsSync(directoryPath)) {
        fs.mkdirSync(directoryPath, { recursive: true });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Earthquakes');

    worksheet.columns = [
        { header: 'Date', key: 'date', width: 30 },
        { header: 'Magnitude', key: 'magnitude', width: 15 },
        { header: 'Location', key: 'location', width: 30 }
    ];

    earthquakeData.forEach(eq => {
        worksheet.addRow({
            date: new Date(eq.properties.time).toISOString(),
            magnitude: eq.properties.mag,
            location: eq.properties.place
        });
    });

    await workbook.xlsx.writeFile(filePath);

    return filePath;
};

exports.generateDailyForecastExcelReport = async (forecast, city) => {
    const directoryPath = path.join(__dirname, '..', 'files');
    const safeCityName = city.replace(/[/\\?%*:|"<>]/g, ''); // Eliminar caracteres inválidos
    const fileName = `daily_forecast_${safeCityName}_${Date.now()}.xlsx`;
    const filePath = path.join(directoryPath, fileName);

    // Crear la carpeta si no existe
    if (!fs.existsSync(directoryPath)) {
        fs.mkdirSync(directoryPath, { recursive: true });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Daily Forecast');

    // Configurar las columnas
    worksheet.columns = [
        { header: 'Date', key: 'date', width: 30 },
        { header: 'Day of Week', key: 'dayOfWeek', width: 20 },
        { header: 'Temperature (°C)', key: 'temperature', width: 20 },
        { header: 'Feels Like (°C)', key: 'feelsLike', width: 20 },
        { header: 'Description', key: 'description', width: 40 },
        { header: 'Humidity (%)', key: 'humidity', width: 20 },
        { header: 'Wind Speed (m/s)', key: 'windSpeed', width: 20 }
    ];

    // Agregar datos al archivo
    forecast.forEach(day => {
        worksheet.addRow({
            date: day.date || 'N/A',
            dayOfWeek: day.dayOfWeek || 'N/A',
            temperature: day.temperature !== undefined ? `${day.temperature}` : 'N/A',
            feelsLike: day.feels_like !== undefined ? `${day.feels_like}` : 'N/A',
            description: day.weather || 'N/A',
            humidity: day.humidity !== undefined ? `${day.humidity}` : 'N/A',
            windSpeed: day.windSpeed !== undefined ? `${day.windSpeed}` : 'N/A'
        });
    });

    // Guardar el archivo
    await workbook.xlsx.writeFile(filePath);

    return filePath;
};
