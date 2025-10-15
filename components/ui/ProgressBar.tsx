'use client'

export default function ProgressBar({
  label,
  current,
  target,
  color,
  unit = 'g',
}: {
  label: string
  current: number
  target: number
  color: string
  unit?: string
}) {
  const percentage = Math.min((current / target) * 100, 100)

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
        <span className="text-sm font-semibold text-gray-900 dark:text-white">
          {current.toFixed(0)}/{target}{unit}
        </span>
      </div>
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  )
}
