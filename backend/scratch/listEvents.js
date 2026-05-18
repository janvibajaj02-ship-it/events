const mongoose = require('mongoose');
require('dotenv').config();

const listEvents = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/eventhub');
    const db = mongoose.connection.db;
    const events = await db.collection('events').find().toArray();
    console.log(JSON.stringify(events, null, 2));
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

listEvents();
