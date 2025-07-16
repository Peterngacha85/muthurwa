// Get all debts (unpaid or partial), with optional dueDate filter
exports.getDebts = async (req, res) => {
  try {
    const filter = {
      ownerId: req.user.userId,
      paymentStatus: { $in: ['unpaid', 'partial'] }
    };
    if (req.query.dueDate) {
      filter.dueDate = { $lte: new Date(req.query.dueDate) };
    }
    const debts = await Transaction.find(filter).populate('buyerId tomatoTypeId');
    res.json(debts);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};
const Transaction = require('../models/Transaction');
const { validationResult } = require('express-validator');

exports.createTransaction = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { buyerId, tomatoTypeId, quantity, unitPrice, totalAmount, paidAmount, paymentStatus, deliveryStatus, deliveryDate, dueDate } = req.body;
    const transaction = new Transaction({
      buyerId,
      tomatoTypeId,
      quantity,
      unitPrice,
      totalAmount,
      paidAmount,
      paymentStatus,
      deliveryStatus,
      deliveryDate,
      dueDate,
      ownerId: req.user.userId
    });
    await transaction.save();

    // Automatically create a delivery if deliveryStatus is provided and not empty
    if (deliveryStatus && (deliveryStatus === 'pending' || deliveryStatus === 'delivered')) {
      const Delivery = require('../models/Delivery');
      // Only create if not already exists
      const existingDelivery = await Delivery.findOne({ transactionId: transaction._id, ownerId: req.user.userId });
      if (!existingDelivery) {
        await Delivery.create({
          transactionId: transaction._id,
          buyerId: transaction.buyerId,
          deliveryPersonName: req.user.name || 'Me',
          deliveryLocation: req.body.deliveryLocation || 'N/A',
          deliveryStatus: deliveryStatus,
          ownerId: req.user.userId
        });
      }
    }

    // Populate buyerId and tomatoTypeId before sending response
    const populatedTransaction = await Transaction.findById(transaction._id).populate('buyerId tomatoTypeId');
    res.status(201).json(populatedTransaction);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

exports.getTransactions = async (req, res) => {
  try {
    const filter = {};
    if (req.user.role !== 'admin') {
      filter.ownerId = req.user.userId;
    }
    if (req.query.paymentStatus) filter.paymentStatus = req.query.paymentStatus;
    if (req.query.deliveryStatus) filter.deliveryStatus = req.query.deliveryStatus;
    if (req.query.dueDate) filter.dueDate = { $lte: new Date(req.query.dueDate) };
    const transactions = await Transaction.find(filter).populate('buyerId tomatoTypeId');
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

exports.getTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ _id: req.params.id, ownerId: req.user.userId }).populate('buyerId tomatoTypeId');
    if (!transaction) return res.status(404).json({ msg: 'Transaction not found' });
    res.json(transaction);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

exports.updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, ownerId: req.user.userId },
      req.body,
      { new: true }
    );
    if (!transaction) return res.status(404).json({ msg: 'Transaction not found' });

    // If deliveryStatus is set to 'delivered', update the corresponding delivery
    if (req.body.deliveryStatus === 'delivered') {
      const Delivery = require('../models/Delivery');
      await Delivery.findOneAndUpdate(
        { transactionId: transaction._id, ownerId: req.user.userId },
        { deliveryStatus: 'delivered' }
      );
    }

    res.json(transaction);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

exports.deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({ _id: req.params.id, ownerId: req.user.userId });
    if (!transaction) return res.status(404).json({ msg: 'Transaction not found' });
    res.json({ msg: 'Transaction deleted' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};
