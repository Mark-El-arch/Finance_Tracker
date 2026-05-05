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

export { Transaction, TransactionType, Tag, Month, SavingsGoal, Budget, BudgetStatus, TransactionFilters }