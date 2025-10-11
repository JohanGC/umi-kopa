const express = require('express');
const app = express();
const PORT = 5000;

// Ruta básica de health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Servidor funcionando' });
});

// Ruta simple de prueba
app.get('/api/test', (req, res) => {
  res.json({ message: 'Test exitoso' });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});