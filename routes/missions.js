const express = require('express');

const router = express.Router();
const Mission = require('../models/Mission');
const Car = require('../models/Car');
const Driver = require('../models/Driver');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const fields = ['orderNumber', 'carId', 'dateDepart', 'heureDepart', 'dateRetour', 'heureRetour', 'missionZone', 'lieu', 'sa', 'kmDepart', 'kmRetour', 'missionType'];
const generateMissionPDF = require('../generate-mission-pdf'); // ✅ top of file
// GET all missions with optional filters
router.get('/', async (req, res) => {
  try {
   const { order, car, driver, date, retour, zone, vehicleType } = req.query;

    const query = {};
if (req.query.vehicleType) query.vehicleType = req.query.vehicleType;
    if (order) query.orderNumber = new RegExp(order, 'i');
    if (car) query.carId = car;
    if (driver) query.driverName = driver;
 if (zone) query.missionZone = new RegExp(`^${zone.trim()}`, 'i');



    const parseDateQuery = (input, field) => {
      const yearOnly = /^\d{4}$/;
      const yearMonth = /^\d{4}-\d{2}$/;
      const fullDate = /^\d{4}-\d{2}-\d{2}$/;

      if (yearOnly.test(input)) {
        query[field] = { $regex: `^${input}` };
      } else if (yearMonth.test(input)) {
        query[field] = { $regex: `^${input}` };
      } else if (fullDate.test(input)) {
        query[field] = input;
      } else {
        res.status(400).json({ error: `Invalid ${field} format. Use YYYY, YYYY-MM or YYYY-MM-DD.` });
        throw new Error(`Invalid ${field} format.`);
      }
    };

    if (date) parseDateQuery(date, 'dateDepart');
    if (retour) parseDateQuery(retour, 'dateRetour');

    const missions = await Mission.find(query).sort({ createdAt: -1 });
    res.json(missions);
  } catch (err) {
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to fetch missions' });
    }
  }
});

// ✅ GET all car IDs
router.get('/cars/ids', async (req, res) => {
  try {
    const cars = await Car.find({}, 'carId');
    res.json(cars.map(car => car.carId));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch car IDs' });
  }
});

// ✅ GET all driver names
router.get('/drivers/names', async (req, res) => {
  try {
    const drivers = await Driver.find({}, 'name');
    res.json(drivers.map(driver => driver.name));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch driver names' });
  }
});

// ✅ GET unique dateDepart list
router.get('/dates/depart', async (req, res) => {
  try {
    const dates = await Mission.distinct('dateDepart');
    res.json(dates.sort());
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch depart dates' });
  }
});

// ✅ GET unique dateRetour list
router.get('/dates/retour', async (req, res) => {
  try {
    const dates = await Mission.distinct('dateRetour');
    res.json(dates.filter(Boolean).sort());
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch retour dates' });
  }
});

// The rest of the mission routes (POST, PATCH, DELETE, PDF) stay unchanged


// POST new mission
router.post('/', async (req, res) => {
  // ✅ Prevent duplicate order numbers
  const existing = await Mission.findOne({ orderNumber: req.body.orderNumber });
  if (existing) {
    return res.status(400).json({ error: '🚫 A mission with this order number already exists.' });
  }

  try {
    const {
      orderNumber, carId, driverName, vehicleType,
      missionType = [], missionZone, lieu,
      dateDepart, heureDepart, kmDepart, sa
    } = req.body;

    const car = await Car.findOne({ carId });
    const driver = await Driver.findOne({ name: driverName });
    if (!car || car.status !== 'available') return res.status(400).json({ error: 'Car is not available' });
    if (!driver || driver.status !== 'available') return res.status(400).json({ error: 'Driver is not available' });

    const mission = new Mission({
      orderNumber,
      carId,
      driverName,
      vehicleType,
      missionType,
      missionZone,
      lieu,
      dateDepart,
      heureDepart,
      kmDepart,
      sa,
      status: 'ongoing',
      createdAt: new Date()
    });

    await mission.save();

    // ✅ Update car & driver status
    car.status = 'on_mission';
    driver.status = 'on_mission';
    await car.save();
    await driver.save();

    // ✅ Generate PDF with BLANK return fields
    const pdfBuffer = await generateMissionPDF({
  ...mission.toObject(),
  kmRetour: '',
  heureRetour: '',
  dateRetour: '',
  durationHours: '',
  kmDone: ''
});
const base64 = Buffer.from(pdfBuffer).toString('base64'); // ✅ FIXED


res.status(201).json({
  message: '✅ Mission created successfully',
  mission,
  pdf: base64
});


  } catch (err) {
    console.error('❌ Mission creation error:', err);
    res.status(500).json({ error: 'Failed to create mission', details: err.message });
  }
});


