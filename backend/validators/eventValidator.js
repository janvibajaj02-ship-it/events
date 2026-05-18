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

  if (!endDate) {
    throw new ValidationError('Event end date is required');
  }

  if (new Date(date) > new Date(endDate)) {
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

  if (registrationDeadline && new Date(registrationDeadline) > new Date(date)) {
    throw new ValidationError('Registration deadline must be before event start date');
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
