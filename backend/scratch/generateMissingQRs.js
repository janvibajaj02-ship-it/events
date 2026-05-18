const mongoose = require('mongoose');
const QRCode = require('qrcode');

const fixQRCodes = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/eventhub');
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    const Registration = db.collection('registrations');
    const Event = db.collection('events');
    
    const registrations = await Registration.find({ qrCode: { $exists: false } }).toArray();
    console.log(`Found ${registrations.length} registrations without QR codes.`);

    for (const reg of registrations) {
      const event = await Event.findOne({ _id: reg.eventId });
      const qrData = JSON.stringify({
        registrationId: reg._id,
        studentName: reg.name,
        eventName: event?.title || 'Event'
      });
      
      const qrCode = await QRCode.toDataURL(qrData);
      
      await Registration.updateOne(
        { _id: reg._id },
        { $set: { qrCode: qrCode } }
      );
      console.log(`Generated QR for: ${reg.name}`);
    }
    
    console.log('Finished generating QR codes.');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

fixQRCodes();
