const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');

async function listUsers() {
    await mongoose.connect(process.env.MONGO_URI);
    const users = await User.find({});
    users.forEach(u => console.log(`${u._id} | ${u.email} | ${u.name}`));
    process.exit(0);
}
listUsers();
