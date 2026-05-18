const mongoose = require('mongoose');

const MONGO_URI = 'mongodb://localhost:27017/eventhub';

mongoose.connect(MONGO_URI).then(async () => {
  console.log('Connected to MongoDB');
  const db = mongoose.connection.db;
  
  // Get all events
  const events = await db.collection('events').find({}).toArray();
  
  for (const event of events) {
    // Count actual approved registrations for this event
    const actualCount = await db.collection('registrations').countDocuments({
      eventId: event._id,
      status: 'approved'
    });
    
    // Update the event with the correct count
    await db.collection('events').updateOne(
      { _id: event._id },
      { $set: { registeredCount: actualCount } }
    );
    console.log(`Fixed "${event.title}": registeredCount = ${actualCount}`);
  }
  
  console.log('✅ All counts fixed!');
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
