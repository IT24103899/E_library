import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../config/api';

export default function PaymentScreen({ navigation }) {
  const { user, token, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isPremium, setIsPremium] = useState(user?.isPremium || false);

  useEffect(() => {
    // Check latest status
    const checkStatus = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}payments/status/${user._id}`);
        const data = await res.json();
        if (data.success) {
          setIsPremium(data.isPremium);
        }
      } catch (err) {
        console.error("Failed to check status", err);
      }
    };
    checkStatus();
  }, [user._id]);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      // Simulate Stripe checkout flow locally for the mobile app
      const res = await fetch(`${API_BASE_URL}payments/upgrade`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId: user._id })
      });
      const data = await res.json();
      if (data.success) {
        Alert.alert("Success", "You are now a Premium Member!");
        setIsPremium(true);
        if(refreshUser) await refreshUser();
      } else {
        Alert.alert("Error", data.message || "Upgrade failed");
      }
    } catch (err) {
      Alert.alert("Error", "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Subscription</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.statusHeader}>
          <Text style={styles.statusLabel}>Current Plan:</Text>
          <View style={[styles.badge, isPremium ? styles.badgePremium : styles.badgeNormal]}>
            <Text style={styles.badgeText}>{isPremium ? 'PREMIER' : 'NORMAL'}</Text>
          </View>
        </View>

        {!isPremium && (
          <View style={styles.upgradeSection}>
            <Text style={styles.upgradeTitle}>Unlock Premier Features</Text>
            
            <View style={styles.featureRow}>
              <Ionicons name="checkmark-circle" size={24} color="#4f46e5" />
              <Text style={styles.featureText}>Unlimited Book Downloads</Text>
            </View>
            <View style={styles.featureRow}>
              <Ionicons name="checkmark-circle" size={24} color="#4f46e5" />
              <Text style={styles.featureText}>Ad-free Reading Experience</Text>
            </View>
            <View style={styles.featureRow}>
              <Ionicons name="checkmark-circle" size={24} color="#4f46e5" />
              <Text style={styles.featureText}>Exclusive Premium Books</Text>
            </View>

            <View style={styles.priceContainer}>
              <Text style={styles.price}>$4.99</Text>
              <Text style={styles.pricePeriod}>/month</Text>
            </View>

            <Pressable 
              style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]} 
              onPress={handleUpgrade}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="card" size={20} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={styles.buttonText}>Upgrade with Stripe</Text>
                </>
              )}
            </Pressable>
          </View>
        )}

        {isPremium && (
          <View style={styles.premiumSection}>
            <Ionicons name="star" size={48} color="#f59e0b" style={{ alignSelf: 'center', marginBottom: 16 }} />
            <Text style={styles.premiumText}>Thank you for being a Premier Member! You have full access to all features.</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { padding: 20, backgroundColor: '#1e3a5f', paddingBottom: 30 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  card: { 
    margin: 16, 
    marginTop: -20, 
    backgroundColor: '#fff', 
    borderRadius: 16, 
    padding: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 5
  },
  statusHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  statusLabel: { fontSize: 16, color: '#64748b', fontWeight: '600' },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  badgePremium: { backgroundColor: '#fef3c7' },
  badgeNormal: { backgroundColor: '#e2e8f0' },
  badgeText: { fontWeight: 'bold', fontSize: 14, color: '#1e293b' },
  upgradeSection: { marginTop: 8 },
  upgradeTitle: { fontSize: 20, fontWeight: 'bold', color: '#0f172a', marginBottom: 16 },
  featureRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  featureText: { marginLeft: 12, fontSize: 16, color: '#334155' },
  priceContainer: { flexDirection: 'row', alignItems: 'baseline', marginTop: 24, marginBottom: 24, justifyContent: 'center' },
  price: { fontSize: 36, fontWeight: 'bold', color: '#0f172a' },
  pricePeriod: { fontSize: 16, color: '#64748b', marginLeft: 4 },
  button: { backgroundColor: '#4f46e5', flexDirection: 'row', padding: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  buttonPressed: { opacity: 0.8 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  premiumSection: { paddingVertical: 24, alignItems: 'center' },
  premiumText: { fontSize: 16, color: '#334155', textAlign: 'center', lineHeight: 24 }
});
