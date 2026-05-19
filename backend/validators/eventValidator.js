// Event Validators

const { ValidationError } = require('../utils/errors');

const validateCreateEvent = (data) => {
  const { title, description, date, endDate, startTime, endTime, venue, category, maxSeats, registrationDeadline } = data;

  if (!title || title.trim() === '') {
    throw new ValidationError('Event title is required');
  }

  if (!description || description.trim() === '') {
    throw new ValidationError('Event description is required');
  }

  if (!date) {
    throw new ValidationError('Event start date is required');
  }

  if (endDate && new Date(date) > new Date(endDate)) {
    throw new ValidationError('End date must be after start date');
  }

  if (!venue || venue.trim() === '') {
    throw new ValidationError('Venue is required');
  }

  if (!category || category.trim() === '') {
    throw new ValidationError('Category is required');
  }

  const parsedMaxSeats = Number(maxSeats);
  if (!Number.isInteger(parsedMaxSeats) || parsedMaxSeats < 1) {
    throw new ValidationError('Max seats must be a positive whole number');
  }

  let eventStartDateTime = new Date(date);
  if (startTime) {
    const timeMatch = startTime.match(/^(\d+)[:.](\d+)\s*(AM|PM)?$/i);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1], 10);
      const minutes = parseInt(timeMatch[2], 10);
      const modifier = timeMatch[3];
      if (modifier) {
        if (modifier.toUpperCase() === 'PM' && hours < 12) hours += 12;
        if (modifier.toUpperCase() === 'AM' && hours === 12) hours = 0;
      }
      eventStartDateTime.setHours(hours, minutes, 0, 0);
    } else {
      const parts = startTime.split(/[:.]/);
      if (parts.length >= 2) {
        eventStartDateTime.setHours(parseInt(parts[0], 10), parseInt(parts[1], 10), 0, 0);
      }
    }
  } else {
    // If no start time is specified, default to end of event start day
    eventStartDateTime.setHours(23, 59, 59, 999);
  }

  if (registrationDeadline && new Date(registrationDeadline) > eventStartDateTime) {
    throw new ValidationError('Registration deadline must be before the event starts');
  }

  return true;
};

const validateUpdateEvent = (data) => {
  // Same as create, but all fields optional
  const allowedFields = ['title', 'description', 'date', 'endDate', 'startTime', 'endTime', 'venue', 'category', 'maxSeats', 'registrationDeadline'];
  const providedFields = Object.keys(data).filter(key => allowedFields.includes(key));

  if (providedFields.length === 0) {
    throw new ValidationError('No valid fields to update');
  }

  if (data.maxSeats) {
    const parsedMaxSeats = Number(data.maxSeats);
    if (!Number.isInteger(parsedMaxSeats) || parsedMaxSeats < 1) {
      throw new ValidationError('Max seats must be a positive whole number');
    }
  }

  return true;
};

module.exports = {
  validateCreateEvent,
  validateUpdateEvent
};
