const express = require('express');
const router = express.Router();
const Car = require('../models/Car');

// ✅ GET all cars
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {}; // Only filter if ?status=available
    const cars = await Car.find(filter);
    res.json(cars);
  } catch (err) {
    console.error('❌ GET /cars Error:', err.message);
    res.status(500).json({ error: 'Failed to fetch cars' });
  }
});


// ✅ GET a single car by carId
router.get('/:carId', async (req, res) => {
  try {
    const car = await Car.findOne({ carId: req.params.carId });
    if (!car) return res.status(404).json({ error: 'Car not found' });
    res.json(car);
  } catch (err) {
    console.error('❌ GET /cars/:carId Error:', err.message);
    res.status(500).json({ error: 'Failed to fetch car details' });
  }
});

// ✅ POST a new car
router.post('/', async (req, res) => {
  try {
    const {
      carId,
      status = 'available',
      kmDepart = 0,
      vehicleType = 'véhicule',
    } = req.body;

    if (!carId) {
      return res.status(400).json({ error: 'Car ID is required' });
    }

    const existing = await Car.findOne({ carId });
    if (existing) return res.status(400).json({ error: 'Car ID already exists' });

    const newCar = new Car({ carId, status, kmDepart, vehicleType });
    await newCar.save();

    res.status(201).json(newCar);
  } catch (err) {
    console.error('❌ POST /cars Error:', err.message, err.stack);
    res.status(500).json({ error: 'Failed to add car', details: err.message });
  }
});

// ✅ PATCH a car (edit carId, status, kmDepart, vehicleType)
// ✅ PATCH a car
router.patch('/:id', async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ error: 'Car not found' });

    const fields = ['carId', 'status', 'kmDepart', 'vehicleType'];
    for (const field of fields) {
      if (req.body[field] !== undefined) {
        car[field] = req.body[field];
      }
    }

    await car.save();
    res.json(car);
  } catch (err) {
    console.error('❌ Edit Car Error:', err.message, err.stack);
    res.status(500).json({ error: 'Failed to update car' });
  }
});


// ✅ DELETE a car
router.delete('/:id', async (req, res) => {
  try {
    await Car.findByIdAndDelete(req.params.id);
    res.json({ message: 'Car deleted' });
  } catch (err) {
    console.error('❌ DELETE /cars/:id Error:', err.message);
    res.status(500).json({ error: 'Failed to delete car' });
  }
});

module.exports = router;
