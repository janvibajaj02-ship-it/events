const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  priority: { type: String, enum: ['normal', 'high', 'urgent'], default: 'normal' },
  image: { type: String }, // Optional URL for background
  expiryDate: { type: Date, required: true },
  relatedEventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' }, // Optional redirect
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Announcement', announcementSchema);
