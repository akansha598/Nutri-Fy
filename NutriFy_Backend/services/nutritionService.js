const axios = require("axios");

const NUTRITIONIX_APP_ID = process.env.NUTRITIONIX_APP_ID;
const NUTRITIONIX_APP_KEY = process.env.NUTRITIONIX_APP_KEY;
const NUTRITIONIX_BASE_URL = "https://trackapi.nutritionix.com/v2";

/**
 * Get nutrition data for a food item using Nutritionix API
 */
/**
 * Main wrapper to get nutrition data.
 * It prioritizes Gemini to ensure the full 40-attribute dataset 
 * record is available for the CSV upgrade logic.
 */
async function getNutritionFromAPI(foodName, quantity, unit) {
  try {
    console.log(`🔍 Fetching full nutritional profile for: ${quantity} ${unit} ${foodName}`);

    // Call Gemini for the detailed 40-attribute record
    const nutrition = await getNutritionFromGemini(foodName, quantity, unit);

    return {
      calories: nutrition.calories || 0,
      protein: nutrition.protein || 0,
      carbs: nutrition.carbs || 0,
      fat: nutrition.fat || 0,
      fiber: nutrition.fiber || 0,
      sodium: nutrition.sodium || 0,
      weight_g: nutrition.weight_g || 0,
      // Change: naming this 'full_dataset_record' to match mealParser.js logic
      full_dataset_record: nutrition.full_dataset_record || null 
    };

  } catch (error) {
    console.error("Critical Nutrition API Error:", error.message);
    const basic = getBasicNutritionEstimate(foodName, quantity, unit);
    return {
      ...basic,
      full_dataset_record: null
    };
  }
}

/**
 * Get nutrition data using Gemini AI estimation
 */
async function getNutritionFromGemini(foodName, quantity, unit) {
  try {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
// Use the v1beta endpoint with a modern model
// ✅ CHANGE THIS LINE
    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;    
    const prompt = `Estimate the full nutritional profile for ${quantity} ${unit} of ${foodName}.
    IMPORTANT: Return ONLY a valid JSON object. Do not include Markdown formatting or backticks. 
    Ensure every numeric field has a realistic value (do not return 0 unless the nutrient is actually absent).
    
    Keys to use:
    {
      "Food_Item": "${foodName}",
      "Weight_per_Unit_g": number,
      "Category": "string",
      "Calories (kcal)": number,
      "Protein (g)": number,
      "Carbohydrates (g)": number,
      "Fat (g)": number,
      "Fiber (g)": number,
      "Sugars (g)": number,
      "Sodium (mg)": number,
      "Cholesterol (mg)": number
    }`;

    const response = await axios.post(GEMINI_API_URL, {
      contents: [{ parts: [{ text: prompt }] }]
    });

    if (response.data.candidates && response.data.candidates[0].content) {
      let rawText = response.data.candidates[0].content.parts[0].text;
      
      // ✅ CLEANING: Remove markdown code blocks if present
      const cleanJson = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
      
      // Use regex to extract ONLY the part between the first { and last }
      const jsonMatch = cleanJson.match(/\{[\s\S]*\}/);

      // Inside getNutritionFromGemini, right after JSON.parse(jsonMatch[0])
      const n = JSON.parse(jsonMatch[0]);
      console.log("--------------------------");
      console.log("RAW AI DATA FOR", foodName, ":", n["Calories (kcal)"]); 
      console.log("--------------------------");

      if (jsonMatch) {
        const n = JSON.parse(jsonMatch[0]);
        
        console.log(`✅ Successfully fetched AI data for ${foodName}`);

        return {
          // Use the exact keys from the prompt
          calories: Math.round(n["Calories (kcal)"] || 0),
          protein: parseFloat(n["Protein (g)"] || 0),
          carbs: parseFloat(n["Carbohydrates (g)"] || 0),
          fat: parseFloat(n["Fat (g)"] || 0),
          fiber: parseFloat(n["Fiber (g)"] || 0),
          sodium: Math.round(n["Sodium (mg)"] || 0),
          full_dataset_record: n // Contains all 40 attributes
        };
      }
    }
    
    console.warn(`⚠️ Gemini returned unexpected format for ${foodName}, using fallback.`);
    return getBasicNutritionEstimate(foodName, quantity, unit);

  } catch (error) {
    console.error("Gemini Nutrition Error:", error.response?.data || error.message);
    return getBasicNutritionEstimate(foodName, quantity, unit);
  }
}

/**
 * Basic nutrition estimates for common foods when APIs fail
 */
