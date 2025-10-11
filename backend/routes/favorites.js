const express = require('express');
const router = express.Router();

// Rutas básicas para Favorites
router.get('/', (req, res) => {
  res.json({ message: 'Ruta de favoritos funcionando' });
});

router.post('/', (req, res) => {
  res.json({ message: 'Favorito agregado' });
});

router.delete('/:id', (req, res) => {
  res.json({ message: 'Favorito eliminado' });
});

module.exports = router;