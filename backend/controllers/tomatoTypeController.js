const TomatoType = require('../models/TomatoType');
const { validationResult } = require('express-validator');

exports.createTomatoType = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { name, variety, unit, description, defaultPrice } = req.body;
    const tomatoType = new TomatoType({
      name,
      variety,
      unit,
      description,
      defaultPrice,
      ownerId: req.user.userId
    });
    await tomatoType.save();
    res.status(201).json(tomatoType);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

exports.getTomatoTypes = async (req, res) => {
  try {
    const filter = {};
    if (req.user.role !== 'admin') {
      filter.ownerId = req.user.userId;
    }
    const types = await TomatoType.find(filter);
    res.json(types);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

exports.getTomatoType = async (req, res) => {
  try {
    const type = await TomatoType.findOne({ _id: req.params.id, ownerId: req.user.userId });
    if (!type) return res.status(404).json({ msg: 'Tomato type not found' });
    res.json(type);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

exports.updateTomatoType = async (req, res) => {
  try {
    const type = await TomatoType.findOneAndUpdate(
      { _id: req.params.id, ownerId: req.user.userId },
      req.body,
      { new: true }
    );
    if (!type) return res.status(404).json({ msg: 'Tomato type not found' });
    res.json(type);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

exports.deleteTomatoType = async (req, res) => {
  try {
    const type = await TomatoType.findOneAndDelete({ _id: req.params.id, ownerId: req.user.userId });
    if (!type) return res.status(404).json({ msg: 'Tomato type not found' });
    res.json({ msg: 'Tomato type deleted' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};
