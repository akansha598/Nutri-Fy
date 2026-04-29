const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");

const CSV_PATH = path.join(__dirname, "../data/detailed_food_nutrition.csv");
let foodData = [];

/**
 * Loads the initial dataset into memory
 */
const loadDataset = () => {
  foodData = []; // Reset array
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(CSV_PATH)) {
      console.warn("⚠️ CSV file not found at:", CSV_PATH);
      return resolve([]);
    }

    fs.createReadStream(CSV_PATH)
      .pipe(csv())
      .on("data", (row) => foodData.push(row))
      .on("end", () => {
        console.log(`✅ Dataset loaded: ${foodData.length} items`);
        resolve(foodData);
      })
      .on("error", (err) => reject(err));
  });
};

/**
 * Appends a new food item to the CSV file and updates the in-memory array
 */
const appendFoodToCSV = async (newFoodObj) => {
  const headers = [
    "Food_Item", "Category", "Calories (kcal)", "Protein (g)", "Carbohydrates (g)", 
    "Fat (g)", "Fiber (g)", "Sugars (g)", "Sodium (mg)", "Cholesterol (mg)", 
    "Meal_Type", "Water_Intake (ml)", "Weight_per_Unit_g", "fiber_g", "sugar_g", 
    "calcium_mg", "iron_mg", "magnesium_mg", "phosphorus_mg", "potassium_mg", 
    "sodium_mg_detailed", "zinc_mg", "vitamin_a_mcg", "vitamin_b1_mg", 
    "vitamin_b2_mg", "vitamin_b3_mg", "vitamin_b6_mg", "vitamin_b12_mcg", 
    "vitamin_c_mg", "vitamin_d_mcg", "vitamin_e_mg", "vitamin_k_mcg", 
    "folate_mcg", "saturated_fat_g", "monounsaturated_fat_g", 
    "polyunsaturated_fat_g", "trans_fat_g", "cholesterol_mg_detailed", 
    "omega_3_g", "omega_6_g"
  ];

  // 1. Prepare the row values based on headers
  const rowValues = headers.map(header => {
    let val = newFoodObj[header] ?? 0;
    // Handle cases where AI might return a string for a number field
    if (header !== "Food_Item" && header !== "Category" && header !== "Meal_Type") {
        val = parseFloat(val) || 0;
    }
    // Wrap strings with commas in quotes
    return typeof val === 'string' && val.includes(',') ? `"${val}"` : val;
  });

  // 2. Ensure we start on a new line and join values
  const csvLine = `\n${rowValues.join(",")}`;

  return new Promise((resolve, reject) => {
    // 3. Physical Write to File
    fs.appendFile(CSV_PATH, csvLine, (err) => {
      if (err) {
        console.error("❌ Failed to write to CSV:", err);
        return reject(err);
      }
      
      // 4. CRITICAL: Update the in-memory array so 'getFoodData()' 
      // returns the new item to the frontend immediately.
      foodData.push(newFoodObj);
      
      console.log(`📝 CSV & Memory Updated: ${newFoodObj.Food_Item} added successfully.`);
      resolve();
    });
  });
};

const getFoodData = () => foodData;

module.exports = { loadDataset, getFoodData, appendFoodToCSV };