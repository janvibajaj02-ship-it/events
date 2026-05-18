const mongoose = require('mongoose');
require('dotenv').config();
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const DutyLeave = require('../models/DutyLeave');

async function finalCleanup() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Keywords from AI-generated events
        const aiKeywords = [
            'Panjab University',
            'Thapar University',
            'LPU',
            'Chitkara University',
            'Sports Meet',
            'Web Development Workshop',
            'Tech Expo',
            'Music Fest',
            'Hackathon 2026',
            'Robotics Workshop'
        ];

        // Find events where title contains any AI keyword
        const eventsToDelete = await Event.find({
            $or: aiKeywords.map(keyword => ({ title: { $regex: keyword, $options: 'i' } }))
        });

        const eventIds = eventsToDelete.map(e => e._id);
        console.log(`Found ${eventIds.length} AI-generated events. Deleting...`);

        if (eventIds.length > 0) {
            await Registration.deleteMany({ eventId: { $in: eventIds } });
            await DutyLeave.deleteMany({ eventId: { $in: eventIds } });
            await Event.deleteMany({ _id: { $in: eventIds } });
            console.log('Cleanup successful.');
        } else {
            console.log('No AI events found.');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

finalCleanup();
