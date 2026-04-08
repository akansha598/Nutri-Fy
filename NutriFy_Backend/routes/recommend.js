const express = require("express");
const router = express.Router();
const axios = require("axios");

const Meal = require("../models/Meal");
const User = require("../models/User");
const { calculateAverage } = require("../utils/nutrition");

router.post("/", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // 1. Get user from DB
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 2. Fetch meals (Last 7 days to get a realistic moving average)
    const meals = await Meal.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(7);

    // If no meals, we can't calculate deficiencies
    if (meals.length === 0) {
      return res.status(200).json({ 
        message: "Please log at least one meal so we can analyze your nutrient gaps.",
        isNewUser: true 
      });
    }

    // 3. Calculate dynamic average (Macros + all Vitamins/Minerals)
    // This calls your updated nutrition.js which uses keys like "Protein (g)"
    const avgIntake = calculateAverage(meals);

    // 4. Call FastAPI
    // CRITICAL: Ensure these property names match your User Model exactly!
    // If your User model uses 'healthCondition', change user.health_condition to user.healthCondition
    const response = await axios.post("http://127.0.0.1:8000/recommend", {
      health_condition: user.health_condition || user.healthCondition || "healthy",
      weight_kg: parseFloat(user.weight_kg || user.weight),
      height_cm: parseFloat(user.height_cm || user.height),
      age: parseInt(user.age),
      gender: user.gender,
      avg: avgIntake // The full dynamic object
    });

    // 5. Send the structured "Daily Plan" back to React
    res.json(response.data);

  } catch (err) {
    console.error("Recommendation System Error:", err.response?.data || err.message);
    
    if (err.code === 'ECONNREFUSED') {
      return res.status(503).json({ error: "FastAPI server is not reachable. Is Uvicorn running?" });
    }
    
    res.status(500).json({ error: "Internal Server Error in Recommendation Route" });
  }
});

module.exports = router;