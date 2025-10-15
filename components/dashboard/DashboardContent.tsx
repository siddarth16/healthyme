'use client'

import { useState } from 'react'
import { UserProfile } from '@/types'
import TodayView from './TodayView'
import HistoryView from './HistoryView'
import CoachingChat from '@/components/coaching/CoachingChat'
import { Calendar, Home, MessageCircle } from 'lucide-react'

export default function DashboardContent({ profile }: { profile: UserProfile }) {
  const [activeTab, setActiveTab] = useState<'today' | 'history' | 'coach'>('today')

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 bg-white dark:bg-gray-800 rounded-2xl p-2 shadow-lg">
        <button
          onClick={() => setActiveTab('today')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold transition-all ${
            activeTab === 'today'
              ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <Home size={20} />
          <span className="hidden sm:inline">Today</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold transition-all ${
            activeTab === 'history'
              ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <Calendar size={20} />
          <span className="hidden sm:inline">History</span>
        </button>

        <button
          onClick={() => setActiveTab('coach')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold transition-all ${
            activeTab === 'coach'
              ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <MessageCircle size={20} />
          <span className="hidden sm:inline">Coach</span>
        </button>
      </div>

      {/* Content */}
      <div>
        {activeTab === 'today' && <TodayView profile={profile} />}
        {activeTab === 'history' && <HistoryView profile={profile} />}
        {activeTab === 'coach' && <CoachingChat />}
      </div>
    </div>
  )
}
