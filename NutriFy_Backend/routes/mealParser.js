const express = require("express");
const router = express.Router();
const { parseMealDescription } = require("../services/geminiService");
const { getNutritionFromAPI } = require("../services/nutritionService");
const AIMeal = require("../models/AiMeal"); 
const { getFoodData, appendFoodToCSV } = require("../utils/loadDataset");

/**
 * POST /api/parse-meal-description
 */
router.post("/", async (req, res) => {
  try {
    const { description, mealType, email } = req.body; 

    if (!description || description.trim().length === 0) {
      return res.status(400).json({ error: "Description cannot be empty" });
    }
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // 1. Gemini breaks "Rajma Chawal" into [{food_name: "Rajma"}, {food_name: "Chawal"}]
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

    // 2. Loop through every item (Rajma, then Chawal)
    for (const item of parsedItems) {
      try {
        const nutrition = await getNutritionFromAPI(item.food_name, item.quantity, item.unit);
        const data = nutrition.full_dataset_record || {};

        // 3. Normalize name for search (removes extra spaces/case sensitivity)
        const searchName = item.food_name.trim().toLowerCase();

        const existsInCSV = currentDataset.find(f => 
          f.Food_Item && f.Food_Item.trim().toLowerCase() === searchName
        );

        // 4. If "Rajma" is missing, add it. Next iteration: if "Chawal" is missing, add it.
        if (!existsInCSV && nutrition.full_dataset_record) {
          console.log(`✨ New component detected: ${item.food_name}. Upgrading CSV...`);
          
          const newRecord = {
            ...nutrition.full_dataset_record,
            Food_Item: item.food_name, // Ensure the specific name is used
            Meal_Type: mealType || "Any"
          };

          await appendFoodToCSV(newRecord);
        }

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
          source: existsInCSV ? "local_dataset" : "gemini_ai"
        });

      } catch (error) {
        console.error(`Error processing ${item.food_name}:`, error.message);
        continue;
      }
    }

    // 5. Save to MongoDB
    let savedMeal = null;
    if (matchedItems.length > 0) {
      savedMeal = await AIMeal.create({
        email: email,
        original_description: description,
        mealType: mealType || "snack",
        items: matchedItems
      });
    }

    res.json({
      success: true,
      mealId: savedMeal ? savedMeal._id : null,
      total_calories: savedMeal ? savedMeal.total_calories : 0,
      items: matchedItems,
      original_description: description,
      update_status: "Dataset synced for all components"
    });

  } catch (error) {
    console.error("Meal Parser Error:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});

module.exports = router;