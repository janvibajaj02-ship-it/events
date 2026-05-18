const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['event', 'registration', 'system'], default: 'event' },
  isRead: { type: Boolean, default: false },
  priority: { type: String, enum: ['normal', 'urgent'], default: 'normal' },
  relatedId: { type: mongoose.Schema.Types.ObjectId }, // ID of event or registration
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);
