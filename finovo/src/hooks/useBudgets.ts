import { useState, useCallback } from 'react'
import { useFocusEffect } from 'expo-router'
import { addBudget, deleteBudget, getBudgetStatuses } from '../lib/budgetDb'
import { getWallets, addTransaction } from "../lib/transactionsDb"

interface Wallet {
  id: string
  name: string
  type: string
  balance: number
}

interface BudgetStatus {
  id: string
  category: string
  month: string
  limit: number
  spent: number
  remaining: number
  status: 'OK' | 'WARNING' | 'EXCEEDED'
}

export function useBudgets(initialMonth?: number, initialYear?: number) {
  const now = new Date()
  const [month, setMonth] = useState(initialMonth ?? now.getMonth() + 1)
  const [year, setYear] = useState(initialYear ?? now.getFullYear())

  const [budgetStatuses, setBudgetStatuses] = useState<BudgetStatus[]>([])
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [loading, setLoading] = useState(true)
  const [mutating, setMutating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchBudgets = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [statuses, walletsData] = await Promise.all([
        getBudgetStatuses(month, year),
        getWallets(),
      ])
      setBudgetStatuses(statuses)
      setWallets(walletsData ?? [])
    } catch (err: any) {
      setError(err.message ?? 'Failed to load budgets')
    } finally {
      setLoading(false)
    }
  }, [month, year])

  useFocusEffect(useCallback(() => {
    fetchBudgets()
  }, [fetchBudgets]))

  const handleAdd = async (category: string, limitAmount: number) => {
    setMutating(true)
    const monthStr = `${year}-${String(month).padStart(2, '0')}`
    try {
      await addBudget(category, monthStr, limitAmount)
      await fetchBudgets()
    } catch (err: any) {
      throw new Error(err.message ?? 'Failed to add budget')
    } finally {
      setMutating(false)
    }
  }

  const handleDelete = async (id: string) => {
    setMutating(true)
    try {
      await deleteBudget(id)
      setBudgetStatuses(prev => prev.filter(b => b.id !== id))
    } catch (err: any) {
      throw new Error(err.message ?? 'Failed to delete budget')
    } finally {
      setMutating(false)
    }
  }

  // Records an expense transaction against a budget category, then re-fetches
  // so the spent/remaining/status on the card updates immediately.
  const handleLogSpend = async (payload: {
    walletId: string
    category: string
    description: string
    amount: number
    tag: 'PERSONAL' | 'BUSINESS'
  }) => {
    setMutating(true)
    try {
      await addTransaction(
        payload.walletId,
        payload.category,
        payload.description,
        payload.amount,
        'EXPENSE',
        payload.tag,
      )
      await fetchBudgets() // re-fetch so spent/remaining/status reflects the new transaction
    } catch (err: any) {
      throw new Error(err.message ?? 'Failed to log spend')
    } finally {
      setMutating(false)
    }
  }

  const summary = {
    total: budgetStatuses.length,
    exceeded: budgetStatuses.filter(b => b.status === 'EXCEEDED').length,
    warning: budgetStatuses.filter(b => b.status === 'WARNING').length,
    ok: budgetStatuses.filter(b => b.status === 'OK').length,
    totalLimit: budgetStatuses.reduce((sum, b) => sum + b.limit, 0),
    totalSpent: budgetStatuses.reduce((sum, b) => sum + b.spent, 0),
  }

  const goToPrevMonth = () => {
    if (month === 1) { setMonth(12); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }

  const goToNextMonth = () => {
    if (month === 12) { setMonth(1); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  return {
    budgetStatuses,
    wallets,
    summary,
    month,
    year,
    loading,
    mutating,
    error,
    refresh: fetchBudgets,
    handleAdd,
    handleDelete,
    handleLogSpend,
    goToPrevMonth,
    goToNextMonth,
  }
}