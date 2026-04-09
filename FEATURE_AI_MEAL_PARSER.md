# AI Meal Description Parser - Feature Implementation

## 📋 Overview

This feature allows users to describe their meals in natural language, and the system automatically:
1. Parses the description using Google Gemini AI
2. Matches foods with the nutrition database
3. Calculates macro/micronutrients
4. Displays parsed results for user confirmation
5. Saves merged data (manual + AI-parsed items) to MongoDB

## 🎯 What's New

### Frontend (TakeInput.jsx)
- ✅ **Manual Input** still works as before (no changes)
- ✅ **New AI Parser Section** - textarea for meal descriptions per meal (breakfast/lunch/dinner)
- ✅ **Real-time Parsing** - instant feedback with matching scores and nutrition facts
- ✅ **Preview Before Save** - users confirm parsed items before saving
- ✅ **Merged Database Save** - both manual + parsed items saved together

### Backend Changes

#### 1. **New Route**: `POST /api/parse-meal-description`
**File**: `routes/mealParser.js`

**Request**:
```json
{
  "description": "I ate Doodh Daliya with high sweetness and 1 bowl of daliya with onion peas cucumber",
  "mealType": "breakfast"
}
```

**Response**:
```json
{
  "items": [
    {
      "parsed_food_name": "Doodh Daliya",
      "matched_food_name": "Doodh Daliya",
      "quantity": 1,
      "unit": "bowl",
      "description": "high sweetness",
      "confidence": 0.9,
      "match_score": 0.95,
      "nutrition": {
        "calories": 250,
        "protein": 8.5,
        "carbs": 35.2,
        "fat": 6.8,
        "fiber": 2.3,
        "sodium": 180
      }
    }
  ],
  "original_description": "I ate Doodh Daliya...",
  "total_items_parsed": 2,
  "total_items_matched": 2
}
```

#### 2. **New Service**: `services/geminiService.js`
- Calls Google Gemini API to parse meal descriptions
- Extracts food names, quantities, units, and descriptions
- Returns confidence scores for each item

#### 3. **Updated Model**: `models/Meal.js`
Added new fields:
```javascript
{
  meal_descriptions: {
    breakfast_text: String,
    lunch_text: String,
    dinner_text: String
  },
  // FoodSchema now includes:
  source: { type: String, enum: ['manual', 'parsed'], default: 'manual' }
}
```

#### 4. **Updated Route**: `routes/meal.js`
- Now accepts `meal_descriptions` in POST request
- Stores original descriptions for audit trail

## 🚀 Setup Instructions

