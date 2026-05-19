import { useState, useCallback } from 'react'
import { useFocusEffect } from 'expo-router'
import { getTotalBalance, getMonthlyStats, getWallets, getTransactions, addWallet } from '../lib/transactionsDb'
import { supabase } from '../lib/supabase'

interface MonthlyStats {
  totalIncome: number
  totalExpense: number
  netBalance: number
  dailyAverageSpend: number
}

interface Wallet {
  id: string
  name: string
  type: string
  balance: number
}

interface Transaction {
  id: string
  wallet_id: string
  category: string
  description: string
  amount: number
  transaction_type: 'INCOME' | 'EXPENSE'
  tag: 'PERSONAL' | 'BUSINESS'
  created_at: string
}

export function useDashboard() {
  const now = new Date()
  const [month] = useState(now.getMonth() + 1)
  const [year] = useState(now.getFullYear())

  const [totalBalance, setTotalBalance] = useState<number>(0)
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats | null>(null)
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [mutating, setMutating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [balance, stats, walletsData, txData] = await Promise.all([
        getTotalBalance(),
        getMonthlyStats(month, year),
        getWallets(),
        getTransactions(),
      ])
      setTotalBalance(balance)
      setMonthlyStats(stats)
      setWallets(walletsData ?? [])
      setRecentTransactions((txData ?? []).slice(0, 5))
    } catch (err: any) {
      setError(err.message ?? 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }, [month, year])

  useFocusEffect(useCallback(() => {
    fetchAll()
  }, [fetchAll]))

  const handleAddWallet = async (name: string, type: string) => {
    setMutating(true)
    try {
      const newWallet = await addWallet(name, type)
      setWallets(prev => [...prev, newWallet])
      // balance stays the same — new wallet starts at 0
      return newWallet
    } catch (err: any) {
      throw new Error(err.message ?? 'Failed to add wallet')
    } finally {
      setMutating(false)
    }
  }

  const handleEditWallet = async (
    id: string,
    updates: { name: string; type: string; balance: number }
  ) => {
    setMutating(true)
    try {
      const { data, error } = await supabase
        .from('wallets')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      // Update local state so the card reflects the new balance immediately
      setWallets(prev => prev.map(w => (w.id === id ? { ...w, ...updates } : w)))

      // Recalculate total balance from the updated wallet list
      setTotalBalance(prev => {
        const old = wallets.find(w => w.id === id)
        if (!old) return prev
        return prev - old.balance + updates.balance
      })

      return data
    } catch (err: any) {
      throw new Error(err.message ?? 'Failed to update wallet')
    } finally {
      setMutating(false)
    }
  }

  const handleDeleteWallet = async (id: string) => {
    setMutating(true)
    try {
      const { error } = await supabase.from('wallets').delete().eq('id', id)
      if (error) throw error

      const deleted = wallets.find(w => w.id === id)
      setWallets(prev => prev.filter(w => w.id !== id))
      if (deleted) setTotalBalance(prev => prev - deleted.balance)
    } catch (err: any) {
      throw new Error(err.message ?? 'Failed to delete wallet')
    } finally {
      setMutating(false)
    }
  }

  return {
    totalBalance,
    monthlyStats,
    wallets,
    recentTransactions,
    loading,
    mutating,
    error,
    refresh: fetchAll,
    handleAddWallet,
    handleEditWallet,
    handleDeleteWallet,
  }
}
