const express = require('express');
const multer = require('multer');
const path = require('path');
const { 
  createEvent, 
  getApprovedEvents, 
  getPendingEvents, 
  approveEvent, 
  rejectEvent,
  getOrganizerEvents,
  completeEvent,
  getEventSeats,
  getEventById,
  getOrganizerStats
} = require('../controllers/eventController');
const { auth, authorize } = require('../middleware/auth');
const router = express.Router();

// Multer Config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads/')),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

router.post('/', auth, authorize('organizer', 'admin'), upload.single('image'), createEvent);
router.get('/', getApprovedEvents);
router.get('/pending', auth, authorize('admin'), getPendingEvents);
router.get('/organizer', auth, authorize('organizer', 'admin'), getOrganizerEvents);
router.get('/seats/:id', getEventSeats);
router.get('/organizer-stats', auth, authorize('admin'), getOrganizerStats);
router.get('/:id', getEventById);
router.put('/approve/:id', auth, authorize('admin'), approveEvent);
router.put('/reject/:id', auth, authorize('admin'), rejectEvent);
router.put('/complete/:id', auth, authorize('organizer', 'admin'), completeEvent);

module.exports = router;
