'use client'

import { useState, useMemo } from 'react'
import { format, startOfMonth, endOfMonth, subMonths, addMonths } from 'date-fns'
import { zhTW } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Search, Filter, Trash2, Edit } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useFinanceStore } from '@/lib/store'
import { CategoryIcon } from '@/components/shared/category-icon'
import { cn } from '@/lib/utils'
import {
  AddTransactionDialog,
  AddTransactionButton,
} from '@/components/dashboard/add-transaction-dialog'
import type { TransactionType } from '@/lib/types'

export default function RecordsPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<TransactionType | 'all'>('all')
  const [showAddDialog, setShowAddDialog] = useState(false)

  const transactions = useFinanceStore((state) => state.transactions)
  const getCategoryById = useFinanceStore((state) => state.getCategoryById)
  const deleteTransaction = useFinanceStore((state) => state.deleteTransaction)

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const monthKey = format(currentMonth, 'yyyy-MM')

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((t) => t.date.startsWith(monthKey))
      .filter((t) => filterType === 'all' || t.type === filterType)
      .filter((t) => {
        if (!searchQuery) return true
        const category = getCategoryById(t.categoryId)
        return (
          category?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.description?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [transactions, monthKey, filterType, searchQuery, getCategoryById])

  // Group transactions by date
  const groupedTransactions = useMemo(() => {
    const groups: Record<string, typeof filteredTransactions> = {}
    filteredTransactions.forEach((t) => {
      const dateKey = t.date.split('T')[0]
      if (!groups[dateKey]) {
        groups[dateKey] = []
      }
      groups[dateKey].push(t)
    })
    return groups
  }, [filteredTransactions])

  const monthStats = useMemo(() => {
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
    return { income, expense, creditCard, total: income - expense }
  }, [transactions, monthKey])

  const formatCurrency = (amount: number, showSign = false) => {
    const formatted = new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.abs(amount))
    if (showSign) {
      return amount >= 0 ? `+${formatted}` : `-${formatted}`
    }
    return formatted
  }

  return (
    <DashboardLayout title="記帳紀錄" subtitle="查看和管理所有收支明細">
      {/* Month Navigation */}
      <Card className="p-4 mb-6">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-lg font-semibold">
            {format(currentMonth, 'yyyy年M月', { locale: zhTW })}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Month Stats */}
        <div className="grid grid-cols-4 gap-4 mt-4">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">收入</p>
            <p className="font-semibold text-green-600">
              {formatCurrency(monthStats.income)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">支出</p>
            <p className="font-semibold text-destructive">
              {formatCurrency(monthStats.expense)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">信用卡</p>
            <p className="font-semibold text-orange-600">
              {formatCurrency(monthStats.creditCard)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">結餘</p>
            <p
              className={cn(
                'font-semibold',
                monthStats.total >= 0 ? 'text-green-600' : 'text-destructive'
              )}
            >
              {formatCurrency(monthStats.total, true)}
            </p>
          </div>
        </div>
      </Card>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜尋記錄..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex bg-secondary rounded-lg p-1">
          {[
            { value: 'all', label: '全部' },
            { value: 'expense', label: '支出' },
            { value: 'income', label: '收入' },
            { value: 'credit_card', label: '信用卡' },
          ].map((filter) => (
            <button
              key={filter.value}
              onClick={() => setFilterType(filter.value as TransactionType | 'all')}
              className={cn(
                'px-3 py-1.5 text-sm rounded-md transition-all',
                filterType === filter.value
                  ? 'bg-card shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions List */}
      <div className="space-y-4">
        {Object.keys(groupedTransactions).length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">本月無記錄</p>
          </Card>
        ) : (
          Object.entries(groupedTransactions).map(([dateKey, txs]) => (
            <Card key={dateKey} className="overflow-hidden">
              <div className="px-4 py-3 bg-secondary/50 border-b border-border">
                <p className="font-medium text-sm">
                  {format(new Date(dateKey), 'M月d日 EEEE', { locale: zhTW })}
                </p>
              </div>
              <div className="divide-y divide-border">
                {txs.map((transaction) => {
                  const category = getCategoryById(transaction.categoryId)
                  return (
                    <div
                      key={transaction.id}
                      className="flex items-center gap-3 p-4 hover:bg-accent/30 transition-colors group"
                    >
                      <CategoryIcon
                        icon={category?.icon || 'Circle'}
                        color={category?.color || '#999'}
                        size="md"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground">
                            {category?.name || '未分類'}
                          </p>
                          {transaction.type === 'credit_card' && (
                            <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full">
                              信用卡
                            </span>
                          )}
                        </div>
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
                        {transaction.type === 'income' ? '+' : '-'}
                        {formatCurrency(transaction.amount)}
                      </p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => deleteTransaction(transaction.id)}
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                      </Button>
                    </div>
                  )
                })}
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Floating Add Button */}
      <AddTransactionButton onClick={() => setShowAddDialog(true)} />

      {/* Add Transaction Dialog */}
      <AddTransactionDialog
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
      />
    </DashboardLayout>
  )
}
