const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema({
  transactionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction', required: true },
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Buyer', required: true },
  deliveryPersonName: { type: String, required: true },
  deliveryLocation: { type: String, required: true },
  deliveryStatus: { type: String, enum: ['delivered', 'pending'], default: 'pending' },
  timestamp: { type: Date, default: Date.now },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Delivery', deliverySchema);
