const express = require("express");
const router = express.Router();
const axios = require("axios");
const { appendFoodToCSV, getFoodData } = require("../utils/loadDataset");

// RapidAPI Credentials from your screenshot
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || "b89e845b2cmshb4d2d8752d347f7p1fe8dejsnea26af8c63d5";
const RAPIDAPI_HOST = "ind-nutrient-api1.p.rapidapi.com";

/**
 * POST /api/indian-enrich
 * Body: { "foodName": "Chole Bhature", "mealType": "Breakfast" }
 */
router.post("/", async (req, res) => {
  try {
    const { foodName, mealType } = req.body;

    if (!foodName) {
      return res.status(400).json({ error: "Food name is required" });
    }

    // 1. Check local dataset first to avoid duplicate API calls
    const currentDataset = getFoodData();
    const exists = currentDataset.find(f => f.Food_Item?.toLowerCase() === foodName.toLowerCase());
    if (exists) return res.json({ success: true, source: "local", data: exists });

    console.log(`🇮🇳 Searching Indian Database for: ${foodName}...`);

    // 2. Call Ind Nutrient API (Search by Name)
    // 2. Updated Call: Search all items and find the closest match
    const options = {
      method: 'GET',
      url: `https://${RAPIDAPI_HOST}/food`, // Changed from /food/name/ to /food
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': RAPIDAPI_HOST
      }
    };

    const response = await axios.request(options);
    
    // Search the array for an item whose name contains our foodName
    const apiData = response.data.find(item => 
      item.name.toLowerCase().includes(foodName.toLowerCase())
    );

    if (!apiData) {
      // If still not found, try searching for just the main keyword (e.g., "Bhaji")
      const fallbackName = foodName.split(" ").pop(); 
      const secondaryMatch = response.data.find(item => 
        item.name.toLowerCase().includes(fallbackName.toLowerCase())
      );
      
      if (!secondaryMatch) {
        return res.status(404).json({ error: `Could not find "${foodName}" in the Indian database.` });
      }
      // Use the secondary match if found
      apiData = secondaryMatch;
    }
    // 3. Map the API response to your 40+ column CSV format
    // Note: Adjust mapping based on the exact keys returned in the 'Results' tab of RapidAPI
    // 1. Define a helper to handle scaling and null values from the Indian API
const scale = 1; // Default to 100g reference from Indian API
const val = (item) => parseFloat((item || 0) * scale).toFixed(2);

const newRecord = {
    // Basic Information
    "Food_Item": foodName,
    "Category": apiData.category || "Indian Dish",
    "Meal_Type": mealType || "Any",
    "Weight_per_Unit_g": 100, // Standard reference for this API is 100g
    "Water_Intake (ml)": 0,

    // Primary Macros (CSV Main Columns)
    "Calories (kcal)": val(apiData.energy),
    "Protein (g)": val(apiData.protein),
    "Carbohydrates (g)": val(apiData.carbohydrate),
    "Fat (g)": val(apiData.fat),
    "Fiber (g)": val(apiData.fiber),
    "Sugars (g)": val(apiData.sugar),
    "Sodium (mg)": val(apiData.sodium),
    "Cholesterol (mg)": val(apiData.cholesterol),

    // Detailed Micro-nutrients (CSV Detailed Columns)
    "fiber_g": val(apiData.fiber),
    "sugar_g": val(apiData.sugar),
    "calcium_mg": val(apiData.calcium),
    "iron_mg": val(apiData.iron),
    "magnesium_mg": val(apiData.magnesium),
    "phosphorus_mg": val(apiData.phosphorus),
    "potassium_mg": val(apiData.potassium),
    "sodium_mg_detailed": val(apiData.sodium),
    "zinc_mg": val(apiData.zinc),
    
    // Vitamins
    "vitamin_a_mcg": val(apiData.vitamin_a),
    "vitamin_b1_mg": val(apiData.thiamin),
    "vitamin_b2_mg": val(apiData.riboflavin),
    "vitamin_b3_mg": val(apiData.niacin),
    "vitamin_b6_mg": val(apiData.vitamin_b6),
    "vitamin_b12_mcg": val(apiData.vitamin_b12),
    "vitamin_c_mg": val(apiData.vitamin_c),
    "vitamin_d_mcg": val(apiData.vitamin_d),
    "vitamin_e_mg": val(apiData.vitamin_e),
    "vitamin_k_mcg": val(apiData.vitamin_k),
    "folate_mcg": val(apiData.folate),

    // Fats Detailed
    "saturated_fat_g": val(apiData.saturated_fat),
    "monounsaturated_fat_g": val(apiData.monounsaturated_fat),
    "polyunsaturated_fat_g": val(apiData.polyunsaturated_fat),
    "trans_fat_g": val(apiData.trans_fat),
    "cholesterol_mg_detailed": val(apiData.cholesterol),
    "omega_3_g": val(apiData.omega_3) || 0,
    "omega_6_g": val(apiData.omega_6) || 0
};

    // 4. Append to your local CSV
    await appendFoodToCSV(newRecord);

    res.json({
      success: true,
      source: "IndNutrientAPI",
      data: newRecord
    });

  } catch (error) {
    console.error("Indian Enrichment Error:", error.message);
    res.status(500).json({ error: "Failed to fetch Indian food data" });
  }
});

module.exports = router;