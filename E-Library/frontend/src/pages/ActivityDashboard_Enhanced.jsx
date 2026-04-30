import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Zap,
  Flame,
  BookOpen,
  Star,
  ChevronRight,
  Award,
  TrendingUp,
  Loader,
  AlertCircle,
  CheckCircle,
  Bookmark,
} from 'lucide-react';
import { ActivityService } from '../services/ActivityService';
import styles from './ActivityDashboard.module.css';
import HistoryCard from '../components/HistoryCard';
import ProgressBar from '../components/ProgressBar';
import RecommendationEngine from '../components/RecommendationEngine';
import ThemeToggle from '../components/ThemeToggle';

/**
 * ActivityDashboard - Professional Reading Dashboard
 * 
 * Features:
 * - Interactive stats cards with animations
 * - Gamification elements (streaks, achievements, badges)
 * - Continue reading with progress percentage
 * - Beautiful layout with smooth transitions
 * - Error handling and loading states
 */
const ActivityDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [currentBook, setCurrentBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authUser, setAuthUser] = useState(null);

  // Load user from localStorage
  useEffect(() => {
      const raw = localStorage.getItem('authUser');
    if (raw) {
      try {
        setAuthUser(JSON.parse(raw));
      } catch (e) {
        console.error('Failed to parse stored user:', e);
      }
    }
  }, []);

  // Fetch dashboard data
  useEffect(() => {
    if (authUser) {
      fetchData();
    }
  }, [authUser]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, historyRes] = await Promise.all([
        ActivityService.getUserStats(authUser.id),
        ActivityService.getUserActivity(authUser.id),
      ]);

      setStats(statsRes.data || {});
      setHistory(historyRes.data || []);

      // Set the first book as "currently reading"
      if (historyRes.data && historyRes.data.length > 0) {
        setCurrentBook(historyRes.data[0]);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError('Failed to load your reading dashboard. Please try again.');
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    fetchData();
  };

  // Loading skeleton
  if (loading) {
    return (
      <main className={styles['activitydashboard-main']}>
        <div className={styles['activitydashboard-container']}>
          <div className="space-y-6">
            {/* Hero skeleton */}
            <div className="h-48 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl animate-pulse" />
            
            {/* Stats skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-32 bg-gray-200 rounded-xl animate-pulse"
                />
              ))}
            </div>

            {/* Content skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-24 bg-gray-200 rounded-lg animate-pulse"
                  />
                ))}
              </div>
              <div className="h-96 bg-gray-200 rounded-xl animate-pulse" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Error state
  if (error) {
    return (
      <main className={styles['activitydashboard-main']}>
        <div className={styles['activitydashboard-container']}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500 rounded-xl p-8 text-center"
          >
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-900 mb-2">
              Oops! Something went wrong
            </h2>
            <p className="text-red-700 mb-6">{error}</p>
            <button
              onClick={handleRetry}
              className="px-6 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-all"
            >
              Try Again
            </button>
          </motion.div>
        </div>
      </main>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  };

  return (
    <main className={styles['activitydashboard-main']}>
      <div className={styles['activitydashboard-container']}>
        {/* Hero Section */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className={styles['activitydashboard-hero']}
        >
          <div className={styles['activitydashboard-hero-inner']}>
            <div className={styles['activitydashboard-hero-content']}>
              <h1 className={styles['activitydashboard-hero-title']}>
                ✨ Welcome back, {authUser?.name?.split(' ')[0]}!
              </h1>
              <p className={styles['activitydashboard-hero-sub']}>
                Track your reading journey, unlock achievements, and continue where you left off — all in one elegant place.
              </p>

              <div className={styles['activitydashboard-hero-ctas']}>
                <div className="mb-3 ml-auto">
                  <ThemeToggle />
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/books')}
                  className={styles['activitydashboard-hero-cta-primary']}
                >
                  <BookOpen size={18} />
                  Browse Books
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={styles['activitydashboard-hero-cta-secondary']}
                >
                  📚 Your Library
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={styles['activitydashboard-hero-cta-tertiary']}
                >
                  📖 View History
                </motion.button>
              </div>
            </div>

            <div className={styles['activitydashboard-hero-illustration']}>
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className={styles['activitydashboard-hero-illus-card']}
              >
                <BookOpen size={120} className="text-white opacity-80" />
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className={styles['activitydashboard-stats']}
        >
          {/* Reading Velocity */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-xl p-6 shadow-lg border border-blue-100 cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold uppercase tracking-wider text-blue-700">
                Reading Velocity
              </span>
              <Zap className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-3xl font-bold text-blue-900 mb-2">
              {stats?.readingVelocity || 0}
            </div>
            <p className="text-xs text-gray-600">pages per day</p>
            <div className="mt-3 h-2 bg-blue-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '75%' }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-blue-400 to-blue-600"
              />
            </div>
          </motion.div>

          {/* Current Streak */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-xl p-6 shadow-lg border border-orange-100 cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold uppercase tracking-wider text-orange-700">
                Current Streak
              </span>
              <Flame className="w-5 h-5 text-orange-500 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-3xl font-bold text-orange-900 mb-2">
              {stats?.currentStreak || 0}
            </div>
            <p className="text-xs text-gray-600">consecutive days</p>
            <div className="mt-3 flex gap-1">
              {[...Array(7)].map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 h-2 rounded-full ${
                    i < (stats?.currentStreak || 0) % 7
                      ? 'bg-orange-500'
                      : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </motion.div>

          {/* Books Read */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-xl p-6 shadow-lg border border-purple-100 cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold uppercase tracking-wider text-purple-700">
                Books Read
              </span>
              <BookOpen className="w-5 h-5 text-purple-500 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-3xl font-bold text-purple-900 mb-2">
              {stats?.booksRead || 0}
            </div>
            <p className="text-xs text-gray-600">this month</p>
            <div className="mt-3 space-y-1">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Progress</span>
                <span>60%</span>
              </div>
              <div className="h-2 bg-purple-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '60%' }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-purple-400 to-purple-600"
                />
              </div>
            </div>
          </motion.div>

          {/* Achievements */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-xl p-6 shadow-lg border border-pink-100 cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold uppercase tracking-wider text-pink-700">
                Achievements
              </span>
              <Star className="w-5 h-5 text-pink-500 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-3xl font-bold text-pink-900 mb-2">
              {stats?.achievements || 8}
            </div>
            <p className="text-xs text-gray-600">badges unlocked</p>
            <div className="mt-3 flex gap-2 flex-wrap">
              {['🔥', '📚', '⭐', '🏆'].map((emoji, i) => (
                <motion.span
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="text-lg"
                >
                  {emoji}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Recommendation Engine */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="mb-8"
        >
          <RecommendationEngine
            currentBookId={currentBook?.bookId || currentBook?.id || 1508}
          />
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* History Section */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-2"
          >
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <BookOpen className="w-6 h-6 text-indigo-600" />
                    Reading History
                  </h2>
                  <p className="text-gray-600 text-sm mt-1">
                    {history.length} books in your library
                  </p>
                </div>
              </div>

              {/* History Cards */}
              <div className="space-y-4">
                {history.length > 0 ? (
                  history.map((book, idx) => (
                    <motion.div
                      key={book.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <HistoryCard
                        book={book}
                        onDelete={() => {
                          setHistory(history.filter((b) => b.id !== book.id));
                          toast.success('Book removed from history');
                        }}
                      />
                    </motion.div>
                  ))
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-12 text-center"
                  >
                    <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-700 font-bold text-lg mb-2">
                      No books in your library yet
                    </p>
                    <p className="text-gray-500 text-sm">
                      Start by browsing books and adding them to your collection
                    </p>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Continue Reading Sidebar */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-1"
          >
            <div className="sticky top-8 space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Bookmark className="w-6 h-6 text-indigo-600" />
                Continue Reading
              </h2>

              {currentBook ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all"
                >
                  {/* Book Cover */}
                  <div className="h-64 w-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center overflow-hidden relative group">
                    {currentBook.coverUrl ? (
                      <img
                        src={currentBook.coverUrl}
                        alt={currentBook.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <BookOpen className="w-20 h-20 text-indigo-300" />
                    )}
                  </div>

                  {/* Book Info */}
                  <div className="p-6">
                    <h3 className="font-bold text-lg text-gray-900 line-clamp-2 mb-2">
                      {currentBook.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 font-medium">
                      {currentBook.author}
                    </p>

                    {/* Progress */}
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 mb-6 border border-indigo-200">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-gray-700 uppercase">
                          Reading Progress
                        </span>
                        <span className="text-sm font-bold text-indigo-600">
                          {Math.round(
                            ((currentBook.currentPage || 0) /
                              (currentBook.totalPages || 300)) *
                              100
                          )}
                          %
                        </span>
                      </div>
                      <ProgressBar
                        current={currentBook.currentPage || 0}
                        total={currentBook.totalPages || 300}
                      />
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                        <p className="text-xs text-blue-700 font-bold uppercase">
                          Pages Left
                        </p>
                        <p className="text-2xl font-bold text-blue-900 mt-1">
                          {currentBook.totalPages -
                            (currentBook.currentPage || 0)}
                        </p>
                      </div>
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                        <p className="text-xs text-purple-700 font-bold uppercase">
                          Category
                        </p>
                        <p className="text-sm font-bold text-purple-900 mt-1">
                          {currentBook.category || 'Fiction'}
                        </p>
                      </div>
                    </div>

                    {/* CTA Buttons */}
                    <div className="space-y-2">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() =>
                          navigate(
                            `/reading/${currentBook.bookId || currentBook.id}?page=${
                              currentBook.currentPage || 1
                            }`
                          )
                        }
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
                      >
                        <BookOpen className="w-5 h-5" />
                        Continue Reading
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-gray-100 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                      >
                        <ChevronRight className="w-4 h-4" />
                        View Details
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-2xl shadow-lg p-8 text-center border border-gray-100"
                >
                  <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 font-semibold mb-2">
                    No active reading
                  </p>
                  <p className="text-gray-500 text-sm">
                    Pick a book from the list to continue
                  </p>
                </motion.div>
              )}

              {/* Daily Goal Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-200 shadow-md"
              >
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-600" />
                  Today's Goal
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 text-sm font-medium">
                      Pages to read
                    </span>
                    <span className="font-bold text-indigo-600">25/30</span>
                  </div>
                  <div className="w-full h-2 bg-indigo-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '83%' }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                    />
                  </div>
                  <p className="text-xs text-gray-600 text-center mt-2">
                    Almost there! 💪 5 more pages to go
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
};

export default ActivityDashboard;
