const mongoose = require("mongoose");

// 🔥 Sub-schema for each food item
const foodSchema = new mongoose.Schema({
  item: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    default: 1
  }
});

const mealSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },

  // 🔥 Each meal is now an array of foods
  breakfast: [foodSchema],
  lunch: [foodSchema],
  dinner: [foodSchema]

}, { timestamps: true });

module.exports = mongoose.model("Meal", mealSchema);