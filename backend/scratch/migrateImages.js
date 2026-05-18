const mongoose = require('mongoose');
require('dotenv').config();

const migrateImageField = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/eventhub');
    const db = mongoose.connection.db;
    const Event = db.collection('events');
    
    // Find events with bannerImage but no image
    const events = await Event.find({ bannerImage: { $exists: true }, image: { $exists: false } }).toArray();
    console.log(`Migrating ${events.length} events from bannerImage to image.`);

    for (const event of events) {
      await Event.updateOne(
        { _id: event._id },
        { $set: { image: event.bannerImage } }
      );
    }

    // Also update any events that have NO image at all with a default high-quality one
    const result = await Event.updateMany(
      { image: { $exists: false } },
      { $set: { image: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=2070&auto=format&fit=crop" } }
    );
    
    console.log(`Updated ${result.modifiedCount} events with default images.`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

migrateImageField();
