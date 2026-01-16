const express = require('express');
const router = express.Router();

const medicationController = require('../controllers/medicationController');

// ➤ Create Medication
router.post('/', medicationController.addMedication);

// ➤ Get Medications by user
router.get('/:userId', medicationController.getMedications);

// ➤ Update Medication
router.put('/:id', medicationController.updateMedication);

// ➤ Delete Medication
router.delete('/:id', medicationController.deleteMedication);

module.exports = router;