// PATCH complete mission
// PATCH complete mission
router.patch('/:id/complete', async (req, res) => {
  try {
    const { kmRetour } = req.body;
    const mission = await Mission.findById(req.params.id);
    // 🚗 Save old car info before changing
const oldCarId = mission.carId;
const oldKmDepart = mission.kmDepart;
const oldKmRetour = mission.kmRetour;
const oldKmDone = oldKmRetour - oldKmDepart;

    if (!mission) return res.status(404).json({ error: 'Mission not found' });

    const now = new Date();
    const dateRetour = now.toISOString().split('T')[0];
    const heureRetour = now.toTimeString().slice(0, 5);

    const departTime = new Date(`${mission.dateDepart}T${mission.heureDepart}`);
    const retourTime = new Date(`${dateRetour}T${heureRetour}`);
    if (retourTime < departTime) return res.status(400).json({ error: 'Return time must not be before departure time.' });

    // ✅ Set fields
    mission.kmRetour = kmRetour;
    mission.dateRetour = dateRetour;
    mission.heureRetour = heureRetour;
    mission.durationHours = Math.round((retourTime - departTime) / 3600000 * 100) / 100;
    mission.kmDone = kmRetour - mission.kmDepart;
    mission.status = 'completed';

    const car = await Car.findOne({ carId: mission.carId });
    const driver = await Driver.findOne({ name: mission.driverName });

    if (car) {
  car.status = 'available';
  car.kmDepart = mission.kmRetour; // update to latest kmRetour
  car.totalKm += mission.kmDone || 0;
  car.missionsCompleted = (car.missionsCompleted || 0) + 1;
  await car.save();
}


    if (driver) {
      driver.status = 'available';
      driver.missionsCompleted = (driver.missionsCompleted || 0) + 1;
      await driver.save();
    }
await mission.save();

// ✅ Add this to generate final PDF with all fields
const pdfBuffer = await generateMissionPDF(mission.toObject());
const base64 = Buffer.from(pdfBuffer).toString('base64');

res.json({
  message: '✅ Mission completed',
  mission,
  pdf: base64
});

  } catch (err) {
    console.error('❌ Completion Error:', err);
    res.status(500).json({ error: 'Failed to complete mission' });
  }
});

