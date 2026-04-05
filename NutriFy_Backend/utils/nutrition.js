const { getFoodData } = require("./loadDataset");

function calculateAverage(meals) {
  const data = getFoodData();

  let totalProtein = 0, totalCarbs = 0, totalFat = 0;
  let count = 0;

  meals.forEach(day => {
    ["breakfast", "lunch", "dinner"].forEach(meal => {
      const food = data.find(f => f["Food_Item"] === day[meal]);

      if (food) {
        totalProtein += +food["Protein (g)"];
        totalCarbs += +food["Carbohydrates (g)"];
        totalFat += +food["Fat (g)"];
        count++;
      }
    });
  });

  if (count === 0) {
    return { protein: 0, carbs: 0, fat: 0 };
  }

  return {
    protein: totalProtein / count,
    carbs: totalCarbs / count,
    fat: totalFat / count
  };
}

module.exports = { calculateAverage };