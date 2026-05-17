import { ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { getAllBudgetStatuses } from '../../src/logic/budget'
import { GetBudgetStatus } from '../../src/logic/types'

export default function BudgetScreen() {
    const [budgets, setBudgets] = useState<GetBudgetStatus[]>([])

    useEffect(() => {
        const data = getAllBudgetStatuses()
        const filtered = data.filter((item): item is GetBudgetStatus => typeof item !== 'string')
        setBudgets(filtered)
    }, [])

    const totalBudgeted = budgets.reduce((sum, b) => sum + b.limit, 0)
    const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0)

    const getStatusColor = (status: string) => {
        if (status === 'EXCEEDED') return '#e53e3e'
        if (status === 'WARNING') return '#dd6b20'
        return '#38a169'
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.screenTitle}>Budgets</Text>

                {/* Summary Card */}
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryTitle}>This Month Overview</Text>
                    <View style={styles.summaryRow}>
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryLabel}>Total Budgeted</Text>
                            <Text style={styles.summaryAmount}>GHS {totalBudgeted}</Text>
                        </View>
                        <View style={styles.summaryDivider} />
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryLabel}>Total Spent</Text>
                            <Text style={[styles.summaryAmount, { color: '#e53e3e' }]}>GHS {totalSpent}</Text>
                        </View>
                    </View>
                </View>

                {/* Budget Cards */}
                <Text style={styles.sectionTitle}>Categories</Text>
                {budgets.map((item) => {
                    const progressPercent = Math.min((item.spent / item.limit) * 100, 100)
                    const statusColor = getStatusColor(item.status)

                    return (
                        <View key={item.category} style={styles.budgetCard}>
                            <View style={styles.cardHeader}>
                                <Text style={styles.categoryName}>{item.category}</Text>
                                <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                                    <Text style={styles.statusText}>{item.status}</Text>
                                </View>
                            </View>

                            <View style={styles.amountRow}>
                                <Text style={styles.spentText}>GHS {item.spent} spent</Text>
                                <Text style={styles.limitText}>of GHS {item.limit}</Text>
                            </View>

                            {/* Progress Bar */}
                            <View style={styles.progressBarContainer}>
                                <View style={[styles.progressBarFill, {
                                    width: `${progressPercent}%` as any,
                                    backgroundColor: statusColor
                                }]} />
                            </View>

                            <Text style={styles.remainingText}>GHS {item.remaining} remaining</Text>
                        </View>
                    )
                })}
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
    summaryCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    summaryTitle: {
        fontSize: 14,
        color: '#718096',
        marginBottom: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    summaryRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    summaryItem: {
        flex: 1,
        alignItems: 'center',
    },
    summaryDivider: {
        width: 1,
        height: 40,
        backgroundColor: '#e2e8f0',
    },
    summaryLabel: {
        fontSize: 13,
        color: '#718096',
        marginBottom: 4,
    },
    summaryAmount: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2d3748',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: 'white',
        marginBottom: 12,
    },
    budgetCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    categoryName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#2d3748',
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
    },
    statusText: {
        color: 'white',
        fontSize: 11,
        fontWeight: '700',
    },
    amountRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    spentText: {
        fontSize: 14,
        color: '#4a5568',
        fontWeight: '600',
    },
    limitText: {
        fontSize: 14,
        color: '#a0aec0',
    },
    progressBarContainer: {
        height: 8,
        backgroundColor: '#e2e8f0',
        borderRadius: 4,
        marginBottom: 8,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 4,
    },
    remainingText: {
        fontSize: 13,
        color: '#718096',
    },
})