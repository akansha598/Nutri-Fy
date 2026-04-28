import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const Recommendation = () => {
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);

  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const res = await fetch("/api/recommend", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: currentUser?.email,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(
            data.error || data.message || "Failed to fetch recommendations"
          );
        }

        setRecommendations(data);
      } catch (err) {
        console.error("Recommendation Error:", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser?.email) {
      fetchRecommendations();
    } else {
      setError("User email not found. Please sign in again.");
      setLoading(false);
    }
  }, [currentUser]);

  return (
    <div className="min-h-screen bg-green-900 text-white px-4 py-10 flex flex-col items-center">
      
      {/* Back Button */}
      <button
        onClick={() => navigate("/manage-Profile")}
        className="mb-6 text-sm underline"
      >
        ← Back to Profile
      </button>

      <div className="bg-white text-black p-8 rounded-xl shadow-lg max-w-5xl w-full">
        
        {/* Heading */}
        <h1 className="text-4xl font-bold text-green-700 mb-8 text-center">
          Personalized AI Recommendations
        </h1>

        {/* Loading */}
        {loading && (
          <p className="text-center text-lg text-gray-600">
            Loading recommendations...
          </p>
        )}

        {/* Error */}
        {error && (
          <p className="text-center text-red-600 font-semibold">
            {error}
          </p>
        )}

        {/* New User */}
        {recommendations?.isNewUser && (
          <p className="text-center text-blue-600 font-medium">
            {recommendations.message}
          </p>
        )}

        {/* Main Recommendation Display */}
        {recommendations &&
          !loading &&
          !error &&
          !recommendations.isNewUser && (
            <div className="space-y-8">

              {/* Daily Macronutrient Targets */}
              {recommendations.final_target && (
                <div className="border p-6 rounded-lg shadow-sm">
                  <h2 className="text-2xl font-bold text-green-700 mb-4">
                    Daily Macronutrient Targets
                  </h2>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      Protein:{" "}
                      {recommendations.final_target.protein.toFixed(1)} g
                    </li>
                    <li>
                      Carbs:{" "}
                      {recommendations.final_target.carbs.toFixed(1)} g
                    </li>
                    <li>
                      Fat: {recommendations.final_target.fat.toFixed(1)} g
                    </li>
                  </ul>
                </div>
              )}

              {/* Nutrient Deficiencies */}
              {recommendations.deficiencies &&
                recommendations.deficiencies.length > 0 && (
                  <div className="border p-6 rounded-lg shadow-sm">
                    <h2 className="text-2xl font-bold text-green-700 mb-4">
                      Nutrient Deficiencies Detected
                    </h2>
                    <ul className="list-disc pl-6 space-y-2">
                      {recommendations.deficiencies.map((item, index) => (
                        <li key={index}>
                          ⚠️ {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              {/* Lifestyle Suggestions */}
              {recommendations.recommendations &&
                recommendations.recommendations.length > 0 && (
                  <div className="border p-6 rounded-lg shadow-sm">
                    <h2 className="text-2xl font-bold text-green-700 mb-4">
                      Lifestyle Suggestions
                    </h2>
                    <ul className="list-disc pl-6 space-y-3">
                      {recommendations.recommendations.map((tip, index) => (
                        <li key={index}>
                          ✅ {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              {/* Overall Health Strategy */}
              {recommendations.diet_plan?.overall_health_strategy && (
                <div className="border p-6 rounded-lg shadow-sm">
                  <h2 className="text-2xl font-bold text-green-700 mb-4">
                    Health Strategy
                  </h2>
                  <p>
                    {recommendations.diet_plan.overall_health_strategy}
                  </p>
                </div>
              )}

              {/* Vitamin Gap Warning */}
              {recommendations.diet_plan?.vitamin_gap_warning && (
                <div className="border p-6 rounded-lg shadow-sm">
                  <h2 className="text-2xl font-bold text-green-700 mb-4">
                    Vitamin Gap Warning
                  </h2>
                  <p>
                    {recommendations.diet_plan.vitamin_gap_warning}
                  </p>
                </div>
              )}

              {/* Meal Plan */}
              {recommendations.diet_plan?.daily_plan && (
                <div className="border p-6 rounded-lg shadow-sm">
                  <h2 className="text-2xl font-bold text-green-700 mb-6">
                    Suggested Daily Meal Plan
                  </h2>

                  {Object.entries(
                    recommendations.diet_plan.daily_plan
                  ).map(([mealType, mealData]) => (
                    <div key={mealType} className="mb-8">
                      <h3 className="text-xl font-semibold capitalize mb-3 text-green-600">
                        {mealType}
                      </h3>

                      <ul className="space-y-4">
                        {mealData.items.map((item, index) => (
                          <li
                            key={index}
                            className="border rounded-md p-4 bg-gray-50"
                          >
                            {/* ONLY FOOD NAME DISPLAYED, TYPE REMOVED */}
                            <p className="font-semibold">
                              {item.details.food}
                            </p>

                            {/* Reason remains same */}
                            <p className="text-sm text-gray-600">
                              {item.reason}
                            </p>

                            {/* Nutrition details */}
                            <div className="text-sm mt-2 text-gray-700">
                              Protein: {item.details.protein}g | Carbs:{" "}
                              {item.details.carbs}g | Fat:{" "}
                              {item.details.fat}g
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
      </div>
    </div>
  );
};

export default Recommendation;