import type { Transaction, TransactionType, Tag, Month, TransactionFilters } from './types.ts'

const wallets = [ "BANK", "CASH", "MOMO"]

const monthMap = {
    JANUARY: 0,
    FEBRUARY: 1,
    MARCH: 2,
    APRIL: 3,
    MAY: 4,
    JUNE: 5,
    JULY: 6,
    AUGUST: 7,
    SEPTEMBER: 8,
    OCTOBER: 9,
    NOVEMBER: 10,
    DECEMBER: 11
}

const transactions: Transaction[] = [
    {
        transactionID: 1,
        wallet: "BANK",
        category: "FOOD",
        description: " ",
        amount: 40.00,
        createdAt: "2026-03-21T15:23:00.000Z",
        transactionType: "EXPENSE",
        tag: "PERSONAL",
    },
    {
        transactionID: 2,
        wallet: "CASH",
        category: "CLOTHING",
        description: " ",
        amount: 100.00,
        createdAt: "2026-03-21T15:17:15.000Z",
        transactionType: "EXPENSE",
        tag: "BUSINESS",
    },
    {
        transactionID: 3,
        wallet: "MOMO",
        category: "PARENTAL ASSISTANCE",
        description: "Mom sent me money ",
        amount: 220.00,
        createdAt: "2026-03-27T15:12:00.000Z",
        transactionType: "INCOME",
        tag: "PERSONAL",
    },
]

function addTransaction(
    wallet: string, 
    category: string, 
    description: string, 
    amount: number, 
    transactionType: TransactionType, 
    tag: Tag): Transaction {
    let transaction = {
        transactionID: transactions.length + 1,
        wallet,
        category,
        description,
        amount,
        transactionType,
        createdAt: new Date().toISOString(),
        tag,
    }
    transactions.push(transaction);

    return transaction;
}


function deleteTransaction(transactionID: number): string{
    let delTransaction = transactions.findIndex(transaction => transaction.transactionID == transactionID);
    transactions.splice(delTransaction, 1);

    return "Transaction deleted!"
}


function editTransaction(transactionID: number, updates: Partial<Transaction>): Transaction | string{
    let transaction = transactions.find(transaction => transaction.transactionID == transactionID);
    if (!transaction){
        return `No such transaction with id ${transactionID}`
    }
    Object.assign(transaction, updates)

    return transaction;
}

function getWalletBalance(walletName: string): number {
    let totalIncome = 0;
    let totalExpense = 0;
    const targetWallet = transactions.filter(transaction => transaction.wallet === walletName);
    const incomeArr = targetWallet.filter(transaction => transaction.transactionType == "INCOME");  
    const expenseArr = targetWallet.filter(transaction => transaction.transactionType == "EXPENSE");

    totalIncome = incomeArr.reduce((sum, transaction) => sum + transaction.amount, 0);
    totalExpense = expenseArr.reduce((sum, transaction) => sum + transaction.amount, 0);

    return totalIncome - totalExpense;
}


function filterTransactions(filters: TransactionFilters): Transaction[]{
    return transactions.filter(transaction =>
        ((!filters.wallet || transaction.wallet == filters.wallet) &&
         (!filters.transactionType || transaction.transactionType == filters.transactionType) && 
         (!filters.category ||transaction.category == filters.category) && 
         (!filters.month || new Date(transaction.createdAt).getMonth() == monthMap[filters.month]))); 
    
}

function getTotalBalance(): number{
    return wallets.reduce((sum, wallet) => sum + getWalletBalance(wallet), 0)
}

export {monthMap, transactions, addTransaction, deleteTransaction, editTransaction, getWalletBalance, filterTransactions, getTotalBalance, wallets}