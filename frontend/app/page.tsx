'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { FinanceCalendar } from '@/components/dashboard/finance-calendar'
import { BalanceOverview } from '@/components/dashboard/balance-overview'
import { DailyTransactions } from '@/components/dashboard/daily-transactions'
import {
  AddTransactionDialog,
  AddTransactionButton,
} from '@/components/dashboard/add-transaction-dialog'

export default function HomePage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [showAddDialog, setShowAddDialog] = useState(false)

  return (
    <DashboardLayout title="首頁" subtitle="管理您的每日收支">
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Column - Calendar */}
        <div className="space-y-6">
          <FinanceCalendar
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
          />
          <DailyTransactions selectedDate={selectedDate} />
        </div>

        {/* Right Column - Overview */}
        <div className="space-y-6">
          <BalanceOverview selectedDate={selectedDate} />
        </div>
      </div>

      {/* Floating Add Button */}
      <AddTransactionButton onClick={() => setShowAddDialog(true)} />

      {/* Add Transaction Dialog */}
      <AddTransactionDialog
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        selectedDate={selectedDate}
      />
    </DashboardLayout>
  )
}
