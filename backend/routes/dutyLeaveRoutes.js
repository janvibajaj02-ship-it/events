const express = require('express');
const router = express.Router();
const { 
  applyForDL, 
  getMyDLs, 
  getOrganizerRequests, 
  updateDLStatus, 
  getAdminLogs,
  getAdminAllDLs
} = require('../controllers/dutyLeaveController');
const { auth, authorize } = require('../middleware/auth');

router.use(auth);

router.post('/apply', applyForDL);
router.get('/my', getMyDLs);

router.get('/organizer/requests', authorize('organizer', 'admin'), getOrganizerRequests);
router.put('/status/:id', authorize('organizer', 'admin'), updateDLStatus);

router.get('/admin/logs', authorize('admin'), getAdminLogs);
router.get('/admin/all-dls', authorize('admin'), getAdminAllDLs);

module.exports = router;
