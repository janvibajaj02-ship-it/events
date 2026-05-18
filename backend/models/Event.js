const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true }, // Start Date
  endDate: { type: Date }, // End Date for multi-day events
  startTime: { type: String }, // e.g., "10:00 AM"
  endTime: { type: String }, // e.g., "05:00 PM"
  venue: { type: String, required: true },
  category: { type: String, required: true },
  image: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'completed'], default: 'pending' },
  maxSeats: { type: Number, required: true, min: 1 },
  registeredCount: { type: Number, default: 0, min: 0 },
  completedAt: { type: Date, default: null },
  attendanceCode: { type: String, default: null },
  registrationDeadline: { type: Date },
  isAIGenerated: { type: Boolean, default: false },
}, { timestamps: true });

eventSchema.virtual('seatsLeft').get(function seatsLeft() {
  return Math.max(this.maxSeats - this.registeredCount, 0);
});

eventSchema.virtual('isFull').get(function isFull() {
  return this.registeredCount >= this.maxSeats;
});

eventSchema.set('toJSON', { virtuals: true });
eventSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Event', eventSchema);
