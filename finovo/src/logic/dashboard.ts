import { getTotalBalance } from "./transactions";
import { getAllBudgetStatuses } from "./budget";
import { getAllGoalProgress } from "./savings";
import { getMonthlySummary } from "./report";
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