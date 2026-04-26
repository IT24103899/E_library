import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity,
  ActivityIndicator, Alert, Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { searchBooks, getSearchHistory, saveSearchHistory, clearSearchHistory, getRecommendationsByIdea } from '../../services/api';

export default function SearchScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [authorFilter, setAuthorFilter] = useState('');
  const [genreFilter, setGenreFilter] = useState('');
  const [results, setResults] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [isAiMode, setIsAiMode] = useState(false);
  const [aiIdea, setAiIdea] = useState('');

  const loadHistory = useCallback(async () => {
    try {
      const res = await getSearchHistory();
      setHistory(res.data || []);
    } catch (_) {}
  }, []);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  const handleSearch = async (q = query) => {
    if (!q.trim()) return;
    setLoading(true);
    setHasSearched(true);
    setIsAiMode(false);
    try {
      const params = {};
      if (authorFilter.trim()) params.author = authorFilter.trim();
      if (genreFilter.trim()) params.category = genreFilter.trim();
      const res = await searchBooks(q.trim(), params);
      setResults(res.data || []);
      await saveSearchHistory(q.trim());
      await loadHistory();
    } catch (_) {
      Alert.alert('Search Error', 'Could not complete search. Please try again.');
    }
    setLoading(false);
  };

  const handleAiIdeaSearch = async () => {
    if (!aiIdea.trim()) return;
    setLoading(true);
    setHasSearched(true);
    setIsAiMode(true);
    try {
      const res = await getRecommendationsByIdea(aiIdea.trim());
      if (res.data && res.data.recommendations) {
        setResults(res.data.recommendations);
        // Save the AI idea to search history so the user can find it later
        await saveSearchHistory(aiIdea.trim());
        setAiIdea(''); // Clear the input bar as requested
        await loadHistory();
      } else {
        setResults([]);
      }
    } catch (_) {
      Alert.alert('AI Error', 'Could not get AI suggestions. Make sure the AI service is running.');
    }
    setLoading(false);
  };

  const handleClearHistory = () => {
    Alert.alert('Clear History', 'Remove all search history?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear', style: 'destructive', onPress: async () => {
          try { 
            await clearSearchHistory(); 
            setHistory([]); 
            setResults([]); // Clear results too
            setHasSearched(false); // Reset search state
            setQuery(''); // Clear the search bar
          } catch (err) {
            console.error('Clear History Error:', err);
            Alert.alert('Error', 'Could not clear history from database.');
          }
        }
      }
    ]);
  };

  const renderResult = ({ item }) => (
    <TouchableOpacity
      style={styles.resultCard}
      onPress={() => navigation.navigate('BookDetail', { bookId: item._id, book: item })}
    >
      <View style={styles.resultCover}>
        {item.coverUrl
          ? <Image source={{ uri: item.coverUrl }} style={styles.coverImg} resizeMode="cover" />
          : <View style={styles.coverPlaceholder}><Ionicons name="book" size={22} color="#fff" /></View>
        }
      </View>
      <View style={styles.resultInfo}>
        <Text style={styles.resultTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.resultAuthor}>{item.author}</Text>
        {item.category && <Text style={styles.resultGenre}>{item.category}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={18} color="#ccc" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🔍 Search Hub</Text>
      </View>

      {/* Search bar */}
      <View style={styles.searchBox}>
        <View style={styles.searchRow}>
          <Ionicons name="search-outline" size={18} color="#888" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search books, authors…"
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => handleSearch()}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => { setQuery(''); setResults([]); setHasSearched(false); }}>
              <Ionicons name="close-circle" size={18} color="#aaa" />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => navigation.navigate('QRScanner')} style={{ marginLeft: 6 }}>
            <Ionicons name="qr-code-outline" size={20} color="#1e3a5f" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowFilters((v) => !v)} style={{ marginLeft: 6 }}>
            <Ionicons name="options-outline" size={20} color="#1e3a5f" />
          </TouchableOpacity>
        </View>

        {/* Advanced filters */}
        {showFilters && (
          <View style={styles.filtersPanel}>
            <TextInput style={styles.filterInput} placeholder="Filter by author…" value={authorFilter} onChangeText={setAuthorFilter} />
            <TextInput style={styles.filterInput} placeholder="Filter by genre…" value={genreFilter} onChangeText={setGenreFilter} />
          </View>
        )}

      </View>

      {/* AI Idea Box */}
      <View style={styles.aiBox}>
        <View style={styles.aiHeader}>
          <Ionicons name="sparkles" size={16} color="#6366f1" />
          <Text style={styles.aiTitle}>AI Genius Suggestion</Text>
        </View>
        <Text style={styles.aiSubText}>Tell me what kind of book you want...</Text>
        <View style={styles.aiInputRow}>
          <TextInput
            style={styles.aiInput}
            placeholder="e.g., detectives in London, scary space stories..."
            value={aiIdea}
            onChangeText={setAiIdea}
            onSubmitEditing={handleAiIdeaSearch}
          />
          <TouchableOpacity style={styles.aiActionBtn} onPress={handleAiIdeaSearch}>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search history - Always visible so user can quickly switch ideas */}
      {history.length > 0 && (
        <View style={styles.historySection}>
          <View style={styles.historyHeader}>
            <Text style={styles.historyTitle}>Recent Searches</Text>
            <TouchableOpacity onPress={handleClearHistory}>
              <Text style={styles.clearText}>Clear All</Text>
            </TouchableOpacity>
          </View>
          {history.map((h, idx) => {
            const searchTerm = h.term || h.searchQuery || h.query || (typeof h === 'string' ? h : '');
            return (
            <TouchableOpacity
              key={idx}
              style={styles.historyChip}
              onPress={() => { setQuery(searchTerm); handleSearch(searchTerm); }}
            >
              <Ionicons name="time-outline" size={14} color="#888" />
              <Text style={styles.historyChipText}>{searchTerm}</Text>
            </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Results */}
      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color="#1e3a5f" /></View>
      ) : hasSearched ? (
        <FlatList
          data={results}
          keyExtractor={(b) => String(b._id)}
          renderItem={renderResult}
          contentContainerStyle={styles.resultsList}
          ListHeaderComponent={
            <Text style={styles.resultCount}>
              {results.length} {isAiMode ? 'AI suggestions' : `results for "${query}"`}
            </Text>
          }
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Ionicons name="search-outline" size={50} color="#ccc" />
              <Text style={styles.emptyTitle}>No matching books</Text>
              <Text style={styles.emptyDesc}>Try different keywords or filters</Text>
            </View>
          }
        />
      ) : (
        <View style={styles.promptBox}>
          <Ionicons name="search-circle-outline" size={64} color="#ddd" />
          <Text style={styles.promptText}>Search for books by title, author, or genre</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fb' },
  header: { backgroundColor: '#1e3a5f', paddingTop: 50, paddingBottom: 16, paddingHorizontal: 16 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  searchBox: { margin: 12, backgroundColor: '#fff', borderRadius: 14, padding: 14, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  searchInput: { flex: 1, fontSize: 14, color: '#333', paddingVertical: 4 },
  filtersPanel: { marginTop: 12, gap: 8 },
  filterInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 9, fontSize: 13, backgroundColor: '#fafafa' },
  historySection: { marginHorizontal: 12, marginBottom: 8 },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  historyTitle: { fontSize: 14, fontWeight: '700', color: '#1e3a5f' },
  clearText: { fontSize: 13, color: '#e53e3e', fontWeight: '600' },
  historyChip: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 6, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 3, elevation: 1 },
  historyChipText: { fontSize: 13, color: '#555' },
  resultsList: { paddingHorizontal: 12, paddingBottom: 24 },
  resultCount: { fontSize: 13, color: '#888', marginBottom: 12, marginTop: 4 },
  resultCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  resultCover: { width: 50, height: 70, borderRadius: 6, overflow: 'hidden', marginRight: 12 },
  coverImg: { width: 50, height: 70 },
  coverPlaceholder: { width: 50, height: 70, backgroundColor: '#1e3a5f', justifyContent: 'center', alignItems: 'center' },
  resultInfo: { flex: 1 },
  resultTitle: { fontSize: 14, fontWeight: '700', color: '#1a1a1a' },
  resultAuthor: { fontSize: 12, color: '#666', marginTop: 3 },
  resultGenre: { fontSize: 11, color: '#1e3a5f', marginTop: 4, fontWeight: '600' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyBox: { alignItems: 'center', paddingTop: 40 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: '#aaa', marginTop: 12 },
  emptyDesc: { fontSize: 13, color: '#bbb', marginTop: 4 },
  promptText: { fontSize: 14, color: '#aaa', marginTop: 14, textAlign: 'center', paddingHorizontal: 40 },
  aiBox: { margin: 12, marginTop: 4, backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#e0e7ff', shadowColor: '#6366f1', shadowOpacity: 0.08, shadowRadius: 10, elevation: 2 },
  aiHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  aiTitle: { fontSize: 14, fontWeight: '800', color: '#4f46e5', textTransform: 'uppercase', letterSpacing: 0.5 },
  aiSubText: { fontSize: 12, color: '#64748b', marginBottom: 12 },
  aiInputRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  aiInput: { flex: 1, backgroundColor: '#f8fafc', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, color: '#1e293b', borderStyle: 'dashed', borderWidth: 1, borderColor: '#cbd5e1' },
  aiActionBtn: { backgroundColor: '#6366f1', width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' }
});
