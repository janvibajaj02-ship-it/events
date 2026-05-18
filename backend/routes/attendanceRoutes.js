const express = require('express');
const router = express.Router();
const { 
    markAttendanceByScan, 
    markAttendanceByCode, 
    generateEventCode 
} = require('../controllers/attendanceController');
const { auth, admin, organizer } = require('../middleware/auth');

router.post('/scan', auth, markAttendanceByScan);
router.post('/code', auth, markAttendanceByCode);
router.post('/generate-code', auth, generateEventCode);

module.exports = router;
