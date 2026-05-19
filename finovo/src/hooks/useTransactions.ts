import { useState, useEffect, useCallback } from 'react'
import {
  getTransactions,
  addTransaction,
  editTransaction,
  deleteTransaction,
  getWallets,
} from '../lib/transactionsDb'

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

interface Wallet {
  id: string
  name: string
  type: string
  balance: number
}

interface AddTransactionPayload {
  walletId: string
  category: string
  description: string
  amount: number
  transactionType: 'INCOME' | 'EXPENSE'
  tag: 'PERSONAL' | 'BUSINESS'
}

// Filters that can be applied to the transactions list
interface TransactionFilters {
  type?: 'INCOME' | 'EXPENSE'
  tag?: 'PERSONAL' | 'BUSINESS'
  category?: string
  search?: string
}

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [filters, setFilters] = useState<TransactionFilters>({})
  const [loading, setLoading] = useState(true)
  const [mutating, setMutating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTransactions = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [txData, walletsData] = await Promise.all([getTransactions(), getWallets()])
      setTransactions(txData ?? [])
      setWallets(walletsData ?? [])
    } catch (err: any) {
      setError(err.message ?? 'Failed to load transactions')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  // Client-side filtering — no extra network calls
  const filteredTransactions = transactions.filter(tx => {
    if (filters.type && tx.transaction_type !== filters.type) return false
    if (filters.tag && tx.tag !== filters.tag) return false
    if (filters.category && tx.category !== filters.category) return false
    if (filters.search) {
      const q = filters.search.toLowerCase()
      if (
        !tx.description.toLowerCase().includes(q) &&
        !tx.category.toLowerCase().includes(q)
      )
        return false
    }
    return true
  })

  const handleAdd = async (payload: AddTransactionPayload) => {
    setMutating(true)
    try {
      const newTx = await addTransaction(
        payload.walletId,
        payload.category,
        payload.description,
        payload.amount,
        payload.transactionType,
        payload.tag
      )
      setTransactions(prev => [newTx, ...prev])
      return newTx
    } catch (err: any) {
      throw new Error(err.message ?? 'Failed to add transaction')
    } finally {
      setMutating(false)
    }
  }

  const handleEdit = async (id: string, updates: Partial<Transaction>) => {
    setMutating(true)
    try {
      const updated = await editTransaction(id, updates)
      setTransactions(prev => prev.map(tx => (tx.id === id ? updated : tx)))
      return updated
    } catch (err: any) {
      throw new Error(err.message ?? 'Failed to update transaction')
    } finally {
      setMutating(false)
    }
  }

  const handleDelete = async (id: string) => {
    setMutating(true)
    try {
      await deleteTransaction(id)
      setTransactions(prev => prev.filter(tx => tx.id !== id))
    } catch (err: any) {
      throw new Error(err.message ?? 'Failed to delete transaction')
    } finally {
      setMutating(false)
    }
  }

  // Unique categories derived from existing transactions — useful for filter dropdowns
  const categories = Array.from(new Set(transactions.map(tx => tx.category)))

  return {
    transactions: filteredTransactions,
    allTransactions: transactions,
    wallets,
    categories,
    filters,
    setFilters,
    loading,
    mutating,
    error,
    refresh: fetchTransactions,
    handleAdd,
    handleEdit,
    handleDelete,
  }
}
