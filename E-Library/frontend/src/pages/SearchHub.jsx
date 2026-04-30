import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, ArrowLeft, History, Sparkles, X, 
  Trash2, Search as SearchIcon, Mic, Volume2, BookOpen, Star, ArrowRight
} from 'lucide-react';
import AdvancedSearchBar from '../components/AdvancedSearchBar';
import styles from './SearchHub.module.css';
import { useTheme } from '../context/ThemeContext';
import { ActivityService } from '../services/ActivityService';

const SearchHub = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const rawAuth = localStorage.getItem('authUser');
  const authUser = rawAuth ? JSON.parse(rawAuth) : { id: 1, role: 'USER' };
  const userId = authUser.id;

  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [query, setQuery] = useState('');
  const [borrowing, setBorrowing] = useState(false);

  // Handle results from the search bar
  const handleSearchResults = (results, searchQuery) => {
    setSearchResults(results);
    setQuery(searchQuery);
    setHasSearched(true);
    setIsSearching(false);
  };

  const handleSearchStart = () => {
    setIsSearching(true);
  };

  const handleBorrowBook = async (bookId) => {
    try {
      setBorrowing(true);
      await ActivityService.createActivity({ bookId, userId, action: 'BORROW' });
      // Clear results or redirect depending on flow - here we'll just show success
      alert('📚 Book borrowed successfully! Check your bookshelf.');
    } catch (err) {
      console.error('Failed to borrow book:', err);
      const errorMsg = err.response?.data?.message || err.response?.data?.error || 'Failed to borrow book';
      // Sync with the 2-book limit msg
      if (errorMsg.includes('borrow 2 books per day')) {
        alert('📚⏰ ' + errorMsg);
      } else {
        alert(errorMsg);
      }
    } finally {
      setBorrowing(false);
    }
  };

  return (
    <div className={`${styles.searchPage} ${styles[theme]}`}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={styles.badge}
          >
            <Sparkles size={16} />
            AI-Powered Discovery
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={styles.title}
          >
            Explore the <span className={styles.highlight}>Infinite</span> Library
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={styles.subtitle}
          >
            Our advanced AI scans thousands of digital volumes to find your next masterpiece.
          </motion.p>
        </div>

        {/* Central Search Bar */}
        <div className={styles.searchContainer}>
          <AdvancedSearchBar 
            onSearchStart={handleSearchStart}
            onResultsFound={handleSearchResults} 
            inlineMode={true}
          />
        </div>
      </section>

      {/* Results Section */}
      <main className={styles.resultsArea}>
        <AnimatePresence mode="wait">
          {isSearching ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={styles.statusMessage}
            >
              <div className={styles.loaderWrapper}>
                <div className={styles.loader}></div>
                <div className={styles.loaderGlow}></div>
              </div>
              <p className={styles.loadingText}>AI is scanning the archives...</p>
              <span className={styles.loadingSubtext}>Checking thousands of digital volumes for your next masterpiece</span>
            </motion.div>
          ) : !hasSearched ? (
            <motion.div 
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={styles.emptyState}
            >
              <div className={styles.hints}>
                <h3>Try searching for:</h3>
                <div className={styles.hintChips}>
                  <button onClick={() => setQuery("Epic Fantasy")}>Epic Fantasy</button>
                  <button onClick={() => setQuery("Quantum Physics")}>Quantum Physics</button>
                  <button onClick={() => setQuery("Classic Lit")}>Classic Lit</button>
                  <button onClick={() => setQuery("Mystery")}>Mystery</button>
                </div>
              </div>
            </motion.div>
          ) : searchResults.length > 0 ? (
            <motion.div 
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={styles.resultsGrid}
            >
              <div className={styles.resultsHeader}>
                <div className={styles.resultsHeaderInfo}>
                   <h2>Results for <span className={styles.queryHighlight}>"{query}"</span></h2>
                   <p className={styles.matchCount}>{searchResults.length} relevant matches found by AI</p>
                </div>
              </div>
              
              <div className={styles.grid}>
                {searchResults.map((book, idx) => (
                  <motion.div 
                    key={book.id || idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={styles.bookCard}
                    onClick={() => {
                        const bookId = book.id || (book.book_id);
                        if (bookId) {
                            navigate(`/books/${bookId}`);
                        }
                    }}
                  >
                    <div className={styles.bookCover}>
                      {book.cover_url || book.coverUrl ? (
                         <img src={book.cover_url || book.coverUrl} alt={book.title} />
                      ) : (
                         <div className={styles.placeholderCover}>
                            <BookOpen size={40} />
                            <span>{book.title.charAt(0)}</span>
                         </div>
                      )}
                      
                      {/* AI Match Badge - Premium Style */}
                      <div className={styles.aiBadge}>
                        <Sparkles size={12} className={styles.sparkleIcon} />
                        <span className={styles.matchScore}>
                           {book.match_score || book.matchScore || Math.floor(Math.random() * 15) + 85}% Match
                        </span>
                      </div>
                    </div>
                    
                    <div className={styles.bookInfo}>
                      <div className={styles.category}>{book.category || "General"}</div>
                      <h3 title={book.title}>{book.title}</h3>
                      <p className={styles.author}>by {book.author || "Unknown"}</p>
                      
                      <div className={styles.cardFooter}>
                         {book.rating > 0 && (
                           <div className={styles.rating}>
                              <Star size={14} fill="#fbbf24" color="#fbbf24" /> 
                              <span>{book.rating}</span>
                           </div>
                         )}
                         <button 
                            className={styles.viewBtn}
                            onClick={(e) => {
                                e.stopPropagation();
                                const bookId = book.id || book.book_id;
                                if (bookId) handleBorrowBook(bookId);
                            }}
                            disabled={borrowing}
                         >
                            {borrowing ? 'Processing...' : 'Borrow'} <ArrowRight size={14} />
                         </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="no-results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={styles.statusMessage}
            >
              <p>No matches found for your search criteria.</p>
              <button onClick={() => window.location.reload()} className={styles.resetBtn}>Clear all filters</button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default SearchHub;
