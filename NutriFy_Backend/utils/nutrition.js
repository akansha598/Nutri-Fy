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

  // 3. Sum everything up
  meals.forEach(day => {
    ["breakfast", "lunch", "dinner"].forEach(mealType => {
      const foods = day[mealType];
      if (!foods) return;

      foods.forEach(foodItem => {
        const food = data.find(f => f["Food_Item"] === foodItem.item);
        if (food) {
          const qty = foodItem.quantity || 1;
          nutrientColumns.forEach(col => {
            const val = parseFloat(food[col]) || 0;
            totals[col] += val * qty;
          });
        }
      });
    });
  });

  // 4. Calculate averages and round to 2 decimal places
  let averages = {};
  nutrientColumns.forEach(col => {
    averages[col] = parseFloat((totals[col] / dayCount).toFixed(2));
  });

  return averages;
}

module.exports = { calculateAverage };