import { getTotalBalance } from "./transactions.ts";
import { getAllBudgetStatuses } from "./budget.ts";
import { getAllGoalProgress } from "./savings.ts";
import { getMonthlySummary } from "./report.ts";
import type { Month, GetDashboardSummary} from "./types.ts";

function getDashboardSummary(month: Month): GetDashboardSummary {
    return {
        "Total Balance": getTotalBalance(),
        "Budget Statuses": getAllBudgetStatuses(),
        "Goal Progress": getAllGoalProgress(),
        "Monthly Summary": getMonthlySummary(month),
    }
}

export { getDashboardSummary }