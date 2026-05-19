import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useSavings } from '../../src/hooks/useSavings'
import AddSavingsGoalModal from '../../src/components/modals/AddSavingsGoalModal'
import ContributeModal from '../../src/components/modals/ContributeModal'

type GoalProgress = {
  id: string
  name: string
  targetAmount: number
  savedAmount: number
  amountRemaining: number
  progressPercentage: number
  deadline: string
  dailyAmountNeeded: number
  status: 'REACHED' | 'OVERDUE' | 'ON TRACK'
}

export default function SavingsScreen() {
  const { goals, summary, loading, mutating, error, handleAdd, handleContribute, handleDelete } =
    useSavings()

  const [addModalVisible, setAddModalVisible] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState<GoalProgress | null>(null)

  const getStatusColor = (status: string) => {
    if (status === 'REACHED') return '#38a169'
    if (status === 'OVERDUE') return '#e53e3e'
    return '#3182ce'
  }

  const confirmDelete = (id: string, name: string) => {
    Alert.alert(
      'Delete Goal',
      `Remove "${name}"? This cannot be undone.`,
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
        <Text style={styles.screenTitle}>Savings Goals</Text>

        {/* Summary card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Overall Progress</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Target</Text>
              <Text style={styles.summaryAmount}>GHS {summary.totalTarget.toLocaleString()}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Saved</Text>
              <Text style={[styles.summaryAmount, { color: '#38a169' }]}>
                GHS {summary.totalSaved.toLocaleString()}
              </Text>
            </View>
          </View>
          {summary.totalTarget > 0 && (
            <>
              <View style={styles.overallProgressContainer}>
                <View
                  style={[
                    styles.overallProgressFill,
                    {
                      width: `${Math.min(
                        (summary.totalSaved / summary.totalTarget) * 100,
                        100
                      )}%` as any,
                    },
                  ]}
                />
              </View>
              <Text style={styles.overallPercentText}>
                {((summary.totalSaved / summary.totalTarget) * 100).toFixed(1)}% of total goal
              </Text>
            </>
          )}
          {/* Status pills */}
          <View style={styles.pillRow}>
            {summary.reached > 0 && (
              <View style={[styles.pill, { backgroundColor: '#38a169' }]}>
                <Text style={styles.pillText}>{summary.reached} Reached</Text>
              </View>
            )}
            {summary.onTrack > 0 && (
              <View style={[styles.pill, { backgroundColor: '#3182ce' }]}>
                <Text style={styles.pillText}>{summary.onTrack} On Track</Text>
              </View>
            )}
            {summary.overdue > 0 && (
              <View style={[styles.pill, { backgroundColor: '#e53e3e' }]}>
                <Text style={styles.pillText}>{summary.overdue} Overdue</Text>
              </View>
            )}
          </View>
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}

        <Text style={styles.sectionTitle}>Your Goals</Text>

        {!loading && goals.length === 0 && (
          <Text style={styles.emptyText}>No savings goals yet. Tap + to add one.</Text>
        )}

        {goals.map((item) => {
          const progressPercent = Math.min(item.progressPercentage, 100)
          const statusColor = getStatusColor(item.status)
          return (
            <TouchableOpacity
              key={item.id}
              style={styles.goalCard}
              onPress={() => item.status !== 'REACHED' && setSelectedGoal(item)}
              onLongPress={() => confirmDelete(item.id, item.name)}
              activeOpacity={0.85}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.goalName}>{item.name}</Text>
                <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                  <Text style={styles.statusText}>{item.status}</Text>
                </View>
              </View>
              <View style={styles.amountRow}>
                <Text style={styles.savedText}>GHS {item.savedAmount.toLocaleString()} saved</Text>
                <Text style={styles.targetText}>of GHS {item.targetAmount.toLocaleString()}</Text>
              </View>
              <View style={styles.progressBarContainer}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${progressPercent}%` as any, backgroundColor: statusColor },
                  ]}
                />
              </View>
              <View style={styles.cardFooter}>
                <Text style={styles.percentText}>{item.progressPercentage.toFixed(1)}% complete</Text>
                <Text style={styles.remainingText}>
                  GHS {item.amountRemaining.toLocaleString()} to go
                </Text>
              </View>
              <Text style={styles.deadlineText}>
                Deadline: {new Date(item.deadline).toDateString()}
              </Text>
              {item.status !== 'REACHED' && (
                <Text style={styles.dailyText}>
                  Save GHS {item.dailyAmountNeeded.toFixed(2)}/day to reach goal
                </Text>
              )}
              {item.status !== 'REACHED' && (
                <View style={styles.contributeHint}>
                  <Text style={styles.contributeHintText}>Tap to contribute</Text>
                </View>
              )}
            </TouchableOpacity>
          )
        })}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Add Button */}
      <TouchableOpacity
        style={[styles.fab, mutating && styles.fabDisabled]}
        onPress={() => setAddModalVisible(true)}
        disabled={mutating}
      >
        <Text style={styles.fabText}>＋</Text>
      </TouchableOpacity>

      <AddSavingsGoalModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        onAdd={handleAdd}
      />

      <ContributeModal
        visible={!!selectedGoal}
        goalName={selectedGoal?.name ?? ''}
        amountRemaining={selectedGoal?.amountRemaining ?? 0}
        onClose={() => setSelectedGoal(null)}
        onContribute={(amount) =>
          handleContribute(selectedGoal!.id, amount).finally(() => setSelectedGoal(null))
        }
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'rgba(108, 112, 168, 0.6)' },
  scrollContent: { padding: 16 },
  screenTitle: { fontSize: 28, fontWeight: 'bold', color: 'white', marginBottom: 16 },
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
  overallProgressContainer: {
    height: 10,
    backgroundColor: '#e2e8f0',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 8,
  },
  overallProgressFill: { height: '100%', backgroundColor: '#6c70a8', borderRadius: 5 },
  overallPercentText: { fontSize: 13, color: '#718096', textAlign: 'right', marginBottom: 12 },
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
  goalCard: {
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
  goalName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2d3748',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { color: 'white', fontSize: 11, fontWeight: '700' },
  amountRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  savedText: { fontSize: 14, color: '#4a5568', fontWeight: '600' },
  targetText: { fontSize: 14, color: '#a0aec0' },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressBarFill: { height: '100%', borderRadius: 4 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  percentText: { fontSize: 13, color: '#718096' },
  remainingText: { fontSize: 13, color: '#718096' },
  deadlineText: { fontSize: 13, color: '#4a5568', fontWeight: '600', marginBottom: 4 },
  dailyText: { fontSize: 13, color: '#3182ce', fontWeight: '600', marginTop: 4 },
  contributeHint: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 8,
    alignItems: 'center',
  },
  contributeHintText: { fontSize: 13, color: '#6c70a8', fontWeight: '600' },
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