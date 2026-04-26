import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl, TextInput, Alert, Dimensions, Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getBooks, deleteBook } from '../../services/api';
import { API_BASE_URL } from '../../config/api';

const { width } = Dimensions.get('window');

export default function AdminBooksScreen({ navigation }) {
  const [books, setBooks] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const fetchBooks = useCallback(async () => {
    try {
      const res = await getBooks();
      const data = res.data || [];
      setBooks(data);
      setFiltered(data);
    } catch (err) {
      console.error('Fetch Books Error:', err);
    }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { fetchBooks(); }, [fetchBooks]);

  const handleSearch = (text) => {
    setSearch(text);
    if (!text.trim()) { setFiltered(books); return; }
    const q = text.toLowerCase();
    setFiltered(books.filter((b) => 
      b.title?.toLowerCase().includes(q) || 
      b.author?.toLowerCase().includes(q) ||
      b.category?.toLowerCase().includes(q)
    ));
  };

  const handleDeleteBook = (book) => {
    Alert.alert(
      'Delete Book',
      `Are you sure you want to remove "${book.title}" from the library?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteBook(book._id);
              Alert.alert('Success', 'Book removed successfully');
              fetchBooks();
            } catch (err) {
              Alert.alert('Error', 'Failed to delete book');
            }
          } 
        }
      ]
    );
  };

  const renderBook = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <View style={styles.coverContainer}>
          {item.coverUrl ? (
            <Image 
              source={{ uri: item.coverUrl.startsWith('http') ? item.coverUrl : `${API_BASE_URL.replace(/\/api$/, '')}${item.coverUrl.startsWith('/') ? '' : '/'}${item.coverUrl}` }} 
              style={styles.cover} 
            />
          ) : (
            <View style={styles.noCover}>
              <Ionicons name="book" size={24} color="#94a3b8" />
            </View>
          )}
        </View>
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.author} numberOfLines={1}>by {item.author}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.category || 'General'}</Text>
          </View>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.actionIconBtn} 
            onPress={() => navigation.navigate('EditBook', { book: item })}
          >
            <Ionicons name="create-outline" size={22} color="#3b82f6" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionIconBtn} 
            onPress={() => handleDeleteBook(item)}
          >
            <Ionicons name="trash-outline" size={22} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#1e3a5f" />
      <Text style={styles.loadingText}>Syncing library...</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1e3a5f', '#12263f']} style={styles.headerGradient}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Library Catalog</Text>
            <Text style={styles.headerSub}>{books.length} books available</Text>
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('AddBook')}>
            <Ionicons name="add-circle" size={44} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#94a3b8" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search catalog..."
            placeholderTextColor="#94a3b8"
            value={search}
            onChangeText={handleSearch}
          />
        </View>
      </LinearGradient>

      <FlatList
        data={filtered}
        keyExtractor={(b) => String(b._id)}
        renderItem={renderBook}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={() => { setRefreshing(true); fetchBooks(); }} 
            tintColor="#1e3a5f"
          />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Ionicons name="library-outline" size={80} color="#cbd5e1" />
            <Text style={styles.emptyTitle}>Empty Catalog</Text>
            <Text style={styles.emptySub}>No books found matching your search</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' },
  loadingText: { marginTop: 12, color: '#64748b', fontSize: 15, fontWeight: '500' },
  headerGradient: { paddingTop: 60, paddingBottom: 24, paddingHorizontal: 20, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
  headerSub: { fontSize: 13, color: '#94a3b8', fontWeight: '500' },
  addBtn: { shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10, elevation: 5 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 14, paddingHorizontal: 12, height: 48 },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, color: '#fff', fontSize: 15, fontWeight: '500' },
  listContent: { padding: 16, paddingBottom: 40 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 12, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 10, elevation: 2 },
  cardContent: { flexDirection: 'row', alignItems: 'center' },
  coverContainer: { width: 50, height: 70, borderRadius: 8, backgroundColor: '#f1f5f9', overflow: 'hidden', marginRight: 12 },
  cover: { width: '100%', height: '100%' },
  noCover: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  info: { flex: 1, marginRight: 8 },
  title: { fontSize: 15, fontWeight: '800', color: '#1e293b' },
  author: { fontSize: 12, color: '#64748b', marginTop: 1, fontWeight: '500' },
  badge: { backgroundColor: '#f1f5f9', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginTop: 6 },
  badgeText: { fontSize: 10, fontWeight: '700', color: '#64748b', textTransform: 'uppercase' },
  actions: { flexDirection: 'row', gap: 4 },
  actionIconBtn: { padding: 8, borderRadius: 10, backgroundColor: '#f8fafc' },
  emptyBox: { alignItems: 'center', justifyContent: 'center', marginTop: 100 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: '#1e293b', marginTop: 16 },
  emptySub: { fontSize: 14, color: '#64748b', marginTop: 6, fontWeight: '500', textAlign: 'center', paddingHorizontal: 40 },
});
