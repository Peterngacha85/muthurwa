const mongoose = require('mongoose');

const tomatoTypeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  variety: { type: String, required: true },
  unit: { type: String, required: true },
  description: { type: String },
  defaultPrice: { type: Number, required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('TomatoType', tomatoTypeSchema);