### 1. Get Gemini API Key
1. Go to [Google AI Studio](https://ai.google.dev/)
2. Click "Get API Key"
3. Create a new API key
4. Copy and paste it

### 2. Update Environment Variables
Add to `.env` file in `NutriFy_Backend/`:
```env
GEMINI_API_KEY=your_api_key_here
```

### 3. Install Dependencies (if needed)
```bash
cd NutriFy_Backend
npm install axios  # Should already exist
```

### 4. Restart Backend Server
```bash
npm run dev
# or
npm start
```

## 📊 How It Works - Step by Step

```
1. User enters meal description
   ↓
2. User clicks "Parse with AI" button
   ↓
3. Frontend sends POST to /api/parse-meal-description
   ↓
4. Backend calls Gemini API with prompt
   ↓
5. Gemini extracts: [food_name, quantity, unit, description, confidence_score]
   ↓
6. Backend matches food names with database using fuzzy matching (Levenshtein)
   ↓
7. Backend calculates nutrition for each matched food
   ↓
8. Response sent to frontend with all parsed items + scores
   ↓
9. User sees preview of parsed items with:
      - Match Score (database match quality)
      - AI Confidence (Gemini's confidence)
      - Nutrition calculated
   ↓
10. User clicks "✓ Add" to confirm each item OR manually edits
   ↓
11. User clicks "Save All Meals"
   ↓
12. Both manual + confirmed parsed items saved to DB with:
      - source field ('manual' or 'parsed')
      - original description stored
   ↓
13. Success! Data ready for recommendations
```

## 🔍 Matching Algorithm

### Fuzzy Matching (Levenshtein Distance)
```
User says: "Doodh Daliya"
Database has: "Doodh Daliya (1 bowl)"

Similarity Score = (longest_string_length - edit_distance) / longest_string_length
Example: (12 - 0) / 12 = 1.0 (100% match)

Threshold: Only accept > 50% match
```

### Example Matches:
```
"Doodh Daliya" → "Doodh Daliya" (95% match)
"Rice" → "Cooked Rice" (80% match)
"Egg Curry" → "Egg Curry with Onions" (75% match)
"Apple" → "Apple (medium)" (90% match)
```

## 💾 Database Schema

### Meal Document Example:
```javascript
{
  "_id": ObjectId,
  "userId": ObjectId,
  "date": "2026-04-08T10:30:00Z",
  "breakfast": [
    { "item": "Doodh Daliya", "quantity": 1, "source": "parsed" },
    { "item": "Banana", "quantity": 1, "source": "manual" }
  ],
  "lunch": [
    { "item": "Biryani", "quantity": 0.5, "source": "manual" }
  ],
  "dinner": [],
  "meal_descriptions": {
    "breakfast_text": "I ate Doodh Daliya with high sweetness and 1 banana",
    "lunch_text": "Had half plate of biryani",
    "dinner_text": ""
  },
  "createdAt": "2026-04-08T10:30:00Z",
  "updatedAt": "2026-04-08T10:30:00Z"
}
```

## ⚙️ Configuration

### Gemini Model
- **Model**: `gemini-1.5-flash` (fast, cost-effective)
- **Alternative**: `gemini-1.5-pro` (more accurate but slower)
- **API Rate Limit**: Default is 15 requests/minute (free tier)

### Matching Settings
```javascript
// In mealParser.js
Match Score Threshold: 0.5 (50%)
Similarity Metric: Levenshtein Distance
Unit Conversions Supported:
  - piece, bowl, cup, tbsp, tsp, g, ml, oz, kg
```

## 🧪 Testing

### Manual Test 1: Parse with AI
1. Go to TakeInput page
2. Enter: "I ate 2 scrambled eggs, 1 slice of whole wheat toast, and a cup of coffee with milk"
3. Click "Parse with AI"
4. Verify: Should detect 3 items with nutrition calculated

### Manual Test 2: Mixed Manual + AI
1. Add 1 item manually: "Rice"
2. Enter description: "Plus 1 chicken curry with 2 naans"
3. Parse AI
4. Confirm 2 parsed items
5. Save
6. Verify: 3 items total in DB (1 manual + 2 parsed)

### Manual Test 3: Low Confidence Items
1. Enter: "xyzabc food item that doesn't exist"
2. Should return empty or generic match
3. Verify: Graceful error handling

## 🔐 Error Handling

```
1. Missing GEMINI_API_KEY → 500 error with clear message
2. No foods in description → 200 with empty items array
3. Gemini API timeout → 500 error
4. Invalid JSON response → 500 error with fallback
5. Food not in database → Returns best match or skips
```

## 📈 Future Enhancements

- [ ] Add caching for frequent food items
- [ ] Improve fuzzy matching with phonetic algorithms
- [ ] Add photo-based meal recognition
- [ ] Multi-language support
- [ ] Meal categories/recipes
- [ ] Nutritionist review for low-confidence items

## 📝 Troubleshooting

### Issue: "GEMINI_API_KEY not configured"
**Solution**: Add to .env file and restart server

### Issue: "No foods detected"
**Solution**: Try more detailed description with quantities
Example: ❌ "I ate food" → ✅ "I ate 1 cup of rice with 100g of chicken"

### Issue: Incorrect food matching
**Solution**: 
1. Check if food exists in CSV database
2. Try different food name variations
3. The system will pick best match from database

### Issue: Rate limit exceeded
**Solution**: 
1. Wait 1 minute
2. Upgrade Gemini plan
3. Implement request queuing in backend

## 📞 Support

For issues or questions, refer to:
- Gemini API Docs: https://ai.google.dev/docs
- MongoDB Schema: See models/Meal.js
- Food Database: data/updated_food_nutrition.csv
