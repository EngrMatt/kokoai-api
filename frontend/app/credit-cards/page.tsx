'use client'

import { useState, useMemo } from 'react'
import { format, subMonths, addMonths } from 'date-fns'
import { zhTW } from 'date-fns/locale'
import {
  Plus,
  CreditCard as CreditCardIcon,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Edit,
  X,
  AlertCircle,
  CheckCircle,
} from 'lucide-react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useFinanceStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { CREDIT_CARD_COLORS } from '@/lib/types'

export default function CreditCardsPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [showAddCard, setShowAddCard] = useState(false)
  const [editingCardId, setEditingCardId] = useState<string | null>(null)
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null)
  const [cardForm, setCardForm] = useState({
    name: '',
    lastFourDigits: '',
    billingDay: '15',
    statementDay: '25',
    creditLimit: '',
    color: CREDIT_CARD_COLORS[0],
  })

  const creditCards = useFinanceStore((state) => state.creditCards)
  const creditCardBills = useFinanceStore((state) => state.creditCardBills)
  const transactions = useFinanceStore((state) => state.transactions)
  const addCreditCard = useFinanceStore((state) => state.addCreditCard)
  const updateCreditCard = useFinanceStore((state) => state.updateCreditCard)
  const deleteCreditCard = useFinanceStore((state) => state.deleteCreditCard)
  const addCreditCardBill = useFinanceStore((state) => state.addCreditCardBill)
  const payCreditCardBill = useFinanceStore((state) => state.payCreditCardBill)
  const getCategoryById = useFinanceStore((state) => state.getCategoryById)

  const monthKey = format(currentMonth, 'yyyy-MM')

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Get credit card spending for each card
  const cardSpending = useMemo(() => {
    const spending: Record<string, number> = {}
    creditCards.forEach((card) => {
      const cardTxs = transactions.filter(
        (t) =>
          t.type === 'credit_card' &&
          t.creditCardId === card.id &&
          t.date.startsWith(monthKey)
      )
      spending[card.id] = cardTxs.reduce((sum, t) => sum + t.amount, 0)
    })
    return spending
  }, [creditCards, transactions, monthKey])

  // Get transactions for selected card
  const selectedCardTransactions = useMemo(() => {
    if (!selectedCardId) return []
    return transactions
      .filter(
        (t) =>
          t.type === 'credit_card' &&
          t.creditCardId === selectedCardId &&
          t.date.startsWith(monthKey)
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [selectedCardId, transactions, monthKey])

  // Total credit card spending this month
  const totalCreditSpending = Object.values(cardSpending).reduce(
    (sum, amount) => sum + amount,
    0
  )

  // Check if bill exists for card and month
  const getBillForCard = (cardId: string) => {
    return creditCardBills.find(
      (b) => b.creditCardId === cardId && b.month === monthKey
    )
  }

  const handleSubmitCard = () => {
    if (!cardForm.name || !cardForm.lastFourDigits) return

    if (editingCardId) {
      updateCreditCard(editingCardId, {
        name: cardForm.name,
        lastFourDigits: cardForm.lastFourDigits,
        billingDay: parseInt(cardForm.billingDay),
        statementDay: parseInt(cardForm.statementDay),
        creditLimit: parseFloat(cardForm.creditLimit) || 0,
        color: cardForm.color,
      })
      setEditingCardId(null)
    } else {
      addCreditCard({
        name: cardForm.name,
        lastFourDigits: cardForm.lastFourDigits,
        billingDay: parseInt(cardForm.billingDay),
        statementDay: parseInt(cardForm.statementDay),
        creditLimit: parseFloat(cardForm.creditLimit) || 0,
        color: cardForm.color,
      })
    }

    setCardForm({
      name: '',
      lastFourDigits: '',
      billingDay: '15',
      statementDay: '25',
      creditLimit: '',
      color: CREDIT_CARD_COLORS[0],
    })
    setShowAddCard(false)
  }

  const handleEditCard = (card: typeof creditCards[0]) => {
    setCardForm({
      name: card.name,
      lastFourDigits: card.lastFourDigits,
      billingDay: card.billingDay.toString(),
      statementDay: card.statementDay.toString(),
      creditLimit: card.creditLimit.toString(),
      color: card.color,
    })
    setEditingCardId(card.id)
    setShowAddCard(true)
  }

  const handleGenerateBill = (cardId: string) => {
    const spending = cardSpending[cardId] || 0
    const card = creditCards.find((c) => c.id === cardId)
    if (!card) return

    // Create bill with due date
    const dueDate = new Date(currentMonth)
    dueDate.setDate(card.billingDay)
    if (dueDate < new Date()) {
      dueDate.setMonth(dueDate.getMonth() + 1)
    }

    addCreditCardBill({
      creditCardId: cardId,
      month: monthKey,
      amount: spending,
      isPaid: false,
      dueDate: dueDate.toISOString(),
    })
  }

  return (
    <DashboardLayout title="信用卡管理" subtitle="追蹤信用卡消費與帳單">
      {/* Summary Card */}
      <Card className="p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-muted-foreground">本月信用卡消費總額</p>
            <p className="text-3xl font-bold text-orange-600 mt-1">
              {formatCurrency(totalCreditSpending)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              此金額不計入一般支出，待帳單繳費時再認列
            </p>
          </div>
          <Button onClick={() => setShowAddCard(true)}>
            <Plus className="h-4 w-4 mr-2" />
            新增卡片
          </Button>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <span className="font-medium">
            {format(currentMonth, 'yyyy年M月', { locale: zhTW })}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </Card>

      {/* Add/Edit Card Form */}
      {showAddCard && (
        <Card className="p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">
              {editingCardId ? '編輯信用卡' : '新增信用卡'}
            </h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setShowAddCard(false)
                setEditingCardId(null)
                setCardForm({
                  name: '',
                  lastFourDigits: '',
                  billingDay: '15',
                  statementDay: '25',
                  creditLimit: '',
                  color: CREDIT_CARD_COLORS[0],
                })
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cardName">卡片名稱</Label>
                <Input
                  id="cardName"
                  value={cardForm.name}
                  onChange={(e) =>
                    setCardForm({ ...cardForm, name: e.target.value })
                  }
                  placeholder="例如：玉山信用卡"
                />
              </div>
              <div>
                <Label htmlFor="lastFour">卡號末四碼</Label>
                <Input
                  id="lastFour"
                  maxLength={4}
                  value={cardForm.lastFourDigits}
                  onChange={(e) =>
                    setCardForm({ ...cardForm, lastFourDigits: e.target.value })
                  }
                  placeholder="1234"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="billingDay">繳費日</Label>
                <Input
                  id="billingDay"
                  type="number"
                  min="1"
                  max="28"
                  value={cardForm.billingDay}
                  onChange={(e) =>
                    setCardForm({ ...cardForm, billingDay: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="statementDay">結帳日</Label>
                <Input
                  id="statementDay"
                  type="number"
                  min="1"
                  max="28"
                  value={cardForm.statementDay}
                  onChange={(e) =>
                    setCardForm({ ...cardForm, statementDay: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="limit">信用額度</Label>
                <Input
                  id="limit"
                  type="number"
                  value={cardForm.creditLimit}
                  onChange={(e) =>
                    setCardForm({ ...cardForm, creditLimit: e.target.value })
                  }
                  placeholder="0"
                />
              </div>
            </div>
            <div>
              <Label className="mb-2 block">卡片顏色</Label>
              <div className="flex gap-2">
                {CREDIT_CARD_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setCardForm({ ...cardForm, color })}
                    className={cn(
                      'w-8 h-8 rounded-full transition-all',
                      cardForm.color === color
                        ? 'ring-2 ring-offset-2 ring-primary'
                        : ''
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <Button onClick={handleSubmitCard}>
              {editingCardId ? '更新' : '新增'}
            </Button>
          </div>
        </Card>
      )}

      {/* Credit Cards List */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Cards */}
        <div className="space-y-4">
          <h3 className="font-semibold">我的信用卡</h3>
          {creditCards.length === 0 ? (
            <Card className="p-8 text-center">
              <CreditCardIcon className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">尚未新增信用卡</p>
            </Card>
          ) : (
            creditCards.map((card) => {
              const spending = cardSpending[card.id] || 0
              const bill = getBillForCard(card.id)
              const usagePercent = card.creditLimit
                ? Math.min((spending / card.creditLimit) * 100, 100)
                : 0

              return (
                <Card
                  key={card.id}
                  className={cn(
                    'overflow-hidden cursor-pointer transition-all',
                    selectedCardId === card.id && 'ring-2 ring-primary'
                  )}
                  onClick={() =>
                    setSelectedCardId(
                      selectedCardId === card.id ? null : card.id
                    )
                  }
                >
                  {/* Card Header */}
                  <div
                    className="p-4 text-white"
                    style={{ backgroundColor: card.color }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{card.name}</p>
                        <p className="text-sm opacity-80">
                          **** **** **** {card.lastFourDigits}
                        </p>
                      </div>
                      <CreditCardIcon className="h-8 w-8 opacity-80" />
                    </div>
                  </div>
                  {/* Card Body */}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">
                        本月消費
                      </span>
                      <span className="font-semibold text-orange-600">
                        {formatCurrency(spending)}
                      </span>
                    </div>
                    {card.creditLimit > 0 && (
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                          <span>額度使用</span>
                          <span>
                            {spending.toLocaleString()} /{' '}
                            {card.creditLimit.toLocaleString()}
                          </span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div
                            className="h-2 rounded-full transition-all"
                            style={{
                              width: `${usagePercent}%`,
                              backgroundColor:
                                usagePercent > 80 ? '#EF5350' : card.color,
                            }}
                          />
                        </div>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        繳費日：每月 {card.billingDay} 日
                      </span>
                      {bill ? (
                        bill.isPaid ? (
                          <span className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="h-4 w-4" />
                            已繳
                          </span>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              payCreditCardBill(bill.id)
                            }}
                          >
                            標記已繳
                          </Button>
                        )
                      ) : spending > 0 ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleGenerateBill(card.id)
                          }}
                        >
                          產生帳單
                        </Button>
                      ) : null}
                    </div>
                    <div className="flex justify-end gap-1 mt-3 pt-3 border-t border-border">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEditCard(card)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteCreditCard(card.id)
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                      </Button>
                    </div>
                  </div>
                </Card>
              )
            })
          )}
        </div>

        {/* Selected Card Transactions */}
        <div className="space-y-4">
          <h3 className="font-semibold">消費明細</h3>
          {selectedCardId ? (
            selectedCardTransactions.length > 0 ? (
              <Card className="overflow-hidden">
                <div className="divide-y divide-border">
                  {selectedCardTransactions.map((tx) => {
                    const category = getCategoryById(tx.categoryId)
                    return (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between p-4"
                      >
                        <div>
                          <p className="font-medium">
                            {category?.name || '未分類'}
                          </p>
                          {tx.description && (
                            <p className="text-sm text-muted-foreground">
                              {tx.description}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(tx.date), 'M/d', { locale: zhTW })}
                          </p>
                        </div>
                        <p className="font-semibold text-orange-600">
                          -{formatCurrency(tx.amount)}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </Card>
            ) : (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">本月無消費紀錄</p>
              </Card>
            )
          ) : (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">請選擇一張卡片查看明細</p>
            </Card>
          )}

          {/* Info Card */}
          <Card className="p-4 bg-amber-50 border-amber-200">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-800">信用卡消費說明</p>
                <p className="text-sm text-amber-700 mt-1">
                  信用卡消費會獨立追蹤，不會計入當月支出。當您繳納信用卡帳單時，該筆款項會認列為實際支出，避免重複計算。
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
