import { supabase } from './supabase'

export async function getBudgets() {
    const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) throw error
    return data
}

export async function addBudget(category: string, month: string, limitAmount: number) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
        .from('budgets')
        .insert({
            user_id: user.id,
            category,
            month,
            limit_amount: limitAmount,
        })
        .select()
        .single()

    if (error) throw error
    return data
}

export async function deleteBudget(id: string) {
    const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', id)

    if (error) throw error
    return 'Budget deleted'
}

export async function getBudgetStatuses(month: number, year: number) {
    const budgets = await getBudgets()

    const startDate = new Date(year, month - 1, 1).toISOString()
    const endDate = new Date(year, month, 0).toISOString()

    const { data: transactions, error } = await supabase
        .from('transactions')
        .select('category, amount')
        .eq('transaction_type', 'EXPENSE')
        .gte('created_at', startDate)
        .lte('created_at', endDate)

    if (error) throw error

    const spentByCategory: Record<string, number> = {}
    transactions.forEach(t => {
        spentByCategory[t.category] = (spentByCategory[t.category] ?? 0) + t.amount
    })

    return budgets.map(budget => {
        const spent = spentByCategory[budget.category] ?? 0
        const remaining = budget.limit_amount - spent
        const percentage = (spent / budget.limit_amount) * 100

        let status: 'OK' | 'WARNING' | 'EXCEEDED' = 'OK'
        if (spent > budget.limit_amount) status = 'EXCEEDED'
        else if (percentage >= 80) status = 'WARNING'

        return {
            id: budget.id,
            category: budget.category,
            month: budget.month,
            limit: budget.limit_amount,
            spent,
            remaining,
            status,
        }
    })
}