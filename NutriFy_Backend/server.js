const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { loadDataset } = require("./utils/loadDataset");
const foodItemsRoute = require("./routes/fooditems"); // Adjust path if necessary
const trackMealRoutes = require("./routes/trackMeal");
const UpdateProfile = require("./routes/update_profile");


require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// ✅ Connect DB + Load Dataset + Start Server
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("MongoDB Connected");

    // 🔥 IMPORTANT: Load dataset before starting server
    await loadDataset();
    console.log("Dataset loaded");

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => console.log(err));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/meals", require("./routes/meal"));
app.use("/api/recommend", require("./routes/recommend"));
app.use("/api/fooditems", foodItemsRoute);
app.use("/api/track", trackMealRoutes);
app.use("/api/auth", UpdateProfile);
app.use("/api/parse-meal-description", require("./routes/mealParser"));