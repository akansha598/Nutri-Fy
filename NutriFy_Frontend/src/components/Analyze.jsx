import React, { useState, useEffect, useRef } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid,
} from "recharts";

const Analyze = () => {
  const [foodName, setFoodName] = useState("");
  const [mealType, setMealType] = useState("Breakfast");

  const [foodList, setFoodList] = useState([]);
  const [filteredFoods, setFilteredFoods] = useState([]);

  const [foodData, setFoodData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [error, setError] = useState("");

  const dropdownRef = useRef(null);

  const COLORS = ["#16a34a", "#22c55e", "#4ade80", "#86efac"];

  // ✅ Load food list
  useEffect(() => {
    const fetchFoodList = async () => {
      try {
        const baseUrl = process.env.REACT_APP_API_URL || '';
        const res = await fetch(`${baseUrl}/api/fooditems/food-list`);
        const data = await res.json();

        if (res.ok) {
          setFoodList(data);
        }
      } catch (err) {
        console.error("Food list fetch error:", err.message);
      }
    };

    fetchFoodList();
  }, []);

  // ✅ Search suggestions
  useEffect(() => {
    if (!foodName.trim()) {
      setFilteredFoods([]);
      return;
    }

    setSuggestLoading(true);

    const timer = setTimeout(() => {
      const filtered = foodList
        .filter((item) =>
          item.cleanName.toLowerCase().includes(foodName.toLowerCase())
        )
        .slice(0, 8);

      setFilteredFoods(filtered);
      setSuggestLoading(false);
    }, 200);

    return () => clearTimeout(timer);
  }, [foodName, foodList]);

  // ✅ Hide dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setFilteredFoods([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Analyze nutrients
  const handleAnalyze = async () => {
    try {
      setError("");
      setFoodData(null);
      setLoading(true);

      if (!foodName.trim()) {
        setLoading(false);
        return setError("Please enter a food name");
      }

      const baseUrl = process.env.REACT_APP_API_URL || '';
      const res = await fetch(`${baseUrl}/api/enrich/enrich`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          foodName,
          mealType,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Food analysis failed");
      }

      setFoodData(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Add food manually
  const handleAddToDataset = async () => {
    try {
      setError("");
      setLoading(true);

      if (!foodName.trim()) {
        setLoading(false);
        return setError("Please enter a food name first");
      }

      const baseUrl = process.env.REACT_APP_API_URL || '';
      const res = await fetch(`${baseUrl}/api/enrich/enrich`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          foodName,
          mealType,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to add food to dataset");
      }

      alert("✅ Food successfully added to dataset!");
      setFoodData(data.data);

      
      const updatedRes = await fetch(
        `${baseUrl}/api/fooditems/food-list`
      );
      const updatedData = await updatedRes.json();

      if (updatedRes.ok) {
        setFoodList(updatedData);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Macronutrient Data
  const macroData = foodData
    ? [
        {
          name: "Protein",
          value: parseFloat(foodData["Protein (g)"]) || 0,
        },
        {
          name: "Carbs",
          value: parseFloat(foodData["Carbohydrates (g)"]) || 0,
        },
        {
          name: "Fat",
          value: parseFloat(foodData["Fat (g)"]) || 0,
        },
      ]
    : [];

  // ✅ Micronutrient Data
  const microData = foodData
    ? [
        {
          name: "Calcium",
          value: parseFloat(foodData.calcium_mg) || 0,
        },
        {
          name: "Iron",
          value: parseFloat(foodData.iron_mg) || 0,
        },
        {
          name: "Magnesium",
          value: parseFloat(foodData.magnesium_mg) || 0,
        },
        {
          name: "Potassium",
          value: parseFloat(foodData.potassium_mg) || 0,
        },
        {
          name: "Vitamin C",
          value: parseFloat(foodData.vitamin_c_mg) || 0,
        },
      ]
    : [];

  const pieData = macroData.filter((item) => item.value > 0);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-green-900 text-white px-4 py-10">
      <div className="bg-white text-black p-8 rounded-xl shadow-lg max-w-6xl w-full">

        <h1 className="text-4xl font-bold text-green-700 mb-8 text-center">
          Nutrient Analysis Dashboard
        </h1>

        {/* Search Section */}
        <div className="relative mb-4" ref={dropdownRef}>
          <label className="block font-semibold mb-2">
            Search Food Item
          </label>

          <div className="relative">
            <input
              type="text"
              placeholder="Type food name..."
              value={foodName}
              onChange={(e) => setFoodName(e.target.value)}
              className="border p-3 w-full rounded pr-10"
            />

            <span className="absolute right-3 top-3 text-gray-500 text-lg">
              ▼
            </span>
          </div>

          {filteredFoods.length > 0 && (
            <ul className="absolute z-10 bg-white border w-full mt-1 rounded max-h-60 overflow-y-auto shadow-lg">
              {filteredFoods.map((item, index) => (
                <li
                  key={index}
                  onClick={() => {
                    setFoodName(item.cleanName);
                    setFilteredFoods([]);
                  }}
                  className="p-2 hover:bg-green-100 cursor-pointer"
                >
                  {item.displayString}
                </li>
              ))}
            </ul>
          )}

          {suggestLoading && (
            <p className="text-sm text-gray-500 mt-1">
              Searching...
            </p>
          )}
        </div>

        {/* Meal Type */}
        <div className="mb-4">
          <label className="block font-semibold mb-2">
            Select Meal Type
          </label>

          <select
            value={mealType}
            onChange={(e) => setMealType(e.target.value)}
            className="border p-3 w-full rounded"
          >
            <option value="Breakfast">Breakfast</option>
            <option value="Lunch">Lunch</option>
            <option value="Dinner">Dinner</option>
          </select>
        </div>

        {/* Buttons */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <button
            onClick={handleAnalyze}
            className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700"
          >
            Analyze Nutrients
          </button>

          <button
            onClick={handleAddToDataset}
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700"
          >
            Add This Food To Dataset
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <p className="mt-4 text-blue-600 font-semibold text-center">
            Processing...
          </p>
        )}

        {/* Error */}
        {error && (
          <p className="text-red-500 mt-4 text-center">{error}</p>
        )}

        {/* Results */}
        {foodData && !loading && (
          <div className="space-y-8">

            {/* Food Overview */}
            <div className="border p-6 rounded-lg shadow-md bg-green-50">
              <h2 className="text-3xl font-bold text-green-700 mb-2">
                {foodData.Food_Item}
              </h2>
              <p><strong>Category:</strong> {foodData.Category}</p>
              <p><strong>Meal Type:</strong> {foodData.Meal_Type}</p>
              <p><strong>Calories:</strong> {foodData["Calories (kcal)"]} kcal</p>
              <p><strong>Weight:</strong> {foodData.Weight_per_Unit_g} g</p>
              <p><strong>Water Intake:</strong> {foodData["Water_Intake (ml)"]} ml</p>
            </div>

            {/* Macronutrient Bar Chart */}
            <div className="border p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold text-green-700 mb-4">
                Macronutrient Breakdown
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={macroData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#16a34a" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Micronutrient Bar Chart */}
            <div className="border p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold text-green-700 mb-4">
                Micronutrient Levels
              </h2>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={microData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#2563eb" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Pie Chart */}
            <div className="border p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold text-green-700 mb-4">
                Macronutrient Distribution
              </h2>

              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={120}
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {pieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-gray-500">
                  No macronutrient data available
                </p>
              )}
            </div>

            {/* Additional Nutritional Details */}
            <div className="border p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold text-green-700 mb-4">
                Additional Nutritional Details
              </h2>

              <div className="grid md:grid-cols-2 gap-4">
                <p><strong>Fiber:</strong> {foodData["Fiber (g)"]} g</p>
                <p><strong>Sugars:</strong> {foodData["Sugars (g)"]} g</p>
                <p><strong>Sodium:</strong> {foodData["Sodium (mg)"]} mg</p>
                <p><strong>Cholesterol:</strong> {foodData["Cholesterol (mg)"]} mg</p>
                <p><strong>Zinc:</strong> {foodData.zinc_mg} mg</p>
                <p><strong>Vitamin D:</strong> {foodData.vitamin_d_mcg} mcg</p>
                <p><strong>Vitamin B6:</strong> {foodData.vitamin_b6_mg} mg</p>
                <p><strong>Vitamin B12:</strong> {foodData.vitamin_b12_mcg} mcg</p>
                <p><strong>Folate:</strong> {foodData.folate_mcg} mcg</p>
                <p><strong>Saturated Fat:</strong> {foodData.saturated_fat_g} g</p>
                <p><strong>Omega 3:</strong> {foodData.omega_3_g} g</p>
                <p><strong>Omega 6:</strong> {foodData.omega_6_g} g</p>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default Analyze;