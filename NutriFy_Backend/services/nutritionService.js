const axios = require("axios");

const NUTRITIONIX_APP_ID = process.env.NUTRITIONIX_APP_ID;
const NUTRITIONIX_APP_KEY = process.env.NUTRITIONIX_APP_KEY;
const NUTRITIONIX_BASE_URL = "https://trackapi.nutritionix.com/v2";

/**
 * Get nutrition data for a food item using Nutritionix API
 */
async function getNutritionFromAPI(foodName, quantity, unit) {
  try {
    if (!NUTRITIONIX_APP_ID || !NUTRITIONIX_APP_KEY) {
      // Fallback to Gemini AI estimation
      return await getNutritionFromGemini(foodName, quantity, unit);
    }

    const response = await axios.post(
      `${NUTRITIONIX_BASE_URL}/natural/nutrients`,
      {
        query: `${quantity} ${unit} ${foodName}`,
        timezone: "US/Eastern"
      },
      {
        headers: {
          "x-app-id": NUTRITIONIX_APP_ID,
          "x-app-key": NUTRITIONIX_APP_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    if (response.data.foods && response.data.foods.length > 0) {
      const food = response.data.foods[0];
      return {
        calories: Math.round(food.nf_calories || 0),
        protein: parseFloat((food.nf_protein || 0).toFixed(2)),
        carbs: parseFloat((food.nf_total_carbohydrate || 0).toFixed(2)),
        fat: parseFloat((food.nf_total_fat || 0).toFixed(2)),
        fiber: parseFloat((food.nf_dietary_fiber || 0).toFixed(2)),
        sodium: Math.round(food.nf_sodium || 0)
      };
    }

    // If no results, fallback to Gemini
    return await getNutritionFromGemini(foodName, quantity, unit);

  } catch (error) {
    console.error("Nutritionix API Error:", error.message);
    // Fallback to Gemini AI estimation
    return await getNutritionFromGemini(foodName, quantity, unit);
  }
}

/**
 * Get nutrition data using Gemini AI estimation
 */
async function getNutritionFromGemini(foodName, quantity, unit) {
  try {
    const axios = require("axios");
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

    if (!GEMINI_API_KEY) {
      return getBasicNutritionEstimate(foodName, quantity, unit);
    }

    const prompt = `Estimate the nutrition facts for: ${quantity} ${unit} of ${foodName}

Return ONLY a JSON object with these exact fields:
{
  "calories": number,
  "protein": number (grams),
  "carbs": number (grams),
  "fat": number (grams),
  "fiber": number (grams),
  "sodium": number (mg)
}

Use realistic nutritional data based on standard food databases. Be accurate and conservative with estimates.`;

    const response = await axios.post(
      GEMINI_API_URL,
      {
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ]
      },
      {
        headers: { "x-goog-api-key": GEMINI_API_KEY }
      }
    );

    if (!response.data.candidates || response.data.candidates.length === 0) {
      return getBasicNutritionEstimate(foodName, quantity, unit);
    }

    const rawText = response.data.candidates[0].content.parts[0].text;
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      console.error("Failed to parse Gemini response:", rawText);
      return getBasicNutritionEstimate(foodName, quantity, unit);
    }

    const nutrition = JSON.parse(jsonMatch[0]);
    return {
      calories: Math.round(nutrition.calories || 0),
      protein: parseFloat((nutrition.protein || 0).toFixed(2)),
      carbs: parseFloat((nutrition.carbs || 0).toFixed(2)),
      fat: parseFloat((nutrition.fat || 0).toFixed(2)),
      fiber: parseFloat((nutrition.fiber || 0).toFixed(2)),
      sodium: Math.round(nutrition.sodium || 0)
    };

  } catch (error) {
    console.error("Gemini nutrition estimation error:", error.message);
    // Fallback to basic estimates
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