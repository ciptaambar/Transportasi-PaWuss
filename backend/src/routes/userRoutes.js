const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');

router.get('/:userId/favorites', favoriteController.getFavoriteDrivers);
router.post('/:userId/favorites', favoriteController.addFavoriteDriver);
router.delete('/:userId/favorites/:driverId', favoriteController.removeFavoriteDriver);

module.exports = router;
