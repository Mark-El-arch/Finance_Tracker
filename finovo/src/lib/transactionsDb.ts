import { supabase } from './supabase'

export async function getTransactions() {
    const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) throw error
    return data
}

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
    return data
}

export async function deleteTransaction(id: string) {
    const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)

    if (error) throw error
    return 'Transaction deleted'
}

export async function editTransaction(id: string, updates: Record<string, any>) {
    const { data, error } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

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
        dailyAverageSpend: totalExpense / new Date(year, month, 0).getDate()
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

export async function getTotalBalance() {
    const { data, error } = await supabase
        .from('wallets')
        .select('balance')

    if (error) throw error
    return data.reduce((sum, w) => sum + w.balance, 0)
}