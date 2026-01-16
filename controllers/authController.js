const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// ------------------ LOGIN ------------------
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "User not found" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: "Invalid password" });

    const token = jwt.sign(
      { email: user.email },
      "secretkey",
      { expiresIn: "1h" }
    );

    return res.json({
      message: "Login successful",
      token,
      userId: user._id.toString(),
      name: user.name || ""
    });
  } catch (err) {
    console.log("Login Error:", err);
    return res.status(500).json({ error: "Login failed" });
  }
};

// ------------------ REGISTER ------------------
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, dob, height, weight } = req.body;

    // Check if user already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashed,
      dob,
      height,
      weight,
    });

    await newUser.save();

    return res.json({ message: "User registered successfully" });

  } catch (err) {
    console.log("Register Error:", err);
    return res.status(500).json({ error: "Registration failed" });
  }
};

