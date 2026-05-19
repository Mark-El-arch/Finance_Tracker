import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTransactions } from '../../src/hooks/useTransactions'
import AddTransactionModal from '../../src/components/modals/AddTransactionModal'
import TransactionActionModal from '../../src/components/modals/TransactionActionModal'

type Transaction = {
  id: string
  category: string
  description: string
  amount: number
  transaction_type: 'INCOME' | 'EXPENSE'
  tag: 'PERSONAL' | 'BUSINESS'
  created_at: string
  wallet_id: string
}

export default function TransactionsScreen() {
  const {
    transactions,
    wallets,
    filters,
    setFilters,
    loading,
    mutating,
    error,
    handleAdd,
    handleEdit,
    handleDelete,
  } = useTransactions()

  const [addModalVisible, setAddModalVisible] = useState(false)
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null)

  const totalIncome = transactions
    .filter((t) => t.transaction_type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0)
  const totalExpense = transactions
    .filter((t) => t.transaction_type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0)

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.screenTitle}>Transactions</Text>

        {/* Summary */}
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, styles.incomeCard]}>
            <Text style={styles.summaryLabel}>Income</Text>
            <Text style={styles.summaryAmount}>GHS {totalIncome.toLocaleString()}</Text>
          </View>
          <View style={[styles.summaryCard, styles.expenseCard]}>
            <Text style={styles.summaryLabel}>Expenses</Text>
            <Text style={styles.summaryAmount}>GHS {totalExpense.toLocaleString()}</Text>
          </View>
        </View>

        {/* Type filter */}
        <View style={styles.filterRow}>
          {(['ALL', 'INCOME', 'EXPENSE'] as const).map((f) => (
            <TouchableOpacity
              key={f}
              style={[
                styles.filterButton,
                (filters.type === f || (f === 'ALL' && !filters.type)) &&
                  styles.filterButtonActive,
              ]}
              onPress={() => setFilters({ ...filters, type: f === 'ALL' ? undefined : f })}
            >
              <Text
                style={[
                  styles.filterText,
                  (filters.type === f || (f === 'ALL' && !filters.type)) &&
                    styles.filterTextActive,
                ]}
              >
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tag filter */}
        <View style={styles.filterRow}>
          {(['ALL', 'PERSONAL', 'BUSINESS'] as const).map((t) => (
            <TouchableOpacity
              key={t}
              style={[
                styles.filterButton,
                (filters.tag === t || (t === 'ALL' && !filters.tag)) &&
                  styles.filterButtonActive,
              ]}
              onPress={() =>
                setFilters({ ...filters, tag: t === 'ALL' ? undefined : (t as 'PERSONAL' | 'BUSINESS') })
              }
            >
              <Text
                style={[
                  styles.filterText,
                  (filters.tag === t || (t === 'ALL' && !filters.tag)) &&
                    styles.filterTextActive,
                ]}
              >
                {t}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}

        <Text style={styles.sectionTitle}>{transactions.length} Transactions</Text>

        {!loading && transactions.length === 0 && (
          <Text style={styles.emptyText}>No transactions yet. Tap + to add one.</Text>
        )}

        {transactions.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.transactionCard}
            onPress={() => setSelectedTx(item)}
            activeOpacity={0.85}
          >
            <View style={styles.cardLeft}>
              <View
                style={[
                  styles.typeIndicator,
                  {
                    backgroundColor:
                      item.transaction_type === 'INCOME' ? '#38a169' : '#e53e3e',
                  },
                ]}
              />
              <View>
                <Text style={styles.categoryText}>{item.category}</Text>
                <Text style={styles.tagText}>{item.tag}</Text>
                {item.description?.trim() ? (
                  <Text style={styles.descriptionText}>{item.description}</Text>
                ) : null}
              </View>
            </View>
            <View style={styles.cardRight}>
              <Text
                style={[
                  styles.amountText,
                  {
                    color: item.transaction_type === 'INCOME' ? '#38a169' : '#e53e3e',
                  },
                ]}
              >
                {item.transaction_type === 'INCOME' ? '+' : '-'} GHS{' '}
                {item.amount.toLocaleString()}
              </Text>
              <Text style={styles.dateText}>
                {new Date(item.created_at).toLocaleDateString()}
              </Text>
            </View>
          </TouchableOpacity>
        ))}

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

      <AddTransactionModal
        visible={addModalVisible}
        wallets={wallets}
        onClose={() => setAddModalVisible(false)}
        onAdd={handleAdd}
      />

      <TransactionActionModal
        visible={!!selectedTx}
        transaction={selectedTx}
        onClose={() => setSelectedTx(null)}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'rgba(108, 112, 168, 0.6)' },
  scrollContent: { padding: 16 },
  screenTitle: { fontSize: 28, fontWeight: 'bold', color: 'white', marginBottom: 16 },
  summaryRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  summaryCard: { flex: 1, borderRadius: 16, padding: 16 },
  incomeCard: { backgroundColor: '#38a169' },
  expenseCard: { backgroundColor: '#e53e3e' },
  summaryLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginBottom: 4 },
  summaryAmount: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  filterButtonActive: { backgroundColor: 'white' },
  filterText: { color: 'rgba(255,255,255,0.8)', fontWeight: '600', fontSize: 13 },
  filterTextActive: { color: '#6c70a8' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: 'white', marginBottom: 12, marginTop: 8 },
  emptyText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  errorText: { color: '#fed7d7', fontSize: 13, textAlign: 'center', marginBottom: 12 },
  transactionCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
  },
  cardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 },
  typeIndicator: { width: 4, height: 40, borderRadius: 2 },
  categoryText: { fontSize: 15, fontWeight: '700', color: '#2d3748', marginBottom: 2 },
  tagText: { fontSize: 12, color: '#a0aec0' },
  descriptionText: { fontSize: 12, color: '#718096', marginTop: 2 },
  cardRight: { alignItems: 'flex-end' },
  amountText: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  dateText: { fontSize: 12, color: '#a0aec0' },
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