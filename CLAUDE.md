# Finance Tracker - Codebase Documentation

## Project Overview
A TypeScript-based financial tracking application with features for transaction management, savings goals, budget tracking, and reporting. Built for Expo mobile development with a modular architecture.

## Directory Structure
```
Finance_Tracker/
├── main.ts                    # Application entry point
├── index.ts                   # Expo root component registration
├── package.json              # Project dependencies and scripts
├── tsconfig.json             # TypeScript configuration
└── finovo/                   # Core financial logic module
    ├── index.ts              # Main export point
    └── src/logic/            # Core business logic
        ├── types.ts          # Type definitions
        ├── transactions.ts   # Transaction management
        ├── savings.ts        # Savings goals
        ├── budget.ts         # Budget tracking
        ├── dashboard.ts      # Dashboard summaries
        └── report.ts         # Reporting functions
```

## Core Modules

### 1. Transactions Module (`finovo/src/logic/transactions.ts`)
- **CRUD Operations**: Full transaction lifecycle management
  - `addTransaction()` - Create new transactions
  - `deleteTransaction()` - Remove transactions by ID
  - `editTransaction()` - Update existing transactions
- **Filtering**: Flexible transaction filtering by:
  - Wallet (BANK, CASH, MOMO)
  - Type (INCOME, EXPENSE)
  - Category
  - Month
- **Balance Tracking**:
  - `getWalletBalance()` - Balance per wallet
  - `getTotalBalance()` - Overall balance
- **Data Structure**:
  ```typescript
  interface Transaction {
    transactionID: number;
    wallet: string;
    category: string;
    description: string;
    amount: number;
    createdAt: string;
    transactionType: 'INCOME' | 'EXPENSE';
    tag: 'PERSONAL' | 'BUSINESS';
  }
  ```

### 2. Savings Goals Module (`finovo/src/logic/savings.ts`)
- **Goal Management**:
  - `addGoal()` - Create new savings goals
  - `contributeToGoal()` - Add funds to goals
- **Progress Tracking**:
  - `getGoalProgress()` - Detailed goal progress with status
  - `getAllGoalProgress()` - Progress for all goals
- **Smart Features**:
  - Status tracking (REACHED, OVERDUE, ON TRACK)
  - Daily amount needed calculation
  - Progress percentage tracking

### 3. Budget Module (`finovo/src/logic/budget.ts`)
- **Budget Management**:
  - `getBudgetStatus()` - Status for specific budgets
  - `getAllBudgetStatuses()` - All budget statuses
- **Smart Status System**:
  - OK: Under 80% of budget
  - WARNING: Over 80% of budget
  - EXCEEDED: Over budget limit
- **Integration**: Uses transaction data for expense calculation

### 4. Dashboard Module (`finovo/src/logic/dashboard.ts`)
- **Central Summary**: Aggregates all financial data
- **Components**:
  - Total balance
  - Budget statuses
  - Goal progress
  - Monthly summary

### 5. Reporting Module (`finovo/src/logic/report.ts`)
- **Monthly Analysis**:
  - `getMonthlySummary()` - Income, expenses, averages
  - `getCategoryBreakdown()` - Expense category breakdown
- **Smart Calculations**:
  - Daily average spend
  - Net balance
  - Category-wise expense tracking

## Type Definitions (`finovo/src/logic/types.ts`)
Comprehensive type system including:
- Transaction types and interfaces
- Savings goal structures
- Budget definitions
- Filter interfaces
- Status enums
- Monthly constants

## Configuration

### TypeScript Settings
- Module system: NodeNext
- Target: ESNext
- Strict mode enabled
- Source maps and declarations generated
- Isolated modules for safety

### Dependencies
- Expo mobile framework
- TypeScript compiler
- Module-based ESNext syntax

## Key Features

### Transaction Management
- Full CRUD operations
- Multiple wallet support (BANK, CASH, MOMO)
- Income/Expense categorization
- Personal/Business tagging
- Date-based filtering

### Savings Goals
- Target-based savings tracking
- Progress monitoring with percentages
- Deadline-based planning
- Daily contribution calculations
- Status awareness (reached, overdue, on track)

### Budget Control
- Category-specific budgets
- Monthly budget tracking
- Warning system at 80% usage
- Exceeded status tracking
- Remaining amount calculation

### Reporting & Analytics
- Monthly financial summaries
- Category breakdowns
- Daily spending averages
- Net balance calculations
- Dashboard overview

## Development Notes
- Uses Expo for cross-platform mobile development
- TypeScript with strict type checking
- Modular architecture for maintainability
- No external dependencies beyond core modules
- Ready for native builds and Expo Go
- Uses ES modules for better tree-shaking

## Usage Examples
```typescript
// Filter transactions
filterTransactions({ category: "FOOD", month: "MARCH" })

// Check budget status
getBudgetStatus(1)

// Track savings goal progress
getGoalProgress(1)

// Get monthly summary
getMonthlySummary("MARCH")

// Get dashboard overview
getDashboardSummary("MARCH")
```

## File Locations
- Main application: `/main.ts`
- Expo registration: `/finovo/index.ts`
- Core logic: `/finovo/src/logic/`
- Type definitions: `/finovo/src/logic/types.ts`
- Configuration: `/tsconfig.json`