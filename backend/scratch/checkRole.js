const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');

async function checkRole() {
    await mongoose.connect(process.env.MONGO_URI);
    const user = await User.findOne({ email: 'devsharma70@gmail.com' });
    console.log('User Role:', user?.role);
    process.exit(0);
}
checkRole();
