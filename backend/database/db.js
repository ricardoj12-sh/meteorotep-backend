const mysql = require('mysql2/promise');
require('dotenv').config(); // Carga las variables de entorno desde el archivo .env

// Obtiene las configuraciones de la base de datos desde las variables de entorno
const hostname = process.env.DB_HOST;
const user = process.env.DB_USER;
const password = process.env.DB_PASSWORD;
const database = process.env.DB_DATABASE;

const pool = mysql.createPool({
  connectionLimit: 10,
  host: hostname,
  user: user,
  password: password,
  database: database
});

// Conexión inicial para verificar y mostrar un mensaje de éxito
pool.getConnection()
  .then(connection => {
    console.log('Conexión exitosa al pool de conexiones MySQL');
    connection.release();
  })
  .catch(err => {
    console.error('Error al conectar con el pool de conexiones:', err);
    throw err;
  });

module.exports = pool;