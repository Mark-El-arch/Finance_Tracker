import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useReports } from '../../src/hooks/useReports'

const MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC']

export default function ReportsScreen() {
  const {
    month,
    year,
    monthlyStats,
    rankedCategories,
    tagBreakdown,
    loading,
    error,
    goToPrevMonth,
    goToNextMonth,
    isCurrentMonth,
  } = useReports()

  const maxAmount = rankedCategories.length > 0 ? rankedCategories[0].amount : 1

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.screenTitle}>Reports</Text>

        {/* Month navigator */}
        <View style={styles.monthNav}>
          <TouchableOpacity style={styles.navBtn} onPress={goToPrevMonth}>
            <Text style={styles.navBtnText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.monthLabel}>
            {MONTHS[month - 1]} {year}
          </Text>
          <TouchableOpacity
            style={[styles.navBtn, isCurrentMonth && styles.navBtnDisabled]}
            onPress={goToNextMonth}
            disabled={isCurrentMonth}
          >
            <Text style={[styles.navBtnText, isCurrentMonth && { opacity: 0.3 }]}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Horizontal month strip (fast-jump) */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.monthScroll}
        >
          {MONTHS.map((m, index) => (
            <TouchableOpacity
              key={m}
              style={[styles.monthButton, month === index + 1 && styles.monthButtonActive]}
            >
              <Text
                style={[
                  styles.monthText,
                  month === index + 1 && styles.monthTextActive,
                ]}
              >
                {m}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {error && <Text style={styles.errorText}>{error}</Text>}

        {/* Monthly summary card */}
        {monthlyStats && (
          <View style={styles.summaryCard}>
            <Text style={styles.cardTitle}>
              {MONTHS[month - 1]} {year} Summary
            </Text>
            <View style={styles.summaryGrid}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Income</Text>
                <Text style={[styles.summaryAmount, { color: '#38a169' }]}>
                  GHS {monthlyStats.totalIncome.toLocaleString()}
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Expenses</Text>
                <Text style={[styles.summaryAmount, { color: '#e53e3e' }]}>
                  GHS {monthlyStats.totalExpense.toLocaleString()}
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Net Balance</Text>
                <Text
                  style={[
                    styles.summaryAmount,
                    { color: monthlyStats.netBalance >= 0 ? '#38a169' : '#e53e3e' },
                  ]}
                >
                  GHS {monthlyStats.netBalance.toLocaleString()}
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Daily Avg Spend</Text>
                <Text style={styles.summaryAmount}>
                  GHS {monthlyStats.dailyAverageSpend.toFixed(2)}
                </Text>
              </View>
            </View>

            {/* Income vs Expense bar */}
            <View style={styles.comparisonBar}>
              <View style={[styles.incomeBar, { flex: monthlyStats.totalIncome || 1 }]} />
              <View style={[styles.expenseBar, { flex: monthlyStats.totalExpense || 0 }]} />
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

        {/* Tag breakdown */}
        {Object.keys(tagBreakdown).length > 0 && (
          <View style={styles.breakdownCard}>
            <Text style={styles.cardTitle}>Personal vs Business</Text>
            {Object.entries(tagBreakdown).map(([tag, amount]) => (
              <View key={tag} style={styles.categoryRow}>
                <View style={styles.categoryLabelRow}>
                  <Text style={styles.categoryName}>{tag}</Text>
                  <Text style={styles.categoryAmount}>GHS {amount.toLocaleString()}</Text>
                </View>
                <View style={styles.categoryBarContainer}>
                  <View
                    style={[
                      styles.categoryBarFill,
                      {
                        width: `${(amount / Math.max(...Object.values(tagBreakdown))) * 100}%` as any,
                        backgroundColor: tag === 'PERSONAL' ? '#6c70a8' : '#3182ce',
                      },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Category breakdown */}
        {rankedCategories.length > 0 && (
          <View style={styles.breakdownCard}>
            <Text style={styles.cardTitle}>Spending by Category</Text>
            {rankedCategories.map(({ category, amount }) => (
              <View key={category} style={styles.categoryRow}>
                <View style={styles.categoryLabelRow}>
                  <Text style={styles.categoryName}>{category}</Text>
                  <Text style={styles.categoryAmount}>GHS {amount.toLocaleString()}</Text>
                </View>
                <View style={styles.categoryBarContainer}>
                  <View
                    style={[
                      styles.categoryBarFill,
                      { width: `${(amount / maxAmount) * 100}%` as any },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        )}

        {rankedCategories.length === 0 && monthlyStats && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No spending data for this month</Text>
          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'rgba(108, 112, 168, 0.6)' },
  scrollContent: { padding: 16 },
  screenTitle: { fontSize: 28, fontWeight: 'bold', color: 'white', marginBottom: 16 },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    gap: 20,
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBtnDisabled: { opacity: 0.4 },
  navBtnText: { color: 'white', fontSize: 22, fontWeight: '700', lineHeight: 28 },
  monthLabel: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
    minWidth: 100,
    textAlign: 'center',
  },
  monthScroll: { marginBottom: 20 },
  monthButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginRight: 8,
  },
  monthButtonActive: { backgroundColor: 'white' },
  monthText: { color: 'rgba(255,255,255,0.8)', fontWeight: '600', fontSize: 13 },
  monthTextActive: { color: '#6c70a8' },
  errorText: { color: '#fed7d7', fontSize: 13, textAlign: 'center', marginBottom: 12 },
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 4,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#2d3748', marginBottom: 16 },
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginBottom: 20 },
  summaryItem: { width: '45%' },
  summaryLabel: { fontSize: 13, color: '#718096', marginBottom: 4 },
  summaryAmount: { fontSize: 18, fontWeight: 'bold', color: '#2d3748' },
  comparisonBar: {
    height: 12,
    borderRadius: 6,
    flexDirection: 'row',
    overflow: 'hidden',
    marginBottom: 8,
  },
  incomeBar: { backgroundColor: '#38a169' },
  expenseBar: { backgroundColor: '#e53e3e' },
  barLegend: { flexDirection: 'row', gap: 16 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 12, color: '#718096' },
  breakdownCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 4,
  },
  categoryRow: { marginBottom: 16 },
  categoryLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  categoryName: { fontSize: 14, fontWeight: '600', color: '#4a5568' },
  categoryAmount: { fontSize: 14, fontWeight: '700', color: '#2d3748' },
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
  emptyState: { alignItems: 'center', padding: 40 },
  emptyText: { color: 'rgba(255,255,255,0.7)', fontSize: 16 },
})