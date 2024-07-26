const express = require('express');
const jwt = require('jsonwebtoken');
const { jwtSecret, jwtExpirySeconds } = require('../config'); // Asegúrate de definir jwtExpirySeconds

const router = express.Router();

router.post('/refresh-token', (req, res) => {
  const oldToken = req.header('Authorization')?.replace('Bearer ', '');

  if (!oldToken) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  try {
    const decoded = jwt.verify(oldToken, jwtSecret, { ignoreExpiration: true });
    const newToken = jwt.sign({ userId: decoded.userId }, jwtSecret, { expiresIn: jwtExpirySeconds });
    res.json({ token: newToken });
  } catch (error) {
    console.error('Error refrescando token:', error);
    res.status(401).json({ error: 'Token inválido' });
  }
});

module.exports = router;
