import React, { useState, useEffect } from 'react'
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'

interface Wallet {
  id: string
  name: string
  type: string
  balance: number
}

interface Props {
  visible: boolean
  category: string          // pre-filled from the budget card — user can still edit
  remaining: number         // shown as a hint so user knows how much headroom is left
  wallets: Wallet[]
  onClose: () => void
  onLog: (payload: {
    walletId: string
    category: string
    description: string
    amount: number
    tag: 'PERSONAL' | 'BUSINESS'
  }) => Promise<void>
}

export default function LogSpendModal({
  visible,
  category,
  remaining,
  wallets,
  onClose,
  onLog,
}: Props) {
  const [walletId, setWalletId] = useState('')
  const [editableCategory, setEditableCategory] = useState(category)
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [tag, setTag] = useState<'PERSONAL' | 'BUSINESS'>('PERSONAL')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Sync category whenever the parent opens a different budget card
  useEffect(() => {
    setEditableCategory(category)
    setError('')
  }, [category])

  const reset = () => {
    setWalletId('')
    setEditableCategory(category)
    setDescription('')
    setAmount('')
    setTag('PERSONAL')
    setError('')
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleSubmit = async () => {
    if (!walletId) {
      setError('Please select a wallet')
      return
    }
    if (!editableCategory.trim()) {
      setError('Category is required')
      return
    }
    const amountNum = parseFloat(amount)
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Enter a valid amount greater than 0')
      return
    }
    setLoading(true)
    setError('')
    try {
      await onLog({
        walletId,
        category: editableCategory.trim(),
        description: description.trim(),
        amount: amountNum,
        tag,
      })
      reset()
      onClose()
    } catch (e: any) {
      setError(e.message ?? 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const isOverBudget = remaining <= 0

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>Log Spend</Text>

            {/* Budget headroom hint */}
            <View style={[styles.hintBox, isOverBudget && styles.hintBoxDanger]}>
              <Text style={[styles.hintText, isOverBudget && styles.hintTextDanger]}>
                {isOverBudget
                  ? `⚠️  Budget already exceeded by GHS ${Math.abs(remaining).toFixed(2)}`
                  : `GHS ${remaining.toFixed(2)} remaining in this budget`}
              </Text>
            </View>

            {/* Wallet selector */}
            <Text style={styles.label}>Wallet</Text>
            {wallets.length === 0 ? (
              <Text style={styles.hint}>No wallets found. Add one from the dashboard first.</Text>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.chipScroll}
              >
                {wallets.map((w) => (
                  <TouchableOpacity
                    key={w.id}
                    style={[styles.chip, walletId === w.id && styles.chipActive]}
                    onPress={() => setWalletId(w.id)}
                  >
                    <Text style={[styles.chipText, walletId === w.id && styles.chipTextActive]}>
                      {w.name}
                    </Text>
                    <Text style={[styles.chipBalance, walletId === w.id && styles.chipBalanceActive]}>
                      GHS {w.balance.toLocaleString()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            {/* Category — pre-filled but editable in case user wants to split across sub-categories */}
            <Text style={styles.label}>Category</Text>
            <TextInput
              style={styles.input}
              value={editableCategory}
              onChangeText={setEditableCategory}
              placeholder="Category"
              placeholderTextColor="#a0aec0"
              autoCapitalize="words"
            />

            {/* Tag */}
            <Text style={styles.label}>Tag</Text>
            <View style={styles.toggleRow}>
              {(['PERSONAL', 'BUSINESS'] as const).map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.toggleBtn, tag === t && styles.tagActive]}
                  onPress={() => setTag(t)}
                >
                  <Text style={[styles.toggleText, tag === t && styles.toggleTextActive]}>
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Description (optional)</Text>
            <TextInput
              style={styles.input}
              value={description}
              onChangeText={setDescription}
              placeholder="e.g. Groceries at Shoprite"
              placeholderTextColor="#a0aec0"
            />

            <Text style={styles.label}>Amount (GHS)</Text>
            <TextInput
              style={styles.input}
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              placeholderTextColor="#a0aec0"
              keyboardType="numeric"
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <View style={styles.buttons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={handleClose}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitBtn, loading && styles.submitDisabled]}
                onPress={handleSubmit}
                disabled={loading}
              >
                <Text style={styles.submitText}>{loading ? 'Logging…' : 'Log Spend'}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    maxHeight: '92%',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#e2e8f0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2d3748',
    marginBottom: 16,
  },
  hintBox: {
    backgroundColor: '#f0fff4',
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
    borderLeftWidth: 3,
    borderLeftColor: '#38a169',
  },
  hintBoxDanger: {
    backgroundColor: '#fff5f5',
    borderLeftColor: '#e53e3e',
  },
  hintText: {
    fontSize: 13,
    color: '#38a169',
    fontWeight: '600',
  },
  hintTextDanger: {
    color: '#e53e3e',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#718096',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chipScroll: { marginBottom: 16 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginRight: 8,
    backgroundColor: '#f7fafc',
    alignItems: 'center',
  },
  chipActive: {
    backgroundColor: '#6c70a8',
    borderColor: '#6c70a8',
  },
  chipText: {
    fontSize: 14,
    color: '#4a5568',
    fontWeight: '600',
  },
  chipTextActive: {
    color: 'white',
  },
  chipBalance: {
    fontSize: 11,
    color: '#a0aec0',
    marginTop: 2,
  },
  chipBalanceActive: {
    color: 'rgba(255,255,255,0.75)',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#2d3748',
    marginBottom: 16,
    backgroundColor: '#f7fafc',
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  toggleBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  toggleText: { fontSize: 14, fontWeight: '600', color: '#a0aec0' },
  toggleTextActive: { color: 'white' },
  tagActive: { backgroundColor: '#6c70a8', borderColor: '#6c70a8' },
  hint: {
    fontSize: 13,
    color: '#a0aec0',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  error: {
    color: '#e53e3e',
    fontSize: 13,
    marginBottom: 12,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  cancelBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  cancelText: { color: '#718096', fontWeight: '600', fontSize: 15 },
  submitBtn: {
    flex: 2,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#e53e3e',
    alignItems: 'center',
  },
  submitDisabled: { opacity: 0.6 },
  submitText: { color: 'white', fontWeight: '700', fontSize: 15 },
})
