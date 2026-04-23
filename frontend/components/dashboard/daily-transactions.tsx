'use client'

import { format } from 'date-fns'
import { zhTW } from 'date-fns/locale'
import { Card } from '@/components/ui/card'
import { useFinanceStore } from '@/lib/store'
import { FileX } from 'lucide-react'
import { CategoryIcon } from '@/components/shared/category-icon'
import { cn } from '@/lib/utils'

interface DailyTransactionsProps {
  selectedDate?: Date
}

export function DailyTransactions({ selectedDate }: DailyTransactionsProps) {
  const transactions = useFinanceStore((state) => state.transactions)
  const getCategoryById = useFinanceStore((state) => state.getCategoryById)

  const date = selectedDate || new Date()
  const dateStr = format(date, 'yyyy-MM-dd')

  const dayTransactions = transactions
    .filter((t) => t.date.startsWith(dateStr))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const formatCurrency = (amount: number, type: string) => {
    const formatted = new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
    return type === 'income' ? `+${formatted}` : `-${formatted}`
  }

  if (dayTransactions.length === 0) {
    return (
      <Card className="p-8 flex flex-col items-center justify-center text-center min-h-[200px]">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <FileX className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground">無記帳紀錄</p>
        <p className="text-sm text-muted-foreground/70 mt-1">
          {format(date, 'M月d日', { locale: zhTW })}
        </p>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-foreground">
          {format(date, 'M月d日 EEEE', { locale: zhTW })}
        </h3>
        <p className="text-sm text-muted-foreground">
          {dayTransactions.length} 筆紀錄
        </p>
      </div>
      <div className="divide-y divide-border">
        {dayTransactions.map((transaction) => {
          const category = getCategoryById(transaction.categoryId)
          return (
            <div
              key={transaction.id}
              className="flex items-center gap-3 p-4 hover:bg-accent/50 transition-colors"
            >
              <CategoryIcon
                icon={category?.icon || 'Circle'}
                color={category?.color || '#999'}
                size="md"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">
                  {category?.name || '未分類'}
                </p>
                {transaction.description && (
                  <p className="text-sm text-muted-foreground truncate">
                    {transaction.description}
                  </p>
                )}
              </div>
              <p
                className={cn(
                  'font-semibold whitespace-nowrap',
                  transaction.type === 'income'
                    ? 'text-green-600'
                    : 'text-destructive'
                )}
              >
                {formatCurrency(transaction.amount, transaction.type)}
              </p>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
