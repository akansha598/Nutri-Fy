const axios = require("axios");

// USDA API configuration
const USDA_API_KEY = process.env.USDA_API_KEY || "Lta2m54lMWHbahwLHZri8kxjwGVaAsGBTeUHpUMO";
const USDA_BASE_URL = "https://api.nal.usda.gov/fdc/v1/foods/search";

/**
 * Main wrapper: fetch nutrition from USDA → fallback to basic estimate
 */
async function getNutritionFromAPI(foodName, quantity, unit) {
  console.log(`🔍 Fetching nutrition for: ${quantity} ${unit} ${foodName} from USDA`);

  try {
    const nutrition = await getNutritionFromUSDA(foodName, quantity, unit);
    return {
      calories: nutrition.calories || 0,
      protein: nutrition.protein || 0,
      carbs: nutrition.carbs || 0,
      fat: nutrition.fat || 0,
      fiber: nutrition.fiber || 0,
      sodium: nutrition.sodium || 0,
      weight_g: nutrition.weight_g || 0,
      full_dataset_record: nutrition.full_dataset_record || null
    };
  } catch (error) {
    console.error("USDA API Error:", error.message);
    console.warn(`Falling back to basic estimate for ${foodName}`);
    const basic = getBasicNutritionEstimate(foodName, quantity, unit);
    return {
      ...basic,
      full_dataset_record: null
    };
  }
}

/**
 * Fetch nutrition data from USDA FoodData Central API
 * Returns a full 40+ attribute record matching the dataset columns
 */
async function getNutritionFromUSDA(foodName, quantity, unit) {
  // Search for the food
  const searchUrl = `${USDA_BASE_URL}?api_key=${USDA_API_KEY}&query=${encodeURIComponent(foodName)}&pageSize=1`;
  const searchRes = await axios.get(searchUrl);

  if (!searchRes.data.foods || searchRes.data.foods.length === 0) {
    throw new Error(`No USDA record found for "${foodName}"`);
  }

  const food = searchRes.data.foods[0];
  const nutrients = food.foodNutrients || [];

  // Helper: find nutrient by name
  const getNutrient = (name) => {
    const n = nutrients.find(n => n.nutrientName.toLowerCase() === name.toLowerCase());
    return n ? n.value : 0;
  };

  // Map USDA nutrient names to our fields
  const calories = getNutrient("Energy");
  const protein = getNutrient("Protein");
  const carbs = getNutrient("Carbohydrate, by difference");
  const fat = getNutrient("Total lipid (fat)");
  const fiber = getNutrient("Fiber, total dietary");
  const sugars = getNutrient("Sugars, total including NLEA");
  const sodium = getNutrient("Sodium, Na");
  const cholesterol = getNutrient("Cholesterol");

  // Micronutrients
  const calcium = getNutrient("Calcium, Ca");
  const iron = getNutrient("Iron, Fe");
  const magnesium = getNutrient("Magnesium, Mg");
  const phosphorus = getNutrient("Phosphorus, P");
  const potassium = getNutrient("Potassium, K");
  const zinc = getNutrient("Zinc, Zn");
  const vitaminA = getNutrient("Vitamin A, RAE");
  const vitaminC = getNutrient("Vitamin C, total ascorbic acid");
  const vitaminD = getNutrient("Vitamin D (D2 + D3)");
  const vitaminE = getNutrient("Vitamin E (alpha-tocopherol)");
  const vitaminK = getNutrient("Vitamin K (phylloquinone)");
  const thiamin = getNutrient("Thiamin");
  const riboflavin = getNutrient("Riboflavin");
  const niacin = getNutrient("Niacin");
  const vitaminB6 = getNutrient("Vitamin B-6");
  const vitaminB12 = getNutrient("Vitamin B-12");
  const folate = getNutrient("Folate, total");
  
  // Fats breakdown
  const saturatedFat = getNutrient("Fatty acids, total saturated");
  const monounsaturatedFat = getNutrient("Fatty acids, total monounsaturated");
  const polyunsaturatedFat = getNutrient("Fatty acids, total polyunsaturated");
  const transFat = getNutrient("Fatty acids, total trans");
  const omega3 = getNutrient("Omega-3 fatty acids") || getNutrient("18:3 n-3 c,c,c (Alpha-Linolenic)") || 0;
  const omega6 = getNutrient("Omega-6 fatty acids") || getNutrient("18:2 undifferentiated") || 0;

  // Weight per unit (default serving weight in grams)
  let weightPerUnit = food.servingSize ? parseFloat(food.servingSize) : 100;
  if (food.servingSizeUnit && food.servingSizeUnit.toLowerCase().includes("g")) {
    weightPerUnit = parseFloat(food.servingSize);
  } else if (food.servingSize && food.servingSizeUnit) {
    weightPerUnit = 100;
  }

  // Scale nutrients based on quantity and unit
  let multiplier = quantity;
  if (unit === 'bowl') multiplier = quantity * 1.5;
  else if (unit === 'cup') multiplier = quantity * 1.2;
  else if (unit === 'plate') multiplier = quantity * 2;
  else if (unit === 'unit') multiplier = quantity * 1;
  else if (unit === 'g' || unit === 'gram') multiplier = quantity / weightPerUnit;
  else multiplier = quantity; // assume quantity in servings

  const scale = multiplier;
  const scaled = (val) => parseFloat((val * scale).toFixed(2));

  // Build the full dataset record with EXACT column names (including spaces/parentheses)
  const fullRecord = {
    "Food_Item": food.description || foodName,
    "Category": food.foodCategory || "Unknown",
    "Calories (kcal)": scaled(calories),
    "Protein (g)": scaled(protein),
    "Carbohydrates (g)": scaled(carbs),
    "Fat (g)": scaled(fat),
    "Fiber (g)": scaled(fiber),
    "Sugars (g)": scaled(sugars),
    "Sodium (mg)": scaled(sodium),
    "Cholesterol (mg)": scaled(cholesterol),
    "Meal_Type": "Any",
    "Water_Intake (ml)": 0,                // fixed key name
    "Weight_per_Unit_g": weightPerUnit,
    "fiber_g": scaled(fiber),
    "sugar_g": scaled(sugars),
    "calcium_mg": scaled(calcium),
    "iron_mg": scaled(iron),
    "magnesium_mg": scaled(magnesium),
    "phosphorus_mg": scaled(phosphorus),
    "potassium_mg": scaled(potassium),
    "sodium_mg_detailed": scaled(sodium),
    "zinc_mg": scaled(zinc),
    "vitamin_a_mcg": scaled(vitaminA),
    "vitamin_b1_mg": scaled(thiamin),
    "vitamin_b2_mg": scaled(riboflavin),
    "vitamin_b3_mg": scaled(niacin),
    "vitamin_b6_mg": scaled(vitaminB6),
    "vitamin_b12_mcg": scaled(vitaminB12),
    "vitamin_c_mg": scaled(vitaminC),
    "vitamin_d_mcg": scaled(vitaminD),
    "vitamin_e_mg": scaled(vitaminE),
    "vitamin_k_mcg": scaled(vitaminK),
    "folate_mcg": scaled(folate),
    "saturated_fat_g": scaled(saturatedFat),
    "monounsaturated_fat_g": scaled(monounsaturatedFat),
    "polyunsaturated_fat_g": scaled(polyunsaturatedFat),
    "trans_fat_g": scaled(transFat),
    "cholesterol_mg_detailed": scaled(cholesterol),
    "omega_3_g": scaled(omega3),
    "omega_6_g": scaled(omega6)
  };

  // Return the same shape expected by getNutritionFromAPI
  return {
    calories: fullRecord["Calories (kcal)"],
    protein: fullRecord["Protein (g)"],
    carbs: fullRecord["Carbohydrates (g)"],
    fat: fullRecord["Fat (g)"],
    fiber: fullRecord["Fiber (g)"],
    sodium: fullRecord["Sodium (mg)"],
    weight_g: fullRecord["Weight_per_Unit_g"],
    full_dataset_record: fullRecord
  };
}

