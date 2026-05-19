import { useState, useCallback } from 'react'
import { useFocusEffect } from 'expo-router'
import { getMonthlyStats, getCategoryBreakdown, getTransactions } from '../lib/transactionsDb'

interface MonthlyStats {
  totalIncome: number
  totalExpense: number
  netBalance: number
  dailyAverageSpend: number
}

interface Transaction {
  id: string
  amount: number
  transaction_type: 'INCOME' | 'EXPENSE'
  tag: 'PERSONAL' | 'BUSINESS'
  category: string
  description: string
  created_at: string
}

export function useReports(initialMonth?: number, initialYear?: number) {
  const now = new Date()
  const [month, setMonth] = useState(initialMonth ?? now.getMonth() + 1)
  const [year, setYear] = useState(initialYear ?? now.getFullYear())

  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats | null>(null)
  const [categoryBreakdown, setCategoryBreakdown] = useState<Record<string, number>>({})
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchReports = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [stats, breakdown, txData] = await Promise.all([
        getMonthlyStats(month, year),
        getCategoryBreakdown(month, year),
        getTransactions(),
      ])
      setMonthlyStats(stats)
      setCategoryBreakdown(breakdown)
      setTransactions(txData ?? [])
    } catch (err: any) {
      setError(err.message ?? 'Failed to load report data')
    } finally {
      setLoading(false)
    }
  }, [month, year])

  useFocusEffect(useCallback(() => {
    fetchReports()
  }, [fetchReports]))

  // Filter transactions to just the selected month/year for the report
  const monthlyTransactions = transactions.filter(tx => {
    const d = new Date(tx.created_at)
    return d.getMonth() + 1 === month && d.getFullYear() === year
  })

  // Daily spending series — useful for a line/bar chart on the report screen
  const dailySpend = monthlyTransactions
    .filter(tx => tx.transaction_type === 'EXPENSE')
    .reduce<Record<string, number>>((acc, tx) => {
      const day = new Date(tx.created_at).getDate()
      acc[day] = (acc[day] ?? 0) + tx.amount
      return acc
    }, {})

  // Tag breakdown (PERSONAL vs BUSINESS) for the selected month
  const tagBreakdown = monthlyTransactions.reduce<Record<string, number>>((acc, tx) => {
    if (tx.transaction_type === 'EXPENSE') {
      acc[tx.tag] = (acc[tx.tag] ?? 0) + tx.amount
    }
    return acc
  }, {})

  // Sorted categories for ranked display (highest spend first)
  const rankedCategories = Object.entries(categoryBreakdown)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount)

  // Month navigation
  const goToPrevMonth = () => {
    if (month === 1) {
      setMonth(12)
      setYear(y => y - 1)
    } else {
      setMonth(m => m - 1)
    }
  }

  const goToNextMonth = () => {
    // Block navigation into future months
    const isCurrentOrFuture =
      year > now.getFullYear() ||
      (year === now.getFullYear() && month >= now.getMonth() + 1)
    if (isCurrentOrFuture) return
    if (month === 12) {
      setMonth(1)
      setYear(y => y + 1)
    } else {
      setMonth(m => m + 1)
    }
  }

  const isCurrentMonth = month === now.getMonth() + 1 && year === now.getFullYear()

  return {
    month,
    year,
    monthlyStats,
    categoryBreakdown,
    rankedCategories,
    dailySpend,
    tagBreakdown,
    monthlyTransactions,
    loading,
    error,
    refresh: fetchReports,
    goToPrevMonth,
    goToNextMonth,
    isCurrentMonth,
  }
}
