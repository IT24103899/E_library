import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity,
  ActivityIndicator, RefreshControl, Image, ScrollView, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getBooks, addToBookshelf, getBookshelf } from '../../services/api';

const GENRES = [
  { name: 'All', color: '#FF416C' },
  { name: 'Technology', color: '#4A00E0' },
  { name: 'Fiction', color: '#00B4DB' },
  { name: 'Science', color: '#56ab2f' },
  { name: 'History', color: '#F2994A' },
  { name: 'Self-Help', color: '#9B59B6' },
  { name: 'Business', color: '#E67E22' }
];

export default function BooksScreen({ navigation }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('All');

  const fetchBooks = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch both catalog components
      const [booksRes, bookshelfRes] = await Promise.all([
        getBooks(),
        getBookshelf()
      ]);
      
      const allBooks = booksRes.data || [];
      const shelfData = bookshelfRes.data || {};
      
      // Combine all bookshelf IDs into a set for fast lookup
      const bookshelfIds = new Set([
        ...(shelfData.reading || []).map(i => i.bookId?._id || i.bookId),
        ...(shelfData.favourites || []).map(i => i.bookId?._id || i.bookId),
        ...(shelfData.wishlist || []).map(i => i.bookId?._id || i.bookId),
      ]);

      // Show all books from the database
      setBooks(allBooks);
    } catch (_) {}
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { fetchBooks(); }, [fetchBooks]);

  const handleBorrow = async (bookId, title) => {
    try {
      await addToBookshelf(bookId, 'reading');
      Alert.alert('📖 Borrowed!', `"${title}" has been added to your shelf.`);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to borrow';
      Alert.alert('Notice', msg);
    }
  };

  const filtered = books.filter((b) => {
    const matchSearch = !search || b.title?.toLowerCase().includes(search.toLowerCase());
    const matchGenre = genre === 'All' || b.category === genre;
    return matchSearch && matchGenre;
  });

  const activeGenreColor = GENRES.find(g => g.name === genre)?.color || '#333';

  const renderBook = ({ item, index }) => (
    <TouchableOpacity
      style={styles.bookCardGrid}
      onPress={() => navigation.navigate('BookDetail', { bookId: item._id, book: item })}
      activeOpacity={0.9}
    >
      <View style={styles.cardContainer}>
        {/* Cover Image */}
        <View style={styles.imageWrapper}>
          {item.coverUrl ? (
            <Image 
              source={{ uri: item.coverUrl }} 
              style={styles.coverImgGrid}
              resizeMode="cover"
            />
          ) : (
            <LinearGradient colors={['#6366f1', '#a855f7']} style={styles.coverImgGrid}>
              <Ionicons name="book" size={40} color="#fff" />
            </LinearGradient>
          )}
          
          {/* Floating Genre Tag */}
          {item.category && (
            <View style={styles.floatingTag}>
              <Text style={styles.floatingTagText}>{item.category}</Text>
            </View>
          )}

          {/* Action Overlay */}
          <LinearGradient 
            colors={['transparent', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.4)']} 
            style={styles.cardOverlay}
          />
        </View>

        {/* Content Section */}
        <View style={styles.cardInfoSection}>
          <Text style={styles.bookTitleGrid} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.bookAuthorGrid} numberOfLines={1}>{item.author}</Text>
          
          <View style={styles.actionButtonRow}>
            <TouchableOpacity
              style={styles.readBtn}
              onPress={() => navigation.navigate('Reader', { 
                bookId: item._id, 
                bookTitle: item.title, 
                pdfUrl: item.pdfUrl,
                totalPages: item.totalPages || 0
              })}
            >
               <Ionicons name="book-outline" size={14} color="#fff" />
               <Text style={styles.miniActionText}>Read</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
               style={[styles.miniActionBtn, { backgroundColor: '#4f46e5' }]} 
               onPress={() => handleBorrow(item._id, item.title)}
            >
               <Ionicons name="add-circle-outline" size={14} color="#fff" />
               <Text style={styles.miniActionText}>Borrow</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.premiumHeader}>
        <Text style={styles.headerTitle}>Gallery</Text>
        <Text style={styles.headerSub}>Explore our curated collection</Text>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#6366f1" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search books..."
            placeholderTextColor="#94a3b8"
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <View style={styles.genreWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.genreScroll}>
          {GENRES.map(g => (
            <TouchableOpacity
              key={g.name}
              style={[styles.genreChip, genre === g.name && { backgroundColor: '#6366f1', borderColor: '#6366f1' }]}
              onPress={() => setGenre(g.name)}
            >
              <Text style={[styles.genreChipText, genre === g.name && { color: '#fff' }]}>{g.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color="#6366f1" /></View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(b) => String(b._id)}
          renderItem={renderBook}
          numColumns={2}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchBooks(); }} />}
          contentContainerStyle={styles.gridContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="planet" size={80} color="#e2e8f0" />
              <Text style={styles.emptyTitle}>No books found</Text>
              <Text style={styles.emptySub}>Try adjusting your search or genre.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  premiumHeader: { paddingTop: 60, paddingHorizontal: 25, paddingBottom: 20, backgroundColor: '#fff' },
  headerTitle: { fontSize: 32, fontWeight: '900', color: '#1e293b' },
  headerSub: { fontSize: 16, color: '#64748b', marginTop: 4 },
  searchBar: { flexDirection: 'row', backgroundColor: '#f1f5f9', marginTop: 20, padding: 12, borderRadius: 16, alignItems: 'center' },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 15, color: '#1e293b', fontWeight: '500' },
  genreWrapper: { paddingVertical: 15, backgroundColor: '#fff' },
  genreScroll: { paddingHorizontal: 25 },
  genreChip: { backgroundColor: '#f1f5f9', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 12, marginRight: 10, borderWidth: 1, borderColor: '#e2e8f0' },
  genreChipText: { fontSize: 13, fontWeight: '700', color: '#64748b' },
  gridContent: { paddingHorizontal: 12, paddingBottom: 120 },
  bookCardGrid: { flex: 1, margin: 8, borderRadius: 20, backgroundColor: '#fff', elevation: 8, shadowColor: '#1e293b', shadowOpacity: 0.15, shadowRadius: 10, shadowOffset: { height: 4, width: 0 } },
  cardContainer: { borderRadius: 20, overflow: 'hidden' },
  imageWrapper: { height: 200, width: '100%', position: 'relative' },
  coverImgGrid: { width: '100%', height: '100%' },
  cardOverlay: { ...StyleSheet.absoluteFillObject },
  floatingTag: { position: 'absolute', top: 10, left: 10, backgroundColor: 'rgba(255,255,255,0.9)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, zIndex: 5 },
  floatingTagText: { fontSize: 9, fontWeight: '800', color: '#4f46e5', textTransform: 'uppercase' },
  cardInfoSection: { padding: 12 },
  bookTitleGrid: { color: '#1e293b', fontSize: 14, fontWeight: '800', marginBottom: 2 },
  bookAuthorGrid: { color: '#64748b', fontSize: 11, fontWeight: '500', marginBottom: 12 },
  actionButtonRow: { flexDirection: 'row', gap: 6 },
  miniActionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 8, borderRadius: 10 },
  miniActionText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyState: { alignItems: 'center', marginTop: 100 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: '#475569', marginTop: 20 },
  emptySub: { fontSize: 14, color: '#94a3b8', marginTop: 8, textAlign: 'center', paddingHorizontal: 40 }
});
