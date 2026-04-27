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
      return res.status(400).json({ error: "Email is required to identify the user" });
    }

    // 1. Find the user and update only the provided fields
    const updatedUser = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { 
        $set: { 
          // We use the short-hand to only update if the value exists in req.body
          ...(age && { age }),
          ...(weight_kg && { weight_kg }),
          ...(height_cm && { height_cm }),
          ...(health_condition && { health_condition })
        } 
      },
      { new: true, runValidators: true } // 'new' returns the updated doc, 'runValidators' checks schema rules
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        name: updatedUser.name,
        email: updatedUser.email,
        age: updatedUser.age,
        weight_kg: updatedUser.weight_kg,
        height_cm: updatedUser.height_cm,
        health_condition: updatedUser.health_condition
      }
    });

  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});

module.exports = router;