'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { UserProfile } from '@/types'
import { Download, Trash2, ArrowLeft } from 'lucide-react'

export default function ProfileSettings({ profile }: { profile: UserProfile }) {
  const router = useRouter()
  const [isExporting, setIsExporting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleExportData = async () => {
    setIsExporting(true)
    try {
      const response = await fetch('/api/profile/export')
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `caloriecoach-data-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error exporting data:', error)
      alert('Failed to export data')
    } finally {
      setIsExporting(false)
    }
  }

  const handleDeleteAccount = async () => {
    const confirmation = prompt(
      'This will permanently delete your account and all data. Type "DELETE" to confirm:'
    )

    if (confirmation !== 'DELETE') {
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch('/api/profile/delete', {
        method: 'DELETE',
      })

      if (response.ok) {
        alert('Your account has been deleted.')
        router.push('/login')
      } else {
        alert('Failed to delete account. Please try again.')
      }
    } catch (error) {
      console.error('Error deleting account:', error)
      alert('Failed to delete account')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.push('/dashboard')}
        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400"
      >
        <ArrowLeft size={20} />
        Back to Dashboard
      </button>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Profile Settings</h2>

        {/* Profile Info */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Your Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
              <p className="text-lg font-medium text-gray-900 dark:text-white">{profile.email}</p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Current Weight</p>
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {profile.weight_kg} kg
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Target Weight</p>
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {profile.target_weight_kg} kg
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Target Date</p>
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {new Date(profile.target_date).toLocaleDateString()}
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Daily Calorie Target</p>
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {profile.daily_calorie_target} kcal
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Activity Level</p>
              <p className="text-lg font-medium text-gray-900 dark:text-white capitalize">
                {profile.activity_level.replace('_', ' ')}
              </p>
            </div>
          </div>
        </div>

        {/* Macro Targets */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Daily Macro Targets
          </h3>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-pink-50 dark:bg-pink-900/20 rounded-xl p-4 text-center">
              <p className="text-sm text-pink-600 dark:text-pink-400">Protein</p>
              <p className="text-2xl font-bold text-pink-700 dark:text-pink-300">
                {profile.protein_target_g}g
              </p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-center">
              <p className="text-sm text-blue-600 dark:text-blue-400">Carbs</p>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                {profile.carbs_target_g}g
              </p>
            </div>

            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4 text-center">
              <p className="text-sm text-orange-600 dark:text-orange-400">Fat</p>
              <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                {profile.fat_target_g}g
              </p>
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="space-y-4 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Data Management</h3>

          <div className="space-y-3">
            <button
              onClick={handleExportData}
              disabled={isExporting}
              className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-xl transition-all disabled:opacity-50"
            >
              <Download size={20} />
              {isExporting ? 'Exporting...' : 'Export My Data'}
            </button>

            <button
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-xl transition-all disabled:opacity-50"
            >
              <Trash2 size={20} />
              {isDeleting ? 'Deleting...' : 'Delete Account'}
            </button>

            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Deleting your account will permanently remove all your data. This action cannot be
              undone.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
