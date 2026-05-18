const mongoose = require('mongoose');
require('dotenv').config();

const updateEventImages = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/eventhub');
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    const Event = db.collection('events');
    
    // Update "fufu"
    await Event.updateOne(
      { title: "fufu" },
      { $set: { image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop" } }
    );

    // Update "annual sports"
    await Event.updateOne(
      { title: "annual sports" },
      { $set: { image: "https://images.unsplash.com/photo-1504450758481-7338eba7524a?q=80&w=2069&auto=format&fit=crop" } }
    );

    // Also update any others that use the broken placeholder
    const result = await Event.updateMany(
      { image: { $regex: /placeholder\.com/ } },
      { $set: { image: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=2070&auto=format&fit=crop" } }
    );

    console.log(`Updated broken placeholders in ${result.modifiedCount} events.`);
    console.log('Images updated successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

updateEventImages();
