import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';

const FoodItemEntry = ({ item, quantity, onUpdate, onRemove, listId }) => (
  <div className='flex flex-col md:flex-row gap-3 items-center mb-3 bg-white p-3 rounded-lg border border-gray-200 shadow-sm'>
    <div className='flex-1 relative'>
      <input
        type='text'
        list={listId} 
        value={item}
        onChange={(e) => onUpdate('item', e.target.value)}
        autoComplete="off" 
        placeholder="Search food (e.g. Apple)..."
        className='w-full p-2 rounded border border-gray-300 outline-none focus:ring-2 focus:ring-green-400 text-black'
      />
    </div>
    <div className='flex items-center gap-2'>
      <label className='text-sm text-gray-500 font-medium'>Qty:</label>
      <input
        type='number'
        step="0.1" 
        min="0.1"
        value={quantity}
        onChange={(e) => onUpdate('quantity', parseFloat(e.target.value) || 0)}
        className='w-20 p-2 rounded border border-gray-300 outline-none focus:ring-2 focus:ring-green-400 text-black'
      />
      <button onClick={onRemove} className='text-red-500 hover:text-red-700 font-bold px-2' title="Remove item">✕</button>
    </div>
  </div>
);

const TakeInput = () => {
  // 1. Get the slice from Redux
  const { currentUser } = useSelector((state) => state.user);

  const [meals, setMeals] = useState({
    breakfast: [{ item: '', quantity: 1 }],
    lunch: [{ item: '', quantity: 1 }],
    dinner: [{ item: '', quantity: 1 }]
  });
  
  const [foodList, setFoodList] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchFoods = async () => {
      try {
        const response = await axios.get("api/fooditems/food-list");
        setFoodList(response.data);
      } catch (err) {
        console.error("Could not load food list:", err);
      }
    };
    fetchFoods();
  }, []);

  const addEntry = (mealType) => {
    setMeals(prev => ({
      ...prev,
      [mealType]: [...prev[mealType], { item: '', quantity: 1 }]
    }));
  };

  const removeEntry = (mealType, index) => {
    if (meals[mealType].length === 1) {
      updateEntry(mealType, 0, 'item', '');
      return;
    }
    setMeals(prev => ({ ...prev, [mealType]: prev[mealType].filter((_, i) => i !== index) }));
  };

  const updateEntry = (mealType, index, field, value) => {
    setMeals(prev => {
      const updatedMeal = [...prev[mealType]];
      updatedMeal[index][field] = value;
      return { ...prev, [mealType]: updatedMeal };
    });
  };

  const handleSubmit = async () => {
    // 🔥 DEBUG LOG: See the actual structure of currentUser
    console.log("Full currentUser object from Redux:", currentUser);

    // 2. Extract email based on your auth.js return structure
    // If your login returns { token, user: { email } }, use currentUser.user.email
    // If it returns just the user object, use currentUser.email
    const userEmail = currentUser?.user?.email || currentUser?.email;
    const userName = currentUser?.user?.name || currentUser?.name;

    if (!userEmail) {
      alert("User email not found. Please log in again.");
      return;
    }

    const allItems = [...meals.breakfast, ...meals.lunch, ...meals.dinner].filter(f => f.item);
    
    if (allItems.length === 0) {
      alert("Please add at least one food item.");
      return;
    }

    const validNames = foodList.map(f => f.cleanName);
    const invalidItems = allItems.filter(entry => !validNames.includes(entry.item));

    if (invalidItems.length > 0) {
      alert(`Invalid items: ${invalidItems.map(i => i.item).join(", ")}`);
      return;
    }

    const mealData = {
      email: userEmail, // ✅ Now using the resolved email
      breakfast: meals.breakfast.filter(f => f.item).map(f => ({ item: f.item, quantity: f.quantity })),
      lunch: meals.lunch.filter(f => f.item).map(f => ({ item: f.item, quantity: f.quantity })),
      dinner: meals.dinner.filter(f => f.item).map(f => ({ item: f.item, quantity: f.quantity }))
    };

    try {
      setIsSubmitting(true);
      const response = await axios.post("api/meals/add", mealData);
      
      if (response.data) {
        alert(`Meals saved for ${userEmail}! 🥗`);
        setMeals({
          breakfast: [{ item: '', quantity: 1 }],
          lunch: [{ item: '', quantity: 1 }],
          dinner: [{ item: '', quantity: 1 }]
        });
      }
    } catch (error) {
      alert(error.response?.data?.error || "Server error.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='w-full bg-white py-12 px-4'>
      <datalist id="food-suggestions">
        {foodList.map((food, index) => (
          <option key={index} value={food.cleanName}>{food.displayString}</option>
        ))}
      </datalist>

      <div className='max-w-[800px] mx-auto'>
        <h1 className='text-3xl font-bold mb-2 text-center text-gray-800'>
          Log Daily Meals {currentUser ? `for ${currentUser?.user?.name || currentUser?.name}` : ''}
        </h1>

        <div className='bg-gray-50 p-6 md:p-10 rounded-2xl shadow-lg border border-gray-100'>
          {['breakfast', 'lunch', 'dinner'].map((type) => (
            <div key={type} className="mb-8 last:mb-0">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold capitalize text-gray-700">{type}</h2>
                <button onClick={() => addEntry(type)} className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full">+ Add Item</button>
              </div>
              {meals[type].map((entry, index) => (
                <FoodItemEntry
                  key={`${type}-${index}`}
                  item={entry.item}
                  quantity={entry.quantity}
                  listId="food-suggestions"
                  onUpdate={(field, val) => updateEntry(type, index, field, val)}
                  onRemove={() => removeEntry(type, index)}
                />
              ))}
            </div>
          ))}

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`w-full mt-8 text-white py-4 rounded-xl font-bold text-lg shadow-xl ${isSubmitting ? 'bg-gray-400' : 'bg-green-500 hover:bg-green-600'}`}
          >
            {isSubmitting ? "Saving..." : "Save Meals"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TakeInput;