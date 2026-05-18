const Registration = require('../models/Registration');
const Event = require('../models/Event');
const QRCode = require('qrcode');
const PDFDocument = require('pdfkit');
const { sendAttendanceNotificationEmail } = require('../utils/mailer');
const { createNotification } = require('./notificationController');

const parseQrPayload = (qrData) => {
  if (!qrData || typeof qrData !== 'string') {
    return {};
  }

  try {
    return JSON.parse(qrData);
  } catch (error) {
    return { registrationId: qrData.trim() };
  }
};

const isAttendanceAllowed = (event) => {
  const now = new Date();
  const eventDate = new Date(event.date);
  
  const parseTime = (timeStr, baseDate) => {
    if (!timeStr) return null;
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':');
    if (hours === '12') hours = '00';
    if (modifier === 'PM') hours = parseInt(hours, 10) + 12;
    
    const date = new Date(baseDate);
    date.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
    return date;
  };

  const startTime = parseTime(event.startTime, eventDate);
  const endTime = parseTime(event.endTime, event.endDate ? new Date(event.endDate) : eventDate);

  if (startTime && now < startTime) {
    return { allowed: false, message: `Attendance starts at ${event.startTime}` };
  }
  if (endTime && now > endTime) {
    return { allowed: false, message: `Attendance closed at ${event.endTime}` };
  }

  return { allowed: true };
};

const buildCertificateEligibility = (registration) => {
  if (!registration) {
    return { eligible: false, reason: 'Not registered' };
  }

  if (registration.status !== 'approved') {
    return { eligible: false, reason: 'Registration not approved' };
  }

  if (!registration.eventId) {
    return { eligible: false, reason: 'Event no longer exists' };
  }

  if (registration.eventId.status !== 'completed') {
    return { eligible: false, reason: 'Event not yet completed' };
  }

  if (!registration.attended) {
    return { eligible: false, reason: 'Attendance not marked' };
  }

  return { eligible: true, reason: 'Ready to download' };
};

// ============ CERTIFICATE GENERATION ============
exports.generateCertificate = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user._id;

    // Find registration
    const registration = await Registration.findOne({ 
      userId, 
      eventId 
    }).populate('eventId userId');

    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    const certificateStatus = buildCertificateEligibility(registration);
    if (!certificateStatus.eligible) {
      return res.status(400).json({ message: certificateStatus.reason });
    }

    // Generate PDF Certificate
    const doc = new PDFDocument({
      size: [800, 600],
      margin: 50
    });

    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Certificate_${registration.userId.name}_${registration.eventId.title}.pdf"`);

    doc.pipe(res);

    // Certificate border
    doc.rect(25, 25, 750, 550).stroke();
    doc.rect(35, 35, 730, 530).stroke();

    // Header
    doc.fontSize(48).font('Helvetica-Bold').text('CERTIFICATE', 50, 80, {
      align: 'center'
    });

    // Subtitle
    doc.fontSize(16).font('Helvetica').text('OF PARTICIPATION', 50, 140, {
      align: 'center'
    });

    // Main text
    doc.fontSize(12).font('Helvetica').text('This certifies that', 50, 200, { align: 'center' });
    
    doc.fontSize(28).font('Helvetica-Bold').text(registration.userId.name, 50, 240, {
      align: 'center'
    });

    doc.fontSize(12).font('Helvetica').text('has successfully participated in', 50, 290, { align: 'center' });

    doc.fontSize(20).font('Helvetica-Bold').text(registration.eventId.title, 50, 330, {
      align: 'center'
    });

    doc.fontSize(12).font('Helvetica').text(`Event held on ${new Date(registration.eventId.date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })}`, 50, 380, {
      align: 'center'
    });

    doc.fontSize(12).font('Helvetica').text(`Venue: ${registration.eventId.venue}`, 50, 410, {
      align: 'center'
    });

    // Footer with verification details
    doc.fontSize(10).font('Helvetica').text(`Certificate ID: ${registration._id.toString().slice(-12).toUpperCase()}`, 50, 480);
    doc.fontSize(10).font('Helvetica').text(`Issued on: ${new Date().toLocaleDateString()}`, 50, 500);

    doc.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============ CHECK CERTIFICATE ELIGIBILITY ============
