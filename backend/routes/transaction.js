const express = require('express');
const { body } = require('express-validator');
const transactionController = require('../controllers/transactionController');
const auth = require('../middlewares/auth');

const router = express.Router();

// All routes require authentication
router.use(auth);


// Get all debts (unpaid or partial), with optional dueDate filter
router.get('/debts', transactionController.getDebts);

// Create transaction
router.post(
  '/',
  [
    body('buyerId').notEmpty().withMessage('Buyer is required'),
    body('tomatoTypeId').notEmpty().withMessage('Tomato type is required'),
    body('quantity').isNumeric().withMessage('Quantity must be a number'),
    body('unitPrice').isNumeric().withMessage('Unit price must be a number'),
    body('totalAmount').isNumeric().withMessage('Total amount must be a number'),
    body('paidAmount').isNumeric().withMessage('Paid amount must be a number'),
    body('paymentStatus').isIn(['paid', 'unpaid', 'partial']).withMessage('Invalid payment status'),
    body('deliveryStatus').isIn(['delivered', 'pending']).withMessage('Invalid delivery status'),
  ],
  transactionController.createTransaction
);

// Get all transactions (with optional filters)
router.get('/', transactionController.getTransactions);

// Get single transaction
router.get('/:id', transactionController.getTransaction);

// Update transaction
router.put('/:id', transactionController.updateTransaction);

// Delete transaction
router.delete('/:id', transactionController.deleteTransaction);

module.exports = router;
