import { GoogleGenerativeAI } from '@google/generative-ai'

const apiKey = process.env.GEMINI_API_KEY || ''
const genAI = new GoogleGenerativeAI(apiKey)

export function getGeminiModel() {
  return genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })
}

export async function parseMealText(text: string, userPreferences?: {
  dietary_preference?: string
  cuisine_bias?: string
}) {
  const model = getGeminiModel()

  const prompt = `You are a nutrition assistant. Parse the following meal log text and extract structured information.

User input: "${text}"

${userPreferences?.dietary_preference ? `User dietary preference: ${userPreferences.dietary_preference}` : ''}
${userPreferences?.cuisine_bias ? `User cuisine preference: ${userPreferences.cuisine_bias}` : ''}

Extract each food item with:
1. food_name: descriptive name of the food
2. quantity: numeric amount
3. unit: unit of measurement (g, ml, cup, piece, etc.)
4. calories: estimated calories
5. protein_g: grams of protein
6. carbs_g: grams of carbohydrates
7. fat_g: grams of fat
8. confidence_level: "high", "medium", or "low" based on how certain you are about the nutrition data
9. timestamp: if mentioned in the text (format: HH:mm), otherwise null

Return ONLY a valid JSON object with this exact structure:
{
  "items": [
    {
      "food_name": string,
      "quantity": number,
      "unit": string,
      "calories": number,
      "protein_g": number,
      "carbs_g": number,
      "fat_g": number,
      "confidence_level": "high" | "medium" | "low",
      "timestamp": string | null
    }
  ],
  "needs_clarification": boolean,
  "clarification_question": string | null
}

If the input is ambiguous or you need more information, set needs_clarification to true and provide a clarification_question.
For Indian foods, use standard serving sizes (e.g., 1 roti ≈ 40g, 1 cup dal ≈ 200g).
For common global foods, use standard nutrition databases.

Do not include any markdown formatting, explanations, or text outside the JSON object.`

  const result = await model.generateContent(prompt)
  const response = result.response
  const text_response = response.text()

  // Clean up potential markdown formatting
  const jsonText = text_response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

  try {
    const parsed = JSON.parse(jsonText)

    // Validate the response structure
    if (!parsed.items || !Array.isArray(parsed.items)) {
      console.error('Invalid response structure from Gemini:', jsonText)
      throw new Error('Invalid response structure: missing or invalid items array')
    }

    return parsed
  } catch (parseError) {
    console.error('Failed to parse Gemini response:', jsonText)
    console.error('Parse error:', parseError)
    throw new Error(`Failed to parse AI response: ${parseError instanceof Error ? parseError.message : String(parseError)}`)
  }
}

export async function generateCoachingResponse(
  userMessage: string,
  userProfile: any,
  recentLogs: any[]
) {
  const model = getGeminiModel()

  const prompt = `You are a supportive nutrition coach helping a user track their calorie and macro goals.

User Profile:
- Target: ${userProfile.target_weight_kg}kg by ${userProfile.target_date}
- Daily calorie target: ${userProfile.daily_calorie_target} kcal
- Protein target: ${userProfile.protein_target_g}g
- Carbs target: ${userProfile.carbs_target_g}g
- Fat target: ${userProfile.fat_target_g}g

Recent 7-day logs summary:
${JSON.stringify(recentLogs, null, 2)}

User question: "${userMessage}"

Provide a helpful, grounded response based on their actual data. Suggest specific food swaps, portion adjustments, or pacing feedback. DO NOT provide medical advice or make medical claims. If their goal seems unsafe, gently flag it.

Keep your response conversational, supportive, and actionable (2-4 sentences).`

  const result = await model.generateContent(prompt)
  const response = result.response
  return response.text()
}
