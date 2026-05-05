/**
 * {
 *  goalID: "",
 *  userID: "",
 *  name: "",
 *  targetAmount: "",
 *  savedAmount: "",
 *  deadline: "",
 * }
 */

const savingsGoals = [
    {
        goalID: 1,
        userID: 1,
        name: "Buy a new phone",
        targetAmount: 4000,
        savedAmount: 3910,
        deadline: "2026-05-01T15:00:00.000Z"
    },
    {
        goalID: 2,
        userID: 1,
        name: "Wifi subscription",
        targetAmount: 400,
        savedAmount: 150,
        deadline: "2026-04-01T15:00:00.000Z"
    },
    {
        goalID: 3,
        userID: 1,
        name: "Fund my startup",
        targetAmount: 2000,
        savedAmount: 1100,
        deadline: "2026-06-01T15:00:00.000Z"
    },
]

function addGoal(userID, name, targetAmount, savedAmount, deadline) {
    let newGoal =  {
        goalID: savingsGoals.length + 1,
        userID,
        name,
        targetAmount,
        savedAmount,
        deadline,
    }

    savingsGoals.push(newGoal);

    return newGoal
}

function contributeToGoal(goalID, amount) {
    let goal = savingsGoals.find(goal => goal.goalID == goalID)
    goal.savedAmount += amount;
    
    return goal;
}

function getGoalProgress(goalID) {
    let todayDate = new Date().toISOString();
    let goal = savingsGoals.find(goal => goal.goalID == goalID);
    let amountRemaining = goal.targetAmount - goal.savedAmount;
    let progressPercentage = (goal.savedAmount / goal.targetAmount) * 100;
    let deadline = goal.deadline;
    let daysLeft = ((new Date(deadline) - new Date(todayDate)) / (1000*60*60*24));
    let dailyAmountNeeded = amountRemaining / daysLeft;


    let status;
    if (amountRemaining == 0) {
        status = "REACHED";
    } else if ((new Date() > new Date(deadline)) && (amountRemaining < goal.targetAmount)) {
        status = "OVERDUE";
    } else if (amountRemaining < goal.targetAmount) {
        status = "ON TRACK";
    }

    return {
        goalID: goal.goalID, 
        name: goal.name,
        targetAmount: goal.targetAmount,
        savedAmount: goal.savedAmount,
        amountRemaining,
        progressPercentage,
        deadline,
        dailyAmountNeeded,
        status,
    }
}

function getAllGoalProgress() {
    return savingsGoals.map(goal => getGoalProgress(goal.goalID))
}

export { addGoal,contributeToGoal,getGoalProgress, getAllGoalProgress, savingsGoals }