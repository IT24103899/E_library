import React, { useState, useEffect } from 'react';
import { 
  Search, Mic, MicOff, Loader, X, Clock, Trash2, Filter, 
  HelpCircle, Sparkles, Star, CalendarDays, BookOpen, 
  History, Music, Heart, Sword, Ghost, Zap, SortAsc, 
  Clock3, Languages, Smile
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getApiUrl, getRankerUrl } from '../config/ApiConfig';
import styles from './AdvancedSearchBar.module.css';
import SearchResultsModal from './SearchResultsModal';

const API = getApiUrl(); // already ends with /api

const AdvancedSearchBar = ({ onResultsFound, onSearchStart, inlineMode = false }) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [isListening, setIsListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [debounceTimeout, setDebounceTimeout] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({
    author: searchParams.get('author') || '',
    minRating: parseFloat(searchParams.get('minRating') || '0'),
    fromYear: searchParams.get('fromYear') || '',
    toYear: searchParams.get('toYear') || '',
    genres: searchParams.get('genres')?.split(',') || [],
    sortBy: searchParams.get('sortBy') || 'relevance',
    intensity: searchParams.get('intensity') || 'all',
    mood: searchParams.get('mood') || 'all'
  });

  const [authUser, setAuthUser] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const raw = localStorage.getItem('authUser');
    let currentUser = null;
    if (raw) {
      currentUser = JSON.parse(raw);
      setAuthUser(currentUser);
    }
    
    // Load search history from localStorage immediately
    const savedHistory = localStorage.getItem('searchHistory');
    if (savedHistory) {
      try {
        setSearchHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.warn("Failed to load search history:", e);
      }
    }

    // Connect to database to sync search history natively
    if (currentUser?.id) {
       fetch(`${API}/search-history/${currentUser.id}`)
         .then(res => res.ok ? res.json() : [])
         .then(data => {
            if (Array.isArray(data) && data.length > 0) {
                setSearchHistory(data);
                localStorage.setItem('searchHistory', JSON.stringify(data));
            }
         })
         .catch(err => console.warn("Could not sync search history from DB:", err));
    }

    // Listener for storage changes (for premium status updates)
    const handleStorageChange = () => {
      const updatedRaw = localStorage.getItem('authUser');
      if (updatedRaw) setAuthUser(JSON.parse(updatedRaw));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const USER_ID = authUser?.id || null;

  // Popular searches for suggestions
  const popularSearches = [
    'Mystery thriller',
    'Fantasy adventure',
    'Romantic comedy',
    'Science fiction',
    'Historical fiction',
    'Self-help books',
    'Biography',
    'Horror novels'
  ];

  const ERAS = [
    { label: 'All Time', from: '', to: '' },
    { label: '2020s', from: '2020', to: '2029' },
    { label: '2010s', from: '2010', to: '2019' },
    { label: '2000s', from: '2000', to: '2009' }
  ];

  const GENRES = [
    { id: 'mystery', label: 'Mystery', icon: <Search size={14} /> },
    { id: 'fantasy', label: 'Fantasy', icon: <Sword size={14} /> },
    { id: 'romance', label: 'Romance', icon: <Heart size={14} /> },
    { id: 'scifi', label: 'Sci-Fi', icon: <Zap size={14} /> },
    { id: 'nonfiction', label: 'Non-Fiction', icon: <BookOpen size={14} /> },
    { id: 'horror', label: 'Horror', icon: <Ghost size={14} /> },
    { id: 'history', label: 'History', icon: <History size={14} /> }
  ];

  const MOODS = ['All', 'Inspiring', 'Dark', 'Thrilling', 'Educational', 'Relaxing'];
  
  const INTENSITY = [
    { id: 'all', label: 'Any' },
    { id: 'short', label: 'Quick (<2h)' },
    { id: 'medium', label: 'Balanced' },
    { id: 'long', label: 'Long (6h+)' }
  ];

  const SORT_OPTIONS = [
    { id: 'relevance', label: 'Relevance', icon: <Sparkles size={14} /> },
    { id: 'rating', label: 'Top Rated', icon: <Star size={14} /> },
    { id: 'newest', label: 'Newest', icon: <Clock3 size={14} /> }
  ];

  useEffect(() => {
    if (authUser && searchParams.toString() && results.length === 0) {
      handleSearch(query, filters);
    }
  }, [authUser]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchSearchHistory = async () => {
    // Already loaded in main useEffect, this is kept for compatibility
    if (!USER_ID) {
      console.warn("USER_ID not available yet");
      return;
    }

    try {
      const response = await fetch(`${API}/search-history/${USER_ID}`);
      if (response.ok) {
        const data = await response.json();
        const history = Array.isArray(data) ? data : [];
        setSearchHistory(history);
        localStorage.setItem('searchHistory', JSON.stringify(history));
      } else {
        console.warn(`Failed to fetch search history: ${response.status}`);
      }
    } catch (error) {
      console.warn("Error fetching search history:", error);
    }
  };

  const clearSearchHistory = async () => {
    // Clear from localStorage
    localStorage.removeItem('searchHistory');
    setSearchHistory([]);
    
    // Try to clear from database too
    try {
      if (USER_ID) {
        await fetch(`${API}/search-history/user/${USER_ID}`, {
          method: 'DELETE'
        });
      }
    } catch (e) {
      console.warn("Could not clear database history:", e);
    }
    console.log("Search history cleared");
  };

  // Save search to both localStorage and database
  const addToSearchHistory = async (searchQuery) => {
    if (!searchQuery || searchQuery.trim() === '') return;
    
    const trimmedQuery = searchQuery.trim();
    
    // Save to localStorage (primary storage) without id yet
    const newEntry = { searchQuery: trimmedQuery, timestamp: new Date().toISOString() };
    const updated = [
      newEntry,
      ...searchHistory.filter(h => h.searchQuery !== trimmedQuery)
    ].slice(0, 10); // Keep only last 10 searches
    
    setSearchHistory(updated);
    localStorage.setItem('searchHistory', JSON.stringify(updated));
    
    // Save to database and capture returned id
    try {
      const user = JSON.parse(localStorage.getItem('authUser')) || authUser;
      if (user?.id) {
        const response = await fetch(`${API}/search-history`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            searchQuery: trimmedQuery
          })
        });
        if (response.ok) {
          const saved = await response.json();
          // Update the entry with the DB-assigned id so delete works immediately
          const withId = updated.map(h =>
            h.searchQuery === trimmedQuery && !h.id ? { ...h, id: saved.id } : h
          );
          setSearchHistory(withId);
          localStorage.setItem('searchHistory', JSON.stringify(withId));
        } else {
          const errorData = await response.text();
          console.warn(`Failed to save search history (${response.status}):`, errorData);
        }
      }
    } catch (err) {
      console.warn('Failed to save search history to database:', err);
    }
  };

  const deleteHistoryItem = async (e, id, searchQuery) => {
    e.stopPropagation();
    
    // Remove from localStorage and state
    const updated = searchHistory.filter(h => h.searchQuery !== searchQuery);
    setSearchHistory(updated);
    localStorage.setItem('searchHistory', JSON.stringify(updated));
    
    // Hard delete from database
    const user = JSON.parse(localStorage.getItem('authUser')) || authUser;
    try {
      if (id) {
        // Prefer deleting by id (exact row)
        await fetch(`${API}/search-history/item/${id}`, { method: 'DELETE' });
      } else if (user?.id) {
        // Fallback: delete by userId + searchQuery
        await fetch(`${API}/search-history/query`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, searchQuery })
        });
      }
    } catch (error) {
      console.warn('Error deleting from database:', error);
    }
  };

  // FEATURE 2: Generate suggestions based on input (including search history)
  const generateSuggestions = (input) => {
    if (!input.trim()) {
      // Show search history first, then popular searches
      const combined = [];
      
      // Add recent search history at the beginning
      if (searchHistory && searchHistory.length > 0) {
        searchHistory.slice(0, 5).forEach(history => {
          combined.push(history.searchQuery);
        });
      }
      
      // Add popular searches
      popularSearches.forEach(search => {
        if (!combined.includes(search)) {
          combined.push(search);
        }
      });
      
      setSuggestions(combined);
      return;
    }

    // Combine popularSearches and search history, then filter
    const combined = [...popularSearches];
    
    // Add search history items that match
    if (searchHistory && searchHistory.length > 0) {
      searchHistory.forEach(history => {
        const searchQuery = history.searchQuery || history;
        if (!combined.includes(searchQuery) && searchQuery.toLowerCase().includes(input.toLowerCase())) {
          combined.unshift(searchQuery); // Add history items at the beginning
        }
      });
    }

    const filtered = combined.filter(search =>
      search.toLowerCase().includes(input.toLowerCase())
    );
    setSuggestions(filtered);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setHasSearched(false);
    
    // Clear results when search bar is emptied
    if (!value.trim()) {
      setResults([]);
      setShowModal(false);
      // Also clear inline mode results
      if (inlineMode && onResultsFound) {
        onResultsFound([], '');
      }
    }
    
    if (debounceTimeout) clearTimeout(debounceTimeout);
    
    const newTimeout = setTimeout(() => {
      generateSuggestions(value);
    }, 300);
    setDebounceTimeout(newTimeout);
    
    setShowSuggestions(true);
  };

  // FEATURE 7: Parse advanced query syntax
  const parseAdvancedQuery = (queryString) => {
    const queryObj = {
      include: [],
      exclude: [],
      exact: null
    };

    // Extract exact phrase: "exact text"
    const exactMatch = queryString.match(/"([^"]+)"/);
    if (exactMatch) {
      queryObj.exact = exactMatch[1];
      queryString = queryString.replace(/"[^"]+"/g, '').trim();
    }

    // Split by OR
    const orTerms = queryString.split(/\bOR\b/i).map(t => t.trim());
    
    if (orTerms.length > 1) {
      queryObj.include = orTerms;
    } else {
      // Extract excluded terms: -word
      const parts = queryString.split(/\s+/);
      parts.forEach(part => {
        if (part.startsWith('-')) {
          queryObj.exclude.push(part.substring(1));
        } else {
          queryObj.include.push(part);
        }
      });
    }

    return queryObj;
  };

  // --- 1. THE VOICE RECOGNITION MAGIC ---
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      alert("Your browser does not support Voice Search. Please use Google Chrome or Microsoft Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    
    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      handleSearch(transcript);
    };

    recognition.onerror = (event) => {
      console.error("Voice recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  // --- 2. TALKING TO YOUR FLASK AI ---
  const handleSearch = async (searchQuery = query, currentFilters = filters) => {
    if (!searchQuery.trim() && Object.values(currentFilters).every(val => !val || val === 0)) return;

    // Save to search history
    if (searchQuery.trim()) {
      await addToSearchHistory(searchQuery);
    }

    setLoading(true);
    if (onSearchStart) onSearchStart();
    setResults([]);
    setShowHistory(false);
    setShowSuggestions(false);
    setHasSearched(true);

    // Update URL params
    const newParams = new URLSearchParams();
    if (searchQuery) newParams.set('q', searchQuery);
    Object.entries(currentFilters).forEach(([key, value]) => {
      if (value && value !== 0) newParams.set(key, value);
    });
    setSearchParams(newParams);

    // Format query with filters for history
    let filterStrItems = [];
    if (currentFilters.author) filterStrItems.push(`Auth: ${currentFilters.author}`);
    if (currentFilters.minRating > 0) filterStrItems.push(`${currentFilters.minRating}+⭐`);
    if (currentFilters.fromYear && currentFilters.toYear) filterStrItems.push(`${currentFilters.fromYear}s`);
    
    let historyStr = searchQuery;
    if (filterStrItems.length > 0) {
      if (!historyStr) {
         historyStr = `Filters Only (${filterStrItems.join(', ')})`;
      } else {
         historyStr += ` (${filterStrItems.join(', ')})`;
      }
    }
    // Save search to history
    if (historyStr) {
      await addToSearchHistory(historyStr);
    }
    const parsedQuery = parseAdvancedQuery(searchQuery);
    let data = null; // Declare outside try block

    try {
      // Build filter params
      let filterParams = {
        title: searchQuery,
        description: searchQuery
      };

      if (currentFilters.author) filterParams.author = currentFilters.author;
      if (currentFilters.minRating) filterParams.min_rating = currentFilters.minRating;
      if (currentFilters.fromYear) filterParams.from_year = currentFilters.fromYear;
      if (currentFilters.toYear) filterParams.to_year = currentFilters.toYear;
      if (currentFilters.genres?.length > 0) filterParams.genres = currentFilters.genres.join(',');
      if (currentFilters.sortBy) filterParams.sort_by = currentFilters.sortBy;
      if (currentFilters.intensity !== 'all') filterParams.intensity = currentFilters.intensity;
      if (currentFilters.mood !== 'all') filterParams.mood = currentFilters.mood;

      const mlUrl = getRankerUrl();
      const response = await fetch(`${mlUrl}/recommend/text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filterParams)
      });

      data = await response.json();
      
      if (data.recommendations) {
        let filteredResults = data.recommendations;

        // Apply advanced query syntax
        if (parsedQuery.exact) {
          filteredResults = filteredResults.filter(book =>
            book.title?.toLowerCase().includes(parsedQuery.exact.toLowerCase()) ||
            book.author?.toLowerCase().includes(parsedQuery.exact.toLowerCase())
          );
        }

        // Exclude terms
        if (parsedQuery.exclude.length > 0) {
          filteredResults = filteredResults.filter(book => {
            return !parsedQuery.exclude.some(excluded =>
              book.title?.toLowerCase().includes(excluded.toLowerCase()) ||
              book.author?.toLowerCase().includes(excluded.toLowerCase())
            );
          });
        }

        // Limit to top 20 like in the Bookshelf
        setResults(filteredResults.slice(0, 20));
      }
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
      generateSuggestions(searchQuery); // Generate suggestions to show in modal
      
      if (inlineMode && onResultsFound) {
        onResultsFound(data?.recommendations || [], searchQuery);
      } else {
        setShowModal(true);
      }
    }
  };

  // Allow pressing "Enter" to search
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSearch(query, filters);
  };

  return (
    <div className={styles['advanced-search-container']}>
      
      {/* The Search Bar & Filter Button */}
      <div className="flex w-full items-center">
        <div className={`${styles['search-input-wrapper']} w-full flex items-center`}>
          
          <div className={`${styles['search-icon']} pl-2 md:pl-4 pr-1 md:pr-2 text-slate-400`}>
            <Search size={20} />
          </div>
          
          <input 
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            onFocus={() => {
              setShowHistory(true);
              if (query.length > 0) setShowSuggestions(true);
            }}
            onBlur={() => setTimeout(() => {
              setShowHistory(false);
              setShowSuggestions(false);
            }, 200)}
            placeholder={isListening ? "Listening..." : (isMobile ? "AI Deep Search..." : "Search: Harry OR Percy | -romance | \"exact title\"")}
            className={styles['search-input']}
          />

          {query && (
            <button onClick={() => { 
                setQuery(''); 
                setResults([]); 
                setSuggestions([]); 
                setHasSearched(false);
                setShowHistory(true);
              }} 
              className={`${styles['control-button']} pr-1 md:pr-2`}
            >
              <X size={18} />
            </button>
          )}

          {/* The Voice Button with Neural Pulse */}
          <div className={`${styles['voice-container']} ${isListening ? styles['listening'] : ''}`}>
            {isListening && <div className={styles['wave-pulse']}></div>}
            <button 
              onClick={isListening ? null : startListening}
              className={`${styles['voice-button']} ${isListening ? styles['active'] : ''}`}
            >
              {isListening ? (
                <div className={styles['listening-dots']}>
                  <span></span><span></span><span></span>
                </div>
              ) : <Mic size={20} />}
            </button>
          </div>

          <div className={styles['action-buttons-group']}>
            {/* History Toggle Button */}
            {searchHistory.length > 0 && (
              <button
                onClick={() => {
                  setShowHistory(!showHistory);
                  if (!showHistory && query) setQuery('');
                }}
                className={`${styles['control-button']} ${styles['compact-icon']} ${showHistory ? styles['active'] : ''}`}
                title="Search History"
              >
                <Clock size={18} />
              </button>
            )}

            {/* Filter Toggle Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`${styles['control-button']} ${styles['compact-icon']} ${showFilters ? styles['active'] : ''} relative`}
              title="Advanced Filters"
            >
              <Filter size={18} />
              {/* Notification Dot if filters are active */}
              {!showFilters && (filters.author || filters.minRating > 0 || filters.fromYear) && (
                <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-amber-500 border-2 border-slate-900 rounded-full"></span>
              )}
            </button>

            {/* Query Syntax Help - Hidden on mobile text wrap */}
            <div className={`relative group ${styles['hide-on-mobile']}`}>
              <button className={`${styles['control-button']} ${styles['compact-icon']}`}>
                <HelpCircle size={18} />
              </button>
              <div className="absolute bottom-full right-0 mb-2 bg-slate-900 text-white text-xs p-3 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                <p className="font-bold mb-1">Query Syntax:</p>
                <p>•  OR: search1 OR search2</p>
                <p>•  Exclude: -word</p>
                <p>•  Exact: "exact phrase"</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Search Suggestions & History Dropdown */}
      {(showHistory || showSuggestions) && (searchHistory.length > 0 || suggestions.length > 0) && (
        <div className={styles['suggestions-dropdown']}>
          {/* History Section */}
          {searchHistory.length > 0 && showHistory && !query && (
            <>
              <div className={styles['dropdown-header']}>Recent Searches</div>
              {searchHistory.map((item, idx) => (
                <div 
                  key={idx} 
                  className={styles['suggestion-item']}
                  onMouseDown={() => {
                    setQuery(item.searchQuery);
                    handleSearch(item.searchQuery, filters);
                  }}
                >
                  <Clock size={16} className={styles['suggestion-icon']} />
                  <span className={styles['suggestion-text']}>{item.searchQuery}</span>
                  <button 
                    className={styles['suggestion-delete']}
                    onMouseDown={(e) => deleteHistoryItem(e, item.id, item.searchQuery)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </>
          )}

          {/* AI Suggestions Section */}
          {suggestions.length > 0 && showSuggestions && query && (
            <>
              <div className={styles['dropdown-header']}>AI Power suggestions</div>
              {suggestions.map((text, idx) => (
                <div 
                  key={idx} 
                  className={styles['suggestion-item']}
                  onMouseDown={() => {
                    setQuery(text);
                    handleSearch(text, filters);
                  }}
                >
                  <Sparkles size={16} className={styles['suggestion-icon']} />
                  <span className={styles['suggestion-text']}>{text}</span>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/40 p-6 z-40">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Sparkles size={20} className="text-indigo-600" />
              Intelligence Filters
              {!authUser?.isPremium && <span className="ml-2 text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">💎 PRE-ORDER</span>}
            </h3>
            
            {(filters.author || filters.minRating > 0 || filters.fromYear || filters.genres.length > 0 || filters.mood !== 'all') && (
              <button
                onClick={() => {
                  setFilters({ author: '', minRating: 0, fromYear: '', toYear: '', genres: [], sortBy: 'relevance', intensity: 'all', mood: 'all' });
                  setSearchParams(new URLSearchParams());
                  setResults([]);
                  setHasSearched(false);
                  setQuery('');
                }}
                className="text-xs font-bold text-red-500 hover:text-red-700 bg-red-50 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1"
              >
                <Trash2 size={14} /> Reset
              </button>
            )}
          </div>
          
          <div className={`space-y-6 relative ${!authUser?.isPremium ? 'opacity-40 pointer-events-none grayscale-[0.5]' : ''}`}>
            {/* Lock Overlay for non-premium */}
            {!authUser?.isPremium && (
              <div className={styles['premium-lock-overlay']}>
                <div className={styles['lock-card']}>
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                    <Sparkles size={24} />
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-slate-800 uppercase text-[10px] tracking-widest text-amber-600 mb-1">Intelligence</p>
                    <p className="font-bold text-slate-800 text-sm">Scholar Feature</p>
                    <p className="text-[11px] text-slate-500 mt-1">Unlock advanced AI-powered filters.</p>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/payment');
                    }}
                    className="mt-2 bg-slate-900 hover:bg-black text-white text-[11px] font-bold px-5 py-2.5 rounded-full transition-all hover:scale-105 active:scale-95 shadow-lg shadow-black/10"
                  >
                    Upgrade Now
                  </button>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              {/* Left Column */}
              <div className="space-y-8">
                {/* Minimum Rating */}
                <div>
                   <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Star size={14} className="text-amber-500" /> Minimum Rating
                   </label>
                   <div className="flex gap-2 bg-slate-100/50 p-1.5 rounded-xl inline-flex border border-slate-200/50">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFilters({ ...filters, minRating: filters.minRating === star ? 0 : star })}
                          className={`p-2 rounded-lg transition-all ${filters.minRating >= star ? 'text-amber-500 bg-white shadow-sm' : 'text-slate-300 hover:text-slate-400'}`}
                        >
                          <Star size={20} fill={filters.minRating >= star ? "currentColor" : "none"} />
                        </button>
                      ))}
                   </div>
                </div>

                {/* Genre Grid */}
                <div>
                   <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Zap size={14} className="text-indigo-500" /> Curated Genres
                   </label>
                   <div className="grid grid-cols-3 gap-2">
                      {GENRES.map((g) => {
                        const isSelected = filters.genres.includes(g.id);
                        return (
                          <button
                            key={g.id}
                            type="button"
                            onClick={() => {
                              const newGenres = isSelected 
                                ? filters.genres.filter(id => id !== g.id)
                                : [...filters.genres, g.id];
                              setFilters({...filters, genres: newGenres});
                            }}
                            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[13px] font-semibold border transition-all ${
                              isSelected 
                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' 
                                : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'
                            }`}
                          >
                            {g.icon} {g.label}
                          </button>
                        );
                      })}
                   </div>
                </div>

                {/* Specific Author */}
                <div>
                   <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Search size={14} className="text-pink-500" /> Specific Author
                   </label>
                   <div className="relative">
                      <input
                        type="text"
                        value={filters.author}
                        onChange={(e) => setFilters({...filters, author: e.target.value})}
                        placeholder="e.g. J.K. Rowling"
                        className="w-full pl-4 pr-10 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                      />
                      <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                   </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-8">
                {/* Sort By */}
                <div>
                   <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <SortAsc size={14} className="text-emerald-500" /> Sort Results By
                   </label>
                   <div className="flex bg-slate-100/50 p-1 rounded-xl border border-slate-200/50">
                      {SORT_OPTIONS.map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setFilters({ ...filters, sortBy: opt.id })}
                          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[13px] font-bold transition-all ${
                            filters.sortBy === opt.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                          }`}
                        >
                          {opt.icon} {opt.label}
                        </button>
                      ))}
                   </div>
                </div>

                {/* Mood Tag Cloud */}
                <div>
                   <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Smile size={14} className="text-amber-500" /> Desired Mood
                   </label>
                   <div className="flex flex-wrap gap-2">
                      {MOODS.map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setFilters({ ...filters, mood: m.toLowerCase() })}
                          className={`px-3 py-1.5 rounded-full text-[12px] font-bold border transition-all ${
                            filters.mood === m.toLowerCase() 
                              ? 'bg-amber-100 border-amber-300 text-amber-700' 
                              : 'bg-white border-slate-200 text-slate-500 hover:border-amber-200'
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                   </div>
                </div>

                {/* Era Preference */}
                <div>
                   <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <CalendarDays size={14} className="text-indigo-500" /> Publication Era
                   </label>
                   <div className="flex flex-wrap gap-2">
                      {ERAS.map((era, idx) => {
                        const isActive = (filters.fromYear === era.from && filters.toYear === era.to);
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setFilters({ ...filters, fromYear: era.from, toYear: era.to })}
                            className={`px-3 py-1.5 rounded-lg text-[13px] font-bold border transition-all ${
                              isActive ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-600'
                            }`}
                          >
                            {era.label}
                          </button>
                        );
                      })}
                   </div>
                </div>
              </div>
            </div>

          </div>

          <button
            onClick={() => {
              handleSearch(query, filters);
              setShowFilters(false);
            }}
            className={styles['apply-btn']}
          >
            <Sparkles size={18} />
            Scan Library with AI
          </button>
        </div>
      )}

{/* Search Results Modal */}
      {!inlineMode && (
        <SearchResultsModal 
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          results={results}
          suggestions={suggestions}
          searchHistory={searchHistory}
          query={query}
          loading={loading}
          onSelectBook={(book) => {
            // If it's a search term (from history/suggestions), perform a new search
            if (book.searchTerm) {
              setQuery(book.searchTerm);
              handleSearch(book.searchTerm, filters);
            } 
            // Otherwise it's a book, open the book details
            else if (book.id) {
              navigate(`/books/${book.id}`);
              setShowModal(false);
            }
          }}
        />
      )}
    </div>
  );
};

export default AdvancedSearchBar;
