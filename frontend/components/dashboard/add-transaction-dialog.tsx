'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useFinanceStore } from '@/lib/store'
import { CategoryIcon } from '@/components/shared/category-icon'
import { cn } from '@/lib/utils'
import type { TransactionType } from '@/lib/types'

interface AddTransactionDialogProps {
  open: boolean
  onClose: () => void
  selectedDate?: Date
}

export function AddTransactionDialog({
  open,
  onClose,
  selectedDate,
}: AddTransactionDialogProps) {
  const categories = useFinanceStore((state) => state.categories)
  const creditCards = useFinanceStore((state) => state.creditCards)
  const addTransaction = useFinanceStore((state) => state.addTransaction)

  const [type, setType] = useState<TransactionType>('expense')
  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [description, setDescription] = useState('')
  const [creditCardId, setCreditCardId] = useState('')
  const [date, setDate] = useState(
    selectedDate ? format(selectedDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')
  )

  const filteredCategories = categories.filter((c) =>
    type === 'income' ? c.type === 'income' : c.type === 'expense'
  )

  const handleSubmit = () => {
    if (!amount || !categoryId) return

    addTransaction({
      amount: parseFloat(amount),
      type,
      categoryId,
      description,
      date: new Date(date).toISOString(),
      creditCardId: type === 'credit_card' ? creditCardId : undefined,
    })

    // Reset form
    setAmount('')
    setCategoryId('')
    setDescription('')
    setCreditCardId('')
    onClose()
  }

  const handleNumberPad = (value: string) => {
    if (value === 'C') {
      setAmount('')
    } else if (value === 'DEL') {
      setAmount(amount.slice(0, -1))
    } else if (value === '=') {
      handleSubmit()
    } else if (['+', '-', '*', '/'].includes(value)) {
      setAmount(amount + value)
    } else {
      setAmount(amount + value)
    }
  }

  const calculateAmount = () => {
    try {
      // eslint-disable-next-line no-eval
      const result = eval(amount)
      if (typeof result === 'number' && !isNaN(result)) {
        setAmount(result.toString())
      }
    } catch {
      // Invalid expression, keep current amount
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm flex items-end lg:items-center justify-center">
      <Card className="w-full max-w-md max-h-[90vh] overflow-auto rounded-t-2xl lg:rounded-2xl shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
          <div className="flex bg-secondary rounded-lg p-1">
            <button
              className={cn(
                'px-4 py-1.5 rounded-md text-sm font-medium transition-all',
                type === 'expense' || type === 'credit_card'
                  ? 'bg-card shadow-sm text-foreground'
                  : 'text-muted-foreground'
              )}
              onClick={() => setType('expense')}
            >
              支出
            </button>
            <button
              className={cn(
                'px-4 py-1.5 rounded-md text-sm font-medium transition-all',
                type === 'income'
                  ? 'bg-card shadow-sm text-foreground'
                  : 'text-muted-foreground'
              )}
              onClick={() => setType('income')}
            >
              收入
            </button>
          </div>
          <div className="w-10" />
        </div>

        {/* Category Selection */}
        <div className="p-4 border-b border-border">
          <div className="grid grid-cols-5 gap-3">
            {filteredCategories.slice(0, 10).map((category) => (
              <button
                key={category.id}
                onClick={() => setCategoryId(category.id)}
                className={cn(
                  'flex flex-col items-center gap-1 p-2 rounded-xl transition-all',
                  categoryId === category.id
                    ? 'bg-primary/10 ring-2 ring-primary'
                    : 'hover:bg-accent'
                )}
              >
                <CategoryIcon icon={category.icon} color={category.color} size="md" />
                <span className="text-xs text-foreground truncate max-w-full">
                  {category.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Credit Card Selection (for expense) */}
        {type !== 'income' && creditCards.length > 0 && (
          <div className="p-4 border-b border-border">
            <Label className="text-sm text-muted-foreground mb-2 block">
              付款方式
            </Label>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => {
                  setType('expense')
                  setCreditCardId('')
                }}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm transition-all',
                  type === 'expense' && !creditCardId
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground'
                )}
              >
                現金
              </button>
              {creditCards.map((card) => (
                <button
                  key={card.id}
                  onClick={() => {
                    setType('credit_card')
                    setCreditCardId(card.id)
                  }}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm transition-all',
                    creditCardId === card.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground'
                  )}
                >
                  {card.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Amount Input */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Label className="text-muted-foreground">金額</Label>
            <Input
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="text-right text-2xl font-bold border-none shadow-none focus-visible:ring-0 p-0"
              onBlur={calculateAmount}
            />
          </div>
        </div>

        {/* Date Selection */}
        <div className="p-4 border-b border-border">
          <Label className="text-sm text-muted-foreground mb-2 block">日期</Label>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full"
          />
        </div>

        {/* Description */}
        <div className="p-4 border-b border-border">
          <Textarea
            placeholder="備註說明..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="resize-none"
            rows={2}
          />
        </div>

        {/* Number Pad */}
        <div className="p-4 grid grid-cols-4 gap-2">
          {['C', '/', '*', 'DEL'].map((key) => (
            <Button
              key={key}
              variant="secondary"
              className="h-12 text-lg font-medium"
              onClick={() => handleNumberPad(key)}
            >
              {key}
            </Button>
          ))}
          {['7', '8', '9', '+'].map((key) => (
            <Button
              key={key}
              variant={key === '+' ? 'secondary' : 'outline'}
              className="h-12 text-lg font-medium"
              onClick={() => handleNumberPad(key)}
            >
              {key}
            </Button>
          ))}
          {['4', '5', '6', '-'].map((key) => (
            <Button
              key={key}
              variant={key === '-' ? 'secondary' : 'outline'}
              className="h-12 text-lg font-medium"
              onClick={() => handleNumberPad(key)}
            >
              {key}
            </Button>
          ))}
          {['1', '2', '3'].map((key) => (
            <Button
              key={key}
              variant="outline"
              className="h-12 text-lg font-medium"
              onClick={() => handleNumberPad(key)}
            >
              {key}
            </Button>
          ))}
          <Button
            className="h-12 text-lg font-medium row-span-2 bg-primary hover:bg-primary/90"
            onClick={handleSubmit}
            disabled={!amount || !categoryId}
          >
            確認
          </Button>
          <Button
            variant="outline"
            className="h-12 text-lg font-medium col-span-2"
            onClick={() => handleNumberPad('0')}
          >
            0
          </Button>
          <Button
            variant="outline"
            className="h-12 text-lg font-medium"
            onClick={() => handleNumberPad('=')}
          >
            =
          </Button>
        </div>
      </Card>
    </div>
  )
}

export function AddTransactionButton({
  onClick,
}: {
  onClick: () => void
}) {
  return (
    <Button
      size="icon"
      className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 lg:bottom-8 lg:right-8"
      onClick={onClick}
    >
      <Plus className="h-6 w-6" />
    </Button>
  )
}
