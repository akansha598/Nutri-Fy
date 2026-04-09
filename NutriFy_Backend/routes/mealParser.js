const express = require("express");
const router = express.Router();
const { parseMealDescription } = require("../services/geminiService");
const { getNutritionFromAPI } = require("../services/nutritionService");
const AIMeal = require("../models/AiMeal"); 

/**
 * POST /api/parse-meal-description
 */
router.post("/", async (req, res) => {
  try {
    // 1. Extract data from request body
    const { description, mealType, email } = req.body; 

    // Validation
    if (!description || description.trim().length === 0) {
      return res.status(400).json({ error: "Description cannot be empty" });
    }
    if (!email) {
      return res.status(400).json({ error: "Email is required to save meal data" });
    }

    // 2. Call Gemini to extract foods
    const parsedItems = await parseMealDescription(description, mealType);

    if (!parsedItems || parsedItems.length === 0) {
      return res.json({
        items: [],
        message: "No foods detected in description.",
        original_description: description
      });
    }

    // 3. Get nutrition data for each parsed food
    const matchedItems = [];

    for (const item of parsedItems) {
      try {
        const nutrition = await getNutritionFromAPI(item.food_name, item.quantity, item.unit);

        matchedItems.push({
          parsed_food_name: item.food_name,
          quantity: item.quantity,
          unit: item.unit,
          description: item.description,
          confidence: item.confidence,
          nutrition: {
            calories: nutrition.calories || 0,
            protein: nutrition.protein || 0,
            carbs: nutrition.carbs || 0,
            fat: nutrition.fat || 0,
            fiber: nutrition.fiber || 0,
            servingSize: nutrition.servingSize,
            servingUnit: nutrition.servingUnit
          },
          source: "api"
        });
      } catch (error) {
        console.error(`Failed to get nutrition for ${item.food_name}:`, error.message);
        continue;
      }
    }

    // 4. Save the result to the Database using the EMAIL
    let savedMeal = null;
    if (matchedItems.length > 0) {
      savedMeal = await AIMeal.create({
        email: email, // Matches the schema field
        original_description: description,
        mealType: mealType || "snack",
        items: matchedItems
      });
    }

    // 5. Final Response
    res.json({
      success: true,
      mealId: savedMeal ? savedMeal._id : null,
      email: email,
      total_calories: savedMeal ? savedMeal.total_calories : 0,
      items: matchedItems,
      original_description: description
    });

  } catch (error) {
    console.error("Parse & Save Error:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});

module.exports = router;
