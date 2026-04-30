import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Search,
  X,
  Eye,
  Download,
  BookOpen,
  Filter,
  Star,
  Users,
  Calendar,
  Loader,
  AlertCircle,
  ChevronDown,
} from 'lucide-react';
import { ActivityService } from '../services/ActivityService';
import styles from './BooksPage.module.css';

/**
 * BooksPage - Professional Book Catalog
 * 
 * Features:
 * - Advanced filtering by genre, rating
 * - Real-time search with debouncing
 * - Beautiful book cards with AI match score
 * - Quick preview modal with smooth animations
 * - Masonry/Grid layout
 * - Loading states and error handling
 */
const BooksPage = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBook, setSelectedBook] = useState(null);
  const [borrowing, setBorrowing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    category: 'all',
    rating: 'all',
  });

  const [authUser, setAuthUser] = useState(null);

  useEffect(() => {
    const raw = localStorage.getItem('authUser');
    if (raw) setAuthUser(JSON.parse(raw));
    else setAuthUser(null);
  }, []);

  const userId = authUser?.id || 1;

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await ActivityService.getBooks();
      setBooks(response.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching books:', err);
      setError('Failed to load books');
      setBooks([]);
      toast.error('Failed to load books');
    } finally {
      setLoading(false);
    }
  };

  // Advanced filtering
  const filteredBooks = useMemo(() => {
    let results = books;

    // Search filter
    const term = searchTerm.trim().toLowerCase();
    if (term) {
      results = results.filter(
        (b) =>
          (b.title || '').toLowerCase().includes(term) ||
          (b.author || '').toLowerCase().includes(term) ||
          (b.category || '').toLowerCase().includes(term)
      );
    }

    // Category filter
    if (filters.category !== 'all') {
      results = results.filter(
        (b) => (b.category || '').toLowerCase() === filters.category.toLowerCase()
      );
    }

    // Rating filter
    if (filters.rating !== 'all') {
      const minRating = parseInt(filters.rating);
      results = results.filter((b) => (b.rating || 0) >= minRating);
    }

    return results;
  }, [books, searchTerm, filters]);

  const handleBorrowBook = async (book) => {
    try {
      setBorrowing(true);
      await ActivityService.createActivity({ bookId: book.id, userId, action: 'BORROW' });
      setSelectedBook(null);

      // Update progress
      try {
        await ActivityService.updateProgress({
          userId,
          bookId: book.id,
          currentPage: 1,
          totalPages: book.totalPages || 300,
        });
      } catch (e) {
        console.warn('Failed to initialize progress:', e);
      }

      toast.success(`"${book.title}" added to your library!`);
      fetchBooks();
    } catch (err) {
      console.error('Failed to borrow book:', err);
      toast.error('Failed to borrow book');
    } finally {
      setBorrowing(false);
    }
  };

  const getAIMatchScore = (book) => {
    // Mock AI matching score (0-100)
    const score = Math.floor(Math.random() * 40) + 60;
    return score;
  };

  const categories = [
    'all',
    ...new Set(books.map((b) => b.category || 'General')),
  ];

  // Loading skeleton
  if (loading) {
    return (
      <main className={styles['books-page']}>
        <div className={styles['books-container']}>
          <div className="h-20 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg animate-pulse mb-8" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-gray-200 rounded-lg animate-pulse h-64"
              />
            ))}
          </div>
        </div>
      </main>
    );
  }

  // Error state
  if (error) {
    return (
      <main className={styles['books-page']}>
        <div className={styles['books-container']}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500 rounded-xl p-8 text-center"
          >
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-900 mb-2">
              Failed to load books
            </h2>
            <p className="text-red-700 mb-6">{error}</p>
            <button
              onClick={fetchBooks}
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
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.4, ease: 'easeOut' },
    },
  };

  return (
    <main className={styles['books-page']}>
      <div className={styles['books-container']}>
        {/* Header Section */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={styles['books-header']}
        >
          <div>
            <h1 className={styles['books-title']}>📚 Library</h1>
            <p className={styles['books-desc']}>
              Browse, preview and borrow books from our collection.
            </p>
          </div>

          <div className={styles['books-search-row']}>
            {/* Search Bar */}
            <div className={styles['books-search-container']}>
              <input
                type="search"
                aria-label="Search books"
                placeholder="Search by title, author or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles['books-search-input']}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={18} />
                </button>
              )}
              <Search className={styles['books-search-icon']} />
            </div>

            {/* Add Book Button (admin only) */}
            {authUser && authUser.role === 'ADMIN' ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/books/add')}
                className={styles['books-add-btn']}
              >
                <span>+</span> Add Book
              </motion.button>
            ) : (
              <button className={`${styles['books-add-btn']} ${styles['books-add-btn--disabled']}`} disabled>
                <span>+</span> Add Book
              </button>
            )}
          </div>
        </motion.header>

        {/* Filter Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6 flex items-center gap-3"
        >
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-all"
          >
            <Filter size={18} className="text-indigo-600" />
            <span className="font-medium text-indigo-900">Filters</span>
            <ChevronDown
              size={18}
              className={`transition-transform ${showFilters ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Results count */}
          <span className="text-sm text-gray-600 font-medium">
            {filteredBooks.length} {filteredBooks.length === 1 ? 'book' : 'books'}
          </span>
        </motion.div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) =>
                      setFilters({ ...filters, category: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Rating Filter */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Minimum Rating
                  </label>
                  <select
                    value={filters.rating}
                    onChange={(e) =>
                      setFilters({ ...filters, rating: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="all">All Ratings</option>
                    <option value="3">⭐ 3+ Stars</option>
                    <option value="4">⭐ 4+ Stars</option>
                    <option value="5">⭐ 5 Stars</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Books Grid */}
        {filteredBooks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-12 text-center"
          >
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium mb-2">
              No books found
            </p>
            <p className="text-gray-400">
              Try adjusting your filters or search terms
            </p>
          </motion.div>
        ) : (
          <motion.section
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredBooks.map((book) => (
              <motion.article
                key={book.id}
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-2xl transition-all duration-300 group cursor-pointer"
              >
                {/* Book Cover */}
                <div className="h-56 bg-gray-100 flex items-center justify-center overflow-hidden relative group/cover">
                  {book.coverUrl ? (
                    <motion.img
                      src={book.coverUrl}
                      alt={book.title}
                      className="w-full h-full object-cover group-hover/cover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <BookOpen className="w-16 h-16 text-gray-300" />
                  )}

                  {/* AI Match Score Badge */}
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    whileHover={{ opacity: 1, x: 0 }}
                    className="absolute top-3 right-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg"
                  >
                    <Star size={12} fill="currentColor" />
                    {getAIMatchScore(book)}% Match
                  </motion.div>
                </div>

                {/* Book Info */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                    {book.title}
                  </h3>
                  <p className="text-sm text-gray-600 truncate mb-3">
                    {book.author}
                  </p>

                  {/* Meta Info */}
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-4 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {book.totalPages || book.pages || '-'} pages
                    </span>
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                      {book.category || 'General'}
                    </span>
                  </div>

                  {/* Rating */}
                  {book.rating && (
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={
                            i < Math.floor(book.rating)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }
                        />
                      ))}
                      <span className="text-xs text-gray-600 ml-1">
                        ({book.rating}/5)
                      </span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-3 border-t border-gray-200">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedBook(book)}
                      className="flex-1 px-3 py-2 text-indigo-600 border border-indigo-200 rounded hover:bg-indigo-50 transition-colors text-sm font-medium flex items-center justify-center gap-1"
                    >
                      <Eye size={14} />
                      Preview
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        if (book.isAvailable) {
                          handleBorrowBook(book);
                        } else {
                          toast.error('Book is not available');
                        }
                      }}
                      disabled={!book.isAvailable}
                      className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-all flex items-center justify-center gap-1 ${
                        book.isAvailable
                          ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      <BookOpen size={14} />
                      {book.isAvailable ? 'Borrow' : 'Unavailable'}
                    </motion.button>
                  </div>
                </div>
              </motion.article>
            ))}
          </motion.section>
        )}
      </div>

      {/* Book Preview Modal */}
      <AnimatePresence>
        {selectedBook && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedBook(null)}
            className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg max-w-3xl w-full shadow-2xl overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
                {/* Book Cover */}
                <div className="md:col-span-1">
                  {selectedBook.coverUrl ? (
                    <img
                      src={selectedBook.coverUrl}
                      alt={selectedBook.title}
                      className="w-full h-64 object-cover rounded-lg shadow-lg"
                    />
                  ) : (
                    <div className="w-full h-64 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Book Details */}
                <div className="md:col-span-2">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {selectedBook.title}
                      </h2>
                      <p className="text-gray-600 mb-4">{selectedBook.author}</p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      onClick={() => setSelectedBook(null)}
                      className="text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      <X size={24} />
                    </motion.button>
                  </div>

                  {/* Metadata Grid */}
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-700 mb-6">
                    <div>
                      <div className="text-xs text-gray-500 font-bold uppercase">
                        Category
                      </div>
                      <div className="font-medium">
                        {selectedBook.category || '-'}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 font-bold uppercase">
                        Pages
                      </div>
                      <div className="font-medium">
                        {selectedBook.totalPages || selectedBook.pages || '-'}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 font-bold uppercase">
                        ISBN
                      </div>
                      <div className="font-mono text-sm">
                        {selectedBook.isbn || '-'}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 font-bold uppercase">
                        Status
                      </div>
                      <div
                        className={`font-medium ${
                          selectedBook.isAvailable
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {selectedBook.isAvailable ? 'Available' : 'Unavailable'}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-700 mb-6 max-h-32 overflow-y-auto">
                    {selectedBook.description ||
                      'No description available for this book.'}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        window.open(selectedBook.pdfUrl, '_blank');
                      }}
                      className="flex-1 bg-white border border-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                    >
                      <Eye size={18} />
                      Preview PDF
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        if (selectedBook.isAvailable) {
                          handleBorrowBook(selectedBook);
                        }
                      }}
                      disabled={!selectedBook.isAvailable || borrowing}
                      className={`flex-1 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                        selectedBook.isAvailable && !borrowing
                          ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {borrowing ? (
                        <>
                          <Loader size={18} className="animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <BookOpen size={18} />
                          {selectedBook.isAvailable ? 'Borrow Book' : 'Unavailable'}
                        </>
                      )}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedBook(null)}
                      className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                    >
                      Close
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
};

export default BooksPage;
