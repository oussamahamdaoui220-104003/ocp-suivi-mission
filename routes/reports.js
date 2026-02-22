const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { PDFDocument } = require('pdf-lib');
const Mission = require('../models/Mission'); // ✅ Make sure the model is imported

// ✅ Proper route: /api/missions/:missionId/report
router.get('/:missionId/report', async (req, res) => {
  try {
    const mission = await Mission.findById(req.params.missionId);
    if (!mission) return res.status(404).send('Mission not found');

    const templatePath = path.join(process.cwd(), 'templates', 'mission-template.pdf');
    if (!fs.existsSync(templatePath)) {
      return res.status(500).send('PDF template not found');
    }

    const templateBytes = fs.readFileSync(templatePath);
    const pdfDoc = await PDFDocument.load(templateBytes);
    const pages = pdfDoc.getPages();
    const page = pages[0];

    // ✍️ Draw dynamic mission data
    const drawText = (text, x, y) => {
      page.drawText(String(text || ''), {
        x, y, size: 10,
      });
    };

    // ✅ Draw values on the template (adjust positions if needed)
    drawText(mission.orderNumber, 250, 715);                    // OMR n°
    drawText(mission.dateDepart?.split('T')[0], 460, 715);      // Date
    drawText(mission.driverName, 100, 685);                     // Chauffeur
    drawText(mission.carId, 310, 685);                          // Véhicule
    drawText(mission.sa, 460, 685);                             // SA

    if (Array.isArray(mission.missionType)) {
      if (mission.missionType.includes('malades')) drawText('✔', 85, 640);
      if (mission.missionType.includes('personnel')) drawText('✔', 165, 640);
      if (mission.missionType.includes('matériel')) drawText('✔', 250, 640);
      if (mission.missionType.includes('courrier')) drawText('✔', 340, 640);
    }

    drawText(mission.lieu || '-', 90, 610);                     // Itinéraire
    drawText(mission.heureDepart, 100, 580);                    // Heure départ
    drawText(mission.heureRetour, 240, 580);                    // Heure retour

    const h = Math.floor(mission.durationHours || 0);
    const m = Math.round(((mission.durationHours || 0) % 1) * 60);
    drawText(`${h} h ${m} min`, 370, 580);                      // Durée

    drawText(mission.kmDepart, 100, 555);                       // Index départ
    drawText(mission.kmRetour, 240, 555);                       // Index retour
    const kmDone = (mission.kmRetour ?? 0) - (mission.kmDepart ?? 0);
    drawText(kmDone, 370, 555);                                 // KM parcourus
    drawText(mission.dateRetour?.split('T')[0], 100, 530);      // Date retour

    const pdfBytes = await pdfDoc.save();

    // ✅ Set headers to force inline display or download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=mission_${mission.orderNumber}.pdf`);

    res.send(pdfBytes);
  } catch (err) {
    console.error('❌ PDF generation failed:', err);
    res.status(500).send('PDF generation error');
  }
});

module.exports = router;
