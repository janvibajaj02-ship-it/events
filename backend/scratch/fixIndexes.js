const mongoose = require('mongoose');
require('dotenv').config();

const cleanDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/eventhub');
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    const registrationExists = collections.some(col => col.name === 'registrations');
    
    if (registrationExists) {
      console.log('Dropping old indexes from registrations...');
      await db.collection('registrations').dropIndexes();
      console.log('Indexes dropped successfully');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

cleanDB();
