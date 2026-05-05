import { filterTransactions, monthMap } from "./transactions.ts"
import type { Budget, BudgetStatus, GetBudgetStatus } from "./types.ts"



const budgets: Budget[] = [
    {
        budgetID: 1,
        userID: 1,
        category: "FOOD",
        limit: 500,
        month: "MARCH",
    },
    {
        budgetID: 2,
        userID: 1,
        category: "LAUNDRY",
        limit: 150,
        month: "JANUARY",
    },
    {
        budgetID: 3,
        userID: 1,
        category: "TRANSPORT",
        limit: 20,
        month: "JANUARY",
    },
]

function getBudgetStatus(budgetID: number): GetBudgetStatus | string{
    let categoryBudget = budgets.find(budget => budget.budgetID == budgetID);
    if (!categoryBudget) {
        return `No budget of id ${budgetID}`
    }
    let allExpenses = filterTransactions({category: categoryBudget.category, month: categoryBudget.month, transactionType: "EXPENSE"});
    let expenseSum = allExpenses.reduce((sum, transaction) => sum + transaction.amount, 0);
    let remaining = categoryBudget.limit - expenseSum;
    let warningAmount = 0.8 * categoryBudget.limit;
    let status: BudgetStatus;

    if (categoryBudget.limit < expenseSum) {
        status = "EXCEEDED";
    } else if (expenseSum > warningAmount) {
        status = "WARNING";
    } else {
        status = "OK";
    }

    return {
        category: categoryBudget.category,
        month: categoryBudget.month,
        limit: categoryBudget.limit, 
        spent: expenseSum,
        remaining: remaining,
        status: status,
    }
}

function getAllBudgetStatuses(): (GetBudgetStatus | string)[]{
    return budgets.map(budget => getBudgetStatus(budget.budgetID));
}

export { budgets, getBudgetStatus, getAllBudgetStatuses };