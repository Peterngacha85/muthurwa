const express = require('express');
const { body } = require('express-validator');
const deliveryController = require('../controllers/deliveryController');
const auth = require('../middlewares/auth');

const router = express.Router();

// All routes require authentication
router.use(auth);

// Create delivery
router.post(
  '/',
  [
    body('transactionId').notEmpty().withMessage('Transaction is required'),
    body('buyerId').notEmpty().withMessage('Buyer is required'),
    body('deliveryPersonName').notEmpty().withMessage('Delivery person name is required'),
    body('deliveryLocation').notEmpty().withMessage('Delivery location is required'),
    body('deliveryStatus').isIn(['delivered', 'pending']).withMessage('Invalid delivery status'),
  ],
  deliveryController.createDelivery
);

// Get all deliveries (with optional status filter)
router.get('/', deliveryController.getDeliveries);

// Get single delivery
router.get('/:id', deliveryController.getDelivery);

// Update delivery
router.put('/:id', deliveryController.updateDelivery);

// Delete delivery
router.delete('/:id', deliveryController.deleteDelivery);

module.exports = router;
