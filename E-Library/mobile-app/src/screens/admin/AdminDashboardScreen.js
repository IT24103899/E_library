import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, Dimensions, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getDashboardStats } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';

const { width } = Dimensions.get('window');

const StatCard = ({ icon, color, label, value, colors, dark }) => (
  <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: dark ? colors.border : 'rgba(0,0,0,0.02)' }]}>
    <View style={[styles.statIconContainer, { backgroundColor: color + '15' }]}>
      <Ionicons name={icon} size={24} color={color} />
    </View>
    <View style={styles.statInfo}>
      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.statValue, { color: color }]}>{value ?? '0'}</Text>
    </View>
  </View>
);

export default function AdminDashboardScreen({ navigation }) {
  const { colors, dark } = useTheme();
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
    <View style={[styles.center, { backgroundColor: colors.background }]}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading overview...</Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={dark ? ['#000000', '#0f172a', '#1e293b'] : ['#0f172a', '#1e293b', '#334155']}
        style={styles.headerGradient}
        start={{x: 0, y: 0}} end={{x: 1, y: 1}}
      >
        <View style={styles.headerAccent1} />
        <View style={styles.headerAccent2} />
        
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>System Hub</Text>
            <Text style={[styles.headerSub, { color: dark ? colors.textSecondary : '#94a3b8' }]}>Control Center • v1.0.4</Text>
          </View>
          <TouchableOpacity style={styles.profileBtn} onPress={() => navigation.navigate('Profile')}>
            <LinearGradient colors={['#4f46e5', '#a855f7']} style={styles.profileIconGradient}>
              <Ionicons name="shield-checkmark" size={24} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={[styles.statusBanner, { backgroundColor: dark ? 'rgba(52, 211, 153, 0.1)' : 'rgba(16, 185, 129, 0.15)', borderColor: dark ? 'rgba(52, 211, 153, 0.2)' : 'rgba(16, 185, 129, 0.2)' }]}>
          <View style={[styles.statusDot, { backgroundColor: dark ? '#34d399' : '#10b981' }]} />
          <Text style={[styles.statusText, { color: dark ? '#34d399' : '#10b981' }]}>ALL SYSTEMS OPERATIONAL</Text>
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
            tintColor={colors.primary}
          />
        }
      >
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Key Metrics</Text>
        <View style={styles.grid}>
          <StatCard icon="book-outline" color="#3b82f6" label="Total Books" value={stats?.totalBooks} colors={colors} dark={dark} />
          <StatCard icon="people-outline" color="#10b981" label="Users" value={stats?.totalUsers} colors={colors} dark={dark} />
          <StatCard icon="chatbubble-ellipses-outline" color="#f59e0b" label="Feedback" value={stats?.totalFeedback} colors={colors} dark={dark} />
          <StatCard icon="pulse-outline" color="#8b5cf6" label="Sessions" value={stats?.activeSessions} colors={colors} dark={dark} />
          <StatCard icon="star-half-outline" color="#ef4444" label="Avg Rating" value={stats?.avgRating ? Number(stats.avgRating).toFixed(1) : '0.0'} colors={colors} dark={dark} />
          <StatCard icon="git-pull-request-outline" color="#06b6d4" label="Requests" value={stats?.pendingRequests} colors={colors} dark={dark} />
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Management Console</Text>
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
              style={[styles.actionCard, { shadowColor: dark ? '#000' : colors.primary }]} 
              onPress={() => navigation.navigate(screen)}
            >
              <LinearGradient
                colors={dark ? ['#121212', '#1a1a1a'] : ['#ffffff', '#f8fafc']}
                style={styles.actionCardGradient}
              >
                <View style={[styles.actionIcon, { backgroundColor: color + '15' }]}>
                  <Ionicons name={icon} size={28} color={color} />
                </View>
                <View>
                  <Text style={[styles.actionLabel, { color: colors.text }]}>{label}</Text>
                  <Text style={[styles.actionDesc, { color: colors.textSecondary }]}>{desc}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.border} style={styles.chevron} />
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  content: { paddingBottom: 110 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 15, fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },
  
  headerGradient: { 
    paddingTop: 70, 
    paddingBottom: 40, 
    paddingHorizontal: 25, 
    borderBottomLeftRadius: 40, 
    borderBottomRightRadius: 40,
    position: 'relative',
    overflow: 'hidden',
    elevation: 15,
  },
  headerAccent1: { position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(79, 70, 229, 0.1)' },
  headerAccent2: { position: 'absolute', bottom: -30, left: -30, width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(168, 85, 247, 0.08)' },
  
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', zIndex: 1 },
  headerTitle: { fontSize: 32, fontWeight: '900', color: '#fff', letterSpacing: -1 },
  headerSub: { fontSize: 14, marginTop: 4, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  
  profileBtn: { 
    width: 50, height: 50, borderRadius: 15, overflow: 'hidden',
    shadowColor: '#4f46e5', shadowOpacity: 0.3, shadowRadius: 10, elevation: 8 
  },
  profileIconGradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  statusBanner: { 
    flexDirection: 'row', alignItems: 'center', 
    alignSelf: 'flex-start', paddingHorizontal: 14, paddingVertical: 8, 
    borderRadius: 12, marginTop: 25, zIndex: 1,
    borderWidth: 1
  },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 10 },
  statusText: { fontSize: 11, fontWeight: '900', letterSpacing: 1 },
  
  sectionTitle: { fontSize: 22, fontWeight: '900', paddingHorizontal: 25, marginTop: 35, marginBottom: 20, letterSpacing: -0.5 },
  
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, gap: 12 },
  statCard: { 
    width: (width - 56) / 2, 
    borderRadius: 24, 
    padding: 20, 
    flexDirection: 'column', 
    alignItems: 'flex-start', 
    shadowOpacity: 0.1, shadowRadius: 15, elevation: 5,
    borderWidth: 1
  },
  statIconContainer: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  statInfo: { width: '100%' },
  statValue: { fontSize: 24, fontWeight: '900', letterSpacing: -0.8 },
  statLabel: { fontSize: 13, fontWeight: '800', marginBottom: 4, textTransform: 'capitalize' },
  
  actionsGrid: { paddingHorizontal: 20, gap: 15 },
  actionCard: { 
    borderRadius: 24, overflow: 'hidden', 
    shadowOpacity: 0.08, shadowRadius: 20, elevation: 6,
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.02)'
  },
  actionCardGradient: { flexDirection: 'row', alignItems: 'center', padding: 20 },
  actionIcon: { width: 60, height: 60, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 20, elevation: 2 },
  actionLabel: { fontSize: 18, fontWeight: '900', letterSpacing: -0.4 },
  actionDesc: { fontSize: 14, marginTop: 4, fontWeight: '600' },
  chevron: { marginLeft: 'auto', opacity: 0.3 },
});
