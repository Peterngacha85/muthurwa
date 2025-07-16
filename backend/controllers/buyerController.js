const Buyer = require('../models/Buyer');
const { validationResult } = require('express-validator');

exports.createBuyer = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { name, phone, idNumber, location } = req.body;
    const buyer = new Buyer({
      name,
      phone,
      idNumber,
      location,
      ownerId: req.user.userId
    });
    await buyer.save();
    res.status(201).json(buyer);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

exports.getBuyers = async (req, res) => {
  try {
    const filter = {};
    if (req.user.role !== 'admin') {
      filter.ownerId = req.user.userId;
    }
    const buyers = await Buyer.find(filter);
    res.json(buyers);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

exports.getBuyer = async (req, res) => {
  try {
    const buyer = await Buyer.findOne({ _id: req.params.id, ownerId: req.user.userId });
    if (!buyer) return res.status(404).json({ msg: 'Buyer not found' });
    res.json(buyer);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

exports.updateBuyer = async (req, res) => {
  try {
    const buyer = await Buyer.findOneAndUpdate(
      { _id: req.params.id, ownerId: req.user.userId },
      req.body,
      { new: true }
    );
    if (!buyer) return res.status(404).json({ msg: 'Buyer not found' });
    res.json(buyer);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

exports.deleteBuyer = async (req, res) => {
  try {
    const buyer = await Buyer.findOneAndDelete({ _id: req.params.id, ownerId: req.user.userId });
    if (!buyer) return res.status(404).json({ msg: 'Buyer not found' });
    res.json({ msg: 'Buyer deleted' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};
