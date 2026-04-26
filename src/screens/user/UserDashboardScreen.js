import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Image, RefreshControl, Dimensions, StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { getBooks, getReadingStats, getBookshelf, getActivity } from '../../services/api';
import { API_BASE_URL } from '../../config/api';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInRight, ZoomIn } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

const QUOTES = [
  { text: "A room without books is like a body without a soul.", author: "Cicero" },
  { text: "Reading is to the mind what exercise is to the body.", author: "Joseph Addison" },
  { text: "Books are a uniquely portable magic.", author: "Stephen King" },
  { text: "Once you learn to read, you will be forever free.", author: "Frederick Douglass" }
];

export default function UserDashboardScreen({ navigation }) {
  const { user } = useAuth();
  const [imgError, setImgError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [recommended, setRecommended] = useState([]);
  const [stats, setStats] = useState(null);
  const [continueReading, setContinueReading] = useState(null);
  const [quote, setQuote] = useState(QUOTES[0]);

  const fetchData = useCallback(async () => {
    try {
      getBooks().then(res => setRecommended((res.data || []).slice(0, 5))).catch(() => {});
      getReadingStats().then(res => setStats(res.data || null)).catch(() => {});
      getBookshelf().then(res => {
        const shelfData = res.data || {};
        const readingList = shelfData['reading'] || [];
        if (readingList.length > 0) {
          const item = readingList[0];
          // bookId is a populated Book object from the backend
          const book = item.bookId || {};
          setContinueReading({
            _id: book._id || item.bookId,
            title: book.title || '',
            author: book.author || '',
            coverUrl: book.coverUrl || '',
            pdfUrl: book.pdfUrl || '',
            totalPages: book.totalPages || 0,
            pageNumber: item.pageNumber || 0,
          });
        }
      }).catch(() => {});
      
      getActivity().then(res => {
        const history = res.data || [];
        if (history.length > 0) {
          const recent = history[0];
          // Only use activity if it has valid book data
          if (recent.title && recent.title !== 'Unknown Book') {
            setContinueReading(prev => prev || {
              _id: recent.bookId,
              title: recent.title,
              author: recent.author,
              coverUrl: recent.coverUrl,
              pageNumber: recent.pageNumber || 0,
              totalPages: recent.totalPages || 0,
              pdfUrl: recent.pdfUrl || ''
            });
          }
        }
      }).catch(() => {});

      setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
    } catch (_) {}
    setLoading(false);
    setRefreshing(false);
  }, []); // continueReading dependency removed to prevent infinite loop on fast updates

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) {
    return (
      <View style={styles.center}>
        <StatusBar barStyle="light-content" />
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor="#fff" />}
      >
        {/* Dynamic Premium Header */}
        <LinearGradient colors={['#1e1b4b', '#4338ca', '#6366f1']} style={styles.header} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View style={styles.headerAccent1} />
          <View style={styles.headerAccent2} />
          
          <Animated.View entering={FadeInDown.duration(600).delay(100)} style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>Hello, {user?.name?.split(' ')[0] || 'Reader'} 👋</Text>
              <Text style={styles.subtext}>Ready for a new adventure?</Text>
            </View>
            <TouchableOpacity style={styles.avatarContainer} onPress={() => navigation.navigate('Profile')}>
              {user?.profileImage && !imgError ? (
                <Image 
                  source={{ uri: `${API_BASE_URL.replace('/api/', '').replace(/\/$/, '')}${user.profileImage.startsWith('/') ? '' : '/'}${user.profileImage.replace(/^\//, '')}` }} 
                  style={styles.avatarImage} 
                  onError={() => setImgError(true)}
                />
              ) : (
                <LinearGradient colors={['#fbbf24', '#f59e0b']} style={styles.avatar}>
                  <Text style={styles.avatarText}>{(user?.name || '?')[0].toUpperCase()}</Text>
                </LinearGradient>
              )}
            </TouchableOpacity>
          </Animated.View>

          {/* Premium Action Hub */}
          <Animated.View entering={ZoomIn.duration(600).delay(200)} style={styles.actionHub}>
              <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('Search')} activeOpacity={0.7}>
                  <View style={[styles.actionIcon, { backgroundColor: '#eef2ff' }]}>
                      <Ionicons name="search" size={26} color="#4f46e5" />
                  </View>
                  <Text style={styles.actionLabel}>Search</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('Search', { screen: 'QRScanner' })} activeOpacity={0.7}>
                  <View style={[styles.actionIcon, { backgroundColor: '#fdf2f8' }]}>
                      <Ionicons name="scan" size={26} color="#db2777" />
                  </View>
                  <Text style={styles.actionLabel}>Scan QR</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('Books')} activeOpacity={0.7}>
                  <View style={[styles.actionIcon, { backgroundColor: '#f0fdf4' }]}>
                      <Ionicons name="compass" size={26} color="#16a34a" />
                  </View>
                  <Text style={styles.actionLabel}>Explore</Text>
              </TouchableOpacity>
          </Animated.View>
        </LinearGradient>

        {/* Quote Section */}
        <Animated.View entering={FadeInDown.duration(600).delay(300)} style={styles.quoteWrapper}>
            <View style={styles.quoteCard}>
                <Ionicons name="chatbubble-ellipses" size={36} color="rgba(99, 102, 241, 0.2)" style={styles.quoteIconBg} />
                <Text style={styles.quoteText}>"{quote.text}"</Text>
                <Text style={styles.quoteAuthor}>— {quote.author}</Text>
            </View>
        </Animated.View>

        {/* Stats Cluster */}
        <Animated.View entering={FadeInDown.duration(600).delay(400)} style={styles.statsCluster}>
          <View style={styles.statBox}>
            <LinearGradient colors={['#fee2e2', '#fecaca']} style={styles.statIconBadge}>
              <Ionicons name="book" size={18} color="#ef4444" />
            </LinearGradient>
            <Text style={styles.statVal}>{stats?.booksRead || 0}</Text>
            <Text style={styles.statSub}>Books Read</Text>
          </View>
          <View style={styles.statBox}>
            <LinearGradient colors={['#e0e7ff', '#c7d2fe']} style={styles.statIconBadge}>
              <Ionicons name="document-text" size={18} color="#4f46e5" />
            </LinearGradient>
            <Text style={styles.statVal}>{stats?.pagesRead || 0}</Text>
            <Text style={styles.statSub}>Total Pages</Text>
          </View>
          <View style={styles.statBox}>
            <LinearGradient colors={['#fef3c7', '#fde68a']} style={styles.statIconBadge}>
              <Ionicons name="flame" size={18} color="#d97706" />
            </LinearGradient>
            <Text style={styles.statVal}>{stats?.streak || 0}</Text>
            <Text style={styles.statSub}>Days Streak</Text>
          </View>
        </Animated.View>

        {/* Continue Reading Section */}
        <Animated.View entering={FadeInDown.duration(600).delay(500)}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Continue Reading</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Bookshelf')} style={styles.seeAllBtn}>
              <Text style={styles.seeAllText}>See all</Text>
              <Ionicons name="arrow-forward" size={16} color="#4f46e5" style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          </View>

          {continueReading ? (
            <TouchableOpacity
              style={styles.premiumContinueCard}
              activeOpacity={0.9}
              onPress={() => navigation.navigate('Books', { 
                screen: 'Reader', 
                params: { 
                  bookId: continueReading._id, 
                  bookTitle: continueReading.title, 
                  pdfUrl: continueReading.pdfUrl,
                  totalPages: continueReading.totalPages 
                } 
              })}
            >
              {continueReading.coverUrl ? (
                <Image 
                  source={{ uri: continueReading.coverUrl }} 
                  style={styles.continueImg} 
                  onError={() => {
                    setContinueReading(prev => ({ ...prev, coverUrl: null }));
                  }}
                />
              ) : (
                <LinearGradient colors={['#6366f1', '#a855f7']} style={styles.continueImgPlaceholder}>
                  <Ionicons name="library" size={32} color="rgba(255,255,255,0.7)" />
                </LinearGradient>
              )}
              
              <View style={styles.continueDetails}>
                <Text style={styles.continueTitle} numberOfLines={2}>
                  {(continueReading.title && continueReading.title !== 'Unknown Book') ? continueReading.title : 'Mystery Title'}
                </Text>
                <Text style={styles.continueAuthor} numberOfLines={1}>
                  {(continueReading.author && continueReading.author !== 'Unknown') ? continueReading.author : 'Unknown Source'}
                </Text>
                <View style={styles.progressRow}>
                    <View style={styles.pgBar}>
                        <LinearGradient 
                           colors={['#4f46e5', '#a855f7']} 
                           style={[styles.pgFill, { width: `${continueReading.totalPages > 0 ? Math.min(100, (continueReading.pageNumber / continueReading.totalPages) * 100) : 0}%` }]} 
                           start={{x:0, y:0}} end={{x:1, y:0}}
                        />
                    </View>
                    <Text style={styles.pgPercent}>
                      {continueReading.totalPages > 0 ? Math.round((continueReading.pageNumber / continueReading.totalPages) * 100) : 0}%
                    </Text>
                </View>
              </View>
              <LinearGradient colors={['#4f46e5', '#6366f1']} style={styles.playIconButton}>
                  <Ionicons name="play" size={20} color="#fff" style={{ marginLeft: 3 }} />
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <View style={styles.creativeEmptyState}>
              <View style={styles.emptyIconBg}>
                  <Ionicons name="book-outline" size={36} color="#6366f1" />
              </View>
              <Text style={styles.emptyText}>Your bookshelf awaits!</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Books')} style={styles.vibrantExploreBtn}>
                <LinearGradient colors={['#4f46e5', '#6366f1']} style={styles.vibrantExploreBtnGradient}>
                  <Text style={styles.vibrantExploreBtnText}>Discover Books</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>

        {/* Modern Horizontal Scroll for Recommended */}
        <Animated.View entering={FadeInDown.duration(600).delay(600)}>
          <View style={[styles.sectionHeader, { marginTop: 35 }]}>
            <View>
              <Text style={styles.sectionTitle}>Curated for You</Text>
              <Text style={styles.tagline}>Fresh picks based on your taste</Text>
            </View>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.modernHorizontalScroll}>
            {recommended.map((book, index) => (
              <Animated.View key={book._id} entering={FadeInRight.duration(500).delay(600 + index * 100)}>
                <TouchableOpacity
                  style={styles.modernBookCard}
                  activeOpacity={0.8}
                  onPress={() => navigation.navigate('Books', { screen: 'BookDetail', params: { bookId: book._id, book } })}
                >
                  <View style={styles.bookShadow}>
                      {book.coverUrl ? (
                         <Image source={{ uri: book.coverUrl }} style={styles.modernCover} />
                      ) : (
                         <LinearGradient colors={['#94a3b8', '#cbd5e1']} style={styles.modernCoverPlaceholder}>
                            <Ionicons name="image-outline" size={40} color="#fff" />
                         </LinearGradient>
                      )}
                  </View>
                  <Text style={styles.modernTitle} numberOfLines={1}>{book.title}</Text>
                  <Text style={styles.modernAuthor} numberOfLines={1}>{book.author}</Text>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </ScrollView>
        </Animated.View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fcfcfd' }, // ultra light base
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fcfcfd' },
  content: { paddingBottom: 110 },
  header: {
    paddingTop: 75,
    paddingHorizontal: 25,
    paddingBottom: 80,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    position: 'relative',
    overflow: 'hidden',
  },
  headerAccent1: {
    position: 'absolute',
    top: -60,
    right: -40,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  headerAccent2: {
    position: 'absolute',
    bottom: -80,
    left: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', zIndex: 1 },
  greeting: { fontSize: 32, fontWeight: '900', color: '#ffffff', letterSpacing: -0.5 },
  subtext: { fontSize: 16, color: 'rgba(255,255,255,0.85)', marginTop: 6, fontWeight: '500' },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10, elevation: 8,
  },
  avatar: { 
    flex: 1,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: { width: '100%', height: '100%', borderRadius: 28 },
  avatarText: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  
  actionHub: {
      flexDirection: 'row',
      justifyContent: 'space-evenly',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      marginHorizontal: 0,
      marginTop: 35,
      paddingVertical: 20,
      borderRadius: 28,
      shadowColor: '#4f46e5', shadowOpacity: 0.2, shadowRadius: 25, elevation: 15,
  },
  actionItem: { alignItems: 'center', width: '30%' },
  actionIcon: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  actionLabel: { fontSize: 13, color: '#334155', fontWeight: '800' },

  quoteWrapper: { paddingHorizontal: 25, marginTop: -30, zIndex: 5 },
  quoteCard: {
      backgroundColor: '#fff',
      borderRadius: 28,
      padding: 24,
      shadowColor: '#94a3b8', shadowOpacity: 0.15, shadowRadius: 15, elevation: 8,
      position: 'relative',
      overflow: 'hidden'
  },
  quoteIconBg: { position: 'absolute', top: 15, left: 20 },
  quoteText: { fontSize: 17, fontStyle: 'italic', color: '#1e293b', lineHeight: 26, fontWeight: '600', marginTop: 15 },
  quoteAuthor: { fontSize: 14, color: '#64748b', marginTop: 15, fontWeight: '800', alignSelf: 'flex-end' },

  statsCluster: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 25, marginTop: 30 },
  statBox: { 
      width: (width - 70) / 3, 
      backgroundColor: '#fff', 
      paddingVertical: 20, 
      borderRadius: 24, 
      alignItems: 'center',
      shadowColor: '#cbd5e1', shadowOpacity: 0.2, shadowRadius: 10, elevation: 5,
  },
  statIconBadge: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  statVal: { fontSize: 24, fontWeight: '900', color: '#0f172a' },
  statSub: { fontSize: 11, color: '#64748b', fontWeight: '800', marginTop: 4, textTransform: 'uppercase' },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingHorizontal: 25, marginTop: 40, marginBottom: 20 },
  sectionTitle: { fontSize: 24, fontWeight: '900', color: '#0f172a', letterSpacing: -0.5 },
  tagline: { fontSize: 14, color: '#64748b', marginTop: 4, fontWeight: '500' },
  seeAllBtn: { flexDirection: 'row', alignItems: 'center' },
  seeAllText: { color: '#4f46e5', fontWeight: '700', fontSize: 14 },

  premiumContinueCard: {
      flexDirection: 'row',
      backgroundColor: '#fff',
      marginHorizontal: 25,
      borderRadius: 28,
      padding: 16,
      alignItems: 'center',
      shadowColor: '#4f46e5', shadowOpacity: 0.12, shadowRadius: 20, shadowOffset: {height: 8, width: 0}, elevation: 8,
  },
  continueImg: { width: 90, height: 130, borderRadius: 20, backgroundColor: '#f1f5f9' },
  continueImgPlaceholder: { width: 90, height: 130, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  continueDetails: { flex: 1, marginLeft: 20 },
  continueTitle: { fontSize: 19, fontWeight: '900', color: '#0f172a', marginBottom: 6 },
  continueAuthor: { fontSize: 14, color: '#64748b', fontWeight: '500' },
  progressRow: { flexDirection: 'row', alignItems: 'center', marginTop: 20 },
  pgBar: { flex: 1, height: 8, backgroundColor: '#f1f5f9', borderRadius: 4, marginRight: 12, overflow: 'hidden' },
  pgFill: { height: '100%', borderRadius: 4 },
  pgPercent: { fontSize: 14, fontWeight: '900', color: '#4f46e5', width: 35 },
  playIconButton: { 
      width: 50, height: 50, borderRadius: 25, 
      justifyContent: 'center', alignItems: 'center', 
      shadowColor: '#4f46e5', shadowOpacity: 0.4, shadowRadius: 10, elevation: 8 
  },

  creativeEmptyState: { 
      alignItems: 'center', backgroundColor: '#fff', marginHorizontal: 25, 
      borderRadius: 28, padding: 35, borderStyle: 'dashed', borderWidth: 2, borderColor: '#e2e8f0' 
  },
  emptyIconBg: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#e0e7ff', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  emptyText: { fontSize: 18, color: '#334155', fontWeight: '800', marginBottom: 20 },
  vibrantExploreBtn: { borderRadius: 20, overflow: 'hidden', shadowColor: '#4f46e5', shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  vibrantExploreBtnGradient: { paddingHorizontal: 30, paddingVertical: 14 },
  vibrantExploreBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },

  modernHorizontalScroll: { paddingHorizontal: 25, paddingBottom: 25 },
  modernBookCard: { width: 150, marginRight: 22 },
  bookShadow: {
      shadowColor: '#0f172a', shadowOpacity: 0.15, shadowRadius: 15, shadowOffset: {height: 8, width: 0}, elevation: 8,
      borderRadius: 24, backgroundColor: '#fff', marginBottom: 15
  },
  modernCover: { width: '100%', height: 220, borderRadius: 24 },
  modernCoverPlaceholder: { width: '100%', height: 220, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  modernTitle: { fontSize: 16, fontWeight: '800', color: '#0f172a', paddingHorizontal: 2 },
  modernAuthor: { fontSize: 14, color: '#64748b', marginTop: 4, paddingHorizontal: 2, fontWeight: '500' },
});
