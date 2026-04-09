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
  },
  source: {
    type: String,
    enum: ['manual', 'parsed'],
    default: 'manual'
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
  dinner: [foodSchema],

  // 🆕 Store original meal descriptions for parsing
  meal_descriptions: {
    breakfast_text: {
      type: String,
      default: ''
    },
    lunch_text: {
      type: String,
      default: ''
    },
    dinner_text: {
      type: String,
      default: ''
    }
  }

}, { timestamps: true });

module.exports = mongoose.model("Meal", mealSchema);