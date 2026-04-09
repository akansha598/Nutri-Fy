const express = require("express");
const router = express.Router();
const Meal = require("../models/Meal");
const AiMeal = require("../models/AiMeal"); // ✅ Import AiMeal
const User = require("../models/User");
const { getFoodData } = require("../utils/loadDataset");

router.get("/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const foodDataSet = getFoodData();

    // 1. Identify all nutrient columns dynamically from CSV
    const allColumns = Object.keys(foodDataSet[0]);
    const exclude = ["Food_Item", "Category", "Meal_Type", "displayString", "cleanName"];
    const nutrientColumns = allColumns.filter(col => !exclude.includes(col));

    // Mapping for AiMeal keys (Gemini) to Dataset keys (CSV)
    const fieldMapping = {
      "protein": "Protein (g)",
      "carbs": "Carbohydrates (g)",
      "fat": "Fat (g)",
      "calories": "Calories (kcal)",
      "fiber": "fiber_g"
    };

    // 2. Find the user
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    // 3. ✅ Fetch from BOTH collections
    const [standardMeals, aiMeals] = await Promise.all([
      Meal.find({ userId: user._id }).sort({ createdAt: -1 }),
      AiMeal.find({ email: email }).sort({ createdAt: -1 })
    ]);

    // Combine them
    const allHistory = [...standardMeals, ...aiMeals];

    // 4. Process combined history
    const detailedHistory = allHistory.map((mealDoc) => {
      const isAiMeal = !!mealDoc.items; // Check if it's from AiMeal schema
      
      const processedMeal = {
        _id: mealDoc._id,
        date: mealDoc.createdAt || mealDoc.date,
        source: isAiMeal ? "AI Parser" : "Manual Log",
        totalDayNutrition: {},
        breakdown: isAiMeal ? { ai_detected: [] } : { breakfast: [], lunch: [], dinner: [] }
      };

      nutrientColumns.forEach(col => processedMeal.totalDayNutrition[col] = 0);

      // --- Logic for Standard Meal Schema ---
      if (!isAiMeal) {
        ["breakfast", "lunch", "dinner"].forEach((type) => {
          if (mealDoc[type]) {
            mealDoc[type].forEach((entry) => {
              const foodInfo = foodDataSet.find(f => f.Food_Item === entry.item);
              if (foodInfo) {
                const qty = entry.quantity || 1;
                const itemNutri = { item: entry.item, quantity: qty };
                
                nutrientColumns.forEach(col => {
                  const val = parseFloat((foodInfo[col] * qty).toFixed(2)) || 0;
                  itemNutri[col] = val;
                  processedMeal.totalDayNutrition[col] += val;
                });
                processedMeal.breakdown[type].push(itemNutri);
              }
            });
          }
        });
      } 
      
      // --- Logic for AiMeal Schema ---
      else {
        mealDoc.items.forEach((item) => {
          const qty = item.quantity || 1;
          const itemNutri = { 
            item: item.parsed_food_name, 
            quantity: qty,
            confidence: item.confidence 
          };

          nutrientColumns.forEach(col => {
            // Find if this CSV column is mapped to a Gemini API key
            const apiKey = Object.keys(fieldMapping).find(k => fieldMapping[k] === col);
            let val = 0;

            if (apiKey && item.nutrition && item.nutrition[apiKey] !== undefined) {
              val = parseFloat((item.nutrition[apiKey] * qty).toFixed(2));
            } else {
              // Fallback to dataset if AI nutrition for this specific column is missing
              const fallback = foodDataSet.find(f => f.Food_Item === item.parsed_food_name);
              if (fallback) val = parseFloat((fallback[col] * qty).toFixed(2));
            }

            itemNutri[col] = val;
            processedMeal.totalDayNutrition[col] += val;
          });
          processedMeal.breakdown.ai_detected.push(itemNutri);
        });
      }

      // Round daily totals
      nutrientColumns.forEach(col => {
        processedMeal.totalDayNutrition[col] = parseFloat(processedMeal.totalDayNutrition[col].toFixed(2));
      });

      return processedMeal;
    });

    // 5. Calculate overall Average Intake
    const dayCount = detailedHistory.length;
    let overallAvg = {};

    if (dayCount > 0) {
      const totals = detailedHistory.reduce((acc, day) => {
        nutrientColumns.forEach(col => {
          acc[col] = (acc[col] || 0) + day.totalDayNutrition[col];
        });
        return acc;
      }, {});

      nutrientColumns.forEach(col => {
        overallAvg[col] = parseFloat((totals[col] / dayCount).toFixed(2));
      });
    }

    // Sort combined list by date again to ensure mixed results are chronological
    detailedHistory.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({
      userEmail: email,
      historyCount: dayCount,
      averages: overallAvg,
      history: detailedHistory
    });

  } catch (err) {
    console.error("Tracking Error:", err);
    res.status(500).json({ error: "Server error while fetching tracking data" });
  }
});

module.exports = router;