const router = require('express').Router();

const favoritesController = require('../controllers/favorites.controller');

router.get('/favorites', favoritesController.getFavorites);
router.post('/favorites', favoritesController.createFavorite);
router.get('/favorites/:id', favoritesController.getFavorite);
router.patch('/favorites/:id', favoritesController.updateFavorite);
router.delete('/favorites/:id', favoritesController.deleteFavorite);
router.get('/favorites-by-owner/:id', favoritesController.getFavoritesByOwnerId);

module.exports = router;
