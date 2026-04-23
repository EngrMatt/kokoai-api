'use client'

import { useState, useMemo } from 'react'
import { format, subMonths, addMonths, startOfYear, eachMonthOfInterval, endOfYear } from 'date-fns'
import { zhTW } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Target, TrendingUp, Wallet, PiggyBank } from 'lucide-react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useFinanceStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

const COLORS = ['#5B9BD5', '#F4A460', '#DDA0DD', '#90EE90', '#20B2AA', '#6495ED', '#FF6B6B', '#9E9E9E']

export default function AnalysisPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [viewMode, setViewMode] = useState<'month' | 'year'>('month')
  const [savingsGoalInput, setSavingsGoalInput] = useState('')

  const transactions = useFinanceStore((state) => state.transactions)
  const categories = useFinanceStore((state) => state.categories)
  const savingsGoals = useFinanceStore((state) => state.savingsGoals)
  const recurringPayments = useFinanceStore((state) => state.recurringPayments)
  const addSavingsGoal = useFinanceStore((state) => state.addSavingsGoal)
  const getCategoryById = useFinanceStore((state) => state.getCategoryById)

  const monthKey = format(currentMonth, 'yyyy-MM')
  const yearKey = format(currentMonth, 'yyyy')

  // Monthly stats
  const monthlyData = useMemo(() => {
    const monthTxs = transactions.filter((t) => t.date.startsWith(monthKey))
    const income = monthTxs
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
    const expense = monthTxs
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
    const creditCard = monthTxs
      .filter((t) => t.type === 'credit_card')
      .reduce((sum, t) => sum + t.amount, 0)
    
    return { income, expense, creditCard, balance: income - expense }
  }, [transactions, monthKey])

  // Category breakdown for expenses
  const categoryBreakdown = useMemo(() => {
    const monthTxs = transactions.filter(
      (t) => t.date.startsWith(monthKey) && (t.type === 'expense' || t.type === 'credit_card')
    )
    
    const breakdown: Record<string, number> = {}
    monthTxs.forEach((t) => {
      const category = getCategoryById(t.categoryId)
      const name = category?.name || '其他'
      breakdown[name] = (breakdown[name] || 0) + t.amount
    })

    return Object.entries(breakdown)
      .map(([name, value], index) => ({
        name,
        value,
        color: COLORS[index % COLORS.length],
      }))
      .sort((a, b) => b.value - a.value)
  }, [transactions, monthKey, getCategoryById])

  // Monthly trend for the year
  const monthlyTrend = useMemo(() => {
    const yearStart = startOfYear(currentMonth)
    const yearEnd = endOfYear(currentMonth)
    const months = eachMonthOfInterval({ start: yearStart, end: yearEnd })

    return months.map((month) => {
      const key = format(month, 'yyyy-MM')
      const monthTxs = transactions.filter((t) => t.date.startsWith(key))
      const income = monthTxs
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0)
      const expense = monthTxs
        .filter((t) => t.type === 'expense' || t.type === 'credit_card')
        .reduce((sum, t) => sum + t.amount, 0)

      return {
        month: format(month, 'M月', { locale: zhTW }),
        收入: income,
        支出: expense,
      }
    })
  }, [transactions, currentMonth])

  // Fixed payments total
  const fixedPaymentsTotal = recurringPayments
    .filter((p) => p.isActive)
    .reduce((sum, p) => sum + p.amount, 0)

  // Savings goal total
  const totalSavingsGoal = savingsGoals.reduce(
    (sum, g) => sum + (g.monthlyTarget || 0),
    0
  )

  // Available amount calculation
  const availableAmount = monthlyData.income - monthlyData.expense - fixedPaymentsTotal - totalSavingsGoal

  // Spending suggestions based on habits
  const spendingSuggestions = useMemo(() => {
    if (categoryBreakdown.length === 0) return []
    
    const total = categoryBreakdown.reduce((sum, c) => sum + c.value, 0)
    return categoryBreakdown.slice(0, 5).map((c) => ({
      ...c,
      percentage: Math.round((c.value / total) * 100),
      suggestion: c.value > total * 0.3 ? '建議減少此類支出' : '支出比例正常',
    }))
  }, [categoryBreakdown])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const handleAddSavingsGoal = () => {
    const amount = parseFloat(savingsGoalInput)
    if (isNaN(amount) || amount <= 0) return
    
    addSavingsGoal({
      name: `${format(currentMonth, 'yyyy年M月')}存款目標`,
      targetAmount: amount * 12,
      currentAmount: 0,
      monthlyTarget: amount,
    })
    setSavingsGoalInput('')
  }

  const chartConfig = {
    收入: {
      label: '收入',
      color: '#4CAF50',
    },
    支出: {
      label: '支出',
      color: '#EF5350',
    },
  }

  return (
    <DashboardLayout title="分析報表" subtitle="深入了解您的消費習慣與財務狀況">
      {/* Month/Year Navigation */}
      <Card className="p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                setCurrentMonth(viewMode === 'month' ? subMonths(currentMonth, 1) : subMonths(currentMonth, 12))
              }
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h2 className="text-lg font-semibold min-w-[120px] text-center">
              {viewMode === 'month'
                ? format(currentMonth, 'yyyy年M月', { locale: zhTW })
                : format(currentMonth, 'yyyy年', { locale: zhTW })}
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                setCurrentMonth(viewMode === 'month' ? addMonths(currentMonth, 1) : addMonths(currentMonth, 12))
              }
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex bg-secondary rounded-lg p-1">
            <button
              onClick={() => setViewMode('month')}
              className={cn(
                'px-3 py-1.5 text-sm rounded-md transition-all',
                viewMode === 'month'
                  ? 'bg-card shadow-sm text-foreground'
                  : 'text-muted-foreground'
              )}
            >
              月
            </button>
            <button
              onClick={() => setViewMode('year')}
              className={cn(
                'px-3 py-1.5 text-sm rounded-md transition-all',
                viewMode === 'year'
                  ? 'bg-card shadow-sm text-foreground'
                  : 'text-muted-foreground'
              )}
            >
              年
            </button>
          </div>
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Pie Chart - Category Breakdown */}
          <Card className="p-4">
            <h3 className="font-semibold mb-4">支出分類</h3>
            {categoryBreakdown.length > 0 ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {categoryBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                本月無支出記錄
              </div>
            )}
          </Card>

          {/* Monthly Trend Bar Chart */}
          <Card className="p-4">
            <h3 className="font-semibold mb-4">年度收支趨勢</h3>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <BarChart data={monthlyTrend}>
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${v / 1000}k`} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Bar dataKey="收入" fill="#4CAF50" radius={[4, 4, 0, 0]} />
                <Bar dataKey="支出" fill="#EF5350" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Savings Goal Input */}
          <Card className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <Target className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold">存款目標設定</h3>
                <p className="text-sm text-muted-foreground">設定每月存款目標</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="輸入每月存款目標"
                value={savingsGoalInput}
                onChange={(e) => setSavingsGoalInput(e.target.value)}
              />
              <Button onClick={handleAddSavingsGoal}>新增</Button>
            </div>
            {savingsGoals.length > 0 && (
              <div className="mt-4 space-y-2">
                {savingsGoals.map((goal) => (
                  <div
                    key={goal.id}
                    className="flex items-center justify-between p-3 bg-secondary rounded-lg"
                  >
                    <span className="text-sm">{goal.name}</span>
                    <span className="font-semibold text-green-600">
                      {formatCurrency(goal.monthlyTarget || 0)}/月
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Financial Summary */}
          <Card className="p-4">
            <h3 className="font-semibold mb-4">本月財務摘要</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span>收入</span>
                </div>
                <span className="font-semibold text-green-600">
                  {formatCurrency(monthlyData.income)}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Wallet className="h-5 w-5 text-red-600" />
                  <span>支出</span>
                </div>
                <span className="font-semibold text-red-600">
                  {formatCurrency(monthlyData.expense)}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <PiggyBank className="h-5 w-5 text-orange-600" />
                  <span>固定繳費</span>
                </div>
                <span className="font-semibold text-orange-600">
                  {formatCurrency(fixedPaymentsTotal)}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
                <div className="flex items-center gap-3">
                  <Target className="h-5 w-5 text-primary" />
                  <span>存款目標</span>
                </div>
                <span className="font-semibold text-primary">
                  {formatCurrency(totalSavingsGoal)}
                </span>
              </div>
              <hr className="border-border" />
              <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                <span className="font-medium">可自由運用金額</span>
                <span
                  className={cn(
                    'font-bold text-lg',
                    availableAmount >= 0 ? 'text-green-600' : 'text-destructive'
                  )}
                >
                  {formatCurrency(availableAmount)}
                </span>
              </div>
            </div>
          </Card>

          {/* Spending Suggestions */}
          <Card className="p-4">
            <h3 className="font-semibold mb-4">支出建議</h3>
            {spendingSuggestions.length > 0 ? (
              <div className="space-y-3">
                {spendingSuggestions.map((item) => (
                  <div key={item.name} className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{item.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {item.percentage}%
                        </span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2 mt-1">
                        <div
                          className="h-2 rounded-full transition-all"
                          style={{
                            width: `${item.percentage}%`,
                            backgroundColor: item.color,
                          }}
                        />
                      </div>
                      <p
                        className={cn(
                          'text-xs mt-1',
                          item.percentage > 30
                            ? 'text-orange-600'
                            : 'text-green-600'
                        )}
                      >
                        {item.suggestion}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                尚無支出數據可分析
              </p>
            )}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
