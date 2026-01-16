
const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  specialization: { type: String, required: true },
  date: { type: String, required: true },        // YYYY-MM-DD
  time: { type: String, required: true },        // "08:00 AM"
  reminders: { type: [String], default: [] },
  notes: { type: String, default: '' },
  notificationIds: { type: [String], default: [] }, // ✅ NEW: Store notification IDs
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Appointment', AppointmentSchema);