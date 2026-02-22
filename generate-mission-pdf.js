const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');

async function generateMissionPDF(mission) {
  try {
    const templatePath = path.join(__dirname, 'templates', 'mission-template.pdf');
    console.log('📄 Looking for template at:', templatePath);

    if (!fs.existsSync(templatePath)) {
      console.error('🚫 PDF template not found at:', templatePath);
      throw new Error('Template file not found');
    }

    const existingPdfBytes = fs.readFileSync(templatePath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const draw = (text, x, y, size = 10) => {
      if (text !== undefined && text !== null && text !== '') {
        firstPage.drawText(String(text), {
          x, y, size, font, color: rgb(0, 0, 0),
        });
      }
    };

    console.log('🧾 Mission data:', mission);

    // Static text positions
  // ✅ Final fixed placements
draw(mission.orderNumber, 279, 645);        // OMR n°
draw(mission.dateDepart, 415, 645);         // Date
draw(mission.driverName, 80, 601);          // Chauffeur 
draw(mission.carId, 400, 601);              // Véhicule N°
draw(mission.sa, 493, 601);                 // SA

    draw(mission.lieu, 380, 495);                // Lieu
    draw(mission.missionZone, 320, 495);        // Zone

    draw(mission.heureDepart, 101, 472);         // Heure départ
    draw(mission.heureRetour, 281, 472);        // Heure retour
// ⏱ Format duration like "X h Y min"
if (mission.durationHours !== '' && mission.durationHours !== undefined) {
  const totalMinutes = Math.round(Number(mission.durationHours) * 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  draw(`${hours} h ${minutes} min`, 440, 472); // Durée
}

    draw((mission.kmDepart || 0) + ' KM', 120, 450.5);     // KM départ
   draw(mission.kmRetour !== '' && mission.kmRetour !== undefined ? `${mission.kmRetour} KM` : '', 299, 450.5);    // KM retour
   draw(mission.kmDone !== '' && mission.kmDone !== undefined ? `${mission.kmDone} KM` : '', 459, 450.5);       // KM total
    draw(mission.dateRetour, 101, 428);                   // Date retour

    // Checkboxes
    const types = (mission.missionType || []).map(t => t.toLowerCase());
    // ✅ Works with Helvetica (ASCII only)
if (types.includes('malades'))    draw('x', 140, 518);
if (types.includes('personnel')) draw('x', 270, 518);
if (types.includes('matériel'))  draw('x', 380, 518);
if (types.includes('courrier'))  draw('x', 520, 518);


    const pdfBytes = await pdfDoc.save();
    console.log('✅ PDF successfully generated');
    return pdfBytes;

  } catch (err) {
    console.error('❌ PDF generation error:', err.message);
    console.error(err.stack);
    throw new Error('Failed to generate PDF');
  }
}

module.exports = generateMissionPDF;
