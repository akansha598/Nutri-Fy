const { GoogleGenerativeAI } = require("@google/generative-ai");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

/**
 * Parses meal description using Gemini AI
 * Returns structured list of foods with estimated quantities
 */
async function parseMealDescription(mealDescription, mealType) {
  try {
    if (!GEMINI_API_KEY) {
      return localParseMealDescription(mealDescription, mealType);
    }

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = `You are a nutrition analysis AI. Parse this meal description and extract individual food items with quantities.

Meal Description: "${mealDescription}"
Meal Type: ${mealType}

Return ONLY a JSON array (no markdown, no explanation, just the JSON). Each item must have:
- "food_name": Best matching Indian/Common food (be specific, e.g., "Doodh Daliya" not just "Porridge")
- "quantity": Estimated quantity in standard units (numbers only, e.g., 1, 0.5, 2)
- "unit": Unit of measurement (piece, bowl, cup, tbsp, tsp, g, ml, oz)
- "description": What user said about it (e.g., "high sweetness", "with onion peas cucumber")
- "confidence": 0.0-1.0 (how confident you are this is correct)

Example input: "I ate Doodh Daliya with high sweetness and 1 bowl of daliya with onion peas cucumber"
Example output:
[
  {"food_name": "Doodh Daliya", "quantity": 1, "unit": "bowl", "description": "high sweetness", "confidence": 0.9},
  {"food_name": "Daliya with vegetables", "quantity": 1, "unit": "bowl", "description": "with onion peas cucumber", "confidence": 0.85}
]

NOW parse this: "${mealDescription}"
Return ONLY the JSON array, nothing else.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract JSON from response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error("Failed to parse Gemini response:", text);
      return localParseMealDescription(mealDescription, mealType);
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return Array.isArray(parsed) ? parsed : localParseMealDescription(mealDescription, mealType);
  } catch (error) {
    console.error("Gemini API Error:", error.message);
    // Fallback to local parsing
    return localParseMealDescription(mealDescription, mealType);
  }
}

function localParseMealDescription(mealDescription, mealType) {
  const cleaned = mealDescription
    .replace(/[^a-zA-Z0-9\s\.\,\-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const parts = cleaned
    .split(/,| and | with /i)
    .map(segment => segment.trim())
    .filter(Boolean);

  const results = [];

  // Convert written numbers to digits
  const numberWords = {
    'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
    'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
    'a': 1, 'an': 1
  };

  for (const part of parts) {
    let quantity = 1;
    let unit = 'unit';
    let foodName = part.trim();

    // Try to match patterns like "2 chapatti" or "one bowl lauki"
    const patterns = [
      // Pattern 1: number + unit + food (e.g., "1 bowl lauki")
      /(\d+(?:\.\d+)?|one|two|three|four|five|six|seven|eight|nine|ten|a|an)\s+(bowl|cup|glass|slice|piece|tbsp|tsp|g|ml|oz|kg)\s+(.*)/i,
      // Pattern 2: number + food (e.g., "2 chapatti")
      /(\d+(?:\.\d+)?|one|two|three|four|five|six|seven|eight|nine|ten|a|an)\s+(.*)/i,
      // Pattern 3: unit + food (e.g., "bowl lauki" - assume quantity 1)
      /(bowl|cup|glass|slice|piece|tbsp|tsp|g|ml|oz|kg)\s+(.*)/i
    ];

    let matched = false;
    for (const pattern of patterns) {
      const match = part.match(pattern);
      if (match) {
        matched = true;

        // Extract quantity
        const qtyStr = match[1].toLowerCase();
        if (numberWords[qtyStr]) {
          quantity = numberWords[qtyStr];
        } else {
          quantity = parseFloat(qtyStr);
        }

        // Extract unit and food name based on pattern
        if (pattern === patterns[0]) {
          // number + unit + food
          unit = match[2].toLowerCase();
          foodName = match[3].trim();
        } else if (pattern === patterns[1]) {
          // number + food
          foodName = match[2].trim();
          unit = 'unit';
        } else if (pattern === patterns[2]) {
          // unit + food
          unit = match[1].toLowerCase();
          foodName = match[2].trim();
          quantity = 1; // Assume 1 when unit comes first
        }

        // Clean up food name
        foodName = foodName.replace(/^(of|with|and)\s+/i, '').trim();

        break;
      }
    }

    if (!matched) {
      // Fallback: treat whole part as food name
      foodName = part.trim();
      quantity = 1;
      unit = 'unit';
    }

    results.push({
      food_name: foodName,
      quantity,
      unit,
      description: part,
      confidence: matched ? 0.5 : 0.3
    });
  }

  return results;
}

module.exports = { parseMealDescription };