// PATCH mission edit
router.patch('/:id', async (req, res) => {
  try {
    const mission = await Mission.findById(req.params.id);
    if (!mission) return res.status(404).json({ error: 'Mission not found' });

    // Capture original car and driver
    const originalCarId = mission.carId;
    const originalDriverName = mission.driverName;
    const originalKmDepart = mission.kmDepart;
    const originalKmRetour = mission.kmRetour;
    const originalKmDone = originalKmRetour && originalKmDepart ? originalKmRetour - originalKmDepart : 0;

    const newCarId = req.body.carId;
    const newDriverName = req.body.driverName;
    const carChanged = newCarId && newCarId !== originalCarId;
    const driverChanged = newDriverName && newDriverName !== originalDriverName;

    // ✅ Only patch safe fields — REMOVE driverName from this list!
    const fields = ['orderNumber', 'carId', 'vehicleType', 'dateDepart', 'heureDepart', 'dateRetour', 'heureRetour', 'missionZone', 'lieu', 'sa', 'kmDepart', 'kmRetour', 'missionType', 'status'];
    for (const field of fields) {
      if (req.body[field] !== undefined) mission[field] = req.body[field];
    }

    // ✅ Handle driver change manually
    if (driverChanged) {
      const oldDriver = await Driver.findOne({ name: originalDriverName });
      const newDriver = await Driver.findOne({ name: newDriverName });

      if (oldDriver && oldDriver.missionsCompleted > 0) {
        oldDriver.missionsCompleted -= 1;
        await oldDriver.save();
      }

      if (newDriver) {
        newDriver.missionsCompleted = (newDriver.missionsCompleted || 0) + 1;
        await newDriver.save();
        mission.driverName = newDriverName;
      }
    }

    // ✅ Validate date logic
if (mission.dateDepart && mission.dateRetour && mission.heureDepart && mission.heureRetour) {
  const depart = new Date(`${mission.dateDepart}T${mission.heureDepart}`);
  const retour = new Date(`${mission.dateRetour}T${mission.heureRetour}`);
  
  if (retour < depart) {
    return res.status(400).json({ error: 'Return time must not be before departure time.' });
  }

  // ✅ Recalculate duration
  const msDiff = retour - depart;
  mission.durationHours = Math.round((msDiff / 3600000) * 100) / 100; // hours with 2 decimals
}

    // ✅ Car swap logic if mission is completed
    if (carChanged && mission.status === 'completed') {
      const oldCar = await Car.findOne({ carId: originalCarId });
      const newCar = await Car.findOne({ carId: newCarId });

      if (oldCar) {
        oldCar.missionsCompleted = Math.max(0, (oldCar.missionsCompleted || 1) - 1);
        oldCar.totalKm = Math.max(0, (oldCar.totalKm || 0) - (originalKmDone > 0 ? originalKmDone : 0));

        const lastOldMission = await Mission.findOne({
          carId: originalCarId,
          status: 'completed',
          _id: { $ne: mission._id }
        }).sort({ dateRetour: -1 });

        oldCar.kmDepart = lastOldMission?.kmRetour ?? 0;
        await oldCar.save();
      }

      if (newCar) {
        const lastNewMission = await Mission.findOne({
          carId: newCarId,
          status: 'completed',
          _id: { $ne: mission._id }
        }).sort({ dateRetour: -1 });

        const newKmDepart = lastNewMission?.kmRetour ?? 0;
        mission.kmDepart = newKmDepart;
        mission.kmDone = (mission.kmRetour ?? 0) - newKmDepart;

        if (mission.kmRetour <= newKmDepart) {
          return res.status(400).json({ error: '🚫 KM Retour must be greater than KM Départ for the new car.' });
        }

        newCar.totalKm = (newCar.totalKm || 0) + (mission.kmDone > 0 ? mission.kmDone : 0);
        newCar.kmDepart = mission.kmRetour;
        newCar.missionsCompleted = (newCar.missionsCompleted || 0) + 1;
        await newCar.save();
      }

      mission.carId = newCarId;
    }

    // ✅ KM update logic
    if (req.body.kmRetour !== undefined && mission.status === 'completed') {
      const car = await Car.findOne({ carId: mission.carId });

      if (car) {
        mission.kmDone = mission.kmRetour - mission.kmDepart;
        if (mission.kmDone <= 0) {
          return res.status(400).json({ error: '🚫 KM Retour must be greater than KM Départ.' });
        }

        const completedMissions = await Mission.find({
          carId: mission.carId,
          status: 'completed',
          kmDepart: { $ne: null },
          kmRetour: { $ne: null }
        });

        const totalKm = completedMissions.reduce((sum, m) => {
          const diff = m.kmRetour - m.kmDepart;
          return sum + (diff > 0 ? diff : 0);
        }, 0);

        car.totalKm = totalKm;
        car.kmDepart = mission.kmRetour;
        await car.save();
      }
    }

    await mission.save();
    res.json({ message: '✅ Mission updated', mission });

  } catch (err) {
    console.error('❌ Mission edit error:', err);
    res.status(500).json({ error: 'Failed to update mission' });
  }
});


// DELETE mission
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Mission.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Mission not found' });
    res.json({ message: '✅ Mission deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete mission' });
  }
});

// GET PDF report

// routes/missions.js
// routes/missions.js
// GET /api/missions/:id/report
router.get('/:id/report', async (req, res) => {
  try {
    const mission = await Mission.findById(req.params.id);
    if (!mission) return res.status(404).json({ error: 'Mission not found' });

    // 🛑 Handle undefined fields safely for ongoing missions
    const m = mission.toObject();

    const isCompleted = m.status === 'completed';

    const missionData = {
      ...m,
      kmRetour: isCompleted ? m.kmRetour : '',
      heureRetour: isCompleted ? m.heureRetour : '',
      dateRetour: isCompleted ? m.dateRetour : '',
      kmDone: isCompleted ? m.kmDone : '',
      durationHours: isCompleted ? m.durationHours : ''
    };

    const buffer = await generateMissionPDF(missionData);

   res.writeHead(200, {
  'Content-Type': 'application/pdf',
  'Content-Disposition': `inline; filename=mission_${mission.orderNumber || 'mission'}.pdf`,
  'Content-Length': buffer.length
});
res.end(buffer);

  } catch (err) {
    console.error('❌ PDF generation error:', err.message);
    console.error(err.stack);
    res.status(500).json({ error: 'Failed to generate PDF', details: err.message });
  }
});



