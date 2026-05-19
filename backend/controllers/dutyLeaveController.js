const DutyLeave = require('../models/DutyLeave');
const Registration = require('../models/Registration');
const Event = require('../models/Event');

exports.applyForDL = async (req, res) => {
  try {
    const { registrationId, rollNo, reason } = req.body || {};

    const registration = await Registration.findById(registrationId).populate('eventId');
    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    if (registration.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (!registration.attended) {
      return res.status(400).json({ message: 'Duty Leave can only be applied after attending the event' });
    }

    if (registration.hasAppliedForDL) {
      return res.status(400).json({ message: 'Duty Leave already applied for this registration' });
    }

    const dl = await DutyLeave.create({
      registrationId,
      userId: req.user._id,
      eventId: registration.eventId._id,
      rollNo,
      reason
    });

    registration.hasAppliedForDL = true;
    await registration.save();

    res.status(201).json(dl);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMyDLs = async (req, res) => {
  try {
    const dls = await DutyLeave.find({ userId: req.user._id }).populate('eventId');
    res.json(dls);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getOrganizerRequests = async (req, res) => {
  try {
    let query = { status: 'pending' };
    
    if (req.user.role !== 'admin') {
      // Find events created by this organizer
      const myEvents = await Event.find({ createdBy: req.user._id });
      const eventIds = myEvents.map(e => e._id);
      query.eventId = { $in: eventIds };
    }
    
    const requests = await DutyLeave.find(query)
      .populate('userId', 'name email rollNo')
      .populate('eventId', 'title date startTime endTime')
      .sort({ createdAt: -1 });
    
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateDLStatus = async (req, res) => {
  try {
    const { status } = req.body || {};
    const dl = await DutyLeave.findById(req.params.id).populate('eventId');

    if (!dl) {
      return res.status(404).json({ message: 'DL application not found' });
    }

    // Authorization: Only event creator or admin
    if (dl.eventId.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    dl.status = status;
    if (status === 'approved') {
      dl.approvedAt = new Date();
      dl.approvedBy = req.user._id;
    }
    
    await dl.save();
    res.json(dl);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAdminLogs = async (req, res) => {
  try {
    const registrations = await Registration.find()
      .populate('userId', 'name email rollNo')
      .populate('eventId', 'title date venue')
      .sort({ createdAt: -1 });

    const dls = await DutyLeave.find()
      .populate('userId', 'name email')
      .populate('eventId', 'title')
      .sort({ createdAt: -1 });

    res.json({
      registrations,
      dutyLeaves: dls
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/duty-leave/admin/all-dls  - Full DL dashboard for admin
exports.getAdminAllDLs = async (req, res) => {
  try {
    const dls = await DutyLeave.find()
      .populate('userId', 'name email')
      .populate('eventId', 'title date startTime endTime venue createdBy')
      .populate('approvedBy', 'name')
      .sort({ createdAt: -1 });

    res.json(dls);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
