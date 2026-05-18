const mongoose = require('mongoose');
require('dotenv').config();
const Event = require('../models/Event');

async function checkEvents() {
    await mongoose.connect(process.env.MONGO_URI);
    const events = await Event.find({ title: /hack/i });
    events.forEach(e => {
        console.log(`Title: ${e.title}`);
        console.log(`Status: ${e.status}`);
        console.log(`Max Seats: ${e.maxSeats}`);
        console.log(`Registered: ${e.registeredCount}`);
        console.log('---');
    });
    process.exit(0);
}
checkEvents();
