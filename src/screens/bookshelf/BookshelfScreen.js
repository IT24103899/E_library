import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, FlatList, TouchableOpacity,
  ActivityIndicator, Image, RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getBookshelf } from '../../services/api';

const SHELVES = [
  { id: 'reading', label: 'Reading Now', color: '#12c2e9', icon: 'book' },
  { id: 'favourites', label: 'Favourites', color: '#f64f59', icon: 'heart' },
  { id: 'wishlist', label: 'Wishlist', color: '#c471ed', icon: 'star' }
];

export default function BookshelfScreen({ navigation }) {
  const [bookshelf, setBookshelf] = useState({});
  const [activeTab, setActiveTab] = useState('reading');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await getBookshelf();
      setBookshelf(res.data || {});
    } catch (_) {}
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const books = bookshelf[activeTab] || [];
  const activeColor = SHELVES.find(s => s.id === activeTab)?.color || '#333';

  return (
    <View style={styles.container}>
        <View style={[styles.header, { backgroundColor: activeColor }]}>
            <Text style={styles.headerTitle}>My Library 📖</Text>
            <Text style={styles.headerSub}>Enjoy your personalized collection.</Text>
        </View>

        <View style={styles.tabContainer}>
            {SHELVES.map(shelf => (
                <TouchableOpacity
                    key={shelf.id}
                    style={[styles.tab, activeTab === shelf.id && { backgroundColor: shelf.color, borderColor: shelf.color }]}
                    onPress={() => setActiveTab(shelf.id)}
                >
                    <Ionicons name={shelf.icon} size={18} color={activeTab === shelf.id ? '#fff' : shelf.color} />
                    <Text style={[styles.tabText, activeTab === shelf.id && { color: '#fff' }]}>{shelf.label}</Text>
                </TouchableOpacity>
            ))}
        </View>

        {loading ? (
            <View style={styles.center}><ActivityIndicator size="large" color={activeColor} /></View>
        ) : (
            <FlatList 
                data={books}
                keyExtractor={(b, i) => String(b._id || i)}
                contentContainerStyle={styles.list}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} />}
                renderItem={({item}) => (
                    <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={() => navigation.navigate('BookDetail', { bookId: item.bookId?._id || item.bookId, book: item.bookId || {} })}>
                        {item.bookId?.coverUrl ? (
                            <Image source={{ uri: item.bookId.coverUrl }} style={styles.cover} />
                        ) : (
                            <View style={styles.coverPlaceholder}><Ionicons name="book" size={24} color="#fff" /></View>
                        )}
                        <View style={styles.info}>
                            <Text style={styles.title} numberOfLines={2}>{item.bookId?.title || 'Unknown Book'}</Text>
                            <Text style={styles.author}>{item.bookId?.author || 'Unknown'}</Text>
                            <View style={[styles.statusTag, { backgroundColor: activeColor + '20' }]}>
                                <Text style={[styles.statusText, { color: activeColor }]}>{item.status}</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Ionicons name="folder-open" size={70} color="#ddd" />
                        <Text style={styles.emptyTitle}>This shelf is totally empty!</Text>
                        <TouchableOpacity style={[styles.exploreBtn, { backgroundColor: activeColor }]} onPress={() => navigation.navigate('Books')}>
                            <Text style={styles.exploreText}>Find Great Books</Text>
                        </TouchableOpacity>
                    </View>
                }
            />
        )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { paddingTop: 60, paddingBottom: 50, paddingHorizontal: 25, borderBottomRightRadius: 40, borderBottomLeftRadius: 40 },
  headerTitle: { fontSize: 32, fontWeight: '900', color: '#fff', letterSpacing: -0.5 },
  headerSub: { fontSize: 15, color: '#fff', opacity: 0.8, marginTop: 5, fontWeight: '600' },
  tabContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: -25, gap: 10, paddingHorizontal: 15 },
  tab: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingVertical: 12, paddingHorizontal: 18, borderRadius: 25, borderWidth: 2, borderColor: '#eee', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  tabText: { marginLeft: 6, fontSize: 13, fontWeight: '800', color: '#555' },
  list: { padding: 20, paddingBottom: 50, paddingTop: 30 },
  card: { flexDirection: 'row', backgroundColor: '#fff', padding: 15, borderRadius: 25, marginBottom: 15, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 15, elevation: 5 },
  cover: { width: 75, height: 110, borderRadius: 15 },
  coverPlaceholder: { width: 75, height: 110, borderRadius: 15, backgroundColor: '#bbb', justifyContent: 'center', alignItems: 'center' },
  info: { flex: 1, marginLeft: 15, justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '800', color: '#222', marginBottom: 5 },
  author: { fontSize: 14, color: '#888', fontWeight: '600', marginBottom: 10 },
  statusTag: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, alignSelf: 'flex-start' },
  statusText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { alignItems: 'center', marginTop: 50 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: '#777', marginTop: 20 },
  exploreBtn: { paddingHorizontal: 25, paddingVertical: 12, borderRadius: 20, marginTop: 20, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, elevation: 5 },
  exploreText: { color: '#fff', fontWeight: '800', fontSize: 15 }
});
