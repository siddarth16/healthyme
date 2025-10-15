'use client'

import { useState } from 'react'
import { ParsedMealItem } from '@/types'

export default function MealLogger({ onMealSaved }: { onMealSaved?: () => void }) {
  const [inputText, setInputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [parsedItems, setParsedItems] = useState<ParsedMealItem[]>([])
  const [originalText, setOriginalText] = useState('')
  const [needsClarification, setNeedsClarification] = useState(false)
  const [clarificationQuestion, setClarificationQuestion] = useState('')

  const handleParse = async () => {
    if (!inputText.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/meals/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText }),
      })

      const data = await response.json()

      if (data.needs_clarification) {
        setNeedsClarification(true)
        setClarificationQuestion(data.clarification_question)
      } else {
        setNeedsClarification(false)
        setClarificationQuestion('')
        setParsedItems(data.items)
        setOriginalText(inputText)
      }
    } catch (error) {
      console.error('Error parsing meal:', error)
      alert('Failed to parse meal. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleItemChange = (index: number, field: keyof ParsedMealItem, value: any) => {
    const updated = [...parsedItems]
    updated[index] = { ...updated[index], [field]: value }
    setParsedItems(updated)
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/meals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          original_text: originalText,
          items: parsedItems,
          date: new Date().toISOString().split('T')[0],
        }),
      })

      if (response.ok) {
        setInputText('')
        setParsedItems([])
        setOriginalText('')
        onMealSaved?.()
      } else {
        alert('Failed to save meal. Please try again.')
      }
    } catch (error) {
      console.error('Error saving meal:', error)
      alert('Failed to save meal. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setParsedItems([])
    setOriginalText('')
    setNeedsClarification(false)
    setClarificationQuestion('')
  }

  return (
    <div className="space-y-4">
      {parsedItems.length === 0 && (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Log your meals
          </label>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="e.g., 2 rotis and 1 cup dal at 1:30 pm; 200 ml toned milk at 8 pm"
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-purple-500 focus:outline-none resize-none"
            rows={3}
            disabled={isLoading}
          />

          {needsClarification && (
            <div className="bg-yellow-100 dark:bg-yellow-900 border-2 border-yellow-500 rounded-xl p-4">
              <p className="text-yellow-800 dark:text-yellow-200">
                ❓ {clarificationQuestion}
              </p>
            </div>
          )}

          <button
            onClick={handleParse}
            disabled={isLoading || !inputText.trim()}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Parsing...' : 'Parse Meal'}
          </button>
        </div>
      )}

      {parsedItems.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Review & Edit Items
          </h3>

          <div className="space-y-3">
            {parsedItems.map((item, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-700 dark:to-gray-600 rounded-xl p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <input
                    type="text"
                    value={item.food_name}
                    onChange={(e) => handleItemChange(index, 'food_name', e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 mr-2"
                  />
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.confidence_level === 'high'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : item.confidence_level === 'medium'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}
                  >
                    {item.confidence_level}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-600 dark:text-gray-400">Quantity</label>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        handleItemChange(index, 'quantity', parseFloat(e.target.value))
                      }
                      className="w-full px-2 py-1 rounded border border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 dark:text-gray-400">Unit</label>
                    <input
                      type="text"
                      value={item.unit}
                      onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                      className="w-full px-2 py-1 rounded border border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="text-xs text-gray-600 dark:text-gray-400">Calories</label>
                    <input
                      type="number"
                      value={item.calories}
                      onChange={(e) => handleItemChange(index, 'calories', parseInt(e.target.value))}
                      className="w-full px-2 py-1 rounded border border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 dark:text-gray-400">Protein (g)</label>
                    <input
                      type="number"
                      value={item.protein_g}
                      onChange={(e) =>
                        handleItemChange(index, 'protein_g', parseFloat(e.target.value))
                      }
                      className="w-full px-2 py-1 rounded border border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 dark:text-gray-400">Carbs (g)</label>
                    <input
                      type="number"
                      value={item.carbs_g}
                      onChange={(e) =>
                        handleItemChange(index, 'carbs_g', parseFloat(e.target.value))
                      }
                      className="w-full px-2 py-1 rounded border border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 dark:text-gray-400">Fat (g)</label>
                    <input
                      type="number"
                      value={item.fat_g}
                      onChange={(e) =>
                        handleItemChange(index, 'fat_g', parseFloat(e.target.value))
                      }
                      className="w-full px-2 py-1 rounded border border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold py-3 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold py-3 rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Save Meal'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
