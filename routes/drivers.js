const express = require('express');
const router = express.Router();
const Driver = require('../models/Driver');

// ✅ GET all drivers
router.get('/', async (req, res) => {
  const { status } = req.query;
  const filter = status ? { status } : {};
  try {
    const drivers = await Driver.find(filter);
    res.json(drivers);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch drivers' });
  }
});

// ✅ POST - Add a new driver
// ✅ POST - Add a new driver
router.post('/', async (req, res) => {
  try {
    const { name, permitType } = req.body;

    if (!name || !permitType) {
      return res.status(400).json({ error: 'Name and permitType are required' });
    }

    const existing = await Driver.findOne({ name });
    if (existing) {
      return res.status(400).json({ error: 'Driver already exists' });
    }

    const driver = new Driver({ name, permitType });
    await driver.save();

    res.status(201).json(driver);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create driver', details: err.message });
  }
});


// ✅ PATCH - Update a driver (name, permitType)
router.patch('/:id', async (req, res) => {
  try {
    const updated = await Driver.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update driver', details: err.message });
  }
});

// ✅ DELETE - Remove a driver
router.delete('/:id', async (req, res) => {
  try {
    await Driver.findByIdAndDelete(req.params.id);
    res.json({ message: '✅ Driver deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete driver' });
  }
});

// ✅ PATCH - Change driver status (available / off_duty / on_mission)
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['available', 'off_duty', 'on_mission'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const updated = await Driver.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update driver status' });
  }
});

module.exports = router;
