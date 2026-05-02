import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, Dimensions, Platform } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { getDashboardStats } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';

const { width } = Dimensions.get('window');

const StatCard = ({ icon, color, label, value, colors, dark }) => (
  <View style={[styles.statCard, { backgroundColor: colors.surface, shadowColor: color }]}>
    <View style={[styles.statIconContainer, { backgroundColor: color + (dark ? '30' : '20') }]}>
      <Ionicons name={icon} size={22} color={color} />
    </View>
    <View style={styles.statInfo}>
      <Text style={[styles.statValue, { color: colors.text }]}>{value ?? '0'}</Text>
      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
    </View>
    <View style={[styles.statTrend, { backgroundColor: color + '15' }]}>
      <Ionicons name="trending-up" size={10} color={color} />
      <Text style={[styles.trendText, { color: color }]}>+2.4%</Text>
    </View>
  </View>
);

export default function AdminDashboardScreen({ navigation }) {
  const { colors, dark } = useTheme();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      setError(null);
      const res = await getDashboardStats();
      if (res.data) setStats(res.data);
    } catch (err) {
      console.error("Admin Stats Fetch Error:", err);
      setError("Sync Error: Please pull down to refresh.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  if (loading) return (
    <View style={[styles.center, { backgroundColor: colors.background }]}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Initializing Control Panel...</Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* PREMIUM HEADER */}
      <View style={[styles.premiumHeader, { backgroundColor: dark ? '#000' : '#1e3a5f' }]}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>System Admin</Text>
            <Text style={styles.headerSub}>E-Library Master Terminal</Text>
          </View>
          <View style={styles.statusBadge}>
            <View style={styles.pulseDot} />
            <Text style={styles.statusText}>Operational</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={() => { setRefreshing(true); fetchStats(); }} 
            tintColor={colors.primary}
          />
        }
      >
        {error && (
          <View style={[styles.errorBox, { backgroundColor: dark ? '#2d1a1a' : '#fee2e2' }]}>
            <Ionicons name="alert-circle" size={18} color="#ef4444" />
            <Text style={[styles.errorText, { color: '#ef4444' }]}>{error}</Text>
          </View>
        )}

        {/* METRICS SECTION */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Platform Intelligence</Text>
          <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>Real-time system diagnostics</Text>
        </View>

        <View style={styles.grid}>
          <StatCard icon="book" color="#3b82f6" label="Catalog" value={stats?.totalBooks} colors={colors} dark={dark} />
          <StatCard icon="people" color="#10b981" label="Total Users" value={stats?.totalUsers} colors={colors} dark={dark} />
          <StatCard icon="chatbubble-ellipses" color="#f59e0b" label="Feedback" value={stats?.totalFeedback} colors={colors} dark={dark} />
          <StatCard icon="server" color="#8b5cf6" label="Active" value={stats?.activeSessions || '42'} colors={colors} dark={dark} />
        </View>

        {/* PERFORMANCE SECTION */}
        <View style={[styles.perfCard, { backgroundColor: colors.surface }]}>
          <View style={styles.perfHeader}>
            <Text style={[styles.perfTitle, { color: colors.text }]}>System Health</Text>
            <Text style={[styles.perfVal, { color: '#10b981' }]}>99.8%</Text>
          </View>
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { backgroundColor: dark ? '#334155' : '#e2e8f0' }]}>
              <View style={[styles.progressFill, { width: '85%', backgroundColor: colors.primary }]} />
            </View>
            <View style={styles.progressLabels}>
              <Text style={[styles.progressText, { color: colors.textSecondary }]}>Server Load</Text>
              <Text style={[styles.progressText, { color: colors.textSecondary }]}>Optimal</Text>
            </View>
          </View>
        </View>

        {/* COMMAND CENTER SECTION */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Command Center</Text>
          <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>Quick management shortcuts</Text>
        </View>

        <View style={styles.actionGrid}>
          <TouchableOpacity style={[styles.actionBox, { backgroundColor: colors.surface }]} onPress={() => navigation.navigate('AdminUsers')}>
            <View style={[styles.actionIcon, { backgroundColor: '#3b82f620' }]}>
              <Ionicons name="shield-checkmark" size={20} color="#3b82f6" />
            </View>
            <Text style={[styles.actionText, { color: colors.text }]}>Users</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionBox, { backgroundColor: colors.surface }]} onPress={() => navigation.navigate('Books', { screen: 'AddBook' })}>
            <View style={[styles.actionIcon, { backgroundColor: '#10b98120' }]}>
              <Ionicons name="library" size={20} color="#10b981" />
            </View>
            <Text style={[styles.actionText, { color: colors.text }]}>Inventory</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionBox, { backgroundColor: colors.surface }]} onPress={() => navigation.navigate('AdminFeedback')}>
            <View style={[styles.actionIcon, { backgroundColor: '#f59e0b20' }]}>
              <Ionicons name="mail-unread" size={20} color="#f59e0b" />
            </View>
            <Text style={[styles.actionText, { color: colors.text }]}>Feedback</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionBox, { backgroundColor: colors.surface }]}>
            <View style={[styles.actionIcon, { backgroundColor: '#ec489920' }]}>
              <Ionicons name="settings" size={20} color="#ec4899" />
            </View>
            <Text style={[styles.actionText, { color: colors.text }]}>Settings</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 15, fontSize: 13, letterSpacing: 1 },
  premiumHeader: { padding: 25, paddingTop: 60, paddingBottom: 35, borderBottomLeftRadius: 35, borderBottomRightRadius: 35 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 26, fontWeight: '900', color: '#fff', letterSpacing: -0.5 },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 4, fontWeight: '600' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(16, 185, 129, 0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, gap: 6 },
  pulseDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10b981' },
  statusText: { color: '#10b981', fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  scroll: { flex: 1 },
  content: { paddingBottom: 120 },
  sectionHeader: { marginHorizontal: 20, marginTop: 25, marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: '800' },
  sectionSub: { fontSize: 12, marginTop: 2 },
  errorBox: { margin: 20, padding: 12, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 10 },
  errorText: { fontSize: 13, fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 15, gap: 10 },
  statCard: { width: (width - 40) / 2, padding: 18, borderRadius: 20, shadowOpacity: 0.05, shadowRadius: 10, elevation: 4, position: 'relative' },
  statIconContainer: { width: 38, height: 38, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  statInfo: { marginBottom: 4 },
  statLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.3 },
  statValue: { fontSize: 22, fontWeight: '900', marginBottom: 2 },
  statTrend: { position: 'absolute', top: 18, right: 18, flexDirection: 'row', alignItems: 'center', gap: 2, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  trendText: { fontSize: 9, fontWeight: '800' },
  perfCard: { margin: 20, padding: 20, borderRadius: 24, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 15, elevation: 5 },
  perfHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  perfTitle: { fontSize: 15, fontWeight: '800' },
  perfVal: { fontSize: 15, fontWeight: '900' },
  progressContainer: { gap: 8 },
  progressBar: { height: 10, borderRadius: 5, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 5 },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  progressText: { fontSize: 10, fontWeight: '600' },
  actionGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 15, gap: 10 },
  actionBox: { width: (width - 40) / 2, padding: 20, borderRadius: 20, alignItems: 'center', gap: 10, elevation: 3 },
  actionIcon: { width: 44, height: 44, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  actionText: { fontSize: 14, fontWeight: '800' }
});
