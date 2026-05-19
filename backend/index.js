require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const session = require('express-session');
const passport = require('./utils/passport');

const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const registrationRoutes = require('./routes/registrationRoutes');
const dutyLeaveRoutes = require('./routes/dutyLeaveRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', process.env.FRONTEND_URL],
  credentials: true
}));

app.use(session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// Ensure uploads directory exists inside backend
const fs = require('fs');
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// EJS Views Config
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files for uploads
app.use('/uploads', express.static(uploadsDir));

// Base route for EJS View
app.get('/', (req, res) => {
  res.render('home');
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/duty-leave', dutyLeaveRoutes);
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/notifications', notificationRoutes);
app.use('/api/announcements', announcementRoutes);

// Error Handler Middleware (must be last)
app.use(errorHandler);

// MongoDB Connection
const User = require('./models/User');
connectDB().then(async () => {
  // Seed Admin
  const adminEmail = 'janvibajaj02@gmail.com';
  const adminExists = await User.findOne({ email: adminEmail });
  if (!adminExists) {
    await User.create({
      name: 'Super Admin',
      email: adminEmail,
      password: '12345678',
      role: 'admin'
    });
    console.log('Admin user seeded');
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
