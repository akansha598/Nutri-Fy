const express = require("express");
const router = express.Router();
const User = require("../models/User");

/**
 * PATCH /api/auth/update-profile
 * Updates age, weight, height, and health_condition based on email
 */
router.patch("/update-profile", async (req, res) => {
  try {
    const { email, age, weight_kg, height_cm, health_condition } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // ✅ Build update object safely
    const updateFields = {};

    if (age !== undefined) updateFields.age = age;
    if (weight_kg !== undefined) updateFields.weight_kg = weight_kg;
    if (height_cm !== undefined) updateFields.height_cm = height_cm;
    if (health_condition !== undefined) updateFields.health_condition = health_condition;

    // ✅ Update user
    const updatedUser = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // ✅ Send updated user back
    res.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        name: updatedUser.name,
        email: updatedUser.email,
        age: updatedUser.age,
        weight: updatedUser.weight_kg, // ✅ match frontend
        height: updatedUser.height_cm,
        health_condition: updatedUser.health_condition
      }
    });

  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      details: error.message
    });
  }
});

module.exports = router;