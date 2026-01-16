const mongoose = require('mongoose');

const MedicationSchema = new mongoose.Schema({
userId: { type: String, required: true },
drugName: { type: String, required: true },
dosage: { type: String, required: true },
type: { type: String, required: true },
time: { type: [String], required: true },
startDate: { type: String },
endDate: { type: String },
notes: { type: String },
createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Medication', MedicationSchema);