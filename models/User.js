const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, unique: true },
  password: { type: String },
  dob: { type: String },
  height: { type: Number },
  weight: { type: Number },
  profileImage: { type: String, default: '' },
});

// Prevent OverwriteModelError
module.exports = mongoose.models.User || mongoose.model("User", UserSchema);
