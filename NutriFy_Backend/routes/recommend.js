const express = require("express");
const router = express.Router();
const axios = require("axios");

const Meal = require("../models/Meal");
const User = require("../models/User");
const { calculateAverage } = require("../utils/nutrition");

// POST /api/recommend
router.post("/", async (req, res) => {
  try {
    const {
      email,
      health_condition,
      weight_kg,
      height_cm,
      age,
      gender
    } = req.body;

    // 1. Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 2. Get last 7 days meals
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    const meals = await Meal.find({
      userId: user._id,
      date: { $gte: last7Days }
    });

    if (meals.length === 0) {
      return res.status(400).json({ message: "No meals found for last 7 days" });
    }

    // 3. Calculate avg nutrition
    const avg = calculateAverage(meals);

    // 4. Call FastAPI ML
    const mlResponse = await axios.post("http://localhost:8000/recommend", {
      health_condition,
      weight_kg,
      height_cm,
      age,
      gender,
      avg
    });

    // 5. Return result
    res.json(mlResponse.data);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;