exports.checkCertificateEligibility = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user._id;

    const registration = await Registration.findOne({ userId, eventId }).populate('eventId');
    res.json(buildCertificateEligibility(registration));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.registerForEvent = async (req, res) => {
  try {
    const { eventId, name, email, department, course, contactNo, group } = req.body;
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.status !== 'approved') return res.status(400).json({ message: 'Event not approved' });
    if (event.isFull) return res.status(400).json({ message: 'Event Full' });

    // Check registration deadline
    if (event.registrationDeadline && new Date() > new Date(event.registrationDeadline)) {
      return res.status(400).json({ message: 'Registration Closed' });
    }

    const alreadyRegistered = await Registration.findOne({ userId: req.user._id, eventId });
    if (alreadyRegistered) return res.status(400).json({ message: 'Already registered' });

    // Auto-approve and generate QR immediately — no manual approval step needed
    const registration = await Registration.create({
      userId: req.user._id,
      eventId,
      name,
      email,
      department,
      course,
      contactNo,
      group,
      status: 'approved'
    });

    // Increment seat count
    await Event.findByIdAndUpdate(eventId, { $inc: { registeredCount: 1 } });

    // Generate QR code with userId + eventId (matches scanner format)
    const qrPayload = JSON.stringify({
      userId: req.user._id,
      eventId: eventId
    });
    const qrCode = await QRCode.toDataURL(qrPayload);
    registration.qrCode = qrCode;
    await registration.save();

    // Notify Student
    await createNotification(req.user._id, `You have successfully registered for "${event.title}"`, 'registration', 'normal', eventId);

    // Notify Organizer
    await createNotification(event.createdBy, `New registration for your event: ${event.title}`, 'registration', 'normal', eventId);

    res.status(201).json(registration);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Already registered' });
    }
    res.status(500).json({ message: error.message });
  }
};

