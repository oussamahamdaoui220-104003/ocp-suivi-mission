const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },

  status: {
    type: String,
    enum: ['available', 'on_mission', 'off_duty'],
    default: 'available'
  },

  missionsCompleted: {
    type: Number,
    default: 0
  },

  permitType: {
    type: String,
    enum: ['B', 'C'],  // ✅ only B or C
    required: true
  }
});

module.exports = mongoose.model('Driver', driverSchema);
