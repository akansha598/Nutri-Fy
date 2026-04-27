import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Helper functions
const formatValue = (value, decimals = 1) => {
  if (value === undefined || value === null || isNaN(value)) return "0";
  return Number(value).toFixed(decimals);
};

const getNutritionValue = (obj, key) => {
  if (!obj) return 0;
  return obj[key] || 0;
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

// Color palette
const COLORS = {
  primary: "#16a34a",
  secondary: "#15803d",
  accent: "#166534",
  protein: "#22c55e",
  carbs: "#3b82f6",
  fat: "#f59e0b",
  background: "#f0fdf4",
};

const PIE_COLORS = ["#22c55e", "#3b82f6", "#f59e0b"];

// Summary Card Component
const SummaryCard = ({ label, value, unit, icon }) => (
  <div className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition-shadow duration-300 border-l-4 border-green-500">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <p className="text-2xl font-bold text-gray-800 mt-1">
          {formatValue(value)}
          <span className="text-lg text-gray-500 ml-1">{unit}</span>
        </p>
      </div>
      <div className="text-3xl">{icon}</div>
    </div>
  </div>
);

// Meal Day Card Component
const MealDayCard = ({ dayData }) => {
  const [expanded, setExpanded] = useState(false);
  const nutrition = dayData.totalDayNutrition || {};

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden mb-4">
      {/* Daily Summary Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 p-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-white font-semibold">{formatDate(dayData.date)}</p>
            <p className="text-green-100 text-sm">
              Source: {dayData.source || "Manual"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-white font-bold text-xl">
              {formatValue(nutrition["Calories (kcal)"])} cal
            </p>
            <p className="text-green-100 text-sm">
              P: {formatValue(nutrition["Protein (g)"])}g • C:{" "}
              {formatValue(nutrition["Carbohydrates (g)"])}g • F:{" "}
              {formatValue(nutrition["Fat (g)"])}g
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        <div>
          <span className="text-gray-500">Fiber: </span>
          <span className="font-semibold">{formatValue(nutrition["Fiber (g)"])}g</span>
        </div>
        <div>
          <span className="text-gray-500">Sugar: </span>
          <span className="font-semibold">{formatValue(nutrition["Sugars (g)"])}g</span>
        </div>
        <div>
          <span className="text-gray-500">Sodium: </span>
          <span className="font-semibold">{formatValue(nutrition["Sodium (mg)"])}mg</span>
        </div>
        <div>
          <span className="text-gray-500">Water: </span>
          <span className="font-semibold">{formatValue(nutrition["Water_Intake (ml)"])}ml</span>
        </div>
      </div>

      {/* Expand Button */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full py-2 text-green-600 font-medium hover:bg-green-50 transition-colors border-t"
      >
        {expanded ? "▲ Hide Meal Breakdown" : "▼ View Meal Breakdown"}
      </button>

      {/* Expanded Meal Details */}
      {expanded && (
        <div className="p-4 bg-gray-50">
          {["breakfast", "lunch", "dinner"].map((mealType) => {
            const meals = dayData.breakdown?.[mealType] || [];
            if (meals.length === 0) return null;

            return (
              <div key={mealType} className="mb-4">
                <h4 className="font-semibold text-green-700 capitalize mb-2">
                  {mealType === "breakfast"
                    ? "🌅 Breakfast"
                    : mealType === "lunch"
                    ? "🍽️ Lunch"
                    : "🌙 Dinner"}
                </h4>
                <div className="space-y-2">
                  {meals.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-white p-3 rounded-lg shadow-sm flex justify-between items-center"
                    >
                      <div>
                        <p className="font-medium text-gray-800">{item.item}</p>
                        <p className="text-sm text-gray-500">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right text-sm">
                        <p className="text-orange-600">
                          {formatValue(item["Calories (kcal)"])} cal
                        </p>
                        <p className="text-gray-500">
                          P: {formatValue(item["Protein (g)"])}g • C:{" "}
                          {formatValue(item["Carbohydrates (g)"])}g • F:{" "}
                          {formatValue(item["Fat (g)"])}g
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Micronutrient Card Component
const MicronutrientCard = ({ label, value, unit, dailyValue }) => (
  <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
    <p className="text-sm text-gray-500 font-medium">{label}</p>
    <p className="text-lg font-bold text-gray-800">
      {formatValue(value)}
      <span className="text-sm text-gray-500 ml-1">{unit}</span>
    </p>
    {dailyValue && (
      <div className="mt-2">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full"
            style={{ width: `${Math.min((value / dailyValue) * 100, 100)}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-400 mt-1">{dailyValue}% of daily value</p>
      </div>
    )}
  </div>
);

// Insight Card Component
const InsightCard = ({ type, message }) => {
  const isWarning = type === "warning";
  const isSuccess = type === "success";

  return (
    <div
      className={`rounded-lg p-4 mb-3 ${
        isWarning
          ? "bg-amber-50 border-l-4 border-amber-500"
          : isSuccess
          ? "bg-green-50 border-l-4 border-green-500"
          : "bg-gray-50 border-l-4 border-gray-400"
      }`}
    >
      <p className={`${isWarning ? "text-amber-800" : isSuccess ? "text-green-800" : "text-gray-800"}`}>
        {isWarning && "⚠️ "}
        {isSuccess && "✅ "}
        {message}
      </p>
    </div>
  );
};

// Main TrackProfile Component
const TrackProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get user email from localStorage or use fallback
        const userEmail = localStorage.getItem("userEmail") || "ankita123@gmail.com";
        
        const response = await fetch(`http://localhost:5000/api/track/${userEmail}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch tracking data");
        }
        
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err.message || "Error connecting to server");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Generate health insights
  const getHealthInsights = () => {
    if (!data?.averages) return [];

    const avg = data.averages;
    const insights = [];

    if (getNutritionValue(avg, "Sodium (mg)") > 2300) {
      insights.push({
        type: "warning",
        message: "Your sodium intake is high. Try reducing processed and salty foods.",
      });
    }

    if (getNutritionValue(avg, "Water_Intake (ml)") < 2000) {
      insights.push({
        type: "warning",
        message: "Your water intake is low. Try drinking more water throughout the day.",
      });
    }

    if (getNutritionValue(avg, "Protein (g)") < 50) {
      insights.push({
        type: "warning",
        message: "Your protein intake is low. Add more protein-rich foods.",
      });
    }

    if (getNutritionValue(avg, "Fiber (g)") < 25) {
      insights.push({
        type: "warning",
        message: "Your fiber intake is low. Include fruits, vegetables, and whole grains.",
      });
    }

    if (getNutritionValue(avg, "Calories (kcal)") > 2500) {
      insights.push({
        type: "warning",
        message: "Your calorie intake is high. Monitor portion sizes.",
      });
    }

    if (insights.length === 0) {
      insights.push({
        type: "success",
        message: "Your nutrition pattern looks balanced based on current logs.",
      });
    }

    return insights;
  };

  // Prepare chart data
  const getCaloriesTrendData = () => {
    if (!data?.history) return [];
    return data.history
      .slice()
      .reverse()
      .map((item) => ({
        date: formatDate(item.date),
        calories: getNutritionValue(item.totalDayNutrition, "Calories (kcal)"),
      }));
  };

  const getMacroBarData = () => {
    if (!data?.history) return [];
    return data.history
      .slice()
      .reverse()
      .map((item) => ({
        date: formatDate(item.date),
        Protein: getNutritionValue(item.totalDayNutrition, "Protein (g)"),
        Carbohydrates: getNutritionValue(item.totalDayNutrition, "Carbohydrates (g)"),
        Fat: getNutritionValue(item.totalDayNutrition, "Fat (g)"),
      }));
  };

  const getMacroPieData = () => {
    if (!data?.averages) return [];
    return [
      { name: "Protein", value: getNutritionValue(data.averages, "Protein (g)") },
      { name: "Carbs", value: getNutritionValue(data.averages, "Carbohydrates (g)") },
      { name: "Fat", value: getNutritionValue(data.averages, "Fat (g)") },
    ];
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-600 mx-auto mb-4"></div>
          <p className="text-green-700 font-medium">Loading your profile data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => navigate("/manage-Profile")}
            className="mb-6 text-green-700 hover:underline flex items-center gap-2"
          >
            ← Back to Manage Profile
          </button>
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <p className="text-red-600 text-lg mb-4">⚠️ {error}</p>
            <p className="text-gray-600">
              No meal tracking history found. Start logging meals to see your nutrition dashboard.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // No data state
  if (!data || !data.history || data.history.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => navigate("/manage-Profile")}
            className="mb-6 text-green-700 hover:underline flex items-center gap-2"
          >
            ← Back to Manage Profile
          </button>
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <p className="text-gray-600 text-lg">
              No meal tracking history found. Start logging meals to see your nutrition dashboard.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const averages = data.averages || {};
  const historyCount = data.historyCount || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate("/manage-Profile")}
          className="mb-6 text-green-700 hover:underline flex items-center gap-2 font-medium"
        >
          ← Back to Manage Profile
        </button>

        {/* Header */}
        <div className="bg-gradient-to-r from-green-700 to-green-600 rounded-2xl shadow-lg p-6 mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Track My Profile
          </h1>
          <p className="text-green-100 text-lg">
            Monitor your calories, macros, micronutrients, and meal history.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <SummaryCard
            label="Total Logs"
            value={historyCount}
            unit=""
            icon="📊"
          />
          <SummaryCard
            label="Avg. Calories"
            value={getNutritionValue(averages, "Calories (kcal)")}
            unit="kcal"
            icon="🔥"
          />
          <SummaryCard
            label="Avg. Protein"
            value={getNutritionValue(averages, "Protein (g)")}
            unit="g"
            icon="🥩"
          />
          <SummaryCard
            label="Avg. Carbs"
            value={getNutritionValue(averages, "Carbohydrates (g)")}
            unit="g"
            icon="🍚"
          />
          <SummaryCard
            label="Avg. Fat"
            value={getNutritionValue(averages, "Fat (g)")}
            unit="g"
            icon="🧈"
          />
          <SummaryCard
            label="Avg. Water"
            value={getNutritionValue(averages, "Water_Intake (ml)")}
            unit="ml"
            icon="💧"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Calories Trend Chart */}
          <div className="bg-white rounded-xl shadow-md p-5">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              🔥 Calories Trend
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={getCaloriesTrendData()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="calories"
                  stroke="#16a34a"
                  strokeWidth={3}
                  dot={{ fill: "#16a34a", strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Macro Bar Chart */}
          <div className="bg-white rounded-xl shadow-md p-5">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              📊 Daily Macros
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={getMacroBarData()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                  }}
                />
                <Legend />
                <Bar dataKey="Protein" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Carbohydrates" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Fat" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Macro Distribution Pie Chart */}
        <div className="bg-white rounded-xl shadow-md p-5 mb-8">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            🍩 Macro Distribution (Average)
          </h3>
          <div className="flex flex-col md:flex-row items-center justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={getMacroPieData()}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {getMacroPieData().map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex gap-6 mt-4 md:mt-0">
              {getMacroPieData().map((entry, index) => (
                <div key={entry.name} className="text-center">
                  <div
                    className="w-4 h-4 rounded-full inline-block mr-2"
                    style={{ backgroundColor: PIE_COLORS[index] }}
                  ></div>
                  <span className="font-medium">{entry.name}:</span>
                  <span className="text-gray-600 ml-1">{formatValue(entry.value)}g</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Health Insights Section */}
        <div className="bg-white rounded-xl shadow-md p-5 mb-8">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            💡 Health Insights
          </h3>
          {getHealthInsights().map((insight, index) => (
            <InsightCard key={index} type={insight.type} message={insight.message} />
          ))}
        </div>

        {/* Micronutrient Section */}
        <div className="bg-white rounded-xl shadow-md p-5 mb-8">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            💊 Micronutrient Insights
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MicronutrientCard
              label="Calcium"
              value={getNutritionValue(averages, "calcium_mg")}
              unit="mg"
              dailyValue={100}
            />
            <MicronutrientCard
              label="Iron"
              value={getNutritionValue(averages, "iron_mg")}
              unit="mg"
              dailyValue={100}
            />
            <MicronutrientCard
              label="Magnesium"
              value={getNutritionValue(averages, "magnesium_mg")}
              unit="mg"
              dailyValue={100}
            />
            <MicronutrientCard
              label="Potassium"
              value={getNutritionValue(averages, "potassium_mg")}
              unit="mg"
              dailyValue={100}
            />
            <MicronutrientCard
              label="Vitamin A"
              value={getNutritionValue(averages, "vitamin_a_mcg")}
              unit="mcg"
              dailyValue={100}
            />
            <MicronutrientCard
              label="Vitamin B12"
              value={getNutritionValue(averages, "vitamin_b12_mcg")}
              unit="mcg"
              dailyValue={100}
            />
            <MicronutrientCard
              label="Vitamin C"
              value={getNutritionValue(averages, "vitamin_c_mg")}
              unit="mg"
              dailyValue={100}
            />
            <MicronutrientCard
              label="Vitamin D"
              value={getNutritionValue(averages, "vitamin_d_mcg")}
              unit="mcg"
              dailyValue={100}
            />
          </div>
        </div>

        {/* Meal History Section */}
        <div className="bg-white rounded-xl shadow-md p-5">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            📋 Meal History
          </h3>
          <div className="space-y-4">
            {data.history
              .slice()
              .reverse()
              .map((dayData, index) => (
                <MealDayCard key={index} dayData={dayData} />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackProfile;