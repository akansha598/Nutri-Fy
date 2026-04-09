const { getFoodData } = require("./loadDataset");

function calculateAverage(meals) {
  const data = getFoodData();
  const dayCount = meals.length;

  if (dayCount === 0) return {};

  // 1. Identify all nutrient columns dynamically from the CSV headers
  const allColumns = Object.keys(data[0]);
  const exclude = ["Food_Item", "Category", "Meal_Type", "displayString", "cleanName"];
  const nutrientColumns = allColumns.filter(col => !exclude.includes(col));

  // 2. Initialize totals
  let totals = {};
  nutrientColumns.forEach(col => { totals[col] = 0; });

  // 3. Mapping for Gemini API fields (from MongoDB) to Dataset keys (from CSV)
  const fieldMapping = {
    "protein": "Protein (g)",
    "carbs": "Carbohydrates (g)",
    "fat": "Fat (g)",
    "calories": "Calories (kcal)",
    "fiber": "fiber_g"
  };

  // 4. Sum everything up
  meals.forEach(mealDoc => {
    let itemsToProcess = [];

    // ✅ CHECK: Is it a Standard Meal Schema?
    if (mealDoc.breakfast || mealDoc.lunch || mealDoc.dinner) {
      ["breakfast", "lunch", "dinner"].forEach(type => {
        if (mealDoc[type] && Array.isArray(mealDoc[type])) {
          itemsToProcess.push(...mealDoc[type]);
        }
      });
    } 
    // ✅ CHECK: Is it an AiMeal Schema?
    else if (mealDoc.items && Array.isArray(mealDoc.items)) {
      itemsToProcess = mealDoc.items;
    }

    itemsToProcess.forEach(foodItem => {
      const qty = foodItem.quantity || 1;

      // Scenario A: Item has a pre-populated 'nutrition' object (from Gemini/External API)
      if (foodItem.nutrition) {
        nutrientColumns.forEach(col => {
          // Find if the CSV column (e.g., "Protein (g)") has a mapped API key (e.g., "protein")
          const apiKey = Object.keys(fieldMapping).find(k => fieldMapping[k] === col);
          if (apiKey && foodItem.nutrition[apiKey] !== undefined) {
            totals[col] += (parseFloat(foodItem.nutrition[apiKey]) || 0) * qty;
          }
        });
      } 
      // Scenario B: No nutrition data, search by name in the CSV dataset
      else {
        const foodName = foodItem.item || foodItem.parsed_food_name;
        const foodFromDb = data.find(f => f["Food_Item"] === foodName);
        
        if (foodFromDb) {
          nutrientColumns.forEach(col => {
            const val = parseFloat(foodFromDb[col]) || 0;
            totals[col] += val * qty;
          });
        }
      }
    });
  });

  // 5. Calculate averages and round to 2 decimal places
  let averages = {};
  nutrientColumns.forEach(col => {
    averages[col] = dayCount > 0 ? parseFloat((totals[col] / dayCount).toFixed(2)) : 0;
  });

  return averages;
}

module.exports = { calculateAverage };