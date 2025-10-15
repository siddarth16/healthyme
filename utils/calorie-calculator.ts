import { Sex, ActivityLevel } from '@/types'

const ACTIVITY_FACTORS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
}

const CALORIES_PER_KG = 7700 // approximate calories per kg of body weight

export function calculateBMR(
  weight_kg: number,
  height_cm: number,
  age: number,
  sex: Sex
): number {
  // Mifflin-St Jeor Equation
  if (sex === 'male') {
    return 10 * weight_kg + 6.25 * height_cm - 5 * age + 5
  } else {
    return 10 * weight_kg + 6.25 * height_cm - 5 * age - 161
  }
}

export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  return bmr * ACTIVITY_FACTORS[activityLevel]
}

export function calculateDailyCalorieTarget(
  currentWeight: number,
  targetWeight: number,
  targetDate: string,
  tdee: number
): {
  dailyCalories: number
  weeklyWeightChange: number
  isUnsafe: boolean
  warning?: string
} {
  const today = new Date()
  const target = new Date(targetDate)
  const daysToTarget = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (daysToTarget <= 0) {
    return {
      dailyCalories: Math.round(tdee / 10) * 10,
      weeklyWeightChange: 0,
      isUnsafe: true,
      warning: 'Target date must be in the future'
    }
  }

  const totalWeightChange = targetWeight - currentWeight
  const dailyWeightChange = totalWeightChange / daysToTarget
  const weeklyWeightChange = (dailyWeightChange * 7)

  // Safety check: clamp to ±0.25 to ±1.0 kg/week
  const MIN_WEEKLY_CHANGE = 0.25
  const MAX_WEEKLY_CHANGE = 1.0

  let adjustedWeeklyChange = weeklyWeightChange
  let isUnsafe = false
  let warning: string | undefined

  if (Math.abs(weeklyWeightChange) < MIN_WEEKLY_CHANGE && Math.abs(weeklyWeightChange) > 0.05) {
    // Too slow - adjust to minimum
    adjustedWeeklyChange = weeklyWeightChange > 0 ? MIN_WEEKLY_CHANGE : -MIN_WEEKLY_CHANGE
    warning = `Your target pace (${weeklyWeightChange.toFixed(2)} kg/week) is very slow. We've adjusted to ${adjustedWeeklyChange.toFixed(2)} kg/week for better results.`
  } else if (Math.abs(weeklyWeightChange) > MAX_WEEKLY_CHANGE) {
    // Too fast - unsafe
    adjustedWeeklyChange = weeklyWeightChange > 0 ? MAX_WEEKLY_CHANGE : -MAX_WEEKLY_CHANGE
    isUnsafe = true
    warning = `Your target pace (${weeklyWeightChange.toFixed(2)} kg/week) exceeds safe limits. We recommend ${adjustedWeeklyChange.toFixed(2)} kg/week maximum.`
  }

  // Calculate daily calorie adjustment
  const dailyCalorieAdjustment = (adjustedWeeklyChange / 7) * CALORIES_PER_KG

  let dailyCalories = tdee + dailyCalorieAdjustment

  // Round to nearest 10
  dailyCalories = Math.round(dailyCalories / 10) * 10

  // Ensure minimum 1200 calories for safety
  if (dailyCalories < 1200) {
    dailyCalories = 1200
    isUnsafe = true
    warning = 'Calorie target adjusted to minimum safe level (1200 kcal/day)'
  }

  return {
    dailyCalories,
    weeklyWeightChange: adjustedWeeklyChange,
    isUnsafe,
    warning,
  }
}

export function calculateMacroTargets(
  dailyCalories: number,
  targetWeight: number
): {
  protein_g: number
  fat_g: number
  carbs_g: number
} {
  // Protein: 1.8g per kg of target weight
  const protein_g = Math.round(targetWeight * 1.8)
  const proteinCalories = protein_g * 4

  // Fat: 30% of daily calories
  const fatCalories = dailyCalories * 0.3
  const fat_g = Math.round(fatCalories / 9)

  // Carbs: Remaining calories
  const carbCalories = dailyCalories - proteinCalories - fatCalories
  const carbs_g = Math.round(carbCalories / 4)

  return {
    protein_g,
    fat_g,
    carbs_g,
  }
}