/**
 * Basic fallback estimates (kept from original)
 */
function getBasicNutritionEstimate(foodName, quantity, unit) {
  const food = foodName.toLowerCase();

  const nutritionData = {
    'chapatti': { calories: 120, protein: 3, carbs: 20, fat: 3, fiber: 2, sodium: 150 },
    'roti': { calories: 120, protein: 3, carbs: 20, fat: 3, fiber: 2, sodium: 150 },
    'naan': { calories: 150, protein: 4, carbs: 25, fat: 4, fiber: 1, sodium: 200 },
    'rice': { calories: 130, protein: 3, carbs: 28, fat: 0, fiber: 0, sodium: 0 },
    'dal': { calories: 120, protein: 7, carbs: 20, fat: 3, fiber: 4, sodium: 200 },
    'chicken': { calories: 165, protein: 25, carbs: 0, fat: 7, fiber: 0, sodium: 70 },
    'fish': { calories: 120, protein: 20, carbs: 0, fat: 5, fiber: 0, sodium: 60 },
    'bread': { calories: 80, protein: 3, carbs: 15, fat: 1, fiber: 1, sodium: 120 },
    'egg': { calories: 70, protein: 6, carbs: 1, fat: 5, fiber: 0, sodium: 60 },
    'banana': { calories: 105, protein: 1, carbs: 27, fat: 0, fiber: 3, sodium: 1 },
    'apple': { calories: 95, protein: 0, carbs: 25, fat: 0, fiber: 4, sodium: 2 },
    'orange': { calories: 60, protein: 1, carbs: 15, fat: 0, fiber: 3, sodium: 0 }
  };

  let baseNutrition = null;
  for (const [key, value] of Object.entries(nutritionData)) {
    if (food.includes(key)) {
      baseNutrition = value;
      break;
    }
  }
  if (!baseNutrition) {
    baseNutrition = { calories: 100, protein: 3, carbs: 15, fat: 4, fiber: 1, sodium: 50 };
  }

  let multiplier = quantity;
  if (unit === 'bowl') multiplier = quantity * 1.5;
  else if (unit === 'cup') multiplier = quantity * 1.2;
  else if (unit === 'plate') multiplier = quantity * 2;

  return {
    calories: Math.round(baseNutrition.calories * multiplier),
    protein: parseFloat((baseNutrition.protein * multiplier).toFixed(2)),
    carbs: parseFloat((baseNutrition.carbs * multiplier).toFixed(2)),
    fat: parseFloat((baseNutrition.fat * multiplier).toFixed(2)),
    fiber: parseFloat((baseNutrition.fiber * multiplier).toFixed(2)),
    sodium: Math.round(baseNutrition.sodium * multiplier),
    weight_g: 0,
    full_dataset_record: null
  };
}

module.exports = { getNutritionFromAPI };