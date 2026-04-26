import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getDashboardStats } from '../../services/api';

const { width } = Dimensions.get('window');

const StatCard = ({ icon, color, label, value }) => (
  <View style={styles.statCard}>
    <View style={[styles.statIconContainer, { backgroundColor: color + '15' }]}>
      <Ionicons name={icon} size={24} color={color} />
    </View>
    <View style={styles.statInfo}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, { color: color }]}>{value ?? '0'}</Text>
    </View>
  </View>
);

export default function AdminDashboardScreen({ navigation }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await getDashboardStats();
      setStats(res.data);
    } catch (_) {}
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => { fetchStats(); }, []);

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#1e3a5f" />
      <Text style={styles.loadingText}>Loading overview...</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1e3a5f', '#12263f']}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Admin Hub</Text>
            <Text style={styles.headerSub}>Real-time system monitoring</Text>
          </View>
          <TouchableOpacity style={styles.profileBtn} onPress={() => navigation.navigate('Profile')}>
            <Ionicons name="person-circle" size={40} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.statusBanner}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>All systems operational</Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={() => { setRefreshing(true); fetchStats(); }} 
            tintColor="#1e3a5f"
          />
        }
      >
        <Text style={styles.sectionTitle}>Key Metrics</Text>
        <View style={styles.grid}>
          <StatCard icon="book-outline" color="#3b82f6" label="Total Books" value={stats?.totalBooks} />
          <StatCard icon="people-outline" color="#10b981" label="Users" value={stats?.totalUsers} />
          <StatCard icon="chatbubble-ellipses-outline" color="#f59e0b" label="Feedback" value={stats?.totalFeedback} />
          <StatCard icon="pulse-outline" color="#8b5cf6" label="Sessions" value={stats?.activeSessions} />
          <StatCard icon="star-half-outline" color="#ef4444" label="Avg Rating" value={stats?.avgRating ? Number(stats.avgRating).toFixed(1) : '0.0'} />
          <StatCard icon="git-pull-request-outline" color="#06b6d4" label="Requests" value={stats?.pendingRequests} />
        </View>

        <Text style={styles.sectionTitle}>Management Console</Text>
        <View style={styles.actionsGrid}>
          {[
            { label: 'Users', icon: 'people', screen: 'AdminUsers', color: '#10b981', desc: 'Manage access' },
            { label: 'Feedback', icon: 'chatbubbles', screen: 'AdminFeedback', color: '#f59e0b', desc: 'Read reviews' },
            { label: 'Add Book', icon: 'add-circle', screen: 'AddBook', color: '#3b82f6', desc: 'Expand library' },
            { label: 'Catalog', icon: 'library', screen: 'Books', color: '#8b5cf6', desc: 'Browse all' },
          ].map(({ label, icon, screen, color, desc }) => (
            <TouchableOpacity 
              key={label} 
              activeOpacity={0.8}
              style={styles.actionCard} 
              onPress={() => navigation.navigate(screen)}
            >
              <LinearGradient
                colors={['#ffffff', '#f8fafc']}
                style={styles.actionCardGradient}
              >
                <View style={[styles.actionIcon, { backgroundColor: color + '15' }]}>
                  <Ionicons name={icon} size={28} color={color} />
                </View>
                <View>
                  <Text style={styles.actionLabel}>{label}</Text>
                  <Text style={styles.actionDesc}>{desc}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#cbd5e1" style={styles.chevron} />
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9' },
  scroll: { flex: 1 },
  content: { paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f1f5f9' },
  loadingText: { marginTop: 12, color: '#64748b', fontSize: 15, fontWeight: '500' },
  headerGradient: { paddingTop: 60, paddingBottom: 30, paddingHorizontal: 24, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
  headerSub: { fontSize: 14, color: '#94a3b8', marginTop: 2, fontWeight: '500' },
  profileBtn: { shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10, elevation: 5 },
  statusBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(16, 185, 129, 0.15)', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginTop: 16 },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10b981', marginRight: 8 },
  statusText: { color: '#10b981', fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1e293b', paddingHorizontal: 24, marginTop: 24, marginBottom: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, gap: 12 },
  statCard: { width: (width - 52) / 2, backgroundColor: '#fff', borderRadius: 20, padding: 16, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 15, elevation: 3 },
  statIconContainer: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  statInfo: { flex: 1 },
  statValue: { fontSize: 20, fontWeight: '800', letterSpacing: -0.5 },
  statLabel: { fontSize: 12, color: '#64748b', fontWeight: '600', marginBottom: 2 },
  actionsGrid: { paddingHorizontal: 20, gap: 12 },
  actionCard: { borderRadius: 20, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 15, elevation: 3 },
  actionCardGradient: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  actionIcon: { width: 56, height: 56, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  actionLabel: { fontSize: 17, fontWeight: '800', color: '#1e293b' },
  actionDesc: { fontSize: 13, color: '#64748b', marginTop: 2, fontWeight: '500' },
  chevron: { marginLeft: 'auto' },
});
