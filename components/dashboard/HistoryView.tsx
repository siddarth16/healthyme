'use client'

import { useEffect, useState } from 'react'
import { UserProfile, MealEntry, ParsedMealItem } from '@/types'
import { format, subDays } from 'date-fns'

export default function HistoryView({ profile }: { profile: UserProfile }) {
  const [meals, setMeals] = useState<MealEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dateRange, setDateRange] = useState({
    start: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd'),
  })

  const fetchMeals = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(
        `/api/meals?start_date=${dateRange.start}&end_date=${dateRange.end}`
      )
      const data = await response.json()
      setMeals(data)
    } catch (error) {
      console.error('Error fetching meals:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMeals()
  }, [dateRange])

  // Group meals by date and calculate daily totals
  const groupedByDate = meals.reduce((acc, meal) => {
    const date = meal.date
    if (!acc[date]) {
      acc[date] = {
        meals: [],
        totals: { calories: 0, protein: 0, carbs: 0, fat: 0 },
      }
    }

    acc[date].meals.push(meal)

    meal.items.forEach((item: ParsedMealItem) => {
      acc[date].totals.calories += item.calories
      acc[date].totals.protein += item.protein_g
      acc[date].totals.carbs += item.carbs_g
      acc[date].totals.fat += item.fat_g
    })

    return acc
  }, {} as Record<string, { meals: MealEntry[]; totals: any }>)

  const sortedDates = Object.keys(groupedByDate).sort((a, b) => b.localeCompare(a))

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">History</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange((prev) => ({ ...prev, start: e.target.value }))}
              className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}
              className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-purple-500 focus:outline-none"
            />
          </div>
        </div>

        {isLoading ? (
          <p className="text-gray-600 dark:text-gray-400 text-center py-8">Loading...</p>
        ) : sortedDates.length === 0 ? (
          <div className="text-center py-8 space-y-2">
            <p className="text-gray-600 dark:text-gray-400">No meals logged in this period</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedDates.map((date) => {
              const { meals: dateMeals, totals } = groupedByDate[date]
              const caloriesProgress = (totals.calories / profile.daily_calorie_target) * 100
              const proteinProgress = (totals.protein / profile.protein_target_g) * 100
              const carbsProgress = (totals.carbs / profile.carbs_target_g) * 100
              const fatProgress = (totals.fat / profile.fat_target_g) * 100

              return (
                <div
                  key={date}
                  className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-700 dark:to-gray-600 rounded-xl p-5"
                >
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {format(new Date(date), 'MMM dd, yyyy')}
                    </h3>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {dateMeals.length} meal{dateMeals.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                      <p className="text-xs text-gray-600 dark:text-gray-400">Calories</p>
                      <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                        {totals.calories.toFixed(0)}
                      </p>
                      <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mt-1">
                        <div
                          className="h-full bg-purple-500 rounded-full"
                          style={{ width: `${Math.min(caloriesProgress, 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                      <p className="text-xs text-gray-600 dark:text-gray-400">Protein</p>
                      <p className="text-lg font-bold text-pink-600 dark:text-pink-400">
                        {totals.protein.toFixed(0)}g
                      </p>
                      <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mt-1">
                        <div
                          className="h-full bg-pink-500 rounded-full"
                          style={{ width: `${Math.min(proteinProgress, 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                      <p className="text-xs text-gray-600 dark:text-gray-400">Carbs</p>
                      <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        {totals.carbs.toFixed(0)}g
                      </p>
                      <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mt-1">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${Math.min(carbsProgress, 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                      <p className="text-xs text-gray-600 dark:text-gray-400">Fat</p>
                      <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                        {totals.fat.toFixed(0)}g
                      </p>
                      <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mt-1">
                        <div
                          className="h-full bg-orange-500 rounded-full"
                          style={{ width: `${Math.min(fatProgress, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <details className="mt-3">
                    <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400">
                      View meals
                    </summary>
                    <div className="mt-2 space-y-2">
                      {dateMeals.map((meal) => (
                        <div
                          key={meal.id}
                          className="bg-white dark:bg-gray-800 rounded-lg p-3 text-sm"
                        >
                          <p className="text-gray-600 dark:text-gray-400 italic mb-1">
                            "{meal.original_text}"
                          </p>
                          {meal.items.map((item: ParsedMealItem, idx: number) => (
                            <p key={idx} className="text-gray-700 dark:text-gray-300 text-xs">
                              • {item.food_name}: {item.calories} kcal
                            </p>
                          ))}
                        </div>
                      ))}
                    </div>
                  </details>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
