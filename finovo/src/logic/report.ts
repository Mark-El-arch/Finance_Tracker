import { transactions, filterTransactions, monthMap } from "./transactions";
import type { Month, GetMonthlySummary } from "./types.ts";


function getMonthlySummary(month: Month): GetMonthlySummary {
    let monthTransactions = filterTransactions({month: month});
    let monthIncomes = monthTransactions.filter(transaction => transaction.transactionType == "INCOME");
    let totalMonthIncome = monthIncomes.reduce((sum, transaction) => sum + transaction.amount, 0);
    let monthExpenses = monthTransactions.filter(transaction => transaction.transactionType == "EXPENSE");
    let totalMonthExpense = monthExpenses.reduce((sum, transaction) => sum + transaction.amount, 0);
    let year = new Date().getFullYear();
    let dailyAverageSpend = totalMonthExpense / new Date(year, monthMap[month] +1, 0).getDate();
    let netBalance = totalMonthIncome - totalMonthExpense;

    return {
        month,
        totalMonthIncome,
        totalMonthExpense,
        dailyAverageSpend,
        netBalance,
    }
}

function getCategoryBreakdown(month: Month) {
    let monthTransactions = filterTransactions({month: month});
    let monthExpenses = monthTransactions.filter(transaction => transaction.transactionType == "EXPENSE");
    const categoryBreakdown: {[key: string]: number} = {};

    monthExpenses.forEach(transaction => {
        if (categoryBreakdown[transaction.category]) {
            categoryBreakdown[transaction.category]! += transaction.amount
        } else {
            categoryBreakdown[transaction.category] = transaction.amount
        }
    });

    return categoryBreakdown;
}

export { getMonthlySummary, getCategoryBreakdown }