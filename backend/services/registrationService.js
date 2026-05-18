// Registration Service Layer - Business Logic

const Registration = require('../models/Registration');
const Event = require('../models/Event');
const User = require('../models/User');
const { NotFoundError, ConflictError } = require('../utils/errors');

const registrationService = {
  // Register user for event
  async registerForEvent(eventId, userId) {
    const event = await Event.findById(eventId);
    if (!event) {
      throw new NotFoundError('Event');
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User');
    }

    // Check if already registered
    const existingRegistration = await Registration.findOne({ eventId, userId });
    if (existingRegistration) {
      throw new ConflictError('You are already registered for this event');
    }

    // Check available seats
    const registrationCount = await Registration.countDocuments({
      eventId,
      status: { $in: ['registered', 'attended'] }
    });

    if (registrationCount >= event.maxSeats) {
      throw new ConflictError('Event is full');
    }

    const registration = await Registration.create({
      eventId,
      userId,
      status: 'registered',
      registeredAt: new Date()
    });

    return await registration.populate('eventId').populate('userId', 'name email');
  },

  // Get user registrations
  async getUserRegistrations(userId, filters = {}) {
    const query = { userId };

    if (filters.status) {
      query.status = filters.status;
    }

    const registrations = await Registration.find(query)
      .populate({
        path: 'eventId',
        select: 'title date startTime venue image category'
      })
      .populate('userId', 'name email')
      .sort({ registeredAt: -1 });

    return registrations;
  },

  // Get event registrations
  async getEventRegistrations(eventId, filters = {}) {
    const event = await Event.findById(eventId);
    if (!event) {
      throw new NotFoundError('Event');
    }

    const query = { eventId };

    if (filters.status) {
      query.status = filters.status;
    }

    const registrations = await Registration.find(query)
      .populate('userId', 'name email rollNo department phone')
      .sort({ registeredAt: -1 });

    return registrations;
  },

  // Cancel registration
  async cancelRegistration(registrationId, userId) {
    const registration = await Registration.findById(registrationId);
    if (!registration) {
      throw new NotFoundError('Registration');
    }

    if (registration.userId.toString() !== userId) {
      throw new Error('Unauthorized');
    }

    await Registration.findByIdAndDelete(registrationId);
    return { message: 'Registration cancelled successfully' };
  },

  // Mark attendance
  async markAttendance(eventId, userId, qrCode = null) {
    const registration = await Registration.findOne({ eventId, userId });
    if (!registration) {
      throw new NotFoundError('Registration');
    }

    registration.status = 'attended';
    registration.attendedAt = new Date();
    registration.qrCode = qrCode;

    await registration.save();
    return registration;
  },

  // Get attendance for event
  async getEventAttendance(eventId) {
    const event = await Event.findById(eventId);
    if (!event) {
      throw new NotFoundError('Event');
    }

    const attendance = await Registration.find({
      eventId,
      status: 'attended'
    }).populate('userId', 'name rollNo email');

    return attendance;
  }
};

module.exports = registrationService;
