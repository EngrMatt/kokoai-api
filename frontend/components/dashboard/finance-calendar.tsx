'use client'

import { useState } from 'react'
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  isToday,
} from 'date-fns'
import { zhTW } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { useFinanceStore } from '@/lib/store'

interface FinanceCalendarProps {
  onDateSelect?: (date: Date) => void
  selectedDate?: Date
}

export function FinanceCalendar({ onDateSelect, selectedDate }: FinanceCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const transactions = useFinanceStore((state) => state.transactions)

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })
  const weekDays = ['日', '一', '二', '三', '四', '五', '六']

  const getTransactionsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return transactions.filter((t) => t.date.startsWith(dateStr))
  }

  const hasTransactions = (date: Date) => {
    return getTransactionsForDate(date).length > 0
  }

  const hasExpense = (date: Date) => {
    return getTransactionsForDate(date).some((t) => t.type === 'expense' || t.type === 'credit_card')
  }

  const hasIncome = (date: Date) => {
    return getTransactionsForDate(date).some((t) => t.type === 'income')
  }

  const goToToday = () => {
    setCurrentMonth(new Date())
    onDateSelect?.(new Date())
  }

  return (
    <Card className="p-4 lg:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            className="px-3 py-1.5 text-sm font-medium"
            onClick={goToToday}
          >
            今日
          </Button>
          <span className="text-lg font-semibold text-foreground">
            {format(currentMonth, 'yyyy年M月', { locale: zhTW })}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button variant="ghost" size="icon" onClick={goToToday}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Week days header */}
      <div className="grid grid-cols-7 mb-2">
        {weekDays.map((day, index) => (
          <div
            key={day}
            className={cn(
              'text-center text-sm font-medium py-2',
              index === 0 ? 'text-destructive' : 'text-muted-foreground',
              index === 6 ? 'text-destructive' : ''
            )}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar days */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const isCurrentMonth = isSameMonth(day, currentMonth)
          const isSelected = selectedDate && isSameDay(day, selectedDate)
          const isDayToday = isToday(day)
          const dayHasTransactions = hasTransactions(day)
          const dayHasExpense = hasExpense(day)
          const dayHasIncome = hasIncome(day)

          return (
            <button
              key={day.toISOString()}
              onClick={() => onDateSelect?.(day)}
              className={cn(
                'relative aspect-square flex flex-col items-center justify-center rounded-lg text-sm transition-all',
                !isCurrentMonth && 'text-muted-foreground/50',
                isCurrentMonth && 'text-foreground',
                isSelected && 'bg-primary text-primary-foreground',
                !isSelected && isDayToday && 'bg-secondary text-secondary-foreground font-semibold',
                !isSelected && !isDayToday && 'hover:bg-accent'
              )}
            >
              <span>{format(day, 'd')}</span>
              {dayHasTransactions && (
                <div className="flex gap-0.5 mt-0.5">
                  {dayHasExpense && (
                    <span
                      className={cn(
                        'w-1.5 h-1.5 rounded-full',
                        isSelected ? 'bg-primary-foreground/70' : 'bg-destructive'
                      )}
                    />
                  )}
                  {dayHasIncome && (
                    <span
                      className={cn(
                        'w-1.5 h-1.5 rounded-full',
                        isSelected ? 'bg-primary-foreground/70' : 'bg-green-500'
                      )}
                    />
                  )}
                </div>
              )}
            </button>
          )
        })}
      </div>
    </Card>
  )
}
