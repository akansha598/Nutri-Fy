const express = require("express");
const router = express.Router();
const Meal = require("../models/Meal");
const User = require("../models/User");
const { getFoodData } = require("../utils/loadDataset");

router.get("/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const foodDataSet = getFoodData();

    // 1. Identify all nutrient columns dynamically
    const allColumns = Object.keys(foodDataSet[0]);
    const exclude = ["Food_Item", "Category", "Meal_Type", "displayString", "cleanName"];
    const nutrientColumns = allColumns.filter(col => !exclude.includes(col));

    // 2. Find the user
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    // 3. Fetch all meals
    const meals = await Meal.find({ userId: user._id }).sort({ createdAt: -1 });

    // 4. Process meals to include detailed nutrition per item
    const detailedMeals = meals.map((mealDoc) => {
      const processedMeal = {
        _id: mealDoc._id,
        date: mealDoc.createdAt,
        totalDayNutrition: {}, // Will be filled dynamically
        breakdown: { breakfast: [], lunch: [], dinner: [] }
      };

      // Initialize totals for this specific day
      nutrientColumns.forEach(col => processedMeal.totalDayNutrition[col] = 0);

      ["breakfast", "lunch", "dinner"].forEach((type) => {
        if (mealDoc[type]) {
          mealDoc[type].forEach((entry) => {
            const foodInfo = foodDataSet.find(f => f.Food_Item === entry.item);
            
            if (foodInfo) {
              const qty = entry.quantity || 1;
              const itemNutrition = {
                item: entry.item,
                quantity: qty
              };

              // Map every nutrient from the dataset to this item
              nutrientColumns.forEach(col => {
                const value = parseFloat((foodInfo[col] * qty).toFixed(2)) || 0;
                itemNutrition[col] = value;
                // Add to the daily total
                processedMeal.totalDayNutrition[col] += value;
              });

              processedMeal.breakdown[type].push(itemNutrition);
            }
          });
        }
      });
      
      // Round the daily totals
      nutrientColumns.forEach(col => {
        processedMeal.totalDayNutrition[col] = parseFloat(processedMeal.totalDayNutrition[col].toFixed(2));
      });

      return processedMeal;
    });

    // 5. Calculate overall Average Intake across all logged days
    const dayCount = detailedMeals.length;
    let overallAvg = {};

    if (dayCount > 0) {
      // Sum up everything
      const totals = detailedMeals.reduce((acc, day) => {
        nutrientColumns.forEach(col => {
          acc[col] = (acc[col] || 0) + day.totalDayNutrition[col];
        });
        return acc;
      }, {});

      // Calculate the mean
      nutrientColumns.forEach(col => {
        overallAvg[col] = parseFloat((totals[col] / dayCount).toFixed(2));
      });
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