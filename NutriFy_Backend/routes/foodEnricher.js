const express = require("express");
const router = express.Router();
const { getNutritionFromAPI } = require("../services/nutritionService");
const { getFoodData, appendFoodToCSV } = require("../utils/loadDataset");

/**
 * POST /api/fooditems/enrich
 * Input: { "foodName": "Rajma", "mealType": "Lunch" }
 */
router.post("/enrich", async (req, res) => {
  try {
    const { foodName, mealType } = req.body;

    if (!foodName) {
      return res.status(400).json({ error: "foodName is required" });
    }

    // 1. Check if it already exists in your local dataset
    const currentDataset = getFoodData();
    const existingFood = currentDataset.find(
      (f) => f.Food_Item && f.Food_Item.toLowerCase() === foodName.toLowerCase()
    );

    if (existingFood) {
      return res.json({
        success: true,
        source: "local_dataset",
        data: existingFood
      });
    }

    // 2. If not found, "Enrich" it using Gemini
    console.log(`✨ ${foodName} not found. Enriching dataset via AI...`);
    
    // We assume quantity 1 and unit 'unit' or 'bowl' for the initial enrichment
    const nutrition = await getNutritionFromAPI(foodName, 1, "unit");

    if (!nutrition.full_dataset_record) {
      throw new Error("AI failed to generate a full nutritional profile.");
    }

    // 3. Prepare the record for the CSV
    const newRecord = {
      ...nutrition.full_dataset_record,
      Food_Item: foodName,
      Meal_Type: mealType || "Any"
    };

    // 4. Save to CSV and Memory (this uses the function we fixed earlier)
    await appendFoodToCSV(newRecord);

    res.json({
      success: true,
      source: "gemini_ai",
      message: "Dataset updated successfully",
      data: newRecord
    });

  } catch (error) {
    console.error("Enrichment Error:", error.message);
    res.status(500).json({ error: "Failed to enrich food item", details: error.message });
  }
});

module.exports = router;