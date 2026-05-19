import { supabase } from './supabase'

export async function getSavingsGoals() {
    const { data, error } = await supabase
        .from('savings_goals')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) throw error
    return data
}

export async function addSavingsGoal(name: string, targetAmount: number, deadline: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
        .from('savings_goals')
        .insert({
            user_id: user.id,
            name,
            target_amount: targetAmount,
            saved_amount: 0,
            deadline,
        })
        .select()
        .single()

    if (error) throw error
    return data
}

export async function contributeToGoal(id: string, amount: number) {
    const { data: goal, error: fetchError } = await supabase
        .from('savings_goals')
        .select('saved_amount')
        .eq('id', id)
        .single()

    if (fetchError) throw fetchError

    const newSavedAmount = goal.saved_amount + amount

    const { data, error } = await supabase
        .from('savings_goals')
        .update({ saved_amount: newSavedAmount })
        .eq('id', id)
        .select()
        .single()

    if (error) throw error
    return data
}

export async function deleteSavingsGoal(id: string) {
    const { error } = await supabase
        .from('savings_goals')
        .delete()
        .eq('id', id)

    if (error) throw error
    return 'Goal deleted'
}

export async function getSavingsGoalProgress() {
    const goals = await getSavingsGoals()

    return goals.map(goal => {
        const amountRemaining = goal.target_amount - goal.saved_amount
        const progressPercentage = (goal.saved_amount / goal.target_amount) * 100
        const daysLeft = (new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        const dailyAmountNeeded = amountRemaining / daysLeft

        let status: 'REACHED' | 'OVERDUE' | 'ON TRACK' = 'ON TRACK'
        if (amountRemaining <= 0) status = 'REACHED'
        else if (new Date() > new Date(goal.deadline)) status = 'OVERDUE'

        return {
            id: goal.id,
            name: goal.name,
            targetAmount: goal.target_amount,
            savedAmount: goal.saved_amount,
            amountRemaining,
            progressPercentage,
            deadline: goal.deadline,
            dailyAmountNeeded,
            status,
        }
    })
}