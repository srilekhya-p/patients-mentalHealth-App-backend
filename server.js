const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const appointmentRoutes = require('./routes/appointmentRoutes');


const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/appointments', appointmentRoutes);

// ✅ MongoDB connection
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const { upload } = require('./S3Setup');
const User = require("./models/User");


const medicationRoutes = require('./routes/medicationRoutes');
app.use('/medications', medicationRoutes);
app.use('/profile', require('./routes/profileRoutes'));


const medicalHistoryRoutes = require('./routes/medicalHistoryRoutes');
app.use('/medhistory', medicalHistoryRoutes);

const authRoutes = require("./routes/authRoutes");
const postRoutes = require('./routes/postRoutes');

app.use("/", authRoutes);
app.use('/posts', postRoutes);


app.listen(5100, () => console.log('✅ Server running on port 5100'));
