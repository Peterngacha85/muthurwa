const express = require('express');
const { body } = require('express-validator');
const tomatoTypeController = require('../controllers/tomatoTypeController');
const auth = require('../middlewares/auth');

const router = express.Router();

// All routes require authentication
router.use(auth);

// Create tomato type
router.post(
  '/',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('variety').notEmpty().withMessage('Variety is required'),
    body('unit').notEmpty().withMessage('Unit is required'),
    body('defaultPrice').isNumeric().withMessage('Default price must be a number'),
  ],
  tomatoTypeController.createTomatoType
);

// Get all tomato types
router.get('/', tomatoTypeController.getTomatoTypes);

// Get single tomato type
router.get('/:id', tomatoTypeController.getTomatoType);

// Update tomato type
router.put('/:id', tomatoTypeController.updateTomatoType);

// Delete tomato type
router.delete('/:id', tomatoTypeController.deleteTomatoType);

module.exports = router;
