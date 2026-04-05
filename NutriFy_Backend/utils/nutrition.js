const { getFoodData } = require("./loadDataset");

function calculateAverage(meals) {
  const data = getFoodData();
  let totalProtein = 0, totalCarbs = 0, totalFat = 0;

  // Use the length of the meals array for a daily average
  const dayCount = meals.length;

  if (dayCount === 0) return { protein: 0, carbs: 0, fat: 0 };

  meals.forEach(day => {
    ["breakfast", "lunch", "dinner"].forEach(mealType => {
      const foods = day[mealType];
      if (!foods) return;

      foods.forEach(foodItem => {
        const food = data.find(f => f["Food_Item"] === foodItem.item);
        if (food) {
          const qty = foodItem.quantity || 1;
          totalProtein += (+food["Protein (g)"]) * qty;
          totalCarbs += (+food["Carbohydrates (g)"]) * qty;
          totalFat += (+food["Fat (g)"]) * qty;
        }
      });
    });
  });

  return {
    protein: totalProtein / dayCount,
    carbs: totalCarbs / dayCount,
    fat: totalFat / dayCount
  };
}

module.exports = { calculateAverage };