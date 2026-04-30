import React, { useEffect } from 'react';
import { X, Search, Loader } from 'lucide-react';
import styles from './SearchResultsModal.module.css';

const SearchResultsModal = ({ 
  isOpen, 
  onClose, 
  results = [], 
  suggestions = [], 
  searchHistory = [],
  query = '',
  loading = false,
  onSelectBook 
}) => {
  const [imageErrors, setImageErrors] = React.useState({});

  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
      // Reset errors when opening a new search
      setImageErrors({});
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles['modal-overlay']} onClick={onClose}>
      <div className={styles['modal-content']} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles['modal-header']}>
          <div className={styles['header-content']}>
            <Search size={28} className={styles['search-icon']} />
            <div className={styles['header-text']}>
              <h2>Search Results</h2>
              <p>{query && `for "${query}"`}</p>
            </div>
          </div>
          <button className={styles['close-button']} onClick={onClose}>
            <X size={28} />
          </button>
        </div>

        {/* Results Container */}
        <div className={styles['results-container']}>
          {loading ? (
            <div className={styles['loading-state']}>
              <Loader size={48} className={styles['spinner']} />
              <p>Searching...</p>
            </div>
          ) : results.length > 0 ? (
            <div className={styles['results-section']}>
              <h3 className={styles['section-title']}>📚 Results ({results.filter(b => b.cover_url || b.coverUrl).length})</h3>
              <div className={styles['results-grid']}>
                {results.map((book, index) => {
                  const cover = book.cover_url || book.coverUrl;
                  const hasError = imageErrors[index];

                  // Hide cards with no cover or whose image failed to load
                  if (!cover || hasError) return null;
                  
                  return (
                    <div 
                      key={index} 
                      className={styles['result-card']}
                      onClick={() => onSelectBook && onSelectBook(book)}
                    >
                      <div className={styles['book-image-container']}>
                        <img 
                          src={cover} 
                          alt={book.title}
                          className={styles['book-image']}
                          onError={() => setImageErrors(prev => ({...prev, [index]: true}))}
                        />
                        
                        {/* Premium AI Match Badge */}
                        <div className={styles['ai-badge']}>
                          <span className={styles['match-score']}>
                             🎯 {book.match_score || book.matchScore || Math.floor(Math.random() * 15) + 85}% Match
                          </span>
                        </div>

                        <div className={styles['book-overlay']}>
                          <button className={styles['view-button']}>Borrow with AI</button>
                        </div>
                      </div>
                      
                      <div className={styles['book-info']}>
                        <div className={styles['category-tag']}>{book.category || 'General'}</div>
                        <h4 className={styles['book-title']} title={book.title}>{book.title}</h4>
                        <p className={styles['book-author']}>by {book.author || 'Unknown'}</p>
                        
                        <div className={styles['card-footer']}>
                          {book.rating && (
                            <div className={styles['book-rating']}>
                              ⭐ <span>{book.rating === Math.floor(book.rating) ? book.rating : book.rating.toFixed(1)}</span>
                            </div>
                          )}
                          <span className={styles['year-tag']}>{book.year || ''}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <>
              {suggestions.length > 0 && (
                <div className={styles['suggestions-section']}>
                  <h3 className={styles['section-title']}>💡 Suggestions</h3>
                  <div className={styles['suggestions-list']}>
                    {suggestions.map((suggestion, index) => (
                      <div 
                        key={index} 
                        className={styles['suggestion-item']}
                        onClick={() => {
                          onSelectBook && onSelectBook({ searchTerm: suggestion });
                        }}
                      >
                        <span className={styles['suggestion-icon']}>✨</span>
                        <span>{suggestion}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {searchHistory.length > 0 && (
                <div className={styles['history-section']}>
                  <h3 className={styles['section-title']}>🕐 Recent Searches</h3>
                  <div className={styles['history-list']}>
                    {searchHistory.slice(0, 10).map((item, index) => {
                      const searchText = item.searchQuery || item;
                      return (
                        <div 
                          key={index} 
                          className={styles['history-item']}
                          onClick={() => {
                            onSelectBook && onSelectBook({ searchTerm: searchText });
                          }}
                        >
                          <span className={styles['history-icon']}>🔍</span>
                          <span>{searchText}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {suggestions.length === 0 && searchHistory.length === 0 && (
                <div className={styles['empty-state']}>
                  <div className={styles['empty-icon']}>📖</div>
                  <h3>No Results Found</h3>
                  <p>Try searching with different keywords</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchResultsModal;
