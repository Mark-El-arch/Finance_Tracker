import React, { useState } from 'react'
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'

interface Props {
  visible: boolean
  onClose: () => void
  onAdd: (category: string, limitAmount: number) => Promise<void>
}

export default function AddBudgetModal({ visible, onClose, onAdd }: Props) {
  const [category, setCategory] = useState('')
  const [limit, setLimit] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const reset = () => {
    setCategory('')
    setLimit('')
    setError('')
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleSubmit = async () => {
    if (!category.trim() || !limit.trim()) {
      setError('All fields are required')
      return
    }
    const limitNum = parseFloat(limit)
    if (isNaN(limitNum) || limitNum <= 0) {
      setError('Enter a valid amount greater than 0')
      return
    }
    setLoading(true)
    setError('')
    try {
      await onAdd(category.trim(), limitNum)
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
          <Text style={styles.title}>New Budget</Text>

          <Text style={styles.label}>Category</Text>
          <TextInput
            style={styles.input}
            value={category}
            onChangeText={setCategory}
            placeholder="e.g. Food, Transport, Rent"
            placeholderTextColor="#a0aec0"
            autoCapitalize="words"
          />

          <Text style={styles.label}>Monthly Limit (GHS)</Text>
          <TextInput
            style={styles.input}
            value={limit}
            onChangeText={setLimit}
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
              <Text style={styles.submitText}>{loading ? 'Saving…' : 'Add Budget'}</Text>
            </TouchableOpacity>
          </View>
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
    backgroundColor: '#6c70a8',
    alignItems: 'center',
  },
  submitDisabled: {
    opacity: 0.6,
  },
  submitText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 15,
  },
})
