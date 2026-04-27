import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import {useSelector} from 'react-redux';

// Component for an individual food entry row
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
      <button
        onClick={onRemove}
        className='text-red-500 hover:text-red-700 font-bold px-2'
        title="Remove item"
      >
        ✕
      </button>
    </div>
  </div>
);

const MealSection = ({
  mealType,
  title,
  emoji,
  meals,
  addEntry,
  removeEntry,
  updateEntry,
  mealDescriptions,
  handleDescriptionChange,
  parsing,
  handleParseDescription,
  parsedItems,
  confirmParsedItem
}) => (
  <div className='bg-white p-6 rounded-xl shadow-md mb-6 border-l-4 border-green-500'>
    <h3 className='text-2xl font-bold text-gray-800 mb-6'>{emoji} {title}</h3>

    {/* Manual Input Section */}
    <div className='mb-8'>
      <h4 className='text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2'>
        <span className='w-2 h-2 bg-blue-500 rounded-full'></span>
        Manual Input
      </h4>
      {meals[mealType].map((entry, idx) => (
        <FoodItemEntry
          key={`${mealType}-${idx}`}
          item={entry.item}
          quantity={entry.quantity}
          listId="food-suggestions"
          onUpdate={(field, val) => updateEntry(mealType, idx, field, val)}
          onRemove={() => removeEntry(mealType, idx)}
        />
      ))}
      <button
        type='button'
        onClick={() => addEntry(mealType)}
        className='mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors'
      >
        + Add Item
      </button>
    </div>

    {/* AI Description Parser Section */}
    <div className='border-t pt-8'>
      <h4 className='text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2'>
        <span className='w-2 h-2 bg-green-500 rounded-full'></span>
        Or Describe Your Meal
      </h4>
      <textarea
        name={`${mealType}-description`}
        value={mealDescriptions[mealType] || ''}
        onChange={(e) => handleDescriptionChange(mealType, e.target.value)}
        placeholder={`E.g., Describe your meal with items and quantity (e.g., 2 chapati, dal, salad)`}
        className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 outline-none text-black mb-3 bg-white resize-vertical'
        rows={4}
        spellCheck='true'
        autoComplete='off'
      />
      <button
        type='button'
        onClick={() => handleParseDescription(mealType)}
        disabled={parsing[mealType]}
        className='px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 transition-colors font-semibold flex items-center gap-2'
      >
        {parsing[mealType] ? (
          <>
            <span className='animate-spin'>⏳</span>
            Parsing...
          </>
        ) : (
          <>
            <span></span>
            Analyze Meal
          </>
        )}
      </button>
    </div>

    {/* Parsed Results Preview */}
    {parsedItems[mealType].length > 0 && (
      <div className='border-t pt-8 mt-8'>
        <h4 className='text-lg font-semibold text-green-700 mb-4 flex items-center gap-2'>
          <span className='text-green-500'>🎯</span>
          AI Detected {parsedItems[mealType].length} Item{parsedItems[mealType].length !== 1 ? 's' : ''}
        </h4>
        <div className='space-y-3'>
          {parsedItems[mealType].map((item, idx) => (
            <div key={idx} className='bg-green-50 p-4 rounded-lg border-2 border-green-200 hover:border-green-400 transition-colors'>
              <div className='flex justify-between items-start gap-4'>
                <div className='flex-1'>
                  <p className='font-bold text-gray-800 text-lg'>{item.parsed_food_name || item.matched_food_name}</p>
                  <p className='text-sm text-gray-600 mt-1'>
                    📦 {item.quantity} {item.unit} {item.description ? `• ${item.description}` : ''}
                  </p>
                  <div className='flex gap-4 mt-2 text-xs'>
                    <span className='text-blue-600 font-semibold'>Source: {item.source || 'API'}</span>
                    <span className='text-purple-600 font-semibold'>AI Confidence: {(item.confidence * 100).toFixed(0)}%</span>
                  </div>
                  <div className='flex gap-4 mt-2 text-sm font-semibold text-gray-700'>
                    <span>🔥 {item.nutrition.calories} cal</span>
                    <span>🥬 {item.nutrition.protein}g protein</span>
                    <span>🍚 {item.nutrition.carbs}g carbs</span>
                    <span>🧈 {item.nutrition.fat}g fat</span>
                  </div>
                </div>
                <button
                  type='button'
                  onClick={() => confirmParsedItem(mealType, item, idx)}
                  className='flex-shrink-0 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold whitespace-nowrap'
                >
                  ✓ Add
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);

const TakeInput = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [meals, setMeals] = useState({
    breakfast: [{ item: '', quantity: 1 }],
    lunch: [{ item: '', quantity: 1 }],
    dinner: [{ item: '', quantity: 1 }]
  });
  
  // 🆕 State for text descriptions
  const [mealDescriptions, setMealDescriptions] = useState({
    breakfast: '',
    lunch: '',
    dinner: ''
  });

  // 🆕 State for parsed items from AI
  const [parsedItems, setParsedItems] = useState({
    breakfast: [],
    lunch: [],
    dinner: []
  });

  // 🆕 Loading state for parsing
  const [parsing, setParsing] = useState({
    breakfast: false,
    lunch: false,
    dinner: false
  });
  
  const [foodList, setFoodList] = useState([]);

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
    setMeals(prev => ({
      ...prev,
      [mealType]: prev[mealType].filter((_, i) => i !== index)
    }));
  };

  const updateEntry = (mealType, index, field, value) => {
    setMeals(prev => {
      const updatedMeal = [...prev[mealType]];
      updatedMeal[index][field] = value;
      return { ...prev, [mealType]: updatedMeal };
    });
  };

  const handleDescriptionChange = (mealType, value) => {
    setMealDescriptions(prev => ({
      ...prev,
      [mealType]: value
    }));
  };

  // 🆕 Handle meal description parsing with Gemini
  const handleParseDescription = async (mealType) => {
    const description = mealDescriptions[mealType] || '';
    const trimmed = description.trim();

    if (!trimmed) {
      toast.warning("Please enter a meal description before parsing.");
      return;
    }

    const containsFoodWord = /[a-zA-Z]/.test(trimmed);
    if (!containsFoodWord) {
      toast.warning("Please include food names like 'idli', 'rice', or 'dal' in your description.");
      return;
    }

    setParsing(prev => ({ ...prev, [mealType]: true }));
    const userEmail = currentUser?.user?.email || currentUser?.email;

    try {
      const response = await axios.post("/api/parse-meal-description", {
        description: trimmed,
        mealType,
        email: userEmail
      });

      if (response.data.items && response.data.items.length > 0) {
        setParsedItems(prev => ({
          ...prev,
          [mealType]: response.data.items
        }));
        toast.success(`✨ Parsed ${response.data.total_items_matched} items from description`);
      } else {
        toast.info("No foods matched. Try a more complete description like '2 idli and 1 cup rice'.");
      }
    } catch (error) {
      const message = error.response?.data?.error || error.message || "Unknown error";
      console.error("Parse request failed", error);
      toast.error("Failed to parse description: " + message);
    } finally {
      setParsing(prev => ({ ...prev, [mealType]: false }));
    }
  };

  // 🆕 Add parsed item to manual items
  const confirmParsedItem = (mealType, parsedItem, indexInArray) => {
    setMeals(prev => ({
      ...prev,
      [mealType]: [
        ...prev[mealType],
        {
          item: parsedItem.parsed_food_name || parsedItem.matched_food_name,
          quantity: parsedItem.quantity,
          source: 'parsed'
        }
      ]
    }));

    // Remove from parsed list
    setParsedItems(prev => ({
      ...prev,
      [mealType]: prev[mealType].filter((_, idx) => idx !== indexInArray)
    }));

    toast.info("✓ Added to " + mealType);
  };

  const handleSubmit = async () => {
    // 1. Extract valid items for check (exclude AI-parsed items from validation)
    const userEmail = currentUser?.user?.email || currentUser?.email;
    const allItems = [...meals.breakfast, ...meals.lunch, ...meals.dinner].filter(f => f.item);
    const manualItems = allItems.filter(entry => entry.source !== 'parsed');

    // 2. Validate manual items against the cleanNames in our foodList
    const validNames = foodList.map(f => f.cleanName);
    const invalidItems = manualItems.filter(entry => !validNames.includes(entry.item));

    if (invalidItems.length > 0) {
      toast.error(`The following items must be selected from the suggestions: ${invalidItems.map(i => i.item).join(", ")}`);
      return;
    }

    if (allItems.length === 0) {
      toast.warning("Please add at least one food item");
      return;
    }

    // 3. Prepare data (sending clean names only + descriptions)
    const mealData = {
      email: userEmail,
      breakfast: meals.breakfast.filter(f => f.item).map(f => ({ item: f.item, quantity: f.quantity, source: f.source || 'manual' })),
      lunch: meals.lunch.filter(f => f.item).map(f => ({ item: f.item, quantity: f.quantity, source: f.source || 'manual' })),
      dinner: meals.dinner.filter(f => f.item).map(f => ({ item: f.item, quantity: f.quantity, source: f.source || 'manual' })),
      meal_descriptions: mealDescriptions
    };

    // 4. Log for inspection
    console.log("MEAL DATA PREPARED (Manual + AI Parsed):", mealData);

    try {
      const response = await axios.post("api/meals/add", mealData);
      if (response.data) {
        toast.success("✅ Success! Your daily meals have been logged.");
        setMeals({
          breakfast: [{ item: '', quantity: 1 }],
          lunch: [{ item: '', quantity: 1 }],
          dinner: [{ item: '', quantity: 1 }]
        });
        setMealDescriptions({
          breakfast: '',
          lunch: '',
          dinner: ''
        });
        setParsedItems({
          breakfast: [],
          lunch: [],
          dinner: []
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Error connecting to server.");
    }
  };

  return (
    <div className='w-full bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4'>
      {/* Datalist logic: 
          'value' attribute is what gets filled in the input (cleanName).
          The user sees the displayString (with weight) in the dropdown list.
      */}
      <datalist id="food-suggestions">
        {foodList.map((food, index) => (
          <option key={index} value={food.cleanName}>
            {food.displayString}
          </option>
        ))}
      </datalist>

      <div className='max-w-[1000px] mx-auto'>
        <h1 className='text-3xl font-bold mb-2 text-center text-gray-800'> Use manual input OR Describe your meal</h1>

        <div className='space-y-2'>
          <MealSection
          mealType='breakfast'
          title='Breakfast'
          emoji='🌅'
          meals={meals}
          addEntry={addEntry}
          removeEntry={removeEntry}
          updateEntry={updateEntry}
          mealDescriptions={mealDescriptions}
          handleDescriptionChange={handleDescriptionChange}
          parsing={parsing}
          handleParseDescription={handleParseDescription}
          parsedItems={parsedItems}
          confirmParsedItem={confirmParsedItem}
        />
        <MealSection
          mealType='lunch'
          title='Lunch'
          emoji='🍽️'
          meals={meals}
          addEntry={addEntry}
          removeEntry={removeEntry}
          updateEntry={updateEntry}
          mealDescriptions={mealDescriptions}
          handleDescriptionChange={handleDescriptionChange}
          parsing={parsing}
          handleParseDescription={handleParseDescription}
          parsedItems={parsedItems}
          confirmParsedItem={confirmParsedItem}
        />
        <MealSection
          mealType='dinner'
          title='Dinner'
          emoji='🌙'
          meals={meals}
          addEntry={addEntry}
          removeEntry={removeEntry}
          updateEntry={updateEntry}
          mealDescriptions={mealDescriptions}
          handleDescriptionChange={handleDescriptionChange}
          parsing={parsing}
          handleParseDescription={handleParseDescription}
          parsedItems={parsedItems}
          confirmParsedItem={confirmParsedItem}
        />
        </div>

        {/* Action Buttons */}
        <div className='mt-10 flex flex-col items-center gap-6'>
          <button
            type='button'
            onClick={handleSubmit}
            className='w-[320px] px-8 py-4 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 text-white rounded-2xl font-semibold text-lg shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-600/30 hover:from-blue-600 hover:via-blue-700 hover:to-blue-800 transform hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-3'
          >
            <span className='text-xl'>💾</span>
            Save All Meals
          </button>
          
         <div className='flex justify-center mt-8'>
  <button
    type='button'
    onClick={() => window.open('http://localhost:8501', '_blank')}
    className='relative w-[400px] px-12 py-8 bg-gradient-to-br from-green-500 via-green-600 to-green-700 text-white rounded-3xl font-semibold text-lg shadow-[0_20px_40px_rgba(34,197,94,0.35)] hover:shadow-[0_25px_50px_rgba(34,197,94,0.45)] transform hover:-translate-y-1 active:scale-[0.97] transition-all duration-300 flex flex-col items-center justify-center gap-2 group overflow-hidden'
  >
    
    {/* Glow overlay */}
    <span className='absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition duration-300 rounded-3xl'></span>

    {/* Border glow */}
    <span className='absolute inset-0 rounded-3xl ring-1 ring-white/20'></span>

    {/* Main content */}
    <div className='relative flex items-center gap-3'>
      <span className='text-3xl group-hover:scale-110 transition-transform duration-200'>
        📷
      </span>
      <span className='text-2xl font-bold tracking-wide'>
        Upload Meal Image
      </span>
    </div>

    {/* Subtext */}
    <span className='relative text-[15px] italic text-green-100/90 font-light'>
      Add your meal faster with a clear picture
    </span>
  </button>
</div>
        </div>
      </div>
    </div>
  );
};

export default TakeInput;