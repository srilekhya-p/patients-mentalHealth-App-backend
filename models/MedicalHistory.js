const mongoose = require('mongoose');

// ✅ MedicalHistory Schema
const MedicalHistorySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  fileUrl: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});
module.exports= mongoose.model('MedicalHistory', MedicalHistorySchema);