exports.deleteRegistration = async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id).populate('eventId');
    if (!registration) return res.status(404).json({ message: 'Registration not found' });

    // Check authorization (Admin or Event Creator)
    if (registration.eventId.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this registration' });
    }

    await Registration.findByIdAndDelete(req.params.id);
    
    if (registration.status === 'approved') {
      await Event.findByIdAndUpdate(registration.eventId._id, { $inc: { registeredCount: -1 } });
    }

    res.json({ message: 'Registration deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.cancelRegistration = async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id).populate('eventId');
    if (!registration) return res.status(404).json({ message: 'Registration not found' });

    // Check ownership - only the student who registered can cancel
    if (registration.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to cancel this registration' });
    }

    // Decrement seat count if it was approved
    if (registration.status === 'approved') {
      await Event.findByIdAndUpdate(registration.eventId._id, { $inc: { registeredCount: -1 } });
    }

    await Registration.findByIdAndDelete(req.params.id);
    res.json({ message: 'Registration cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMyRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find({ userId: req.user._id }).populate('eventId');
    res.json(registrations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getEventRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find({ eventId: req.params.eventId }).populate('userId', 'name email phone rollNo department');
    res.json(registrations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find().populate('eventId', 'title').sort({ createdAt: -1 }).limit(10);
    res.json(registrations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.approveRegistration = async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id).populate('userId eventId');
    if (!registration) return res.status(404).json({ message: 'Registration not found' });

    // Check if the user is the creator of the event OR an admin
    if (registration.eventId.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to approve this registration' });
    }

    if (registration.eventId.status !== 'approved') {
      return res.status(400).json({ message: 'Only approved events can accept registrations' });
    }

    if (registration.status === 'approved') {
      return res.status(400).json({ message: 'Registration already approved' });
    }

    // Check if event has seats (but do NOT increment — count was already incremented on registration creation)
    const event = await Event.findById(registration.eventId._id);
    if (!event || event.registeredCount >= event.maxSeats) {
      return res.status(400).json({ message: 'Event Full' });
    }

    // Generate QR Code with stable format for scanner
    const qrData = JSON.stringify({
      userId: registration.userId._id,
      eventId: registration.eventId._id
    });
    const qrCode = await QRCode.toDataURL(qrData);

    registration.status = 'approved';
    registration.qrCode = qrCode;
    await registration.save();

    res.json(registration);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.rejectRegistration = async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id).populate('eventId');
    if (!registration) return res.status(404).json({ message: 'Registration not found' });

    // Check if the user is the creator of the event OR an admin
    if (registration.eventId.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to reject this registration' });
    }

    if (registration.status === 'approved') {
      await Event.findByIdAndUpdate(registration.eventId._id, { $inc: { registeredCount: -1 } });
    }

    registration.status = 'rejected';
    registration.qrCode = undefined;
    await registration.save();
    res.json(registration);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.scanAttendance = async (req, res) => {
  try {
    const { qrData, registrationId, eventId } = req.body;
    const parsedPayload = parseQrPayload(qrData);

    // Support both old format (registrationId) and new format (userId + eventId)
    let registration = null;

    if (registrationId || parsedPayload.registrationId) {
      // Legacy: QR contains registrationId directly
      const targetId = registrationId || parsedPayload.registrationId;
      registration = await Registration.findById(targetId)
        .populate('userId', 'name email')
        .populate({ path: 'eventId', populate: { path: 'createdBy', select: 'name email' } });

    } else if (parsedPayload.userId && parsedPayload.eventId) {
      // Current format: QR contains userId + eventId
      registration = await Registration.findOne({
        userId: parsedPayload.userId,
        eventId: parsedPayload.eventId
      })
        .populate('userId', 'name email')
        .populate({ path: 'eventId', populate: { path: 'createdBy', select: 'name email' } });

    } else {
      return res.status(400).json({ message: 'Invalid QR code format' });
    }

    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    // If an eventId was passed in the request body, verify the QR belongs to it
    if (eventId && registration.eventId._id.toString() !== eventId) {
      return res.status(400).json({ message: 'This QR does not belong to the selected event' });
    }

    const timeCheck = isAttendanceAllowed(registration.eventId);
    if (!timeCheck.allowed) {
      return res.status(400).json({ message: timeCheck.message });
    }

    const eventOwnerId = registration.eventId.createdBy?._id?.toString();
    if (req.user.role !== 'admin' && eventOwnerId !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to scan attendance for this event' });
    }

    if (registration.attended) {
      return res.json({
        message: `Attendance already recorded for ${registration.name}`,
        registration,
        emailSent: Boolean(registration.attendanceNotifiedAt),
      });
    }

    registration.attended = true;
    registration.attendedAt = new Date();

    let emailSent = false;
    try {
      const emailResult = await sendAttendanceNotificationEmail({
        organizerEmail: registration.eventId.createdBy?.email,
        organizerName: registration.eventId.createdBy?.name,
        eventTitle: registration.eventId.title,
        studentName: registration.name,
        studentEmail: registration.email,
        attendedAt: registration.attendedAt,
      });
      emailSent = emailResult.sent;
      if (emailSent) registration.attendanceNotifiedAt = new Date();
    } catch (error) {
      console.error('Attendance email failed:', error.message);
    }

    await registration.save();

    res.json({
      message: emailSent
        ? `Attendance marked for ${registration.name} — organizer notified`
        : `Attendance marked for ${registration.name}`,
      registration,
      emailSent,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const User = require('../models/User');
    const Event = require('../models/Event');
    
    const totalUsers = await User.countDocuments();
    const totalEvents = await Event.countDocuments({ status: 'approved' });
    const totalRegistrations = await Registration.countDocuments();

    res.json({
      users: totalUsers,
      events: totalEvents,
      registrations: totalRegistrations
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getRegistrationTrends = async (req, res) => {
  try {
    const registrations = await Registration.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const trends = registrations.map(reg => ({
      name: monthNames[reg._id.month - 1],
      registrations: reg.count
    }));

    res.json(trends);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
