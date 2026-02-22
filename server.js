const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

const missionRoutes = require('./routes/missions');
const carRoutes = require('./routes/cars');
const driverRoutes = require('./routes/drivers');
const reportRoutes = require('./routes/reports'); // ✅ NEW REPORT ROUTE

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Connect to MongoDB
connectDB();

// ✅ Middlewares
app.use(cors());
app.use(express.json());

// ✅ API Routes
app.use('/api/cars', carRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/missions', missionRoutes);
app.use('/api/missions', reportRoutes);


// ✅ Test Route
app.get('/', (req, res) => {
  res.send('🚀 Backend is running and MongoDB is connected!');
});

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
