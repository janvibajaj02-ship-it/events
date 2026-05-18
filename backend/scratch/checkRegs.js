const mongoose = require('mongoose');
require('dotenv').config();
const Registration = require('../models/Registration');

async function checkRegs() {
    await mongoose.connect(process.env.MONGO_URI);
    const regs = await Registration.find({ userId: '69eb5eb65154c8294c107eea' });
    console.log('Registrations:', regs.length);
    regs.forEach(r => console.log(r.eventId, r.status));
    process.exit(0);
}
checkRegs();
