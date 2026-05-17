import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { getMonthlySummary, getCategoryBreakdown } from '../../src/logic/report'
import { GetMonthlySummary } from '../../src/logic/types'
import { Month } from '../../src/logic/types'

const MONTHS: Month[] = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
    'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER']

export default function ReportsScreen() {
    const [selectedMonth, setSelectedMonth] = useState<Month>('MARCH')
    const [summary, setSummary] = useState<GetMonthlySummary | null>(null)
    const [breakdown, setBreakdown] = useState<{ [key: string]: number }>({})

    useEffect(() => {
        const monthlySummary = getMonthlySummary(selectedMonth)
        const categoryBreakdown = getCategoryBreakdown(selectedMonth)
        setSummary(monthlySummary)
        setBreakdown(categoryBreakdown)
    }, [selectedMonth])

    const categories = Object.keys(breakdown)
    const maxAmount = Math.max(...Object.values(breakdown), 1)

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.screenTitle}>Reports</Text>

                {/* Month Selector */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.monthScroll}>
                    {MONTHS.map(month => (
                        <TouchableOpacity
                            key={month}
                            style={[styles.monthButton, selectedMonth === month && styles.monthButtonActive]}
                            onPress={() => setSelectedMonth(month)}
                        >
                            <Text style={[styles.monthText, selectedMonth === month && styles.monthTextActive]}>
                                {month.slice(0, 3)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Monthly Summary Card */}
                {summary && (
                    <View style={styles.summaryCard}>
                        <Text style={styles.cardTitle}>{selectedMonth} Summary</Text>
                        <View style={styles.summaryGrid}>
                            <View style={styles.summaryItem}>
                                <Text style={styles.summaryLabel}>Income</Text>
                                <Text style={[styles.summaryAmount, { color: '#38a169' }]}>
                                    GHS {summary.totalMonthIncome}
                                </Text>
                            </View>
                            <View style={styles.summaryItem}>
                                <Text style={styles.summaryLabel}>Expenses</Text>
                                <Text style={[styles.summaryAmount, { color: '#e53e3e' }]}>
                                    GHS {summary.totalMonthExpense}
                                </Text>
                            </View>
                            <View style={styles.summaryItem}>
                                <Text style={styles.summaryLabel}>Net Balance</Text>
                                <Text style={[styles.summaryAmount, {
                                    color: summary.netBalance >= 0 ? '#38a169' : '#e53e3e'
                                }]}>
                                    GHS {summary.netBalance}
                                </Text>
                            </View>
                            <View style={styles.summaryItem}>
                                <Text style={styles.summaryLabel}>Daily Avg Spend</Text>
                                <Text style={styles.summaryAmount}>
                                    GHS {summary.dailyAverageSpend.toFixed(2)}
                                </Text>
                            </View>
                        </View>

                        {/* Income vs Expense Bar */}
                        <Text style={styles.barLabel}>Income vs Expenses</Text>
                        <View style={styles.comparisonBar}>
                            <View style={[styles.incomeBar, {
                                flex: summary.totalMonthIncome || 1,
                            }]} />
                            <View style={[styles.expenseBar, {
                                flex: summary.totalMonthExpense || 0,
                            }]} />
                        </View>
                        <View style={styles.barLegend}>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendDot, { backgroundColor: '#38a169' }]} />
                                <Text style={styles.legendText}>Income</Text>
                            </View>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendDot, { backgroundColor: '#e53e3e' }]} />
                                <Text style={styles.legendText}>Expenses</Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* Category Breakdown */}
                {categories.length > 0 && (
                    <View style={styles.breakdownCard}>
                        <Text style={styles.cardTitle}>Spending by Category</Text>
                        {categories.map(category => (
                            <View key={category} style={styles.categoryRow}>
                                <View style={styles.categoryLabelRow}>
                                    <Text style={styles.categoryName}>{category}</Text>
                                    <Text style={styles.categoryAmount}>GHS {breakdown[category]}</Text>
                                </View>
                                <View style={styles.categoryBarContainer}>
                                    <View style={[styles.categoryBarFill, {
                                        width: `${(breakdown[category] / maxAmount) * 100}%` as any,
                                    }]} />
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {categories.length === 0 && (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>No spending data for {selectedMonth}</Text>
                    </View>
                )}
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
    monthScroll: {
        marginBottom: 20,
    },
    monthButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.3)',
        marginRight: 8,
    },
    monthButtonActive: {
        backgroundColor: 'white',
    },
    monthText: {
        color: 'rgba(255,255,255,0.8)',
        fontWeight: '600',
        fontSize: 13,
    },
    monthTextActive: {
        color: '#6c70a8',
    },
    summaryCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#2d3748',
        marginBottom: 16,
    },
    summaryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 20,
    },
    summaryItem: {
        width: '45%',
    },
    summaryLabel: {
        fontSize: 13,
        color: '#718096',
        marginBottom: 4,
    },
    summaryAmount: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2d3748',
    },
    barLabel: {
        fontSize: 13,
        color: '#718096',
        marginBottom: 8,
    },
    comparisonBar: {
        height: 12,
        borderRadius: 6,
        flexDirection: 'row',
        overflow: 'hidden',
        marginBottom: 8,
    },
    incomeBar: {
        backgroundColor: '#38a169',
    },
    expenseBar: {
        backgroundColor: '#e53e3e',
    },
    barLegend: {
        flexDirection: 'row',
        gap: 16,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    legendDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    legendText: {
        fontSize: 12,
        color: '#718096',
    },
    breakdownCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    categoryRow: {
        marginBottom: 16,
    },
    categoryLabelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    categoryName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4a5568',
    },
    categoryAmount: {
        fontSize: 14,
        fontWeight: '700',
        color: '#2d3748',
    },
    categoryBarContainer: {
        height: 8,
        backgroundColor: '#e2e8f0',
        borderRadius: 4,
        overflow: 'hidden',
    },
    categoryBarFill: {
        height: '100%',
        backgroundColor: '#6c70a8',
        borderRadius: 4,
    },
    emptyState: {
        alignItems: 'center',
        padding: 40,
    },
    emptyText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 16,
    },
})