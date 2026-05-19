import { useState , useCallback } from 'react'
import { useFocusEffect } from 'expo-router'
import {
  getSavingsGoalProgress,
  addSavingsGoal,
  contributeToGoal,
  deleteSavingsGoal,
} from '../lib/savingsDb'

interface SavingsGoalProgress {
  id: string
  name: string
  targetAmount: number
  savedAmount: number
  amountRemaining: number
  progressPercentage: number
  deadline: string
  dailyAmountNeeded: number
  status: 'REACHED' | 'OVERDUE' | 'ON TRACK'
}

export function useSavings() {
  const [goals, setGoals] = useState<SavingsGoalProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [mutating, setMutating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchGoals = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getSavingsGoalProgress()
      setGoals(data)
    } catch (err: any) {
      setError(err.message ?? 'Failed to load savings goals')
    } finally {
      setLoading(false)
    }
  }, [])

  useFocusEffect(useCallback(() => {
    fetchGoals()
  }, [fetchGoals])
)

  const handleAdd = async (name: string, targetAmount: number, deadline: string) => {
    setMutating(true)
    try {
      await addSavingsGoal(name, targetAmount, deadline)
      await fetchGoals() // Re-fetch to get full progress shape immediately
    } catch (err: any) {
      throw new Error(err.message ?? 'Failed to add savings goal')
    } finally {
      setMutating(false)
    }
  }

  const handleContribute = async (id: string, amount: number) => {
    setMutating(true)
    try {
      await contributeToGoal(id, amount)
      // Optimistically update the saved amount and recalculate derived fields locally
      setGoals(prev =>
        prev.map(goal => {
          if (goal.id !== id) return goal
          const newSaved = goal.savedAmount + amount
          const remaining = goal.targetAmount - newSaved
          const daysLeft =
            (new Date(goal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
          return {
            ...goal,
            savedAmount: newSaved,
            amountRemaining: remaining,
            progressPercentage: (newSaved / goal.targetAmount) * 100,
            dailyAmountNeeded: daysLeft > 0 ? remaining / daysLeft : 0,
            status:
              remaining <= 0
                ? 'REACHED'
                : new Date() > new Date(goal.deadline)
                ? 'OVERDUE'
                : 'ON TRACK',
          }
        })
      )
    } catch (err: any) {
      // Roll back optimistic update by re-fetching on failure
      await fetchGoals()
      throw new Error(err.message ?? 'Failed to contribute to goal')
    } finally {
      setMutating(false)
    }
  }

  const handleDelete = async (id: string) => {
    setMutating(true)
    try {
      await deleteSavingsGoal(id)
      setGoals(prev => prev.filter(g => g.id !== id))
    } catch (err: any) {
      throw new Error(err.message ?? 'Failed to delete savings goal')
    } finally {
      setMutating(false)
    }
  }

  // Aggregated overview stats for the savings screen header
  const summary = {
    totalGoals: goals.length,
    reached: goals.filter(g => g.status === 'REACHED').length,
    onTrack: goals.filter(g => g.status === 'ON TRACK').length,
    overdue: goals.filter(g => g.status === 'OVERDUE').length,
    totalSaved: goals.reduce((sum, g) => sum + g.savedAmount, 0),
    totalTarget: goals.reduce((sum, g) => sum + g.targetAmount, 0),
  }

  return {
    goals,
    summary,
    loading,
    mutating,
    error,
    refresh: fetchGoals,
    handleAdd,
    handleContribute,
    handleDelete,
  }
}
