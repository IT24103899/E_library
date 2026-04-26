import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator,
  RefreshControl, TextInput, TouchableOpacity, Image,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getActivity, getReadingStats } from '../../services/api';

const { width } = Dimensions.get('window');
const COLORS = ['#FF6B6B', '#4ECDC4', '#FF9F1C', '#1A535C', '#6C5CE7', '#A8E6CF'];

export default function ActivityScreen() {
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const [actRes, statsRes] = await Promise.all([getActivity(), getReadingStats()]);
      const activities = (actRes.data || []).filter(item => item && item.pageNumber !== undefined);
      setHistory(activities);
      setStats(statsRes.data || null);
    } catch (error) {
      console.error('Error fetching activity data:', error);
      setHistory([]);
      setStats(null);
    }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filteredHistory = filter.trim()
    ? history.filter(h => (h.title || '').toLowerCase().includes(filter.toLowerCase()))
    : history;

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return '—';
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return '—';
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#FF6B6B" /></View>;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FF6B6B', '#FF8E8E']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Your Journey 🚀</Text>
            <Text style={styles.headerSubtitle}>Look how far you've come!</Text>
          </View>
          <TouchableOpacity style={styles.profileBadge}>
             <Ionicons name="person-circle" size={44} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor="#FF6B6B" />}
      >
        <View style={styles.statsRow}>
          {[
            { label: 'Books', value: stats?.booksRead || 0, icon: 'library-outline', color: '#4ECDC4' },
            { label: 'Pages', value: stats?.pagesRead || 0, icon: 'document-text-outline', color: '#6C5CE7' },
            { label: 'Streak', value: stats?.streak || 0, icon: 'flame-outline', color: '#FF6B6B' },
            { label: 'Velocity', value: stats?.velocity || 0, icon: 'speedometer-outline', color: '#FF9F1C' },
          ].map((s, i) => (
            <View key={i} style={styles.statBubble}>
              <View style={[styles.iconBox, { backgroundColor: s.color + '15' }]}>
                <Ionicons name={s.icon} size={22} color={s.color} />
              </View>
              <Text style={styles.statVal}>{s.value}</Text>
              <Text style={styles.statLab}>{s.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search history..."
              placeholderTextColor="#999"
              value={filter}
              onChangeText={setFilter}
            />
          </View>
        </View>

        <View style={styles.timelineSection}>
          <Text style={styles.sectionHeading}>Reading Timeline</Text>
          
          {filteredHistory.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Ionicons name="journal-outline" size={60} color="#eee" />
              <Text style={styles.emptyMain}>No progress found</Text>
              <Text style={styles.emptySub}>Start reading to track your journey here!</Text>
            </View>
          ) : (
            <View style={styles.timelineList}>
              <View style={styles.timelineTrack} />
              {filteredHistory.map((item, idx) => {
                if (!item) return null;
                const totalPages = parseInt(item.totalPages) || 0;
                const pageNumber = parseInt(item.pageNumber) || 0;
                const progress = totalPages > 0 ? Math.round((pageNumber / totalPages) * 100) : 0;
                const dotColor = COLORS[idx % COLORS.length];

                return (
                  <View key={idx} style={styles.timelineItem}>
                    <View style={[styles.dot, { backgroundColor: dotColor, borderColor: '#fff' }]} />
                    <View style={styles.card}>
                      <View style={styles.cardHeader}>
                        <Text style={styles.dateText}>{formatDate(item.lastReadAt)}</Text>
                        {idx === 0 && !filter && (
                          <View style={styles.currentBadge}>
                            <Text style={styles.currentText}>Current</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.bookTitle} numberOfLines={1}>{item.title || item.bookTitle || 'Untitled Book'}</Text>
                      <Text style={styles.authorText} numberOfLines={1}>{item.author || 'Unknown Author'}</Text>
                      
                      <View style={styles.progressRow}>
                        <Text style={styles.progressDetail}>
                          Reached page {pageNumber}
                          {progress > 0 && <Text style={styles.percentageText}> • {progress}%</Text>}
                        </Text>
                      </View>

                      {progress > 0 && (
                        <View style={styles.barContainer}>
                          <View style={styles.barBg}>
                             <View style={[styles.barFill, { flex: progress / 100, backgroundColor: dotColor }]} />
                             <View style={[styles.barFill, { flex: (100 - progress) / 100, backgroundColor: 'transparent' }]} />
                          </View>
                        </View>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { 
    paddingTop: 65, paddingBottom: 50, paddingHorizontal: 25,
    borderBottomLeftRadius: 40, borderBottomRightRadius: 40,
    elevation: 8, shadowColor: '#FF6B6B', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 15
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 26, fontWeight: '900', color: '#fff', letterSpacing: 0.5 },
  headerSubtitle: { fontSize: 14, color: '#FFEBEE', marginTop: 2, fontWeight: '500' },
  profileBadge: { opacity: 0.9 },
  content: { paddingBottom: 40 },
  statsRow: { 
    flexDirection: 'row', justifyContent: 'space-between', 
    marginTop: -35, marginHorizontal: 20,
    backgroundColor: '#fff', borderRadius: 25, padding: 20,
    elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.08, shadowRadius: 20
  },
  statBubble: { alignItems: 'center', flex: 1 },
  iconBox: { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  statVal: { fontSize: 18, fontWeight: '800', color: '#1A535C' },
  statLab: { fontSize: 10, color: '#94A3B8', textTransform: 'uppercase', fontWeight: '700', marginTop: 2 },
  searchSection: { marginTop: 25, paddingHorizontal: 25 },
  searchContainer: { 
    flexDirection: 'row', alignItems: 'center', 
    backgroundColor: '#fff', borderRadius: 15, paddingHorizontal: 15, height: 50,
    borderWidth: 1, borderColor: '#F1F5F9'
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, color: '#1E293B', fontSize: 15, fontWeight: '600' },
  timelineSection: { marginTop: 25, paddingHorizontal: 25 },
  sectionHeading: { fontSize: 20, fontWeight: '800', color: '#1E293B', marginBottom: 20 },
  timelineList: { position: 'relative' },
  timelineTrack: { 
    position: 'absolute', left: 8, top: 10, bottom: 20, 
    width: 2, backgroundColor: '#E2E8F0', borderRadius: 1 
  },
  timelineItem: { flexDirection: 'row', marginBottom: 25, alignItems: 'flex-start' },
  dot: { 
    width: 18, height: 18, borderRadius: 9, 
    borderWidth: 4, zIndex: 1, marginTop: 4,
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2
  },
  card: { 
    flex: 1, marginLeft: 20, backgroundColor: '#fff', 
    borderRadius: 20, padding: 18,
    borderWidth: 1, borderColor: '#F1F5F9',
    elevation: 3, shadowColor: '#334155', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 8
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  dateText: { fontSize: 12, fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' },
  currentBadge: { backgroundColor: '#FF6B6B15', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  currentText: { fontSize: 10, color: '#FF6B6B', fontWeight: '800', textTransform: 'uppercase' },
  bookTitle: { fontSize: 17, fontWeight: '800', color: '#1E293B', marginBottom: 12 },
  authorText: { fontSize: 13, color: '#94A3B8', fontWeight: '500', marginBottom: 12, fontStyle: 'italic' },
  progressRow: { marginBottom: 12 },
  progressDetail: { fontSize: 13, color: '#64748B', fontWeight: '600' },
  percentageText: { color: '#1E293B', fontWeight: '800' },
  barContainer: { marginTop: 8, marginBottom: 12, height: 8 },
  barBg: { flex: 1, height: 8, backgroundColor: '#F1F5F9', borderRadius: 4, overflow: 'hidden', flexDirection: 'row' },
  barFill: { height: '100%', borderRadius: 4 },
  emptyWrap: { alignItems: 'center', marginTop: 40 },
  emptyMain: { fontSize: 18, fontWeight: '800', color: '#94A3B8', marginTop: 15 },
  emptySub: { fontSize: 14, color: '#CBD5E1', marginTop: 5, textAlign: 'center' }
});
