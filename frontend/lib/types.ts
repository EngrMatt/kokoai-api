export type TransactionType = 'income' | 'expense' | 'credit_card'

export interface Category {
  id: string
  name: string
  icon: string
  color: string
  type: 'income' | 'expense'
  isDefault?: boolean
}

export interface Transaction {
  id: string
  amount: number
  type: TransactionType
  categoryId: string
  description: string
  date: string // ISO date string
  creditCardId?: string // Only for credit card transactions
  isRecurring?: boolean
  recurringId?: string
}

export interface CreditCard {
  id: string
  name: string
  lastFourDigits: string
  billingDay: number // Day of month when bill is due
  statementDay: number // Day of month when statement closes
  creditLimit: number
  color: string
}

export interface CreditCardBill {
  id: string
  creditCardId: string
  month: string // YYYY-MM format
  amount: number
  isPaid: boolean
  paidDate?: string
  dueDate: string
}

export interface RecurringPayment {
  id: string
  name: string
  amount: number
  categoryId: string
  day: number // Day of month
  isActive: boolean
  type: 'fixed' | 'estimated'
  lastPaidDate?: string
}

export interface SavingsGoal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  targetDate?: string
  monthlyTarget?: number
}

export interface MonthlyBudget {
  month: string // YYYY-MM format
  income: number
  expense: number
  creditCardSpending: number
  fixedPayments: number
  savingsGoal: number
  availableAmount: number
}

export interface UserSettings {
  currency: string
  locale: string
  monthStartDay: number // Day of month when financial month starts
  defaultSavingsGoal: number
}

// Default categories
export const DEFAULT_EXPENSE_CATEGORIES: Category[] = [
  { id: 'food', name: '飲食', icon: 'Utensils', color: '#5B9BD5', type: 'expense', isDefault: true },
  { id: 'entertainment', name: '娛樂', icon: 'Gamepad2', color: '#F4A460', type: 'expense', isDefault: true },
  { id: 'shopping', name: '購物', icon: 'ShoppingBag', color: '#DDA0DD', type: 'expense', isDefault: true },
  { id: 'transport', name: '交通', icon: 'Bus', color: '#90EE90', type: 'expense', isDefault: true },
  { id: 'medical', name: '醫療', icon: 'Heart', color: '#20B2AA', type: 'expense', isDefault: true },
  { id: 'home', name: '居家', icon: 'Home', color: '#6495ED', type: 'expense', isDefault: true },
  { id: 'breakfast', name: '早餐', icon: 'Coffee', color: '#5B9BD5', type: 'expense', isDefault: true },
  { id: 'lunch', name: '午餐', icon: 'Utensils', color: '#5B9BD5', type: 'expense', isDefault: true },
  { id: 'dinner', name: '晚餐', icon: 'UtensilsCrossed', color: '#5B9BD5', type: 'expense', isDefault: true },
  { id: 'snack', name: '點心', icon: 'Cookie', color: '#5B9BD5', type: 'expense', isDefault: true },
  { id: 'drinks', name: '飲料', icon: 'Cup', color: '#5B9BD5', type: 'expense', isDefault: true },
]

export const DEFAULT_INCOME_CATEGORIES: Category[] = [
  { id: 'salary', name: '薪資', icon: 'Wallet', color: '#4CAF50', type: 'income', isDefault: true },
  { id: 'bonus', name: '獎金', icon: 'Gift', color: '#8BC34A', type: 'income', isDefault: true },
  { id: 'investment', name: '投資', icon: 'TrendingUp', color: '#00BCD4', type: 'income', isDefault: true },
  { id: 'other_income', name: '其他收入', icon: 'Plus', color: '#9E9E9E', type: 'income', isDefault: true },
]

export const CREDIT_CARD_COLORS = [
  '#5B9BD5',
  '#F4A460',
  '#DDA0DD',
  '#20B2AA',
  '#6495ED',
  '#FF6B6B',
]
