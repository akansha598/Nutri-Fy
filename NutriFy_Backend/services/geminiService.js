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
    // Use a currently supported Gemini model for meal parsing
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `You are a meal parsing AI. Your only job is to extract EVERY individual food item from the given meal description.

Meal Description: "${mealDescription}"
Meal Type: ${mealType}

CRITICAL RULES:
1. EXTRACT ALL food items present. Do not skip any.
2. Break down combined dish names into their main components.
   Examples:
   - "Rajma Chawal" → ["Rajma", "Chawal"]
   - "Dal Tadka and 2 Roti" → ["Dal Tadka", "Roti"]
   - "Paneer Butter Masala with 3 Naan" → ["Paneer Butter Masala", "Naan"]
3. For each food item, estimate a realistic quantity and unit if not explicit.
4. Use common Indian/global food names as given.
5. Return ONLY a JSON array. No markdown, no backticks, no extra text.

Each object in the array must have:
- "food_name": string (exact name of the food)
- "quantity": number (default 1 if not mentioned)
- "unit": string (piece, bowl, cup, tbsp, tsp, g, ml, unit, etc.)
- "description": string (the original phrase that matched this item)
- "confidence": number (0.0-1.0, 0.8 if explicit quantity/unit, 0.5 if inferred)

Now extract ALL food items from: "${mealDescription}"`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Robust cleaning to handle potential markdown or extra text
    const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const jsonMatch = cleanJson.match(/\[[\s\S]*\]/);

    if (!jsonMatch) {
      console.error("Failed to parse Gemini response:", text);
      return localParseMealDescription(mealDescription, mealType);
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return Array.isArray(parsed) ? parsed : localParseMealDescription(mealDescription, mealType);
  } catch (error) {
    console.error("Gemini Parsing Error:", error.message);
    return localParseMealDescription(mealDescription, mealType);
  }
}

/**
 * Local Fallback Logic (Modified to better handle "and/with" splitting)
 */
function localParseMealDescription(mealDescription, mealType) {
  const cleaned = mealDescription
    .replace(/[^a-zA-Z0-9\s\.\,\-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Split by delimiters to catch combined dishes manually
  const parts = cleaned
    .split(/,|\band\b|\bwith\b|\bplus\b/i)
    .map(segment => segment.trim())
    .filter(Boolean);

  const results = [];
  const numberWords = { 'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5, 'a': 1, 'an': 1 };

  for (const part of parts) {
    let quantity = 1;
    let unit = 'unit';
    let foodName = part;

    const patterns = [
      /(\d+(?:\.\d+)?|one|two|three|four|five|a|an)\s+(bowl|cup|glass|slice|piece|tbsp|tsp|g|ml|oz|kg)\s+(.*)/i,
      /(\d+(?:\.\d+)?|one|two|three|four|five|a|an)\s+(.*)/i,
      /(bowl|cup|glass|slice|piece|tbsp|tsp|g|ml|oz|kg)\s+(.*)/i
    ];

    let matched = false;
    for (const pattern of patterns) {
      const match = part.match(pattern);
      if (match) {
        matched = true;
        const qtyStr = match[1].toLowerCase();
        quantity = numberWords[qtyStr] || parseFloat(qtyStr) || 1;

        if (pattern === patterns[0]) {
          unit = match[2].toLowerCase();
          foodName = match[3].trim();
        } else if (pattern === patterns[1]) {
          foodName = match[2].trim();
        } else {
          unit = match[1].toLowerCase();
          foodName = match[2].trim();
          quantity = 1;
        }
        break;
      }
    }

    results.push({
      food_name: foodName.replace(/^(of|with|and)\s+/i, '').trim(),
      quantity,
      unit,
      description: part,
      confidence: matched ? 0.5 : 0.3
    });
  }
  return results;
}

module.exports = { parseMealDescription };