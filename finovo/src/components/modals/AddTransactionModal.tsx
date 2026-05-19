import React, { useState } from 'react'
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
}

interface Props {
  visible: boolean
  wallets: Wallet[]
  onClose: () => void
  onAdd: (payload: {
    walletId: string
    category: string
    description: string
    amount: number
    transactionType: 'INCOME' | 'EXPENSE'
    tag: 'PERSONAL' | 'BUSINESS'
  }) => Promise<void>
}

export default function AddTransactionModal({ visible, wallets, onClose, onAdd }: Props) {
  const [walletId, setWalletId] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [txType, setTxType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE')
  const [tag, setTag] = useState<'PERSONAL' | 'BUSINESS'>('PERSONAL')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const reset = () => {
    setWalletId('')
    setCategory('')
    setDescription('')
    setAmount('')
    setTxType('EXPENSE')
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
    if (!category.trim() || !amount.trim()) {
      setError('Category and amount are required')
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
      await onAdd({
        walletId,
        category: category.trim(),
        description: description.trim(),
        amount: amountNum,
        transactionType: txType,
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

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>New Transaction</Text>

            {/* Type toggle */}
            <View style={styles.toggleRow}>
              {(['EXPENSE', 'INCOME'] as const).map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[
                    styles.toggleBtn,
                    txType === t && (t === 'INCOME' ? styles.incomeActive : styles.expenseActive),
                  ]}
                  onPress={() => setTxType(t)}
                >
                  <Text
                    style={[
                      styles.toggleText,
                      txType === t && styles.toggleTextActive,
                    ]}
                  >
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Wallet selector */}
            <Text style={styles.label}>Wallet</Text>
            {wallets.length === 0 ? (
              <Text style={styles.hint}>No wallets found. Add one from the dashboard.</Text>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                {wallets.map((w) => (
                  <TouchableOpacity
                    key={w.id}
                    style={[styles.chip, walletId === w.id && styles.chipActive]}
                    onPress={() => setWalletId(w.id)}
                  >
                    <Text style={[styles.chipText, walletId === w.id && styles.chipTextActive]}>
                      {w.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            {/* Tag toggle */}
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

            <Text style={styles.label}>Category</Text>
            <TextInput
              style={styles.input}
              value={category}
              onChangeText={setCategory}
              placeholder="e.g. Food, Salary, Rent"
              placeholderTextColor="#a0aec0"
              autoCapitalize="words"
            />

            <Text style={styles.label}>Description (optional)</Text>
            <TextInput
              style={styles.input}
              value={description}
              onChangeText={setDescription}
              placeholder="Short note"
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
                style={[
                  styles.submitBtn,
                  txType === 'INCOME' ? styles.incomeBtn : styles.expenseBtn,
                  loading && styles.submitDisabled,
                ]}
                onPress={handleSubmit}
                disabled={loading}
              >
                <Text style={styles.submitText}>{loading ? 'Saving…' : 'Add Transaction'}</Text>
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
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#718096',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#a0aec0',
  },
  toggleTextActive: {
    color: 'white',
  },
  incomeActive: {
    backgroundColor: '#38a169',
    borderColor: '#38a169',
  },
  expenseActive: {
    backgroundColor: '#e53e3e',
    borderColor: '#e53e3e',
  },
  tagActive: {
    backgroundColor: '#6c70a8',
    borderColor: '#6c70a8',
  },
  chipScroll: { marginBottom: 16 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginRight: 8,
    backgroundColor: '#f7fafc',
  },
  chipActive: {
    backgroundColor: '#6c70a8',
    borderColor: '#6c70a8',
  },
  chipText: {
    fontSize: 14,
    color: '#718096',
    fontWeight: '500',
  },
  chipTextActive: {
    color: 'white',
    fontWeight: '600',
  },
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
  cancelText: {
    color: '#718096',
    fontWeight: '600',
    fontSize: 15,
  },
  submitBtn: {
    flex: 2,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  incomeBtn: { backgroundColor: '#38a169' },
  expenseBtn: { backgroundColor: '#e53e3e' },
  submitDisabled: { opacity: 0.6 },
  submitText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 15,
  },
})