// ✅ Step 1 — GET report summary by date range
router.get('/report/summary', async (req, res) => {
  try {
    const { start, end } = req.query;
    if (!start || !end) {
      return res.status(400).json({ error: 'Start and end date are required' });
    }

    const missions = await Mission.find({
      status: 'completed',
      dateDepart: { $gte: start, $lte: end }
    });

    const carMap = {};
    const driverMap = {};

    missions.forEach(m => {
      // Cars
      if (!carMap[m.carId]) carMap[m.carId] = { missionsCompleted: 0, totalKm: 0 };
      const km = (m.kmRetour ?? 0) - (m.kmDepart ?? 0);
      carMap[m.carId].missionsCompleted += 1;
      carMap[m.carId].totalKm += km > 0 ? km : 0;


      // Drivers
      if (!driverMap[m.driverName]) driverMap[m.driverName] = { missionsCompleted: 0, hoursWorked: 0 };
      driverMap[m.driverName].missionsCompleted += 1;
      driverMap[m.driverName].hoursWorked += m.durationHours || 0;
    });

    res.json({ cars: carMap, drivers: driverMap });
  } catch (err) {
    console.error('❌ Report Error:', err);
    res.status(500).json({ error: 'Failed to generate summary report' });
  }
})



router.get('/report/cars/excel', async (req, res) => {
  try {
    console.log('📊 Excel request received with:', req.query);
    
    const { year, month } = req.query;
    if (!year || !month) {
      return res.status(400).json({ error: 'Year and Month are required' });
    }

    const paddedMonth = String(month).padStart(2, '0');
    const start = `${year}-${paddedMonth}-01`;
    const endDate = new Date(year, parseInt(paddedMonth), 0).getDate(); // Last day of month
    const end = `${year}-${paddedMonth}-${endDate}`;

    const missions = await Mission.find({
      status: 'completed',
      dateDepart: { $gte: start, $lte: end }
    });

    console.log(`✅ Found ${missions.length} missions from ${start} to ${end}`);

    const carMap = {};
    missions.forEach(m => {
      const km = (m.kmRetour ?? 0) - (m.kmDepart ?? 0);
      if (!carMap[m.carId]) {
        carMap[m.carId] = { missions: 0, km: 0 };
      }
      carMap[m.carId].missions += 1;
      carMap[m.carId].km += km > 0 ? km : 0;
    });

    const ExcelJS = require('exceljs');
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Car Report');

    sheet.columns = [
      { header: 'Car ID', key: 'carId', width: 20 },
      { header: 'Number of Missions', key: 'missions', width: 20 },
      { header: 'Total KM', key: 'km', width: 15 }
    ];

    Object.entries(carMap).forEach(([carId, stats]) => {
      sheet.addRow({ carId, missions: stats.missions, km: stats.km });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=car_report_${year}_${paddedMonth}.xlsx`);
    
  await workbook.xlsx.write(res).then(() => {
  console.log('✅ Excel file sent');
  res.end();
}).catch(err => {
  console.error('❌ Excel stream error:', err);
  res.status(500).json({ error: 'Failed to stream Excel file' });
});

  } catch (err) {
    console.error('❌ Excel export error:', err.stack);
    res.status(500).json({ error: 'Failed to generate Excel report' });
  }
});
router.get('/report/drivers/excel', async (req, res) => {
  try {
    const { year, month } = req.query;
    if (!year || !month) {
      return res.status(400).json({ error: 'Year and Month are required' });
    }

    const paddedMonth = String(month).padStart(2, '0');
    const start = `${year}-${paddedMonth}-01`;
    const endDate = new Date(year, parseInt(paddedMonth), 0).getDate();
    const end = `${year}-${paddedMonth}-${endDate}`;

    const missions = await Mission.find({
      status: 'completed',
      dateDepart: { $gte: start, $lte: end }
    });

    const driverMap = {};

    for (const m of missions) {
      const name = m.driverName;
      const duration = m.durationHours || 0;
      const type = m.vehicleType || 'Inconnu';

      if (!driverMap[name]) {
        driverMap[name] = {
          missions: 0,
          totalMinutes: 0,
          types: {}
        };
      }

      driverMap[name].missions += 1;
      driverMap[name].totalMinutes += Math.round(duration * 60);

      if (!driverMap[name].types[type]) {
        driverMap[name].types[type] = { count: 0, minutes: 0 };
      }

      driverMap[name].types[type].count += 1;
      driverMap[name].types[type].minutes += Math.round(duration * 60);
    }

    // 👉 Créer un Excel
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Rapport Chauffeurs');

    sheet.columns = [
      { header: 'Chauffeur', key: 'name', width: 25 },
      { header: 'Missions', key: 'missions', width: 12 },
      { header: 'Durée totale', key: 'duration', width: 20 },
      { header: 'Résumé', key: 'summary', width: 50 }
    ];

    for (const [name, stats] of Object.entries(driverMap)) {
      const h = Math.floor(stats.totalMinutes / 60);
      const min = stats.totalMinutes % 60;

      // 🔸 Résumé en français
      let summary = `${name} a accompli ${stats.missions} mission(s), totalisant ${h} h ${min} min.\n`;

      for (const [type, values] of Object.entries(stats.types)) {
        const hType = Math.floor(values.minutes / 60);
        const minType = values.minutes % 60;

        summary += `▪️ ${values.count} mission(s) avec ${type} — ${hType} h ${minType} min\n`;
      }

      sheet.addRow({
        name,
        missions: stats.missions,
        duration: `${h} h ${min} min`,
        summary
      });
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=rapport_chauffeurs_${year}_${paddedMonth}.xlsx`);
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error('❌ Excel Driver Report Error:', err.stack);
    res.status(500).json({ error: 'Failed to generate driver report' });
  }
});
// 🚀 Export All Missions of a Month (Full Info)
router.get('/report/missions/excel', async (req, res) => {
  const ExcelJS = require('exceljs');

  try {
    const { year, month } = req.query;
    if (!year || !month) {
      return res.status(400).json({ error: 'Year and Month are required' });
    }

    const paddedMonth = String(month).padStart(2, '0');
    const start = `${year}-${paddedMonth}-01`;
    const endDate = new Date(year, parseInt(month), 0).getDate(); // Last day of month
    const end = `${year}-${paddedMonth}-${endDate}`;

    const missions = await Mission.find({
      dateDepart: { $gte: start, $lte: end }
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Missions');

    // Columns
    sheet.columns = [
      { header: 'Order', key: 'orderNumber', width: 15 },
      { header: 'Car', key: 'carId', width: 15 },
      { header: 'Driver', key: 'driverName', width: 15 },
      { header: 'Vehicle Type', key: 'vehicleType', width: 15 },
      { header: 'Mission Type', key: 'missionType', width: 30 },
      { header: 'Zone', key: 'missionZone', width: 15 },
      { header: 'Lieu', key: 'lieu', width: 15 },
      { header: 'SA', key: 'sa', width: 15 },
      { header: 'KM Depart', key: 'kmDepart', width: 15 },
      { header: 'KM Retour', key: 'kmRetour', width: 15 },
      { header: 'KM Done', key: 'kmDone', width: 15 },
      { header: 'Date Depart', key: 'dateDepart', width: 15 },
      { header: 'Heure Depart', key: 'heureDepart', width: 15 },
      { header: 'Date Retour', key: 'dateRetour', width: 15 },
      { header: 'Heure Retour', key: 'heureRetour', width: 15 },
      { header: 'Duration', key: 'durationHours', width: 15 },
      { header: 'Status', key: 'status', width: 12 }
    ];

    // Rows
    missions.forEach((m) => {
      const duration = m.durationHours != null ? 
        `${Math.floor(m.durationHours)} h ${Math.round((m.durationHours % 1) * 60)} min` : '';

      sheet.addRow({
        orderNumber: m.orderNumber,
        carId: m.carId,
        driverName: m.driverName,
        vehicleType: m.vehicleType,
        missionType: Array.isArray(m.missionType) ? m.missionType.join(', ') : m.missionType,
        missionZone: m.missionZone,
        lieu: m.lieu,
        sa: m.sa,
        kmDepart: m.kmDepart,
        kmRetour: m.kmRetour,
        kmDone: m.kmDone,
        dateDepart: m.dateDepart,
        heureDepart: m.heureDepart,
        dateRetour: m.dateRetour,
        heureRetour: m.heureRetour,
        durationHours: duration,
        status: m.status
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=missions_${year}_${paddedMonth}.xlsx`);
    
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error('❌ Mission Excel export error:', err.stack);
    res.status(500).json({ error: 'Failed to export missions Excel' });
  }
});

module.exports = router;
