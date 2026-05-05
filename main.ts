import { transactions, filterTransactions, monthMap } from "./transactions.js";
import { budgets, getAllBudgetStatuses, getBudgetStatus } from "./budget.js"
import { addGoal,contributeToGoal,getGoalProgress,savingsGoals } from "./savings.js";
import { getMonthlySummary, getCategoryBreakdown } from "./report.js";
import { getDashboardSummary } from "./dashboard.js";

// console.log("All Food:", filterTransactions({ category: "Food" }));
// console.log("March only:", filterTransactions({ month: "MARCH" }));
// console.log("Food in March:", filterTransactions({ category: "Food", month: "MARCH" }));
// console.log(getBudgetStatus(1));
// console.log(getAllBudgetStatuses())

// console.log(getGoalProgress(1));
// console.log(contributeToGoal(2, 70));
// console.log(getGoalProgress(2));

// console.log(getMonthlySummary("MARCH"));
// console.log(getCategoryBreakdown("MARCH"));

console.log(JSON.stringify(getDashboardSummary("MARCH"), null, 2));