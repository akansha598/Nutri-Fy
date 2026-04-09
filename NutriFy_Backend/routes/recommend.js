const express = require("express");
const router = express.Router();
const axios = require("axios");

const Meal = require("../models/Meal");
const AiMeal = require("../models/AiMeal"); // Ensure this model exists and is imported
const User = require("../models/User");
const { calculateAverage } = require("../utils/nutrition");

router.post("/", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // 1. Get user details
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 2. Fetch history from BOTH schemas (limit to 7 documents each for a week of history)
    const [standardMeals, aiMeals] = await Promise.all([
      Meal.find({ userId: user._id }).sort({ createdAt: -1 }).limit(7),
      AiMeal.find({ email: email }).sort({ createdAt: -1 }).limit(7)
    ]);

    // Combine all history into one array for processing
    const allHistory = [...standardMeals, ...aiMeals];

    if (allHistory.length === 0) {
      return res.status(200).json({ 
        message: "Please log at least one meal so we can analyze your nutrient gaps.",
        isNewUser: true 
      });
    }

    // 3. Calculate dynamic average across all nutrients
    const avgIntake = calculateAverage(allHistory);

    // 4. Send the combined average and user data to FastAPI
    const response = await axios.post("http://127.0.0.1:8000/recommend", {
      health_condition: user.health_condition || user.healthCondition || "healthy",
      weight_kg: parseFloat(user.weight_kg || user.weight || 70),
      height_cm: parseFloat(user.height_cm || user.height || 170),
      age: parseInt(user.age || 25),
      gender: user.gender || "male",
      avg: avgIntake 
    });

    // 5. Return the smart diet plan to the frontend
    res.json(response.data);

  } catch (err) {
    console.error("Recommendation Error:", err.response?.data || err.message);
    
    if (err.code === 'ECONNREFUSED') {
      return res.status(503).json({ error: "FastAPI server is offline. Check your Python terminal." });
    }
    
    res.status(500).json({ error: "Internal Server Error in Recommendation Route" });
  }
});

module.exports = router;