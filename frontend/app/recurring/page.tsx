'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { zhTW } from 'date-fns/locale'
import {
  Plus,
  Phone,
  Wifi,
  Zap,
  Droplets,
  CreditCard,
  Home,
  Car,
  Trash2,
  Check,
  X,
  Edit,
} from 'lucide-react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useFinanceStore } from '@/lib/store'
import { cn } from '@/lib/utils'

const RECURRING_ICONS = [
  { id: 'phone', icon: Phone, label: '電話費', color: '#5B9BD5' },
  { id: 'wifi', icon: Wifi, label: '網路費', color: '#20B2AA' },
  { id: 'electricity', icon: Zap, label: '電費', color: '#F4A460' },
  { id: 'water', icon: Droplets, label: '水費', color: '#6495ED' },
  { id: 'credit', icon: CreditCard, label: '信用卡費', color: '#DDA0DD' },
  { id: 'rent', icon: Home, label: '房租', color: '#90EE90' },
  { id: 'car', icon: Car, label: '車貸', color: '#FF6B6B' },
]

export default function RecurringPage() {
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    day: '1',
    iconId: 'phone',
    isActive: true,
  })

  const recurringPayments = useFinanceStore((state) => state.recurringPayments)
  const addRecurringPayment = useFinanceStore((state) => state.addRecurringPayment)
  const updateRecurringPayment = useFinanceStore((state) => state.updateRecurringPayment)
  const deleteRecurringPayment = useFinanceStore((state) => state.deleteRecurringPayment)
  const markRecurringPaymentPaid = useFinanceStore((state) => state.markRecurringPaymentPaid)
  const categories = useFinanceStore((state) => state.categories)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const totalMonthlyPayments = recurringPayments
    .filter((p) => p.isActive)
    .reduce((sum, p) => sum + p.amount, 0)

  const handleSubmit = () => {
    if (!formData.name || !formData.amount) return

    const iconConfig = RECURRING_ICONS.find((i) => i.id === formData.iconId)
    const categoryId = categories.find((c) => c.type === 'expense')?.id || 'home'

    if (editingId) {
      updateRecurringPayment(editingId, {
        name: formData.name,
        amount: parseFloat(formData.amount),
        day: parseInt(formData.day),
        isActive: formData.isActive,
      })
      setEditingId(null)
    } else {
      addRecurringPayment({
        name: formData.name,
        amount: parseFloat(formData.amount),
        day: parseInt(formData.day),
        categoryId,
        isActive: formData.isActive,
        type: 'fixed',
      })
    }

    setFormData({ name: '', amount: '', day: '1', iconId: 'phone', isActive: true })
    setShowAddForm(false)
  }

  const handleEdit = (payment: typeof recurringPayments[0]) => {
    setFormData({
      name: payment.name,
      amount: payment.amount.toString(),
      day: payment.day.toString(),
      iconId: 'phone',
      isActive: payment.isActive,
    })
    setEditingId(payment.id)
    setShowAddForm(true)
  }

  const getIconForPayment = (name: string) => {
    const lower = name.toLowerCase()
    if (lower.includes('電話') || lower.includes('手機')) return RECURRING_ICONS[0]
    if (lower.includes('網路')) return RECURRING_ICONS[1]
    if (lower.includes('電')) return RECURRING_ICONS[2]
    if (lower.includes('水')) return RECURRING_ICONS[3]
    if (lower.includes('信用') || lower.includes('卡費')) return RECURRING_ICONS[4]
    if (lower.includes('房') || lower.includes('租')) return RECURRING_ICONS[5]
    if (lower.includes('車')) return RECURRING_ICONS[6]
    return RECURRING_ICONS[4]
  }

  const isPaidThisMonth = (payment: typeof recurringPayments[0]) => {
    if (!payment.lastPaidDate) return false
    const paidMonth = format(new Date(payment.lastPaidDate), 'yyyy-MM')
    const currentMonth = format(new Date(), 'yyyy-MM')
    return paidMonth === currentMonth
  }

  return (
    <DashboardLayout title="固定繳費" subtitle="管理每月固定支出項目">
      {/* Summary Card */}
      <Card className="p-6 mb-6 bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">每月固定支出總額</p>
            <p className="text-3xl font-bold text-primary mt-1">
              {formatCurrency(totalMonthlyPayments)}
            </p>
          </div>
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            新增項目
          </Button>
        </div>
      </Card>

      {/* Add/Edit Form */}
      {showAddForm && (
        <Card className="p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">
              {editingId ? '編輯固定繳費' : '新增固定繳費'}
            </h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setShowAddForm(false)
                setEditingId(null)
                setFormData({ name: '', amount: '', day: '1', iconId: 'phone', isActive: true })
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Quick select icons */}
          <div className="mb-4">
            <Label className="text-sm text-muted-foreground mb-2 block">快速選擇</Label>
            <div className="flex flex-wrap gap-2">
              {RECURRING_ICONS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setFormData({
                      ...formData,
                      name: item.label,
                      iconId: item.id,
                    })
                  }}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg border transition-all',
                    formData.iconId === item.id && formData.name === item.label
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  <item.icon className="h-4 w-4" style={{ color: item.color }} />
                  <span className="text-sm">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">名稱</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="例如：電話費"
                />
              </div>
              <div>
                <Label htmlFor="amount">金額</Label>
                <Input
                  id="amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="day">繳費日期（每月幾號）</Label>
                <Input
                  id="day"
                  type="number"
                  min="1"
                  max="31"
                  value={formData.day}
                  onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isActive: checked })
                  }
                />
                <Label>啟用</Label>
              </div>
            </div>
            <Button onClick={handleSubmit} className="w-full">
              {editingId ? '更新' : '新增'}
            </Button>
          </div>
        </Card>
      )}

      {/* Payments List */}
      <div className="space-y-3">
        {recurringPayments.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">尚未設定固定繳費項目</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              點擊上方按鈕新增第一筆固定支出
            </p>
          </Card>
        ) : (
          recurringPayments.map((payment) => {
            const iconConfig = getIconForPayment(payment.name)
            const Icon = iconConfig.icon
            const paid = isPaidThisMonth(payment)

            return (
              <Card
                key={payment.id}
                className={cn(
                  'p-4 transition-all',
                  !payment.isActive && 'opacity-50'
                )}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${iconConfig.color}20` }}
                  >
                    <Icon className="h-6 w-6" style={{ color: iconConfig.color }} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{payment.name}</h4>
                      {!payment.isActive && (
                        <span className="text-xs px-2 py-0.5 bg-muted rounded-full text-muted-foreground">
                          已停用
                        </span>
                      )}
                      {paid && (
                        <span className="text-xs px-2 py-0.5 bg-green-100 rounded-full text-green-700">
                          本月已繳
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      每月 {payment.day} 日
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-lg">
                      {formatCurrency(payment.amount)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {!paid && payment.isActive && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => markRecurringPaymentPaid(payment.id)}
                        title="標記已繳"
                      >
                        <Check className="h-4 w-4 text-green-600" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(payment)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteRecurringPayment(payment.id)}
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
    </DashboardLayout>
  )
}
