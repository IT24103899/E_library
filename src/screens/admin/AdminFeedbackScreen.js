import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, Alert, RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getFeedback, updateFeedbackStatus } from '../../services/api';

const TYPE_ICONS = { 'Bug Report': 'bug-outline', 'Feature Request': 'bulb-outline', General: 'chatbubble-outline' };
const STATUS_COLORS = { pending: '#f57c00', approved: '#2e7d32', rejected: '#e53e3e' };
const FILTER_OPTS = ['All', 'pending', 'approved', 'rejected'];

export default function AdminFeedbackScreen() {
  const [feedback, setFeedback] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchFeedback = useCallback(async () => {
    try {
      const res = await getFeedback();
      const data = res.data || [];
      setFeedback(data);
      applyFilter(data, statusFilter);
    } catch (_) {}
    setLoading(false);
    setRefreshing(false);
  }, [statusFilter]);

  const applyFilter = (data, filter) => {
    if (filter === 'All') { setFiltered(data); return; }
    setFiltered(data.filter((f) => f.status === filter));
  };

  useEffect(() => { fetchFeedback(); }, [fetchFeedback]);

  const handleFilterChange = (f) => {
    setStatusFilter(f);
    applyFilter(feedback, f);
  };

  const handleAction = (id, action) => {
    const label = action === 'approved' ? 'Approve' : 'Reject';
    Alert.alert(`${label} Feedback`, `${label} this feedback submission?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: label, onPress: async () => {
          try {
            await updateFeedbackStatus(id, action);
            fetchFeedback();
          } catch (_) { Alert.alert('Error', 'Could not update feedback status'); }
        }
      }
    ]);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.typeRow}>
          <Ionicons name={TYPE_ICONS[item.type] || 'chatbubble-outline'} size={16} color="#1e3a5f" />
          <Text style={styles.typeText}>{item.type || 'General'}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: (STATUS_COLORS[item.status] || '#888') + '22' }]}>
          <Text style={[styles.statusText, { color: STATUS_COLORS[item.status] || '#888' }]}>
            {item.status || 'pending'}
          </Text>
        </View>
      </View>

      <Text style={styles.message}>{item.message}</Text>

      <View style={styles.cardFooter}>
        <View style={styles.ratingRow}>
          {[1, 2, 3, 4, 5].map((n) => (
            <Ionicons key={n} name={n <= (item.rating || 0) ? 'star' : 'star-outline'} size={13} color="#f59e0b" />
          ))}
          <Text style={styles.ratingNum}>({item.rating || 0}/5)</Text>
        </View>
        <Text style={styles.metaText}>{item.user?.name || item.user?.email || 'Anonymous'}</Text>
      </View>

      {item.status === 'pending' && (
        <View style={styles.actionRow}>
          <TouchableOpacity style={[styles.actionBtn, styles.approveBtn]} onPress={() => handleAction(item._id, 'approved')}>
            <Ionicons name="checkmark-outline" size={16} color="#fff" />
            <Text style={styles.actionBtnText}>Approve</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.rejectBtn]} onPress={() => handleAction(item._id, 'rejected')}>
            <Ionicons name="close-outline" size={16} color="#fff" />
            <Text style={styles.actionBtnText}>Reject</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#1e3a5f" /></View>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Feedback Management</Text>
        <Text style={styles.headerSub}>{feedback.length} submissions</Text>
      </View>

      {/* Filter chips */}
      <View style={styles.filters}>
        {FILTER_OPTS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, statusFilter === f && styles.filterChipActive]}
            onPress={() => handleFilterChange(f)}
          >
            <Text style={[styles.filterChipText, statusFilter === f && styles.filterChipTextActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(f) => String(f._id)}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchFeedback(); }} />}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Ionicons name="chatbubbles-outline" size={50} color="#ccc" />
            <Text style={styles.emptyText}>No feedback to show</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fb' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: '#1e3a5f', paddingTop: 50, paddingBottom: 18, paddingHorizontal: 16 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  headerSub: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 3 },
  filters: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 16, backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd' },
  filterChipActive: { backgroundColor: '#1e3a5f', borderColor: '#1e3a5f' },
  filterChipText: { fontSize: 13, color: '#666' },
  filterChipTextActive: { color: '#fff', fontWeight: '700' },
  listContent: { padding: 12, paddingBottom: 30 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  typeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  typeText: { fontSize: 13, fontWeight: '600', color: '#1e3a5f' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
  statusText: { fontSize: 11, fontWeight: '700' },
  message: { fontSize: 13, color: '#444', lineHeight: 20, marginBottom: 10 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  ratingNum: { fontSize: 11, color: '#888', marginLeft: 4 },
  metaText: { fontSize: 11, color: '#aaa' },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 8, paddingVertical: 10 },
  approveBtn: { backgroundColor: '#2e7d32' },
  rejectBtn: { backgroundColor: '#e53e3e' },
  actionBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  emptyBox: { alignItems: 'center', paddingTop: 50 },
  emptyText: { color: '#aaa', marginTop: 12, fontSize: 15 },
});
