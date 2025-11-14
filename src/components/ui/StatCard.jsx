import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from './Card'
import { cn } from '../../lib/utils'

export default function StatCard({ title, value, icon: Icon, trend, trendLabel, className }) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {title}
        </CardTitle>
        {Icon && (
          <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
            <Icon className="w-4 h-4 text-primary-600" />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
          {value}
        </div>
        {trend && (
          <p className={cn(
            "text-xs flex items-center gap-1",
            trend > 0 ? "text-green-600" : "text-red-600"
          )}>
            <span>{trend > 0 ? '↑' : '↓'}</span>
            <span>{Math.abs(trend)}%</span>
            {trendLabel && <span className="text-gray-500">{trendLabel}</span>}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
