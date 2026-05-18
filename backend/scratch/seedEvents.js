require('dotenv').config();
const mongoose = require('mongoose');
const Event = require('../models/Event');
const User = require('../models/User');

const seedEvents = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    // Find or create an organizer user
    let organizer = await User.findOne({ role: 'organizer' });
    if (!organizer) {
      organizer = await User.create({
        name: 'Event Organizer',
        email: 'organizer@university.edu',
        password: 'password123',
        role: 'organizer'
      });
      console.log('Organizer user created for seeding');
    }

    const events = [
      {
        title: 'PU Annual Cultural Fest - Aagaz',
        description: 'The biggest cultural extravaganza at Panjab University featuring music, dance, and drama.',
        date: new Date('2026-05-10'),
        endDate: new Date('2026-05-12'),
        startTime: '10:00 AM',
        endTime: '10:00 PM',
        venue: 'Panjab University, Chandigarh',
        category: 'Cultural',
        maxSeats: 500,
        createdBy: organizer._id,
        status: 'approved'
      },
      {
        title: 'Thapar Tech Summit 2026',
        description: 'A 2-day deep dive into AI, Web3, and Robotics at Thapar Institute.',
        date: new Date('2026-06-15'),
        endDate: new Date('2026-06-16'),
        startTime: '09:30 AM',
        endTime: '05:30 PM',
        venue: 'Thapar University, Patiala',
        category: 'Tech',
        maxSeats: 300,
        createdBy: organizer._id,
        status: 'approved'
      },
      {
        title: 'LPU Global Alumni Meet',
        description: 'Connecting world-class alumni for a networking evening and dinner.',
        date: new Date('2026-07-20'),
        startTime: '06:00 PM',
        endTime: '11:00 PM',
        venue: 'LPU, Jalandhar',
        category: 'Networking',
        maxSeats: 1000,
        createdBy: organizer._id,
        status: 'approved'
      },
      {
        title: 'Chitkara Coding Championship',
        description: 'A 24-hour hackathon to solve real-world problems. Multi-day coding battle.',
        date: new Date('2026-08-05'),
        endDate: new Date('2026-08-06'),
        startTime: '09:00 AM',
        endTime: '09:00 AM',
        venue: 'Chitkara University, Punjab',
        category: 'Tech',
        maxSeats: 200,
        createdBy: organizer._id,
        status: 'approved'
      },
      {
        title: 'PU Sports Meet - Spardha',
        description: 'Annual inter-departmental sports tournament including Cricket, Basketball, and Athletics.',
        date: new Date('2026-09-12'),
        endDate: new Date('2026-09-15'),
        startTime: '07:00 AM',
        endTime: '06:00 PM',
        venue: 'Sports Ground, Panjab University',
        category: 'Sports',
        maxSeats: 400,
        createdBy: organizer._id,
        status: 'approved'
      }
    ];

    // Clear existing events for a clean slate (optional, but requested "make some event like these")
    // await Event.deleteMany({}); 

    await Event.insertMany(events);
    console.log('Sample events seeded successfully!');
    process.exit();
  } catch (error) {
    console.error('Error seeding events:', error);
    process.exit(1);
  }
};

seedEvents();
