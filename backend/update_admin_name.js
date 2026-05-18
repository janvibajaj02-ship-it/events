const mongoose = require('mongoose');

const MONGO_URI = 'mongodb://localhost:27017/eventhub';

mongoose.connect(MONGO_URI).then(async () => {
  console.log('Connected to MongoDB');
  const db = mongoose.connection.db;
  
  // Update the user with role 'admin'
  const result = await db.collection('users').updateOne(
    { role: 'admin' },
    { $set: { name: 'Janvi Bajaj' } }
  );
  
  console.log(`Matched ${result.matchedCount} document(s) and modified ${result.modifiedCount} document(s).`);
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
