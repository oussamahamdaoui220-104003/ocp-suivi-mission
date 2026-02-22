const mongoose = require('mongoose');

const missionSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true
  },
  carId: {
    type: String,
    required: true
  },
  driverName: {
    type: String,
    required: true
  },
  vehicleType: {                    // ✅ NEW FIELD
    type: String,
    enum: ['véhicule', 'camion', 'ambulance'],
    default: 'véhicule'
  },
  kmDepart: {
    type: Number,
    required: true
  },
  kmRetour: {
    type: Number
  },
  dateDepart: {
    type: String,
    required: true
  },
  heureDepart: {
    type: String,
    required: true
  },
  dateRetour: {
    type: String
  },
  heureRetour: {
    type: String
  },
  durationHours: {
    type: Number
  },
  kmDone: {
    type: Number
  },
  sa: {
    type: String
  },
  lieu: {
    type: String
  },
  missionType: {
    type: [String],
    default: []
  },
  missionZone: {
    type: String
  },
  status: {
    type: String,
    enum: ['ongoing', 'completed'],
    default: 'ongoing'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Mission', missionSchema);
