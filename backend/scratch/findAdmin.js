const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');

async function findAdmin() {
    await mongoose.connect(process.env.MONGO_URI);
    const admin = await User.findOne({ email: 'janvibajaj02@gmail.com' });
    console.log('Admin ID:', admin?._id);
    process.exit(0);
}
findAdmin();
