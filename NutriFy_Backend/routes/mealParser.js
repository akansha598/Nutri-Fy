const express = require("express");
const router = express.Router();
const { parseMealDescription } = require("../services/geminiService");
const { getNutritionFromAPI } = require("../services/nutritionService");
// No longer need AIMeal model for this route
// const AIMeal = require("../models/AiMeal"); 
const { getFoodData, appendFoodToCSV } = require("../utils/loadDataset");

/**
 * POST /api/parse-meal-description
 * Parses a meal description, fetches nutrition, and updates the CSV dataset if new foods are found.
 * Does NOT save anything to MongoDB.
 */
router.post("/", async (req, res) => {
  try {
    const { description, mealType, email } = req.body; 

    if (!description || description.trim().length === 0) {
      return res.status(400).json({ error: "Description cannot be empty" });
    }
    // Email is no longer required for saving, but keep if you need it for logging
    // if (!email) {
    //   return res.status(400).json({ error: "Email is required" });
    // }

    const parsedItems = await parseMealDescription(description, mealType);

    if (!parsedItems || parsedItems.length === 0) {
      return res.json({
        items: [],
        message: "No foods detected.",
        original_description: description
      });
    }

    const matchedItems = [];
    const currentDataset = getFoodData(); 

    // 2. Process each food item, update CSV if new
    for (const item of parsedItems) {
      try {
        const nutrition = await getNutritionFromAPI(item.food_name, item.quantity, item.unit);
        const data = nutrition.full_dataset_record || {};

        const searchName = item.food_name.trim().toLowerCase();
        const existsInCSV = currentDataset.find(f => 
          f.Food_Item && f.Food_Item.trim().toLowerCase() === searchName
        );

        // If food not in CSV, append it (dataset upgrade)
        if (!existsInCSV && nutrition.full_dataset_record) {
          console.log(`✨ New component detected: ${item.food_name}. Upgrading CSV...`);
          
          const newRecord = {
            ...nutrition.full_dataset_record,
            Food_Item: item.food_name,
            Meal_Type: mealType || "Any"
          };
          await appendFoodToCSV(newRecord);
        }

        // Build nutrition object for response (no DB save)
        matchedItems.push({
          parsed_food_name: item.food_name,
          quantity: item.quantity,
          unit: item.unit,
          description: item.description,
          confidence: item.confidence,
          nutrition: {
            calories: data["Calories (kcal)"] || 0,
            protein: data["Protein (g)"] || 0,
            carbs: data["Carbohydrates (g)"] || 0,
            fat: data["Fat (g)"] || 0,
            fiber: data["Fiber (g)"] || 0,
            sugars: data["Sugars (g)"] || 0,
            sodium: data["Sodium (mg)"] || 0,
            cholesterol: data["Cholesterol (mg)"] || 0,
            weight_g: data["Weight_per_Unit_g"] || data.weight_g || 0,
            water_ml: data["Water_Intake (ml)"] || 0,
            calcium_mg: data.calcium_mg || 0,
            iron_mg: data.iron_mg || 0,
            magnesium_mg: data.magnesium_mg || 0,
            phosphorus_mg: data.phosphorus_mg || 0,
            potassium_mg: data.potassium_mg || 0,
            zinc_mg: data.zinc_mg || 0,
            vit_a_mcg: data.vitamin_a_mcg || 0,
            vit_c_mg: data.vitamin_c_mg || 0,
            vit_d_mcg: data.vitamin_d_mcg || 0,
            vit_e_mg: data.vitamin_e_mg || 0,
            vit_k_mcg: data.vitamin_k_mcg || 0,
            vit_b1_mg: data.vitamin_b1_mg || 0,
            vit_b2_mg: data.vitamin_b2_mg || 0,
            vit_b3_mg: data.vitamin_b3_mg || 0,
            vit_b6_mg: data.vitamin_b6_mg || 0,
            vit_b12_mcg: data.vitamin_b12_mcg || 0,
            folate_mcg: data.folate_mcg || 0,
            saturated_fat: data.saturated_fat_g || 0,
            monounsaturated_fat: data.monounsaturated_fat_g || 0,
            polyunsaturated_fat: data.polyunsaturated_fat_g || 0,
            trans_fat: data.trans_fat_g || 0,
            omega_3: data.omega_3_g || 0,
            omega_6: data.omega_6_g || 0
          },
          source: existsInCSV ? "local_dataset" : "USDA_API"
        });

      } catch (error) {
        console.error(`Error processing ${item.food_name}:`, error.message);
        continue;
      }
    }

    // ✅ Return response without saving to MongoDB
    res.json({
      success: true,
      // No mealId because nothing was saved
      total_calories: matchedItems.reduce((sum, item) => sum + (item.nutrition.calories || 0), 0),
      items: matchedItems,
      original_description: description,
      update_status: "Dataset synced for all components (no database save)"
    });

  } catch (error) {
    console.error("Meal Parser Error:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});

module.exports = router;