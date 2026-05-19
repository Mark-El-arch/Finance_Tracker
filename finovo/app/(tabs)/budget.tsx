import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useBudgets } from '../../src/hooks/useBudgets'
import AddBudgetModal from '../../src/components/modals/AddBudgetModal'
import LogSpendModal from '../../src/components/modals/LogSpendModal'

type BudgetStatus = {
  id: string
  category: string
  month: string
  limit: number
  spent: number
  remaining: number
  status: 'OK' | 'WARNING' | 'EXCEEDED'
}

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export default function BudgetScreen() {
  const {
    budgetStatuses,
    wallets,
    summary,
    month,
    year,
    loading,
    mutating,
    error,
    handleAdd,
    handleDelete,
    handleLogSpend,
  } = useBudgets()

  const [addModalVisible, setAddModalVisible] = useState(false)
  const [selectedBudget, setSelectedBudget] = useState<BudgetStatus | null>(null)

  const getStatusColor = (status: string) => {
    if (status === 'EXCEEDED') return '#e53e3e'
    if (status === 'WARNING') return '#dd6b20'
    return '#38a169'
  }

  const confirmDelete = (id: string, category: string) => {
    Alert.alert(
      'Delete Budget',
      `Remove the "${category}" budget? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => handleDelete(id).catch((e) => Alert.alert('Error', e.message)),
        },
      ]
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* Header */}
        <View style={styles.titleRow}>
          <Text style={styles.screenTitle}>Budgets</Text>
          <Text style={styles.monthBadge}>
            {MONTH_NAMES[month - 1]} {year}
          </Text>
        </View>

        {/* Summary card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>This Month Overview</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Budgeted</Text>
              <Text style={styles.summaryAmount}>GHS {summary.totalLimit.toLocaleString()}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Spent</Text>
              <Text style={[styles.summaryAmount, { color: '#e53e3e' }]}>
                GHS {summary.totalSpent.toLocaleString()}
              </Text>
            </View>
          </View>
          <View style={styles.pillRow}>
            {summary.exceeded > 0 && (
              <View style={[styles.pill, { backgroundColor: '#e53e3e' }]}>
                <Text style={styles.pillText}>{summary.exceeded} Exceeded</Text>
              </View>
            )}
            {summary.warning > 0 && (
              <View style={[styles.pill, { backgroundColor: '#dd6b20' }]}>
                <Text style={styles.pillText}>{summary.warning} Warning</Text>
              </View>
            )}
            {summary.ok > 0 && (
              <View style={[styles.pill, { backgroundColor: '#38a169' }]}>
                <Text style={styles.pillText}>{summary.ok} On Track</Text>
              </View>
            )}
          </View>
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}

        <Text style={styles.sectionTitle}>Categories</Text>

        {!loading && budgetStatuses.length === 0 && (
          <Text style={styles.emptyText}>No budgets yet. Tap + to add one.</Text>
        )}

        {budgetStatuses.map((item) => {
          const progressPercent = Math.min((item.spent / item.limit) * 100, 100)
          const statusColor = getStatusColor(item.status)
          return (
            <View key={item.id} style={styles.budgetCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.categoryName}>{item.category}</Text>
                <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                  <Text style={styles.statusText}>{item.status}</Text>
                </View>
              </View>

              <View style={styles.amountRow}>
                <Text style={styles.spentText}>GHS {item.spent.toLocaleString()} spent</Text>
                <Text style={styles.limitText}>of GHS {item.limit.toLocaleString()}</Text>
              </View>

              <View style={styles.progressBarContainer}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${progressPercent}%` as any, backgroundColor: statusColor },
                  ]}
                />
              </View>

              <Text style={styles.remainingText}>
                {item.remaining >= 0
                  ? `GHS ${item.remaining.toLocaleString()} remaining`
                  : `GHS ${Math.abs(item.remaining).toLocaleString()} over budget`}
              </Text>

              {/* Action row */}
              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={styles.logSpendBtn}
                  onPress={() => setSelectedBudget(item)}
                  disabled={mutating}
                >
                  <Text style={styles.logSpendBtnText}>+ Log Spend</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => confirmDelete(item.id, item.category)}
                  disabled={mutating}
                >
                  <Text style={styles.deleteBtnText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          )
        })}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Add Budget Button */}
      <TouchableOpacity
        style={[styles.fab, mutating && styles.fabDisabled]}
        onPress={() => setAddModalVisible(true)}
        disabled={mutating}
      >
        <Text style={styles.fabText}>＋</Text>
      </TouchableOpacity>

      <AddBudgetModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        onAdd={handleAdd}
      />

      <LogSpendModal
        visible={!!selectedBudget}
        category={selectedBudget?.category ?? ''}
        remaining={selectedBudget?.remaining ?? 0}
        wallets={wallets}
        onClose={() => setSelectedBudget(null)}
        onLog={(payload) =>
          handleLogSpend(payload).finally(() => setSelectedBudget(null))
        }
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'rgba(108, 112, 168, 0.6)' },
  scrollContent: { padding: 16 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  screenTitle: { fontSize: 28, fontWeight: 'bold', color: 'white' },
  monthBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    color: 'white',
    fontWeight: '600',
    fontSize: 13,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
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
  summaryRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryDivider: { width: 1, height: 40, backgroundColor: '#e2e8f0' },
  summaryLabel: { fontSize: 13, color: '#718096', marginBottom: 4 },
  summaryAmount: { fontSize: 20, fontWeight: 'bold', color: '#2d3748' },
  pillRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  pill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  pillText: { color: 'white', fontSize: 12, fontWeight: '600' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: 'white', marginBottom: 12 },
  emptyText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  errorText: { color: '#fed7d7', fontSize: 13, textAlign: 'center', marginBottom: 12 },
  budgetCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: { fontSize: 16, fontWeight: '700', color: '#2d3748' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { color: 'white', fontSize: 11, fontWeight: '700' },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  spentText: { fontSize: 14, color: '#4a5568', fontWeight: '600' },
  limitText: { fontSize: 14, color: '#a0aec0' },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressBarFill: { height: '100%', borderRadius: 4 },
  remainingText: { fontSize: 13, color: '#718096', marginBottom: 12 },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  logSpendBtn: {
    flex: 1,
    backgroundColor: '#e53e3e',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  logSpendBtnText: { color: 'white', fontWeight: '700', fontSize: 14 },
  deleteBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  deleteBtnText: { color: '#a0aec0', fontWeight: '600', fontSize: 14 },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6c70a8',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  fabDisabled: { opacity: 0.6 },
  fabText: { color: 'white', fontSize: 28, lineHeight: 32 },
})