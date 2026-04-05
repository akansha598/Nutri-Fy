const express = require("express");
const router = express.Router();
const axios = require("axios");

const Meal = require("../models/Meal");
const User = require("../models/User");
const { calculateAverage } = require("../utils/nutrition");

router.post("/", async (req, res) => {
  try {
    const { email, health_condition, weight_kg, height_cm, age, gender } = req.body;

    // 1. Get user
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // 2. Get last 7 meals
    const meals = await Meal.find({ userId: user._id }).sort({ createdAt: -1 }).limit(7);

    if (meals.length === 0) {
      return res.status(400).json({ message: "No meals found" });
    }

    // 3. Calculate avg nutrition
    const avg = calculateAverage(meals);

    // 4. Call FastAPI 🔥
    const response = await axios.post("http://127.0.0.1:8000/recommend", {
      health_condition,
      weight_kg,
      height_cm,
      age,
      gender,
      avg
    });

    // 5. Return ML response
    res.json(response.data);

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;