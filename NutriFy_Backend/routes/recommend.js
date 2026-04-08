const express = require("express");
const router = express.Router();
const axios = require("axios");

const Meal = require("../models/Meal");
const User = require("../models/User");
const { calculateAverage } = require("../utils/nutrition");

router.post("/", async (req, res) => {
  try {
    // ✅ 1. Only email is required from the frontend now
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // ✅ 2. Get user from DB and verify they exist
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ 3. Get last 7 meals to calculate the current eating average
    const meals = await Meal.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(7);

    if (meals.length === 0) {
      return res.status(400).json({ 
        message: "Please log at least one meal to get a recommendation." 
      });
    }

    // ✅ 4. Calculate avg nutrition from the history
    const avg = calculateAverage(meals);

    // ✅ 5. Call FastAPI using data fetched FROM THE DATABASE
    // We pull health_condition, weight, etc., directly from the 'user' object
    const response = await axios.post("http://127.0.0.1:8000/recommend", {
      health_condition: user.health_condition,
      weight_kg: user.weight_kg,
      height_cm: user.height_cm,
      age: user.age,
      gender: user.gender,
      avg: avg
    });

    // 6. Return the combined ML + Baseline response to the frontend
    res.json(response.data);

  } catch (err) {
    // Log the error for debugging (check your terminal)
    console.error("Recommendation Error:", err.message);
    
    if (err.code === 'ECONNREFUSED') {
      return res.status(503).json({ error: "FastAPI server is not running" });
    }
    
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;