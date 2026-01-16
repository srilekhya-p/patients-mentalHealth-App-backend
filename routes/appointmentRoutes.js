// C:\Users\chett\Downloads\patients-mentalHealth-App-backend\routes\appointmentRoutes.js
const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');

// Create new appointment
router.post('/', appointmentController.createAppointment);

// Get all appointments for a user (frontend expects this)
router.get('/:userId', appointmentController.getAppointmentsForUser);

// (Optional) Get one appointment by its appointment id
router.get('/id/:id', appointmentController.getAppointmentById);

// Update appointment by appointment id
router.put('/:id', appointmentController.updateAppointment);

// Delete appointment by appointment id
router.delete('/:id', appointmentController.deleteAppointment);

module.exports = router;
