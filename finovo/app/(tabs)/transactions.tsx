import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { transactions, filterTransactions } from '../../src/logic/transactions'
import { Transaction, TransactionType } from '../../src/logic/types'

export default function TransactionsScreen() {
    const [allTransactions, setAllTransactions] = useState<Transaction[]>([])
    const [activeFilter, setActiveFilter] = useState<TransactionType | 'ALL'>('ALL')

    useEffect(() => {
        setAllTransactions([...transactions])
    }, [])

    const filtered = activeFilter === 'ALL'
        ? allTransactions
        : allTransactions.filter(t => t.transactionType === activeFilter)

    const totalIncome = allTransactions
        .filter(t => t.transactionType === 'INCOME')
        .reduce((sum, t) => sum + t.amount, 0)

    const totalExpense = allTransactions
        .filter(t => t.transactionType === 'EXPENSE')
        .reduce((sum, t) => sum + t.amount, 0)

    const filterButtons: (TransactionType | 'ALL')[] = ['ALL', 'INCOME', 'EXPENSE']

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.screenTitle}>Transactions</Text>

                {/* Summary Row */}
                <View style={styles.summaryRow}>
                    <View style={[styles.summaryCard, styles.incomeCard]}>
                        <Text style={styles.summaryLabel}>Income</Text>
                        <Text style={styles.summaryAmount}>GHS {totalIncome}</Text>
                    </View>
                    <View style={[styles.summaryCard, styles.expenseCard]}>
                        <Text style={styles.summaryLabel}>Expenses</Text>
                        <Text style={styles.summaryAmount}>GHS {totalExpense}</Text>
                    </View>
                </View>

                {/* Filter Buttons */}
                <View style={styles.filterRow}>
                    {filterButtons.map(filter => (
                        <TouchableOpacity
                            key={filter}
                            style={[styles.filterButton, activeFilter === filter && styles.filterButtonActive]}
                            onPress={() => setActiveFilter(filter)}
                        >
                            <Text style={[styles.filterText, activeFilter === filter && styles.filterTextActive]}>
                                {filter}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Transaction List */}
                <Text style={styles.sectionTitle}>{filtered.length} Transactions</Text>
                {filtered.map((item) => (
                    <View key={item.transactionID} style={styles.transactionCard}>
                        <View style={styles.cardLeft}>
                            <View style={[styles.typeIndicator, {
                                backgroundColor: item.transactionType === 'INCOME' ? '#38a169' : '#e53e3e'
                            }]} />
                            <View>
                                <Text style={styles.categoryText}>{item.category}</Text>
                                <Text style={styles.walletText}>{item.wallet} · {item.tag}</Text>
                                {item.description?.trim() && (
                                    <Text style={styles.descriptionText}>{item.description}</Text>
                                )}
                            </View>
                        </View>
                        <View style={styles.cardRight}>
                            <Text style={[styles.amountText, {
                                color: item.transactionType === 'INCOME' ? '#38a169' : '#e53e3e'
                            }]}>
                                {item.transactionType === 'INCOME' ? '+' : '-'} GHS {item.amount}
                            </Text>
                            <Text style={styles.dateText}>
                                {new Date(item.createdAt).toLocaleDateString()}
                            </Text>
                        </View>
                    </View>
                ))}
            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(108, 112, 168, 0.6)',
    },
    scrollContent: {
        padding: 16,
    },
    screenTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 16,
    },
    summaryRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    summaryCard: {
        flex: 1,
        borderRadius: 16,
        padding: 16,
    },
    incomeCard: {
        backgroundColor: '#38a169',
    },
    expenseCard: {
        backgroundColor: '#e53e3e',
    },
    summaryLabel: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 13,
        marginBottom: 4,
    },
    summaryAmount: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
    filterRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 20,
    },
    filterButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.3)',
    },
    filterButtonActive: {
        backgroundColor: 'white',
    },
    filterText: {
        color: 'rgba(255,255,255,0.8)',
        fontWeight: '600',
        fontSize: 13,
    },
    filterTextActive: {
        color: '#6c70a8',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: 'white',
        marginBottom: 12,
    },
    transactionCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        marginBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
    },
    cardLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 12,
    },
    typeIndicator: {
        width: 4,
        height: 40,
        borderRadius: 2,
    },
    categoryText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#2d3748',
        marginBottom: 2,
    },
    walletText: {
        fontSize: 12,
        color: '#a0aec0',
    },
    descriptionText: {
        fontSize: 12,
        color: '#718096',
        marginTop: 2,
    },
    cardRight: {
        alignItems: 'flex-end',
    },
    amountText: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 4,
    },
    dateText: {
        fontSize: 12,
        color: '#a0aec0',
    },
})