const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../database/db');
const { jwtSecret } = require('../config'); // Asegúrate de tener este archivo con tu secreto


const register = async (req, res) => {
    const { username, password, email } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await pool.query('INSERT INTO users (username, password, email) VALUES (?, ?, ?)', [username, hashedPassword, email]);

        res.status(201).json({ message: 'Usuario registrado' });
    } catch (error) {
        console.error('Error registrando usuario:', error);
        res.status(500).json({ error: 'Hubo un error registrando el usuario' });
    }
};

const login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);

        if (rows.length === 0) {
            return res.status(400).json({ error: 'Usuario o contraseña inválidos' });
        }

        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ error: 'Usuario o contraseña inválidos' });
        }

        const token = jwt.sign({ userId: user.id }, jwtSecret, { expiresIn: '1h' });

        res.json({ token });
    } catch (error) {
        console.error('Error iniciando sesión:', error);
        res.status(500).json({ error: 'Error iniciando sesión' });
    }
};
// Función para obtener el ID de usuario después de la autenticación
const getUserId = async (req, res) => {
    try {
        // Obtiene el usuario autenticado desde la base de datos o desde el token
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.json({ userId: user.id });
    } catch (error) {
        console.error('Error al obtener el ID de usuario:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

module.exports = {
    register,
    login,
    getUserId
};
