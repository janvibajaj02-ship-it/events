// Event Service Layer - Business Logic

const Event = require('../models/Event');
const User = require('../models/User');
const Registration = require('../models/Registration');
const { NotFoundError, AuthorizationError } = require('../utils/errors');
const { validateCreateEvent, validateUpdateEvent } = require('../validators/eventValidator');

const eventService = {
  // Create new event
  async createEvent(eventData, userId) {
    validateCreateEvent(eventData);

    const event = await Event.create({
      ...eventData,
      createdBy: userId,
      status: 'pending'
    });

    return await event.populate('createdBy', 'name email');
  },

  // Get all approved events
  async getApprovedEvents(filters = {}) {
    const query = { status: 'approved' };

    if (filters.category) {
      query.category = filters.category;
    }

    if (filters.search) {
      query.$or = [
        { title: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } }
      ];
    }

    const events = await Event.find(query)
      .populate('createdBy', 'name')
      .sort({ date: 1 });

    return events;
  },

  // Get pending events (admin only)
  async getPendingEvents() {
    const events = await Event.find({ status: 'pending' })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    return events;
  },

  // Get organizer's events
  async getOrganizerEvents(userId) {
    const events = await Event.find({ createdBy: userId })
      .sort({ date: -1 });

    return events;
  },

  // Get single event by ID
  async getEventById(eventId) {
    const event = await Event.findById(eventId)
      .populate('createdBy', 'name email phone');

    if (!event) {
      throw new NotFoundError('Event');
    }

    return event;
  },

  // Approve event
  async approveEvent(eventId) {
    const event = await Event.findByIdAndUpdate(
      eventId,
      { status: 'approved' },
      { new: true }
    );

    if (!event) {
      throw new NotFoundError('Event');
    }

    return event;
  },

  // Reject event
  async rejectEvent(eventId, reason = '') {
    const event = await Event.findByIdAndUpdate(
      eventId,
      { status: 'rejected', rejectionReason: reason },
      { new: true }
    );

    if (!event) {
      throw new NotFoundError('Event');
    }

    return event;
  },

  // Update event (organizer only)
  async updateEvent(eventId, updateData, userId) {
    validateUpdateEvent(updateData);

    const event = await Event.findById(eventId);
    if (!event) {
      throw new NotFoundError('Event');
    }

    if (event.createdBy.toString() !== userId) {
      throw new AuthorizationError('You can only update your own events');
    }

    const allowedFields = ['title', 'description', 'date', 'endDate', 'startTime', 'endTime', 'venue', 'category', 'maxSeats', 'registrationDeadline'];
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        event[field] = updateData[field];
      }
    });

    await event.save();
    return event;
  },

  // Delete event (organizer only)
  async deleteEvent(eventId, userId) {
    const event = await Event.findById(eventId);
    if (!event) {
      throw new NotFoundError('Event');
    }

    if (event.createdBy.toString() !== userId) {
      throw new AuthorizationError('You can only delete your own events');
    }

    await Event.findByIdAndDelete(eventId);
    return { message: 'Event deleted successfully' };
  },

  // Complete event
  async completeEvent(eventId) {
    const event = await Event.findByIdAndUpdate(
      eventId,
      { status: 'completed', endedAt: new Date() },
      { new: true }
    );

    if (!event) {
      throw new NotFoundError('Event');
    }

    return event;
  },

  // Get available seats for event
  async getEventSeats(eventId) {
    const event = await Event.findById(eventId);
    if (!event) {
      throw new NotFoundError('Event');
    }

    const registrationCount = await Registration.countDocuments({
      eventId,
      status: { $in: ['registered', 'attended'] }
    });

    return {
      total: event.maxSeats,
      registered: registrationCount,
      available: event.maxSeats - registrationCount
    };
  },

  // Get organizer statistics
  async getOrganizerStats(userId) {
    const events = await Event.find({ createdBy: userId });
    const eventIds = events.map(e => e._id);

    const totalRegistrations = await Registration.countDocuments({
      eventId: { $in: eventIds },
      status: { $in: ['registered', 'attended'] }
    });

    const totalAttendance = await Registration.countDocuments({
      eventId: { $in: eventIds },
      status: 'attended'
    });

    const approvedEvents = events.filter(e => e.status === 'approved').length;
    const pendingEvents = events.filter(e => e.status === 'pending').length;

    return {
      totalEvents: events.length,
      approvedEvents,
      pendingEvents,
      totalRegistrations,
      totalAttendance
    };
  }
};

module.exports = eventService;
