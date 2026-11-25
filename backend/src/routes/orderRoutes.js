const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

router.post('/estimate', orderController.calculateEstimate);
router.post('/', orderController.createOrder);
router.get('/:id', orderController.getOrderById);
router.post('/:id/rate', orderController.rateOrder);

module.exports = router;
