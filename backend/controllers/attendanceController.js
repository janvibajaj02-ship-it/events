const Registration = require('../models/Registration');
const Event = require('../models/Event');

// @desc    Mark attendance via QR Scan
// @route   POST /api/attendance/scan
// @access  Organizer/Admin

const isAttendanceAllowed = (event) => {
    const now = new Date();
    const eventDate = new Date(event.date);
    
    // Helper to parse "10:00 AM" or "05:00 PM"
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

exports.markAttendanceByScan = async (req, res) => {
    try {
        const { userId, eventId } = req.body;

        // 1. Find registration
        const registration = await Registration.findOne({ userId, eventId });
        if (!registration) {
            return res.status(404).json({ message: 'Registration not found for this user/event.' });
        }

        // 2. Check if event is active for attendance
        const event = await Event.findById(eventId);
        if (!event) return res.status(404).json({ message: 'Event not found.' });

        const timeCheck = isAttendanceAllowed(event);
        if (!timeCheck.allowed) {
            return res.status(400).json({ message: timeCheck.message });
        }

        // 3. Check if already marked
        if (registration.attended) {
            return res.status(400).json({ message: 'Attendance already marked.' });
        }

        // 4. Validate registration status
        if (registration.status !== 'approved') {
            return res.status(400).json({ message: 'Only approved registrations can be marked present.' });
        }

        // 3. Mark as attended
        registration.attended = true;
        registration.attendedAt = new Date();
        await registration.save();

        res.status(200).json({ 
            message: 'Attendance marked successfully!', 
            studentName: registration.name 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mark attendance via Event Code
// @route   POST /api/attendance/code
// @access  Student
exports.markAttendanceByCode = async (req, res) => {
    try {
        const { eventId, code } = req.body;
        const userId = req.user.id;

        // 1. Find Event and validate code
        const event = await Event.findById(eventId);
        if (!event) return res.status(404).json({ message: 'Event not found.' });

        if (!event.attendanceCode || event.attendanceCode !== code) {
            return res.status(400).json({ message: 'Invalid or expired attendance code.' });
        }

        // 2. Check if event is active for attendance
        const timeCheck = isAttendanceAllowed(event);
        if (!timeCheck.allowed) {
            return res.status(400).json({ message: timeCheck.message });
        }

        // 3. Find registration
        const registration = await Registration.findOne({ userId, eventId });
        if (!registration) {
            return res.status(404).json({ message: 'You are not registered for this event.' });
        }

        // 4. Validate registration status
        if (registration.status !== 'approved') {
            return res.status(400).json({ message: 'Your registration must be approved to mark attendance.' });
        }

        // 5. Check if already marked
        if (registration.attended) {
            return res.status(400).json({ message: 'Attendance already marked.' });
        }

        // 4. Mark as attended
        registration.attended = true;
        registration.attendedAt = new Date();
        await registration.save();

        res.status(200).json({ message: 'Attendance marked successfully!' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Generate/Update Event Code
// @route   POST /api/attendance/generate-code
// @access  Organizer/Admin
exports.generateEventCode = async (req, res) => {
    try {
        const { eventId } = req.body;
        const event = await Event.findById(eventId);

        if (!event) return res.status(404).json({ message: 'Event not found.' });

        // Generate 5-digit code
        const code = Math.floor(10000 + Math.random() * 90000).toString();
        event.attendanceCode = code;
        await event.save();

        res.status(200).json({ code });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
