const express = require("express");
const router = express.Router();
const Meal = require("../models/Meal");
const User = require("../models/User");
const { getFoodData } = require("../utils/loadDataset");

router.get("/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const foodDataSet = getFoodData();

    // 1. Find the user
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    // 2. Fetch all meals for this user, sorted by newest first
    const meals = await Meal.find({ userId: user._id }).sort({ createdAt: -1 });

    // 3. Process meals to include detailed nutrition per item
    const detailedMeals = meals.map((mealDoc) => {
      const processedMeal = {
        _id: mealDoc._id,
        date: mealDoc.createdAt,
        totalDayNutrition: { protein: 0, carbs: 0, fat: 0, calories: 0 },
        breakdown: { breakfast: [], lunch: [], dinner: [] }
      };

      // Helper to calculate nutrition for a specific meal type (breakfast, etc.)
      ["breakfast", "lunch", "dinner"].forEach((type) => {
        if (mealDoc[type]) {
          mealDoc[type].forEach((entry) => {
            // Find food in dataset
            const foodInfo = foodDataSet.find(f => f.Food_Item === entry.item);
            
            if (foodInfo) {
              const qty = entry.quantity || 1;
              const itemNutrition = {
                item: entry.item,
                quantity: qty,
                protein: parseFloat((foodInfo["Protein (g)"] * qty).toFixed(2)),
                carbs: parseFloat((foodInfo["Carbohydrates (g)"] * qty).toFixed(2)),
                fat: parseFloat((foodInfo["Fat (g)"] * qty).toFixed(2)),
                calories: parseFloat((foodInfo["Calories (kcal)"] * qty).toFixed(2))
              };

              // Add to the specific meal list
              processedMeal.breakdown[type].push(itemNutrition);

              // Add to day totals
              processedMeal.totalDayNutrition.protein += itemNutrition.protein;
              processedMeal.totalDayNutrition.carbs += itemNutrition.carbs;
              processedMeal.totalDayNutrition.fat += itemNutrition.fat;
              processedMeal.totalDayNutrition.calories += itemNutrition.calories;
            }
          });
        }
      });

      return processedMeal;
    });

    // 4. Calculate overall Average Intake across all logged days
    const dayCount = detailedMeals.length;
    const overallAvg = {
      avgProtein: 0,
      avgCarbs: 0,
      avgFat: 0,
      avgCalories: 0
    };

    if (dayCount > 0) {
      const totals = detailedMeals.reduce((acc, day) => {
        acc.p += day.totalDayNutrition.protein;
        acc.c += day.totalDayNutrition.carbs;
        acc.f += day.totalDayNutrition.fat;
        acc.cal += day.totalDayNutrition.calories;
        return acc;
      }, { p: 0, c: 0, f: 0, cal: 0 });

      overallAvg.avgProtein = (totals.p / dayCount).toFixed(2);
      overallAvg.avgCarbs = (totals.c / dayCount).toFixed(2);
      overallAvg.avgFat = (totals.f / dayCount).toFixed(2);
      overallAvg.avgCalories = (totals.cal / dayCount).toFixed(2);
    }

    res.json({
      userEmail: email,
      historyCount: dayCount,
      averages: overallAvg,
      meals: detailedMeals
    });

  } catch (err) {
    console.error("Tracking Error:", err.message);
    res.status(500).json({ error: "Server error while fetching tracking data" });
  }
});

module.exports = router;