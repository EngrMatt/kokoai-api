'use client'

import { useState } from 'react'
import {
  Plus,
  Trash2,
  Edit,
  X,
  Settings2,
  Tags,
  Target,
  Download,
  Upload,
} from 'lucide-react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useFinanceStore } from '@/lib/store'
import { CategoryIcon } from '@/components/shared/category-icon'
import { cn } from '@/lib/utils'

const ICON_OPTIONS = [
  'Utensils',
  'Coffee',
  'ShoppingBag',
  'Bus',
  'Heart',
  'Home',
  'Gamepad2',
  'Gift',
  'Wallet',
  'TrendingUp',
  'Phone',
  'Wifi',
  'Zap',
  'Droplets',
  'CreditCard',
]

const COLOR_OPTIONS = [
  '#5B9BD5',
  '#F4A460',
  '#DDA0DD',
  '#90EE90',
  '#20B2AA',
  '#6495ED',
  '#FF6B6B',
  '#9E9E9E',
  '#FFD700',
  '#FF69B4',
]

import { useEffect } from 'react'
import { getCategories, createCategory, updateCategory as apiUpdateCategory, deleteCategory as apiDeleteCategory } from '@/lib/api/categories'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'categories' | 'goals' | 'general'>('categories')
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)
  const [categoryType, setCategoryType] = useState<'expense' | 'income'>('expense')
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    icon: 'Utensils',
    color: '#5B9BD5',
  })

  const categories = useFinanceStore((state) => state.categories)
  const fetchCategories = useFinanceStore((state) => state.fetchCategories)
  const savingsGoals = useFinanceStore((state) => state.savingsGoals)
  const settings = useFinanceStore((state) => state.settings)
  const transactions = useFinanceStore((state) => state.transactions)
  const recurringPayments = useFinanceStore((state) => state.recurringPayments)
  const creditCards = useFinanceStore((state) => state.creditCards)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      fetchCategories(token)
    }
  }, [fetchCategories])

  const expenseCategories = categories.filter((c) => (c.type as string).toLowerCase() === 'expense')
  const incomeCategories = categories.filter((c) => (c.type as string).toLowerCase() === 'income')

  const handleSubmitCategory = async () => {
    if (!categoryForm.name) return
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      if (editingCategoryId) {
        await apiUpdateCategory(token, editingCategoryId, {
          name: categoryForm.name,
          icon_type: categoryForm.icon,
          color: categoryForm.color,
        })
      } else {
        await createCategory(token, {
          name: categoryForm.name,
          icon_type: categoryForm.icon,
          color: categoryForm.color,
          type: categoryType.toUpperCase(),
        })
      }
      fetchCategories(token)
      setEditingCategoryId(null)
      setCategoryForm({ name: '', icon: 'Utensils', color: '#5B9BD5' })
      setShowAddCategory(false)
    } catch (error) {
      console.error('Failed to save category:', error)
      alert('儲存類別失敗')
    }
  }

  const handleDeleteCategory = async (id: string) => {
    const token = localStorage.getItem('token')
    if (!token) return
    if (!confirm('確定要刪除此類別嗎？')) return

    try {
      await apiDeleteCategory(token, id)
      fetchCategories(token)
    } catch (error) {
      console.error('Failed to delete category:', error)
      alert('刪除類別失敗')
    }
  }

  const handleEditCategory = (category: typeof categories[0]) => {
    setCategoryForm({
      name: category.name,
      icon: category.icon,
      color: category.color,
    })
    setCategoryType(category.type)
    setEditingCategoryId(category.id)
    setShowAddCategory(true)
  }

  const handleExportData = () => {
    const data = {
      transactions,
      categories,
      recurringPayments,
      creditCards,
      savingsGoals,
      settings,
      exportDate: new Date().toISOString(),
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `koai-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        // Note: In a real app, you'd validate and merge the data
        alert('資料匯入成功！請重新整理頁面。')
        localStorage.setItem('koai-finance-storage', JSON.stringify({ state: data }))
        window.location.reload()
      } catch {
        alert('匯入失敗：檔案格式錯誤')
      }
    }
    reader.readAsText(file)
  }

  return (
    <DashboardLayout title="設定" subtitle="管理類別、目標與系統設定">
      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { id: 'categories', label: '類別管理', icon: Tags },
          { id: 'goals', label: '存款目標', icon: Target },
          { id: 'general', label: '一般設定', icon: Settings2 },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg transition-all',
              activeTab === tab.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-accent'
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div className="space-y-6">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">自訂類別</h3>
              <Button onClick={() => setShowAddCategory(true)}>
                <Plus className="h-4 w-4 mr-2" />
                新增類別
              </Button>
            </div>

            {/* Add/Edit Form */}
            {showAddCategory && (
              <div className="mb-6 p-4 bg-secondary rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium">
                    {editingCategoryId ? '編輯類別' : '新增類別'}
                  </h4>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setShowAddCategory(false)
                      setEditingCategoryId(null)
                      setCategoryForm({ name: '', icon: 'Utensils', color: '#5B9BD5' })
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid gap-4">
                  <div className="flex bg-muted rounded-lg p-1 w-fit">
                    <button
                      onClick={() => setCategoryType('expense')}
                      className={cn(
                        'px-3 py-1.5 text-sm rounded-md transition-all',
                        categoryType === 'expense'
                          ? 'bg-card shadow-sm'
                          : 'text-muted-foreground'
                      )}
                    >
                      支出
                    </button>
                    <button
                      onClick={() => setCategoryType('income')}
                      className={cn(
                        'px-3 py-1.5 text-sm rounded-md transition-all',
                        categoryType === 'income'
                          ? 'bg-card shadow-sm'
                          : 'text-muted-foreground'
                      )}
                    >
                      收入
                    </button>
                  </div>

                  <div>
                    <Label htmlFor="catName">名稱</Label>
                    <Input
                      id="catName"
                      value={categoryForm.name}
                      onChange={(e) =>
                        setCategoryForm({ ...categoryForm, name: e.target.value })
                      }
                      placeholder="輸入類別名稱"
                    />
                  </div>

                  <div>
                    <Label className="mb-2 block">圖示</Label>
                    <div className="flex flex-wrap gap-2">
                      {ICON_OPTIONS.map((icon) => (
                        <button
                          key={icon}
                          onClick={() =>
                            setCategoryForm({ ...categoryForm, icon })
                          }
                          className={cn(
                            'p-2 rounded-lg border transition-all',
                            categoryForm.icon === icon
                              ? 'border-primary bg-primary/10'
                              : 'border-border hover:border-primary/50'
                          )}
                        >
                          <CategoryIcon
                            icon={icon}
                            color={categoryForm.color}
                            size="sm"
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="mb-2 block">顏色</Label>
                    <div className="flex flex-wrap gap-2">
                      {COLOR_OPTIONS.map((color) => (
                        <button
                          key={color}
                          onClick={() =>
                            setCategoryForm({ ...categoryForm, color })
                          }
                          className={cn(
                            'w-8 h-8 rounded-full transition-all',
                            categoryForm.color === color
                              ? 'ring-2 ring-offset-2 ring-primary'
                              : ''
                          )}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  <Button onClick={handleSubmitCategory}>
                    {editingCategoryId ? '更新' : '新增'}
                  </Button>
                </div>
              </div>
            )}

            {/* Expense Categories */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-muted-foreground mb-3">
                支出類別
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {expenseCategories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center gap-3 p-3 bg-secondary rounded-lg group"
                  >
                    <CategoryIcon
                      icon={category.icon}
                      color={category.color}
                      size="sm"
                    />
                    <span className="flex-1 text-sm truncate">
                      {category.name}
                    </span>
                    {!category.isDefault && (
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleEditCategory(category)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleDeleteCategory(category.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Income Categories */}
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-3">
                收入類別
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {incomeCategories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center gap-3 p-3 bg-secondary rounded-lg group"
                  >
                    <CategoryIcon
                      icon={category.icon}
                      color={category.color}
                      size="sm"
                    />
                    <span className="flex-1 text-sm truncate">
                      {category.name}
                    </span>
                    {!category.isDefault && (
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleEditCategory(category)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleDeleteCategory(category.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Goals Tab */}
      {activeTab === 'goals' && (
        <div className="space-y-6">
          <Card className="p-4">
            <h3 className="font-semibold mb-4">存款目標管理</h3>
            {savingsGoals.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                尚未設定存款目標，請至分析頁面新增
              </p>
            ) : (
              <div className="space-y-3">
                {savingsGoals.map((goal) => (
                  <div
                    key={goal.id}
                    className="flex items-center justify-between p-4 bg-secondary rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{goal.name}</p>
                      <p className="text-sm text-muted-foreground">
                        每月目標：{formatCurrency(goal.monthlyTarget || 0)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-green-600">
                        {formatCurrency(goal.targetAmount)}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteSavingsGoal(goal.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* General Tab */}
      {activeTab === 'general' && (
        <div className="space-y-6">
          <Card className="p-4">
            <h3 className="font-semibold mb-4">資料管理</h3>
            <div className="flex flex-col md:flex-row gap-4">
              <Button variant="outline" onClick={handleExportData}>
                <Download className="h-4 w-4 mr-2" />
                匯出資料
              </Button>
              <div>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  className="hidden"
                  id="import-file"
                />
                <Button
                  variant="outline"
                  onClick={() =>
                    document.getElementById('import-file')?.click()
                  }
                >
                  <Upload className="h-4 w-4 mr-2" />
                  匯入資料
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              匯出的資料可用於備份或轉移到其他裝置。匯入時會覆蓋現有資料。
            </p>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold mb-4">系統資訊</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">版本</span>
                <span>Ko.AI Finance v1.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">交易筆數</span>
                <span>{transactions.length} 筆</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">類別數</span>
                <span>{categories.length} 個</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">信用卡</span>
                <span>{creditCards.length} 張</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">固定繳費</span>
                <span>{recurringPayments.length} 項</span>
              </div>
            </div>
          </Card>
        </div>
      )}
    </DashboardLayout>
  )
}
