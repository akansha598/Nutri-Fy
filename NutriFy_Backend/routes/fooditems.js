const express = require("express");
const router = express.Router();
const { getFoodData } = require("../utils/loadDataset");

// GET: Fetch food names formatted for UI but distinct for DB
router.get("/food-list", (req, res) => {
  try {
    const allFoods = getFoodData();

    // 1. Map to an array of objects
    const foodList = allFoods.map(f => {
      const name = f.Food_Item || "";
      const weight = f.Weight_per_Unit_g || "";
      
      return {
        cleanName: name,
        displayString: weight ? `${name} (${weight}g)` : name
      };
    }).filter(f => f.cleanName !== ""); 

    // 2. Remove duplicates
    const uniqueList = Array.from(
      new Map(foodList.map(item => [item.cleanName, item])).values()
    );

    // 3. Sort alphabetically using the correct camelCase method
    uniqueList.sort((a, b) => a.cleanName.localeCompare(b.cleanName));

    res.json(uniqueList);
  } catch (err) {
    console.error("Error generating food list:", err);
    res.status(500).json({ error: "Failed to fetch food list" });
  }
});

module.exports = router;