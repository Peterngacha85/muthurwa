const Delivery = require('../models/Delivery');
const { validationResult } = require('express-validator');

exports.createDelivery = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { transactionId, buyerId, deliveryPersonName, deliveryLocation, deliveryStatus } = req.body;
    const delivery = new Delivery({
      transactionId,
      buyerId,
      deliveryPersonName,
      deliveryLocation,
      deliveryStatus,
      ownerId: req.user.userId
    });
    await delivery.save();
    res.status(201).json(delivery);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

exports.getDeliveries = async (req, res) => {
  try {
    const filter = {};
    if (req.user.role !== 'admin') {
      filter.ownerId = req.user.userId;
    }
    if (req.query.deliveryStatus) filter.deliveryStatus = req.query.deliveryStatus;
    const deliveries = await Delivery.find(filter).populate('transactionId buyerId');
    res.json(deliveries);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

exports.getDelivery = async (req, res) => {
  try {
    const delivery = await Delivery.findOne({ _id: req.params.id, ownerId: req.user.userId }).populate('transactionId buyerId');
    if (!delivery) return res.status(404).json({ msg: 'Delivery not found' });
    res.json(delivery);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

exports.updateDelivery = async (req, res) => {
  try {
    const delivery = await Delivery.findOneAndUpdate(
      { _id: req.params.id, ownerId: req.user.userId },
      req.body,
      { new: true }
    );
    if (!delivery) return res.status(404).json({ msg: 'Delivery not found' });
    res.json(delivery);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

exports.deleteDelivery = async (req, res) => {
  try {
    const delivery = await Delivery.findOneAndDelete({ _id: req.params.id, ownerId: req.user.userId });
    if (!delivery) return res.status(404).json({ msg: 'Delivery not found' });
    res.json({ msg: 'Delivery deleted' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};
