import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { supabase } from '../src/lib/supabase'
import { router } from 'expo-router'
import { Ionicons } from "@expo/vector-icons"

export default function AccountScreen() {
    const [userName, setUserName] = useState('')
    const [userEmail, setUserEmail] = useState('')
    const [initials, setInitials] = useState('')

    useEffect(() => {
        const load = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const name = user.user_metadata?.name ?? 'User'
                const email = user.email ?? ''
                setUserName(name)
                setUserEmail(email)
                const parts = name.trim().split(' ')
                const ini = parts.length >= 2
                    ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
                    : name.slice(0, 2).toUpperCase()
                setInitials(ini)
            }
        }
        load()
    }, [])

    const handleSignOut = async () => {
        Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Sign Out',
                style: 'destructive',
                onPress: async () => {
                    await supabase.auth.signOut()
                    router.replace('/(auth)/sign-in')
                }
            }
        ])
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.screenTitle}>Account</Text>

                {/* Avatar & Name */}
                <View style={styles.profileCard}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{initials}</Text>
                    </View>
                    <Text style={styles.userName}>{userName}</Text>
                    <Text style={styles.userEmail}>{userEmail}</Text>
                </View>

                {/* Account Details */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Account Details</Text>
                    <View style={styles.detailCard}>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Full Name</Text>
                            <Text style={styles.detailValue}>{userName}</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Email</Text>
                            <Text style={styles.detailValue}>{userEmail}</Text>
                        </View>
                    </View>
                </View>

                {/* Sign Out */}
                <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
                    <Text style={styles.signOutText}>Sign Out</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'rgba(108, 112, 168, 0.6)' },
    scrollContent: { padding: 16 },
    screenTitle: { fontSize: 28, fontWeight: 'bold', color: 'white', marginBottom: 24 },
    profileCard: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        marginBottom: 24,
        elevation: 4,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#6c70a8',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    avatarText: { fontSize: 28, fontWeight: 'bold', color: 'white' },
    userName: { fontSize: 22, fontWeight: '700', color: '#2d3748', marginBottom: 4 },
    userEmail: { fontSize: 14, color: '#718096' },
    section: { marginBottom: 24 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: 'white', marginBottom: 12 },
    detailCard: { backgroundColor: 'white', borderRadius: 16, padding: 16, elevation: 3 },
    detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
    detailLabel: { fontSize: 14, color: '#718096', fontWeight: '600' },
    detailValue: { fontSize: 14, color: '#2d3748', fontWeight: '600', flex: 1, textAlign: 'right' },
    divider: { height: 1, backgroundColor: '#e2e8f0' },
    signOutButton: {
        backgroundColor: '#e53e3e',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        marginTop: 8,
    },
    signOutText: {
         color: 'white', 
         fontSize: 16, 
         fontWeight: '700' 
    },
    backButton: {
        marginBottom: 16,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.3)',
        alignItems: 'center',
        justifyContent: 'center',
    },
})