const fs = require("fs");
const csv = require("csv-parser");

let foodData = [];

const loadDataset = () => {
  return new Promise((resolve, reject) => {
    fs.createReadStream("data/daily_food_nutrition_dataset.csv")
      .pipe(csv())
      .on("data", (row) => {
        foodData.push(row);
      })
      .on("end", () => {
        console.log("✅ Dataset loaded");
        resolve(foodData);
      })
      .on("error", reject);
  });
};

const getFoodData = () => foodData;

module.exports = { loadDataset, getFoodData };