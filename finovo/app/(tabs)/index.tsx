import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useDashboard } from '../../src/hooks/useDashboard'
import AddWalletModal from '../../src/components/modals/AddWalletModal'
import EditWalletModal from '../../src/components/modals/EditWalletModal'

interface Wallet {
  id: string
  name: string
  type: string
  balance: number
}

export default function DashboardScreen() {
  const router = useRouter()
  const {
    totalBalance,
    monthlyStats,
    wallets,
    recentTransactions,
    loading,
    mutating,
    error,
    handleAddWallet,
    handleEditWallet,
    handleDeleteWallet,
  } = useDashboard()

  const [addModalVisible, setAddModalVisible] = useState(false)
  const [editingWallet, setEditingWallet] = useState<Wallet | null>(null)
  const [userName, setUserName] = React.useState('')

  React.useEffect(() => {
    import('../../src/lib/supabase').then(({ supabase }) => {
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) setUserName(user.user_metadata?.name ?? 'there')
      })
    })
  }, [])

  const WALLET_TYPE_ICONS: Record<string, string> = {
    Cash: '💵',
    Bank: '🏦',
    'Mobile Money': '📱',
    Savings: '🏺',
    Investment: '📈',
    Other: '💳',
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.appName}>Finovo</Text>
            <Text style={styles.headerText}>Hello 👋, {userName}</Text>
          </View>
          <TouchableOpacity
            style={styles.headerAvatar}
            onPress={() => router.push('/account')}
          >
            <Text style={styles.headerAvatarText}>
              {userName.slice(0, 2).toUpperCase() || '?'}
            </Text>
          </TouchableOpacity>
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}

        {/* Total Balance */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <Text style={styles.balanceAmount}>GHS {totalBalance.toLocaleString()}</Text>
          {wallets.length > 0 && (
            <Text style={styles.walletCount}>
              across {wallets.length} wallet{wallets.length !== 1 ? 's' : ''}
            </Text>
          )}
        </View>

        {/* Monthly Summary */}
        <Text style={styles.sectionTitle}>Monthly Overview</Text>
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, styles.incomeCard]}>
            <Text style={styles.summaryLabel}>Income</Text>
            <Text style={styles.summaryAmount}>
              GHS {(monthlyStats?.totalIncome ?? 0).toLocaleString()}
            </Text>
          </View>
          <View style={[styles.summaryCard, styles.expenseCard]}>
            <Text style={styles.summaryLabel}>Expenses</Text>
            <Text style={styles.summaryAmount}>
              GHS {(monthlyStats?.totalExpense ?? 0).toLocaleString()}
            </Text>
          </View>
        </View>
        <View style={styles.netCard}>
          <Text style={styles.netLabel}>Net Balance</Text>
          <Text
            style={[
              styles.netAmount,
              { color: (monthlyStats?.netBalance ?? 0) >= 0 ? '#38a169' : '#e53e3e' },
            ]}
          >
            GHS {(monthlyStats?.netBalance ?? 0).toLocaleString()}
          </Text>
        </View>

        {/* Wallets */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Wallets</Text>
          <TouchableOpacity
            style={styles.addWalletBtn}
            onPress={() => setAddModalVisible(true)}
            disabled={mutating}
          >
            <Text style={styles.addWalletBtnText}>+ Add Wallet</Text>
          </TouchableOpacity>
        </View>

        {wallets.length === 0 ? (
          <TouchableOpacity
            style={styles.emptyWalletCard}
            onPress={() => setAddModalVisible(true)}
          >
            <Text style={styles.emptyWalletIcon}>👛</Text>
            <Text style={styles.emptyWalletTitle}>No wallets yet</Text>
            <Text style={styles.emptyWalletSub}>Tap to add your first wallet</Text>
          </TouchableOpacity>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.walletsScroll}
          >
            {wallets.map((w) => (
              // Tap any wallet card to edit its name, type, or balance
              <TouchableOpacity
                key={w.id}
                style={styles.walletCard}
                onPress={() => setEditingWallet(w)}
                activeOpacity={0.8}
              >
                <Text style={styles.walletIcon}>
                  {WALLET_TYPE_ICONS[w.type] ?? '💳'}
                </Text>
                <Text style={styles.walletName} numberOfLines={1}>{w.name}</Text>
                <Text style={styles.walletType}>{w.type}</Text>
                <Text style={styles.walletBalance}>GHS {w.balance.toLocaleString()}</Text>
                <Text style={styles.walletEditHint}>Tap to edit</Text>
              </TouchableOpacity>
            ))}
            {/* New wallet card at the end of the scroll */}
            <TouchableOpacity
              style={styles.walletAddCard}
              onPress={() => setAddModalVisible(true)}
              disabled={mutating}
            >
              <Text style={styles.walletAddIcon}>＋</Text>
              <Text style={styles.walletAddText}>New Wallet</Text>
            </TouchableOpacity>
          </ScrollView>
        )}

        {/* Recent Transactions */}
        {recentTransactions.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { marginTop: 8 }]}>Recent Activity</Text>
            {recentTransactions.map((item) => (
              <View key={item.id} style={styles.txCard}>
                <View style={styles.txLeft}>
                  <View
                    style={[
                      styles.txIndicator,
                      {
                        backgroundColor:
                          item.transaction_type === 'INCOME' ? '#38a169' : '#e53e3e',
                      },
                    ]}
                  />
                  <View>
                    <Text style={styles.txCategory}>{item.category}</Text>
                    <Text style={styles.txDate}>
                      {new Date(item.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
                <Text
                  style={[
                    styles.txAmount,
                    { color: item.transaction_type === 'INCOME' ? '#38a169' : '#e53e3e' },
                  ]}
                >
                  {item.transaction_type === 'INCOME' ? '+' : '-'} GHS{' '}
                  {item.amount.toLocaleString()}
                </Text>
              </View>
            ))}
          </>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>

      <AddWalletModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        onAdd={handleAddWallet}
      />

      <EditWalletModal
        visible={!!editingWallet}
        wallet={editingWallet}
        onClose={() => setEditingWallet(null)}
        onSave={handleEditWallet}
        onDelete={handleDeleteWallet}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'rgba(108, 112, 168, 0.6)' },
  scrollContent: { padding: 16 },
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
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  appName: { fontSize: 30, fontWeight: 'bold', color: '#2d3748' },
  headerText: { fontSize: 15, color: '#718096', marginTop: 4 },
  headerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#6c70a8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAvatarText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  errorText: { color: '#fed7d7', fontSize: 13, textAlign: 'center', marginBottom: 12 },
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
  balanceAmount: { fontSize: 36, fontWeight: 'bold', color: 'white' },
  walletCount: { fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 6 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: 'white', marginBottom: 12 },
  addWalletBtn: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    marginBottom: 12,
  },
  addWalletBtnText: { color: 'white', fontSize: 13, fontWeight: '600' },
  emptyWalletCard: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderStyle: 'dashed',
  },
  emptyWalletIcon: { fontSize: 32, marginBottom: 8 },
  emptyWalletTitle: { color: 'white', fontWeight: '700', fontSize: 15, marginBottom: 4 },
  emptyWalletSub: { color: 'rgba(255,255,255,0.6)', fontSize: 13 },
  walletsScroll: { marginBottom: 24 },
  walletCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    width: 148,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  walletIcon: { fontSize: 24, marginBottom: 8 },
  walletName: { fontSize: 14, fontWeight: '700', color: '#2d3748', marginBottom: 2 },
  walletType: { fontSize: 12, color: '#a0aec0', marginBottom: 8 },
  walletBalance: { fontSize: 16, fontWeight: '700', color: '#6c70a8', marginBottom: 6 },
  walletEditHint: {
    fontSize: 11,
    color: '#a0aec0',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 6,
    textAlign: 'center',
  },
  walletAddCard: {
    width: 120,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    borderStyle: 'dashed',
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginRight: 12,
  },
  walletAddIcon: { color: 'white', fontSize: 28, marginBottom: 4 },
  walletAddText: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '600' },
  summaryRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  summaryCard: { flex: 1, borderRadius: 16, padding: 16 },
  incomeCard: { backgroundColor: '#38a169' },
  expenseCard: { backgroundColor: '#e53e3e' },
  summaryLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginBottom: 4 },
  summaryAmount: { color: 'white', fontSize: 20, fontWeight: 'bold' },
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
  netLabel: { fontSize: 15, color: '#718096', fontWeight: '600' },
  netAmount: { fontSize: 20, fontWeight: 'bold' },
  txCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
  },
  txLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  txIndicator: { width: 4, height: 36, borderRadius: 2 },
  txCategory: { fontSize: 14, fontWeight: '700', color: '#2d3748' },
  txDate: { fontSize: 12, color: '#a0aec0', marginTop: 2 },
  txAmount: { fontSize: 15, fontWeight: '700' },
})