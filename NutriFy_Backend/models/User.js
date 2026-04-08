const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    // 🔥 New Health & Physical Metrics
    health_condition: {
      type: String,
      required: true,
      default: "healthy",
      lowercase: true, // Ensures "Diabetes" becomes "diabetes" for your API logic
    },
    weight_kg: {
      type: Number,
      required: true,
    },
    height_cm: {
      type: Number,
      required: true,
    },
    age: {
      type: Number,
      required: true,
    },
    gender: {
      type: String,
      required: true,
      enum: ["male", "female", "other"], // Limits input to valid choices
      lowercase: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);