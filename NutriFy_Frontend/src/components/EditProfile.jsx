import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { signInSuccess } from "../redux/user/userSlice";

const EditProfile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { currentUser } = useSelector((state) => state.user);

  const [user, setUser] = useState({
    name: "",
    email: "",
    age: "",
    weight: "",
    height: "",
    health_condition: ""
  });

  // ✅ Prefill from Redux
  useEffect(() => {
    if (currentUser) {
      setUser({
        name: currentUser.name || "",
        email: currentUser.email || "",
        age: currentUser.age || "",
        weight: currentUser.weight || "",
        height: currentUser.height || "",
        health_condition: currentUser.health_condition
          ? currentUser.health_condition.toLowerCase().replace(" ", "_")
          : ""
      });
    }
  }, [currentUser]);

  // ✅ Handle input
  const handleChange = (e) => {
    setUser({
      ...user,
      [e.target.name]: e.target.value,
    });
  };

  // ✅ Save to backend + Redux
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const baseUrl = process.env.REACT_APP_API_URL || '';
      const res = await fetch(`${baseUrl}/api/auth/update-profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user.email,
          age: user.age,
          weight_kg: user.weight,
          height_cm: user.height,
          health_condition: user.health_condition
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Update failed");
        return;
      }

      // ✅ Update Redux with new data
      dispatch(signInSuccess(data.user));

      alert("Profile Updated Successfully!");

      // ✅ Navigate back
      navigate("/manage-Profile");

    } catch (err) {
      console.error(err);
      alert("Something went wrong!");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-900 px-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">

        <button
          onClick={() => navigate("/manage-Profile")}
          className="mb-4 text-sm text-green-700 hover:underline"
        >
          ← Back
        </button>

        <h2 className="text-2xl font-bold text-center text-green-700 mb-6">
          Edit Profile
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={user.name}
              disabled
              className="w-full border px-4 py-2 rounded-md bg-gray-100 cursor-not-allowed"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={user.email}
              disabled
              className="w-full border px-4 py-2 rounded-md bg-gray-100 cursor-not-allowed"
            />
          </div>

          {/* Age */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Age
            </label>
            <input
              type="number"
              name="age"
              value={user.age}
              onChange={handleChange}
              className="w-full border px-4 py-2 rounded-md"
            />
          </div>

          {/* Weight */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Weight (kg)
            </label>
            <input
              type="number"
              name="weight"
              value={user.weight}
              onChange={handleChange}
              className="w-full border px-4 py-2 rounded-md"
            />
          </div>

          {/* Height */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Height (cm)
            </label>
            <input
              type="number"
              name="height"
              value={user.height}
              onChange={handleChange}
              className="w-full border px-4 py-2 rounded-md"
            />
          </div>

          {/* Health Condition */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Health Condition
            </label>

            <select
              name="health_condition"
              value={user.health_condition}
              onChange={handleChange}
              className="w-full border px-4 py-2 rounded-md"
            >
              <option value="">Select Health Condition</option>
              <option value="healthy">Healthy</option>
              <option value="diabetes">Diabetes</option>
              <option value="pcod">PCOD</option>
              <option value="pcos">PCOS</option>
              <option value="hypertension">Hypertension</option>
              <option value="bp">High BP</option>
              <option value="obesity">Obesity</option>
              <option value="underweight">Underweight</option>
              <option value="muscle_gain">Muscle Gain</option>
              <option value="thyroid">Thyroid</option>
              <option value="hyperthyroidism">Hyperthyroidism</option>
              <option value="ckd">Chronic Kidney Disease (CKD)</option>
              <option value="kidney_disease">Kidney Disease</option>
              <option value="heart_disease">Heart Disease</option>
              <option value="cvd">Cardiovascular Disease (CVD)</option>
              <option value="high_cholesterol">High Cholesterol</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700"
          >
            Save Changes
          </button>

        </form>
      </div>
    </div>
  );
};

export default EditProfile;