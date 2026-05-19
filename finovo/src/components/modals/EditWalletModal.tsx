import React, { useState, useEffect } from 'react'
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'

const WALLET_TYPES = ['Cash', 'Bank', 'Mobile Money', 'Savings', 'Investment', 'Other']

interface Wallet {
  id: string
  name: string
  type: string
  balance: number
}

interface Props {
  visible: boolean
  wallet: Wallet | null
  onClose: () => void
  onSave: (id: string, updates: { name: string; type: string; balance: number }) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export default function EditWalletModal({ visible, wallet, onClose, onSave, onDelete }: Props) {
  const [name, setName] = useState('')
  const [type, setType] = useState('')
  const [balance, setBalance] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (wallet) {
      setName(wallet.name)
      setType(wallet.type)
      setBalance(String(wallet.balance))
      setError('')
    }
  }, [wallet])

  const handleClose = () => {
    setError('')
    onClose()
  }

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Wallet name is required')
      return
    }
    if (!type) {
      setError('Please select a wallet type')
      return
    }
    const balanceNum = parseFloat(balance)
    if (isNaN(balanceNum) || balanceNum < 0) {
      setError('Enter a valid balance (0 or more)')
      return
    }
    if (!wallet) return
    setLoading(true)
    setError('')
    try {
      await onSave(wallet.id, { name: name.trim(), type, balance: balanceNum })
      onClose()
    } catch (e: any) {
      setError(e.message ?? 'Failed to update wallet')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = () => {
    if (!wallet) return
    Alert.alert(
      'Delete Wallet',
      `Remove "${wallet.name}"? This will not delete your transactions, but the wallet balance will no longer count toward your total.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setLoading(true)
            try {
              await onDelete(wallet.id)
              onClose()
            } catch (e: any) {
              setError(e.message ?? 'Failed to delete wallet')
            } finally {
              setLoading(false)
            }
          },
        },
      ]
    )
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.title}>Edit Wallet</Text>

          <Text style={styles.label}>Wallet Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Wallet name"
            placeholderTextColor="#a0aec0"
            autoCapitalize="words"
          />

          <Text style={styles.label}>Type</Text>
          <View style={styles.typeGrid}>
            {WALLET_TYPES.map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.typeChip, type === t && styles.typeChipActive]}
                onPress={() => setType(t)}
              >
                <Text style={[styles.typeChipText, type === t && styles.typeChipTextActive]}>
                  {t}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Current Balance (GHS)</Text>
          <Text style={styles.balanceHint}>
            Set this to your actual current balance. It won't create a transaction — it just
            updates the displayed amount.
          </Text>
          <TextInput
            style={styles.input}
            value={balance}
            onChangeText={setBalance}
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
            <Text style={styles.deleteBtnText}>Delete Wallet</Text>
          </TouchableOpacity>
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
  balanceHint: {
    fontSize: 12,
    color: '#a0aec0',
    marginBottom: 8,
    marginTop: -2,
    lineHeight: 18,
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
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  typeChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f7fafc',
  },
  typeChipActive: {
    backgroundColor: '#6c70a8',
    borderColor: '#6c70a8',
  },
  typeChipText: {
    fontSize: 14,
    color: '#718096',
    fontWeight: '500',
  },
  typeChipTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  error: {
    color: '#e53e3e',
    fontSize: 13,
    marginBottom: 12,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
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
  saveBtn: {
    flex: 2,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#6c70a8',
    alignItems: 'center',
  },
  saveBtnText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 15,
  },
  deleteBtn: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e53e3e',
    alignItems: 'center',
  },
  deleteBtnText: {
    color: '#e53e3e',
    fontWeight: '700',
    fontSize: 15,
  },
  btnDisabled: { opacity: 0.6 },
})
