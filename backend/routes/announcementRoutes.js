const express = require('express');
const router = express.Router();
const Announcement = require('../models/Announcement');

// Get active, high-priority announcements for the banner
router.get('/', async (req, res) => {
  try {
    const announcements = await Announcement.find({
      expiryDate: { $gt: new Date() },
      priority: { $in: ['urgent', 'high'] }
    })
    .sort({ createdAt: -1 })
    .limit(5); // Show top 5

    res.json(announcements);
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({ message: 'Server error fetching announcements' });
  }
});

module.exports = router;
