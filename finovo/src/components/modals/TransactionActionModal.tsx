import React, { useEffect, useState } from 'react'
import {
  Alert,
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

interface Transaction {
  id: string
  category: string
  description: string
  amount: number
  transaction_type: 'INCOME' | 'EXPENSE'
  tag: 'PERSONAL' | 'BUSINESS'
}

interface Props {
  visible: boolean
  transaction: Transaction | null
  onClose: () => void
  onEdit: (id: string, updates: Partial<Transaction>) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export default function TransactionActionModal({
  visible,
  transaction,
  onClose,
  onEdit,
  onDelete,
}: Props) {
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [txType, setTxType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE')
  const [tag, setTag] = useState<'PERSONAL' | 'BUSINESS'>('PERSONAL')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Populate fields when a transaction is passed in
  useEffect(() => {
    if (transaction) {
      setCategory(transaction.category)
      setDescription(transaction.description ?? '')
      setAmount(String(transaction.amount))
      setTxType(transaction.transaction_type)
      setTag(transaction.tag)
      setError('')
    }
  }, [transaction])

  const handleSave = async () => {
    if (!category.trim() || !amount.trim()) {
      setError('Category and amount are required')
      return
    }
    const amountNum = parseFloat(amount)
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Enter a valid amount')
      return
    }
    if (!transaction) return
    setLoading(true)
    setError('')
    try {
      await onEdit(transaction.id, {
        category: category.trim(),
        description: description.trim(),
        amount: amountNum,
        transaction_type: txType,
        tag,
      })
      onClose()
    } catch (e: any) {
      setError(e.message ?? 'Failed to update')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = () => {
    if (!transaction) return
    Alert.alert(
      'Delete Transaction',
      'Are you sure you want to delete this transaction? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setLoading(true)
            try {
              await onDelete(transaction.id)
              onClose()
            } catch (e: any) {
              setError(e.message ?? 'Failed to delete')
            } finally {
              setLoading(false)
            }
          },
        },
      ]
    )
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>Edit Transaction</Text>

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
                  <Text style={[styles.toggleText, txType === t && styles.toggleTextActive]}>
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

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
              placeholder="Category"
              placeholderTextColor="#a0aec0"
              autoCapitalize="words"
            />

            <Text style={styles.label}>Description</Text>
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
              <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, loading && styles.btnDisabled]}
                onPress={handleSave}
                disabled={loading}
              >
                <Text style={styles.saveBtnText}>{loading ? 'Saving…' : 'Save'}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.deleteBtn, loading && styles.btnDisabled]}
              onPress={handleDelete}
              disabled={loading}
            >
              <Text style={styles.deleteBtnText}>Delete Transaction</Text>
            </TouchableOpacity>
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
  toggleText: { fontSize: 14, fontWeight: '600', color: '#a0aec0' },
  toggleTextActive: { color: 'white' },
  incomeActive: { backgroundColor: '#38a169', borderColor: '#38a169' },
  expenseActive: { backgroundColor: '#e53e3e', borderColor: '#e53e3e' },
  tagActive: { backgroundColor: '#6c70a8', borderColor: '#6c70a8' },
  error: { color: '#e53e3e', fontSize: 13, marginBottom: 12 },
  buttons: { flexDirection: 'row', gap: 12, marginTop: 4, marginBottom: 12 },
  cancelBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  cancelText: { color: '#718096', fontWeight: '600', fontSize: 15 },
  saveBtn: {
    flex: 2,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#6c70a8',
    alignItems: 'center',
  },
  saveBtnText: { color: 'white', fontWeight: '700', fontSize: 15 },
  deleteBtn: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e53e3e',
    alignItems: 'center',
  },
  deleteBtnText: { color: '#e53e3e', fontWeight: '700', fontSize: 15 },
  btnDisabled: { opacity: 0.6 },
})
