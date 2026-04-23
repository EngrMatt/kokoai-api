'use client'

import { format } from 'date-fns'
import { Card } from '@/components/ui/card'
import { useFinanceStore } from '@/lib/store'
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react'

interface BalanceOverviewProps {
  selectedDate?: Date
}

export function BalanceOverview({ selectedDate }: BalanceOverviewProps) {
  const transactions = useFinanceStore((state) => state.transactions)
  const savingsGoals = useFinanceStore((state) => state.savingsGoals)
  const recurringPayments = useFinanceStore((state) => state.recurringPayments)

  const currentMonth = selectedDate
    ? format(selectedDate, 'yyyy-MM')
    : format(new Date(), 'yyyy-MM')

  const monthTransactions = transactions.filter((t) =>
    t.date.startsWith(currentMonth)
  )

  const income = monthTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const expense = monthTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const creditCardSpending = monthTransactions
    .filter((t) => t.type === 'credit_card')
    .reduce((sum, t) => sum + t.amount, 0)

  const balance = income - expense

  // Calculate fixed payments total
  const fixedPaymentsTotal = recurringPayments
    .filter((p) => p.isActive)
    .reduce((sum, p) => sum + p.amount, 0)

  // Calculate savings goal for the month
  const totalSavingsGoal = savingsGoals.reduce(
    (sum, g) => sum + (g.monthlyTarget || 0),
    0
  )

  // Available amount = income - expense - fixed payments - savings goal
  const availableAmount = income - expense - fixedPaymentsTotal - totalSavingsGoal

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="space-y-4">
      {/* Main Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 text-center">
          <p className="text-sm text-destructive font-medium mb-1">支出</p>
          <p className="text-xl lg:text-2xl font-bold text-destructive">
            {formatCurrency(expense)}
          </p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-sm text-green-600 font-medium mb-1">收入</p>
          <p className="text-xl lg:text-2xl font-bold text-green-600">
            {formatCurrency(income)}
          </p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-sm text-primary font-medium mb-1">當月結餘</p>
          <p className="text-xl lg:text-2xl font-bold text-primary">
            {formatCurrency(balance)}
          </p>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
              <TrendingDown className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">信用卡消費</p>
              <p className="text-lg font-semibold text-orange-600">
                {formatCurrency(creditCardSpending)}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Wallet className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">可自由運用</p>
              <p className="text-lg font-semibold text-primary">
                {formatCurrency(availableAmount)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-secondary-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">固定繳費</p>
              <p className="text-lg font-semibold">
                {formatCurrency(fixedPaymentsTotal)}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">本月存款目標</p>
              <p className="text-lg font-semibold text-green-600">
                {formatCurrency(totalSavingsGoal)}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
