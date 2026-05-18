const mongoose = require('mongoose');
require('dotenv').config();
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const DutyLeave = require('../models/DutyLeave');

async function deleteSeededEvents() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // IDs of test accounts used for seeding/testing
        const testUserIds = [
            '69e9c0b07ae37d1d641ed5be', // Super Admin
            '69eb1391ab083d1e086704a0'  // organizer@test.com
        ];

        // Find events created by these test accounts
        const seededEvents = await Event.find({ createdBy: { $in: testUserIds } });
        const seededEventIds = seededEvents.map(e => e._id);

        console.log(`Found ${seededEventIds.length} seeded/test events. Deleting...`);

        if (seededEventIds.length > 0) {
            // Delete related data
            await Registration.deleteMany({ eventId: { $in: seededEventIds } });
            await DutyLeave.deleteMany({ eventId: { $in: seededEventIds } });
            await Event.deleteMany({ _id: { $in: seededEventIds } });
            console.log('Seeded events and related data deleted successfully.');
        } else {
            console.log('No seeded events found.');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

deleteSeededEvents();
