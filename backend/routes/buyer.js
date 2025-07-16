const express = require('express');
const { body } = require('express-validator');
const buyerController = require('../controllers/buyerController');
const auth = require('../middlewares/auth');

const router = express.Router();

// All routes require authentication
router.use(auth);

// Create buyer
router.post(
  '/',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('phone').notEmpty().withMessage('Phone is required'),
    body('idNumber').notEmpty().withMessage('ID Number is required'),
  ],
  buyerController.createBuyer
);

// Get all buyers
router.get('/', buyerController.getBuyers);

// Get single buyer
router.get('/:id', buyerController.getBuyer);

// Update buyer
router.put('/:id', buyerController.updateBuyer);

// Delete buyer
router.delete('/:id', buyerController.deleteBuyer);

module.exports = router;
