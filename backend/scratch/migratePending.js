const mongoose = require('mongoose');

const updateRegistrations = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/eventhub');
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    // Update all registrations to 'approved' if they are 'pending'
    const result = await db.collection('registrations').updateMany(
      { status: 'pending' },
      { $set: { status: 'approved' } }
    );
    
    console.log(`Updated ${result.modifiedCount} registrations to approved.`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

updateRegistrations();
