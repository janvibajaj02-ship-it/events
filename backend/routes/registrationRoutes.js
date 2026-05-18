const express = require('express');
const { 
  registerForEvent, 
  getMyRegistrations, 
  getEventRegistrations, 
  approveRegistration, 
  rejectRegistration,
  deleteRegistration,
  cancelRegistration,
  getAllRegistrations,
  getStats,
  getRegistrationTrends,
  generateCertificate,
  checkCertificateEligibility,
  scanAttendance
} = require('../controllers/registrationController');
const { auth, authorize } = require('../middleware/auth');
const router = express.Router();

router.post('/', auth, authorize('student', 'organizer'), registerForEvent);
router.get('/my', auth, getMyRegistrations);
router.get('/stats', auth, authorize('admin'), getStats);
router.get('/trends', auth, authorize('admin'), getRegistrationTrends);
router.get('/certificate/check/:eventId', auth, checkCertificateEligibility);
router.get('/certificate/:eventId', auth, generateCertificate);
router.get('/all', auth, authorize('admin'), getAllRegistrations);
router.get('/event/:eventId', auth, authorize('organizer', 'admin'), getEventRegistrations);
router.post('/scan-attendance', auth, authorize('organizer', 'admin'), scanAttendance);
router.put('/approve/:id', auth, authorize('organizer', 'admin'), approveRegistration);
router.put('/reject/:id', auth, authorize('organizer', 'admin'), rejectRegistration);
router.delete('/:id', auth, authorize('organizer', 'admin'), deleteRegistration);
router.delete('/cancel-my/:id', auth, cancelRegistration);

module.exports = router;
