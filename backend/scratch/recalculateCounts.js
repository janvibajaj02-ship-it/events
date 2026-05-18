const mongoose = require('mongoose');

const recalculateCounts = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/eventhub');
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    const Event = db.collection('events');
    const Registration = db.collection('registrations');
    
    const events = await Event.find().toArray();
    console.log(`Found ${events.length} events to update.`);

    for (const event of events) {
      const actualCount = await Registration.countDocuments({ eventId: event._id });
      await Event.updateOne(
        { _id: event._id },
        { $set: { registeredCount: actualCount } }
      );
      console.log(`Event "${event.title}": Set count to ${actualCount}`);
    }
    
    console.log('Finished recalculating all counts.');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

recalculateCounts();
