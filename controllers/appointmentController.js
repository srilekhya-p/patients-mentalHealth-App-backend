// C:\Users\chett\Downloads\patients-mentalHealth-App-backend\controllers\appointmentController.js
const Appointment = require('../models/Appointment');

// Create appointment
exports.createAppointment = async (req, res) => {
  try {
    console.log('[appointments] createAppointment payload:', req.body);
    const data = req.body;
    const appointment = new Appointment(data);
    await appointment.save();
    console.log('[appointments] saved id:', appointment._id.toString());
    res.status(201).json({ message: 'Appointment created', appointment });
  } catch (err) {
    console.error('Create appointment error:', err);
    res.status(500).json({ error: 'Failed to create appointment' });
  }
};

// Get all appointments for a user
exports.getAppointmentsForUser = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('[appointments] fetch for userId:', userId);
    const appointments = await Appointment.find({ userId }).sort({ date: 1, time: 1 });
    res.json({ appointments });
  } catch (err) {
    console.error('Fetch appointments error:', err);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
};

// Get single appointment by appointment id
exports.getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('[appointments] get by id:', id);
    const appointment = await Appointment.findById(id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    res.json(appointment);
  } catch (err) {
    console.error('Get appointment error:', err);
    res.status(500).json({ error: 'Failed to get appointment' });
  }
};

// Update appointment
exports.updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    console.log('[appointments] update id:', id, 'payload:', updateData);
    const updated = await Appointment.findByIdAndUpdate(id, updateData, { new: true });
    if (!updated) return res.status(404).json({ error: 'Appointment not found' });
    res.json({ message: 'Appointment updated', appointment: updated });
  } catch (err) {
    console.error('Update appointment error:', err);
    res.status(500).json({ error: 'Failed to update appointment' });
  }
};

// Delete appointment
exports.deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('[appointments] delete id:', id);
    await Appointment.findByIdAndDelete(id);
    res.json({ message: 'Appointment deleted' });
  } catch (err) {
    console.error('Delete appointment error:', err);
    res.status(500).json({ error: 'Failed to delete appointment' });
  }
};
