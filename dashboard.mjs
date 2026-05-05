import { getTotalBalance } from "./transactions.mjs";
import { getAllBudgetStatuses } from "./budget.mjs";
import { getAllGoalProgress } from "./savings.mjs";
import { getMonthlySummary } from "./report.mjs";

function getDashboardSummary(month) {
    return {
        "Total Balance": getTotalBalance(),
        "Budget Statuses": getAllBudgetStatuses(month),
        "Goal Progress": getAllGoalProgress(),
        "Monthly Summary": getMonthlySummary(month),
    }
}

export { getDashboardSummary }