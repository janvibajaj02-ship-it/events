const mongoose = require('mongoose');

const MONGO_URI = 'mongodb://127.0.0.1:27017/eventhub'; // Assuming default local mongo URI, let's verify.

mongoose.connect(MONGO_URI).then(async () => {
  console.log('Connected to MongoDB');
  // I need to use the User model or just raw db collection
  const db = mongoose.connection.db;
  const result = await db.collection('users').deleteMany({
    email: { $in: ['organizer_test@example.com', 'testorg@example.com'] }
  });
  console.log(`Deleted ${result.deletedCount} users.`);
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
