'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  calculateBMR,
  calculateTDEE,
  calculateDailyCalorieTarget,
  calculateMacroTargets,
} from '@/utils/calorie-calculator'
import { Sex, ActivityLevel, DietaryPreference, CuisineBias } from '@/types'

export default function OnboardingForm({ userId, email }: { userId: string; email: string }) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [showWarning, setShowWarning] = useState(false)
  const [warningMessage, setWarningMessage] = useState('')
  const [formData, setFormData] = useState({
    weight_kg: '',
    height_cm: '',
    age: '',
    sex: 'male' as Sex,
    activity_level: 'moderate' as ActivityLevel,
    target_weight_kg: '',
    target_date: '',
    dietary_preference: 'none' as DietaryPreference,
    cuisine_bias: 'mixed' as CuisineBias,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  })

  const [calculatedTargets, setCalculatedTargets] = useState({
    daily_calorie_target: 0,
    protein_target_g: 0,
    fat_target_g: 0,
    carbs_target_g: 0,
    weeklyWeightChange: 0,
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const calculateTargets = () => {
    const weight = parseFloat(formData.weight_kg)
    const height = parseFloat(formData.height_cm)
    const age = parseInt(formData.age)
    const targetWeight = parseFloat(formData.target_weight_kg)

    const bmr = calculateBMR(weight, height, age, formData.sex)
    const tdee = calculateTDEE(bmr, formData.activity_level)
    const calorieTarget = calculateDailyCalorieTarget(
      weight,
      targetWeight,
      formData.target_date,
      tdee
    )

    const macros = calculateMacroTargets(calorieTarget.dailyCalories, targetWeight)

    setCalculatedTargets({
      daily_calorie_target: calorieTarget.dailyCalories,
      protein_target_g: macros.protein_g,
      fat_target_g: macros.fat_g,
      carbs_target_g: macros.carbs_g,
      weeklyWeightChange: calorieTarget.weeklyWeightChange,
    })

    if (calorieTarget.isUnsafe || calorieTarget.warning) {
      setShowWarning(true)
      setWarningMessage(calorieTarget.warning || 'Please review your target pace.')
    } else {
      setShowWarning(false)
      setWarningMessage('')
    }
  }

  const handleNext = () => {
    if (step === 1) {
      calculateTargets()
      setStep(2)
    }
  }

  const handleSubmit = async () => {
    const supabase = createClient()

    const { error } = await supabase.from('profiles').insert({
      id: userId,
      email,
      weight_kg: parseFloat(formData.weight_kg),
      height_cm: parseFloat(formData.height_cm),
      age: parseInt(formData.age),
      sex: formData.sex,
      activity_level: formData.activity_level,
      target_weight_kg: parseFloat(formData.target_weight_kg),
      target_date: formData.target_date,
      dietary_preference: formData.dietary_preference,
      cuisine_bias: formData.cuisine_bias,
      timezone: formData.timezone,
      daily_calorie_target: calculatedTargets.daily_calorie_target,
      protein_target_g: calculatedTargets.protein_target_g,
      fat_target_g: calculatedTargets.fat_target_g,
      carbs_target_g: calculatedTargets.carbs_target_g,
    })

    if (error) {
      console.error('Error creating profile:', error)
      alert('Failed to create profile. Please try again.')
      return
    }

    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900 p-4">
      <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent mb-2">
            Welcome to CalorieCoach!
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {step === 1 ? "Let's set up your profile" : 'Review your personalized targets'}
          </p>
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Current Weight (kg) *
                </label>
                <input
                  type="number"
                  name="weight_kg"
                  value={formData.weight_kg}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-purple-500 focus:outline-none"
                  required
                  step="0.1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Height (cm) *
                </label>
                <input
                  type="number"
                  name="height_cm"
                  value={formData.height_cm}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-purple-500 focus:outline-none"
                  required
                  step="0.1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Age (years) *
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-purple-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sex *
                </label>
                <select
                  name="sex"
                  value={formData.sex}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-purple-500 focus:outline-none"
                  required
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Activity Level *
                </label>
                <select
                  name="activity_level"
                  value={formData.activity_level}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-purple-500 focus:outline-none"
                  required
                >
                  <option value="sedentary">Sedentary (little/no exercise)</option>
                  <option value="light">Light (1-3 days/week)</option>
                  <option value="moderate">Moderate (3-5 days/week)</option>
                  <option value="active">Active (6-7 days/week)</option>
                  <option value="very_active">Very Active (athlete)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Target Weight (kg) *
                </label>
                <input
                  type="number"
                  name="target_weight_kg"
                  value={formData.target_weight_kg}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-purple-500 focus:outline-none"
                  required
                  step="0.1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Target Date *
                </label>
                <input
                  type="date"
                  name="target_date"
                  value={formData.target_date}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-purple-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Dietary Preference
                </label>
                <select
                  name="dietary_preference"
                  value={formData.dietary_preference}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-purple-500 focus:outline-none"
                >
                  <option value="none">No restriction</option>
                  <option value="vegetarian">Vegetarian</option>
                  <option value="eggetarian">Eggetarian</option>
                  <option value="vegan">Vegan</option>
                  <option value="pescatarian">Pescatarian</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Cuisine Preference
                </label>
                <select
                  name="cuisine_bias"
                  value={formData.cuisine_bias}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-purple-500 focus:outline-none"
                >
                  <option value="mixed">Mixed</option>
                  <option value="indian">Indian</option>
                  <option value="global">Global</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleNext}
              disabled={
                !formData.weight_kg ||
                !formData.height_cm ||
                !formData.age ||
                !formData.target_weight_kg ||
                !formData.target_date
              }
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold py-4 rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Calculate My Targets
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            {showWarning && (
              <div className="bg-yellow-100 dark:bg-yellow-900 border-2 border-yellow-500 rounded-xl p-4">
                <p className="text-yellow-800 dark:text-yellow-200 font-medium">
                  ⚠️ {warningMessage}
                </p>
              </div>
            )}

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-700 dark:to-gray-600 rounded-2xl p-6 space-y-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Your Personalized Daily Targets
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Calories</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {calculatedTargets.daily_calorie_target} kcal
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Protein</p>
                  <p className="text-2xl font-bold text-pink-600 dark:text-pink-400">
                    {calculatedTargets.protein_target_g}g
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Carbs</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {calculatedTargets.carbs_target_g}g
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Fat</p>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {calculatedTargets.fat_target_g}g
                  </p>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Target Pace</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {calculatedTargets.weeklyWeightChange > 0 ? '+' : ''}
                  {calculatedTargets.weeklyWeightChange.toFixed(2)} kg/week
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setStep(1)}
                className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold py-4 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold py-4 rounded-xl hover:shadow-lg transition-all"
              >
                {showWarning ? 'Accept & Continue' : 'Complete Setup'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
