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

    // 3. Create user with new health metrics
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

// 🔐 LOGIN
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

    // 4. Return token + FULL user profile for frontend recommendation engine
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        health_condition: user.health_condition,
        weight_kg: user.weight_kg,
        height_cm: user.height_cm,
        age: user.age,
        gender: user.gender
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔓 SIGNOUT
router.post("/signout", (req, res) => {
  try {
    // Note: If using JWT in LocalStorage, the frontend simply deletes the token.
    res.status(200).json({ message: "User signed out successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;