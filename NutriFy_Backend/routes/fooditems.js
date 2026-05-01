const express = require("express");
const router = express.Router();
const { getFoodData } = require("../utils/loadDataset");


// ======================================================
// GET FOOD LIST (YOUR EXISTING CODE - UNCHANGED LOGIC)
// ======================================================
router.get("/food-list", (req, res) => {
  try {
    const allFoods = getFoodData();

    const foodList = allFoods.map(f => {
      const name = f.Food_Item || "";
      const weight = f.Weight_per_Unit_g || "";

      return {
        cleanName: name,
        displayString: weight ? `${name} (${weight}g)` : name
      };
    }).filter(f => f.cleanName !== "");

    const uniqueList = Array.from(
      new Map(foodList.map(item => [item.cleanName, item])).values()
    );

    uniqueList.sort((a, b) => a.cleanName.localeCompare(b.cleanName));

    res.json(uniqueList);
  } catch (err) {
    console.error("Error generating food list:", err);
    res.status(500).json({ error: "Failed to fetch food list" });
  }
});


// ======================================================
// ✅ FIXED: FOOD NUTRIENTS API (IMPORTANT PART)
// ======================================================
router.get("/nutrients", (req, res) => {
  try {
    const { name } = req.query;

    if (!name) {
      return res.status(400).json({ error: "Food name is required" });
    }

    const allFoods = getFoodData();

    // ✅ SAFE SEARCH (fixes your bug)
    const food = allFoods.find((f) => {
      const foodName = f.Food_Item || "";

      return foodName
        .toLowerCase()
        .trim()
        .includes(name.toLowerCase().trim());
    });

    if (!food) {
      return res.status(404).json({ error: "Food not found" });
    }

    // ✅ RETURN MACRO + MICRO NUTRIENTS
    res.json({
      food: food.Food_Item,

      protein: food["Protein (g)"] || 0,
      carbs: food["Carbohydrates (g)"] || 0,
      fat: food["Fat (g)"] || 0,

      fiber_g: food["fiber_g"] || 0,
      iron_mg: food["iron_mg"] || 0,
      calcium_mg: food["calcium_mg"] || 0,
      vitamin_c_mg: food["vitamin_c_mg"] || 0,
      magnesium_mg: food["magnesium_mg"] || 0,
      potassium_mg: food["potassium_mg"] || 0,
      zinc_mg: food["zinc_mg"] || 0
    });

  } catch (err) {
    console.error("Error fetching nutrients:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;