function getBasicNutritionEstimate(foodName, quantity, unit) {
  const food = foodName.toLowerCase();

  // Basic nutrition database for common Indian foods
  const nutritionData = {
    'chapatti': { calories: 120, protein: 3, carbs: 20, fat: 3, fiber: 2, sodium: 150 },
    'roti': { calories: 120, protein: 3, carbs: 20, fat: 3, fiber: 2, sodium: 150 },
    'naan': { calories: 150, protein: 4, carbs: 25, fat: 4, fiber: 1, sodium: 200 },
    'rice': { calories: 130, protein: 3, carbs: 28, fat: 0, fiber: 0, sodium: 0 },
    'dal': { calories: 120, protein: 7, carbs: 20, fat: 3, fiber: 4, sodium: 200 },
    'dahl': { calories: 120, protein: 7, carbs: 20, fat: 3, fiber: 4, sodium: 200 },
    'lentils': { calories: 120, protein: 7, carbs: 20, fat: 3, fiber: 4, sodium: 200 },
    'chicken': { calories: 165, protein: 25, carbs: 0, fat: 7, fiber: 0, sodium: 70 },
    'fish': { calories: 120, protein: 20, carbs: 0, fat: 5, fiber: 0, sodium: 60 },
    'vegetables': { calories: 30, protein: 2, carbs: 6, fat: 0, fiber: 2, sodium: 20 },
    'salad': { calories: 20, protein: 1, carbs: 4, fat: 0, fiber: 1, sodium: 10 },
    'bread': { calories: 80, protein: 3, carbs: 15, fat: 1, fiber: 1, sodium: 120 },
    'potato': { calories: 90, protein: 2, carbs: 20, fat: 0, fiber: 2, sodium: 5 },
    'onion': { calories: 40, protein: 1, carbs: 9, fat: 0, fiber: 2, sodium: 5 },
    'tomato': { calories: 20, protein: 1, carbs: 4, fat: 0, fiber: 1, sodium: 5 },
    'egg': { calories: 70, protein: 6, carbs: 1, fat: 5, fiber: 0, sodium: 60 },
    'milk': { calories: 60, protein: 3, carbs: 5, fat: 3, fiber: 0, sodium: 45 },
    'yogurt': { calories: 60, protein: 4, carbs: 4, fat: 3, fiber: 0, sodium: 45 },
    'cheese': { calories: 110, protein: 7, carbs: 1, fat: 9, fiber: 0, sodium: 180 },
    'butter': { calories: 100, protein: 0, carbs: 0, fat: 11, fiber: 0, sodium: 90 },
    'oil': { calories: 120, protein: 0, carbs: 0, fat: 14, fiber: 0, sodium: 0 },
    'sugar': { calories: 20, protein: 0, carbs: 5, fat: 0, fiber: 0, sodium: 0 },
    'fruits': { calories: 60, protein: 1, carbs: 15, fat: 0, fiber: 2, sodium: 5 },
    'apple': { calories: 95, protein: 0, carbs: 25, fat: 0, fiber: 4, sodium: 2 },
    'banana': { calories: 105, protein: 1, carbs: 27, fat: 0, fiber: 3, sodium: 1 },
    'orange': { calories: 60, protein: 1, carbs: 15, fat: 0, fiber: 3, sodium: 0 }
  };

  // Try to find the food in our database
  let baseNutrition = null;
  for (const [key, value] of Object.entries(nutritionData)) {
    if (food.includes(key)) {
      baseNutrition = value;
      break;
    }
  }

  // If not found, use a generic estimate
  if (!baseNutrition) {
    baseNutrition = { calories: 100, protein: 3, carbs: 15, fat: 4, fiber: 1, sodium: 50 };
  }

  // Convert quantity based on unit
  let multiplier = quantity;
  if (unit === 'bowl') multiplier = quantity * 1.5; // Bowl = 1.5 servings
  if (unit === 'cup') multiplier = quantity * 1.2; // Cup = 1.2 servings
  if (unit === 'plate') multiplier = quantity * 2; // Plate = 2 servings

  return {
    calories: Math.round(baseNutrition.calories * multiplier),
    protein: parseFloat((baseNutrition.protein * multiplier).toFixed(2)),
    carbs: parseFloat((baseNutrition.carbs * multiplier).toFixed(2)),
    fat: parseFloat((baseNutrition.fat * multiplier).toFixed(2)),
    fiber: parseFloat((baseNutrition.fiber * multiplier).toFixed(2)),
    sodium: Math.round(baseNutrition.sodium * multiplier)
  };
}

module.exports = { getNutritionFromAPI };