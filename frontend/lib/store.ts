'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  Transaction,
  Category,
  CreditCard,
  CreditCardBill,
  RecurringPayment,
  SavingsGoal,
  UserSettings,
} from './types'
import {
  DEFAULT_EXPENSE_CATEGORIES,
  DEFAULT_INCOME_CATEGORIES,
} from './types'

interface FinanceStore {
  // Data
  transactions: Transaction[]
  categories: Category[]
  creditCards: CreditCard[]
  creditCardBills: CreditCardBill[]
  recurringPayments: RecurringPayment[]
  savingsGoals: SavingsGoal[]
  settings: UserSettings

  // Transaction actions
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void
  deleteTransaction: (id: string) => void

  // Category actions
  fetchCategories: (token: string) => Promise<void>
  addCategory: (category: Omit<Category, 'id'>) => void
  updateCategory: (id: string, category: Partial<Category>) => void
  deleteCategory: (id: string) => void

  // Credit Card actions
  addCreditCard: (card: Omit<CreditCard, 'id'>) => void
  updateCreditCard: (id: string, card: Partial<CreditCard>) => void
  deleteCreditCard: (id: string) => void

  // Credit Card Bill actions
  addCreditCardBill: (bill: Omit<CreditCardBill, 'id'>) => void
  updateCreditCardBill: (id: string, bill: Partial<CreditCardBill>) => void
  payCreditCardBill: (id: string) => void

  // Recurring Payment actions
  addRecurringPayment: (payment: Omit<RecurringPayment, 'id'>) => void
  updateRecurringPayment: (id: string, payment: Partial<RecurringPayment>) => void
  deleteRecurringPayment: (id: string) => void
  markRecurringPaymentPaid: (id: string) => void

  // Savings Goal actions
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id'>) => void
  updateSavingsGoal: (id: string, goal: Partial<SavingsGoal>) => void
  deleteSavingsGoal: (id: string) => void

  // Settings actions
  updateSettings: (settings: Partial<UserSettings>) => void

  // Computed helpers
  getTransactionsByDate: (date: string) => Transaction[]
  getTransactionsByMonth: (month: string) => Transaction[]
  getCategoryById: (id: string) => Category | undefined
  getCreditCardById: (id: string) => CreditCard | undefined
  getMonthlyStats: (month: string) => {
    income: number
    expense: number
    creditCardSpending: number
    balance: number
  }
}

const generateId = () => Math.random().toString(36).substring(2, 15)

