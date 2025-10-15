'use client'

import { useEffect, useState } from 'react'
import { UserProfile, MealEntry, ParsedMealItem } from '@/types'
import ProgressRing from '@/components/ui/ProgressRing'
import ProgressBar from '@/components/ui/ProgressBar'
import MealLogger from '@/components/meals/MealLogger'
import { Trash2 } from 'lucide-react'

export default function TodayView({ profile }: { profile: UserProfile }) {
  const [meals, setMeals] = useState<MealEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dailyTotals, setDailyTotals] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  })

  const fetchTodayMeals = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const response = await fetch(`/api/meals?date=${today}`)
      const data = await response.json()
      setMeals(data)

      // Calculate totals
      const totals = data.reduce(
        (acc: any, meal: MealEntry) => {
          meal.items.forEach((item: ParsedMealItem) => {
            acc.calories += item.calories
            acc.protein += item.protein_g
            acc.carbs += item.carbs_g
            acc.fat += item.fat_g
          })
          return acc
        },
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      )

      setDailyTotals(totals)
    } catch (error) {
      console.error('Error fetching meals:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTodayMeals()
  }, [])

  const handleDeleteMeal = async (mealId: string) => {
    if (!confirm('Are you sure you want to delete this meal?')) return

    try {
      const response = await fetch(`/api/meals?id=${mealId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchTodayMeals()
      } else {
        alert('Failed to delete meal')
      }
    } catch (error) {
      console.error('Error deleting meal:', error)
      alert('Failed to delete meal')
    }
  }

  const caloriesProgress = (dailyTotals.calories / profile.daily_calorie_target) * 100
  const remaining = profile.daily_calorie_target - dailyTotals.calories

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Today's Progress</h2>

        <div className="flex justify-center mb-6">
          <ProgressRing
            progress={caloriesProgress}
            size={140}
            strokeWidth={12}
            color="#a855f7"
            label="Calories"
            value={`${dailyTotals.calories}/${profile.daily_calorie_target}`}
          />
        </div>

        <div className="text-center mb-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Remaining</p>
          <p
            className={`text-3xl font-bold ${
              remaining >= 0
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            }`}
          >
            {remaining >= 0 ? remaining : 0} kcal
          </p>
        </div>

        <div className="space-y-4">
          <ProgressBar
            label="Protein"
            current={dailyTotals.protein}
            target={profile.protein_target_g}
            color="#ec4899"
          />
          <ProgressBar
            label="Carbs"
            current={dailyTotals.carbs}
            target={profile.carbs_target_g}
            color="#3b82f6"
          />
          <ProgressBar
            label="Fat"
            current={dailyTotals.fat}
            target={profile.fat_target_g}
            color="#f59e0b"
          />
        </div>
      </div>

      {/* Meal Logger */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Log a Meal</h2>
        <MealLogger onMealSaved={fetchTodayMeals} />
      </div>

      {/* Meal Timeline */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Today's Meals</h2>

        {isLoading ? (
          <p className="text-gray-600 dark:text-gray-400 text-center py-8">Loading...</p>
        ) : meals.length === 0 ? (
          <div className="text-center py-8 space-y-2">
            <p className="text-gray-600 dark:text-gray-400">No meals logged yet today</p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Use the form above to log your first meal!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {meals.map((meal) => (
              <div
                key={meal.id}
                className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-700 dark:to-gray-600 rounded-xl p-4"
              >
                <div className="flex justify-between items-start mb-2">
                  <p className="text-sm text-gray-600 dark:text-gray-300 italic">
                    "{meal.original_text}"
                  </p>
                  <button
                    onClick={() => handleDeleteMeal(meal.id)}
                    className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1"
                    aria-label="Delete meal"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="space-y-2">
                  {meal.items.map((item: ParsedMealItem, idx: number) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center text-sm bg-white dark:bg-gray-800 rounded-lg p-2"
                    >
                      <span className="font-medium text-gray-900 dark:text-white">
                        {item.food_name} ({item.quantity} {item.unit})
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">
                        {item.calories} kcal • P: {item.protein_g.toFixed(0)}g • C:{' '}
                        {item.carbs_g.toFixed(0)}g • F: {item.fat_g.toFixed(0)}g
                      </span>
                    </div>
                  ))}
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                  {new Date(meal.created_at).toLocaleTimeString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
