const express = require('express');
const app = express();
const cors = require('cors');

const authMiddleware = require('./middleware/authMiddleware');
const weatherRoutes = require('./routes/weatherRoutes');
const earthquakeRoutes = require('./routes/earthquakeRoutes');
const authRoutes = require('./routes/authRoutes');
const refreshTokenRoutes = require('./routes/token-refresh');

// Configuración de CORS
app.use(cors({
    origin: ['http://localhost:3001', 'http://localhost:3002', 'http://localhost:3004', 'http://localhost:3006'],  // Reemplaza con la URL de tu frontend
    methods: ['GET', 'POST'],  // Métodos permitidos
    allowedHeaders: ['Content-Type', 'Authorization']  // Cabeceras permitidas
}));

app.use(express.json());

// Rutas de la aplicación
app.use('/api/auth', authRoutes);
app.use('/api/earthquakes', earthquakeRoutes);  // Rutas de sismos
app.use('/api/weather', authMiddleware, weatherRoutes); // Rutas de clima protegidas por autenticación
app.use('/api/auth/refresh-token', refreshTokenRoutes); // Rutas de renovación de token

// Manejo de errores de rutas no encontradas
app.use((req, res, next) => {
    console.log(`Ruta no encontrada: ${req.url}`);
    const error = new Error('Not Found');
    error.status = 404;
    next(error);
});

// Manejo de errores
app.use((err, req, res, next) => {
    console.error(`Error: ${err.message}`);
    res.status(err.status || 500).json({
        error: {
            message: err.message
        }
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
