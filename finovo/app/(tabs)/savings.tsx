import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { getAllGoalProgress } from '../../src/logic/savings'
import { GetGoalProgress } from '../../src/logic/types'

export default function SavingsScreen() {
    const [goals, setGoals] = useState<GetGoalProgress[]>([])

    useEffect(() => {
        const data = getAllGoalProgress()
        const filtered = data.filter((item): item is GetGoalProgress => typeof item !== 'string')
        setGoals(filtered)
    }, [])

    const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0)
    const totalSaved = goals.reduce((sum, g) => sum + g.savedAmount, 0)

    const getStatusColor = (status: string) => {
        if (status === 'REACHED') return '#38a169'
        if (status === 'OVERDUE') return '#e53e3e'
        return '#3182ce'
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.screenTitle}>Savings Goals</Text>

                {/* Summary Card */}
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryTitle}>Overall Progress</Text>
                    <View style={styles.summaryRow}>
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryLabel}>Total Target</Text>
                            <Text style={styles.summaryAmount}>GHS {totalTarget}</Text>
                        </View>
                        <View style={styles.summaryDivider} />
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryLabel}>Total Saved</Text>
                            <Text style={[styles.summaryAmount, { color: '#38a169' }]}>GHS {totalSaved}</Text>
                        </View>
                    </View>
                    {/* Overall progress bar */}
                    <View style={styles.overallProgressContainer}>
                        <View style={[styles.overallProgressFill, {
                            width: `${Math.min((totalSaved / totalTarget) * 100, 100)}%` as any
                        }]} />
                    </View>
                    <Text style={styles.overallPercentText}>
                        {((totalSaved / totalTarget) * 100).toFixed(1)}% of total goal
                    </Text>
                </View>

                {/* Goal Cards */}
                <Text style={styles.sectionTitle}>Your Goals</Text>
                {goals.map((item) => {
                    const progressPercent = Math.min(item.progressPercentage, 100)
                    const statusColor = getStatusColor(item.status)

                    return (
                        <View key={item.goalID} style={styles.goalCard}>
                            <View style={styles.cardHeader}>
                                <Text style={styles.goalName}>{item.name}</Text>
                                <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                                    <Text style={styles.statusText}>{item.status}</Text>
                                </View>
                            </View>

                            <View style={styles.amountRow}>
                                <Text style={styles.savedText}>GHS {item.savedAmount} saved</Text>
                                <Text style={styles.targetText}>of GHS {item.targetAmount}</Text>
                            </View>

                            {/* Progress Bar */}
                            <View style={styles.progressBarContainer}>
                                <View style={[styles.progressBarFill, {
                                    width: `${progressPercent}%` as any,
                                    backgroundColor: statusColor,
                                }]} />
                            </View>

                            <View style={styles.cardFooter}>
                                <Text style={styles.percentText}>{item.progressPercentage.toFixed(1)}% complete</Text>
                                <Text style={styles.remainingText}>GHS {item.amountRemaining} to go</Text>
                            </View>

                            <View style={styles.deadlineRow}>
                                <Text style={styles.deadlineLabel}>Deadline: </Text>
                                <Text style={styles.deadlineText}>
                                    {new Date(item.deadline).toDateString()}
                                </Text>
                            </View>

                            {item.status !== 'REACHED' && (
                                <Text style={styles.dailyText}>
                                    Save GHS {item.dailyAmountNeeded.toFixed(2)}/day to reach goal
                                </Text>
                            )}
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
        marginBottom: 16,
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
    overallProgressContainer: {
        height: 10,
        backgroundColor: '#e2e8f0',
        borderRadius: 5,
        overflow: 'hidden',
        marginBottom: 8,
    },
    overallProgressFill: {
        height: '100%',
        backgroundColor: '#6c70a8',
        borderRadius: 5,
    },
    overallPercentText: {
        fontSize: 13,
        color: '#718096',
        textAlign: 'right',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: 'white',
        marginBottom: 12,
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
    goalName: {
        fontSize: 16,
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
    savedText: {
        fontSize: 14,
        color: '#4a5568',
        fontWeight: '600',
    },
    targetText: {
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
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    percentText: {
        fontSize: 13,
        color: '#718096',
    },
    remainingText: {
        fontSize: 13,
        color: '#718096',
    },
    deadlineRow: {
        flexDirection: 'row',
        marginBottom: 6,
    },
    deadlineLabel: {
        fontSize: 13,
        color: '#a0aec0',
    },
    deadlineText: {
        fontSize: 13,
        color: '#4a5568',
        fontWeight: '600',
    },
    dailyText: {
        fontSize: 13,
        color: '#3182ce',
        fontWeight: '600',
        marginTop: 4,
    },
})