const express = require("express");
const router = express.Router();
const Meal = require("../models/Meal");
const User = require("../models/User");

// Add meal
router.post("/add", async (req, res) => {
  try {
    const { email, breakfast, lunch, dinner } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const meal = new Meal({
      userId: user._id,

      // ✅ Directly store arrays
      breakfast,
      lunch,
      dinner
    });

    await meal.save();

    res.json({ message: "Meal saved successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Get last 7 days meals
router.get("/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    const meals = await Meal.find({
      userId,
      createdAt: { $gte: last7Days }
    });

    res.json(meals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;