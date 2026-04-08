const express = require("express");
const router = express.Router();
const { parseMealDescription } = require("../services/geminiService");
const { getNutritionFromAPI } = require("../services/nutritionService");

/**
 * POST /api/parse-meal-description
 * Parses text description and matches with food database
 */
router.post("/", async (req, res) => {
  try {
    const { description, mealType } = req.body;

    if (!description || description.trim().length === 0) {
      return res.status(400).json({ error: "Description cannot be empty" });
    }

    // 1. Call Gemini to extract foods
    const parsedItems = await parseMealDescription(description, mealType);

    if (!parsedItems || parsedItems.length === 0) {
      return res.json({
        items: [],
        message: "No foods detected in description. Please include actual food items like 'idli', 'rice', or 'dal'.",
        original_description: description
      });
    }

    // 2. Get nutrition data for each parsed food using API
    const matchedItems = [];

    for (const item of parsedItems) {
      try {
        // Get nutrition from API (Nutritionix or Gemini fallback)
        const nutrition = await getNutritionFromAPI(item.food_name, item.quantity, item.unit);

        matchedItems.push({
          parsed_food_name: item.food_name,
          quantity: item.quantity,
          unit: item.unit,
          description: item.description,
          confidence: item.confidence,
          nutrition: nutrition,
          source: "api" // Indicates this came from API, not dataset
        });
      } catch (error) {
        console.error(`Failed to get nutrition for ${item.food_name}:`, error.message);
        // Skip items we can't get nutrition for
        continue;
      }
    }

    res.json({
      items: matchedItems,
      original_description: description,
      total_items_parsed: parsedItems.length,
      total_items_matched: matchedItems.length,
      source: "api"
    });
  } catch (error) {
    console.error("Parse Error:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
