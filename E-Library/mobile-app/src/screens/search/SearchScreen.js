import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity,
  ActivityIndicator, Alert, Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { searchBooks, getSearchHistory, saveSearchHistory, clearSearchHistory, getRecommendationsByIdea } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';


export default function SearchScreen({ navigation }) {
  const { colors, dark } = useTheme();
  const [query, setQuery] = useState('');

  const [authorFilter, setAuthorFilter] = useState('');
  const [genreFilter, setGenreFilter] = useState('');
  const [results, setResults] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [isAiMode, setIsAiMode] = useState(false);
  const [aiIdea, setAiIdea] = useState('');
  const [sortBy, setSortBy] = useState('relevance'); // relevance, recent, popular
  const [searchType, setSearchType] = useState('all'); // all, title, author, genre

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
      style={[styles.resultCard, { backgroundColor: colors.surface, shadowColor: dark ? '#000' : '#4f46e5' }]}
      onPress={() => navigation.navigate('BookDetail', { bookId: item._id, book: item })}
    >
      <View style={styles.resultCover}>
        {item.coverUrl
          ? <Image source={{ uri: item.coverUrl }} style={styles.coverImg} resizeMode="cover" />
          : <View style={[styles.coverPlaceholder, { backgroundColor: colors.primary }]}><Ionicons name="book" size={22} color="#fff" /></View>
        }
      </View>
      <View style={styles.resultInfo}>
        <Text style={[styles.resultTitle, { color: colors.text }]} numberOfLines={2}>{item.title}</Text>
        <Text style={[styles.resultAuthor, { color: colors.textSecondary }]}>{item.author}</Text>
        {item.category && <Text style={[styles.resultGenre, { color: colors.primary }]}>{item.category}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
    </TouchableOpacity>

  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>

      {/* Header */}
      <View style={[styles.header, { backgroundColor: dark ? colors.surface : colors.primary }]}>
        <Text style={styles.headerTitle}>🔍 Search Hub</Text>
      </View>

      {/* Advanced Search Bar */}
      <View style={[styles.advancedSearchBox, { backgroundColor: colors.surface, shadowColor: dark ? '#000' : '#475569' }]}>
        <View style={styles.searchInputRow}>
          <Ionicons name="search" size={18} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search by title, author, or keyword..."
            placeholderTextColor={colors.textSecondary}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => handleSearch(query)}
          />
          <TouchableOpacity onPress={() => setShowAdvancedFilters(!showAdvancedFilters)}>
            <Ionicons name="tune" size={20} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleSearch(query)} style={[styles.searchBtn, { backgroundColor: colors.primary }]}>
            <Ionicons name="arrow-forward" size={16} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Advanced Filters Panel */}
        {showAdvancedFilters && (
          <View style={[styles.filterPanel, { borderTopColor: colors.border }]}>
            <Text style={[styles.filterLabel, { color: colors.text }]}>Search Type:</Text>
            <View style={styles.searchTypeButtons}>
              {['all', 'title', 'author', 'genre'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.filterTypeBtn,
                    searchType === type && { backgroundColor: colors.primary },
                    searchType !== type && { backgroundColor: colors.background, borderColor: colors.border }
                  ]}
                  onPress={() => setSearchType(type)}
                >
                  <Text style={[styles.filterTypeBtnText, { color: searchType === type ? '#fff' : colors.text }]}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.filterLabel, { color: colors.text, marginTop: 12 }]}>Filters:</Text>
            <TextInput
              style={[styles.filterInput, { backgroundColor: dark ? colors.background : '#f8fafc', color: colors.text, borderColor: colors.border }]}
              placeholder="Filter by author..."
              placeholderTextColor={colors.textSecondary}
              value={authorFilter}
              onChangeText={setAuthorFilter}
            />
            <TextInput
              style={[styles.filterInput, { backgroundColor: dark ? colors.background : '#f8fafc', color: colors.text, borderColor: colors.border }]}
              placeholder="Filter by genre..."
              placeholderTextColor={colors.textSecondary}
              value={genreFilter}
              onChangeText={setGenreFilter}
            />

            <Text style={[styles.filterLabel, { color: colors.text, marginTop: 12 }]}>Sort By:</Text>
            <View style={styles.sortButtons}>
              {['relevance', 'recent', 'popular'].map((sort) => (
                <TouchableOpacity
                  key={sort}
                  style={[
                    styles.sortBtn,
                    sortBy === sort && { backgroundColor: colors.primary },
                    sortBy !== sort && { backgroundColor: colors.background, borderColor: colors.border }
                  ]}
                  onPress={() => setSortBy(sort)}
                >
                  <Text style={[styles.sortBtnText, { color: sortBy === sort ? '#fff' : colors.text }]}>
                    {sort.charAt(0).toUpperCase() + sort.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>

      {/* AI Genius Suggestion Box */}
      <View style={[styles.aiBox, { backgroundColor: colors.surface, borderColor: dark ? colors.primary : '#e0e7ff', shadowColor: colors.primary }]}>
        <View style={styles.aiHeader}>
          <Ionicons name="sparkles" size={16} color={colors.primary} />
          <Text style={[styles.aiTitle, { color: colors.primary }]}>✨ AI Genius Suggestion</Text>
        </View>
        <Text style={[styles.aiSubText, { color: colors.textSecondary }]}>Tell me what kind of book you want and AI will find it for you...</Text>
        <View style={styles.aiInputRow}>
          <TextInput
            style={[styles.aiInput, { backgroundColor: dark ? colors.background : '#f8fafc', color: colors.text, borderColor: colors.border }]}
            placeholder="e.g., detectives in London, scary space stories, romantic adventures..."
            placeholderTextColor={colors.textSecondary}
            value={aiIdea}
            onChangeText={setAiIdea}
            onSubmitEditing={handleAiIdeaSearch}
            multiline
            numberOfLines={2}
          />
          <TouchableOpacity style={[styles.aiActionBtn, { backgroundColor: colors.primary }]} onPress={handleAiIdeaSearch}>
            <Ionicons name="sparkles" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>


      {/* Search history - Always visible so user can quickly switch ideas */}
      {history.length > 0 && (
        <View style={styles.historySection}>
          <View style={styles.historyHeader}>
            <Text style={[styles.historyTitle, { color: colors.text }]}>Recent Searches</Text>

            <TouchableOpacity onPress={handleClearHistory}>
              <Text style={[styles.clearText, { color: colors.error }]}>Clear All</Text>
            </TouchableOpacity>
          </View>

          {history.map((h, idx) => {
            const searchTerm = h.term || h.searchQuery || h.query || (typeof h === 'string' ? h : '');
            return (
            <TouchableOpacity
              key={idx}
              style={[styles.historyChip, { backgroundColor: colors.surface, shadowColor: dark ? '#000' : '#475569' }]}
              onPress={() => { setQuery(searchTerm); handleSearch(searchTerm); }}
            >
              <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
              <Text style={[styles.historyChipText, { color: colors.textSecondary }]}>{searchTerm}</Text>
            </TouchableOpacity>

            );
          })}
        </View>
      )}

      {/* Results */}
      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>
      ) : hasSearched ? (

        <FlatList
          data={results}
          keyExtractor={(b) => String(b._id)}
          renderItem={renderResult}
          contentContainerStyle={styles.resultsList}
          ListHeaderComponent={
            <Text style={[styles.resultCount, { color: colors.textSecondary }]}>
              {results.length} {isAiMode ? 'AI suggestions' : `results for "${query}"`}
            </Text>
          }

          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Ionicons name="search-outline" size={50} color={colors.border} />
              <Text style={[styles.emptyTitle, { color: colors.textSecondary }]}>No matching books</Text>
              <Text style={[styles.emptyDesc, { color: colors.textSecondary, opacity: 0.7 }]}>Try different keywords or filters</Text>
            </View>
          }

        />
      ) : (
        <View style={styles.promptBox}>
          <Ionicons name="search-circle-outline" size={64} color={colors.border} />
          <Text style={[styles.promptText, { color: colors.textSecondary }]}>Search for books by title, author, or genre</Text>
        </View>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: { backgroundColor: '#1e3a5f', paddingTop: 50, paddingBottom: 16, paddingHorizontal: 16 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  
  advancedSearchBox: { margin: 12, backgroundColor: '#fff', borderRadius: 14, padding: 12, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  searchInputRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#f8fafc', borderRadius: 12, paddingHorizontal: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  searchInput: { flex: 1, fontSize: 14, color: '#333', paddingVertical: 12 },
  searchBtn: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  
  filterPanel: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#e2e8f0' },
  filterLabel: { fontSize: 12, fontWeight: '700', color: '#1e3a5f', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  searchTypeButtons: { flexDirection: 'row', gap: 8, marginBottom: 8, flexWrap: 'wrap' },
  filterTypeBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, justifyContent: 'center' },
  filterTypeBtnText: { fontSize: 12, fontWeight: '600' },
  filterInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, marginBottom: 8 },
  sortButtons: { flexDirection: 'row', gap: 8, marginTop: 8 },
  sortBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, justifyContent: 'center', flex: 1 },
  sortBtnText: { fontSize: 12, fontWeight: '600', textAlign: 'center' },
  
  historySection: { marginHorizontal: 12, marginBottom: 8 },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  historyTitle: { fontSize: 14, fontWeight: '700', color: '#1e3a5f' },
  clearText: { fontSize: 13, color: '#e53e3e', fontWeight: '600' },
  historyChip: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 6, shadowOpacity: 0.04, shadowRadius: 3, elevation: 1 },
  historyChipText: { fontSize: 13 },
  resultsList: { paddingHorizontal: 12, paddingBottom: 24 },
  resultCount: { fontSize: 13, marginBottom: 12, marginTop: 4 },
  resultCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, padding: 12, marginBottom: 10, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },

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
  promptBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  aiBox: { margin: 12, marginTop: 4, backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#e0e7ff', shadowColor: '#6366f1', shadowOpacity: 0.08, shadowRadius: 10, elevation: 2 },
  aiHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  aiTitle: { fontSize: 14, fontWeight: '800', color: '#4f46e5', textTransform: 'uppercase', letterSpacing: 0.5 },
  aiSubText: { fontSize: 12, color: '#64748b', marginBottom: 12 },
  aiInputRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  aiInput: { flex: 1, backgroundColor: '#f8fafc', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, color: '#1e293b', borderStyle: 'dashed', borderWidth: 1, borderColor: '#cbd5e1' },
  aiActionBtn: { backgroundColor: '#6366f1', width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' }
});
