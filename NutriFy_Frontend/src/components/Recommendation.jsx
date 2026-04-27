import React from "react";
import { useNavigate } from "react-router-dom";

const Recommendation = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-green-900 text-white px-4">

      {/* Back Button */}
      <button
        onClick={() => navigate("/profile")}
        className="mb-6 text-sm underline"
      >
        ← Back to Profile
      </button>

      {/* Page Content */}
      <div className="bg-white text-black p-8 rounded-xl shadow-lg text-center max-w-md w-full">
        <h1 className="text-3xl font-bold text-green-700 mb-4">
          Recommendation Page
        </h1>

        <p className="text-gray-600 mb-6">
          🎉 If you are seeing this page, navigation is working correctly!
        </p>

        <button
          onClick={() => alert("Future AI Recommendations will appear here")}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
        >
          Test Button
        </button>
      </div>
    </div>
  );
};

export default Recommendation;