import { ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { getDashboardSummary } from '../../src/logic/dashboard'
import { GetDashboardSummary, GetBudgetStatus, GetGoalProgress } from '../../src/logic/types'

export default function DashboardScreen() {
    const [dashboardData, setDashboardData] = useState<GetDashboardSummary | null>(null)

    useEffect(() => {
        const data = getDashboardSummary("MARCH")
        setDashboardData(data)
    }, [])

    const getStatusColor = (status: string) => {
        if (status === 'EXCEEDED') return '#e53e3e'
        if (status === 'WARNING') return '#dd6b20'
        return '#38a169'
    }

    const getGoalStatusColor = (status: string) => {
        if (status === 'REACHED') return '#38a169'
        if (status === 'OVERDUE') return '#e53e3e'
        return '#3182ce'
    }

    const summary = dashboardData?.['Monthly Summary']
    const budgets = dashboardData?.['Budget Statuses']?.filter(
        (item): item is GetBudgetStatus => typeof item !== 'string'
    ) ?? []
    const goals = dashboardData?.['Goal Progress']?.filter(
        (item): item is GetGoalProgress => typeof item !== 'string'
    ) ?? []

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.appName}>Finovo</Text>
                    <Text style={styles.headerText}>Greetings 👋</Text>
                </View>

                {/* Total Balance Card */}
                <View style={styles.balanceCard}>
                    <Text style={styles.balanceLabel}>Total Balance</Text>
                    <Text style={styles.balanceAmount}>
                        GHS {dashboardData?.['Total Balance']?.toLocaleString()}
                    </Text>
                </View>

                {/* Monthly Summary */}
                <Text style={styles.sectionTitle}>Monthly Overview</Text>
                <View style={styles.summaryRow}>
                    <View style={[styles.summaryCard, styles.incomeCard]}>
                        <Text style={styles.summaryLabel}>Income</Text>
                        <Text style={styles.summaryAmount}>GHS {summary?.totalMonthIncome}</Text>
                    </View>
                    <View style={[styles.summaryCard, styles.expenseCard]}>
                        <Text style={styles.summaryLabel}>Expenses</Text>
                        <Text style={styles.summaryAmount}>GHS {summary?.totalMonthExpense}</Text>
                    </View>
                </View>
                <View style={styles.netCard}>
                    <Text style={styles.netLabel}>Net Balance</Text>
                    <Text style={styles.netAmount}>GHS {summary?.netBalance}</Text>
                </View>

                {/* Budget Status */}
                <Text style={styles.sectionTitle}>Budget Status</Text>
                {budgets.map((item) => {
                    const progressPercent = Math.min((item.spent / item.limit) * 100, 100)
                    const statusColor = getStatusColor(item.status)
                    return (
                        <View key={item.category} style={styles.budgetCard}>
                            <View style={styles.cardHeader}>
                                <Text style={styles.cardTitle}>{item.category}</Text>
                                <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                                    <Text style={styles.statusText}>{item.status}</Text>
                                </View>
                            </View>
                            <View style={styles.amountRow}>
                                <Text style={styles.spentText}>GHS {item.spent} spent</Text>
                                <Text style={styles.limitText}>of GHS {item.limit}</Text>
                            </View>
                            <View style={styles.progressBarContainer}>
                                <View style={[styles.progressBarFill, {
                                    width: `${progressPercent}%` as any,
                                    backgroundColor: statusColor,
                                }]} />
                            </View>
                            <Text style={styles.remainingText}>GHS {item.remaining} remaining</Text>
                        </View>
                    )
                })}

                {/* Savings Goals */}
                <Text style={styles.sectionTitle}>Savings Goals</Text>
                {goals.map((item) => {
                    const progressPercent = Math.min(item.progressPercentage, 100)
                    const statusColor = getGoalStatusColor(item.status)
                    return (
                        <View key={item.goalID} style={styles.goalCard}>
                            <View style={styles.cardHeader}>
                                <Text style={styles.cardTitle}>{item.name}</Text>
                                <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                                    <Text style={styles.statusText}>{item.status}</Text>
                                </View>
                            </View>
                            <View style={styles.amountRow}>
                                <Text style={styles.spentText}>GHS {item.savedAmount} saved</Text>
                                <Text style={styles.limitText}>of GHS {item.targetAmount}</Text>
                            </View>
                            <View style={styles.progressBarContainer}>
                                <View style={[styles.progressBarFill, {
                                    width: `${progressPercent}%` as any,
                                    backgroundColor: statusColor,
                                }]} />
                            </View>
                            <Text style={styles.remainingText}>
                                {item.progressPercentage.toFixed(1)}% complete · GHS {item.amountRemaining} to go
                            </Text>
                        </View>
                    )
                })}

                <View style={{ height: 20 }} />
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
    header: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 3,
    },
    appName: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#2d3748',
    },
    headerText: {
        fontSize: 15,
        color: '#718096',
        marginTop: 4,
    },
    balanceCard: {
        backgroundColor: 'rgba(255,255,255,0.25)',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        marginBottom: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.4)',
    },
    balanceLabel: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.85)',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 8,
    },
    balanceAmount: {
        fontSize: 36,
        fontWeight: 'bold',
        color: 'white',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: 'white',
        marginBottom: 12,
    },
    summaryRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
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
    netCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 3,
    },
    netLabel: {
        fontSize: 15,
        color: '#718096',
        fontWeight: '600',
    },
    netAmount: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2d3748',
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
    goalCard: {
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
    cardTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#2d3748',
        flex: 1,
        marginRight: 8,
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