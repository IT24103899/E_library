import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity,
  ActivityIndicator, Alert, Image, Dimensions, Animated
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { searchBooks, getSearchHistory, saveSearchHistory, clearSearchHistory, getRecommendationsByIdea } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';

const { width } = Dimensions.get('window');

export default function SearchScreen({ navigation }) {
  const { colors, dark } = useTheme();
  
  // Search States
  const [query, setQuery] = useState('');
  const [authorFilter, setAuthorFilter] = useState('');
  const [genreFilter, setGenreFilter] = useState('');
  const [results, setResults] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
  // UI States
  const [activeTab, setActiveTab] = useState('ai'); // 'ai' or 'advanced'
  const [showFilters, setShowFilters] = useState(false);
  const [aiIdea, setAiIdea] = useState('');
  const [searchType, setSearchType] = useState('all');
  const [sortBy, setSortBy] = useState('relevance');

  const loadHistory = useCallback(async () => {
    try {
      const res = await getSearchHistory();
      if (res.data) setHistory(res.data);
    } catch (_) {}
  }, []);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  const handleManualSearch = async (q = query) => {
    const term = q.trim();
    if (!term) return;
    setLoading(true);
    setHasSearched(true);
    try {
      const params = { type: searchType, sort: sortBy };
      if (authorFilter.trim()) params.author = authorFilter.trim();
      if (genreFilter.trim()) params.category = genreFilter.trim();
      
      const res = await searchBooks(term, params);
      setResults(Array.isArray(res.data) ? res.data : []);
      await saveSearchHistory(term);
      await loadHistory();
    } catch (_) {
      Alert.alert('Connection Issue', 'Could not reach the library server. Check your internet.');
    } finally {
      setLoading(false);
    }
  };

  const handleAiSearch = async () => {
    const idea = aiIdea.trim();
    if (!idea) return;
    setLoading(true);
    setHasSearched(true);
    try {
      const res = await getRecommendationsByIdea(idea);
      const suggestions = Array.isArray(res.data) ? res.data : (res.data.recommendations || []);
      setResults(suggestions);
      
      if (suggestions.length > 0) {
        await saveSearchHistory(idea);
        setAiIdea(''); 
        await loadHistory();
      }
    } catch (_) {
      Alert.alert('AI Offline', 'The AI engine is taking a break. Please try manual search or try again in a moment.');
    } finally {
      setLoading(false);
    }
  };

  const renderResult = ({ item }) => (
    <TouchableOpacity
      style={[styles.resultCard, { backgroundColor: colors.surface, shadowColor: dark ? '#000' : '#4f46e5' }]}
      onPress={() => navigation.navigate('BookDetail', { bookId: item._id, book: item })}
    >
      <View style={styles.resultCover}>
        {item.coverUrl
          ? <Image source={{ uri: item.coverUrl }} style={styles.coverImg} resizeMode="cover" />
          : <View style={[styles.coverPlaceholder, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="book" size={24} color={colors.primary} />
            </View>
        }
      </View>
      <View style={styles.resultInfo}>
        <Text style={[styles.resultTitle, { color: colors.text }]} numberOfLines={2}>{item.title || 'Untitled'}</Text>
        <Text style={[styles.resultAuthor, { color: colors.textSecondary }]}>{item.author || 'Unknown Author'}</Text>
        <View style={styles.tagRow}>
          {item.category ? (
            <View style={[styles.categoryTag, { backgroundColor: colors.primary + '15' }]}>
              <Text style={[styles.categoryText, { color: colors.primary }]}>{item.category}</Text>
            </View>
          ) : null}
          {item.rating ? (
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={12} color="#f59e0b" />
              <Text style={[styles.ratingText, { color: colors.textSecondary }]}>{item.rating}</Text>
            </View>
          ) : null}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.border} />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* ELITE HEADER */}
      <View style={[styles.header, { backgroundColor: dark ? colors.surface : colors.primary }]}>
        <Text style={styles.headerTitle}>Search Hub</Text>
        <TouchableOpacity style={styles.qrBtn} onPress={() => navigation.navigate('QRScanner')}>
          <Ionicons name="qr-code-outline" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* MODE SWITCHER */}
      <View style={[styles.tabBar, { backgroundColor: colors.surface }]}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'ai' && { borderBottomColor: colors.primary }]} 
          onPress={() => setActiveTab('ai')}
        >
          <Ionicons name="sparkles" size={16} color={activeTab === 'ai' ? colors.primary : colors.textSecondary} />
          <Text style={[styles.tabText, { color: activeTab === 'ai' ? colors.primary : colors.textSecondary }]}>Smart AI</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'advanced' && { borderBottomColor: colors.primary }]} 
          onPress={() => setActiveTab('advanced')}
        >
          <Ionicons name="options" size={16} color={activeTab === 'advanced' ? colors.primary : colors.textSecondary} />
          <Text style={[styles.tabText, { color: activeTab === 'advanced' ? colors.primary : colors.textSecondary }]}>Advanced</Text>
        </TouchableOpacity>
      </View>

      <ScrollView stickyHeaderIndices={[1]} showsVerticalScrollIndicator={false}>
        {/* INPUT SECTION */}
        <View style={styles.inputSection}>
          {activeTab === 'ai' ? (
            <View style={[styles.aiBox, { backgroundColor: colors.surface, borderColor: dark ? colors.primary + '40' : '#e0e7ff' }]}>
              <Text style={[styles.aiHint, { color: colors.textSecondary }]}>Describe your ideal book...</Text>
              <TextInput
                style={[styles.aiInput, { color: colors.text, backgroundColor: dark ? colors.background : '#f8fafc' }]}
                placeholder="e.g. A fast-paced mystery set in Tokyo with a female detective"
                placeholderTextColor={colors.textSecondary + '80'}
                value={aiIdea}
                onChangeText={setAiIdea}
                multiline
                numberOfLines={3}
              />
              <TouchableOpacity style={[styles.aiButton, { backgroundColor: colors.primary }]} onPress={handleAiSearch}>
                <Ionicons name="sparkles" size={18} color="#fff" />
                <Text style={styles.aiButtonText}>Find Magic</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={[styles.advancedBox, { backgroundColor: colors.surface }]}>
              <View style={[styles.searchRow, { backgroundColor: dark ? colors.background : '#f1f5f9' }]}>
                <Ionicons name="search" size={20} color={colors.textSecondary} />
                <TextInput
                  style={[styles.manualInput, { color: colors.text }]}
                  placeholder="Title, Author, or ISBN..."
                  placeholderTextColor={colors.textSecondary}
                  value={query}
                  onChangeText={setQuery}
                  onSubmitEditing={() => handleManualSearch()}
                />
                <TouchableOpacity onPress={() => setShowFilters(!showFilters)}>
                  <Ionicons name={showFilters ? "chevron-up-circle" : "add-circle-outline"} size={24} color={colors.primary} />
                </TouchableOpacity>
              </View>

              {showFilters && (
                <View style={styles.filterPanel}>
                  <View style={styles.filterGroup}>
                    <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>Author</Text>
                    <TextInput 
                      style={[styles.filterInput, { color: colors.text, borderColor: colors.border }]} 
                      placeholder="Any author" 
                      value={authorFilter}
                      onChangeText={setAuthorFilter}
                    />
                  </View>
                  <View style={styles.filterGroup}>
                    <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>Genre</Text>
                    <TextInput 
                      style={[styles.filterInput, { color: colors.text, borderColor: colors.border }]} 
                      placeholder="e.g. Fiction" 
                      value={genreFilter}
                      onChangeText={setGenreFilter}
                    />
                  </View>
                  <TouchableOpacity style={[styles.applyBtn, { backgroundColor: colors.primary }]} onPress={() => handleManualSearch()}>
                    <Text style={styles.applyBtnText}>Apply Advanced Search</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </View>

        {/* RESULTS SECTION */}
        <View style={styles.resultsContainer}>
          {loading ? (
            <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>
          ) : hasSearched ? (
            <View>
              <View style={styles.resultsHeader}>
                <Text style={[styles.resultsCount, { color: colors.textSecondary }]}>
                  {results.length} suggestions found
                </Text>
              </View>
              {results.length > 0 ? (
                results.map(item => <View key={item._id}>{renderResult({ item })}</View>)
              ) : (
                <View style={styles.emptyContainer}>
                  <MaterialCommunityIcons name="book-search" size={64} color={colors.border} />
                  <Text style={[styles.emptyTitle, { color: colors.text }]}>No Matches Found</Text>
                  <Text style={[styles.emptySub, { color: colors.textSecondary }]}>Try adjusting your keywords or switching to Smart AI mode.</Text>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.historySection}>
              {history.length > 0 && (
                <View>
                  <View style={styles.historyHeader}>
                    <Text style={[styles.historyTitle, { color: colors.text }]}>Recent Activity</Text>
                    <TouchableOpacity onPress={clearSearchHistory}>
                      <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '700' }}>Clear All</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.historyGrid}>
                    {history.slice(0, 6).map((h, i) => (
                      <TouchableOpacity 
                        key={i} 
                        style={[styles.historyChip, { backgroundColor: colors.surface, borderColor: colors.border }]}
                        onPress={() => {
                          const term = h.term || h.searchQuery || h;
                          setQuery(term);
                          handleManualSearch(term);
                        }}
                      >
                        <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
                        <Text style={[styles.chipText, { color: colors.textSecondary }]} numberOfLines={1}>{h.term || h.searchQuery || h}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

import { ScrollView } from 'react-native-gesture-handler';

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, paddingTop: 60, paddingBottom: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 24, fontWeight: '900', color: '#fff', letterSpacing: -0.5 },
  qrBtn: { padding: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12 },
  tabBar: { flexDirection: 'row', height: 50, elevation: 4, shadowOpacity: 0.1 },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderBottomWidth: 3, borderBottomColor: 'transparent' },
  tabText: { fontSize: 13, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  inputSection: { padding: 20 },
  aiBox: { padding: 20, borderRadius: 24, borderWidth: 1, shadowColor: '#4f46e5', shadowOpacity: 0.1, shadowRadius: 20, elevation: 5 },
  aiHint: { fontSize: 14, fontWeight: '700', marginBottom: 12 },
  aiInput: { borderRadius: 16, padding: 15, fontSize: 15, height: 100, textAlignVertical: 'top', marginBottom: 15 },
  aiButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 16, gap: 10 },
  aiButtonText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  advancedBox: { padding: 5 },
  searchRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 5, borderRadius: 18, gap: 12 },
  manualInput: { flex: 1, fontSize: 15, height: 50, fontWeight: '600' },
  filterPanel: { marginTop: 15, gap: 15 },
  filterGroup: { gap: 6 },
  filterLabel: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', marginLeft: 4 },
  filterInput: { borderWidth: 1, borderRadius: 12, padding: 12, fontSize: 14 },
  applyBtn: { padding: 16, borderRadius: 16, alignItems: 'center' },
  applyBtnText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  resultsContainer: { paddingHorizontal: 20 },
  resultsHeader: { marginBottom: 15 },
  resultsCount: { fontSize: 13, fontWeight: '700' },
  resultCard: { flexDirection: 'row', padding: 12, borderRadius: 20, marginBottom: 12, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  resultCover: { width: 65, height: 90, borderRadius: 12, overflow: 'hidden', marginRight: 15 },
  coverImg: { width: '100%', height: '100%' },
  coverPlaceholder: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  resultInfo: { flex: 1, justifyContent: 'center' },
  resultTitle: { fontSize: 15, fontWeight: '800', marginBottom: 4 },
  resultAuthor: { fontSize: 12, marginBottom: 8 },
  tagRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  categoryTag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  categoryText: { fontSize: 10, fontWeight: '800' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontSize: 11, fontWeight: '700' },
  center: { padding: 40, alignItems: 'center' },
  historySection: { marginTop: 10 },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  historyTitle: { fontSize: 16, fontWeight: '800' },
  historyGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  historyChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1 },
  chipText: { fontSize: 12, fontWeight: '600', maxWidth: 100 },
  emptyContainer: { alignItems: 'center', paddingVertical: 60, opacity: 0.8 },
  emptyTitle: { fontSize: 18, fontWeight: '900', marginTop: 15 },
  emptySub: { fontSize: 13, textAlign: 'center', marginTop: 8, paddingHorizontal: 40 }
});
