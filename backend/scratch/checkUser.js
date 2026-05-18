const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');

async function checkUser() {
    await mongoose.connect(process.env.MONGO_URI);
    const user = await User.findById('69eb1391ab083d1e086704a0');
    console.log('User:', user?.email, user?.role);
    process.exit(0);
}
checkUser();
