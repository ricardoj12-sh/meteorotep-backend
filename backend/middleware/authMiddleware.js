const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config'); // Asegúrate de tener este archivo con tu secreto

const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    const publicRoutes = [
        '/api/auth/register',
        '/api/auth/login',
        '/api/auth/refresh-token'
    ];

    // Verificar si la ruta actual es una de las rutas públicas
    const isPublicRoute = publicRoutes.some(route => req.path.startsWith(route));

    if (!token && !isPublicRoute) {
        return res.status(401).json({ error: 'Acceso denegado - Token no proporcionado' });
    }

    try {
        if (token && !isPublicRoute) {
            const decoded = jwt.verify(token, jwtSecret);
            req.userId = decoded.userId;
        }
        next();
    } catch (error) {
        console.error('Token inválido:', error);
        res.status(401).json({ error: 'Acceso denegado - Token inválido' });
    }
};

module.exports = authMiddleware;
