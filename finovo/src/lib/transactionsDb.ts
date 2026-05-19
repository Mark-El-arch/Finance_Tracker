import { supabase } from './supabase'

// ─── helpers ──────────────────────────────────────────────────────────────────

/** Adjust a wallet's balance by `delta` (positive = increase, negative = decrease). */
async function adjustWalletBalance(walletId: string, delta: number) {
  const { data: wallet, error: fetchError } = await supabase
    .from('wallets')
    .select('balance')
    .eq('id', walletId)
    .single()

  if (fetchError) throw fetchError

  const { error: updateError } = await supabase
    .from('wallets')
    .update({ balance: wallet.balance + delta })
    .eq('id', walletId)

  if (updateError) throw updateError
}

/** INCOME adds to the wallet, EXPENSE subtracts. */
function balanceDelta(type: 'INCOME' | 'EXPENSE', amount: number) {
  return type === 'INCOME' ? amount : -amount
}

// ─── read functions (unchanged) ───────────────────────────────────────────────

export async function getTransactions() {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getWallets() {
  const { data, error } = await supabase
    .from('wallets')
    .select('*')

  if (error) throw error
  return data
}

export async function getTotalBalance() {
  const { data, error } = await supabase
    .from('wallets')
    .select('balance')

  if (error) throw error
  return data.reduce((sum, w) => sum + w.balance, 0)
}

export async function getMonthlyStats(month: number, year: number) {
  const startDate = new Date(year, month - 1, 1).toISOString()
  const endDate = new Date(year, month, 0).toISOString()

  const { data, error } = await supabase
    .from('transactions')
    .select('amount, transaction_type')
    .gte('created_at', startDate)
    .lte('created_at', endDate)

  if (error) throw error

  const totalIncome = data
    .filter(t => t.transaction_type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpense = data
    .filter(t => t.transaction_type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0)

  return {
    totalIncome,
    totalExpense,
    netBalance: totalIncome - totalExpense,
    dailyAverageSpend: totalExpense / new Date(year, month, 0).getDate(),
  }
}

export async function getCategoryBreakdown(month: number, year: number) {
  const startDate = new Date(year, month - 1, 1).toISOString()
  const endDate = new Date(year, month, 0).toISOString()

  const { data, error } = await supabase
    .from('transactions')
    .select('category, amount')
    .eq('transaction_type', 'EXPENSE')
    .gte('created_at', startDate)
    .lte('created_at', endDate)

  if (error) throw error

  const breakdown: Record<string, number> = {}
  data.forEach(t => {
    breakdown[t.category] = (breakdown[t.category] ?? 0) + t.amount
  })

  return breakdown
}

// ─── write functions (updated to sync wallet balance) ─────────────────────────

export async function addTransaction(
  walletId: string,
  category: string,
  description: string,
  amount: number,
  transactionType: 'INCOME' | 'EXPENSE',
  tag: 'PERSONAL' | 'BUSINESS'
) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('transactions')
    .insert({
      user_id: user.id,
      wallet_id: walletId,
      category,
      description,
      amount,
      transaction_type: transactionType,
      tag,
    })
    .select()
    .single()

  if (error) throw error

  await adjustWalletBalance(walletId, balanceDelta(transactionType, amount))

  return data
}

export async function deleteTransaction(id: string) {
  // Fetch before deleting so we know what to reverse on the wallet
  const { data: tx, error: fetchError } = await supabase
    .from('transactions')
    .select('wallet_id, amount, transaction_type')
    .eq('id', id)
    .single()

  if (fetchError) throw fetchError

  const { error } = await supabase.from('transactions').delete().eq('id', id)
  if (error) throw error

  // Reverse the original effect on the wallet
  await adjustWalletBalance(tx.wallet_id, -balanceDelta(tx.transaction_type, tx.amount))

  return 'Transaction deleted'
}

export async function editTransaction(id: string, updates: Record<string, any>) {
  // Fetch original to calculate the net wallet adjustment
  const { data: oldTx, error: fetchError } = await supabase
    .from('transactions')
    .select('wallet_id, amount, transaction_type')
    .eq('id', id)
    .single()

  if (fetchError) throw fetchError

  const { data, error } = await supabase
    .from('transactions')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  const newWalletId: string = updates.wallet_id ?? oldTx.wallet_id
  const newType: 'INCOME' | 'EXPENSE' = updates.transaction_type ?? oldTx.transaction_type
  const newAmount: number = updates.amount ?? oldTx.amount

  if (newWalletId === oldTx.wallet_id) {
    // Same wallet — apply the net difference only
    const net = balanceDelta(newType, newAmount) - balanceDelta(oldTx.transaction_type, oldTx.amount)
    if (net !== 0) await adjustWalletBalance(oldTx.wallet_id, net)
  } else {
    // Wallet changed — reverse old, apply to new
    await adjustWalletBalance(oldTx.wallet_id, -balanceDelta(oldTx.transaction_type, oldTx.amount))
    await adjustWalletBalance(newWalletId, balanceDelta(newType, newAmount))
  }

  return data
}

export async function addWallet(name: string, type: string) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('wallets')
    .insert({ user_id: user.id, name, type, balance: 0 })
    .select()
    .single()

  if (error) throw error
  return data
}