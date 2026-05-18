const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');
const Registration = require('../models/Registration');

async function checkRegs() {
    await mongoose.connect(process.env.MONGO_URI);
    const user = await User.findOne({ email: 'student123@test.com' });
    if (!user) {
        console.log('User not found');
        process.exit(0);
    }
    console.log('User ID:', user._id);
    const regs = await Registration.find({ userId: user._id });
    console.log('Registrations:', regs.length);
    regs.forEach(r => console.log(r.eventId, r.status));
    process.exit(0);
}
checkRegs();