export const useFinanceStore = create<FinanceStore>()(
  persist(
    (set, get) => ({
      // Initial data
      transactions: [],
      categories: [...DEFAULT_EXPENSE_CATEGORIES, ...DEFAULT_INCOME_CATEGORIES],
      creditCards: [],
      creditCardBills: [],
      recurringPayments: [],
      savingsGoals: [],
      settings: {
        currency: 'TWD',
        locale: 'zh-TW',
        monthStartDay: 1,
        defaultSavingsGoal: 10000,
      },

      // Transaction actions
      addTransaction: (transaction) => {
        const newTransaction = { ...transaction, id: generateId() }
        set((state) => ({
          transactions: [...state.transactions, newTransaction],
        }))
      },

      updateTransaction: (id, transaction) => {
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id ? { ...t, ...transaction } : t
          ),
        }))
      },

      deleteTransaction: (id) => {
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        }))
      },

      // Category actions
      fetchCategories: async (token) => {
        try {
          const { getCategories } = await import('./api/categories')
          const data = await getCategories(token)
          // Map API fields to frontend types
          const mappedData = data.map((cat: any) => ({
            ...cat,
            icon: cat.icon_type, // Map icon_type to icon
          }))
          set({ categories: mappedData })
        } catch (error) {
          console.error('Failed to fetch categories:', error)
        }
      },

      addCategory: (category) => {
        const newCategory = { ...category, id: generateId() }
        set((state) => ({
          categories: [...state.categories, newCategory],
        }))
      },

      updateCategory: (id, category) => {
        set((state) => ({
          categories: state.categories.map((c) =>
            c.id === id ? { ...c, ...category } : c
          ),
        }))
      },

      deleteCategory: (id) => {
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id || c.isDefault),
        }))
      },

      // Credit Card actions
      addCreditCard: (card) => {
        const newCard = { ...card, id: generateId() }
        set((state) => ({
          creditCards: [...state.creditCards, newCard],
        }))
      },

      updateCreditCard: (id, card) => {
        set((state) => ({
          creditCards: state.creditCards.map((c) =>
            c.id === id ? { ...c, ...card } : c
          ),
        }))
      },

      deleteCreditCard: (id) => {
        set((state) => ({
          creditCards: state.creditCards.filter((c) => c.id !== id),
        }))
      },

      // Credit Card Bill actions
      addCreditCardBill: (bill) => {
        const newBill = { ...bill, id: generateId() }
        set((state) => ({
          creditCardBills: [...state.creditCardBills, newBill],
        }))
      },

      updateCreditCardBill: (id, bill) => {
        set((state) => ({
          creditCardBills: state.creditCardBills.map((b) =>
            b.id === id ? { ...b, ...bill } : b
          ),
        }))
      },

      payCreditCardBill: (id) => {
        set((state) => ({
          creditCardBills: state.creditCardBills.map((b) =>
            b.id === id
              ? { ...b, isPaid: true, paidDate: new Date().toISOString() }
              : b
          ),
        }))
      },

      // Recurring Payment actions
      addRecurringPayment: (payment) => {
        const newPayment = { ...payment, id: generateId() }
        set((state) => ({
          recurringPayments: [...state.recurringPayments, newPayment],
        }))
      },

      updateRecurringPayment: (id, payment) => {
        set((state) => ({
          recurringPayments: state.recurringPayments.map((p) =>
            p.id === id ? { ...p, ...payment } : p
          ),
        }))
      },

      deleteRecurringPayment: (id) => {
        set((state) => ({
          recurringPayments: state.recurringPayments.filter((p) => p.id !== id),
        }))
      },

      markRecurringPaymentPaid: (id) => {
        set((state) => ({
          recurringPayments: state.recurringPayments.map((p) =>
            p.id === id
              ? { ...p, lastPaidDate: new Date().toISOString() }
              : p
          ),
        }))
      },

      // Savings Goal actions
      addSavingsGoal: (goal) => {
        const newGoal = { ...goal, id: generateId() }
        set((state) => ({
          savingsGoals: [...state.savingsGoals, newGoal],
        }))
      },

      updateSavingsGoal: (id, goal) => {
        set((state) => ({
          savingsGoals: state.savingsGoals.map((g) =>
            g.id === id ? { ...g, ...goal } : g
          ),
        }))
      },

      deleteSavingsGoal: (id) => {
        set((state) => ({
          savingsGoals: state.savingsGoals.filter((g) => g.id !== id),
        }))
      },

      // Settings actions
      updateSettings: (settings) => {
        set((state) => ({
          settings: { ...state.settings, ...settings },
        }))
      },

      // Computed helpers
      getTransactionsByDate: (date) => {
        return get().transactions.filter((t) => t.date.startsWith(date))
      },

      getTransactionsByMonth: (month) => {
        return get().transactions.filter((t) => t.date.startsWith(month))
      },

      getCategoryById: (id) => {
        return get().categories.find((c) => c.id === id)
      },

      getCreditCardById: (id) => {
        return get().creditCards.find((c) => c.id === id)
      },

      getMonthlyStats: (month) => {
        const transactions = get().getTransactionsByMonth(month)
        const income = transactions
          .filter((t) => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0)
        const expense = transactions
          .filter((t) => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0)
        const creditCardSpending = transactions
          .filter((t) => t.type === 'credit_card')
          .reduce((sum, t) => sum + t.amount, 0)
        
        return {
          income,
          expense,
          creditCardSpending,
          balance: income - expense,
        }
      },
    }),
    {
      name: 'koai-finance-storage',
    }
  )
)
