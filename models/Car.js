const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  carId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ['available', 'on_mission', 'unavailable'],
    default: 'available',
  },
  vehicleType: {
    type: String,
    enum: ['véhicule', 'camion', 'ambulance'],
    default: 'véhicule',
  },
  kmDepart: {
    type: Number,
    default: 0,
  },
  missionsCompleted: {
    type: Number,
    default: 0,
  },
  totalKm: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Car', carSchema);
