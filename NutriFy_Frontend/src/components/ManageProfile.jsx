import React from "react";
import { useNavigate } from "react-router-dom";

const ManageProfile = () => {
  const navigate = useNavigate();

  const handleReset = () => {
    alert("Reset Clicked!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-800 to-green-600 py-10 px-4">

      {/* GRID CONTAINER */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* 🔹 CARD 1: EDIT PROFILE */}
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">

          {/* Back Button */}
          <button
            onClick={() => navigate("/")}
            className="mb-4 text-sm text-green-700 hover:underline"
          >
            ← Back to Home
          </button>

          <h2 className="text-2xl font-bold text-green-700 mb-4">
            Edit Profile
          </h2>

          <p className="text-gray-600 mb-6">
            Update your personal details and manage your profile.
          </p>

          {/* Edit Button */}
          <button
            onClick={() => navigate("/edit-profile")}
            className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition mb-3"
          >
            Edit
          </button>

          {/* Reset Button */}
          <button
            onClick={handleReset}
            className="w-full bg-gray-300 text-black py-2 rounded-md hover:bg-gray-400 transition"
          >
            Reset
          </button>

        </div>

        {/* 🔹 CARD 2: TRACK PROFILE */}
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">

          <h2 className="text-2xl font-bold text-green-700 mb-4">
            Track My Profile
          </h2>

          <p className="text-gray-600 mb-6">
            Monitor your health, calories and daily nutrition.
          </p>

          <button
            onClick={() => navigate("/track-profile")}
            className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition"
          >
            View Tracking
          </button>

        </div>

        {/* 🔹 CARD 3: RECOMMENDATION */}
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">

          <h2 className="text-2xl font-bold text-green-700 mb-4">
            Recommendation
          </h2>

          <p className="text-gray-600 mb-6">
            Get AI-based diet suggestions tailored for you.
          </p>

          {/* ✅ Correct Navigation */}
          <button
            onClick={() => navigate("/recommendations")}
            className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition"
          >
            Get Recommendation
          </button>

        </div>

      </div>
    </div>
  );
};

export default ManageProfile;