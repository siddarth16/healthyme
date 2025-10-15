export type Sex = 'male' | 'female'
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
export type DietaryPreference = 'none' | 'vegetarian' | 'eggetarian' | 'vegan' | 'pescatarian'
export type CuisineBias = 'indian' | 'global' | 'mixed'

export interface UserProfile {
  id: string
  email: string
  weight_kg: number
  height_cm: number
  age: number
  sex: Sex
  activity_level: ActivityLevel
  target_weight_kg: number
  target_date: string // YYYY-MM-DD
  dietary_preference?: DietaryPreference
  cuisine_bias?: CuisineBias
  timezone?: string
  // Calculated fields
  daily_calorie_target: number
  protein_target_g: number
  fat_target_g: number
  carbs_target_g: number
  created_at: string
  updated_at: string
}

export interface ParsedMealItem {
  food_name: string
  quantity: number
  unit: string
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  confidence_level: 'high' | 'medium' | 'low'
  timestamp?: string
}

export interface MealEntry {
  id: string
  user_id: string
  date: string // YYYY-MM-DD
  original_text: string
  items: ParsedMealItem[]
  created_at: string
  updated_at: string
}

export interface DailySummary {
  date: string
  total_calories: number
  total_protein_g: number
  total_carbs_g: number
  total_fat_g: number
  meal_count: number
  target_calories: number
  target_protein_g: number
  target_carbs_g: number
  target_fat_g: number
}

export interface CoachingMessage {
  id: string
  user_id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}
