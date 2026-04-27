const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// 🔐 SIGNUP
router.post("/signup", async (req, res) => {
  try {
    const { 
      name, 
      email, 
      password, 
      health_condition, 
      weight_kg, 
      height_cm, 
      age, 
      gender 
    } = req.body;

    // 1. Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      health_condition,
      weight_kg,
      height_cm,
      age,
      gender
    });

    res.status(201).json({ message: "User registered successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// 🔐 LOGIN (✅ FIXED HERE)
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // 2. Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // 3. Generate JWT
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // ✅ 4. RETURN DATA IN FRONTEND FRIENDLY FORMAT
    res.json({
      token,
      name: user.name,
      email: user.email,
      age: user.age,
      weight: user.weight_kg, // ✅ FIX: map weight_kg → weight
      height: user.height_cm,
      health_condition: user.health_condition,
      gender: user.gender
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// 🔓 SIGNOUT
router.post("/signout", (req, res) => {
  try {
    res.status(200).json({ message: "User signed out successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch("/reset-password", async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ error: "Email and new password are required" });
    }

    // 1. Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // 2. Update the user in the database
    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { $set: { password: hashedPassword } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ success: true, message: "Password reset successfully!" });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;