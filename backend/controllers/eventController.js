const eventService = require('../services/eventService');
const notificationService = require('../services/notificationService');
const User = require('../models/User');
const { ValidationError, AuthorizationError } = require('../utils/errors');

// Controller: Handles HTTP requests and delegates to service layer

exports.createEvent = async (req, res, next) => {
  try {
    const { title, description, date, endDate, startTime, endTime, venue, category, maxSeats, registrationDeadline } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : '';

    const event = await eventService.createEvent(
      {
        title,
        description,
        date,
        endDate,
        startTime,
        endTime,
        venue,
        category,
        image,
        maxSeats,
        registrationDeadline
      },
      req.user._id
    );

    // Notify admins
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await notificationService.createNotification(
        admin._id,
        `New event request: ${title}`,
        'system',
        'normal',
        event._id
      );
    }

    res.status(201).json({ success: true, event });
  } catch (error) {
    next(error);
  }
};

exports.getApprovedEvents = async (req, res, next) => {
  try {
    const filters = {
      category: req.query.category,
      search: req.query.search
    };

    const events = await eventService.getApprovedEvents(filters);
    res.json({ success: true, events });
  } catch (error) {
    next(error);
  }
};

exports.getPendingEvents = async (req, res, next) => {
  try {
    const events = await eventService.getPendingEvents();
    res.json({ success: true, events });
  } catch (error) {
    next(error);
  }
};

exports.approveEvent = async (req, res, next) => {
  try {
    const event = await eventService.approveEvent(req.params.id);

    // Notify organizer
    await notificationService.createNotification(
      event.createdBy,
      `Your event "${event.title}" has been approved!`,
      'event',
      'urgent',
      event._id
    );

    // Notify all students
    const students = await User.find({ role: 'student' });
    for (const student of students) {
      await notificationService.createNotification(
        student._id,
        `New event added: ${event.title}`,
        'event',
        'normal',
        event._id
      );
    }

    res.json({ success: true, event });
  } catch (error) {
    next(error);
  }
};

exports.rejectEvent = async (req, res, next) => {
  try {
    const { reason } = req.body || {};
    const event = await eventService.rejectEvent(req.params.id, reason);

    // Notify organizer
    await notificationService.createNotification(
      event.createdBy,
      `Your event "${event.title}" was rejected.`,
      'system',
      'urgent',
      event._id
    );

    res.json({ success: true, event });
  } catch (error) {
    next(error);
  }
};

exports.getOrganizerEvents = async (req, res, next) => {
  try {
    let events;
    if (req.user.role === 'admin') {
      // Admins can see all events
      events = await eventService.getApprovedEvents({});
    } else {
      events = await eventService.getOrganizerEvents(req.user._id);
    }

    res.json({ success: true, events });
  } catch (error) {
    next(error);
  }
};

exports.getEventById = async (req, res, next) => {
  try {
    const event = await eventService.getEventById(req.params.id);
    res.json({ success: true, event });
  } catch (error) {
    next(error);
  }
};

exports.completeEvent = async (req, res, next) => {
  try {
    const event = await eventService.getEventById(req.params.id);

    if (event.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      throw new AuthorizationError('Not authorized to complete this event');
    }

    const completedEvent = await eventService.completeEvent(req.params.id);

    res.json({ success: true, message: 'Event marked as completed', event: completedEvent });
  } catch (error) {
    next(error);
  }
};

exports.getEventSeats = async (req, res, next) => {
  try {
    const seats = await eventService.getEventSeats(req.params.id);
    res.json({ success: true, seats });
  } catch (error) {
    next(error);
  }
};

exports.getOrganizerStats = async (req, res, next) => {
  try {
    const stats = await eventService.getOrganizerStats(req.user._id);
    res.json({ success: true, stats });
  } catch (error) {
    next(error);
  }
};
