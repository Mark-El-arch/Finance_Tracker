//Transactions interface
interface Transaction {
    transactionID: number,
    wallet: string,
    category: string,
    description: string,
    amount: number,
    createdAt: string,
    transactionType: TransactionType,
    tag: Tag,
}

type TransactionType = 'INCOME' | 'EXPENSE'

type Tag = 'PERSONAL' | 'BUSINESS'

//Savings interface
interface SavingsGoal {
    goalID: number,
    userID: number,
    name: string,
    targetAmount: number,
    savedAmount: number,
    deadline: string,
}

//Budget interface
interface Budget {
    budgetID: number,
    userID: number,
    category: string,
    limit: number,
    month: Month,
}

type Month = 'JANUARY' | 'FEBRUARY' | 'MARCH' | 'APRIL' | 'MAY' | 'JUNE' | 'JULY' | 'AUGUST' | 'SEPTEMBER' | 'OCTOBER' | 'NOVEMBER' | 'DECEMBER'

type BudgetStatus = 'OK' | 'WARNING' | 'EXCEEDED'

//Filters interface
interface TransactionFilters {
    wallet?: string,
    transactionType?: TransactionType,
    category?: string,
    month?: Month,
}

//GetBudgetStatus interface
interface GetBudgetStatus {
    category: string,
    month: Month,
    limit: number, 
    spent: number,
    remaining: number,
    status: BudgetStatus,
}

//GoalProgress interface
interface GetGoalProgress {
    goalID: number, 
    name: string,
    targetAmount: number,
    savedAmount: number,
    amountRemaining: number,
    progressPercentage: number,
    deadline: string,
    dailyAmountNeeded: number,
    status: GoalStatus,
}

type GoalStatus = 'REACHED' | 'OVERDUE' | 'ON TRACK'


//Monthly Summary interface
interface GetMonthlySummary {
    month: Month,
    totalMonthIncome: number,
    totalMonthExpense: number,
    dailyAverageSpend: number,
    netBalance: number,
}

//Dashboard Summary interface
interface GetDashboardSummary {
    "Total Balance": number,
    "Budget Statuses": (GetBudgetStatus | string)[],
    "Goal Progress": (GetGoalProgress | string)[],
    "Monthly Summary": GetMonthlySummary,
}

export type { Transaction, GetGoalProgress, GetMonthlySummary, GetDashboardSummary, GoalStatus, TransactionType, Tag, Month, SavingsGoal, Budget, BudgetStatus, TransactionFilters, GetBudgetStatus }