// Duty Leave Service Layer - Business Logic

const DutyLeave = require('../models/DutyLeave');
const Registration = require('../models/Registration');
const Event = require('../models/Event');
const User = require('../models/User');
const { NotFoundError, ConflictError } = require('../utils/errors');

const dutyLeaveService = {
  // Create duty leave request
  async requestDutyLeave(registrationId, userId) {
    const registration = await Registration.findById(registrationId)
      .populate('eventId')
      .populate('userId');

    if (!registration) {
      throw new NotFoundError('Registration');
    }

    if (registration.userId._id.toString() !== userId) {
      throw new Error('Unauthorized');
    }

    if (registration.status !== 'attended') {
      throw new ConflictError('Can only request duty leave for attended events');
    }

    // Check if already requested
    const existingRequest = await DutyLeave.findOne({ registrationId });
    if (existingRequest) {
      throw new ConflictError('Duty leave already requested for this event');
    }

    const dutyLeave = await DutyLeave.create({
      registrationId,
      userId,
      eventId: registration.eventId._id,
      event: registration.eventId,
      status: 'pending',
      requestedAt: new Date()
    });

    return await dutyLeave.populate('userId', 'name rollNo email')
      .populate('eventId', 'title date');
  },

  // Get user duty leave requests
  async getUserDutyLeaves(userId) {
    const dutyLeaves = await DutyLeave.find({ userId })
      .populate('userId', 'name rollNo email department')
      .populate('eventId', 'title date venue')
      .populate('registrationId')
      .sort({ requestedAt: -1 });

    return dutyLeaves;
  },

  // Get all pending duty leaves (admin)
  async getPendingDutyLeaves() {
    const dutyLeaves = await DutyLeave.find({ status: 'pending' })
      .populate('userId', 'name rollNo email department')
      .populate('eventId', 'title date venue')
      .sort({ requestedAt: -1 });

    return dutyLeaves;
  },

  // Approve duty leave
  async approveDutyLeave(dutyLeaveId, adminNotes = '') {
    const dutyLeave = await DutyLeave.findByIdAndUpdate(
      dutyLeaveId,
      {
        status: 'approved',
        approvedAt: new Date(),
        adminNotes
      },
      { new: true }
    ).populate('userId', 'name email');

    if (!dutyLeave) {
      throw new NotFoundError('Duty Leave');
    }

    return dutyLeave;
  },

  // Reject duty leave
  async rejectDutyLeave(dutyLeaveId, rejectionReason = '') {
    const dutyLeave = await DutyLeave.findByIdAndUpdate(
      dutyLeaveId,
      {
        status: 'rejected',
        rejectionReason
      },
      { new: true }
    ).populate('userId', 'name email');

    if (!dutyLeave) {
      throw new NotFoundError('Duty Leave');
    }

    return dutyLeave;
  },

  // Get duty leaves by event
  async getDutyLeavesByEvent(eventId) {
    const dutyLeaves = await DutyLeave.find({ eventId })
      .populate('userId', 'name rollNo email department')
      .sort({ requestedAt: -1 });

    return dutyLeaves;
  },

  // Get duty leaves statistics
  async getDutyLeavesStats() {
    const total = await DutyLeave.countDocuments();
    const approved = await DutyLeave.countDocuments({ status: 'approved' });
    const pending = await DutyLeave.countDocuments({ status: 'pending' });
    const rejected = await DutyLeave.countDocuments({ status: 'rejected' });

    return {
      total,
      approved,
      pending,
      rejected
    };
  }
};

module.exports = dutyLeaveService;
