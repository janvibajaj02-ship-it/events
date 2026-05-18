const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  department: { type: String, required: true },
  course: { type: String, required: true },
  contactNo: { type: String, required: true },
  group: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  qrCode: { type: String },
  attended: { type: Boolean, default: false },
  attendedAt: { type: Date, default: null },
  attendanceNotifiedAt: { type: Date, default: null },
  hasAppliedForDL: { type: Boolean, default: false },
}, { timestamps: true });

registrationSchema.index({ userId: 1, eventId: 1 }, { unique: true });

module.exports = mongoose.model('Registration', registrationSchema);
