const express = require("express");
const router = express.Router();
const Meal = require("../models/Meal");
const AiMeal = require("../models/AiMeal"); 
const User = require("../models/User");
const { getFoodData } = require("../utils/loadDataset");

/**
 * GET /api/track/:email
 * Fetches and aggregates meal history from both AI and Manual logs
 */
router.get("/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const foodDataSet = getFoodData();

    // 1. Identify all nutrient columns dynamically from CSV
    const allColumns = Object.keys(foodDataSet[0]);
    const exclude = ["Food_Item", "Category", "Meal_Type", "displayString", "cleanName"];
    const nutrientColumns = allColumns.filter(col => !exclude.includes(col));

    // Mapping for AiMeal keys (Gemini API) to Dataset keys (CSV Columns)
    const fieldMapping = {
      "protein": "Protein (g)",
      "carbs": "Carbohydrates (g)",
      "fat": "Fat (g)",
      "calories": "Calories (kcal)",
      "fiber": "fiber_g"
    };

    // 2. Find the user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ error: "User not found" });

    // 3. Fetch from BOTH collections
    const [standardMeals, aiMeals] = await Promise.all([
      Meal.find({ userId: user._id }),
      AiMeal.find({ email: email.toLowerCase() })
    ]);

    const allDocs = [...standardMeals, ...aiMeals];

    // 4. GROUP BY DATE (Aggregation logic)
    const groupedByDate = {};

    allDocs.forEach((doc) => {
      // Normalize date to YYYY-MM-DD format
      const rawDate = doc.createdAt || doc.date || new Date();
      const dateKey = new Date(rawDate).toISOString().split('T')[0];

      // Initialize the day object if it doesn't exist
      if (!groupedByDate[dateKey]) {
        groupedByDate[dateKey] = {
          date: dateKey,
          totalDayNutrition: {},
          breakdown: { breakfast: [], lunch: [], dinner: [], ai_detected: [] },
          logCount: 0
        };
        nutrientColumns.forEach(col => groupedByDate[dateKey].totalDayNutrition[col] = 0);
      }

      groupedByDate[dateKey].logCount += 1;
      const isAiMeal = !!doc.items;

      // --- Logic for Standard Meal Schema (Manual) ---
      if (!isAiMeal) {
        ["breakfast", "lunch", "dinner"].forEach((type) => {
          if (doc[type] && Array.isArray(doc[type])) {
            doc[type].forEach((entry) => {
              const foodInfo = foodDataSet.find(f => f.Food_Item === entry.item);
              if (foodInfo) {
                const qty = entry.quantity || 1;
                const itemNutri = { item: entry.item, quantity: qty, source: "manual" };
                
                nutrientColumns.forEach(col => {
                  const val = parseFloat((foodInfo[col] * qty).toFixed(2)) || 0;
                  itemNutri[col] = val;
                  groupedByDate[dateKey].totalDayNutrition[col] += val;
                });
                groupedByDate[dateKey].breakdown[type].push(itemNutri);
              }
            });
          }
        });
      } 
      // --- Logic for AiMeal Schema (AI Parser) ---
      else {
        doc.items.forEach((item) => {
          const qty = item.quantity || 1;
          const itemNutri = { 
            item: item.parsed_food_name, 
            quantity: qty, 
            confidence: item.confidence,
            source: "ai" 
          };

          nutrientColumns.forEach(col => {
            const apiKey = Object.keys(fieldMapping).find(k => fieldMapping[k] === col);
            let val = 0;

            if (apiKey && item.nutrition && item.nutrition[apiKey] !== undefined) {
              val = parseFloat((item.nutrition[apiKey] * qty).toFixed(2));
            } else {
              // Fallback to dataset
              const fallback = foodDataSet.find(f => f.Food_Item === item.parsed_food_name);
              if (fallback) val = parseFloat((fallback[col] * qty).toFixed(2));
            }

            itemNutri[col] = val;
            groupedByDate[dateKey].totalDayNutrition[col] += val;
          });
          groupedByDate[dateKey].breakdown.ai_detected.push(itemNutri);
        });
      }
    });

    // 5. Finalize the History Array
    const detailedHistory = Object.values(groupedByDate).map(day => {
      // Round the totals for the day
      nutrientColumns.forEach(col => {
        day.totalDayNutrition[col] = parseFloat(day.totalDayNutrition[col].toFixed(2));
      });
      return day;
    });

    // Sort by date descending (Newest first)
    detailedHistory.sort((a, b) => new Date(b.date) - new Date(a.date));

    // 6. Calculate overall Averages based on unique days
    const uniqueDayCount = detailedHistory.length;
    let overallAvg = {};

    if (uniqueDayCount > 0) {
      const totals = detailedHistory.reduce((acc, day) => {
        nutrientColumns.forEach(col => {
          acc[col] = (acc[col] || 0) + day.totalDayNutrition[col];
        });
        return acc;
      }, {});

      nutrientColumns.forEach(col => {
        overallAvg[col] = parseFloat((totals[col] / uniqueDayCount).toFixed(2));
      });
    }

    res.json({
      userEmail: email,
      totalDaysTracked: uniqueDayCount,
      averages: overallAvg,
      history: detailedHistory
    });

  } catch (err) {
    console.error("Tracking Error:", err);
    res.status(500).json({ error: "Server error while fetching tracking data" });
  }
});

module.exports = router;