const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Announcement = require('../models/Announcement');

const seedAnnouncements = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for seeding announcements...');

    const announcements = [
      {
        title: '🔥 Biggest Cultural Fest of the Year!',
        message: 'Aagaz 2026 is here. Grab your passes before they sell out!',
        priority: 'urgent',
        image: 'https://images.unsplash.com/photo-1540511587346-f597a66f0b3e?q=80&w=2070&auto=format&fit=crop', // Concert/fest image
        expiryDate: new Date('2026-05-15'),
      },
      {
        title: '⚡ HackTu 7.0 Registrations Open',
        message: 'Join the 48-hour hackathon and win prizes worth 10 Lakhs. Open to all departments.',
        priority: 'high',
        image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=2070&auto=format&fit=crop', // Tech/coding image
        expiryDate: new Date('2026-06-01'),
      },
      {
        title: '🏆 Inter-College Sports Meet',
        message: 'Registrations closing tonight for the annual sports meet. Dont miss out!',
        priority: 'urgent',
        image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=2070&auto=format&fit=crop', // Sports image
        expiryDate: new Date('2026-09-10'),
      }
    ];

    await Announcement.deleteMany({}); // Clear old
    await Announcement.insertMany(announcements);
    console.log('Sample announcements seeded successfully!');
    process.exit();
  } catch (error) {
    console.error('Error seeding announcements:', error);
    process.exit(1);
  }
};

seedAnnouncements();
