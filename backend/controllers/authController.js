const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const Transaction = require('../models/Transaction');
const Delivery = require('../models/Delivery');

exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { name, phone, password, location, role } = req.body;
    let user = await User.findOne({ phone });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }
    user = new User({ name, phone, password, location, role });
    await user.save();
    const payload = { userId: user._id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { phone, password } = req.body;
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }
    const payload = { userId: user._id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        location: user.location
      }
    });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

exports.getAllVendors = async (req, res) => {
  try {
    const vendors = await User.find({ role: 'vendor' }).select('-password');
    res.json(vendors);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

exports.getVendorsWithStats = async (req, res) => {
  try {
    const vendors = await User.find({ role: 'vendor' }).select('-password');
    const vendorIds = vendors.map(v => v._id);

    // Aggregate transactions and revenue per vendor
    const transactions = await Transaction.aggregate([
      { $match: { ownerId: { $in: vendorIds } } },
      { $group: { _id: '$ownerId', totalSales: { $sum: 1 }, totalRevenue: { $sum: '$totalAmount' } } }
    ]);
    const deliveries = await Delivery.aggregate([
      { $match: { ownerId: { $in: vendorIds } } },
      { $group: { _id: '$ownerId', totalDeliveries: { $sum: 1 } } }
    ]);

    // Map stats to vendors
    const vendorStats = vendors.map(vendor => {
      const t = transactions.find(t => String(t._id) === String(vendor._id)) || {};
      const d = deliveries.find(d => String(d._id) === String(vendor._id)) || {};
      return {
        ...vendor.toObject(),
        totalSales: t.totalSales || 0,
        totalRevenue: t.totalRevenue || 0,
        totalDeliveries: d.totalDeliveries || 0
      };
    });
    res.json(vendorStats);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

exports.updateVendor = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Forbidden' });
    const { name, phone, location } = req.body;
    const vendor = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'vendor' },
      { name, phone, location },
      { new: true }
    ).select('-password');
    if (!vendor) return res.status(404).json({ msg: 'Vendor not found' });
    res.json(vendor);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

exports.deleteVendor = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Forbidden' });
    const vendor = await User.findOneAndDelete({ _id: req.params.id, role: 'vendor' });
    if (!vendor) return res.status(404).json({ msg: 'Vendor not found' });
    res.json({ msg: 'Vendor deleted' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};
