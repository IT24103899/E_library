import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity,
  ActivityIndicator, Alert, Image, Dimensions, Animated
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { getBooks, searchBooks, getSearchHistory, saveSearchHistory, clearSearchHistory, getRecommendationsByIdea } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import { ScrollView, Modal } from 'react-native';
const { width } = Dimensions.get('window');

// Voice Search Safety Guard (Native module removed for Expo Go stability)
const ExpoSpeechRecognitionModule = null;

const GENRES = [
  'All', 'Fiction', 'Fantasy', 'Mystery', 'Romance', 'Science', 
  'History', 'Thriller', 'Biography', 'Horror', 'Poetry'
];

const YEAR_RANGES = [
  { label: 'Newest', value: '2024' },
  { label: '2020s', value: '2020' },
  { label: '2010s', value: '2010' },
  { label: 'Classics', value: '1900' }
];

export default function SearchScreen({ navigation }) {
  const { colors, dark } = useTheme();
  const { user, refreshUser } = useAuth();

  // Refresh premium status on focus
  useFocusEffect(
    React.useCallback(() => {
      if (refreshUser) refreshUser().catch(e => console.log('Refresh failed', e));
    }, [refreshUser])
  );

  const isPremium = user?.isPremium || 
                    user?.role === 'admin' || 
                    String(user?.plan).toUpperCase() === 'PREMIER' ||
                    String(user?.subscriptionPlan).toUpperCase() === 'PREMIER';
  
  // Search States
  // Manual Search States
  const [manualQuery, setManualQuery] = useState('');
  const [authorFilter, setAuthorFilter] = useState('');
  const [genreFilter, setGenreFilter] = useState('');
  const [isbnFilter, setIsbnFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [manualResults, setManualResults] = useState([]);
  const [hasManualSearched, setHasManualSearched] = useState(false);

  // AI Search States
  const [aiQuery, setAiQuery] = useState('');
  const [aiResults, setAiResults] = useState([]);
  const [hasAiSearched, setHasAiSearched] = useState(false);

  // Shared States
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchMode, setSearchMode] = useState('manual'); // 'manual' or 'ai'
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('relevance');

  // Voice Search States
  const [isListening, setIsListening] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const searchInputRef = useRef(null);

  // Voice Search logic removed for Expo Go stability
  useEffect(() => {
    setIsListening(false);
  }, []);

  useEffect(() => {
    if (isListening) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.5, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
    }
  }, [isListening, pulseAnim]);

  const startVoiceSearch = () => {
    Alert.alert(
      'Search Guidance',
      'For the best experience, please use the microphone button on your keyboard. This ensures your search is accurate and fast!'
    );
  };

  const stopVoiceSearch = () => {
    setIsListening(false);
  };

  const loadHistory = useCallback(async () => {
    try {
      const res = await getSearchHistory();
      if (res.data) setHistory(res.data);
    } catch (_) {}
  }, []);

  useEffect(() => { 
    loadHistory(); 
    const loadInitialBooks = async () => {
      try {
        const res = await getBooks();
        const data = Array.isArray(res.data) ? res.data : [];
        setManualResults(data.slice(0, 10));
      } catch (e) {
        console.log("Initial load failed", e);
      }
    };
    loadInitialBooks();
  }, [loadHistory]);

  const handleSearch = async () => {
    const isAI = searchMode === 'ai';
    const term = isAI ? aiQuery.trim() : manualQuery.trim();
    const hasFilters = authorFilter.trim() || genreFilter.trim() || isbnFilter.trim() || yearFilter.trim();
    
    if (!term && !hasFilters) return;

    setLoading(true);
    if (isAI) setHasAiSearched(true);
    else setHasManualSearched(true);

    try {
      let data = [];
      if (isAI) {
        const res = await getRecommendationsByIdea(term);
        // Extremely robust extraction for AI
        data = res.data?.recommendations || 
               res.data?.results || 
               res.data?.books || 
               res.data?.data ||
               (Array.isArray(res.data) ? res.data : (res.data?.ai_suggestions || []));
        setAiResults(data.slice(0, 10));
      } else {
        const params = { type: 'all', sort: sortBy };
        if (authorFilter.trim()) params.author = authorFilter.trim();
        if (genreFilter.trim()) params.category = genreFilter.trim();
        if (isbnFilter.trim()) params.isbn = isbnFilter.trim();
        if (yearFilter.trim()) params.year = yearFilter.trim();
        const res = await searchBooks(term, params);
        data = Array.isArray(res.data) ? res.data : [];
        setManualResults(data.slice(0, 10));
      }
      
      if (term) {
        try {
          await saveSearchHistory(term);
          await loadHistory();
        } catch (_) {}
      }
    } catch (err) {
      console.log("Search error:", err);
      Alert.alert('Search Error', 'Could not complete the request. Please try again.');
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
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Text style={styles.headerTitle}>Search Hub</Text>
          <TouchableOpacity onPress={() => { setHasSearched(false); loadHistory(); }}>
            <Ionicons name="time-outline" size={22} color="#fff" style={{ opacity: 0.8 }} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.qrBtn} onPress={() => navigation.navigate('QRScanner')}>
          <Ionicons name="qr-code-outline" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* UNIFIED MODE SWITCHER */}
      <View style={[styles.tabBar, { backgroundColor: colors.surface }]}>
        <TouchableOpacity 
          style={[styles.tab, searchMode === 'manual' && { borderBottomColor: colors.primary }]} 
          onPress={() => {
            setSearchMode('manual');
            setResults([]);
            setHasSearched(false);
          }}
        >
          <Ionicons name="search" size={16} color={searchMode === 'manual' ? colors.primary : colors.textSecondary} />
          <Text style={[styles.tabText, { color: searchMode === 'manual' ? colors.primary : colors.textSecondary }]}>Keyword</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, searchMode === 'ai' && { borderBottomColor: colors.primary }]} 
          onPress={() => {
            setSearchMode('ai');
            setResults([]);
            setHasSearched(false);
          }}
        >
          <Ionicons name="sparkles-outline" size={16} color={searchMode === 'ai' ? colors.primary : colors.textSecondary} />
          <Text style={[styles.tabText, { color: searchMode === 'ai' ? colors.primary : colors.textSecondary }]}>Smart AI</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={true} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.inputSection}>
          {searchMode === 'ai' ? (
            <View style={[styles.aiBox, { backgroundColor: colors.surface, borderColor: colors.primary + '30' }]}>
              <View style={styles.aiHeaderRow}>
                <Ionicons name="sparkles" size={20} color={colors.primary} />
                <Text style={[styles.aiGeniusTitle, { color: colors.text }]}>AI GENIUS SUGGESTION</Text>
              </View>
              <Text style={[styles.aiSubHint, { color: colors.textSecondary }]}>Tell me what kind of book you want and AI will find it for you...</Text>
              <TextInput
                style={[styles.aiInput, { color: colors.text, backgroundColor: dark ? colors.background : '#f1f5f9' }]}
                placeholder="Describe your ideal book (e.g., A thriller set in space...)"
                placeholderTextColor={colors.textSecondary + '70'}
                value={aiQuery}
                onChangeText={setAiQuery}
                multiline
                numberOfLines={3}
              />
              <TouchableOpacity style={[styles.aiButton, { backgroundColor: colors.primary }]} onPress={() => handleSearch()}>
                <Ionicons name="sparkles-outline" size={20} color="#fff" />
                <Text style={styles.aiButtonText}>Find Magic</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.advancedBox}>
              <View style={[styles.searchRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Ionicons name="search-outline" size={20} color={colors.primary} />
                <TextInput
                  ref={searchInputRef}
                  style={[styles.manualInput, { color: colors.text }]}
                  placeholder="Title, Author, or ISBN..."
                  placeholderTextColor={colors.textSecondary + '70'}
                  value={manualQuery}
                  onChangeText={setManualQuery}
                  onSubmitEditing={() => handleSearch()}
                />
                <TouchableOpacity onPress={() => setShowFilters(!showFilters)} style={styles.tuneBtn}>
                  <Ionicons name="options" size={20} color={colors.primary} />
                </TouchableOpacity>
              </View>

              {showFilters && (
                <View style={styles.filterPanel}>
                    <View>
                      {/* Author Section */}
                      <View style={styles.filterGroup}>
                        <View style={styles.labelRow}>
                          <Ionicons name="person-outline" size={14} color={colors.primary} />
                          <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>Author</Text>
                        </View>
                        <View style={styles.inputWrapper}>
                          <TextInput 
                            style={[styles.filterInput, { color: colors.text, borderColor: colors.border, backgroundColor: dark ? colors.background : '#fff' }]} 
                            placeholder="Search by author name..." 
                            placeholderTextColor={colors.textSecondary + '60'}
                            value={authorFilter}
                            onChangeText={setAuthorFilter}
                          />
                          {authorFilter.length > 0 && (
                            <TouchableOpacity style={styles.clearBtn} onPress={() => setAuthorFilter('')}>
                              <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>

                      {/* Genre Section with Chips */}
                      <View style={styles.filterGroup}>
                        <View style={styles.labelRow}>
                          <Ionicons name="pricetag-outline" size={14} color={colors.primary} />
                          <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>Select Genre</Text>
                        </View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.genreScroll}>
                          {GENRES.map(g => (
                            <TouchableOpacity 
                              key={g} 
                              style={[
                                styles.genreChip, 
                                { backgroundColor: (genreFilter === g || (g === 'All' && !genreFilter)) ? colors.primary : colors.surface, 
                                  borderColor: colors.border }
                              ]}
                              onPress={() => setGenreFilter(g === 'All' ? '' : g)}
                            >
                              <Text style={[styles.genreChipText, { color: (genreFilter === g || (g === 'All' && !genreFilter)) ? '#fff' : colors.textSecondary }]}>
                                {g}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      </View>

                      <View style={styles.filterRow}>
                        <View style={[styles.filterGroup, { flex: 1.2 }]}>
                          <View style={styles.labelRow}>
                            <Ionicons name="barcode-outline" size={14} color={colors.primary} />
                            <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>ISBN</Text>
                          </View>
                          <View style={styles.inputWrapper}>
                            <TextInput 
                              style={[styles.filterInput, { color: colors.text, borderColor: colors.border, backgroundColor: dark ? colors.background : '#fff' }]} 
                              placeholder="ISBN-13" 
                              placeholderTextColor={colors.textSecondary + '60'}
                              value={isbnFilter}
                              onChangeText={setIsbnFilter}
                              keyboardType="numeric"
                            />
                            <TouchableOpacity style={styles.clearBtn} onPress={() => navigation.navigate('QRScanner')}>
                              <Ionicons name="scan-outline" size={20} color={colors.primary} />
                            </TouchableOpacity>
                          </View>
                        </View>
                        <View style={[styles.filterGroup, { flex: 0.8 }]}>
                          <View style={styles.labelRow}>
                            <Ionicons name="calendar-outline" size={14} color={colors.primary} />
                            <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>Year</Text>
                          </View>
                          <TextInput 
                            style={[styles.filterInput, { color: colors.text, borderColor: colors.border, backgroundColor: dark ? colors.background : '#fff' }]} 
                            placeholder="YYYY" 
                            placeholderTextColor={colors.textSecondary + '60'}
                            value={yearFilter}
                            onChangeText={setYearFilter}
                            keyboardType="numeric"
                            maxLength={4}
                          />
                        </View>
                      </View>

                      {/* Year Presets */}
                      <View style={styles.filterGroup}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.genreScroll}>
                          {YEAR_RANGES.map(yr => (
                            <TouchableOpacity 
                              key={yr.value} 
                              style={[
                                styles.yearChip, 
                                { backgroundColor: yearFilter === yr.value ? colors.primary : colors.surface, 
                                  borderColor: colors.border }
                              ]}
                              onPress={() => setYearFilter(yr.value)}
                            >
                              <Text style={[styles.yearChipText, { color: yearFilter === yr.value ? '#fff' : colors.textSecondary }]}>
                                {yr.label}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      </View>

                      <View style={styles.filterGroup}>
                        <View style={styles.labelRow}>
                          <Ionicons name="swap-vertical-outline" size={14} color={colors.primary} />
                          <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>Sort Results By</Text>
                        </View>
                        <View style={styles.sortOptions}>
                          {[
                            { id: 'relevance', icon: 'flash' },
                            { id: 'title', icon: 'text' },
                            { id: 'year', icon: 'calendar' },
                            { id: 'oldest', icon: 'history' }
                          ].map(opt => (
                            <TouchableOpacity 
                              key={opt.id}
                              style={[
                                styles.sortBtn, 
                                sortBy === opt.id && { backgroundColor: colors.primary, borderColor: colors.primary }
                              ]}
                              onPress={() => setSortBy(opt.id)}
                            >
                              <MaterialCommunityIcons 
                                name={opt.icon} 
                                size={14} 
                                color={sortBy === opt.id ? '#fff' : colors.textSecondary} 
                                style={{ marginRight: 4 }}
                              />
                              <Text style={[styles.sortBtnText, { color: sortBy === opt.id ? '#fff' : colors.textSecondary }]}>
                                {opt.id.charAt(0).toUpperCase() + opt.id.slice(1)}
                              </Text>
                            </TouchableOpacity>
                          ))}
                      </View>
                    </View>

                    <TouchableOpacity style={[styles.applyBtn, { backgroundColor: colors.primary }]} onPress={() => handleSearch()}>
                      <Ionicons name="search" size={20} color="#fff" style={{ marginRight: 8 }} />
                      <Text style={styles.applyBtnText}>Search with Filters</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          )}
        </View>

        {/* RESULTS SECTION */}
        <View style={styles.resultsContainer}>
          {loading ? (
            <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>
          ) : (searchMode === 'ai' ? hasAiSearched : hasManualSearched) ? (
            <View>
              <View style={styles.resultsHeader}>
                <Text style={[styles.resultsCount, { color: colors.textSecondary }]}>
                  {(searchMode === 'ai' ? aiResults : manualResults).length} suggestions found
                </Text>
              </View>
              {(searchMode === 'ai' ? aiResults : manualResults).length > 0 ? (
                (searchMode === 'ai' ? aiResults : manualResults).map(item => <View key={item._id}>{renderResult({ item })}</View>)
              ) : (
                <View style={styles.emptyContainer}>
                  <Ionicons name="sparkles-outline" size={64} color={colors.border} />
                  <Text style={[styles.emptyTitle, { color: colors.text }]}>No Matches Found</Text>
                  <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
                    {searchMode === 'ai' 
                      ? "The AI couldn't find exactly what you described. Try using different keywords or simpler terms."
                      : "Try adjusting your filters or switching to AI Search mode."}
                  </Text>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.historySection}>
              {history.length > 0 ? (
                <View>
                  <View style={styles.historyHeader}>
                    <Text style={[styles.historyTitle, { color: colors.text }]}>Recent Activity</Text>
                    <TouchableOpacity onPress={async () => { await clearSearchHistory(); setHistory([]); }}>
                      <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '700' }}>Clear All</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.historyGrid}>
                    {history.slice(0, 10).map((h, i) => {
                      const termValue = typeof h === 'string' ? h : (h.term || h.searchQuery || '');
                      if (!termValue) return null;
                      
                      return (
                        <TouchableOpacity 
                          key={i} 
                          style={[styles.historyChip, { backgroundColor: colors.surface, borderColor: colors.border }]}
                          onPress={() => {
                            setManualQuery(termValue);
                            setSearchMode('manual');
                          }}
                        >
                          <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
                          <Text style={[styles.chipText, { color: colors.textSecondary }]} numberOfLines={1}>{termValue}</Text>
                          <TouchableOpacity 
                            style={{ marginLeft: 4, padding: 2 }}
                            onPress={(e) => {
                              e.stopPropagation();
                              setManualQuery(termValue);
                              setSearchMode('manual');
                              searchInputRef.current?.focus();
                            }}
                          >
                            <Ionicons name="arrow-up-outline" size={12} color={colors.primary} style={{ transform: [{ rotate: '45deg' }] }} />
                          </TouchableOpacity>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              ) : (
                <View style={styles.noHistory}>
                  <Ionicons name="search-outline" size={40} color={colors.border} />
                  <Text style={[styles.noHistoryText, { color: colors.textSecondary }]}>No recent searches</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* VOICE SEARCH MODAL */}
      <Modal visible={isListening} transparent animationType="fade">
        <View style={styles.voiceOverlay}>
          <View style={[styles.voiceCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.voiceTitle, { color: colors.text }]}>Listening...</Text>
            <Text style={[styles.voiceSub, { color: colors.textSecondary }]}>Tell me the book title or author</Text>
            
            <View style={styles.pulseContainer}>
              <Animated.View style={[styles.pulseCircle, { 
                backgroundColor: colors.primary + '20',
                transform: [{ scale: pulseAnim }]
              }]} />
              <TouchableOpacity style={[styles.micBig, { backgroundColor: colors.primary }]} onPress={stopVoiceSearch}>
                <Ionicons name="mic" size={40} color="#fff" />
              </TouchableOpacity>
            </View>

            <Text style={[styles.voiceQuery, { color: colors.primary }]}>{manualQuery || '...'}</Text>

            <TouchableOpacity style={[styles.voiceCancel, { borderColor: colors.border }]} onPress={stopVoiceSearch}>
              <Text style={{ color: colors.textSecondary, fontWeight: '700' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}



const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, paddingTop: 60, paddingBottom: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 26, fontWeight: '900', color: '#fff', letterSpacing: -1 },
  qrBtn: { padding: 10, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 14 },
  tabBar: { flexDirection: 'row', height: 55, elevation: 8, shadowOpacity: 0.15, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderBottomWidth: 3, borderBottomColor: 'transparent' },
  tabText: { fontSize: 14, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8 },
  inputSection: { padding: 18 },
  aiBox: { padding: 22, borderRadius: 28, borderWidth: 1.5, shadowColor: '#4f46e5', shadowOpacity: 0.2, shadowRadius: 25, elevation: 8 },
  aiHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  aiGeniusTitle: { fontSize: 15, fontWeight: '900', letterSpacing: 1 },
  aiSubHint: { fontSize: 13, marginBottom: 18, opacity: 0.8, fontWeight: '500' },
  aiInput: { borderRadius: 18, padding: 18, fontSize: 15, height: 110, textAlignVertical: 'top', marginBottom: 20, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
  aiButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 18, borderRadius: 20, gap: 12, elevation: 4 },
  aiButtonText: { color: '#fff', fontSize: 17, fontWeight: '900' },
  advancedBox: { padding: 2 },
  searchRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 4, borderRadius: 22, borderWidth: 1.5, gap: 12, elevation: 6, shadowOpacity: 0.1, shadowRadius: 10 },
  tuneBtn: { padding: 8, backgroundColor: 'rgba(79, 70, 229, 0.1)', borderRadius: 12 },
  manualInput: { flex: 1, fontSize: 16, height: 55, fontWeight: '700' },
  filterPanel: { marginTop: 20, gap: 18, padding: 4 },
  filterGroup: { gap: 8 },
  filterLabel: { fontSize: 13, fontWeight: '900', textTransform: 'uppercase', marginLeft: 4, letterSpacing: 0.5 },
  filterInput: { borderWidth: 1.5, borderRadius: 14, padding: 14, fontSize: 15, fontWeight: '600' },
  applyBtn: { padding: 18, borderRadius: 20, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', elevation: 5 },
  applyBtnText: { color: '#fff', fontWeight: '900', fontSize: 17 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  genreScroll: { marginTop: 6 },
  genreChip: { paddingHorizontal: 18, paddingVertical: 12, borderRadius: 15, borderWidth: 1.5, marginRight: 10 },
  genreChipText: { fontSize: 14, fontWeight: '800' },
  sortBtn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, borderWidth: 1.5, borderColor: '#eee', flexDirection: 'row', alignItems: 'center' },
  inputWrapper: { position: 'relative', justifyContent: 'center' },
  clearBtn: { position: 'absolute', right: 15 },
  yearChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, borderWidth: 1.5, marginRight: 10 },
  yearChipText: { fontSize: 12, fontWeight: '800' },
  resultsContainer: { paddingHorizontal: 20, marginTop: 10 },
  resultsHeader: { marginBottom: 18, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  resultsCount: { fontSize: 14, fontWeight: '800', opacity: 0.7 },
  resultCard: { flexDirection: 'row', padding: 15, borderRadius: 24, marginBottom: 15, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4, borderWidth: 1, borderColor: 'rgba(0,0,0,0.03)' },
  resultCover: { width: 75, height: 105, borderRadius: 16, overflow: 'hidden', marginRight: 18, elevation: 3 },
  coverImg: { width: '100%', height: '100%' },
  coverPlaceholder: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  resultInfo: { flex: 1, justifyContent: 'center' },
  resultTitle: { fontSize: 17, fontWeight: '900', marginBottom: 6, lineHeight: 22 },
  resultAuthor: { fontSize: 13, marginBottom: 10, fontWeight: '600' },
  tagRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  categoryTag: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  categoryText: { fontSize: 11, fontWeight: '900', textTransform: 'uppercase' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  ratingText: { fontSize: 12, fontWeight: '800' },
  center: { padding: 50, alignItems: 'center' },
  historySection: { marginTop: 15 },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, paddingHorizontal: 4 },
  historyTitle: { fontSize: 17, fontWeight: '900', letterSpacing: -0.2 },
  historyGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  historyChip: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 15, borderWidth: 1.5 },
  chipText: { fontSize: 13, fontWeight: '700', maxWidth: 110 },
  emptyContainer: { alignItems: 'center', paddingVertical: 70, opacity: 0.9 },
  emptyTitle: { fontSize: 20, fontWeight: '900', marginTop: 20 },
  emptySub: { fontSize: 14, textAlign: 'center', marginTop: 10, paddingHorizontal: 45, lineHeight: 20 },
  premiumLocked: { padding: 30, borderRadius: 24, alignItems: 'center', borderWidth: 2, borderStyle: 'dashed' },
  premiumTitle: { fontSize: 20, fontWeight: '900', marginTop: 12 },
  premiumSub: { fontSize: 14, textAlign: 'center', marginTop: 8, marginBottom: 20 },
  upgradeBtn: { paddingHorizontal: 25, paddingVertical: 12, borderRadius: 16 },
  upgradeBtnText: { color: '#fff', fontWeight: '900', fontSize: 14 },
  noHistory: { alignItems: 'center', paddingVertical: 30, opacity: 0.6 },
  noHistoryText: { fontSize: 15, marginTop: 10, fontWeight: '700' },
  filterRow: { flexDirection: 'row', gap: 12 },
  sortOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 8 },
  sortBtnText: { fontSize: 12, fontWeight: '800' },
  voiceBtn: { padding: 8, marginRight: 5 },
  voiceOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  voiceCard: { width: '88%', padding: 45, borderRadius: 36, alignItems: 'center', gap: 25 },
  voiceTitle: { fontSize: 26, fontWeight: '900' },
  voiceSub: { fontSize: 16, textAlign: 'center', opacity: 0.8 },
  pulseContainer: { width: 140, height: 140, justifyContent: 'center', alignItems: 'center', marginVertical: 25 },
  pulseCircle: { position: 'absolute', width: 120, height: 120, borderRadius: 60 },
  micBig: { width: 90, height: 90, borderRadius: 45, justifyContent: 'center', alignItems: 'center', elevation: 12, shadowOpacity: 0.4, shadowRadius: 15 },
  voiceQuery: { fontSize: 20, fontWeight: '800', textAlign: 'center', fontStyle: 'italic', paddingHorizontal: 20 },
  voiceCancel: { marginTop: 25, paddingHorizontal: 35, paddingVertical: 14, borderRadius: 18, borderWidth: 1.5 }
});
