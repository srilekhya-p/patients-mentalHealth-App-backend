const mongoose = require('mongoose');

const ReplySchema = new mongoose.Schema({
  userName: { type: String, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const PostSchema = new mongoose.Schema({
  userName: { type: String, required: true },
  message: { type: String, required: true },
  replies: [ReplySchema],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Post', PostSchema);
